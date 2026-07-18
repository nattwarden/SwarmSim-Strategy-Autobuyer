#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];
const PATH_ID = "LARVA_ENGINE_GUARD";
const SCHEMA = "larva-engine-guard-path-boundary.v1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function cleanup() {
  for (const execution of executionsToClean) {
    for (const resultPath of [execution?.resultJsonPath, execution?.resultMdPath].filter(Boolean)) {
      const directory = path.dirname(resultPath);
      if (fs.existsSync(directory)) fs.rmSync(directory, { recursive: true, force: true });
    }
  }
}

async function runScenario(scenarioId, userscriptContent = null) {
  const outcome = await runMode("live", [
    "--scenario", scenarioId, "--cycles", "1", "--browser-channel", "chrome",
    "--headed", "false", "--keep-open", "false", "--leave-open-on-failure", "false",
  ], userscriptContent ? { userscriptContent } : {});
  executionsToClean.push(...(outcome?.executions || []));
  assert(outcome?.exitCode === 0, `${scenarioId}: strategy audit failed with ${outcome?.exitCode}`);
  const cycle = outcome?.executions?.[0]?.result?.cycles?.[0];
  assert(cycle?.resetVerified === true && cycle?.stateLeakageDetected === false, `${scenarioId}: reset/leakage proof failed`);
  return cycle;
}

function boundaryFor(cycle, label) {
  const coverage = cycle?.mainCycleCoverage;
  assert(coverage?.cycleEvidence?.status === "PROVEN", `${label}: same-cycle coverage missing`);
  assert(coverage.completeM6PathCount === 0 && coverage.waitPrecondition?.wholeCycleOwnershipEligible === false, `${label}: M6 ownership changed`);
  const row = coverage.paths?.find((item) => item.pathId === PATH_ID);
  assert(row?.boundaryContract === SCHEMA && row?.m6Coverage === "PARTIAL", `${label}: ledger contract or M6 coverage drifted`);
  assert(row.pathBoundaryEvidence === "PROVEN", `${label}: boundary evidence is ${row.pathBoundaryEvidence}`);
  const boundary = row.cycleDisposition?.pathBoundary;
  assert(boundary?.schemaVersion === SCHEMA && boundary.pathId === PATH_ID, `${label}: wrong boundary schema`);
  assert(boundary.decisionCycleId === coverage.cycleEvidence.decisionCycleId && boundary.snapshotId === coverage.cycleEvidence.snapshotId, `${label}: boundary identity is not cycle-bound`);
  assert(Number(boundary.accounting?.proposalCount) === boundary.proposals.length, `${label}: proposal accounting drifted`);
  const total = Number(boundary.accounting.executedCount) + Number(boundary.accounting.blockedSafeModeCount)
    + Number(boundary.accounting.commandFailedCount) + Number(boundary.accounting.contractViolationCount);
  assert(total === boundary.proposals.length, `${label}: outcomes do not account for every proposal`);
  return { row, boundary };
}

function assertProposal(proposal, boundary, label) {
  assert(proposal.executionKey === "larva-engine-guard" && proposal.executionKind === "upgrade", `${label}: execution identity drifted`);
  assert(proposal.boundedAmount === "1", `${label}: command is not bounded to one`);
  assert(proposal.canonicalProposalId === `larva-engine-guard::${proposal.executionId}::upgrade::base`, `${label}: canonical proposal identity drifted`);
  const authorization = [proposal.canonicalProposalId, boundary.decisionCycleId, boundary.snapshotId, boundary.activeTarget].map(encodeURIComponent).join("@@");
  assert(proposal.authorizationId === authorization, `${label}: authorization is not cycle-bound`);
}

async function main() {
  const mutateAmount = process.argv.includes("--mutate-amount");
  const mutateIdentity = process.argv.includes("--mutate-identity");
  const mutateAccounting = process.argv.includes("--mutate-accounting");
  const mutated = mutateAmount || mutateIdentity || mutateAccounting;
  let userscriptContent = null;
  if (mutated) userscriptContent = fs.readFileSync(path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");
  if (mutateAmount) userscriptContent = userscriptContent.replace("const engineCommandAmount = newDecimal(1);", "const engineCommandAmount = newDecimal(2);");
  if (mutateIdentity) userscriptContent = userscriptContent.replace("buyUpgradeAmount(commands, upgrade, engineCommandAmount, \"Engine\", engineDelta)", "buyUpgradeAmount(commands, engine.hatchery, engineCommandAmount, \"Engine\", engineDelta)");
  if (mutateAccounting) userscriptContent = userscriptContent.replace("pathBoundary: details.pathBoundary ? laboratoryCloneJson(details.pathBoundary) : null,", "pathBoundary: null,");

  const executedCycle = await runScenario("book00-larva-engine-guard-boundary", userscriptContent);
  const executed = boundaryFor(executedCycle, "executed");
  assert(executed.row.cycleDisposition?.disposition === "EXECUTED", `executed: got ${executed.row.cycleDisposition?.disposition}`);
  assert(executed.boundary.proposals.length === 1 && Number(executed.boundary.accounting.executedCount) === 1, "executed: expected one exact Engine purchase");
  const proposal = executed.boundary.proposals[0];
  assertProposal(proposal, executed.boundary, "executed");
  assert(proposal.outcome === "EXECUTED", "executed: proposal was not executed");
  assert(proposal.amountContract?.authorizedRequestedAmount === "1" && proposal.amountContract?.commandRequestedAmount === "1" && proposal.amountContract?.confirmedPurchasedAmount === "1" && proposal.amountContract?.confirmationBasis === "real-upgrade-count-delta", "executed: amount contract is not exact");
  const delta = Number(executedCycle.upgradeCountsAfter?.[proposal.executionId]) - Number(executedCycle.upgradeCountsBefore?.[proposal.executionId]);
  assert(delta === 1, `executed: real upgrade delta is ${delta}`);
  if (mutated) throw new Error("boundary mutation unexpectedly preserved proof");

  const advisorCycle = await runScenario("book00-larva-engine-guard-boundary-advisor");
  const advisor = boundaryFor(advisorCycle, "advisor");
  assert(advisor.row.cycleDisposition?.disposition === "EVALUATED_ACTIONABLE", `advisor: got ${advisor.row.cycleDisposition?.disposition}`);
  assert(advisor.boundary.proposals.length === 1 && advisor.boundary.proposals[0].outcome === "BLOCKED_SAFE_MODE", "advisor: Engine proposal was not safely blocked");

  const disabledCycle = await runScenario("book00-larva-engine-guard-boundary-disabled");
  const disabled = boundaryFor(disabledCycle, "disabled");
  assert(disabled.row.cycleDisposition?.disposition === "NOT_APPLICABLE", `disabled: got ${disabled.row.cycleDisposition?.disposition}`);
  assert(disabled.boundary.proposals.length === 0 && disabled.boundary.notApplicableReason === "larva engine priority is disabled by configuration", "disabled: missing explicit reason");
  console.log("9.4.0 LARVA-ENGINE-GUARD BOUNDARY ACCEPTANCE PASSED");
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}).finally(cleanup);
