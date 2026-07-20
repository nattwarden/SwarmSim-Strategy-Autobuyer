#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  // Git may materialize the userscript with CRLF in a fresh Windows worktree.
  // Normalize only the in-memory verifier input so mutation controls exercise
  // the same runtime source on LF and CRLF checkouts.
  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8").replace(/\r\n/g, "\n");
  if (process.env.KBC_MUTATE_CANONICAL_ID_AMOUNT === "1") {
    const needle = "String(input.executionVariant || \"base\"),\n    ].join(\"::\");";
    const replacement = "String(input.executionVariant || \"base\"),\n      normalizeBoundedAmountToken(input.boundedAmount || input.amount || \"0\"),\n    ].join(\"::\");";
    assert(userscript.includes(needle), "canonical amount mutation needle missing");
    userscript = userscript.replace(needle, replacement);
  }
  if (process.env.KBC_MUTATE_AUTHORIZATION_CONTEXT === "1") {
    const needle = "return [canonicalProposalId, decisionCycleId, snapshotId, activeTarget].map(encodeURIComponent).join(\"@@\");";
    const replacement = "return canonicalProposalId;";
    assert(userscript.includes(needle), "authorization context mutation needle missing");
    userscript = userscript.replace(needle, replacement);
  }

  const browser = await getBrowser({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.purchaseEvaluator, { timeout: 120000 });

    const report = await page.evaluate(() => {
      const purchaseApi = window.kbcSwarmBot.purchaseEvaluator;
      const coordinatorApi = window.kbcSwarmBot.strategicCoordinator;
      const identity = purchaseApi.identity;
      if (!identity) return { error: "purchaseEvaluator.identity unavailable" };

      const action = {
        executionKey: "territory",
        executionId: "stinger",
        executionKind: "unit",
        executionVariant: "v",
        boundedAmount: "5",
        candidate: "Stinger V",
        target: "Expansion",
      };
      const canonical = identity.canonicalProposalId(action);
      const canonicalAmountChanged = identity.canonicalProposalId({ ...action, boundedAmount: "6" });
      const canonicalDisplayChanged = identity.canonicalProposalId({ ...action, candidate: "Localized Stinger V", target: "House of Mirrors prep" });
      const canonicalVariantChanged = identity.canonicalProposalId({ ...action, executionVariant: "base" });

      const authorizationContext = {
        canonicalProposalId: canonical,
        decisionCycleId: "cycle-41",
        snapshotId: "snapshot-41",
        activeTarget: "Expansion",
      };
      const authorization = identity.authorizationId(authorizationContext);
      const authorizationAmountChanged = identity.authorizationId({ ...authorizationContext, authorizedAmount: "999" });
      const authorizationCycleChanged = identity.authorizationId({ ...authorizationContext, decisionCycleId: "cycle-42" });
      const authorizationSnapshotChanged = identity.authorizationId({ ...authorizationContext, snapshotId: "snapshot-42" });
      const authorizationTargetChanged = identity.authorizationId({ ...authorizationContext, activeTarget: "lesser hive mind" });

      const proposal = {
        lane: "Territory",
        executionKey: "territory",
        executionId: "stinger",
        executionKind: "unit",
        executionVariant: "v",
        decision: "BUY",
        candidate: "Stinger V",
        target: "Expansion",
        boundedAmount: "5",
        wouldBuyAmount: "5",
        reason: "improves Expansion ETA",
        score: 72000,
        blockers: [],
        costResources: ["meat", "larva"],
        raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
      };
      const evaluation = purchaseApi.evaluate([proposal]);
      const decision = purchaseApi.buildExecutionDecision([proposal], { actionBudget: 1 });
      const winner = {
        domainId: "ARMY_TERRITORY",
        domainLabel: "Army/Territory",
        authorityClass: "BOUNDED_REVERSIBLE",
        action: {
          actionId: "Stinger V",
          label: "Stinger V",
          class: "PURCHASE",
          amount: "5",
          executionKey: "territory",
          executionId: "stinger",
          executionKind: "unit",
          executionVariant: "v",
          canonicalProposalId: canonical,
          fingerprint: decision.selectedFingerprint,
        },
      };
      const plan = coordinatorApi.buildExecutionPlan({
        winner,
        decisionCycleId: "cycle-41",
        snapshotId: "snapshot-41",
        activeMilestone: "Reach Expansion",
        activeTarget: "Expansion",
        recommendation: "ACT",
        recommendedActionId: "Stinger V",
        executionAuthority: true,
        reason: "focused identity fixture",
      }, { proposals: [proposal], evaluation });

      return {
        canonical,
        canonicalAmountChanged,
        canonicalDisplayChanged,
        canonicalVariantChanged,
        authorization,
        authorizationAmountChanged,
        authorizationCycleChanged,
        authorizationSnapshotChanged,
        authorizationTargetChanged,
        decisionCanonicalProposalId: decision.selectedCanonicalProposalId,
        planCanonicalProposalId: plan.boundedCandidate?.canonicalProposalId || null,
        planAuthorizationId: plan.authorization?.authorizationId || null,
        planAuthorizationEnforcement: plan.authorization?.enforcement || null,
        planDecisionAuthorizationId: plan.executionDecision?.selectedAuthorizationId || null,
        planIdentityStatus: plan.identityStatus,
        planPreRevalidationEligible: plan.preRevalidationEligible === true,
      };
    });

    assert(!report.error, report.error);
    assert(report.canonical === "territory::stinger::unit::v", `unexpected canonical proposal id: ${report.canonical}`);
    assert(report.canonicalAmountChanged === report.canonical, "canonical proposal identity must exclude amount");
    assert(report.canonicalDisplayChanged === report.canonical, "canonical proposal identity must exclude display label and target text");
    assert(report.canonicalVariantChanged !== report.canonical, "execution variant must remain part of canonical proposal identity");
    assert(report.authorization !== report.canonical, "authorization identity must be distinct from canonical proposal identity");
    assert(report.authorizationAmountChanged === report.authorization, "amount must remain outside this authorization-identity slice");
    assert(report.authorizationCycleChanged !== report.authorization, "authorization identity must bind decision cycle");
    assert(report.authorizationSnapshotChanged !== report.authorization, "authorization identity must bind snapshot");
    assert(report.authorizationTargetChanged !== report.authorization, "authorization identity must bind active target");
    assert(report.decisionCanonicalProposalId === report.canonical, "M2 decision did not expose the selected canonical proposal identity");
    assert(report.planCanonicalProposalId === report.canonical, "M6 bounded candidate did not preserve canonical proposal identity");
    assert(report.planAuthorizationId === report.authorization, "M6 plan did not mint the expected authorization identity");
    assert(report.planDecisionAuthorizationId === report.authorization, "execution-decision observability did not carry authorization identity");
    assert(report.planAuthorizationEnforcement === "pre-purchase-stale-gate", "authorization identity is not enforced by the stale-authorization gate");
    assert(report.planIdentityStatus === "matched" && report.planPreRevalidationEligible, "additive identity fields changed the healthy existing plan path");

    console.log(JSON.stringify({ status: "PASS", ...report }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
