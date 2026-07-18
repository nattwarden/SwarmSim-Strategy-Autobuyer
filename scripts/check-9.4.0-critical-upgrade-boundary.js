#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];
const BOUNDARY_SCHEMA_VERSION = "critical-upgrade-path-boundary.v1";
const BOUNDARY_PATH_ID = "CRITICAL_PRODUCTION_UPGRADES";

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
  const row = (coverage.paths || []).find((pathRow) => pathRow.pathId === BOUNDARY_PATH_ID);
  assert(row, `${label}: ${BOUNDARY_PATH_ID} ledger row missing`);
  assert(row.boundaryContract === BOUNDARY_SCHEMA_VERSION, `${label}: ledger row does not declare the boundary contract, got ${row.boundaryContract}`);
  assert(row.m6Coverage === "NONE", `${label}: the boundary must not upgrade the declared M6 execution coverage, got ${row.m6Coverage}`);
  for (const otherRow of coverage.paths || []) {
    if (otherRow.pathId === BOUNDARY_PATH_ID) continue;
    assert(otherRow.boundaryContract === null, `${label}: ${otherRow.pathId} unexpectedly declares a boundary contract`);
    assert(otherRow.pathBoundaryEvidence === "NOT_REQUIRED", `${label}: ${otherRow.pathId} unexpectedly reports boundary evidence ${otherRow.pathBoundaryEvidence}`);
  }
  return { coverage, row };
}

function assertProvenBoundary(cycle, row, coverage, label) {
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
    + Number(accounting.skippedBudgetCount)
    + Number(accounting.commandFailedCount)
    + Number(accounting.contractViolationCount);
  assert(accountedOutcomes === boundary.proposals.length, `${label}: accounting does not cover every proposal (${accountedOutcomes} of ${boundary.proposals.length})`);
  for (const proposal of boundary.proposals) {
    assert(proposal.executionKey === "critical-upgrade" && proposal.executionKind === "upgrade", `${label}: unexpected proposal execution identity ${proposal.executionKey}/${proposal.executionKind}`);
    assert(proposal.boundedAmount === "1", `${label}: proposal ${proposal.executionId} is not bounded to exactly 1`);
    assert(proposal.canonicalProposalId === `critical-upgrade::${proposal.executionId}::upgrade::base`, `${label}: canonical proposal id drifted for ${proposal.executionId}`);
    const expectedAuthorization = [proposal.canonicalProposalId, boundary.decisionCycleId, boundary.snapshotId, boundary.activeTarget]
      .map(encodeURIComponent).join("@@");
    assert(proposal.authorizationId === expectedAuthorization, `${label}: authorization id is not bound to the cycle identity for ${proposal.executionId}`);
    assert(proposal.metricTarget && proposal.metricId && proposal.metricUnit === "percent" && proposal.metricBasis === "same-unit-milestone-progress-delta", `${label}: proposal ${proposal.executionId} lacks an honest same-target metric identity`);
    assert(proposal.rankingAuthority === "PATH_BOUNDARY_OBSERVABILITY_ONLY", `${label}: proposal ${proposal.executionId} claims ranking authority ${proposal.rankingAuthority}`);
  }
  return boundary;
}

