#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];
const BOUNDARY_SCHEMA_VERSION = "smart-upgrade-path-boundary.v1";
const BOUNDARY_PATH_ID = "SMART_UPGRADES";
const DECLARED_BOUNDARY_CONTRACTS = {
  LARVA_ENGINE_GUARD: "larva-engine-guard-path-boundary.v1",
  ENERGY_GUARD: "energy-guard-path-boundary.v1",
  CLONE_RAMP: "clone-ramp-guard-path-boundary.v1",
  CLONE_BUFFER: "clone-buffer-guard-path-boundary.v1",
  CLONE_BUFFER_HARD_LOCK_RECOVERY: "clone-buffer-guard-path-boundary.v1",
  MEAT_UNLOCK_PLANNER: "meat-unlock-planner-path-boundary.v1",
  CRITICAL_PRODUCTION_UPGRADES: "critical-upgrade-path-boundary.v1",
  SMART_UPGRADES: "smart-upgrade-path-boundary.v1",
  SMART_UNITS: "smart-unit-path-boundary.v1",
  FINAL_CLONE_PREP: "final-clone-prep-path-boundary.v1",
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
  assert(row.m6Coverage === "NONE", `${label}: the boundary must not upgrade the declared M6 execution coverage, got ${row.m6Coverage}`);
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
  const delegation = boundary.targetAwareDelegation;
  assert(delegation && typeof delegation.enabled === "boolean", `${label}: target-aware delegation record missing`);
  const accounting = boundary.accounting;
  assert(accounting, `${label}: boundary accounting missing`);
  assert(Number(accounting.contractViolationCount) === 0, `${label}: boundary reports contract violations in an unmutated runtime`);
  const accountedOutcomes = Number(accounting.executedCount)
    + Number(accounting.blockedSafeModeCount)
    + Number(accounting.skippedBudgetCount)
    + Number(accounting.commandNoEffectCount)
    + Number(accounting.commandFailedCount)
    + Number(accounting.contractViolationCount);
  assert(accountedOutcomes === boundary.proposals.length, `${label}: accounting does not cover every proposal (${accountedOutcomes} of ${boundary.proposals.length})`);
  const heldSum = Number(accounting.heldAbilityCount) + Number(accounting.heldTwinCount) + Number(accounting.heldProtectedCostCount);
  assert(heldSum === boundary.heldCandidates.length, `${label}: held accounting does not cover every held candidate (${heldSum} of ${boundary.heldCandidates.length})`);
  for (const proposal of boundary.proposals) {
    assert(proposal.executionKey === "smart-upgrade" && proposal.executionKind === "upgrade", `${label}: unexpected proposal execution identity ${proposal.executionKey}/${proposal.executionKind}`);
    assert(proposal.authorizedCommand === "BUY_MAX_PERCENT", `${label}: proposal ${proposal.executionId} does not declare the buy-max percent command`);
    assert(proposal.canonicalProposalId === `smart-upgrade::${proposal.executionId}::upgrade::base`, `${label}: canonical proposal id drifted for ${proposal.executionId}`);
    const expectedAuthorization = [proposal.canonicalProposalId, boundary.decisionCycleId, boundary.snapshotId, boundary.activeTarget]
      .map(encodeURIComponent).join("@@");
    assert(proposal.authorizationId === expectedAuthorization, `${label}: authorization id is not bound to the cycle identity for ${proposal.executionId}`);
    assert(proposal.metricTarget && proposal.metricId && proposal.metricUnit === "count" && proposal.metricBasis === "real-upgrade-count-delta", `${label}: proposal ${proposal.executionId} lacks an honest metric identity`);
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

function assertGameStateMatchesExecutedSet(cycle, boundary, label) {
  assert(cycle.upgradeCountsBefore && cycle.upgradeCountsAfter, `${label}: tracked real upgrade counts missing`);
  const executedIds = new Set(boundary.proposals
    .filter((proposal) => proposal.outcome === "EXECUTED")
    .map((proposal) => proposal.executionId));
  for (const upgradeKey of Object.keys(cycle.upgradeCountsBefore)) {
    const delta = upgradeDelta(cycle, upgradeKey);
    if (executedIds.has(upgradeKey)) {
      const proposal = boundary.proposals.find((row) => row.executionId === upgradeKey);
      assert(delta > 0, `${label}: boundary claims ${upgradeKey} executed but its real count did not increase`);
      assert(delta === Number(proposal.amountContract.confirmedPurchasedAmount), `${label}: real ${upgradeKey} delta ${delta} does not match the confirmed amount ${proposal.amountContract.confirmedPurchasedAmount}`);
    } else {
      assert(delta === 0, `${label}: tracked upgrade ${upgradeKey} changed by ${delta} without an EXECUTED boundary proposal`);
    }
  }
  for (const executedId of executedIds) {
    assert(Object.prototype.hasOwnProperty.call(cycle.upgradeCountsBefore, executedId), `${label}: executed upgrade ${executedId} is not tracked in game state`);
  }
}

async function main() {
  const mutatePercent = process.argv.includes("--mutate-percent");
  const mutateIdentity = process.argv.includes("--mutate-identity");
  const mutateAccounting = process.argv.includes("--mutate-accounting");
  const mutated = mutatePercent || mutateIdentity || mutateAccounting;
  let userscriptContent = null;

  if (mutated) {
    const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
    userscriptContent = fs.readFileSync(userscriptPath, "utf8").replace(/\r\n/g, "\n");
  }
  if (mutatePercent) {
    const needle = "const smartUpgradeCommandPercent = smartUpgradeAuthorizedPercent;";
    assert(userscriptContent.includes(needle), "percent mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "const smartUpgradeCommandPercent = smartUpgradeAuthorizedPercent * 2;");
  }
  if (mutateIdentity) {
    const needle = "commands.buyMaxUpgrade({\n          upgrade,";
    assert(userscriptContent.includes(needle), "identity mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "commands.buyMaxUpgrade({\n          upgrade: upgrades[(upgradeIndex + 1) % upgrades.length],");
  }
  if (mutateAccounting) {
    const needle = "pathBoundary: details.pathBoundary ? laboratoryCloneJson(details.pathBoundary) : null,";
    assert(userscriptContent.includes(needle), "accounting mutation needle missing");
    userscriptContent = userscriptContent.replace(needle, "pathBoundary: null,");
  }

  const executedCycle = await runScenario("book00-smart-upgrade-boundary", userscriptContent);
  const executed = getBoundaryRow(executedCycle, "executed cycle");
  assert(executedCycle.coordinatorExecutionAuthority === "false", `executed cycle: expected no M6 authority, got ${executedCycle.coordinatorExecutionAuthority}`);
  assert(executed.row.cycleDisposition?.disposition === "EXECUTED", `executed cycle: expected EXECUTED disposition, got ${executed.row.cycleDisposition?.disposition}`);
  assert(Number(executed.row.cycleDisposition?.executedMainActionCount) >= 1, "executed cycle: no real main-action ledger delta");
  const executedBoundary = assertProvenBoundary(executed.row, executed.coverage, "executed cycle");
  assert(executedBoundary.targetAwareDelegation.enabled === false && executedBoundary.targetAwareDelegation.outcome === "NO_ACTION", "executed cycle: delegation branch must be an explicit NO_ACTION record");
  assert(executedBoundary.proposals.length >= 2, `executed cycle: expected at least two ranked candidates, got ${executedBoundary.proposals.length}`);
  assert(Number(executedBoundary.accounting.executedCount) === 1, `executed cycle: expected exactly one executed candidate, got ${executedBoundary.accounting.executedCount}`);
  assert(Number(executedBoundary.accounting.skippedBudgetCount) === executedBoundary.proposals.length - 1, "executed cycle: remaining ranked candidates must be accounted as SKIPPED_BUDGET");
  assert(executedBoundary.proposals[0].outcome === "EXECUTED", "executed cycle: the top-ranked candidate was not the executed one");
  const executedProposal = executedBoundary.proposals[0];
  const amountContract = executedProposal.amountContract;
  assert(amountContract
    && amountContract.authorizedCommand === "BUY_MAX_PERCENT"
    && amountContract.authorizedPercent === executedProposal.authorizedPercent
    && amountContract.commandPercent === executedProposal.authorizedPercent
    && Number(amountContract.confirmedPurchasedAmount) > 0
    && amountContract.confirmationBasis === "real-upgrade-count-delta",
  "executed cycle: the percent-bounded amount contract is not exact");
  assert(Number(executedProposal.authorizedPercent) > 0, "executed cycle: authorized percent is not a positive number");
  assertGameStateMatchesExecutedSet(executedCycle, executedBoundary, "executed cycle");
  const smartUnitsRow = (executed.coverage.paths || []).find((pathRow) => pathRow.pathId === "SMART_UNITS");
  assert(smartUnitsRow?.cycleDisposition?.disposition === "SKIPPED_BUDGET", `executed cycle: expected the budget to be consumed by the upgrade, but SMART_UNITS is ${smartUnitsRow?.cycleDisposition?.disposition}`);
  const criticalRow = (executed.coverage.paths || []).find((pathRow) => pathRow.pathId === "CRITICAL_PRODUCTION_UPGRADES");
  assert(criticalRow?.pathBoundaryEvidence === "PROVEN", `executed cycle: the disabled critical-upgrade path must still prove its boundary, got ${criticalRow?.pathBoundaryEvidence}`);

  if (mutated) {
    throw new Error("boundary mutation unexpectedly preserved proven, grounded boundary evidence");
  }

  const advisorCycle = await runScenario("book00-smart-upgrade-boundary-advisor");
  const advisor = getBoundaryRow(advisorCycle, "advisor cycle");
  assert(advisor.row.cycleDisposition?.disposition === "EVALUATED_ACTIONABLE", `advisor cycle: expected EVALUATED_ACTIONABLE, got ${advisor.row.cycleDisposition?.disposition}`);
  const advisorBoundary = assertProvenBoundary(advisor.row, advisor.coverage, "advisor cycle");
  assert(advisorBoundary.proposals.length >= 2, `advisor cycle: expected at least two ranked candidates, got ${advisorBoundary.proposals.length}`);
  assert(Number(advisorBoundary.accounting.executedCount) === 0, "advisor cycle: advisor mode must execute nothing");
  assert(Number(advisorBoundary.accounting.blockedSafeModeCount) === advisorBoundary.proposals.length, "advisor cycle: every ranked candidate must be accounted as BLOCKED_SAFE_MODE");
  assert(advisorBoundary.proposals.every((proposal) => proposal.outcome === "BLOCKED_SAFE_MODE"), "advisor cycle: unexpected non-blocked proposal outcome");
  assert(Number(advisor.row.cycleDisposition?.executedMainActionCount) === 0, "advisor cycle: advisor mode produced a main action");
  for (const upgradeKey of Object.keys(advisorCycle.upgradeCountsBefore || {})) {
    assert(upgradeDelta(advisorCycle, upgradeKey) === 0, `advisor cycle: tracked upgrade ${upgradeKey} changed in advisor mode`);
  }

  const disabledCycle = await runScenario("book00-live-purchase-legacy");
  const disabled = getBoundaryRow(disabledCycle, "disabled cycle");
  assert(disabled.row.cycleDisposition?.disposition === "NOT_APPLICABLE", `disabled cycle: expected NOT_APPLICABLE, got ${disabled.row.cycleDisposition?.disposition}`);
  const disabledBoundary = assertProvenBoundary(disabled.row, disabled.coverage, "disabled cycle");
  assert(disabledBoundary.proposals.length === 0, "disabled cycle: a disabled path must propose nothing");
  assert(disabledBoundary.heldCandidates.length === 0, "disabled cycle: a disabled path must hold nothing");
  assert(disabledBoundary.notApplicableReason === "generic Smart upgrades are disabled by configuration", `disabled cycle: unexpected not-applicable reason ${disabledBoundary.notApplicableReason}`);
  assert(disabledBoundary.targetAwareDelegation.outcome === "NOT_EVALUATED", "disabled cycle: delegation branch must be NOT_EVALUATED when the path is disabled");

  console.log("9.4.0 SMART-UPGRADE BOUNDARY ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    executed: {
      executionId: executedProposal.executionId,
      canonicalProposalId: executedProposal.canonicalProposalId,
      activeTarget: executedBoundary.activeTarget,
      authorizedPercent: executedProposal.authorizedPercent,
      confirmedPurchasedAmount: executedProposal.amountContract.confirmedPurchasedAmount,
      accounting: executedBoundary.accounting,
      excludedCandidates: executedBoundary.excludedCandidates,
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
