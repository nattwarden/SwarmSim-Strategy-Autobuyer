const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  assert(userscript.includes("function executeExactEnergyCoordinatorCandidate"), "canonical runtime is missing the exact Energy execution adapter");
  assert(userscript.includes('executionKey === "energy"'), "canonical coordinator does not dispatch the Energy execution key");
  assert(userscript.includes("buildEnergyProductionProposal(game)"), "exact Energy execution does not rebuild the production proposal at the buy boundary");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.purchaseEvaluator, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const api = window.kbcSwarmBot.purchaseEvaluator;
      const baseRows = [
        {
          lane: "Meat", decision: "BUY", candidate: "Drone", target: "Nest", wouldBuyAmount: "100",
          reason: "target unlock step", score: 50000, blockers: [], costResources: ["meat", "larva"],
          raw: { paybackSeconds: 1500, paybackLimitSeconds: 1800, reserveRatio: 1.2, progressPercent: 30 },
        },
        {
          lane: "Engine", decision: "BUY", candidate: "Hatchery", target: "Hatchery", wouldBuyAmount: "1",
          reason: "improves larva production", score: 50000, blockers: [], costResources: ["meat", "larva"],
          raw: { etaSeconds: 1200, reserveRatio: 1.1, progressPercent: 25 },
        },
        {
          lane: "Territory", decision: "BUY", candidate: "Stinger V", target: "Expansion", wouldBuyAmount: "5",
          reason: "improves Expansion ETA", score: 50000, blockers: [], costResources: ["meat", "larva"],
          raw: { etaBeforeSeconds: 1800, etaImprovementSeconds: 60, reserveRatio: 1.2, progressPercent: 35 },
        },
      ];

      const energyWinner = {
        lane: "Energy", executionKey: "energy", executionId: "moth", executionKind: "unit",
        decision: "BUY", candidate: "Lepidoptera", target: "Nexus ETA", wouldBuyAmount: "5",
        reason: "bounded Lepidoptera improves Nexus ETA", score: 70000, blockers: [], costResources: ["energy"],
        raw: {
          etaBeforeSeconds: 7200,
          etaAfterSeconds: 1800,
          etaImprovementSeconds: 5400,
          reserveRatio: 4,
          progressPercent: 80,
          energyReserveAfter: 4000,
          energyReserveRequired: 1000,
          energyReserveRecoverySeconds: 0,
          energyCapHeadroomAfter: 6000,
          energySecondsToCapAfter: 600,
          energyCapWasteAvoidedAmount: 500,
          cloneLarvaeDelaySeconds: 50,
          houseOfMirrorsDelaySeconds: 20,
          energyProductionGainPercent: 2.5,
          nexusProtectionGate: "pass",
        },
      };

      const winnerEvaluation = api.evaluate([...baseRows, energyWinner]);
      const energyExecution = api.buildExecutionDecision([energyWinner], {
        actionBudget: 1,
        revalidationCandidates: [energyWinner],
      });

      const nexusWinner = {
        ...energyWinner,
        executionId: "nexus5",
        executionKind: "upgrade",
        candidate: "Nexus 5",
        target: "Nexus 5",
        wouldBuyAmount: "1",
        reason: "protected Nexus production target is buyable",
        raw: {
          ...energyWinner.raw,
          nexusProtectionGate: "pass-protected-target",
        },
      };
      const nexusExecution = api.buildExecutionDecision([nexusWinner], {
        actionBudget: 1,
        revalidationCandidates: [nexusWinner],
      });

      const blockedEnergyWinner = {
        ...energyWinner,
        reason: "Nexus protection no longer permits this Energy spend",
        raw: {
          ...energyWinner.raw,
          nexusProtectionGate: "blocked",
        },
      };
      const blockedEnergyExecution = api.buildExecutionDecision([blockedEnergyWinner], {
        actionBudget: 1,
        revalidationCandidates: [blockedEnergyWinner],
      });

      const abilityCandidate = {
        ...energyWinner,
        executionId: "clonelarvae",
        executionKind: "upgrade",
        candidate: "Clone Larvae",
        target: "Clone Larvae",
        wouldBuyAmount: "1",
        reason: "ability candidate must remain outside Energy production authority",
      };
      const abilityExecution = api.buildExecutionDecision([abilityCandidate], {
        actionBudget: 1,
        revalidationCandidates: [abilityCandidate],
      });

      const energyLoser = {
        ...energyWinner,
        reason: "small Energy-production gain",
        score: 100,
        raw: {
          ...energyWinner.raw,
          etaBeforeSeconds: 600,
          etaAfterSeconds: 595,
          etaImprovementSeconds: 5,
          reserveRatio: 1,
          progressPercent: 5,
          energyProductionGainPercent: 0.01,
        },
      };
      const strongTerritoryRows = baseRows.map((row) => row.lane === "Territory" ? {
        ...row,
        raw: { etaBeforeSeconds: 7200, etaAfterSeconds: 1200, etaImprovementSeconds: 6000, reserveRatio: 5, progressPercent: 90 },
      } : row);
      const loserEvaluation = api.evaluate([...strongTerritoryRows, energyLoser]);

      const uncertainEnergy = {
        lane: "Energy", decision: "HOLD", candidate: "Lepidoptera", target: "Nexus ETA", wouldBuyAmount: "5",
        reason: "Nexus protection blocks Energy spending", score: 90000,
        blockers: ["Nexus protection gate"], costResources: ["energy"],
        raw: { nexusProtectionGate: "blocked" },
      };
      const uncertainEvaluation = api.evaluate([...baseRows, uncertainEnergy]);

      const bot = window.kbcSwarmBot;
      bot.config.enabled = true;
      bot.config.smartMode = true;
      bot.config.advisorOnly = true;
      bot.config.autoBuySafeDecisions = false;
      bot.runOnce();
      const inspector = bot.getStrategyInspector?.() || {};

      return {
        winnerEvaluation,
        loserEvaluation,
        uncertainEvaluation,
        energyExecution,
        nexusExecution,
        blockedEnergyExecution,
        abilityExecution,
        inspector,
      };
    });

    const winnerPreview = report.winnerEvaluation.wholeEconomyPreview;
    const winnerEnergy = winnerPreview.domainCandidates.find((row) => row.domain === "Energy production");
    assert(winnerPreview.schemaVersion === "whole-economy-shadow-preview.v2", "M3 preview schema is not v2");
    assert(winnerPreview.mode === "shadow-advisor-only", "M3 Energy comparison left shadow/advisor mode");
    assert(winnerPreview.executionAuthority === false, "M3 Energy comparison gained execution authority");
    assert(winnerPreview.domainCandidates.length === 4, "Energy did not join the four-domain comparison");
    assert(winnerPreview.winner?.domain === "Energy production", "Energy cannot honestly win a focused state");
    assert(winnerEnergy?.sharedOutcome?.schemaVersion === "whole-economy-outcome.v2", "Energy shared outcome contract missing");
    assert(winnerEnergy.sharedOutcome.reserveAfter === 4000, "Energy reserve-after outcome missing");
    assert(winnerEnergy.sharedOutcome.reserveRequired === 1000, "Energy reserve requirement missing");
    assert(winnerEnergy.sharedOutcome.reserveRecoverySeconds === 0, "Energy reserve recovery missing");
    assert(winnerEnergy.sharedOutcome.capWasteAvoidedAmount === 500, "Energy cap-waste outcome missing");
    assert(winnerEnergy.sharedOutcome.cloneLarvaeDelaySeconds === 50, "Clone Larvae delay missing");
    assert(winnerEnergy.sharedOutcome.houseOfMirrorsDelaySeconds === 20, "House of Mirrors delay missing");
    assert(winnerEnergy.sharedOutcome.nexusProtectionGate === "pass", "passing Nexus gate missing");

    assert(report.loserEvaluation.wholeEconomyPreview.winner?.domain === "Army/Territory", "Energy cannot honestly lose a focused state");
    const uncertainRow = report.uncertainEvaluation.wholeEconomyPreview.domainCandidates.find((row) => row.domain === "Energy production");
    assert(uncertainRow?.safeEligible === false, "uncertain Energy state became eligible");
    assert(uncertainRow?.sharedOutcome?.nexusProtectionGate === "blocked", "blocked Nexus gate missing");
    assert(uncertainRow?.confidence === "low", "uncertain Energy state should remain low-confidence");

    assert(report.energyExecution.executionAuthority === true, `passing Lepidoptera winner did not receive bounded Energy-production authority: ${JSON.stringify(report.energyExecution)}`);
    assert(report.energyExecution.revalidationStatus === "passed", "Lepidoptera winner did not pass exact candidate revalidation");
    assert(report.energyExecution.selectedExecutionKey === "energy", "Lepidoptera winner did not retain the Energy execution key");
    assert(report.nexusExecution.executionAuthority === true, "protected Nexus target did not receive bounded Energy-production authority");
    assert(report.nexusExecution.revalidationStatus === "passed", "protected Nexus target did not pass revalidation");

    assert(report.blockedEnergyExecution.executionAuthority === false, "blocked Nexus gate granted Energy execution authority");
    assert(report.blockedEnergyExecution.gatesFailed.join(" ").includes("energy-nexus-protection"), "blocked Nexus gate denial was not observable");
    assert(report.abilityExecution.executionAuthority === false, "Energy ability gained production execution authority");
    assert(report.abilityExecution.gatesFailed.join(" ").includes("energy-production-only"), "ability denial did not preserve the Energy production-only boundary");

    assert(Object.prototype.hasOwnProperty.call(report.inspector, "wholeEconomyEnergyCandidate"), "Inspector missing Energy candidate field");
    assert(Object.prototype.hasOwnProperty.call(report.inspector, "wholeEconomyEnergyNexusGate"), "Inspector missing Nexus gate field");
    assert(Object.prototype.hasOwnProperty.call(report.inspector, "wholeEconomyEnergyReserveRecoverySeconds"), "Inspector missing reserve recovery field");
    assert(Object.prototype.hasOwnProperty.call(report.inspector, "wholeEconomyEnergyCapWasteAvoidedAmount"), "Inspector missing cap-waste field");
    assert(Object.prototype.hasOwnProperty.call(report.inspector, "wholeEconomyEnergyCloneDelaySeconds"), "Inspector missing ability-delay field");
  } finally {
    await browser.close();
  }

  console.log("BOOK00 M3 ENERGY EXECUTION CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
