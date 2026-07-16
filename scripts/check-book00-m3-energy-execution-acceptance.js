#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function cleanupExecutionArtifacts(execution) {
  const candidatePaths = [execution?.resultJsonPath, execution?.resultMdPath].filter(Boolean);
  const dirs = new Set(candidatePaths.map((candidatePath) => path.dirname(candidatePath)));
  for (const dir of dirs) {
    if (!dir || !fs.existsSync(dir)) continue;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const scenarioId = "book00-m3-energy-execution";
  const outcome = await runMode("fast", [
    "--scenario", scenarioId,
    "--cycles", "1",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
    "--strict-determinism", "false",
  ]);
  const execution = outcome?.executions?.[0] || null;

  try {
    assert(outcome?.exitCode === 0, `scenario runner failed with exitCode=${outcome?.exitCode}`);
    assert(execution?.result?.cycles?.length === 1, "expected exactly one Energy execution cycle");

    const cycle = execution.result.cycles[0];
    const selectedActions = Array.isArray(cycle.laneCoordinatorSelectedActions) ? cycle.laneCoordinatorSelectedActions : [];
    const energyAction = selectedActions.find((action) => action?.lane === "Energy" && action?.candidate === "Lepidoptera") || null;
    const mothBefore = Number(cycle.resourceBankBefore?.moth || 0);
    const mothAfter = Number(cycle.resourceBankAfter?.moth || 0);
    const mothDelta = mothAfter - mothBefore;
    const report = {
      scenarioId,
      authority: String(cycle.coordinatorExecutionAuthority || "false"),
      selectedLane: String(cycle.coordinatorSelectedLane || "none"),
      selectedCandidate: String(cycle.coordinatorSelectedCandidate || "none"),
      selectedExecutionKey: String(cycle.coordinatorSelectedExecutionKey || "none"),
      selectedExecutionId: String(cycle.coordinatorSelectedExecutionId || "none"),
      selectedExecutionKind: String(cycle.coordinatorSelectedExecutionKind || "none"),
      selectedAmount: String(cycle.coordinatorSelectedAmount || "0"),
      executed: String(cycle.coordinatorExecuted || "no"),
      matched: String(cycle.coordinatorMatchedExecution || "no"),
      result: String(cycle.coordinatorExecutionResult || "none"),
      gatesFailed: String(cycle.coordinatorGatesFailed || "none"),
      legacySelectedLane: String(energyAction?.lane || "none"),
      legacySelectedCandidate: String(energyAction?.candidate || "none"),
      legacySelectedAmount: String(energyAction?.amount || "0"),
      mothBefore,
      mothAfter,
      mothDelta,
      mainActions: Number(cycle.mainActions || 0),
      resetVerified: execution?.result?.resetVerified === true,
      stateLeakageDetected: execution?.result?.stateLeakageDetected === true,
    };

    assert(report.authority === "false", `off-target post-Nexus Energy unexpectedly received M6 authority: ${JSON.stringify(report)}`);
    assert(report.selectedLane === "none", `expected no M6 winner but got ${report.selectedLane}`);
    assert(report.executed === "no", `M6 unexpectedly executed the off-target Energy proposal: ${report.executed}`);
    assert(report.matched === "no", `M6 unexpectedly reported a matched execution: ${report.matched}`);
    assert(report.legacySelectedLane === "Energy" && report.legacySelectedCandidate === "Lepidoptera", `legacy Energy path was not selected: ${JSON.stringify(report)}`);
    assert(report.mothDelta > 0 && report.mothDelta <= 5, `expected a real bounded Lepidoptera count delta 1..5 but got ${report.mothDelta}`);
    assert(report.mainActions === 1, `expected exactly one legacy main action but got ${report.mainActions}`);
    assert(report.resetVerified === true, "disposable execution state was not reset-verified");
    assert(report.stateLeakageDetected === false, "disposable execution state leaked");

    console.log("BOOK00 M3 ENERGY EXECUTION ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    cleanupExecutionArtifacts(execution);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
