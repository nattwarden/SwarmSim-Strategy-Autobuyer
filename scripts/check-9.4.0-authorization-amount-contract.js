#!/usr/bin/env node
"use strict";

// 9.4.0 TRACK A commit 3 — focused acceptance + mutation controls for the STOP GATE 2 contracts:
//   A1 stale-authorization gate (authorizationId distinct from canonicalProposalId), and
//   A2/A3 four-value amount contract (authorized/command/confirmed/observed) with named-clamp policy.
// Every scenario pairs a healthy CONTROL (must pass/authorize) with a MUTATION (must be blocked or
// flagged). No live purchase is needed: the pure contract + coordinator hooks are driven directly.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
  console.log("  ok:", message);
}

// Mirror of runtime normalizeLabelKey + buildCoordinatorCandidateFingerprint so a synthetic authorized
// winner carries the exact fingerprint the runtime will recompute during revalidation.
function normLabel(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function fingerprint(s) {
  return [s.lane, s.executionKey, normLabel(s.candidate) || "none", s.executionId, s.executionKind, s.variant, s.target, s.amount].join("|");
}

// Build a coordinator result + proposal state that yields a preRevalidationEligible bounded plan.
function buildResultAndState(spec) {
  const s = {
    lane: "Meat", domainId: "MEAT", executionKey: "meat", executionId: "drone", executionKind: "unit",
    variant: "base", candidate: "Drone", amount: "50", cycle: "cycle-1", snapshot: "snap-1",
    target: "nest", metric: "binding-resource-eta.v1", ...spec,
  };
  // The proposal identity can be independently overridden (to model same-label/diff-id and wrong-variant).
  const pExecutionId = spec.proposalExecutionId || s.executionId;
  const pVariant = spec.proposalVariant || s.variant;
  const proposal = {
    proposalId: `${s.executionKey}::${pExecutionId}::${s.executionKind}::${pVariant}`,
    executionKey: s.executionKey, executionId: pExecutionId, executionKind: s.executionKind,
    executionVariant: pVariant, lane: s.lane, candidate: s.candidate, decision: "BUY", blockers: [],
    boundedAmount: s.amount, wouldBuyAmount: s.amount, target: s.target,
  };
  const evaluatedRow = {
    lane: s.lane, candidate: s.candidate, decision: "BUY", safeEligible: true, confidence: "medium",
    evidenceFields: 4, blockers: [], amount: s.amount, target: s.target, reason: "target step",
  };
  const evaluation = { evaluated: [evaluatedRow], winner: evaluatedRow, scoreMargin: 5, runnerUp: { lane: "Engine" } };
  const result = {
    decisionCycleId: s.cycle, snapshotId: s.snapshot, activeTarget: s.target, executionAuthority: true,
    recommendation: "ACT", reason: "ok",
    winner: {
      authorityClass: "BOUNDED_REVERSIBLE", domainId: s.domainId, reason: "advances milestone",
      action: {
        proposalId: `${s.executionKey}::${s.executionId}::${s.executionKind}::${s.variant}`,
        actionId: "BUY", executionKey: s.executionKey, executionId: s.executionId,
        executionKind: s.executionKind, executionVariant: s.variant, amount: s.amount, fingerprint: fingerprint(s),
      },
      milestoneOutcome: { metricSchema: s.metric, metricTargetId: s.target },
      comparability: { metricSchema: s.metric, metricTargetId: s.target },
    },
  };
  return { result, proposalState: { proposals: [proposal], evaluation } };
}

function freshCycleFor(spec) {
  const s = { cycle: "cycle-1", snapshot: "snap-1", target: "nest", metric: "binding-resource-eta.v1", ...spec };
  return { decisionCycleId: s.cycle, snapshotId: s.snapshot, activeTargetId: s.target, metricSchema: s.metric };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!(window.kbcSwarmBot?.strategicCoordinator && window.kbcSwarmBot?.executionAmountContract), { timeout: 60000 });

    // Authorized baseline (the control everything is mutated against).
    const authorized = buildResultAndState({});
    const healthyFresh = freshCycleFor({});

    const inputs = {
      authorized,
      healthyFresh,
      // A1 stale-authorization mutations (each keeps the same recurring candidate).
      staleOldCycle: freshCycleFor({ cycle: "cycle-0" }),
      staleOldSnapshot: freshCycleFor({ snapshot: "snap-0" }),
      staleNextCycle: freshCycleFor({ cycle: "cycle-2", snapshot: "snap-2" }),
      staleTargetChange: freshCycleFor({ target: "hive" }),
      staleMetricChange: freshCycleFor({ metric: "counterfactual-horizon-progress.v1" }),
      // Identity mutations at authorization time.
      sameLabelDifferentId: buildResultAndState({ proposalExecutionId: "drone2" }),
      wrongVariant: buildResultAndState({ proposalVariant: "twin" }),
      // Multi-action independence: a plan authorized for A must never authorize a different candidate B.
      winnerA: buildResultAndState({ executionId: "drone", candidate: "Drone" }),
      onlyBState: buildResultAndState({ executionId: "queen", candidate: "Queen" }).proposalState,
    };

    const out = await page.evaluate((io) => {
      const sc = window.kbcSwarmBot.strategicCoordinator;
      const ac = window.kbcSwarmBot.executionAmountContract;
      const pe = window.kbcSwarmBot.purchaseEvaluator;

      const plan = sc.buildExecutionPlan(io.authorized.result, io.authorized.proposalState);
      const reval = (fc) => sc.revalidateExecutionPlan(plan, io.authorized.proposalState, fc);

      // A1
      const staleResults = {
        control: reval(io.healthyFresh),
        oldCycle: reval(io.staleOldCycle),
        oldSnapshot: reval(io.staleOldSnapshot),
        nextCycle: reval(io.staleNextCycle),
        targetChange: reval(io.staleTargetChange),
        metricChange: reval(io.staleMetricChange),
      };

      // Identity at authorization time
      const sameLabelPlan = sc.buildExecutionPlan(io.sameLabelDifferentId.result, io.sameLabelDifferentId.proposalState);
      const wrongVariantPlan = sc.buildExecutionPlan(io.wrongVariant.result, io.wrongVariant.proposalState);

      // Multi-action independence: winner A against a proposal state that only contains candidate B.
      const crossPlan = sc.buildExecutionPlan(io.winnerA.result, io.onlyBState);

      // Budget gate via purchaseEvaluator (multi-action cycle): budget 0 must not authorize, 1 may.
      const budgetCandidates = io.authorized.proposalState.proposals.map((p) => ({
        ...p, raw: { paybackSeconds: 1, paybackLimitSeconds: 999999, reserveRatio: 9, progressPercent: 50 },
        milestoneOutcome: { comparabilityStatus: "COMPARABLE", state: "REACHABLE", metricSchema: "binding-resource-eta.v1", metricBasis: "binding-resource-affordability-eta-seconds", metricTargetId: "nest", metricHorizonId: "medium", metricUnit: "seconds", etaImprovementSeconds: 100, metricValue: 100 },
      }));
      const budgetZero = pe.buildExecutionDecision(budgetCandidates, { actionBudget: 0 });
      const budgetOne = pe.buildExecutionDecision(budgetCandidates, { actionBudget: 1 });

      // A2/A3 amount contract
      const equal = ac.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "50" });
      const doubleCommand = ac.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "100" });
      const disallowedClamp = ac.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "25" });
      const approvedClamp = ac.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "25", clampPolicy: { policyName: "affordability-clamp.v1", reason: "only 25 affordable" } });
      const lowProdUnit = ac.finalize(equal, { commandSucceeded: true, observedTotalCountDelta: "50", costBefore: { meat: 1000, larva: 2000 }, costAfter: { meat: 700, larva: 1600 }, kind: "unit" });
      const highProdUnit = ac.finalize(equal, { commandSucceeded: true, observedTotalCountDelta: "5000", costBefore: { meat: 1000, larva: 2000 }, costAfter: { meat: 700, larva: 1600 }, kind: "unit" });
      const upgradeFinal = ac.finalize(equal, { commandSucceeded: true, observedTotalCountDelta: "1", costBefore: { larva: 1000 }, costAfter: { larva: 900 }, kind: "upgrade" });

      return {
        planEligible: plan.preRevalidationEligible, planAuth: plan.authorization,
        staleResults, sameLabelPlan: { blocker: sameLabelPlan.blocker, eligible: sameLabelPlan.preRevalidationEligible, identity: sameLabelPlan.identityStatus },
        wrongVariantPlan: { blocker: wrongVariantPlan.blocker, eligible: wrongVariantPlan.preRevalidationEligible },
        crossPlan: { blocker: crossPlan.blocker, eligible: crossPlan.preRevalidationEligible },
        budgetZero: { authority: budgetZero.executionAuthority, eligible: budgetZero.preRevalidationEligible, gatesFailed: budgetZero.gatesFailed },
        budgetOne: { eligible: budgetOne.preRevalidationEligible },
        equal, doubleCommand, disallowedClamp, approvedClamp, lowProdUnit, highProdUnit, upgradeFinal,
      };
    }, inputs);

    console.log("[1/10] control — healthy authorization + revalidation");
    assert(out.planEligible === true, "authorized plan is preRevalidationEligible");
    assert(out.planAuth && out.planAuth.authorizationId && out.planAuth.canonicalProposalId === "meat::drone::unit::base", "authorizationId distinct from canonicalProposalId (action-type)");
    assert(out.staleResults.control.executionAuthority === true && out.staleResults.control.blocker == null, "healthy revalidation authorizes (no over-blocking)");

    console.log("[2/10] A1 stale — old decisionCycleId");
    assert(out.staleResults.oldCycle.blocker === "STALE_AUTHORIZATION" && out.staleResults.oldCycle.executionAuthority === false, "old decisionCycleId blocked");
    console.log("[3/10] A1 stale — old snapshotId");
    assert(out.staleResults.oldSnapshot.blocker === "STALE_AUTHORIZATION" && out.staleResults.oldSnapshot.executionAuthority === false, "old snapshotId blocked");
    console.log("[4/10] A1 stale — same candidate in next cycle");
    assert(out.staleResults.nextCycle.blocker === "STALE_AUTHORIZATION" && out.staleResults.nextCycle.executionAuthority === false, "same candidate next cycle blocked");
    console.log("[5/10] A1 stale — active target changed");
    assert(out.staleResults.targetChange.blocker === "STALE_AUTHORIZATION" && out.staleResults.targetChange.executionAuthority === false, "active target change blocked");
    console.log("[6/10] A1 stale — metric schema changed");
    assert(out.staleResults.metricChange.blocker === "STALE_AUTHORIZATION" && out.staleResults.metricChange.executionAuthority === false, "metric schema change blocked");

    console.log("[7/10] identity — same label, different internal id / wrong variant / multi-action independence");
    assert(out.sameLabelPlan.blocker === "AUTHORIZATION_IDENTITY_MISMATCH" && out.sameLabelPlan.eligible === false, "same label but different internal id blocked");
    assert(out.wrongVariantPlan.blocker === "AUTHORIZATION_IDENTITY_MISMATCH" && out.wrongVariantPlan.eligible === false, "wrong variant blocked");
    assert(out.crossPlan.blocker === "AUTHORIZATION_IDENTITY_MISMATCH" && out.crossPlan.eligible === false, "plan for candidate A never authorizes a different candidate B");
    assert(out.budgetZero.eligible === false && out.budgetOne.eligible === true, "multi-action budget gate: 0 budget blocks, >=1 permits");

    console.log("[8/10] A2 amount — equality required; double command amount + disallowed clamp detected");
    assert(out.equal.contractSatisfied === true && out.equal.violation == null, "authorized == command satisfies contract");
    assert(out.doubleCommand.contractSatisfied === false && /AMOUNT_CONTRACT_VIOLATION/.test(out.doubleCommand.violation), "double command amount = violation");
    assert(out.disallowedClamp.contractSatisfied === false && /AMOUNT_CONTRACT_VIOLATION/.test(out.disallowedClamp.violation), "silent clamp (no named policy) = violation");

    console.log("[9/10] A2 amount — approved named-policy clamp");
    assert(out.approvedClamp.clampApplied === true && out.approvedClamp.contractSatisfied === true, "named clamp policy satisfies contract");
    assert(out.approvedClamp.amountBeforeClamp === "50" && out.approvedClamp.amountAfterClamp === "25" && out.approvedClamp.clampReason === "only 25 affordable" && out.approvedClamp.clampPolicyName === "affordability-clamp.v1", "clamp records policy/before/after/reason");

    console.log("[10/10] A3 confirmed source — low/high-production unit + upgrade");
    assert(out.lowProdUnit.confirmedPurchasedAmount === "50" && out.lowProdUnit.confirmationBasis === "authorized-command-amount+command-success+verified-cost-consumption", "low-production unit: confirmed = command amount");
    assert(out.highProdUnit.confirmedPurchasedAmount === "50" && out.highProdUnit.observedTotalCountDelta === "5000", "high-production unit: confirmed = command amount, polluted count delta kept as evidence only");
    assert(out.upgradeFinal.confirmedPurchasedAmount === "1" && out.upgradeFinal.confirmationBasis === "discrete-upgrade-count-delta", "upgrade: confirmed = discrete count delta");

    console.log("\n[check-9.4.0-authorization-amount-contract] ALL 10 ACCEPTANCE + MUTATION CONTROLS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
