#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
  let userscript = fs.readFileSync(userscriptPath, "utf8");
  const targetGate = "const comparable = targetAligned && metricShapeAligned && Number.isFinite(comparability.value);";
  assert(userscript.includes(targetGate), "missing fail-closed target-alignment gate");

  if (process.env.KBC_MUTATE_TARGET_ALIGNMENT === "1" || process.argv.includes("--mutate-target-gate")) {
    userscript = userscript.replace(targetGate, "const comparable = metricShapeAligned && Number.isFinite(comparability.value);");
    assert(!userscript.includes(targetGate), "target-alignment mutation did not apply");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const proposal = ({ lane, candidate, target, metricTarget, metricId, etaImprovementSeconds }) => ({
        lane,
        executionKey: lane.toLowerCase(),
        executionId: candidate.toLowerCase().replace(/[^a-z0-9]+/g, ""),
        executionKind: lane === "Engine" ? "upgrade" : "unit",
        executionVariant: "base",
        decision: "BUY",
        candidate,
        target,
        boundedAmount: "1",
        wouldBuyAmount: "1",
        blockers: [],
        costResources: ["meat"],
        score: 1,
        reason: `safe ${candidate} purchase`,
        raw: {
          metricTarget,
          metricId,
          metricUnit: "seconds",
          metricBasis: "milestone-eta-seconds",
          etaImprovementSeconds,
          paybackSeconds: 10,
          reserveRatio: 2,
          progressPercent: 50,
        },
      });
      const meat = proposal({
        lane: "Meat",
        candidate: "Drone",
        target: "Lesser Hive Mind",
        metricTarget: "Lesser Hive Mind",
        // Deliberately reuse the selected metric id so this verifier isolates
        // target identity from the separate id/unit/basis gate.
        metricId: "expansion-eta",
        etaImprovementSeconds: 1000,
      });
      const engine = proposal({
        lane: "Engine",
        candidate: "Expansion",
        target: "Expansion",
        metricTarget: "Expansion",
        metricId: "expansion-eta",
        etaImprovementSeconds: 10,
      });

      const evaluate = (proposals, suffix) => {
        const purchaseEvaluation = bot.purchaseEvaluator.evaluate(proposals);
        const m6 = bot.strategicCoordinator.evaluate({
          schemaVersion: "six-domain-decision-snapshot.v1",
          snapshotId: `target-alignment-${suffix}`,
          snapshotHash: `sha256:target-alignment-${suffix}`,
          decisionCycleId: `cycle-${suffix}`,
          source: { activeMilestone: "Reach Expansion", activeTarget: "Expansion" },
          horizonId: "medium",
          horizonSeconds: 1800,
          selectedComparisonBasis: "milestone-eta-seconds",
          selectedComparisonMetricId: "expansion-eta",
          selectedComparisonMetricUnit: "seconds",
          purchaseProposalState: { proposals, evaluation: purchaseEvaluation },
          abilitySnapshot: { recommendedActionId: "WAIT", recommendation: "SAVE", branches: [] },
          ascensionSnapshot: { recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE", branches: [] },
        });
        return {
          m2Winner: purchaseEvaluation.winner ? `${purchaseEvaluation.winner.lane}:${purchaseEvaluation.winner.candidate}` : null,
          m6Winner: m6.winner ? `${m6.winner.domainId}:${m6.winner.action?.label}` : null,
          executionAuthority: m6.executionAuthority === true,
          recommendation: m6.recommendation,
          purchases: m6.domainOutcomes.slice(0, 4).map((outcome) => ({
            domainId: outcome.domainId,
            proposalTarget: outcome.context?.proposalTarget || null,
            metricTarget: outcome.context?.metricTarget || null,
            activeTarget: outcome.context?.activeTarget || null,
            alignment: outcome.comparability?.targetAlignmentStatus || null,
            comparability: outcome.comparability?.status || null,
          })),
        };
      };

      return {
        competing: evaluate([meat, engine], "competing"),
        mismatchOnly: evaluate([meat], "mismatch-only"),
        alignedOnly: evaluate([engine], "aligned-only"),
      };
    });

    const competingMeat = report.competing.purchases.find((row) => row.domainId === "MEAT");
    const competingEngine = report.competing.purchases.find((row) => row.domainId === "LARVA_ENGINE");
    assert(report.competing.m2Winner === "Meat:Drone", `control did not produce the known M2 mismatch winner: ${JSON.stringify(report.competing)}`);
    assert(report.competing.m6Winner === "LARVA_ENGINE:Expansion", `M6 did not reject the stronger off-target metric: ${JSON.stringify(report.competing)}`);
    assert(competingMeat?.alignment === "MISMATCH" && competingMeat?.comparability === "UNRANKED", "off-target Meat metric remained rankable");
    assert(competingEngine?.alignment === "MATCHED" && competingEngine?.comparability === "COMPARABLE", "aligned Engine metric was not rankable");
    assert(report.mismatchOnly.m6Winner === null && report.mismatchOnly.executionAuthority === false, "off-target-only input produced M6 authority");
    assert(report.alignedOnly.m6Winner === "LARVA_ENGINE:Expansion" && report.alignedOnly.executionAuthority === true, "aligned-only input did not retain bounded M6 authority");

    console.log("9.4.0 TARGET ALIGNMENT ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
