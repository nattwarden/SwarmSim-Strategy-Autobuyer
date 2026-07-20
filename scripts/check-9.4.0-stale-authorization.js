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
  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8").replace(/\r\n/g, "\n");
  if (process.env.KBC_MUTATE_STALE_AUTHORIZATION === "1") {
    const needle = "if (staleAuthorizationReasons.length > 0) {";
    assert(userscript.includes(needle), "stale-authorization mutation needle missing");
    userscript = userscript.replace(needle, "if (false) {");
  }

  const browser = await getBrowser({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator, { timeout: 120000 });

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const purchaseApi = bot.purchaseEvaluator;
      const coordinatorApi = bot.strategicCoordinator;
      const proposal = {
        lane: "Territory", executionKey: "territory", executionId: "stinger", executionKind: "unit", executionVariant: "v",
        decision: "BUY", candidate: "Stinger V", target: "Expansion", boundedAmount: "5", wouldBuyAmount: "5",
        reason: "improves Expansion ETA", score: 72000, blockers: [], costResources: ["meat", "larva"],
        raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
      };
      const evaluation = purchaseApi.evaluate([proposal]);
      const decision = purchaseApi.buildExecutionDecision([proposal], { actionBudget: 1 });
      const canonicalProposalId = purchaseApi.identity.canonicalProposalId(proposal);
      const plan = coordinatorApi.buildExecutionPlan({
        winner: {
          domainId: "ARMY_TERRITORY", domainLabel: "Army/Territory", authorityClass: "BOUNDED_REVERSIBLE",
          action: {
            actionId: "Stinger V", label: "Stinger V", class: "PURCHASE", amount: "5",
            executionKey: "territory", executionId: "stinger", executionKind: "unit", executionVariant: "v",
            canonicalProposalId, fingerprint: decision.selectedFingerprint,
          },
        },
        decisionCycleId: "cycle-41", snapshotId: "snapshot-41", activeMilestone: "Reach Expansion",
        activeTarget: "Expansion", recommendation: "ACT", recommendedActionId: "Stinger V",
        executionAuthority: true, reason: "focused stale authorization fixture",
      }, { proposals: [proposal], evaluation });
      const exactContext = { decisionCycleId: "cycle-41", snapshotId: "snapshot-41", activeTarget: "Expansion" };
      const revalidate = (proposals, context) => coordinatorApi.revalidateExecutionPlan(
        plan,
        { proposals, evaluation: purchaseApi.evaluate(proposals) },
        context
      );
      const exact = revalidate([proposal], exactContext);
      const staleCycle = revalidate([proposal], { ...exactContext, decisionCycleId: "cycle-42" });
      const staleSnapshot = revalidate([proposal], { ...exactContext, snapshotId: "snapshot-42" });
      const staleTarget = revalidate([proposal], { ...exactContext, activeTarget: "lesser hive mind" });
      const missingContext = revalidate([proposal], {});
      const changedProposal = { ...proposal, executionVariant: "base" };
      const staleCanonical = revalidate([changedProposal], exactContext);
      const compact = (value) => ({
        executionAuthority: value.executionAuthority === true,
        identityStatus: value.identityStatus,
        revalidationStatus: value.revalidationStatus,
        blocker: value.blocker || null,
        reason: value.reason,
        authorizationId: value.authorization?.authorizationId || null,
        revalidationAuthorizationId: value.revalidationAuthorization?.authorizationId || null,
      });
      return {
        planAuthorizationId: plan.authorization?.authorizationId || null,
        planEnforcement: plan.authorization?.enforcement || null,
        exact: compact(exact), staleCycle: compact(staleCycle), staleSnapshot: compact(staleSnapshot),
        staleTarget: compact(staleTarget), missingContext: compact(missingContext), staleCanonical: compact(staleCanonical),
      };
    });

    assert(report.planAuthorizationId, "plan authorization identity missing");
    assert(report.planEnforcement === "pre-purchase-stale-gate", `unexpected enforcement: ${report.planEnforcement}`);
    assert(report.exact.executionAuthority && report.exact.identityStatus === "matched", "healthy same-context revalidation lost authority");
    assert(report.exact.authorizationId === report.exact.revalidationAuthorizationId, "healthy authorization and revalidation identities differ");
    for (const [name, result] of Object.entries({
      staleCycle: report.staleCycle,
      staleSnapshot: report.staleSnapshot,
      staleTarget: report.staleTarget,
      missingContext: report.missingContext,
      staleCanonical: report.staleCanonical,
    })) {
      assert(result.executionAuthority === false, `${name} retained execution authority`);
      assert(result.identityStatus === "stale" && result.blocker === "STALE_AUTHORIZATION", `${name} did not fail the stale-authorization gate`);
    }
    console.log(JSON.stringify({ status: "PASS", ...report }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
