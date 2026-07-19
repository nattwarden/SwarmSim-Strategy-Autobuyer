#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];
const EXPECTED_PATH_IDS = [
  "LARVA_ENGINE_GUARD",
  "CRITICAL_PRODUCTION_UPGRADES",
  "ENERGY_GUARD",
  "CLONE_RAMP",
  "HOUSE_OF_MIRRORS",
  "CLONE_BUFFER",
  "CLONE_BUFFER_HARD_LOCK_RECOVERY",
  "MEAT_UNLOCK_PLANNER",
  "SMART_UPGRADES",
  "SMART_UNITS",
  "FINAL_CLONE_PREP",
];
const ALLOWED_DISPOSITIONS = new Set([
  "EXECUTED",
  "EVALUATED_ACTIONABLE",
  "EVALUATED_BLOCKED",
  "NOT_APPLICABLE",
  "SKIPPED_BUDGET",
  "SKIPPED_EXACT_M6_EXECUTION",
  "SKIPPED_GLOBAL_M6_OWNERSHIP",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function cleanupExecutionArtifacts(execution) {
  const candidatePaths = [execution?.resultJsonPath, execution?.resultMdPath].filter(Boolean);
  const dirs = new Set(candidatePaths.map((candidatePath) => path.dirname(candidatePath)));
  for (const dir of dirs) {
    if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
}

function pathDispositionMap(coverage) {
  return new Map((coverage?.paths || []).map((row) => [row.pathId, row.cycleDisposition?.disposition || null]));
}

function assertSameCycleCoverage(cycle, label) {
  const coverage = cycle?.mainCycleCoverage;
  assert(coverage, `${label}: mainCycleCoverage missing from the real cycle report`);
  assert(coverage.schemaVersion === "main-cycle-coverage-ledger.v1", `${label}: unexpected coverage schema ${coverage.schemaVersion}`);
  assert(coverage.cycleEvidence?.schemaVersion === "main-cycle-applicability-evidence.v1", `${label}: unexpected cycle-evidence schema`);
  assert(coverage.cycleEvidence?.status === "PROVEN", `${label}: same-cycle evidence must be PROVEN, got ${coverage.cycleEvidence?.status}`);
  assert(coverage.cycleEvidence?.dispositionCount === EXPECTED_PATH_IDS.length, `${label}: expected ${EXPECTED_PATH_IDS.length} dispositions, got ${coverage.cycleEvidence?.dispositionCount}`);
  assert(typeof coverage.cycleEvidence?.snapshotId === "string" && coverage.cycleEvidence.snapshotId !== "unknown", `${label}: same-cycle snapshot identity missing`);
  assert(typeof coverage.cycleEvidence?.decisionCycleId === "string" && coverage.cycleEvidence.decisionCycleId !== "unknown", `${label}: same-cycle decision identity missing`);

  const pathIds = (coverage.paths || []).map((row) => row.pathId);
  assert(JSON.stringify(pathIds) === JSON.stringify(EXPECTED_PATH_IDS), `${label}: path identity/order drifted: ${pathIds.join(",")}`);
  for (const row of coverage.paths) {
    assert(row.cycleApplicabilityEvidence === "PROVEN", `${label}: ${row.pathId} did not receive proven same-cycle evidence`);
    assert(row.cycleDisposition?.pathId === row.pathId, `${label}: ${row.pathId} disposition identity mismatch`);
    assert(ALLOWED_DISPOSITIONS.has(row.cycleDisposition?.disposition), `${label}: ${row.pathId} has invalid disposition ${row.cycleDisposition?.disposition}`);
    assert(typeof row.cycleDisposition?.reason === "string" && row.cycleDisposition.reason.length > 0, `${label}: ${row.pathId} has no runtime reason`);
  }

  assert((coverage.waitPrecondition?.missingCycleEvidencePathIds || []).length === 0, `${label}: WAIT still reports missing same-cycle evidence`);
  assert(coverage.waitPrecondition?.status === "FAIL", `${label}: WAIT must still fail while proposal coverage is incomplete`);
  assert(coverage.waitPrecondition?.wholeCycleOwnershipEligible === false, `${label}: whole-cycle ownership must remain ineligible`);
  assert(coverage.waitPrecondition?.recommendationAuthority === "ADVISOR_ONLY", `${label}: WAIT authority widened unexpectedly`);
  assert(coverage.completeM6PathCount === 0, `${label}: same-cycle observability must not fabricate complete M6 coverage`);
  assert(!(coverage.paths || []).some((row) => row.cycleDisposition?.disposition === "SKIPPED_GLOBAL_M6_OWNERSHIP"), `${label}: fixed runtime unexpectedly skipped paths for global M6 ownership`);
  return pathDispositionMap(coverage);
}

async function runScenario(scenarioId, userscriptContent = null) {
  const outcome = await runMode("live", [
    "--scenario", scenarioId,
    "--cycles", "1",
    "--browser-channel", "chrome",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
  ], userscriptContent ? { userscriptContent } : {});
  executionsToClean.push(...(Array.isArray(outcome?.executions) ? outcome.executions : []));
  assert(outcome?.exitCode === 0, `${scenarioId}: strategy audit failed with exit ${outcome?.exitCode}`);
  const cycle = outcome?.executions?.[0]?.result?.cycles?.[0];
  assert(cycle, `${scenarioId}: real cycle result missing`);
  assert(cycle.resetVerified === true, `${scenarioId}: reset was not verified`);
  assert(cycle.stateLeakageDetected === false, `${scenarioId}: state leakage detected`);
  return cycle;
}

async function main() {
  const mutateMissingDisposition = process.argv.includes("--mutate-missing-disposition");
  const mutateStaleCycle = process.argv.includes("--mutate-stale-cycle-evidence");
  const mutateGlobalOwnership = process.argv.includes("--mutate-global-ownership");
  // The M6 cycle below asserts M6 EXECUTION authority (the NO_GO
  // m6DecisionOwnsMainCycle=true design that was deliberately not shipped). It
  // cannot pass on the accepted advisor-only baseline, so it is excluded from
  // `npm run verify` and runs only under the opt-in reopening gate
  // (`npm run check:m6-reopening-gate`). The legacy cycle above is the accepted
  // state and stays in verify. See check-live-purchase-acceptance.js and
  // docs/strategy/GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md.
  const includeReopeningGate = process.argv.includes("--reopening-gate");
  let userscriptContent = null;

  if (mutateMissingDisposition || mutateStaleCycle || mutateGlobalOwnership) {
    const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
    userscriptContent = fs.readFileSync(userscriptPath, "utf8");
  }
  if (mutateMissingDisposition) {
    const needle = "mainCycleDispositionRows.push({";
    assert(userscriptContent.includes(needle), "missing-disposition mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, 'if (pathId !== "CRITICAL_PRODUCTION_UPGRADES") mainCycleDispositionRows.push({');
  }
  if (mutateStaleCycle) {
    const needle = 'decisionCycleId: sixDomainStrategicCoordinatorState?.decisionCycleId || "unknown",';
    assert(userscriptContent.includes(needle), "stale-cycle mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, 'decisionCycleId: "stale-cycle",');
  }
  if (mutateGlobalOwnership) {
    const needle = "const m6DecisionOwnsMainCycle = false;";
    assert(userscriptContent.includes(needle), "global-ownership mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "const m6DecisionOwnsMainCycle = true;");
  }

  const legacyCycle = await runScenario("book00-live-purchase-legacy", userscriptContent);
  const legacyDispositions = assertSameCycleCoverage(legacyCycle, "legacy cycle");
  assert(legacyCycle.coordinatorExecutionAuthority === "false", `legacy cycle: expected no M6 authority, got ${legacyCycle.coordinatorExecutionAuthority}`);
  assert(legacyDispositions.get("SMART_UPGRADES") === "NOT_APPLICABLE", `legacy cycle: disabled Smart upgrades must be NOT_APPLICABLE, got ${legacyDispositions.get("SMART_UPGRADES")}`);
  assert(legacyDispositions.get("SMART_UNITS") === "EXECUTED", `legacy cycle: the real Drone purchase must ground SMART_UNITS as EXECUTED, got ${legacyDispositions.get("SMART_UNITS")}`);
  const smartUnitCoverage = legacyCycle.mainCycleCoverage.paths.find((row) => row.pathId === "SMART_UNITS");
  assert(Number(smartUnitCoverage?.cycleDisposition?.executedMainActionCount) >= 1, "legacy cycle: SMART_UNITS execution lacks a real main-action ledger delta");
  const legacyAction = legacyCycle.laneCoordinatorSelectedActions?.[0];
  const legacyUnitId = String(legacyAction?.candidate || "").trim().toLowerCase();
  const legacyCountBefore = Number(legacyCycle.resourceBankBefore?.[legacyUnitId]);
  const legacyCountAfter = Number(legacyCycle.resourceBankAfter?.[legacyUnitId]);
  assert(legacyUnitId && Number.isFinite(legacyCountBefore) && Number.isFinite(legacyCountAfter) && legacyCountAfter > legacyCountBefore, `legacy cycle: SMART_UNITS disposition is not grounded by a real ${legacyUnitId || "unit"} count delta`);

  if (mutateMissingDisposition || mutateStaleCycle || mutateGlobalOwnership) {
    throw new Error("same-cycle mutation unexpectedly preserved proven coverage");
  }

  if (!includeReopeningGate) {
    console.log("9.4.0 SAME-CYCLE APPLICABILITY ACCEPTANCE PASSED (legacy cycle)");
    console.log("[same-cycle-applicability] M6 cycle skipped: opt-in M6-ownership reopening gate. Run `npm run check:m6-reopening-gate` to include it.");
    console.log(JSON.stringify({
      legacy: {
        coordinatorExecutionAuthority: legacyCycle.coordinatorExecutionAuthority,
        dispositions: Object.fromEntries(legacyDispositions),
        waitPrecondition: legacyCycle.mainCycleCoverage.waitPrecondition.status,
        wholeCycleOwnershipEligible: legacyCycle.mainCycleCoverage.waitPrecondition.wholeCycleOwnershipEligible,
      },
    }, null, 2));
    return;
  }

  const m6Cycle = await runScenario("book00-live-purchase-m6");
  const m6Dispositions = assertSameCycleCoverage(m6Cycle, "M6 cycle");
  assert(m6Cycle.coordinatorExecutionAuthority === "true", `M6 cycle: expected exact M6 authority, got ${m6Cycle.coordinatorExecutionAuthority}`);
  assert(m6Cycle.coordinatorExecuted === "yes", `M6 cycle: expected exact M6 execution, got ${m6Cycle.coordinatorExecuted}`);
  assert(m6Cycle.coordinatorMatchedExecution === "yes", `M6 cycle: selected and executed identities did not match (${m6Cycle.coordinatorMatchedExecution})`);
  assert(Number(m6Cycle.coordinatorObservedTotalCountDelta) > 0, `M6 cycle: exact execution lacks a real observed count delta (${m6Cycle.coordinatorObservedTotalCountDelta})`);
  assert(Array.from(m6Dispositions.values()).some((disposition) => disposition === "SKIPPED_BUDGET"), "M6 cycle: expected at least one real post-M6 budget skip");

  console.log("9.4.0 SAME-CYCLE APPLICABILITY ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    legacy: {
      coordinatorExecutionAuthority: legacyCycle.coordinatorExecutionAuthority,
      dispositions: Object.fromEntries(legacyDispositions),
      waitPrecondition: legacyCycle.mainCycleCoverage.waitPrecondition.status,
      wholeCycleOwnershipEligible: legacyCycle.mainCycleCoverage.waitPrecondition.wholeCycleOwnershipEligible,
    },
    m6: {
      coordinatorExecutionAuthority: m6Cycle.coordinatorExecutionAuthority,
      coordinatorExecuted: m6Cycle.coordinatorExecuted,
      dispositions: Object.fromEntries(m6Dispositions),
      waitPrecondition: m6Cycle.mainCycleCoverage.waitPrecondition.status,
      wholeCycleOwnershipEligible: m6Cycle.mainCycleCoverage.waitPrecondition.wholeCycleOwnershipEligible,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}).finally(() => {
  executionsToClean.forEach(cleanupExecutionArtifacts);
});
