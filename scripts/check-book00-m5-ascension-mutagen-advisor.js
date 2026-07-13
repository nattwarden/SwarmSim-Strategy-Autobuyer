const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  for (const expected of [
    'const ASCENSION_MUTAGEN_SNAPSHOT_SCHEMA_VERSION = "ascension-mutagen-snapshot.v1"',
    'const ASCENSION_MUTAGEN_ADVISOR_SCHEMA_VERSION = "ascension-mutagen-advisor.v1"',
    "function captureAscensionMutagenSnapshot(game, strategyContext = {})",
    "function evaluateAscensionMutagenSnapshot(inputSnapshot = {})",
    "ascensionMutagenAdvisor:",
    "function ascensionMutagenEnergyEtaSeconds(",
    '"Ascension & Mutagen"',
    '"Ability timing"',
    'Guarded fallback active:',
    'Do not bypass reserves, Nexus/Energy protection, or advisor-only controls.',
  ]) {
    assert(userscript.includes(expected), `missing M5 contract surface: ${expected}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/#/tab/energy", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.ascensionMutagenAdvisor, { timeout: 60000 });

    const report = await page.evaluate(async () => {
      const api = window.kbcSwarmBot.ascensionMutagenAdvisor;
      const energyEta = {
        linear: api.estimateEnergyEta({ cost: "100", current: "40", rate: "3", cap: "200" }),
        ready: api.estimateEnergyEta({ cost: "100", current: "100", rate: "3", cap: "200" }),
        capBlocked: api.estimateEnergyEta({ cost: "200", current: "40", rate: "3", cap: "200" }),
        noRate: api.estimateEnergyEta({ cost: "100", current: "40", rate: "0", cap: "200" }),
      };
      const manifest = api.formulaManifest();

      const mutationStatus = {
        mutanthatchery: "supported-direct-larva-comparison",
        mutantbat: "effect-visible-unranked-cross-domain",
        mutantclone: "effect-visible-unranked-ability-model",
        mutantswarmwarp: "unsupported-unranked-swarmwarp",
        mutantrush: "effect-visible-unranked-ability-model",
        mutanteach: "effect-visible-unranked-stochastic-future-mutagen",
        mutantfreq: "effect-visible-unranked-stochastic-future-mutagen",
        mutantnexus: "effect-visible-unranked-energy-and-ascension-coupling",
        mutantarmy: "effect-visible-unranked-territory-model",
        mutantmeat: "effect-visible-unranked-meat-chain-model",
      };

      const buildMutations = (overrides = {}) => {
        return (manifest.mutationCatalog || []).map((row) => ({
          mutationId: row.unitId,
          label: row.label,
          level: 0,
          unlocked: row.unitId === "mutanthatchery",
          unlockCostIfNeeded: "0",
          effectBefore: "1",
          effectAfter: "1",
          effectDelta: "0",
          verificationStatus: "source-verified",
          rankingStatus: mutationStatus[row.unitId] || "effect-visible-unranked-cross-domain",
          targetMetric: row.unitId === "mutanthatchery" ? "larvae-over-horizon" : "cross-domain",
          ...(overrides[row.unitId] || {}),
        }));
      };

      const baseSnapshot = {
        schemaVersion: "ascension-mutagen-snapshot.v1",
        snapshotId: "M5-TEST-BASE",
        source: {
          activeMilestone: "M5 Ascension",
          activeTarget: "Mutagen horizon",
        },
        currentRun: {
          hatcheryLarvaePerSecond: "5",
          nextBoundedOpportunity: {
            label: "next premutagen opportunity",
            etaSeconds: 120,
            value: "50",
            basis: "runtime-derived",
          },
        },
        ascension: {
          legal: true,
          energyCapBlocked: false,
          cost: "100000",
          costPercent: "0.95",
          energyEtaSeconds: 30,
        },
        mutagen: {
          active: "10",
          inactive: "8",
          activeAfterAscend: "18",
          newLarvaPerSecondAfterAscend: "1.8",
          nextUnlockCost: "1",
          hatcheryUnlocked: true,
          hatcheryLevel: 0,
          analysisAmount: 1,
          analysisAmountBasis: "fixture",
          mutations: buildMutations(),
        },
        recoveryModel: {
          basis: "observed-run-milestone",
          breakEvenSeconds: 600,
          rangeLowSeconds: 500,
          rangeHighSeconds: 700,
          nextRunHorizonSeconds: 1800,
          confidence: "medium",
          warnings: [],
        },
        formulaProvenance: {
          status: "source-verified",
        },
      };

      const clone = (value) => JSON.parse(JSON.stringify(value));

      const illegalInput = clone(baseSnapshot);
      illegalInput.snapshotId = "M5-ILLEGAL";
      illegalInput.ascension.legal = false;

      const capBlockedInput = clone(baseSnapshot);
      capBlockedInput.snapshotId = "M5-CAP-BLOCKED";
      capBlockedInput.ascension.energyCapBlocked = true;

      const continueInput = clone(baseSnapshot);
      continueInput.snapshotId = "M5-CONTINUE";
      continueInput.currentRun.nextBoundedOpportunity.value = "5000";

      const ascendInput = clone(baseSnapshot);
      ascendInput.snapshotId = "M5-ASCEND";
      ascendInput.currentRun.nextBoundedOpportunity.value = "5";

      const uncertainInput = clone(baseSnapshot);
      uncertainInput.snapshotId = "M5-UNCERTAIN";
      uncertainInput.recoveryModel.basis = "unavailable";
      uncertainInput.recoveryModel.breakEvenSeconds = null;

      const hatcheryWinInput = clone(baseSnapshot);
      hatcheryWinInput.snapshotId = "M5-HATCHERY-WIN";
      hatcheryWinInput.currentRun.hatcheryLarvaePerSecond = "500";
      hatcheryWinInput.mutagen.analysisAmount = 2;
      hatcheryWinInput.mutagen.activeAfterAscend = "40";
      hatcheryWinInput.mutagen.inactive = "30";
      hatcheryWinInput.currentRun.nextBoundedOpportunity.value = "1";

      const keepWinInput = clone(baseSnapshot);
      keepWinInput.snapshotId = "M5-KEEP-WIN";
      keepWinInput.currentRun.hatcheryLarvaePerSecond = "0.01";
      keepWinInput.mutagen.analysisAmount = 3;

      const immutableCheck = clone(baseSnapshot);
      const immutableBefore = JSON.stringify(immutableCheck);

      const illegal = api.evaluate(illegalInput);
      const capBlocked = api.evaluate(capBlockedInput);
      const continueRun = api.evaluate(continueInput);
      const ascendNow = api.evaluate(ascendInput);
      const uncertain = api.evaluate(uncertainInput);
      const hatcheryWin = api.evaluate(hatcheryWinInput);
      const keepWin = api.evaluate(keepWinInput);
      const immutableAfterResult = api.evaluate(immutableCheck);
      const immutableAfter = JSON.stringify(immutableCheck);

      window.kbcSwarmBot.runOnce();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const inspector = window.kbcSwarmBot.getStrategyInspector?.() || {};

      const hatcheryCandidate = (hatcheryWin.mutagenPlan?.candidates || []).find((c) => c.mutationId === "HATCHERY_MUTATION");
      const keepCandidate = (keepWin.mutagenPlan?.candidates || []).find((c) => c.mutationId === "KEEP_UNALLOCATED");
      const keepScenarioHatchery = (keepWin.mutagenPlan?.candidates || []).find((c) => c.mutationId === "HATCHERY_MUTATION");
      const warpCandidate = (ascendNow.mutagenPlan?.candidates || []).find((c) => c.mutationId === "mutantswarmwarp");

      return {
        manifest,
        illegal,
        capBlocked,
        continueRun,
        ascendNow,
        uncertain,
        hatcheryWin,
        keepWin,
        immutableInputUnchanged: immutableBefore === immutableAfter,
        immutableResultSchema: immutableAfterResult.schemaVersion,
        hatcheryCandidate,
        keepCandidate,
        keepScenarioHatchery,
        warpCandidate,
        inspector,
        energyEta,
        councilText: document.querySelector("#kbc-swarmbot-strategy-bar")?.innerText || "",
      };
    });

    const results = [report.illegal, report.capBlocked, report.continueRun, report.ascendNow, report.uncertain, report.hatcheryWin, report.keepWin];
    for (const result of results) {
      assert(result.schemaVersion === "ascension-mutagen-advisor.v1", "unexpected M5 advisor schema");
      assert(result.mode === "advisor-only", "M5 advisor left advisor-only mode");
      assert(result.executionAuthority === false, "M5 advisor gained execution authority");
      assert(result.recommendedActionId === "CONTINUE_RUN" || result.recommendedActionId === "ASCEND_NOW", "recommended action id must be continue or ascend");
      assert(Array.isArray(result.branches) && result.branches.length === 2, "both continue and ascend branches are required");
      assert(result.branches.every((branch) => branch.snapshotId === result.snapshotId), "branches do not share immutable snapshot id");
      assert(result.branches.every((branch) => branch.activeMilestone === result.activeMilestone), "branches do not share active milestone");
      assert(result.branches.every((branch) => toNumber(branch.horizonSeconds, -1) === toNumber(result.nextRunHorizonSeconds, -2)), "branches do not share horizon");
    }

    assert(report.manifest.ascensionPenaltyBase === "1.12", "manifest does not enforce 1.12 ascension penalty parity");
    assert(toNumber(report.manifest.unlockCostExamples.zeroUnlocked, -1) === 1, "unlock cost parity failed for zero unlocked mutations");
    assert(toNumber(report.manifest.unlockCostExamples.oneUnlocked, -1) === 15625, "unlock cost parity failed for one unlocked mutation");
    assert(toNumber(report.manifest.unlockCostExamples.twoUnlocked, -1) === 244140625, "unlock cost parity failed for two unlocked mutations");

    assert(report.illegal.recommendation === "CONTINUE_RUN", "illegal ascension must continue run");
    assert(report.capBlocked.recommendation === "CONTINUE_RUN", "cap-blocked ascension must continue run");
    assert(report.continueRun.recommendation === "CONTINUE_RUN", "continue scenario should recommend continue");
    assert(report.ascendNow.recommendation === "ASCEND_NOW", "ascend scenario should recommend ascend now");
    assert(report.ascendNow.recommendedActionId === "ASCEND_NOW", "ascend scenario should expose ascend action id");
    assert(report.uncertain.recommendation === "UNCERTAIN", "missing recovery evidence must return UNCERTAIN");
    assert(report.uncertain.recommendedActionId === "CONTINUE_RUN", "UNCERTAIN must map to CONTINUE_RUN action id");
    assert(report.uncertain.breakEvenSeconds === null, "UNCERTAIN without recovery evidence must keep break-even null");

    assert(report.hatcheryWin.mutagenPlan.recommendedActionId === "HATCHERY_MUTATION", "hatchery win scenario should recommend hatchery allocation");
    assert(toNumber(report.hatcheryCandidate.lostMutagenLarvaPerSecond, -1) === 0.2, "allocated mutagen must lose 0.1 larva/s per point");
    assert(toNumber(report.hatcheryCandidate.lostMutagenLarvaeOverHorizon, -1) === 360, "lost mutagen larvae over horizon should match 0.1 rule");
    assert(toNumber(report.hatcheryCandidate.netLarvaeOverHorizon, -1) > 0, "hatchery win scenario must have positive net larvae over horizon");

    assert(report.keepWin.mutagenPlan.recommendedActionId === "KEEP_UNALLOCATED", "keep-unallocated scenario should keep mutagen unallocated");
    assert(toNumber(report.keepScenarioHatchery.netLarvaeOverHorizon, 1) <= 0, "keep scenario hatchery candidate should not have positive net larvae");
    assert(report.keepCandidate.rankingStatus === "ranked-baseline", "keep-unallocated baseline must stay ranked");

    assert(report.warpCandidate.rankingStatus === "unsupported-unranked-swarmwarp", "unsupported mutations must remain visible and unranked");
    assert(report.immutableInputUnchanged, "M5 evaluator mutated input snapshot");
    assert(report.immutableResultSchema === "ascension-mutagen-advisor.v1", "immutable check returned invalid schema");

    assert(report.inspector.ascensionAdvisorExecutionAuthority === "advisor-only", "live observability lost advisor-only authority");
    assert(report.inspector.ascensionAdvisorRecommendation, "live observability missing ascension recommendation");
    assert(report.inspector.ascensionAdvisorMutagenPlan, "live observability missing mutagen plan field");
    assert(report.inspector.ascensionMutagenAdvisor && report.inspector.ascensionMutagenAdvisor.schemaVersion === "ascension-mutagen-advisor.v1", "live inspector missing structured ascension advisor result");
    assert(report.energyEta.linear === 20, "Decimal-safe linear Ascension ETA is wrong");
    assert(report.energyEta.ready === 0, "ready Ascension ETA must be zero");
    assert(report.energyEta.capBlocked === null, "cap-blocked Ascension ETA must be unavailable");
    assert(report.energyEta.noRate === null, "zero-rate Ascension ETA must be unavailable");
    assert(report.councilText.toLowerCase().includes("ability timing"), "Council does not show the M4 ability timing advisor");
    assert(report.councilText.toLowerCase().includes("ascension & mutagen"), "Council does not show the M5 Ascension and Mutagen advisor");
  } finally {
    await browser.close();
  }

  console.log("BOOK00 M5 ASCENSION MUTAGEN ADVISOR CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
