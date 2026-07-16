#!/usr/bin/env node
"use strict";

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { chromium } = require("playwright");

const PINNED_SAVE_SHA256 = "58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const userscriptPath = path.resolve(__dirname, "..", "src", "SwarmSim-Strategy-Autobuyer.user.js");
  const savePath = path.resolve(__dirname, "..", "docs", "test-data", "clone-ramp", "live-user-save.txt");
  let userscript = fs.readFileSync(userscriptPath, "utf8");
  const saveBytes = fs.readFileSync(savePath);
  const saveSha256 = crypto.createHash("sha256").update(saveBytes).digest("hex");
  assert(saveSha256 === PINNED_SAVE_SHA256, `pinned save hash mismatch: expected ${PINNED_SAVE_SHA256}, got ${saveSha256}`);
  const pinnedSave = saveBytes.toString("utf8").trim();
  const horizonGate = /\s*&& observed\.horizonId === selected\.horizonId\s*&& observed\.horizonSeconds === selected\.horizonSeconds;/;
  assert(horizonGate.test(userscript), "missing fail-closed selected horizon gate");
  if (process.argv.includes("--mutate-horizon-gate")) {
    userscript = userscript.replace(horizonGate, ";");
    assert(!horizonGate.test(userscript), "horizon-gate mutation did not apply");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => localStorage.clear());
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator && !!window.angular, { timeout: 60000 });
    const importResult = await page.evaluate((save) => {
      try {
        const game = window.angular.element(document.body).injector().get("game");
        game.importSave(save);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error?.stack || error?.message || error) };
      }
    }, pinnedSave);
    assert(importResult.ok, `pinned save import failed: ${importResult.error}`);
    await page.waitForTimeout(2000);
    const seededArmy = await page.evaluate(() => {
      const game = window.angular.element(document.body).injector().get("game");
      const affectedUnitIds = ["swarmling", "stinger", "spider", "mosquito", "locust", "roach", "giantspider", "centipede", "wasp", "devourer", "goon"];
      const tiers = [
        { name: "stinger", suffixes: ["v", "5"] },
        { name: "spider", suffixes: ["v", "5"] },
        { name: "mosquito", suffixes: ["v", "5"] },
      ];
      const units = game.unitlist();
      const affected = affectedUnitIds.map((unitId) => {
        const unit = game.unit(unitId);
        if (!unit || typeof unit._setCount !== "function") return { unitId, seeded: false };
        unit._setCount(new window.Decimal(100));
        return { unitId, suffix: unit.suffix || "base", seeded: true, count: String(unit.count()) };
      });
      const preferredTiers = tiers.map(({ name, suffixes }) => {
        const candidates = units.filter((unit) => String(unit?.name || "").toLowerCase() === name);
        const unit = candidates.find((candidate) => suffixes.includes(String(candidate?.suffix || "").toLowerCase()));
        if (!unit || typeof unit._setCount !== "function") {
          return { name, seeded: false, candidates: candidates.map((candidate) => ({ name: candidate?.name, suffix: candidate?.suffix })) };
        }
        unit._setCount(new window.Decimal(100));
        return { name, suffix: unit.suffix, seeded: true, count: String(unit.count()) };
      });
      return [...affected, ...preferredTiers];
    });
    assert(seededArmy.every((row) => row.seeded && Number(row.count) > 0), `real army seeding failed: ${JSON.stringify(seededArmy)}`);

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const territoryProposal = {
        lane: "Territory",
        executionKey: "territory",
        executionId: "swarmling",
        executionKind: "unit",
        executionVariant: "base",
        decision: "BUY",
        candidate: "Swarmling",
        target: "Expansion",
        boundedAmount: "3",
        wouldBuyAmount: "3",
        blockers: [],
        costResources: ["meat", "larva"],
        score: 1,
        reason: "real bounded army chunk improves Expansion ETA",
        raw: {
          metricTarget: "Expansion",
          metricId: "expansion-eta",
          metricUnit: "seconds",
          metricBasis: "milestone-eta-seconds",
          etaBeforeSeconds: 1000,
          etaAfterSeconds: 990,
          etaImprovementSeconds: 10,
        },
      };
      const evaluated = bot.purchaseEvaluator.evaluate([territoryProposal]);
      const abilitySnapshotAt300Seconds = {
        schemaVersion: "energy-ability-timing-advisor.v1",
        snapshotId: "horizon-mismatch-ability",
        snapshotHash: "sha256:horizon-mismatch-ability",
        decisionCycleId: "cycle-horizon-mismatch",
        horizonId: "ability-short",
        horizonSeconds: 300,
        formulaSetId: "energy-ability-source-formulas.v1",
        sourceRevision: "source-verified",
        activeMilestone: "Reach Expansion",
        activeTarget: "Expansion",
        recommendedActionId: "HOUSE_OF_MIRRORS",
        recommendedLabel: "House of Mirrors",
        recommendation: "CAST_NOW",
        confidence: "high",
        branches: [
          {
            actionId: "WAIT",
            milestoneEtaSeconds: 1000,
            milestoneMetricId: "expansion-eta",
            horizonId: "ability-short",
            horizonSeconds: 300,
            formulaSetId: "energy-ability-source-formulas.v1",
            sourceRevision: "source-verified",
            formulaStatus: "source-verified",
            blockers: [],
          },
          {
            actionId: "HOUSE_OF_MIRRORS",
            label: "House of Mirrors",
            milestoneEtaSeconds: 100,
            milestoneMetricId: "expansion-eta",
            horizonId: "ability-short",
            horizonSeconds: 300,
            formulaSetId: "energy-ability-source-formulas.v1",
            sourceRevision: "source-verified",
            formulaStatus: "source-verified",
            blockers: [],
          },
        ],
      };
      const mismatched = bot.strategicCoordinator.evaluate({
        schemaVersion: "six-domain-decision-snapshot.v1",
        snapshotId: "horizon-mismatch-m6",
        snapshotHash: "sha256:horizon-mismatch-m6",
        decisionCycleId: "cycle-horizon-mismatch",
        source: { activeMilestone: "Reach Expansion", activeTarget: "Expansion" },
        horizonId: "medium",
        horizonSeconds: 1800,
        selectedComparisonBasis: "milestone-eta-seconds",
        selectedComparisonMetricId: "expansion-eta",
        selectedComparisonMetricUnit: "seconds",
        purchaseProposalState: { proposals: [territoryProposal], evaluation: evaluated },
        abilitySnapshot: abilitySnapshotAt300Seconds,
        ascensionSnapshot: { recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE", branches: [] },
      });

      bot.scenarioHarness.enable();
      const harness = bot.scenarioHarness.run({
        scenarios: [{
          id: "same-contract-product-pair",
          source: "production-formula-deterministic-state",
          description: "Real production Territory purchase versus source-verified House of Mirrors advisor on Expansion ETA.",
          evaluationCycles: 1,
          smartFocus: "territory",
          overrides: {
            resourceCounts: {
              meat: 22000,
              larva: 1500,
              cocoon: 300,
              territory: 0,
              energy: 1000000,
            },
            resourceVelocities: {
              meat: 0.2,
              larva: 0.1,
              energy: 100,
            },
            armyUnitCounts: {
              "Stinger V": 100,
              "Arachnomorph V": 100,
              "Culicimorph V": 100,
            },
            abilities: {
              clonelarvae: { visible: false },
              houseofmirrors: { visible: true, energyCost: 1 },
              larvarush: { visible: false },
              meatrush: { visible: false },
              territoryrush: { visible: false },
            },
            engine: {
              hatcheryEtaSeconds: 3600,
              expansionEtaSeconds: 9000,
            },
            config: {
              smartMaxActionsPerRun: 1,
              energyStrategy: false,
              energyPlanner: false,
              meatGoalPlanner: false,
              larvaEnginePriority: false,
              prioritizeProductionUpgrades: false,
              expansionArmySeedMinEtaImprovementSeconds: 0,
              expansionArmySeedMinEtaImprovementRatio: 0,
              territoryMinEtaImprovementSeconds: 0,
              territoryMinEtaImprovementRatio: 0,
              energySupportMinMeaningfulBenefit: 0,
              postNexusEnergyReserveSeconds: 0,
            },
          },
        }],
      });
      const inspector = bot.getStrategyInspector();
      const product = inspector?.strategicCoordinator || null;
      const summarize = (outcome) => ({
        domainId: outcome?.domainId || null,
        actionId: outcome?.action?.actionId || null,
        executionKey: outcome?.action?.executionKey || null,
        authorityClass: outcome?.authorityClass || null,
        safety: outcome?.safety?.status || null,
        comparability: outcome?.comparability?.status || null,
        selectionStatus: outcome?.comparability?.selectionStatus || null,
        metricId: outcome?.comparability?.observedMetricId || null,
        metricUnit: outcome?.comparability?.observedMetricUnit || null,
        basis: outcome?.comparability?.observedBasis || null,
        horizonId: outcome?.comparability?.observedHorizonId || null,
        horizonSeconds: outcome?.comparability?.observedHorizonSeconds ?? null,
        commonValue: outcome?.comparability?.commonValue ?? null,
      });
      return {
        mismatch: {
          winner: mismatched.winner?.domainId || null,
          executionAuthority: mismatched.executionAuthority === true,
          comparisonContract: mismatched.comparisonContract,
          territory: summarize(mismatched.domainOutcomes.find((row) => row.domainId === "ARMY_TERRITORY")),
          ability: summarize(mismatched.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES")),
        },
        product: {
          harnessOk: harness?.ok === true,
          activeTarget: product?.activeTarget || null,
          winner: product?.winner?.domainId || null,
          winnerAuthorityClass: product?.winner?.authorityClass || null,
          executionAuthority: product?.executionAuthority === true,
          comparisonContract: product?.comparisonContract || null,
          territory: summarize(product?.domainOutcomes?.find((row) => row.domainId === "ARMY_TERRITORY")),
          ability: summarize(product?.domainOutcomes?.find((row) => row.domainId === "ENERGY_ABILITIES")),
          abilityDetails: (() => {
            const outcome = product?.domainOutcomes?.find((row) => row.domainId === "ENERGY_ABILITIES");
            return {
              reason: outcome?.reason || null,
              calibration: {
                comparabilityStatus: outcome?.calibration?.comparabilityStatus || null,
                formulaStatus: outcome?.calibration?.formulaStatus || null,
                actionValue: outcome?.calibration?.actionValue ?? null,
                baselineValue: outcome?.calibration?.baselineValue ?? null,
                delta: outcome?.calibration?.delta ?? null,
                horizonId: outcome?.calibration?.horizonId || null,
                horizonSeconds: outcome?.calibration?.horizonSeconds ?? null,
              },
              missingConversions: outcome?.comparability?.missingConversions || [],
            };
          })(),
        },
      };
    });

    assert(report.mismatch.winner === "ARMY_TERRITORY", `horizon mismatch beat the aligned purchase: ${JSON.stringify(report.mismatch)}`);
    assert(report.mismatch.territory.selectionStatus === "MATCHED" && report.mismatch.territory.comparability === "COMPARABLE", "aligned Territory control was not comparable");
    assert(report.mismatch.ability.selectionStatus === "MISMATCH" && report.mismatch.ability.comparability === "UNRANKED", `300s ability was not rejected by 1800s contract: ${JSON.stringify(report.mismatch.ability)}`);
    assert(report.mismatch.ability.horizonSeconds === 300, "mismatched ability did not preserve observed 300s provenance");

    assert(report.product.harnessOk, "production-formula scenario harness failed");
    assert(report.product.activeTarget === "Expansion", `production pair used wrong active target: ${JSON.stringify(report.product)}`);
    assert(report.product.comparisonContract?.metricId === "expansion-eta", "production pair used wrong metric id");
    assert(report.product.comparisonContract?.metricUnit === "seconds", "production pair used wrong metric unit");
    assert(report.product.comparisonContract?.basis === "milestone-eta-seconds", "production pair used wrong metric basis");
    assert(report.product.comparisonContract?.horizonId === "medium" && report.product.comparisonContract?.horizonSeconds === 1800, "production pair used wrong selected horizon");
    assert(report.product.territory.executionKey === "territory" && report.product.territory.authorityClass === "BOUNDED_REVERSIBLE", `missing real reversible Territory action: ${JSON.stringify(report.product.territory)}`);
    assert(report.product.territory.selectionStatus === "MATCHED" && report.product.territory.comparability === "COMPARABLE", `production Territory row did not match the contract: ${JSON.stringify(report.product.territory)}`);
    assert(report.product.ability.actionId === "HOUSE_OF_MIRRORS" && report.product.ability.authorityClass === "ADVISOR_ONLY", `production ability row was not House of Mirrors advisor-only: ${JSON.stringify({ ability: report.product.ability, details: report.product.abilityDetails })}`);
    assert(report.product.ability.selectionStatus === "MATCHED" && report.product.ability.comparability === "COMPARABLE", `production House of Mirrors row did not match the contract: ${JSON.stringify({ ability: report.product.ability, details: report.product.abilityDetails })}`);
    assert(report.product.territory.horizonSeconds === 1800 && report.product.ability.horizonSeconds === 1800, "production pair did not share the exact 1800s horizon");
    if (report.product.winnerAuthorityClass === "ADVISOR_ONLY") {
      assert(report.product.executionAuthority === false, "advisor-only winner leaked execution authority");
    }

    console.log("9.4.0 SAME-CONTRACT PRODUCT PAIR ACCEPTANCE PASSED");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
