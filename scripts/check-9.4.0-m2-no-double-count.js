#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { getBrowser } = require("./lib/browser-harness");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
  let userscript = fs.readFileSync(userscriptPath, "utf8");
  const exclusivityGate = /const exclusiveMilestoneProgressMetric = Number\.isFinite\(milestoneProgressDelta\)\s*&& String\(raw\?\.metricBasis \|\| ""\) === "same-unit-milestone-progress-delta";/;
  assert(exclusivityGate.test(userscript), "missing M2 milestone-progress exclusivity gate");
  if (process.argv.includes("--mutate-exclusivity-gate")) {
    userscript = userscript.replace(exclusivityGate, "const exclusiveMilestoneProgressMetric = false;");
    assert(!exclusivityGate.test(userscript), "M2 double-count mutation did not apply");
  }

  const browser = await getBrowser({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.purchaseEvaluator, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const evaluateOne = (proposal) => window.kbcSwarmBot.purchaseEvaluator.evaluate([proposal]).evaluated[0];
      const base = {
        decision: "BUY",
        target: "Expansion",
        boundedAmount: "1",
        wouldBuyAmount: "1",
        blockers: [],
        costResources: ["meat"],
        score: 1,
      };
      const completion = evaluateOne({
        ...base,
        lane: "Engine",
        candidate: "Expansion",
        reason: "Expansion milestone target completes now",
        raw: {
          metricTarget: "Expansion",
          metricId: "expansion-completion",
          metricUnit: "percent",
          metricBasis: "same-unit-milestone-progress-delta",
          etaSeconds: 0,
          progressPercent: 100,
          projectedMilestoneProgressDelta: 100,
        },
      });
      const eta = evaluateOne({
        ...base,
        lane: "Territory",
        candidate: "Swarmling",
        reason: "Expansion milestone ETA improvement",
        raw: {
          metricTarget: "Expansion",
          metricId: "expansion-eta",
          metricUnit: "seconds",
          metricBasis: "milestone-eta-seconds",
          etaSeconds: 10,
          etaImprovementSeconds: 10,
          progressPercent: 50,
        },
      });
      return {
        completion: {
          economicScore: completion.economicScore,
          metricExclusivityApplied: completion.metricExclusivityApplied,
          components: completion.components,
        },
        eta: {
          economicScore: eta.economicScore,
          metricExclusivityApplied: eta.metricExclusivityApplied,
          components: eta.components,
        },
      };
    });

    const completion = report.completion;
    assert(completion.metricExclusivityApplied === true, "completion row did not activate metric exclusivity");
    assert(completion.components.milestoneProgressDelta === 100, "completion milestone delta was not preserved");
    assert(completion.components.etaProximity === 0, `completion ETA proximity was double-counted: ${JSON.stringify(completion)}`);
    assert(completion.components.progress === 0, `completion progressPercent was double-counted: ${JSON.stringify(completion)}`);
    assert(completion.components.unlock === 0, `completion unlock text was double-counted: ${JSON.stringify(completion)}`);
    assert(report.eta.metricExclusivityApplied === false, "ETA row incorrectly activated progress exclusivity");
    assert(report.eta.components.etaProximity > 0, "ETA row lost its legitimate proximity signal");
    assert(report.eta.components.progress === 50, "ETA row lost its ordinary progress observation");
    assert(report.eta.components.unlock === 100, "ETA row lost its ordinary milestone text signal");

    console.log("9.4.0 M2 NO-DOUBLE-COUNT ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
