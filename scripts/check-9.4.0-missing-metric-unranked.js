#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8").replace(/\r\n/g, "\n");
  if (process.env.KBC_MUTATE_MISSING_METRIC_ZERO === "1") {
    const needle = "sixDomainHasFiniteMetric(outcome?.outcome?.etaImprovementSeconds)\n        ? Number(outcome.outcome.etaImprovementSeconds)\n        : NaN;";
    assert(userscript.includes(needle), "missing-metric mutation needle missing");
    userscript = userscript.replace(needle, "Number(outcome?.outcome?.etaImprovementSeconds);");
  }

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator, { timeout: 120000 });

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const specs = [
        ["Meat", "meat", "drone", "Drone", null],
        ["Engine", "engine", "hatchery", "Hatchery", undefined],
        ["Territory", "territory", "stinger", "Stinger V", ""],
        ["Energy", "energy", "moth", "Lepidoptera", null],
      ];
      const proposal = ([lane, executionKey, executionId, candidate, etaImprovementSeconds]) => ({
        lane,
        executionKey,
        executionId,
        executionKind: lane === "Engine" ? "upgrade" : "unit",
        executionVariant: "base",
        decision: "BUY",
        candidate,
        target: "shared target",
        boundedAmount: "1",
        wouldBuyAmount: "1",
        blockers: [],
        costResources: [],
        reason: "safe representative purchase",
        raw: { metricTarget: "shared target", etaSeconds: 600, etaImprovementSeconds, paybackSeconds: 10, reserveRatio: 2, progressPercent: 50 },
      });
      const evaluate = (proposals, suffix) => {
        const evaluation = bot.purchaseEvaluator.evaluate(proposals);
        return {
          m2Winner: evaluation.winner ? `${evaluation.winner.lane}:${evaluation.winner.candidate}` : null,
          m6: bot.strategicCoordinator.evaluate({
            snapshotId: `missing-metric-${suffix}`,
            snapshotHash: `sha256:missing-metric-${suffix}`,
            decisionCycleId: `cycle-${suffix}`,
            source: { activeMilestone: "shared milestone", activeTarget: "shared target" },
            horizonId: "medium",
            horizonSeconds: 1800,
            purchaseProposalState: { proposals, evaluation },
            abilitySnapshot: { recommendedActionId: "WAIT", recommendation: "SAVE", branches: [] },
            ascensionSnapshot: { recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE", branches: [] },
          }),
        };
      };
      const missing = evaluate(specs.map(proposal), "absent");
      const explicitZero = evaluate([proposal(["Territory", "territory", "stinger", "Stinger V", 0])], "zero");
      const positive = evaluate([proposal(["Territory", "territory", "stinger", "Stinger V", 120])], "positive");
      const compact = (result) => ({
        m2Winner: result.m2Winner,
        winner: result.m6.winner?.domainId || null,
        recommendation: result.m6.recommendation,
        executionAuthority: result.m6.executionAuthority === true,
        purchases: result.m6.domainOutcomes.slice(0, 4).map((outcome) => ({
          domainId: outcome.domainId,
          status: outcome.comparability?.status,
          basis: outcome.comparability?.basis || null,
          value: outcome.outcome?.milestoneEtaImprovementSeconds ?? null,
        })),
      });
      return { missing: compact(missing), explicitZero: compact(explicitZero), positive: compact(positive) };
    });

    assert(report.missing.m2Winner === "Meat:Drone", "missing-metric fixture did not retain the M2 control winner");
    assert(report.missing.purchases.every((row) => row.status === "UNRANKED" && row.basis === null && row.value === null), "missing metrics were not kept unranked");
    assert(report.missing.winner === null && report.missing.recommendation === "UNCERTAIN" && report.missing.executionAuthority === false, "missing metrics produced an M6 winner or authority");
    const zeroTerritory = report.explicitZero.purchases.find((row) => row.domainId === "ARMY_TERRITORY");
    assert(zeroTerritory?.status === "COMPARABLE" && zeroTerritory?.value === 0, "explicit numeric zero stopped being comparable");
    assert(report.explicitZero.winner === "ARMY_TERRITORY" && report.explicitZero.executionAuthority === true, "explicit-zero control lost its bounded reversible winner");
    const positiveTerritory = report.positive.purchases.find((row) => row.domainId === "ARMY_TERRITORY");
    assert(positiveTerritory?.status === "COMPARABLE" && positiveTerritory?.value === 120, "positive Territory ETA control changed");
    assert(report.positive.winner === "ARMY_TERRITORY" && report.positive.executionAuthority === true, "positive Territory control lost authority");
    console.log(JSON.stringify({ status: "PASS", ...report }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
