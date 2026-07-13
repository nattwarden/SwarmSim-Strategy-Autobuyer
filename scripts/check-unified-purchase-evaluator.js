const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.purchaseEvaluator, { timeout: 60000 });
    const report = await page.evaluate(() => {
      const api = window.kbcSwarmBot.purchaseEvaluator;
      const evaluation = api.evaluate([
      {
        lane: "Meat", decision: "BUY", candidate: "Drone", target: "Nest", wouldBuyAmount: "100",
        reason: "target unlock step", score: 90000, blockers: [], costResources: ["meat", "larva"],
        raw: { paybackSeconds: 900, paybackLimitSeconds: 1800, reserveRatio: 3, progressPercent: 40 },
      },
      {
        lane: "Engine", decision: "BUY", candidate: "Hatchery", target: "Hatchery", wouldBuyAmount: "1",
        reason: "improves larva production", score: 80000, blockers: [], costResources: ["meat", "larva"],
        raw: { etaSeconds: 300, reserveRatio: 2, progressPercent: 60 },
      },
      {
        lane: "Territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
        reason: "improves Expansion ETA", score: 70000, blockers: [], costResources: ["meat", "larva"],
        raw: { etaBeforeSeconds: 600, etaImprovementSeconds: 240, reserveRatio: 4, progressPercent: 70 },
      },
      {
        lane: "Energy", decision: "HOLD", candidate: "Nexus 5", target: "Nexus", reason: "saving energy",
        score: 1000000, blockers: ["Nexus save"], raw: { etaSeconds: 30, progressPercent: 99 },
      },
      ], { lane: "Meat", candidate: "Drone" });

      const validCandidates = [
        {
          lane: "Territory", executionKey: "territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
          reason: "improves Expansion ETA", score: 72000, blockers: [], costResources: ["meat", "larva"],
          raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
        },
        {
          lane: "Meat", executionKey: "meat", decision: "BUY", candidate: "Drone", target: "Nest", wouldBuyAmount: "60",
          reason: "target unlock step", score: 68000, blockers: [], costResources: ["meat", "larva"],
          raw: { paybackSeconds: 900, paybackLimitSeconds: 1800, reserveRatio: 2, progressPercent: 45 },
        },
        {
          lane: "Engine", executionKey: "engine", decision: "BUY", candidate: "Hatchery", target: "Hatchery", wouldBuyAmount: "1",
          reason: "hatchery near", score: 65000, blockers: [], costResources: ["meat", "larva"],
          raw: { etaSeconds: 240, reserveRatio: 2, progressPercent: 55 },
        },
      ];

      const shadowOnlyDecision = api.buildExecutionDecision(validCandidates, { actionBudget: 1 });
      const approvedDecision = api.buildExecutionDecision(validCandidates, { actionBudget: 1, revalidationCandidates: validCandidates });
      const executionDisabledDecision = api.buildExecutionDecision(validCandidates, {
        actionBudget: 1,
        executionEnabled: false,
        revalidationCandidates: validCandidates,
      });

      const holdDeniedDecision = api.buildExecutionDecision([
        {
          lane: "Meat", executionKey: "meat", decision: "HOLD", candidate: "Drone", target: "Nest", wouldBuyAmount: "60",
          reason: "waiting", score: 70000, blockers: ["reserve"], raw: { reserveRatio: 1.2 },
        },
      ], { actionBudget: 1, revalidationCandidates: [] });

      const blockedDeniedDecision = api.buildExecutionDecision([
        {
          lane: "Territory", executionKey: "territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
          reason: "candidate blocked", score: 73000, blockers: ["territory protected for Expansion"], raw: { etaBeforeSeconds: 400, etaImprovementSeconds: 150 },
        },
      ], { actionBudget: 1, revalidationCandidates: [] });

      const lowConfidenceDeniedDecision = api.buildExecutionDecision([
        {
          lane: "Engine", executionKey: "engine", decision: "BUY", candidate: "Hatchery", target: "Hatchery", wouldBuyAmount: "1",
          reason: "sparse evidence", score: 61000, blockers: [], raw: {},
        },
      ], { actionBudget: 1, revalidationCandidates: [] });

      const unknownKeyDeniedDecision = api.buildExecutionDecision([
        {
          lane: "Territory", executionKey: "unknown-key", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
          reason: "improves Expansion ETA", score: 72000, blockers: [], raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
        },
      ], { actionBudget: 1, revalidationCandidates: [] });

      const revalidationFailedDecision = api.buildExecutionDecision(validCandidates, {
        actionBudget: 1,
        revalidationCandidates: [
          {
            lane: "Territory", executionKey: "territory", decision: "HOLD", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
            reason: "no longer buyable", score: 72000, blockers: ["territory protected for Expansion"], raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
          },
          validCandidates[1],
          validCandidates[2],
        ],
      });

      const fingerprintDriftDecision = api.buildExecutionDecision(validCandidates, {
        actionBudget: 1,
        revalidationCandidates: [
          {
            lane: "Territory", executionKey: "territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "6",
            reason: "improves Expansion ETA", score: 72000, blockers: [], costResources: ["meat", "larva"],
            raw: { etaBeforeSeconds: 500, etaImprovementSeconds: 200, reserveRatio: 3, progressPercent: 65 },
          },
          validCandidates[1],
          validCandidates[2],
        ],
      });

      const bot = window.kbcSwarmBot;
      const previousConfig = {
        enabled: !!bot?.config?.enabled,
        smartMode: !!bot?.config?.smartMode,
        advisorOnly: !!bot?.config?.advisorOnly,
        autoBuySafeDecisions: !!bot?.config?.autoBuySafeDecisions,
      };

      bot.config.enabled = true;
      bot.config.smartMode = true;
      bot.config.advisorOnly = true;
      bot.config.autoBuySafeDecisions = true;
      bot.runOnce();
      const runtimeInspector = bot.getStrategyInspector?.() || {};
      const runtimeSmoke = {
        coordinatorExecutionSchema: runtimeInspector.coordinatorExecutionSchema || "none",
        coordinatorExecutionAuthority: runtimeInspector.coordinatorExecutionAuthority || "false",
        coordinatorExecuted: runtimeInspector.coordinatorExecuted || "no",
        coordinatorMatchedExecution: runtimeInspector.coordinatorMatchedExecution || "no",
      };

      bot.config.enabled = previousConfig.enabled;
      bot.config.smartMode = previousConfig.smartMode;
      bot.config.advisorOnly = previousConfig.advisorOnly;
      bot.config.autoBuySafeDecisions = previousConfig.autoBuySafeDecisions;

      return {
        evaluation,
        shadowOnlyDecision,
        approvedDecision,
        executionDisabledDecision,
        holdDeniedDecision,
        blockedDeniedDecision,
        lowConfidenceDeniedDecision,
        unknownKeyDeniedDecision,
        revalidationFailedDecision,
        fingerprintDriftDecision,
        runtimeSmoke,
      };
    });

    const evaluation = report.evaluation;

    assert(evaluation.mode === "shadow-advisor-only", "evaluator must start without execution authority");
    assert(evaluation.executionAuthority === false, "shadow evaluator gained execution authority");
    assert(evaluation.winner?.lane === "Territory", "economic ETA winner was not selected");
    assert(evaluation.winner?.confidence === "high", "well-instrumented winner should have high confidence");
    assert(evaluation.agreesWithCouncil === false, "Council divergence was not detected");
    assert(evaluation.evaluated.find((row) => row.lane === "Energy")?.safeEligible === false, "blocked candidate became eligible");
    assert(evaluation.scoreMargin > 0, "winner margin is missing");
    assert(evaluation.wholeEconomyPreview?.mode === "shadow-advisor-only", "whole-economy preview mode mismatch");
    assert(evaluation.wholeEconomyPreview?.executionAuthority === false, "whole-economy preview must remain advisor-only");
    assert(evaluation.wholeEconomyPreview?.winner?.domain === "Army/Territory", "whole-economy winner domain mismatch");
    assert(Array.isArray(evaluation.wholeEconomyPreview?.domainCandidates) && evaluation.wholeEconomyPreview.domainCandidates.length === 3, "expected three normalized whole-economy domain candidates");
    assert(evaluation.wholeEconomyPreview.domainCandidates.every((row) => row.candidate !== "none"), "whole-economy domain passed with a placeholder candidate");
    assert(evaluation.wholeEconomyPreview.domainCandidates.some((row) => row.domain === "Larva/Engine" && row.candidate === "Hatchery"), "real Larva/Engine candidate missing");
    assert(Array.isArray(evaluation.wholeEconomyPreview?.losers) && evaluation.wholeEconomyPreview.losers.length >= 2, "expected at least two losing whole-economy candidates");
    assert(Array.isArray(evaluation.wholeEconomyPreview?.resourceConflicts) && evaluation.wholeEconomyPreview.resourceConflicts.length > 0, "shared purchase resources were not reported");

    assert(report.shadowOnlyDecision.executionAuthority === false, "shadow winner must not gain execution authority without explicit revalidation");
    assert(report.shadowOnlyDecision.revalidationStatus === "required", "shadow-only decision should require revalidation");

    assert(report.approvedDecision.executionAuthority === true, "valid medium/high BUY candidate did not receive authority");
    assert(report.approvedDecision.revalidationStatus === "passed", "approved candidate did not pass revalidation");
    assert(report.approvedDecision.selectedExecutionKey === "territory", "approved decision selected unexpected execution key");
    assert(report.approvedDecision.selectedFingerprint && report.approvedDecision.selectedFingerprint !== "none", "approved decision fingerprint missing");

    assert(report.executionDisabledDecision.executionAuthority === false, "execution-disabled decision must not grant authority");
    assert(report.executionDisabledDecision.gatesFailed.join(" ").includes("execution-mode-enabled"), "execution-disabled decision missing mode gate failure");

    assert(report.holdDeniedDecision.executionAuthority === false, "HOLD candidate was incorrectly authorized");
    assert(report.blockedDeniedDecision.executionAuthority === false, "blocked candidate was incorrectly authorized");
    assert(report.lowConfidenceDeniedDecision.executionAuthority === false, "low-confidence candidate was incorrectly authorized");

    assert(report.unknownKeyDeniedDecision.executionAuthority === false, "candidate with unknown execution key was incorrectly authorized");
    assert(/outside Meat\/Engine\/Territory reversible scope|execution key/.test(report.unknownKeyDeniedDecision.gatesFailed.join(" ")), "unknown execution key denial reason missing");

    assert(report.revalidationFailedDecision.executionAuthority === false, "revalidation failure should remove authority");
    assert(report.revalidationFailedDecision.revalidationStatus === "failed", "revalidation failure status was not reported");
    assert(report.revalidationFailedDecision.fallbackReason && report.revalidationFailedDecision.fallbackReason !== "none", "fallback reason missing after failed revalidation");

    assert(report.fingerprintDriftDecision.executionAuthority === false, "fingerprint drift should remove authority");
    assert(report.fingerprintDriftDecision.revalidationStatus === "failed", "fingerprint drift must fail revalidation");
    assert(report.fingerprintDriftDecision.gatesFailed.join(" ").includes("same-candidate-fingerprint"), "fingerprint drift gate failure missing");

    assert(report.runtimeSmoke.coordinatorExecutionSchema === "whole-economy-execution-decision.v1", "runtime smoke missing coordinator execution schema");
    assert(report.runtimeSmoke.coordinatorExecutionAuthority === "false", "advisor-only runtime smoke should not grant execution authority");
    assert(report.runtimeSmoke.coordinatorExecuted === "no", "advisor-only runtime smoke should not execute coordinator buy");
    assert(report.runtimeSmoke.coordinatorMatchedExecution === "no", "advisor-only runtime smoke should not report matched execution");
  } finally {
    await browser.close();
  }
  console.log("UNIFIED PURCHASE EVALUATOR CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
