const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readUserscript() {
  return fs.readFileSync(USERSCRIPT_PATH, "utf8");
}

async function main() {
  const userscript = readUserscript();
  for (const expected of [
    'const SIX_DOMAIN_STRATEGIC_COORDINATOR_SCHEMA_VERSION = "six-domain-strategic-coordinator.v1"',
    'strategicCoordinator: {',
    'getCouncilUiState()',
    'captureSixDomainDecisionSnapshot(game, strategyContext = {})',
    'evaluateSixDomainStrategicCoordinator(inputSnapshot = {})',
    'buildSixDomainExecutionPlan(result, purchaseProposalState)',
    'applySixDomainExecutionRevalidation(plan, freshProposalState, freshCycle)',
  ]) {
    assert(userscript.includes(expected), `missing M6 runtime surface: ${expected}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const api = window.kbcSwarmBot.strategicCoordinator;
      const bot = window.kbcSwarmBot;
      const manifest = api.domainManifest();

      function clone(value) {
        return JSON.parse(JSON.stringify(value));
      }

      function buildPurchaseRow(lane, candidate, etaImprovementSeconds, options = {}) {
        return {
          lane,
          candidate,
          decision: options.decision || "BUY",
          safeEligible: options.safeEligible !== undefined ? options.safeEligible : true,
          blockers: options.blockers ? options.blockers.slice() : [],
          blockerCategories: options.blockerCategories ? options.blockerCategories.slice() : [],
          observations: options.observations ? options.observations.slice() : [],
          score: options.score || 1,
          reason: options.reason || `${candidate} opportunity`,
          target: options.target || candidate,
          resource: options.resource || "meat",
          wouldBuyAmount: options.wouldBuyAmount || "1",
          boundedAmount: options.boundedAmount || options.wouldBuyAmount || "1",
          amount: options.amount || "1",
          executionKey: options.executionKey || lane.toLowerCase(),
          executionId: options.executionId || candidate.toLowerCase().replace(/[^a-z0-9]+/g, ""),
          executionKind: options.executionKind || (options.isUpgrade ? "upgrade" : "unit"),
          executionVariant: options.executionVariant || "base",
          fingerprint: options.fingerprint || `${lane}:${candidate}`,
          costResources: options.costResources ? options.costResources.slice() : ["meat"],
          sharedOutcome: options.sharedOutcome || (etaImprovementSeconds === null ? {} : { etaImprovementSeconds }),
          confidence: options.confidence || "high",
          raw: options.raw || (etaImprovementSeconds === null ? {} : { etaImprovementSeconds }),
          effects: options.effects ? clone(options.effects) : undefined,
        };
      }

      function buildAbilitySnapshot(options = {}) {
        return {
          schemaVersion: "energy-ability-timing-advisor.v1",
          snapshotId: options.snapshotId || "M6-ABILITY",
          activeMilestone: options.activeMilestone || "M6 capability",
          activeTarget: options.activeTarget || "current strategic target",
          recommendation: options.recommendation || "CAST_NOW",
          recommendedActionId: options.recommendedActionId || "MEAT_RUSH",
          recommendedLabel: options.recommendedLabel || "Meat Rush",
          confidence: options.confidence || "high",
          reason: options.reason || "ability comparison",
          reconsiderCondition: options.reconsiderCondition || "Reconsider when the ability conversion changes.",
          energyOpportunityCost: options.energyOpportunityCost || "none",
          bestNonCastAlternative: options.bestNonCastAlternative || { actionId: "WAIT", label: "Save Energy" },
          excludedActionIds: options.excludedActionIds || ["SWARMWARP"],
          branches: options.branches || [
            {
              actionId: "WAIT",
              label: "Save Energy",
              milestoneEtaSeconds: options.waitMilestoneEtaSeconds ?? 1000,
              milestoneMetricId: "expansion-eta",
              metricId: "expansion-eta",
              metricUnit: "seconds",
              direction: "LOWER_IS_BETTER",
              formulaStatus: "runtime-derived",
              opportunityCost: "none",
            },
            {
              actionId: options.recommendedActionId || "MEAT_RUSH",
              label: options.recommendedLabel || "Meat Rush",
              milestoneEtaSeconds: options.actionMilestoneEtaSeconds ?? 100,
              milestoneMetricId: "expansion-eta",
              metricId: "expansion-eta",
              metricUnit: "seconds",
              direction: "LOWER_IS_BETTER",
              formulaStatus: "runtime-derived",
              opportunityCost: options.opportunityCost || "delay to another aligned ability",
            },
          ],
          milestoneEtaImprovementSeconds: options.milestoneEtaImprovementSeconds,
          sharedComparableValue: options.sharedComparableValue,
        };
      }

      function buildAscensionSnapshot(options = {}) {
        return {
          schemaVersion: "ascension-mutagen-advisor.v1",
          snapshotId: options.snapshotId || "M6-ASCENSION",
          activeMilestone: options.activeMilestone || "M6 capability",
          activeTarget: options.activeTarget || "next run horizon",
          recommendation: options.recommendation || "ASCEND_NOW",
          recommendedActionId: options.recommendedActionId || "ASCEND_NOW",
          confidence: options.confidence || "medium",
          reason: options.reason || "ascension comparison",
          reconsiderCondition: options.reconsiderCondition || "Reconsider when recovery evidence changes.",
          breakEvenSeconds: options.breakEvenSeconds,
          currentRunOpportunityCost: options.currentRunOpportunityCost || "current run opportunity",
          nextRunHorizonSeconds: options.nextRunHorizonSeconds || 1800,
          projectedMilestoneProgressDelta: options.projectedMilestoneProgressDelta,
          branches: options.branches || [
            {
              actionId: "CONTINUE_RUN",
              label: "Continue Run",
              projectedMilestoneProgressDelta: options.continueDelta || 0,
            },
            {
              actionId: options.recommendedActionId || "ASCEND_NOW",
              label: "Ascend Now",
              projectedMilestoneProgressDelta: options.projectedMilestoneProgressDelta || 250,
            },
          ],
        };
      }

      function buildSnapshot(options = {}) {
        return {
          schemaVersion: "six-domain-decision-snapshot.v1",
          snapshotId: options.snapshotId || "M6-BASE",
          snapshotHash: options.snapshotHash || `sha256:${options.snapshotId || "M6-BASE"}`,
          decisionCycleId: options.decisionCycleId || "cycle-1",
          source: {
            scriptVersion: "6.0.0",
            activeMilestone: options.activeMilestone || "Milestone 6",
            activeTarget: options.activeTarget || "next strategic milestone",
          },
          horizonId: options.horizonId || "medium",
          horizonSeconds: options.horizonSeconds || 1800,
          horizons: options.horizons || [
            { horizonId: "short", horizonSeconds: 300 },
            { horizonId: "medium", horizonSeconds: 1800 },
            { horizonId: "long", horizonSeconds: 7200 },
          ],
          purchaseRows: options.purchaseRows || [],
          purchaseProposalState: options.purchaseProposalState || undefined,
          abilitySnapshot: options.abilitySnapshot || buildAbilitySnapshot({ recommendedActionId: "WAIT", recommendation: "SAVE", milestoneEtaImprovementSeconds: null, sharedComparableValue: null }),
          ascensionSnapshot: options.ascensionSnapshot || buildAscensionSnapshot({ recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE_RUN", breakEvenSeconds: null, projectedMilestoneProgressDelta: null }),
          selectedMainAction: options.selectedMainAction || null,
          selectedComparisonBasis: options.selectedComparisonBasis || "milestone-eta-seconds",
          manifest,
        };
      }

      const stateBefore = JSON.stringify(bot.getStrategyInspector?.() || null);

      const meatWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-MEAT",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 120, { executionKey: "meat", executionId: "drone", target: "Nest", costResources: ["meat", "larva"], confidence: "high" }),
          buildPurchaseRow("Engine", "Hatchery", 80),
          buildPurchaseRow("Territory", "Stinger V", 60),
          buildPurchaseRow("Energy", "Nexus 5", 10),
        ],
        abilitySnapshot: buildAbilitySnapshot({ recommendedActionId: "WAIT", recommendation: "SAVE", milestoneEtaImprovementSeconds: null, sharedComparableValue: null }),
        ascensionSnapshot: buildAscensionSnapshot({ recommendedActionId: "CONTINUE_RUN", recommendation: "CONTINUE_RUN", breakEvenSeconds: null, projectedMilestoneProgressDelta: null }),
      }));

      const larvaWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-LARVA",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 10),
          buildPurchaseRow("Engine", "Hatchery", 300, { executionKey: "engine", executionId: "hatchery", executionKind: "upgrade", isUpgrade: true, target: "Hatchery" }),
          buildPurchaseRow("Territory", "Stinger V", 40),
          buildPurchaseRow("Energy", "Nexus 5", 5),
        ],
      }));

      const territoryWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-TERRITORY",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 20),
          buildPurchaseRow("Engine", "Hatchery", 30),
          buildPurchaseRow("Territory", "Stinger V", 500, { executionKey: "territory", executionId: "stinger", target: "Expansion", costResources: ["meat", "larva"], confidence: "high" }),
          buildPurchaseRow("Energy", "Nexus 5", 15),
        ],
      }));

      const energyWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-ENERGY",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 20),
          buildPurchaseRow("Engine", "Hatchery", 30),
          buildPurchaseRow("Territory", "Stinger V", 40),
          buildPurchaseRow("Energy", "Nexus 5", 600, { executionKey: "energy", executionId: "nexus5", executionKind: "upgrade", isUpgrade: true, target: "Nexus" }),
        ],
      }));

      const abilityWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-ABILITY",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 20),
          buildPurchaseRow("Engine", "Hatchery", 30),
          buildPurchaseRow("Territory", "Stinger V", 40),
          buildPurchaseRow("Energy", "Nexus 5", 50),
        ],
        abilitySnapshot: buildAbilitySnapshot({
          snapshotId: "M6-ABILITY-WIN",
          recommendedActionId: "MEAT_RUSH",
          recommendedLabel: "Meat Rush",
          recommendation: "CAST_NOW",
          confidence: "high",
          waitMilestoneEtaSeconds: 1000,
          actionMilestoneEtaSeconds: 100,
          reason: "ability branch wins the shared comparison",
        }),
      }));

      const ascensionWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-ASCENSION",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 20),
          buildPurchaseRow("Engine", "Hatchery", 30),
          buildPurchaseRow("Territory", "Stinger V", 40),
          buildPurchaseRow("Energy", "Nexus 5", 50),
        ],
        ascensionSnapshot: buildAscensionSnapshot({
          snapshotId: "M6-ASCEND-WIN",
          recommendation: "ASCEND_NOW",
          recommendedActionId: "ASCEND_NOW",
          confidence: "medium",
          breakEvenSeconds: 90,
          projectedMilestoneProgressDelta: 950,
          reason: "ascension branch wins the shared comparison",
        }),
      }));

      const blockedWin = api.evaluate(buildSnapshot({
        snapshotId: "M6-BLOCKED",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 120, { blockers: ["save window"], safeEligible: false, confidence: "high" }),
          buildPurchaseRow("Engine", "Hatchery", 80, { confidence: "high" }),
          buildPurchaseRow("Territory", "Stinger V", 60, { confidence: "high" }),
          buildPurchaseRow("Energy", "Nexus 5", 40, { confidence: "high" }),
        ],
      }));

      const unranked = api.evaluate(buildSnapshot({
        snapshotId: "M6-UNRANKED",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Engine", "Hatchery", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Territory", "Stinger V", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Energy", "Nexus 5", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
        ],
        abilitySnapshot: buildAbilitySnapshot({
          snapshotId: "M6-UNRANKED-ABILITY",
          recommendedActionId: "WAIT",
          recommendation: "SAVE",
          milestoneEtaImprovementSeconds: null,
          sharedComparableValue: null,
          confidence: "low",
        }),
        ascensionSnapshot: buildAscensionSnapshot({
          snapshotId: "M6-UNRANKED-ASCENSION",
          recommendedActionId: "CONTINUE_RUN",
          recommendation: "UNCERTAIN",
          breakEvenSeconds: null,
          projectedMilestoneProgressDelta: null,
          confidence: "low",
          branches: [
            { actionId: "CONTINUE_RUN", label: "Continue Run", projectedMilestoneProgressDelta: null },
            { actionId: "ASCEND_NOW", label: "Ascend Now", projectedMilestoneProgressDelta: null },
          ],
        }),
      }));

      const duplicateEffects = api.evaluate(buildSnapshot({
        snapshotId: "M6-DUPLICATE-EFFECTS",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 200, {
            effects: [
              {
                schemaVersion: "strategic-effect.v1",
                effectId: "dup-effect",
                sourceActionId: "Drone",
                sourceDomainId: "MEAT",
                causalRole: "FINAL",
                metric: "milestoneEtaImprovementSeconds",
                unit: "seconds",
                horizonId: "medium",
                delta: "25",
                includedInRanking: true,
                derivedFromEffectIds: [],
                provenance: "fixture",
              },
              {
                schemaVersion: "strategic-effect.v1",
                effectId: "dup-effect",
                sourceActionId: "Drone",
                sourceDomainId: "MEAT",
                causalRole: "FINAL",
                metric: "milestoneEtaImprovementSeconds",
                unit: "seconds",
                horizonId: "medium",
                delta: "25",
                includedInRanking: true,
                derivedFromEffectIds: [],
                provenance: "fixture",
              },
            ],
          }),
          buildPurchaseRow("Engine", "Hatchery", 40),
          buildPurchaseRow("Territory", "Stinger V", 30),
          buildPurchaseRow("Energy", "Nexus 5", 20),
        ],
      }));

      const sharedCosts = api.evaluate(buildSnapshot({
        snapshotId: "M6-SHARED-COSTS",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 120, { costResources: ["meat", "larva"], sharedOutcome: { etaImprovementSeconds: 120 } }),
          buildPurchaseRow("Engine", "Hatchery", 110, { costResources: ["meat", "larva"], sharedOutcome: { etaImprovementSeconds: 110 } }),
          buildPurchaseRow("Territory", "Stinger V", 20, { costResources: ["meat"], sharedOutcome: { etaImprovementSeconds: 20 } }),
          buildPurchaseRow("Energy", "Nexus 5", 10, { costResources: ["energy"], sharedOutcome: { etaImprovementSeconds: 10 } }),
        ],
      }));

      const unsupportedAbility = api.evaluate(buildSnapshot({
        snapshotId: "M6-SWARMWARP",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Engine", "Hatchery", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Territory", "Stinger V", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Energy", "Nexus 5", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
        ],
        abilitySnapshot: buildAbilitySnapshot({
          snapshotId: "M6-SWARMWARP-ABILITY",
          recommendedActionId: "SWARMWARP",
          recommendedLabel: "Swarmwarp",
          recommendation: "CAST_NOW",
          confidence: "medium",
          reason: "unsupported Swarmwarp should stay safe",
          excludedActionIds: ["SWARMWARP"],
        }),
      }));

      const executionRows = [
        buildPurchaseRow("Meat", "Drone", 300, {
          executionKey: "meat",
          executionId: "drone",
          executionKind: "unit",
          target: "Nest",
          boundedAmount: "1",
          wouldBuyAmount: "1",
          sharedOutcome: {
            etaSeconds: 600,
            etaImprovementSeconds: 300,
            paybackSeconds: 10,
            reserveAfter: "100",
            reserveRequired: "10",
            reserveRecoverySeconds: 5,
          },
          raw: { etaSeconds: 600, etaImprovementSeconds: 300, paybackSeconds: 10, reserveAfter: 100, reserveRequired: 10 },
        }),
      ];
      const executionState = { proposals: executionRows, evaluation: bot.purchaseEvaluator.evaluate(executionRows) };
      const executionResult = api.evaluate(buildSnapshot({ snapshotId: "M6-EXECUTION", purchaseRows: executionRows }));
      const executionPlan = api.buildExecutionPlan(executionResult, executionState);
      const executionContext = {
        decisionCycleId: executionResult.decisionCycleId,
        snapshotId: executionResult.snapshotId,
        activeTarget: executionResult.activeTarget,
      };
      const revalidatedExecutionPlan = api.revalidateExecutionPlan(executionPlan, executionState, executionContext);
      const cycleDriftPlan = api.revalidateExecutionPlan(executionPlan, executionState, { ...executionContext, decisionCycleId: "different-cycle" });
      const evaluatedIdentityResult = api.evaluate(buildSnapshot({
        snapshotId: "M6-EVALUATED-IDENTITY",
        purchaseRows: [],
        purchaseProposalState: executionState,
      }));
      const evaluatedIdentityPlan = api.buildExecutionPlan(evaluatedIdentityResult, executionState);

      const driftRows = clone(executionRows);
      driftRows[0].boundedAmount = "2";
      driftRows[0].wouldBuyAmount = "2";
      driftRows[0].amount = "2";
      const driftState = { proposals: driftRows, evaluation: bot.purchaseEvaluator.evaluate(driftRows) };
      const fingerprintDriftPlan = api.revalidateExecutionPlan(executionPlan, driftState, executionContext);

      const mismatchRows = [
        buildPurchaseRow("Engine", "Hatchery", 400, {
          executionKey: "engine",
          executionId: "hatchery",
          executionKind: "upgrade",
          target: "Hatchery",
          sharedOutcome: { etaSeconds: 600, etaImprovementSeconds: 400, paybackSeconds: 10, reserveAfter: "100", reserveRequired: "10", reserveRecoverySeconds: 5 },
          raw: { etaSeconds: 600, etaImprovementSeconds: 400, paybackSeconds: 10, reserveAfter: 100, reserveRequired: 10 },
        }),
      ];
      const mismatchState = { proposals: mismatchRows, evaluation: bot.purchaseEvaluator.evaluate(mismatchRows) };
      const mismatchedWinnerPlan = api.buildExecutionPlan(executionResult, mismatchState);
      const advisorWinnerPlan = api.buildExecutionPlan(abilityWin, executionState);

      const zeroBeatsNegative = api.evaluate(buildSnapshot({
        snapshotId: "M6-ZERO-VS-NEGATIVE",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 0),
          buildPurchaseRow("Engine", "Hatchery", -1),
          buildPurchaseRow("Territory", "Stinger V", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
          buildPurchaseRow("Energy", "Nexus 5", null, { sharedOutcome: {}, raw: {}, confidence: "low" }),
        ],
        abilitySnapshot: buildAbilitySnapshot({ recommendedActionId: "WAIT", recommendation: "SAVE", milestoneEtaImprovementSeconds: null, sharedComparableValue: null }),
        ascensionSnapshot: buildAscensionSnapshot({ recommendedActionId: "CONTINUE_RUN", recommendation: "UNCERTAIN", breakEvenSeconds: null, projectedMilestoneProgressDelta: null, branches: [] }),
      }));

      const stateAfter = JSON.stringify(bot.getStrategyInspector?.() || null);

      bot.config.enabled = true;
      bot.config.advisorOnly = true;
      bot.config.autoBuySafeDecisions = false;
      bot.runOnce();

      const liveInspector = bot.getStrategyInspector?.() || null;
      const liveCouncilUiState = bot.getCouncilUiState?.() || null;
      const councilText = document.querySelector("#kbc-swarmbot-strategy-bar")?.innerText || "";
      bot.config.councilUi = false;
      bot.runOnce();
      const matrixText = document.querySelector("#kbc-swarmbot-strategy-bar")?.innerText || "";
      bot.config.councilUi = true;

      return {
        manifest,
        coverage: api.coverage(),
        councilUiState: liveCouncilUiState,
        inspector: liveInspector,
        councilText,
        matrixText,
        stateBefore,
        stateAfter,
        results: {
          meatWin,
          larvaWin,
          territoryWin,
          energyWin,
          abilityWin,
          ascensionWin,
          blockedWin,
          unranked,
          duplicateEffects,
          sharedCosts,
          unsupportedAbility,
          zeroBeatsNegative,
        },
        execution: {
          executionPlan,
          revalidatedExecutionPlan,
          cycleDriftPlan,
          evaluatedIdentityResult,
          evaluatedIdentityPlan,
          fingerprintDriftPlan,
          mismatchedWinnerPlan,
          advisorWinnerPlan,
        },
        regression: {
          purchaseEvaluator: !!bot.purchaseEvaluator,
          abilityTimingAdvisor: !!bot.abilityTimingAdvisor,
          ascensionMutagenAdvisor: !!bot.ascensionMutagenAdvisor,
          hasGetStrategyInspector: typeof bot.getStrategyInspector === "function",
          hasGetCouncilUiState: typeof bot.getCouncilUiState === "function",
          hasStrategicCoordinatorEvaluate: typeof bot.strategicCoordinator?.evaluate === "function",
          hasStrategicCoordinatorManifest: typeof bot.strategicCoordinator?.domainManifest === "function",
          hasStrategicCoordinatorBuildPlan: typeof bot.strategicCoordinator?.buildExecutionPlan === "function",
          hasStrategicCoordinatorRevalidation: typeof bot.strategicCoordinator?.revalidateExecutionPlan === "function",
          laboratory: !!bot.laboratory,
          autoCastAbilities: bot.config.autoCastAbilities,
          autoAscend: bot.config.autoAscend,
          energySupportBrokerAllowAutoCast: bot.config.energySupportBrokerAllowAutoCast,
          councilUi: bot.config.councilUi,
          strategyInspector: bot.config.strategyInspector,
        },
      };
    });

    const { results } = report;

    const aggregatedMechanics = new Map();
    for (const result of Object.values(results)) {
      assert(result.schemaVersion === "six-domain-strategic-coordinator.v1", "unexpected M6 coordinator schema");
      assert(Array.isArray(result.domainOutcomes) && result.domainOutcomes.length === 6, "expected exactly six domain outcomes");
      assert(new Set(result.domainOutcomes.map((row) => row.domainId)).size === 6, "domain ids must be unique");
      assert(result.domainOutcomes.every((row) => row.snapshotId === result.snapshotId), "domain outcomes must share one snapshot id");
      assert(result.domainOutcomes.every((row) => row.decisionCycleId === result.decisionCycleId), "domain outcomes must share one decision cycle");
      assert(Array.isArray(result.coverage) && result.coverage.length > 0, "coverage rows must be present");
      for (const row of result.coverage) {
        if (row.status === "PASS") aggregatedMechanics.set(row.mechanicId, true);
      }
      assert(result.manifest.schemaVersion === "m6-domain-contract-manifest.v1", "manifest schema mismatch");
      assert(result.manifest.requiredMechanics.length >= 6, "manifest mechanics missing");
      assert(result.authorityState && typeof result.authorityState.executionAuthority === "boolean", "authority state missing");
      assert(result.recommendation === "ACT" || result.recommendation === "WAIT" || result.recommendation === "UNCERTAIN", "unexpected recommendation value");
      assert(result.reconsiderCondition && result.reconsiderCondition !== "none", "reconsider condition must be explicit");
    }

    assert(
      results.meatWin.winner && results.meatWin.winner.domainId === "MEAT",
      `Meat domain should win the meat scenario (actual=${results.meatWin.winner?.domainId || "none"}; ranked=${(results.meatWin.domainOutcomes || []).map((row) => `${row.domainId}:${row.comparability.status}:${row.outcome.milestoneEtaImprovementSeconds ?? row.outcome.projectedMilestoneProgressDelta ?? "null"}:${row.safety.status}`).join(" | ")})`
    );
    assert(results.larvaWin.winner.domainId === "LARVA_ENGINE", "Larva/Engine domain should win the larva scenario");
    assert(results.territoryWin.winner.domainId === "ARMY_TERRITORY", "Army/Territory domain should win the territory scenario");
    assert(results.energyWin.winner.domainId === "ENERGY_PRODUCTION", "Energy production should win the energy scenario");
    assert(results.abilityWin.winner.domainId === "ENERGY_ABILITIES", "Energy abilities should win the ability scenario");
    assert(results.abilityWin.recommendation === "WAIT", "ability winner must remain advisor-only");
    assert(results.abilityWin.executionAuthority === false, "ability winner must not gain execution authority");
    assert(results.ascensionWin.winner.domainId === "ASCENSION_MUTAGEN", "Ascension/Mutagen should win the ascension scenario");
    assert(results.ascensionWin.recommendation === "WAIT", "ascension winner must remain advisor-only");
    assert(results.ascensionWin.executionAuthority === false, "ascension winner must not gain execution authority");

    assert(results.unsupportedAbility.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES").safety.status === "UNSUPPORTED", "Swarmwarp must remain unsupported");
    assert(results.unsupportedAbility.executionAuthority === false, "Swarmwarp must not gain execution authority");
    assert(results.unsupportedAbility.recommendation !== "ACT", "Swarmwarp must not auto-execute");

    assert(results.blockedWin.winner.domainId !== "MEAT", "blocked higher-value candidate cannot win");
    assert(results.blockedWin.winner.safety.status === "ALLOWED", "blocked candidate must not become winner");

    assert(results.unranked.winner === null, "missing metrics should remain unranked");
    assert(results.unranked.recommendation === "UNCERTAIN", "missing metrics should produce UNCERTAIN");
    assert(results.unranked.executionAuthority === false, "unranked result must not execute");

    assert(results.duplicateEffects.domainOutcomes.find((row) => row.domainId === "MEAT").effectAudit.status === "FAIL", "duplicate causal effects must fail audit");
    assert(results.duplicateEffects.winner?.domainId !== "MEAT", "duplicate-effect candidate must be disqualified from winning");

    assert(Array.isArray(results.sharedCosts.sharedResourceConflicts) && results.sharedCosts.sharedResourceConflicts.length > 0, "shared costs must be reported once");
    assert(results.sharedCosts.sharedResourceConflicts.some((row) => row.resource === "meat"), "shared meat cost must be reported");

    assert(results.zeroBeatsNegative.winner?.domainId === "MEAT", "zero comparable value must rank above a negative value");

    assert(report.execution.executionPlan.identityStatus === "matched", `M6 execution plan must match the global winner identity: ${JSON.stringify(report.execution.executionPlan)}`);
    assert(report.execution.executionPlan.preRevalidationEligible === true, "matched reversible winner must require revalidation");
    assert(report.execution.executionPlan.executionAuthority === false, "M6 plan must not gain authority before revalidation");
    assert(report.execution.revalidatedExecutionPlan.executionAuthority === true, "exact same-cycle revalidation must authorize the bounded winner");
    assert(report.execution.revalidatedExecutionPlan.identityStatus === "matched", "revalidated identity must remain matched");
    assert(report.execution.cycleDriftPlan.executionAuthority === false && report.execution.cycleDriftPlan.revalidationStatus === "failed", "decision-cycle drift must deny authority");
    assert(report.execution.evaluatedIdentityResult.winner?.action?.executionId === "drone", "evaluated purchase metrics must retain the proposal execution id");
    assert(report.execution.evaluatedIdentityPlan.identityStatus === "matched", "evaluated purchase metrics must retain exact proposal execution identity");
    assert(report.execution.evaluatedIdentityPlan.preRevalidationEligible === true, "merged evaluated/proposal identity must remain eligible for revalidation");
    assert(report.execution.fingerprintDriftPlan.executionAuthority === false, "amount/fingerprint drift must deny authority");
    assert(report.execution.mismatchedWinnerPlan.executionAuthority === false && report.execution.mismatchedWinnerPlan.identityStatus === "mismatch", "purchase-coordinator runner-up must not replace the global winner");
    assert(report.execution.advisorWinnerPlan.executionAuthority === false && !report.execution.advisorWinnerPlan.boundedCandidate, "advisor winner must not fall through to a purchase");

    assert(report.councilUiState?.schemaVersion === "council-ui-state.v1", "Council UI public schema regressed");
    assert(report.councilUiState?.strategy?.globalCoordinator?.recommendation, "Council UI state must expose the M6 recommendation");
    assert(report.inspector && report.inspector.strategicCoordinatorSchema === "six-domain-strategic-coordinator.v1", "Inspector must expose strategic coordinator fields");
    assert(report.inspector.strategicCoordinatorExecutionAuthority === "false", "Advisor mode must remove effective live M6 execution authority");
    assert(report.inspector.strategicCoordinator.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES")?.sourceSchemaVersion === "energy-ability-timing-advisor.v1", "live M6 must consume the evaluated M4 advisor result");
    assert(report.inspector.strategicCoordinator.domainOutcomes.find((row) => row.domainId === "ASCENSION_MUTAGEN")?.sourceSchemaVersion === "ascension-mutagen-advisor.v1", "live M6 must consume the evaluated M5 advisor result");
    assert(report.councilText.toLowerCase().includes("six-domain coordinator"), "Council Chamber must show the M6 coordinator result");
    assert(report.matrixText.toLowerCase().includes("six-domain coordinator"), "Matrix Diagnostics must show the M6 coordinator result");

    assert(report.regression.purchaseEvaluator, "purchaseEvaluator API missing");
    assert(report.regression.abilityTimingAdvisor, "abilityTimingAdvisor API missing");
    assert(report.regression.ascensionMutagenAdvisor, "ascensionMutagenAdvisor API missing");
    assert(report.regression.hasGetStrategyInspector, "public getStrategyInspector API missing");
    assert(report.regression.hasGetCouncilUiState, "public getCouncilUiState API missing");
    assert(report.regression.hasStrategicCoordinatorEvaluate, "public strategicCoordinator API missing evaluate");
    assert(report.regression.hasStrategicCoordinatorManifest, "public strategicCoordinator API missing domainManifest");
    assert(report.regression.hasStrategicCoordinatorBuildPlan, "public strategicCoordinator API missing buildExecutionPlan");
    assert(report.regression.hasStrategicCoordinatorRevalidation, "public strategicCoordinator API missing revalidateExecutionPlan");
    assert(report.regression.laboratory, "laboratory API missing");
    assert(report.regression.autoCastAbilities === false, "autoCastAbilities default changed");
    assert(report.regression.autoAscend === false, "autoAscend default changed");
    assert(report.regression.energySupportBrokerAllowAutoCast === false, "energySupportBrokerAllowAutoCast default changed");
    assert(report.regression.councilUi === true, "councilUi default changed");
    assert(report.regression.strategyInspector === true, "strategyInspector default changed");
    assert(report.stateBefore === report.stateAfter, "strategicCoordinator.evaluate mutated live state");

    const requiredMechanicIds = [
      "M6-SIX-DOMAIN-IDENTITY",
      "M6-HARD-SAFETY",
      "M6-COMPARABILITY",
      "M6-ABILITY-AUTHORITY",
      "M6-ASCENSION-AUTHORITY",
      "M6-DOUBLE-COUNT-AUDIT",
      "M6-BOUNDED-EXECUTION",
      "M6-CYCLE-CONSISTENCY",
      "M6-NON-MUTATION",
      "M6-OBSERVABILITY",
    ];
    for (const mechanicId of requiredMechanicIds) {
      assert(aggregatedMechanics.has(mechanicId), `coverage never passed mechanic ${mechanicId}`);
    }

    console.log("BOOK00 M6 SIX-DOMAIN COORDINATOR CHECK PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
