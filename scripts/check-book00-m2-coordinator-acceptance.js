#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toExecutionKey(lane) {
  const key = String(lane || "").toLowerCase();
  if (key === "engine") return "engine";
  if (key === "meat") return "meat";
  if (key === "territory") return "territory";
  return "none";
}

function summarizeAlternatives(laneProposals) {
  const proposals = Array.isArray(laneProposals) ? laneProposals : [];
  const byLane = new Map();
  for (const row of proposals) {
    if (!row?.lane) continue;
    const current = byLane.get(row.lane);
    if (current?.decision === "BUY" || (current && row.decision !== "BUY")) continue;
    byLane.set(row.lane, {
      lane: row.lane,
      decision: row.decision || "OBSERVE",
      candidate: row.candidate || "none",
    });
  }
  return ["Engine", "Meat", "Territory"].map((lane) => byLane.get(lane) || { lane, decision: "MISSING", candidate: "none" });
}

function inferLegacyFirstChoice(laneProposals) {
  const byKey = new Map();
  for (const row of laneProposals || []) {
    const key = toExecutionKey(row?.lane);
    if (key === "none") continue;
    const current = byKey.get(key);
    if (current?.decision === "BUY" || (current && row?.decision !== "BUY")) continue;
    byKey.set(key, row);
  }

  // Legacy local order before coordinator v2 authority.
  const legacyOrder = ["engine", "meat", "territory"];
  const first = legacyOrder
    .map((key) => ({ key, row: byKey.get(key) || null }))
    .find((entry) => entry.row && entry.row.decision === "BUY");

  return {
    legacyOrder,
    key: first?.key || "none",
    lane: first?.row?.lane || "none",
    candidate: first?.row?.candidate || "none",
    decision: first?.row?.decision || "HOLD",
  };
}

