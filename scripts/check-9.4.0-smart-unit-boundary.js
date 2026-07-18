#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];
const BOUNDARY_SCHEMA_VERSION = "smart-unit-path-boundary.v1";
const BOUNDARY_PATH_ID = "SMART_UNITS";
const DECLARED_BOUNDARY_CONTRACTS = {
  LARVA_ENGINE_GUARD: "larva-engine-guard-path-boundary.v1",
  CRITICAL_PRODUCTION_UPGRADES: "critical-upgrade-path-boundary.v1",
  SMART_UPGRADES: "smart-upgrade-path-boundary.v1",
  SMART_UNITS: "smart-unit-path-boundary.v1",
};

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

function getBoundaryRow(cycle, label) {
  const coverage = cycle?.mainCycleCoverage;
  assert(coverage, `${label}: mainCycleCoverage missing from the real cycle report`);
  assert(coverage.cycleEvidence?.status === "PROVEN", `${label}: same-cycle evidence must be PROVEN, got ${coverage.cycleEvidence?.status}`);
  assert(coverage.completeM6PathCount === 0, `${label}: the boundary must not fabricate complete M6 coverage`);
  assert(coverage.waitPrecondition?.status === "FAIL", `${label}: WAIT must still fail while M6 execution coverage is incomplete`);
  assert(coverage.waitPrecondition?.wholeCycleOwnershipEligible === false, `${label}: whole-cycle ownership must remain ineligible`);
  for (const pathRow of coverage.paths || []) {
    const expectedContract = DECLARED_BOUNDARY_CONTRACTS[pathRow.pathId] || null;
    assert(pathRow.boundaryContract === expectedContract, `${label}: ${pathRow.pathId} declares boundary contract ${pathRow.boundaryContract}, expected ${expectedContract}`);
    if (!expectedContract) {
      assert(pathRow.pathBoundaryEvidence === "NOT_REQUIRED", `${label}: ${pathRow.pathId} unexpectedly reports boundary evidence ${pathRow.pathBoundaryEvidence}`);
    }
    assert(pathRow.m6Coverage !== "COMPLETE", `${label}: ${pathRow.pathId} fabricated complete M6 coverage`);
  }
  const row = (coverage.paths || []).find((pathRow) => pathRow.pathId === BOUNDARY_PATH_ID);
  assert(row, `${label}: ${BOUNDARY_PATH_ID} ledger row missing`);
  assert(row.m6Coverage === "PARTIAL", `${label}: the boundary must not change the declared partial M6 coverage, got ${row.m6Coverage}`);
  return { coverage, row };
}

function assertProvenBoundary(row, coverage, label) {
  assert(row.pathBoundaryEvidence === "PROVEN", `${label}: boundary evidence must be PROVEN, got ${row.pathBoundaryEvidence}`);
  const boundary = row.cycleDisposition?.pathBoundary;
  assert(boundary, `${label}: cycle disposition carries no path boundary`);
  assert(boundary.schemaVersion === BOUNDARY_SCHEMA_VERSION, `${label}: unexpected boundary schema ${boundary.schemaVersion}`);
  assert(boundary.pathId === BOUNDARY_PATH_ID, `${label}: unexpected boundary path ${boundary.pathId}`);
  assert(boundary.decisionCycleId === coverage.cycleEvidence.decisionCycleId, `${label}: boundary decision cycle drifted from the coordinator cycle`);
  assert(boundary.snapshotId === coverage.cycleEvidence.snapshotId, `${label}: boundary snapshot drifted from the coordinator snapshot`);
  assert(typeof boundary.activeTarget === "string" && boundary.activeTarget.length > 0 && boundary.activeTarget !== "unknown", `${label}: boundary active target missing`);
  const accounting = boundary.accounting;
  assert(accounting, `${label}: boundary accounting missing`);
  assert(Number(accounting.contractViolationCount) === 0, `${label}: boundary reports contract violations in an unmutated runtime`);
  const accountedOutcomes = Number(accounting.executedCount)
    + Number(accounting.blockedSafeModeCount)
    + Number(accounting.commandFailedCount)
    + Number(accounting.contractViolationCount);
  assert(accountedOutcomes === boundary.proposals.length, `${label}: accounting does not cover every proposal (${accountedOutcomes} of ${boundary.proposals.length})`);
  const heldSum = Number(accounting.heldMeatGuardedCount) + Number(accounting.heldGuardedCount) + Number(accounting.heldFallbackDisabledCount);
  assert(heldSum === boundary.heldCandidates.length, `${label}: held accounting does not cover every held candidate (${heldSum} of ${boundary.heldCandidates.length})`);
  for (const proposal of boundary.proposals) {
    assert(proposal.executionKey === "smart-unit" && proposal.executionKind === "unit", `${label}: unexpected proposal execution identity ${proposal.executionKey}/${proposal.executionKind}`);
    assert(proposal.canonicalProposalId === `smart-unit::${proposal.executionId}::unit::${proposal.executionVariant}`, `${label}: canonical proposal id drifted for ${proposal.executionId}`);
    const expectedAuthorization = [proposal.canonicalProposalId, boundary.decisionCycleId, boundary.snapshotId, boundary.activeTarget]
      .map(encodeURIComponent).join("@@");
    assert(proposal.authorizationId === expectedAuthorization, `${label}: authorization id is not bound to the cycle identity for ${proposal.executionId}`);
    assert(Number(proposal.authorizedAmount) > 0, `${label}: proposal ${proposal.executionId} has no positive authorized amount`);
    assert(proposal.metricTarget && proposal.metricId && proposal.metricUnit === "count" && proposal.metricBasis === "real-unit-count-delta", `${label}: proposal ${proposal.executionId} lacks an honest metric identity`);
    assert(proposal.rankingAuthority === "PATH_BOUNDARY_OBSERVABILITY_ONLY", `${label}: proposal ${proposal.executionId} claims ranking authority ${proposal.rankingAuthority}`);
  }
  return boundary;
}

