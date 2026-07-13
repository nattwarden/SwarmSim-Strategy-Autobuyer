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
    if (!row?.lane || byLane.has(row.lane)) continue;
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
    if (key === "none" || byKey.has(key)) continue;
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
  const scenarioId = "sa1-02";
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
    const laneProposals = Array.isArray(cycle.laneProposals) ? cycle.laneProposals : [];
    const alternatives = summarizeAlternatives(laneProposals);
    const legacy = inferLegacyFirstChoice(laneProposals);

    assert(alternatives.every((row) => row.decision !== "MISSING"), "expected concrete Engine/Meat/Territory alternatives");
    assert(String(cycle.goalMetricDelta || "0") === "1", "expected real smartRunOnce cycle transition");

    const coordinator = {
      authority: String(cycle.coordinatorExecutionAuthority || "false"),
      selectedLane: String(cycle.coordinatorSelectedLane || "none"),
      selectedCandidate: String(cycle.coordinatorSelectedCandidate || "none"),
      selectedExecutionKey: String(cycle.coordinatorSelectedExecutionKey || "none"),
      selectedAmount: String(cycle.coordinatorSelectedAmount || "0"),
      executed: String(cycle.coordinatorExecuted || "no"),
      matched: String(cycle.coordinatorMatchedExecution || "no"),
      result: String(cycle.coordinatorExecutionResult || "none"),
      fallbackReason: String(cycle.coordinatorFallbackReason || "none"),
      gatesFailed: String(cycle.coordinatorGatesFailed || "none"),
    };

    const report = {
      scenarioId,
      legacyFirstChoice: legacy,
      coordinator,
      alternatives,
    };

    assert(coordinator.authority === "true", `expected executionAuthority=true but got ${coordinator.authority}`);
    assert(coordinator.executed === "yes", `expected executed=yes but got ${coordinator.executed}`);
    assert(coordinator.matched === "yes", `expected matchedExecution=yes but got ${coordinator.matched}`);

    console.log("BOOK00 M2 COORDINATOR ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const cycle = execution?.result?.cycles?.[0] || {};
    const report = {
      scenarioId,
      error: error?.message || String(error),
      legacyFirstChoice: inferLegacyFirstChoice(cycle.laneProposals || []),
      coordinator: {
        authority: String(cycle.coordinatorExecutionAuthority || "false"),
        selectedLane: String(cycle.coordinatorSelectedLane || "none"),
        selectedCandidate: String(cycle.coordinatorSelectedCandidate || "none"),
        selectedExecutionKey: String(cycle.coordinatorSelectedExecutionKey || "none"),
        selectedAmount: String(cycle.coordinatorSelectedAmount || "0"),
        executed: String(cycle.coordinatorExecuted || "no"),
        matched: String(cycle.coordinatorMatchedExecution || "no"),
        result: String(cycle.coordinatorExecutionResult || "none"),
        fallbackReason: String(cycle.coordinatorFallbackReason || "none"),
        gatesFailed: String(cycle.coordinatorGatesFailed || "none"),
      },
      alternatives: summarizeAlternatives(cycle.laneProposals || []),
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
