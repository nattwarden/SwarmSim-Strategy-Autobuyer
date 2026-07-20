const fs = require("fs");
const path = require("path");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  for (const expected of [
    'const STRATEGIC_OUTCOME_CALIBRATION_SCHEMA_VERSION = "strategic-outcome-calibration.v1"',
    "function buildStrategicOutcomeCalibration(input = {})",
    "function validateStrategicCalibrationIdentity(action = {}, baseline = {}, context = {})",
    "function calibrateAbilityOutcome(actionRun = {}, waitRun = {}, context = {})",
    "function calibrateAscensionOutcome(continueBranch = {}, ascendBranch = {}, context = {})",
  ]) {
    assert(userscript.includes(expected), `missing M7 contract surface: ${expected}`);
  }

  const browser = await getBrowser({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/#/tab/energy", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator?.calibration, { timeout: 60000 });

    const report = await page.evaluate(async () => {
      const bot = window.kbcSwarmBot;
      const coordinator = bot.strategicCoordinator;
      const calibrationApi = coordinator.calibration;

      function buildPurchaseRow(lane, candidate, etaImprovementSeconds, options = {}) {
        const metricTarget = options.metricTarget || "Expansion";
        const metricId = options.metricId || "expansion-eta";
        const metricUnit = options.metricUnit || "seconds";
        const metricBasis = options.metricBasis || "milestone-eta-seconds";
        const sharedOutcome = options.sharedOutcome || (etaImprovementSeconds === null ? {} : { etaImprovementSeconds });
        const raw = options.raw || (etaImprovementSeconds === null ? {} : { etaImprovementSeconds });
        return {
          lane,
          candidate,
          decision: options.decision || "BUY",
          safeEligible: options.safeEligible !== undefined ? options.safeEligible : true,
          blockers: options.blockers ? options.blockers.slice() : [],
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
          sharedOutcome: {
            ...sharedOutcome,
            metricTarget: sharedOutcome.metricTarget || metricTarget,
            metricId: sharedOutcome.metricId || metricId,
            metricUnit: sharedOutcome.metricUnit || metricUnit,
            metricBasis: sharedOutcome.metricBasis || metricBasis,
          },
          confidence: options.confidence || "high",
          raw: {
            ...raw,
            metricTarget: raw.metricTarget || metricTarget,
            metricId: raw.metricId || metricId,
            metricUnit: raw.metricUnit || metricUnit,
            metricBasis: raw.metricBasis || metricBasis,
          },
          effects: options.effects,
        };
      }

      function buildSnapshot(options = {}) {
        return {
          schemaVersion: "six-domain-decision-snapshot.v1",
          snapshotId: options.snapshotId || "M7-SNAPSHOT",
          snapshotHash: options.snapshotHash || `sha256:${options.snapshotId || "M7-SNAPSHOT"}`,
          decisionCycleId: options.decisionCycleId || "cycle-1",
          source: {
            scriptVersion: "7.0.0",
            activeMilestone: options.activeMilestone || "M7 milestone",
            activeTarget: options.activeTarget || "Expansion",
          },
          horizonId: options.horizonId || "medium",
          horizonSeconds: options.horizonSeconds || 1800,
          horizons: [
            { horizonId: "short", horizonSeconds: 300 },
            { horizonId: "medium", horizonSeconds: 1800 },
            { horizonId: "long", horizonSeconds: 7200 },
          ],
          purchaseRows: options.purchaseRows || [],
          selectedComparisonBasis: options.selectedComparisonBasis || "milestone-eta-seconds",
          selectedComparisonMetricId: options.selectedComparisonMetricId || "expansion-eta",
          selectedComparisonMetricUnit: options.selectedComparisonMetricUnit || "seconds",
          abilitySnapshot: options.abilitySnapshot || {
            schemaVersion: "energy-ability-timing-advisor.v1",
            snapshotId: "M7-ABILITY",
            snapshotHash: "sha256:M7-ABILITY",
            decisionCycleId: "cycle-1",
            horizonId: "medium",
            horizonSeconds: 1800,
            formulaSetId: "energy-ability-source-formulas.v1",
            sourceRevision: "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
            activeMilestone: "M7 milestone",
            activeTarget: "current target",
            recommendation: "SAVE",
            recommendedActionId: "WAIT",
            confidence: "low",
            reason: "wait",
            reconsiderCondition: "reconsider",
            energyOpportunityCost: "none",
            excludedActionIds: ["SWARMWARP"],
            branches: [
              {
                actionId: "WAIT",
                label: "Save Energy",
                projectedGain: 0,
                metricId: "ability-value-progress",
                metricUnit: "value",
                direction: "HIGHER_IS_BETTER",
                formulaStatus: "runtime-derived",
              },
            ],
          },
          ascensionSnapshot: options.ascensionSnapshot || {
            schemaVersion: "ascension-mutagen-advisor.v1",
            snapshotId: "M7-ASCENSION",
            recommendation: "CONTINUE_RUN",
            recommendedActionId: "CONTINUE_RUN",
            confidence: "low",
            reason: "continue",
            reconsiderCondition: "reconsider",
            breakEvenSeconds: 600,
            currentRunOpportunityCost: "none",
            nextRunHorizonSeconds: 1800,
            branches: [
              { actionId: "CONTINUE_RUN", projectedMilestoneProgressDelta: null },
              { actionId: "ASCEND_NOW", projectedMilestoneProgressDelta: null },
            ],
          },
          manifest: coordinator.domainManifest(),
        };
      }

      const baseRows = [
        buildPurchaseRow("Meat", "Drone", 30),
        buildPurchaseRow("Engine", "Hatchery", 40),
        buildPurchaseRow("Territory", "Stinger V", 50),
        buildPurchaseRow("Energy", "Nexus 5", 60),
      ];

      const comparableAbilitySnapshot = {
        schemaVersion: "energy-ability-timing-advisor.v1",
        snapshotId: "M7-ABILITY-COMPARABLE",
        snapshotHash: "sha256:M7-ABILITY-COMPARABLE",
        decisionCycleId: "cycle-1",
        horizonId: "medium",
        horizonSeconds: 1800,
        formulaSetId: "energy-ability-source-formulas.v1",
        sourceRevision: "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
        activeMilestone: "M7 milestone",
        activeTarget: "current target",
        recommendation: "CAST_NOW",
        recommendedActionId: "CLONE_LARVAE",
        recommendedLabel: "Clone Larvae",
        confidence: "high",
        reason: "ability conversion",
        reconsiderCondition: "reconsider",
        energyOpportunityCost: "none",
        excludedActionIds: ["SWARMWARP"],
        branches: [
          {
            actionId: "WAIT",
            label: "Save Energy",
            projectedGain: 0,
            milestoneEtaSeconds: 1000,
            milestoneMetricId: "expansion-eta",
            metricId: "expansion-eta",
            metricUnit: "seconds",
            direction: "LOWER_IS_BETTER",
            formulaStatus: "source-verified",
          },
          {
            actionId: "CLONE_LARVAE",
            label: "Clone Larvae",
            projectedGain: 900,
            milestoneEtaSeconds: 100,
            milestoneMetricId: "expansion-eta",
            metricId: "expansion-eta",
            metricUnit: "seconds",
            direction: "LOWER_IS_BETTER",
            formulaStatus: "source-verified",
            targetAligned: true,
            blockers: [],
          },
        ],
      };

      const abilityWin = coordinator.evaluate(buildSnapshot({ snapshotId: "M7-ABILITY-WIN", purchaseRows: baseRows, abilitySnapshot: comparableAbilitySnapshot }));

      const abilityLoss = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-ABILITY-LOSS",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 950),
          buildPurchaseRow("Engine", "Hatchery", 40),
          buildPurchaseRow("Territory", "Stinger V", 50),
          buildPurchaseRow("Energy", "Nexus 5", 60),
        ],
        abilitySnapshot: comparableAbilitySnapshot,
      }));

      const zeroDeltaAbility = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-ZERO-DELTA",
        purchaseRows: baseRows,
        abilitySnapshot: {
          ...comparableAbilitySnapshot,
          snapshotId: "M7-ZERO-DELTA-ABILITY",
          branches: [
            { ...comparableAbilitySnapshot.branches[0], milestoneEtaSeconds: 1000 },
            { ...comparableAbilitySnapshot.branches[1], milestoneEtaSeconds: 1000 },
          ],
        },
      }));

      const negativeDeltaAbility = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-NEGATIVE-DELTA",
        purchaseRows: baseRows,
        abilitySnapshot: {
          ...comparableAbilitySnapshot,
          snapshotId: "M7-NEGATIVE-DELTA-ABILITY",
          branches: [
            { ...comparableAbilitySnapshot.branches[0], milestoneEtaSeconds: 1000 },
            { ...comparableAbilitySnapshot.branches[1], milestoneEtaSeconds: 1010 },
          ],
        },
      }));

      const missingMetric = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-MISSING-METRIC",
        purchaseRows: baseRows,
        abilitySnapshot: {
          ...comparableAbilitySnapshot,
          snapshotId: "M7-MISSING-METRIC-ABILITY",
          branches: [
            { ...comparableAbilitySnapshot.branches[0], milestoneEtaSeconds: 1000 },
            { ...comparableAbilitySnapshot.branches[1], milestoneEtaSeconds: null },
          ],
        },
      }));

      const formulaIncomplete = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-FORMULA-INCOMPLETE",
        purchaseRows: baseRows,
        abilitySnapshot: {
          ...comparableAbilitySnapshot,
          snapshotId: "M7-FORMULA-INCOMPLETE-ABILITY",
          branches: [
            { ...comparableAbilitySnapshot.branches[0], formulaStatus: "incomplete" },
            { ...comparableAbilitySnapshot.branches[1], formulaStatus: "incomplete" },
          ],
        },
      }));

      const unsupportedSwarmwarp = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-SWARMWARP",
        purchaseRows: baseRows,
        abilitySnapshot: {
          ...comparableAbilitySnapshot,
          snapshotId: "M7-SWARMWARP-ABILITY",
          recommendation: "CAST_NOW",
          recommendedActionId: "SWARMWARP",
          recommendedLabel: "Swarmwarp",
          excludedActionIds: ["SWARMWARP"],
          branches: [
            { ...comparableAbilitySnapshot.branches[0], actionId: "WAIT", projectedGain: 0 },
            { ...comparableAbilitySnapshot.branches[1], actionId: "SWARMWARP", label: "Swarmwarp", projectedGain: 900 },
          ],
        },
      }));

      const breakEvenOnlyAscension = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-ASCENSION-UNRANKED",
        purchaseRows: baseRows,
        ascensionSnapshot: {
          schemaVersion: "ascension-mutagen-advisor.v1",
          snapshotId: "M7-ASCENSION-UNRANKED-SNAPSHOT",
          recommendation: "ASCEND_NOW",
          recommendedActionId: "ASCEND_NOW",
          confidence: "medium",
          reason: "break-even only",
          reconsiderCondition: "reconsider",
          breakEvenSeconds: 300,
          branches: [
            { actionId: "CONTINUE_RUN", projectedMilestoneProgressDelta: null },
            { actionId: "ASCEND_NOW", projectedMilestoneProgressDelta: null },
          ],
        },
      }));

      const comparableAscension = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-ASCENSION-COMPARABLE",
        selectedComparisonBasis: "same-unit-milestone-progress-delta",
        selectedComparisonMetricId: "next-run-progress",
        selectedComparisonMetricUnit: "points",
        purchaseRows: baseRows,
        ascensionSnapshot: {
          schemaVersion: "ascension-mutagen-advisor.v1",
          snapshotId: "M7-ASCENSION-COMPARABLE-SNAPSHOT",
          recommendation: "ASCEND_NOW",
          recommendedActionId: "ASCEND_NOW",
          confidence: "medium",
          reason: "fixture progress metric",
          reconsiderCondition: "reconsider",
          branches: [
            {
              actionId: "CONTINUE_RUN",
              projectedMilestoneProgressDelta: 100,
              metricId: "next-run-progress",
              metricUnit: "points",
              direction: "HIGHER_IS_BETTER",
              formulaSetId: "ascension-recovery-fixture.v1",
              sourceRevision: "fixture",
              formulaStatus: "runtime-derived",
            },
            {
              actionId: "ASCEND_NOW",
              projectedMilestoneProgressDelta: 250,
              metricId: "next-run-progress",
              metricUnit: "points",
              direction: "HIGHER_IS_BETTER",
              formulaSetId: "ascension-recovery-fixture.v1",
              sourceRevision: "fixture",
              formulaStatus: "runtime-derived",
            },
          ],
        },
      }));

      const duplicateEffects = coordinator.evaluate(buildSnapshot({
        snapshotId: "M7-DUPLICATE-EFFECTS",
        purchaseRows: [
          buildPurchaseRow("Meat", "Drone", 400, {
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
          buildPurchaseRow("Engine", "Hatchery", 30),
          buildPurchaseRow("Territory", "Stinger V", 20),
          buildPurchaseRow("Energy", "Nexus 5", 10),
        ],
      }));

      const invalidIdentity = calibrationApi.evaluate({
        sourceDomainId: "ENERGY_ABILITIES",
        sourceSchemaVersion: "energy-ability-timing-advisor.v1",
        context: {
          snapshotId: "M7-IDENTITY",
          snapshotHash: "sha256:M7-IDENTITY",
          decisionCycleId: "cycle-1",
          activeMilestone: "M7",
          activeTarget: "target",
          metricId: "eta",
          metricUnit: "seconds",
          direction: "LOWER_IS_BETTER",
          horizonId: "medium",
          horizonSeconds: 1800,
          formulaSetId: "ability-formulas.v1",
          sourceRevision: "fixture",
        },
        action: {
          actionId: "CLONE_LARVAE",
          value: 10,
          metricUnit: "seconds",
          metricId: "eta",
          formulaStatus: "runtime-derived",
        },
        baseline: {
          actionId: "WAIT",
          value: 20,
          metricUnit: "points",
          metricId: "eta",
          formulaStatus: "runtime-derived",
        },
      });

      // Production capture proves the current source-verified ability formula is
      // available to the adapter. Raw resource gain stays deliberately unranked;
      // the positive shared-ETA contract is exercised by the explicit fixture.
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
      const liveCapture = await bot.laboratory.captureLiveSnapshot({ snapshotId: "M7-LIVE-PARITY" });
      let liveParity = null;
      if (liveCapture?.ok && liveCapture.snapshot?.abilities?.cloneLarvae?.formulaInputs?.sourceVerifiedOutput) {
        const clone = liveCapture.snapshot.abilities.cloneLarvae;
        const projectedGain = Number(clone.formulaInputs.sourceVerifiedOutput || 0);
        const energyCost = Number(clone.energyCost || 0);
        const reserveRequired = Number((liveCapture.snapshot.resources?.energy?.perSecond || 0)) * 30;
        const energyAmount = Math.max(Number(liveCapture.snapshot.resources?.energy?.amount || 0), energyCost + reserveRequired + 1);
        const abilitySnapshot = {
          schemaVersion: "energy-ability-timing-advisor.v1",
          snapshotId: "M7-LIVE-ABILITY",
          snapshotHash: "sha256:M7-LIVE-ABILITY",
          decisionCycleId: "cycle-live",
          horizonId: "medium",
          horizonSeconds: 1800,
          formulaSetId: "energy-ability-source-formulas.v1",
          sourceRevision: "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
          activeMilestone: "M7 live ability capture",
          activeTarget: "clone larvae window",
          energy: { amount: energyAmount, perSecond: Number(liveCapture.snapshot.resources?.energy?.perSecond || 0), reserveRequired },
          recommendation: "CAST_NOW",
          recommendedActionId: "CLONE_LARVAE",
          recommendedLabel: "Clone Larvae",
          confidence: "high",
          reason: "live source-derived Clone Larvae formula",
          reconsiderCondition: "reconsider on energy/rate change",
          energyOpportunityCost: "none",
          excludedActionIds: ["SWARMWARP"],
          branches: [
            { actionId: "WAIT", label: "Save Energy", projectedGain: 0, metricId: "ability-larvae-progress", metricUnit: "larvae", direction: "HIGHER_IS_BETTER", formulaStatus: "source-verified" },
            { actionId: "CLONE_LARVAE", label: "Clone Larvae", projectedGain, metricId: "ability-larvae-progress", metricUnit: "larvae", direction: "HIGHER_IS_BETTER", formulaStatus: "source-verified", targetAligned: true, blockers: [] },
          ],
        };
        liveParity = coordinator.evaluate(buildSnapshot({ snapshotId: "M7-LIVE-PARITY-SNAPSHOT", purchaseRows: baseRows, abilitySnapshot }));
      }

      bot.config.enabled = true;
      bot.config.advisorOnly = true;
      bot.config.autoBuySafeDecisions = false;
      bot.runOnce();
      const inspector = bot.getStrategyInspector?.() || {};
      const council = bot.getCouncilUiState?.() || {};

      return {
        abilityWin,
        abilityLoss,
        zeroDeltaAbility,
        negativeDeltaAbility,
        missingMetric,
        formulaIncomplete,
        unsupportedSwarmwarp,
        breakEvenOnlyAscension,
        comparableAscension,
        duplicateEffects,
        invalidIdentity,
        liveParity,
        inspector,
        council,
        defaults: {
          autoCastAbilities: bot.config.autoCastAbilities,
          autoAscend: bot.config.autoAscend,
          energySupportBrokerAllowAutoCast: bot.config.energySupportBrokerAllowAutoCast,
        },
      };
    });

    const abilityOutcomeWin = report.abilityWin.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeLoss = report.abilityLoss.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeZero = report.zeroDeltaAbility.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeNegative = report.negativeDeltaAbility.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeMissing = report.missingMetric.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeIncomplete = report.formulaIncomplete.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    const abilityOutcomeSwarmwarp = report.unsupportedSwarmwarp.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");

    const ascensionOutcomeUnranked = report.breakEvenOnlyAscension.domainOutcomes.find((row) => row.domainId === "ASCENSION_MUTAGEN");
    const ascensionOutcomeComparable = report.comparableAscension.domainOutcomes.find((row) => row.domainId === "ASCENSION_MUTAGEN");

    assert(abilityOutcomeWin.calibration?.schemaVersion === "strategic-outcome-calibration.v1", "missing calibration schema in ability outcome");
    assert(abilityOutcomeWin.calibration?.comparabilityStatus === "COMPARABLE", "ability comparable state failed");
    assert(report.abilityWin.winner?.domainId === "ENERGY_ABILITIES", "ability should win global recommendation in calibrated state");
    assert(report.abilityWin.executionAuthority === false, "advisor-only ability winner must not execute");

    assert(report.abilityLoss.winner?.domainId !== "ENERGY_ABILITIES", "ability loss state should not rank ability first");
    assert(abilityOutcomeLoss.calibration?.comparabilityStatus === "COMPARABLE", "ability should remain comparable in honest loss state");

    assert(abilityOutcomeZero.calibration?.delta === 0, "zero delta must be preserved");
    assert(abilityOutcomeNegative.calibration?.delta === -10, "negative delta must be preserved");

    assert(abilityOutcomeMissing.calibration?.comparabilityStatus === "UNRANKED", "missing metric should be unranked");
    assert(abilityOutcomeIncomplete.calibration?.comparabilityStatus === "UNRANKED", "incomplete formula should be unranked");
    assert(abilityOutcomeSwarmwarp.safety.status === "UNSUPPORTED", "swarmwarp must remain unsupported");

    assert(report.invalidIdentity.comparabilityStatus === "INVALID", "identity mismatch must be invalid");

    assert(ascensionOutcomeUnranked.calibration?.comparabilityStatus !== "COMPARABLE", "break-even-only ascension must remain unranked");
    assert(ascensionOutcomeComparable.calibration?.comparabilityStatus === "COMPARABLE", "fully supplied ascension fixture must be comparable");
    assert(report.comparableAscension.executionAuthority === false, "comparable ascension fixture must remain advisor-only");

    const duplicateMeat = report.duplicateEffects.domainOutcomes.find((row) => row.domainId === "MEAT");
    assert(duplicateMeat.effectAudit.status === "FAIL", "duplicate included effects must fail audit");
    assert(report.duplicateEffects.winner?.domainId !== "MEAT", "duplicate effect winner must be disqualified");

    assert(report.inspector.strategicCalibrationSchemaVersion === "strategic-outcome-calibration.v1", "Inspector missing strategic calibration schema");
    assert(Object.prototype.hasOwnProperty.call(report.inspector, "strategicCalibrationStatus"), "Inspector missing strategic calibration status");
    assert(report.council.schemaVersion === "council-ui-state.v1", "Council UI state schema regressed");
    assert(report.council.strategy?.globalCoordinator?.strategicCalibration !== undefined, "Council UI missing strategic calibration projection");

    assert(report.defaults.autoCastAbilities === false, "autoCastAbilities default changed");
    assert(report.defaults.autoAscend === false, "autoAscend default changed");
    assert(report.defaults.energySupportBrokerAllowAutoCast === false, "energySupportBrokerAllowAutoCast default changed");

    const liveAbility = report.liveParity?.domainOutcomes.find((row) => row.domainId === "ENERGY_ABILITIES");
    assert(liveAbility?.calibration?.comparabilityStatus === "COMPARABLE" && liveAbility?.comparability?.status === "UNRANKED", "raw production ability gain must stay visible but unranked without a shared milestone ETA");

    console.log("BOOK00 M7 CALIBRATED SHARED OUTCOMES CHECK PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