function unitDelta(cycle, unitKey) {
  const before = Number(cycle.resourceBankBefore?.[unitKey]);
  const after = Number(cycle.resourceBankAfter?.[unitKey]);
  assert(Number.isFinite(before) && Number.isFinite(after), `tracked unit ${unitKey} has no real before/after count`);
  return after - before;
}

async function main() {
  const mutateAmount = process.argv.includes("--mutate-amount");
  const mutateIdentity = process.argv.includes("--mutate-identity");
  const mutateAccounting = process.argv.includes("--mutate-accounting");
  const mutated = mutateAmount || mutateIdentity || mutateAccounting;
  let userscriptContent = null;

  if (mutated) {
    const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
    userscriptContent = fs.readFileSync(userscriptPath, "utf8").replace(/\r\n/g, "\n");
  }
  if (mutateAmount) {
    const needle = "const smartUnitCommandAmount = num;";
    assert(userscriptContent.includes(needle), "amount mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "const smartUnitCommandAmount = num.plus(num);");
  }
  if (mutateIdentity) {
    const needle = 'executionKey: "smart-unit",\n        executionId: String(unit?.name || ""),';
    assert(userscriptContent.includes(needle), "identity mutation needle missing");
    userscriptContent = userscriptContent.replace(
      needle,
      'executionKey: "smart-unit",\n        executionId: "queen",'
    );
  }
  if (mutateAccounting) {
    const needle = "pathBoundary: details.pathBoundary ? laboratoryCloneJson(details.pathBoundary) : null,";
    assert(userscriptContent.includes(needle), "accounting mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "pathBoundary: null,");
  }

  const executedCycle = await runScenario("book00-smart-unit-boundary", userscriptContent);
  const executed = getBoundaryRow(executedCycle, "executed cycle");
  assert(executedCycle.coordinatorExecutionAuthority === "false", `executed cycle: expected no M6 authority, got ${executedCycle.coordinatorExecutionAuthority}`);
  assert(executed.row.cycleDisposition?.disposition === "EXECUTED", `executed cycle: expected EXECUTED disposition, got ${executed.row.cycleDisposition?.disposition}`);
  assert(Number(executed.row.cycleDisposition?.executedMainActionCount) >= 1, "executed cycle: no real main-action ledger delta");
  const executedBoundary = assertProvenBoundary(executed.row, executed.coverage, "executed cycle");
  assert(executedBoundary.ascensionPause.paused === false, "executed cycle: unexpected ascension pause");
  assert(["NO_ACTION", "NOT_EVALUATED"].includes(executedBoundary.meatGuardPlanner.outcome) && Number(executedBoundary.meatGuardPlanner.bought) === 0, `executed cycle: the delegated meat-guard planner must record an explicit no-action branch, got ${executedBoundary.meatGuardPlanner.outcome}/${executedBoundary.meatGuardPlanner.bought}`);
  assert(Number(executedBoundary.chainPrep.bought) === 0, `executed cycle: the queue purchase must not be a delegated chain-prep buy, got chainPrep.bought=${executedBoundary.chainPrep.bought}`);
  assert(Number(executedBoundary.territoryGuard.preQueueBought) === 0 && Number(executedBoundary.territoryGuard.postMeatBought) === 0, "executed cycle: the territory guard must record explicit zero-action branches in this staged state");
  assert(Number(executedBoundary.queue.candidateCount) >= 1, `executed cycle: expected at least one ranked queue candidate, got ${executedBoundary.queue.candidateCount}`);
  assert(Number(executedBoundary.accounting.executedCount) === 1, `executed cycle: expected exactly one executed candidate, got ${executedBoundary.accounting.executedCount}`);
  const executedProposal = executedBoundary.proposals.find((proposal) => proposal.outcome === "EXECUTED");
  assert(executedProposal, "executed cycle: no proposal carries the EXECUTED outcome");
  assert(executedBoundary.proposals[executedBoundary.proposals.length - 1] === executedProposal, "executed cycle: the queue must stop at the executed candidate");
  const amountContract = executedProposal.amountContract;
  assert(amountContract
    && amountContract.authorizedRequestedAmount === executedProposal.authorizedAmount
    && amountContract.commandRequestedAmount === executedProposal.authorizedAmount
    && amountContract.confirmedPurchasedAmount === executedProposal.authorizedAmount
    && amountContract.confirmationBasis === "real-unit-count-delta",
  "executed cycle: the exact-amount contract is not authorized=command=confirmed");

  assert(Object.prototype.hasOwnProperty.call(executedCycle.resourceBankBefore || {}, executedProposal.executionId), `executed cycle: executed unit ${executedProposal.executionId} is not tracked in game state`);
  const executedUnitDelta = unitDelta(executedCycle, executedProposal.executionId);
  assert(executedUnitDelta > 0, `executed cycle: real ${executedProposal.executionId} count did not increase (${executedUnitDelta})`);
  for (const unitKey of ["drone", "queen", "nest"]) {
    if (unitKey === executedProposal.executionId) continue;
    // A non-executed tracked unit may legitimately DECREASE (it can be a real
    // cost of the executed buy) but must never increase: only an EXECUTED
    // boundary proposal may add units, and passive production is zero in this
    // staged state.
    assert(unitDelta(executedCycle, unitKey) <= 0, `executed cycle: untouched tracked unit ${unitKey} increased without an EXECUTED boundary proposal`);
  }

  if (mutated) {
    throw new Error("boundary mutation unexpectedly preserved proven, grounded boundary evidence");
  }

  const advisorCycle = await runScenario("book00-smart-unit-boundary-advisor");
  const advisor = getBoundaryRow(advisorCycle, "advisor cycle");
  assert(advisor.row.cycleDisposition?.disposition === "EVALUATED_ACTIONABLE", `advisor cycle: expected EVALUATED_ACTIONABLE, got ${advisor.row.cycleDisposition?.disposition}`);
  const advisorBoundary = assertProvenBoundary(advisor.row, advisor.coverage, "advisor cycle");
  assert(advisorBoundary.proposals.length >= 1, "advisor cycle: expected at least one reached candidate");
  assert(Number(advisorBoundary.accounting.executedCount) === 0, "advisor cycle: advisor mode must execute nothing");
  assert(advisorBoundary.proposals.every((proposal) => proposal.outcome === "BLOCKED_SAFE_MODE"), "advisor cycle: unexpected non-blocked proposal outcome");
  assert(Number(advisor.row.cycleDisposition?.executedMainActionCount) === 0, "advisor cycle: advisor mode produced a main action");
  for (const unitKey of ["drone", "queen", "nest"]) {
    assert(unitDelta(advisorCycle, unitKey) === 0, `advisor cycle: tracked unit ${unitKey} changed in advisor mode`);
  }

  const disabledCycle = await runScenario("book00-smart-unit-boundary-disabled");
  const disabled = getBoundaryRow(disabledCycle, "disabled cycle");
  assert(disabled.row.cycleDisposition?.disposition === "NOT_APPLICABLE", `disabled cycle: expected NOT_APPLICABLE, got ${disabled.row.cycleDisposition?.disposition}`);
  const disabledBoundary = assertProvenBoundary(disabled.row, disabled.coverage, "disabled cycle");
  assert(disabledBoundary.proposals.length === 0, "disabled cycle: a disabled path must propose nothing");
  assert(disabledBoundary.heldCandidates.length === 0, "disabled cycle: a disabled path must hold nothing");
  assert(disabledBoundary.notApplicableReason === "generic Smart units are disabled by configuration", `disabled cycle: unexpected not-applicable reason ${disabledBoundary.notApplicableReason}`);
  assert(disabledBoundary.meatGuardPlanner.outcome === "NOT_EVALUATED", "disabled cycle: planner branch must be NOT_EVALUATED when the path is disabled");

  console.log("9.4.0 SMART-UNIT BOUNDARY ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    executed: {
      executionId: executedProposal.executionId,
      canonicalProposalId: executedProposal.canonicalProposalId,
      activeTarget: executedBoundary.activeTarget,
      authorizedAmount: executedProposal.authorizedAmount,
      queueCandidateCount: executedBoundary.queue.candidateCount,
      accounting: executedBoundary.accounting,
      meatGuardPlanner: executedBoundary.meatGuardPlanner,
      territoryGuard: executedBoundary.territoryGuard,
      chainPrep: executedBoundary.chainPrep,
      pathBoundaryEvidence: executed.row.pathBoundaryEvidence,
    },
    advisor: {
      accounting: advisorBoundary.accounting,
      pathBoundaryEvidence: advisor.row.pathBoundaryEvidence,
    },
    disabled: {
      reason: disabledBoundary.notApplicableReason,
      pathBoundaryEvidence: disabled.row.pathBoundaryEvidence,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}).finally(() => {
  executionsToClean.forEach(cleanupExecutionArtifacts);
});
