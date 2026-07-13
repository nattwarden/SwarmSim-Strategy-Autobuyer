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
        reason: "target unlock step", score: 90000, blockers: [],
        raw: { paybackSeconds: 900, paybackLimitSeconds: 1800, reserveRatio: 3, progressPercent: 40 },
      },
      {
        lane: "Territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
        reason: "improves Expansion ETA", score: 70000, blockers: [],
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
  } finally {
    await browser.close();
  }
  console.log("UNIFIED PURCHASE EVALUATOR CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
