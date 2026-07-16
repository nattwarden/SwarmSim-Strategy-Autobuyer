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
  const basisGate = ".map((outcome) => enforceSixDomainSelectedComparisonContract(outcome, selectedComparisonContract))";
  assert(userscript.includes(basisGate), "missing fail-closed selected comparison-contract gate");
  if (process.argv.includes("--mutate-basis-gate")) {
    userscript = userscript.replace(basisGate, ".map((outcome) => outcome)");
    assert(!userscript.includes(basisGate), "comparison-contract mutation did not apply");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const proposal = ({ lane, candidate, metricId, metricUnit, metricBasis, raw }) => ({
        lane,
        executionKey: lane.toLowerCase(),
        executionId: candidate.toLowerCase().replace(/[^a-z0-9]+/g, ""),
        executionKind: lane === "Engine" ? "upgrade" : "unit",
        executionVariant: "base",
        decision: "BUY",
        candidate,
        target: "Expansion",
        boundedAmount: "1",
        wouldBuyAmount: "1",
        blockers: [],
        costResources: ["meat"],
        score: 1,
        reason: `safe ${candidate} purchase toward Expansion`,
        raw: {
          metricTarget: "Expansion",
          metricId,
          metricUnit,
          metricBasis,
          paybackSeconds: 10,
          reserveRatio: 2,
          progressPercent: 50,
          ...raw,
        },
      });
      const completion = proposal({
        lane: "Engine",
        candidate: "Expansion",
        metricId: "expansion-completion",
        metricUnit: "percent",
        metricBasis: "same-unit-milestone-progress-delta",
        raw: { etaSeconds: 0, projectedMilestoneProgressDelta: 100 },
      });
      const eta = proposal({
        lane: "Territory",
        candidate: "Swarmling",
        metricId: "expansion-eta",
        metricUnit: "seconds",
        metricBasis: "milestone-eta-seconds",
        raw: { etaImprovementSeconds: 10 },
      });

      const evaluate = (proposals, suffix, includeContract = true) => {
        const purchaseEvaluation = bot.purchaseEvaluator.evaluate(proposals);
        const m6 = bot.strategicCoordinator.evaluate({
          schemaVersion: "six-domain-decision-snapshot.v1",
          snapshotId: `metric-basis-${suffix}`,
          snapshotHash: `sha256:metric-basis-${suffix}`,
          decisionCycleId: `cycle-${suffix}`,
          source: { activeMilestone: "Reach Expansion", activeTarget: "Expansion" },
          horizonId: "medium",
          horizonSeconds: 1800,
          ...(includeContract ? {
            selectedComparisonBasis: "milestone-eta-seconds",
            selectedComparisonMetricId: "expansion-eta",
            selectedComparisonMetricUnit: "seconds",
          } : {}),
          purchaseProposalState: { proposals, evaluation: purchaseEvaluation },
          abilitySnapshot: { recommendedActionId: "WAIT", recommendation: "SAVE", branches: [] },
          ascensionSnapshot: { recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE", branches: [] },
        });
        return {
          m2Winner: purchaseEvaluation.winner ? `${purchaseEvaluation.winner.lane}:${purchaseEvaluation.winner.candidate}` : null,
          m6Winner: m6.winner ? `${m6.winner.domainId}:${m6.winner.action?.label}` : null,
          executionAuthority: m6.executionAuthority === true,
          comparisonContract: m6.comparisonContract,
          purchases: m6.domainOutcomes.slice(0, 4).map((outcome) => ({
            domainId: outcome.domainId,
            status: outcome.comparability?.status || null,
            selectionStatus: outcome.comparability?.selectionStatus || null,
            observedMetricId: outcome.comparability?.observedMetricId || null,
            observedMetricUnit: outcome.comparability?.observedMetricUnit || null,
            observedBasis: outcome.comparability?.observedBasis || null,
            selectedMetricId: outcome.comparability?.selectedMetricId || null,
            selectedMetricUnit: outcome.comparability?.selectedMetricUnit || null,
            selectedBasis: outcome.comparability?.selectedBasis || null,
          })),
        };
      };

      return {
        competing: evaluate([completion, eta], "competing"),
        completionOnly: evaluate([completion], "completion-only"),
        etaOnly: evaluate([eta], "eta-only"),
        missingContract: evaluate([eta], "missing-contract", false),
      };
    });

    const completion = report.competing.purchases.find((row) => row.domainId === "LARVA_ENGINE");
    const eta = report.competing.purchases.find((row) => row.domainId === "ARMY_TERRITORY");
    assert(report.competing.m2Winner === "Territory:Swarmling", `M2 still preferred the formerly double-counted completion row: ${JSON.stringify(report.competing)}`);
    assert(report.competing.m6Winner === "ARMY_TERRITORY:Swarmling", `M6 compared completion points against ETA seconds: ${JSON.stringify(report.competing)}`);
    assert(completion?.selectionStatus === "MISMATCH" && completion?.status === "UNRANKED", "completion metric remained rankable under the ETA contract");
    assert(eta?.selectionStatus === "MATCHED" && eta?.status === "COMPARABLE", "Expansion ETA metric did not match its selected contract");
    assert(report.completionOnly.m6Winner === null && report.completionOnly.executionAuthority === false, "completion-only input received ETA authority");
    assert(report.etaOnly.m6Winner === "ARMY_TERRITORY:Swarmling" && report.etaOnly.executionAuthority === true, "honest ETA-only input lost bounded authority");
    assert(report.missingContract.m6Winner === null && report.missingContract.executionAuthority === false, "missing cycle comparison contract did not fail closed");

    console.log("9.4.0 METRIC BASIS INTEGRITY ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