function upgradeDelta(cycle, upgradeKey) {
  const before = Number(cycle.upgradeCountsBefore?.[upgradeKey]);
  const after = Number(cycle.upgradeCountsAfter?.[upgradeKey]);
  assert(Number.isFinite(before) && Number.isFinite(after), `tracked upgrade ${upgradeKey} has no real before/after count`);
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
    userscriptContent = fs.readFileSync(userscriptPath, "utf8");
  }
  if (mutateAmount) {
    const needle = "const criticalUpgradeCommandAmount = newDecimal(1);";
    assert(userscriptContent.includes(needle), "amount mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "const criticalUpgradeCommandAmount = newDecimal(2);");
  }
  if (mutateIdentity) {
    const needle = 'buyUpgradeAmount(commands, upgrade, criticalUpgradeCommandAmount, "Critical Upgrade", criticalUpgradeDelta)';
    assert(userscriptContent.includes(needle), "identity mutation needle missing");
    userscriptContent = userscriptContent.replace(
      needle,
      'buyUpgradeAmount(commands, upgrades[(upgradeIndex + 1) % upgrades.length], criticalUpgradeCommandAmount, "Critical Upgrade", criticalUpgradeDelta)'
    );
  }
  if (mutateAccounting) {
    const needle = "pathBoundary: details.pathBoundary ? laboratoryCloneJson(details.pathBoundary) : null,";
    assert(userscriptContent.includes(needle), "accounting mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "pathBoundary: null,");
  }

  const executedCycle = await runScenario("book00-critical-upgrade-boundary", userscriptContent);
  const executed = getBoundaryRow(executedCycle, "executed cycle");
  assert(executedCycle.coordinatorExecutionAuthority === "false", `executed cycle: expected no M6 authority, got ${executedCycle.coordinatorExecutionAuthority}`);
  assert(executed.row.cycleDisposition?.disposition === "EXECUTED", `executed cycle: expected EXECUTED disposition, got ${executed.row.cycleDisposition?.disposition}`);
  assert(Number(executed.row.cycleDisposition?.executedMainActionCount) >= 1, "executed cycle: no real main-action ledger delta");
  const executedBoundary = assertProvenBoundary(executedCycle, executed.row, executed.coverage, "executed cycle");
  assert(executedBoundary.proposals.length >= 2, `executed cycle: expected at least two ranked candidates, got ${executedBoundary.proposals.length}`);
  assert(Number(executedBoundary.accounting.executedCount) === 1, `executed cycle: expected exactly one executed candidate, got ${executedBoundary.accounting.executedCount}`);
  assert(Number(executedBoundary.accounting.skippedBudgetCount) === executedBoundary.proposals.length - 1, "executed cycle: remaining ranked candidates must be accounted as SKIPPED_BUDGET");
  const executedProposal = executedBoundary.proposals.find((proposal) => proposal.outcome === "EXECUTED");
  assert(executedProposal, "executed cycle: no proposal carries the EXECUTED outcome");
  assert(executedProposal === executedBoundary.proposals[0] || executedBoundary.proposals[0].outcome === "EXECUTED", "executed cycle: the top-ranked candidate was not the executed one");
  const amountContract = executedProposal.amountContract;
  assert(amountContract
    && amountContract.authorizedRequestedAmount === "1"
    && amountContract.commandRequestedAmount === "1"
    && amountContract.confirmedPurchasedAmount === "1"
    && amountContract.confirmationBasis === "real-upgrade-count-delta",
  "executed cycle: four-value amount contract is not exactly 1/1/1 on a real upgrade-count basis");

  assert(executedCycle.upgradeCountsBefore && executedCycle.upgradeCountsAfter, "executed cycle: tracked real upgrade counts missing");
  assert(Object.prototype.hasOwnProperty.call(executedCycle.upgradeCountsBefore, executedProposal.executionId), `executed cycle: executed upgrade ${executedProposal.executionId} is not tracked in game state`);
  for (const upgradeKey of Object.keys(executedCycle.upgradeCountsBefore)) {
    const delta = upgradeDelta(executedCycle, upgradeKey);
    if (upgradeKey === executedProposal.executionId) {
      assert(delta === 1, `executed cycle: real ${upgradeKey} count delta is ${delta}, expected exactly 1`);
    } else {
      assert(delta === 0, `executed cycle: untouched tracked upgrade ${upgradeKey} changed by ${delta}`);
    }
  }
  // The upgrade's real unit cost is deducted from a live, passively producing
  // bank (slice 4: count deltas are contaminated by passive production), so
  // the honest execution grounding is the upgrade count delta above - upgrade
  // counts have no passive production and can only change through a real buy.
  const smartUnitsRow = (executed.coverage.paths || []).find((pathRow) => pathRow.pathId === "SMART_UNITS");
  assert(smartUnitsRow?.cycleDisposition?.disposition === "SKIPPED_BUDGET", `executed cycle: expected the budget to be consumed by the upgrade, but SMART_UNITS is ${smartUnitsRow?.cycleDisposition?.disposition}`);

  if (mutated) {
    throw new Error("boundary mutation unexpectedly preserved proven, grounded boundary evidence");
  }

  const advisorCycle = await runScenario("book00-critical-upgrade-boundary-advisor");
  const advisor = getBoundaryRow(advisorCycle, "advisor cycle");
  assert(advisor.row.cycleDisposition?.disposition === "EVALUATED_ACTIONABLE", `advisor cycle: expected EVALUATED_ACTIONABLE, got ${advisor.row.cycleDisposition?.disposition}`);
  const advisorBoundary = assertProvenBoundary(advisorCycle, advisor.row, advisor.coverage, "advisor cycle");
  assert(advisorBoundary.proposals.length >= 2, `advisor cycle: expected at least two ranked candidates, got ${advisorBoundary.proposals.length}`);
  assert(Number(advisorBoundary.accounting.executedCount) === 0, "advisor cycle: advisor mode must execute nothing");
  assert(Number(advisorBoundary.accounting.blockedSafeModeCount) === advisorBoundary.proposals.length, "advisor cycle: every ranked candidate must be accounted as BLOCKED_SAFE_MODE");
  assert(advisorBoundary.proposals.every((proposal) => proposal.outcome === "BLOCKED_SAFE_MODE"), "advisor cycle: unexpected non-blocked proposal outcome");
  assert(Number(advisor.row.cycleDisposition?.executedMainActionCount) === 0, "advisor cycle: advisor mode produced a main action");
  for (const upgradeKey of Object.keys(advisorCycle.upgradeCountsBefore || {})) {
    assert(upgradeDelta(advisorCycle, upgradeKey) === 0, `advisor cycle: tracked upgrade ${upgradeKey} changed in advisor mode`);
  }

  const notApplicableCycle = await runScenario("book00-live-purchase-legacy");
  const notApplicable = getBoundaryRow(notApplicableCycle, "not-applicable cycle");
  assert(notApplicable.row.cycleDisposition?.disposition === "NOT_APPLICABLE", `not-applicable cycle: expected NOT_APPLICABLE, got ${notApplicable.row.cycleDisposition?.disposition}`);
  const notApplicableBoundary = assertProvenBoundary(notApplicableCycle, notApplicable.row, notApplicable.coverage, "not-applicable cycle");
  assert(notApplicableBoundary.proposals.length === 0, "not-applicable cycle: a disabled path must propose nothing");
  assert(notApplicableBoundary.heldCandidates.length === 0, "not-applicable cycle: a disabled path must hold nothing");
  assert(typeof notApplicableBoundary.notApplicableReason === "string" && notApplicableBoundary.notApplicableReason.length > 0, "not-applicable cycle: missing explicit not-applicable reason");

  console.log("9.4.0 CRITICAL-UPGRADE BOUNDARY ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    executed: {
      executionId: executedProposal.executionId,
      canonicalProposalId: executedProposal.canonicalProposalId,
      activeTarget: executedBoundary.activeTarget,
      accounting: executedBoundary.accounting,
      pathBoundaryEvidence: executed.row.pathBoundaryEvidence,
    },
    advisor: {
      accounting: advisorBoundary.accounting,
      pathBoundaryEvidence: advisor.row.pathBoundaryEvidence,
    },
    notApplicable: {
      reason: notApplicableBoundary.notApplicableReason,
      pathBoundaryEvidence: notApplicable.row.pathBoundaryEvidence,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}).finally(() => {
  executionsToClean.forEach(cleanupExecutionArtifacts);
});
