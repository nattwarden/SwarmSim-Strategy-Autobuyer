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
    const evaluation = await page.evaluate(() => window.kbcSwarmBot.purchaseEvaluator.evaluate([
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
    ], { lane: "Meat", candidate: "Drone" }));

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
  } finally {
    await browser.close();
  }
  console.log("UNIFIED PURCHASE EVALUATOR CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
