#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runMode } = require("./strategy-audit-testbed-core");

const executionsToClean = [];

function cleanupExecutionArtifacts(execution) {
  const candidatePaths = [execution?.resultJsonPath, execution?.resultMdPath].filter(Boolean);
  const dirs = new Set(candidatePaths.map((candidatePath) => path.dirname(candidatePath)));
  for (const dir of dirs) {
    if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function assertNoAdvisorOnlyLeak(laneProposals, label) {
  const leaked = (laneProposals || []).some((row) =>
    /ability|ascension|mutagen/i.test(String(row?.lane || "")) && row?.decision === "BUY"
  );
  assert(!leaked, `${label}: advisor-only domains (ability/ascension/mutagen) must remain non-executable`);
}

async function runScenarioA(userscriptContent = null) {
  const outcome = await runMode("live", [
    "--scenario", "book00-live-purchase-legacy",
    "--cycles", "1",
    "--browser-channel", "chrome",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
  ], userscriptContent ? { userscriptContent } : {});
  executionsToClean.push(...(Array.isArray(outcome?.executions) ? outcome.executions : []));

  assert(outcome?.exitCode === 0, `Scenario A: strategy audit live failed with exit code ${outcome?.exitCode}`);

  const execution = Array.isArray(outcome.executions) ? outcome.executions[0] : null;
  const cycle = execution?.result?.cycles?.[0];
  assert(cycle, "Scenario A: expected at least one cycle");

  assert(cycle.resetVerified === true, "Scenario A: reset was not verified");
  assert(cycle.stateLeakageDetected === false, "Scenario A: state leakage detected");

  assert(
    cycle.coordinatorExecutionAuthority === "false",
    `Scenario A: expected no M6 execution authority (unified proposals must be empty for this scenario) but got ${cycle.coordinatorExecutionAuthority}`
  );
  assert(
    cycle.coordinatorExecuted === "no",
    `Scenario A: expected M6 to execute nothing but coordinatorExecuted=${cycle.coordinatorExecuted}`
  );

  const actions = Array.isArray(cycle.laneCoordinatorSelectedActions) ? cycle.laneCoordinatorSelectedActions : [];
  assert(actions.length >= 1, "Scenario A: expected at least one legacy-path selected lane action (laneCoordinatorSelectedActions)");
  const action = actions[0];
  assert(action.lane === "Meat", `Scenario A: expected the legacy purchase to be a Meat-lane action but got lane=${action.lane}`);

  const candidateKey = String(action.candidate || "").trim().toLowerCase();
  assert(candidateKey, "Scenario A: expected a named purchased candidate");

  const before = cycle.resourceBankBefore || {};
  const after = cycle.resourceBankAfter || {};
  assert(
    Object.prototype.hasOwnProperty.call(before, candidateKey) && Object.prototype.hasOwnProperty.call(after, candidateKey),
    `Scenario A: expected the purchased candidate "${candidateKey}" to be a tracked unit key with before/after game-state counts`
  );

  const countBefore = toNumber(before[candidateKey]);
  const countAfter = toNumber(after[candidateKey]);
  assert(Number.isFinite(countBefore) && Number.isFinite(countAfter), `Scenario A: expected numeric count for "${candidateKey}"`);
  const countDelta = countAfter - countBefore;
  assert(countDelta > 0, `Scenario A: expected unit count delta > 0 for "${candidateKey}" but got ${countBefore} -> ${countAfter}`);

  const amount = toNumber(action.amount);
  if (Number.isFinite(amount) && amount > 0) {
    assert(
      Math.abs(countDelta - amount) <= Math.max(1, amount * 0.01),
      `Scenario A: expected the "${candidateKey}" count delta (${countDelta}) to match the recorded bought amount (${amount})`
    );
  }

  const meatBefore = toNumber(before.meat);
  const meatAfter = toNumber(after.meat);
  const larvaBefore = toNumber(before.larva);
  const larvaAfter = toNumber(after.larva);
  assert(meatAfter < meatBefore, `Scenario A: expected real cost deduction to leave meat lower (${meatBefore} -> ${meatAfter})`);
  assert(larvaAfter < larvaBefore, `Scenario A: expected real cost deduction to leave larva lower (${larvaBefore} -> ${larvaAfter})`);
  const meatDelta = meatBefore - meatAfter;
  const larvaDelta = larvaBefore - larvaAfter;
  assert(
    meatDelta >= countDelta * 0.05,
    `Scenario A: meat resource delta (${meatDelta}) is too small to be a real cost for buying ${countDelta} ${candidateKey}`
  );
  assert(
    larvaDelta >= countDelta * 0.05,
    `Scenario A: larva resource delta (${larvaDelta}) is too small to be a real cost for buying ${countDelta} ${candidateKey}`
  );

  const runHistoryMainActions = Number(cycle.mainActions);
  assert(Number.isFinite(runHistoryMainActions) && runHistoryMainActions >= 1, `Scenario A: expected run history mainActions >= 1 but got ${cycle.mainActions}`);

  assertNoAdvisorOnlyLeak(cycle.laneProposals, "Scenario A");

  return {
    candidateKey,
    countBefore,
    countAfter,
    countDelta,
    meatDelta,
    larvaDelta,
    mainActions: runHistoryMainActions,
    coordinatorExecutionAuthority: cycle.coordinatorExecutionAuthority,
  };
}

async function runScenarioB() {
  const outcome = await runMode("live", [
    "--scenario", "book00-live-purchase-m6",
    "--cycles", "1",
    "--browser-channel", "chrome",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
  ]);
  executionsToClean.push(...(Array.isArray(outcome?.executions) ? outcome.executions : []));

  assert(outcome?.exitCode === 0, `Scenario B: strategy audit live failed with exit code ${outcome?.exitCode}`);

  const execution = Array.isArray(outcome.executions) ? outcome.executions[0] : null;
  const cycle = execution?.result?.cycles?.[0];
  assert(cycle, "Scenario B: expected at least one cycle");

  assert(cycle.resetVerified === true, "Scenario B: reset was not verified");
  assert(cycle.stateLeakageDetected === false, "Scenario B: state leakage detected");

  assert(
    cycle.coordinatorExecutionAuthority === "true",
    `Scenario B: expected M6 execution authority but got ${cycle.coordinatorExecutionAuthority}`
  );
  assert(cycle.coordinatorExecuted === "yes", `Scenario B: expected coordinatorExecuted=yes but got ${cycle.coordinatorExecuted}`);
  assert(
    cycle.coordinatorMatchedExecution === "yes",
    `Scenario B: expected coordinatorMatchedExecution=yes but got ${cycle.coordinatorMatchedExecution}`
  );
  assert(
    cycle.coordinatorSelectedFingerprint && cycle.coordinatorSelectedFingerprint === cycle.coordinatorExecutedFingerprint,
    `Scenario B: expected the executed fingerprint to equal the selected fingerprint but got selected="${cycle.coordinatorSelectedFingerprint}" executed="${cycle.coordinatorExecutedFingerprint}"`
  );

  const executionId = String(cycle.coordinatorSelectedExecutionId || "").trim().toLowerCase();
  assert(executionId, "Scenario B: expected a named coordinatorSelectedExecutionId");

  const before = cycle.resourceBankBefore || {};
  const after = cycle.resourceBankAfter || {};
  assert(
    Object.prototype.hasOwnProperty.call(before, executionId) && Object.prototype.hasOwnProperty.call(after, executionId),
    `Scenario B: expected the executed unit "${executionId}" to be a tracked unit key with before/after game-state counts`
  );

  const countBefore = toNumber(before[executionId]);
  const countAfter = toNumber(after[executionId]);
  assert(Number.isFinite(countBefore) && Number.isFinite(countAfter), `Scenario B: expected numeric count for "${executionId}"`);
  const countDelta = countAfter - countBefore;
  assert(countDelta > 0, `Scenario B: expected unit count delta > 0 for "${executionId}" but got ${countBefore} -> ${countAfter}`);

  const selectedAmount = toNumber(cycle.coordinatorSelectedAmount);
  assert(Number.isFinite(selectedAmount) && selectedAmount > 0, `Scenario B: expected a positive coordinatorSelectedAmount but got ${cycle.coordinatorSelectedAmount}`);
  const authorizedRequestedAmount = toNumber(cycle.coordinatorAuthorizedRequestedAmount);
  const commandRequestedAmount = toNumber(cycle.coordinatorCommandRequestedAmount);
  const confirmedPurchasedAmount = toNumber(cycle.coordinatorConfirmedPurchasedAmount);
  const observedTotalCountDelta = toNumber(cycle.coordinatorObservedTotalCountDelta);
  assert(cycle.coordinatorAmountContractSatisfied === "yes", "Scenario B: four-value amount contract was not satisfied");
  assert(authorizedRequestedAmount === selectedAmount, `Scenario B: authorized amount ${authorizedRequestedAmount} differed from selected amount ${selectedAmount}`);
  assert(commandRequestedAmount === authorizedRequestedAmount, `Scenario B: command amount ${commandRequestedAmount} differed from authorized amount ${authorizedRequestedAmount}`);
  assert(Number.isFinite(confirmedPurchasedAmount) && confirmedPurchasedAmount >= 0 && confirmedPurchasedAmount <= commandRequestedAmount, `Scenario B: invalid confirmed amount ${confirmedPurchasedAmount} for command amount ${commandRequestedAmount}`);
  if (confirmedPurchasedAmount > 0) {
    assert(confirmedPurchasedAmount === commandRequestedAmount, `Scenario B: partial confirmed amount ${confirmedPurchasedAmount} must not be fabricated from the command amount ${commandRequestedAmount}`);
  }
  assert(typeof cycle.coordinatorAmountConfirmationBasis === "string" && cycle.coordinatorAmountConfirmationBasis.length > 0, "Scenario B: amount confirmation basis missing");
  assert(Number.isFinite(observedTotalCountDelta) && observedTotalCountDelta > 0, `Scenario B: missing positive observed count delta (${cycle.coordinatorObservedTotalCountDelta})`);
  assert(
    Math.abs(countDelta - selectedAmount) <= Math.max(1, selectedAmount * 0.01),
    `Scenario B: expected the "${executionId}" count delta (${countDelta}) to match the coordinator's bounded selected amount (${selectedAmount})`
  );

  const mainActions = Number(cycle.mainActions);
  assert(
    Number.isFinite(mainActions) && mainActions === 1,
    `Scenario B: expected exactly one bounded main action this cycle (smartMaxActionsPerRun=1) but mainActions=${cycle.mainActions}; a value > 1 would mean the legacy path also spent an execution key in the same cycle as the M6-authorized buy`
  );

  assertNoAdvisorOnlyLeak(cycle.laneProposals, "Scenario B");

  return {
    executionId,
    countBefore,
    countAfter,
    countDelta,
    selectedAmount,
    authorizedRequestedAmount,
    commandRequestedAmount,
    confirmedPurchasedAmount,
    observedTotalCountDelta,
    mainActions,
    coordinatorSelectedFingerprint: cycle.coordinatorSelectedFingerprint,
  };
}

async function main() {
  const mutationRequested = process.argv.includes("--mutate-m6-cycle-ownership");
  let userscriptContent = null;
  if (mutationRequested) {
    const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
    const source = fs.readFileSync(userscriptPath, "utf8");
    const ownershipGate = "const m6DecisionOwnsMainCycle = false;";
    assert(source.includes(ownershipGate), "mutation control could not find the M6 cycle-ownership gate");
    userscriptContent = source.replace(ownershipGate, "const m6DecisionOwnsMainCycle = true;");
    assert(!userscriptContent.includes(ownershipGate), "mutation control did not flip M6 cycle ownership");
  }

  const scenarioA = await runScenarioA(userscriptContent);
  console.log(
    `[check-live-purchase-acceptance] Scenario A (legacy) pass: candidate=${scenarioA.candidateKey}, `
      + `count ${scenarioA.countBefore}->${scenarioA.countAfter} (delta=${scenarioA.countDelta}), `
      + `meatDelta=${scenarioA.meatDelta.toFixed(3)}, larvaDelta=${scenarioA.larvaDelta.toFixed(3)}, `
      + `mainActions=${scenarioA.mainActions}, coordinatorExecutionAuthority=${scenarioA.coordinatorExecutionAuthority}`
  );

  if (mutationRequested) {
    throw new Error("mutation control unexpectedly preserved the legacy fallback purchase");
  }

  const scenarioB = await runScenarioB();
  console.log(
    `[check-live-purchase-acceptance] Scenario B (M6-authorized) pass: executionId=${scenarioB.executionId}, `
      + `count ${scenarioB.countBefore}->${scenarioB.countAfter} (delta=${scenarioB.countDelta}), `
      + `selectedAmount=${scenarioB.selectedAmount}, mainActions=${scenarioB.mainActions}, `
      + `fingerprint=${scenarioB.coordinatorSelectedFingerprint}`
  );
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}).finally(() => {
  executionsToClean.forEach(cleanupExecutionArtifacts);
});