function cleanupExecutionArtifacts(execution) {
  const candidatePaths = [
    execution?.resultJsonPath,
    execution?.resultMdPath,
  ].filter(Boolean);

  const dirs = new Set(candidatePaths.map((p) => path.dirname(p)));
  for (const dir of dirs) {
    if (!dir || !fs.existsSync(dir)) continue;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const engineRegressionOutcome = await runMode("fast", [
    "--scenario", "sa1-02",
    "--cycles", "1",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
    "--strict-determinism", "false",
  ]);
  const engineRegressionExecution = engineRegressionOutcome?.executions?.[0] || null;
  try {
    const cycle = engineRegressionExecution?.result?.cycles?.[0] || {};
    const selectedActions = Array.isArray(cycle.laneCoordinatorSelectedActions) ? cycle.laneCoordinatorSelectedActions : [];
    const legacyExpansion = selectedActions.find((action) => action?.lane === "Engine" && /expansion/i.test(String(action?.candidate || ""))) || null;
    assert(engineRegressionOutcome?.exitCode === 0, `engine resolution regression runner failed with exitCode=${engineRegressionOutcome?.exitCode}`);
    assert(String(cycle.coordinatorExecutionAuthority || "false") === "false", "local completion-only Expansion unexpectedly received M6 authority");
    assert(String(cycle.coordinatorSelectedExecutionId || "none") === "none", "local completion-only Expansion unexpectedly became the M6 winner");
    assert(legacyExpansion, `legacy Engine path did not execute Expansion: ${JSON.stringify(selectedActions)}`);
    assert(Number(cycle.mainActions || 0) >= 1, "legacy Engine path did not record a real main action");
  } finally {
    cleanupExecutionArtifacts(engineRegressionExecution);
  }

  const scenarioId = "book00-m2-coordinator";
  const cliArgs = [
    "--scenario", scenarioId,
    "--cycles", "1",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
    "--strict-determinism", "false",
  ];

  const outcome = await runMode("fast", cliArgs);
  const execution = outcome?.executions?.[0] || null;

  try {
    assert(outcome?.exitCode === 0, `scenario runner failed with exitCode=${outcome?.exitCode}`);
    assert(execution?.result?.cycles?.length === 1, "expected exactly one acceptance cycle");

    const cycle = execution.result.cycles[0];
    const laneProposals = Array.isArray(cycle.purchaseProposalSnapshot?.proposals)
      ? cycle.purchaseProposalSnapshot.proposals
      : [];
    const alternatives = summarizeAlternatives(laneProposals);
    const legacy = inferLegacyFirstChoice(laneProposals);

    assert(alternatives.every((row) => row.decision !== "MISSING" && row.candidate !== "none"), "expected concrete pre-execution Engine/Meat/Territory alternatives");
    assert(String(cycle.goalMetricDelta || "0") === "1", "expected real smartRunOnce cycle transition");

    const coordinator = {
      authority: String(cycle.coordinatorExecutionAuthority || "false"),
      selectedLane: String(cycle.coordinatorSelectedLane || "none"),
      selectedCandidate: String(cycle.coordinatorSelectedCandidate || "none"),
      selectedExecutionKey: String(cycle.coordinatorSelectedExecutionKey || "none"),
      selectedExecutionId: String(cycle.coordinatorSelectedExecutionId || "none"),
      selectedExecutionKind: String(cycle.coordinatorSelectedExecutionKind || "none"),
      selectedExecutionVariant: String(cycle.coordinatorSelectedExecutionVariant || "base"),
      selectedAmount: String(cycle.coordinatorSelectedAmount || "0"),
      executed: String(cycle.coordinatorExecuted || "no"),
      matched: String(cycle.coordinatorMatchedExecution || "no"),
      result: String(cycle.coordinatorExecutionResult || "none"),
      fallbackReason: String(cycle.coordinatorFallbackReason || "none"),
      gatesFailed: String(cycle.coordinatorGatesFailed || "none"),
    };

    const report = {
      scenarioId,
      activeGoal: String(cycle.activeGoal || "none"),
      legacyFirstChoice: legacy,
      coordinator,
      alternatives,
    };

    assert(report.activeGoal.toLowerCase().includes("nexus"), `expected the preserved cross-target state to have an active Nexus goal but got ${report.activeGoal}`);
    assert(coordinator.authority === "false", `cross-target alternatives unexpectedly received executionAuthority=true`);
    assert(legacy.key === "engine" && legacy.candidate === "Hatchery", `expected legacy first choice Engine: Hatchery but got ${legacy.lane}: ${legacy.candidate}`);
    assert(coordinator.selectedLane === "none" && coordinator.selectedCandidate === "none", `expected no cross-target M6 winner but got ${coordinator.selectedLane}: ${coordinator.selectedCandidate}`);
    assert(coordinator.executed === "no" && coordinator.matched === "no", `cross-target M6 path unexpectedly executed: ${JSON.stringify(coordinator)}`);
    assert(coordinator.fallbackReason.includes("No allowed comparable action"), `unexpected fail-closed reason: ${coordinator.fallbackReason}`);

    console.log("BOOK00 M2 COORDINATOR ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const cycle = execution?.result?.cycles?.[0] || {};
    const report = {
      scenarioId,
      error: error?.message || String(error),
      activeGoal: String(cycle.activeGoal || "none"),
      legacyFirstChoice: inferLegacyFirstChoice(cycle.purchaseProposalSnapshot?.proposals || []),
      coordinator: {
        authority: String(cycle.coordinatorExecutionAuthority || "false"),
        selectedLane: String(cycle.coordinatorSelectedLane || "none"),
        selectedCandidate: String(cycle.coordinatorSelectedCandidate || "none"),
        selectedExecutionKey: String(cycle.coordinatorSelectedExecutionKey || "none"),
        selectedExecutionId: String(cycle.coordinatorSelectedExecutionId || "none"),
        selectedExecutionKind: String(cycle.coordinatorSelectedExecutionKind || "none"),
        selectedExecutionVariant: String(cycle.coordinatorSelectedExecutionVariant || "base"),
        selectedAmount: String(cycle.coordinatorSelectedAmount || "0"),
        executed: String(cycle.coordinatorExecuted || "no"),
        matched: String(cycle.coordinatorMatchedExecution || "no"),
        result: String(cycle.coordinatorExecutionResult || "none"),
        fallbackReason: String(cycle.coordinatorFallbackReason || "none"),
        gatesFailed: String(cycle.coordinatorGatesFailed || "none"),
      },
      alternatives: summarizeAlternatives(cycle.purchaseProposalSnapshot?.proposals || []),
    };

    console.error("BOOK00 M2 COORDINATOR ACCEPTANCE FAILED");
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } finally {
    cleanupExecutionArtifacts(execution);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
