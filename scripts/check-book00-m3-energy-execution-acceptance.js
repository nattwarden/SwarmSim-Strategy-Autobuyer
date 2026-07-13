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
      resetVerified: execution?.result?.resetVerified === true,
      stateLeakageDetected: execution?.result?.stateLeakageDetected === true,
    };

    assert(report.authority === "true", `expected Energy executionAuthority=true but got ${report.authority}: ${JSON.stringify(report)}`);
    assert(report.selectedLane === "Energy", `expected Energy winner but got ${report.selectedLane}`);
    assert(report.selectedCandidate === "Lepidoptera", `expected Lepidoptera winner but got ${report.selectedCandidate}`);
    assert(report.selectedExecutionKey === "energy", `expected executionKey=energy but got ${report.selectedExecutionKey}`);
    assert(report.selectedExecutionId === "moth", `expected canonical executionId=moth but got ${report.selectedExecutionId}`);
    assert(report.selectedExecutionKind === "unit", `expected executionKind=unit but got ${report.selectedExecutionKind}`);
    assert(Number(report.selectedAmount) > 0 && Number(report.selectedAmount) <= 5, `expected bounded amount 1..5 but got ${report.selectedAmount}`);
    assert(report.executed === "yes", `expected executed=yes but got ${report.executed}`);
    assert(report.matched === "yes", `expected matchedExecution=yes but got ${report.matched}`);
    assert(report.gatesFailed === "none", `unexpected coordinator gate failure: ${report.gatesFailed}`);
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
