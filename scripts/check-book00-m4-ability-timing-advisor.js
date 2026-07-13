const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  for (const expected of [
    'const ENERGY_ABILITY_TIMING_SCHEMA_VERSION = "energy-ability-timing-advisor.v1"',
    'excludedActionIds: ["SWARMWARP"]',
    'postActionPolicy: "apply the immediate ability effect, then passive production only; no downstream purchases or casts are assumed"',
  ]) {
    assert(userscript.includes(expected), `missing M4 contract surface: ${expected}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/#/tab/energy", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.abilityTimingAdvisor, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const api = window.kbcSwarmBot.abilityTimingAdvisor;
      const ability = (actionId, label, targetResource, overrides = {}) => ({
        actionId,
        label,
        targetResource,
        available: false,
        energyCost: 1600,
        projectedGain: 1000,
        gainRatio: 0.5,
        targetAligned: false,
        formulaStatus: "source-verified",
        ...overrides,
      });
      const abilities = [
        ability("CLONE_LARVAE", "Clone Larvae", "larvae"),
        ability("HOUSE_OF_MIRRORS", "House of Mirrors", "territory rate"),
        ability("LARVA_RUSH", "Larva Rush", "larvae"),
        ability("MEAT_RUSH", "Meat Rush", "meat"),
        ability("TERRITORY_RUSH", "Territory Rush", "territory"),
        ability("SWARMWARP", "Swarmwarp", "unknown", { available: true, targetAligned: true, gainRatio: 999 }),
      ];
      const base = {
        snapshotId: "M4-ACCEPTANCE",
        activeMilestone: "M4 Energy ability timing",
        activeTarget: "Meat progression",
        energy: { amount: 20000, perSecond: 10, reserveRequired: 1000 },
        bestNonCastAlternative: "bounded Lepidoptera production",
        abilities,
      };

      const cloneInput = JSON.parse(JSON.stringify(base));
      cloneInput.abilities[0] = ability("CLONE_LARVAE", "Clone Larvae", "larvae", {
        available: true, energyCost: 12000, projectedGain: 1000000, gainRatio: 1, targetAligned: true,
      });
      const cloneBefore = JSON.stringify(cloneInput);
      const clone = api.evaluate(cloneInput);

      const saveInput = JSON.parse(JSON.stringify(cloneInput));
      saveInput.snapshotId = "M4-SAVE";
      saveInput.energy.amount = 12500;
      const save = api.evaluate(saveInput);

      const mirrorInput = JSON.parse(JSON.stringify(base));
      mirrorInput.snapshotId = "M4-MIRROR";
      mirrorInput.activeTarget = "Expansion territory";
      mirrorInput.energy.amount = 5000;
      mirrorInput.abilities[1] = ability("HOUSE_OF_MIRRORS", "House of Mirrors", "territory rate", {
        available: true, energyCost: 2500, projectedGain: 50000, gainRatio: 0.8, targetAligned: true,
      });
      const mirror = api.evaluate(mirrorInput);

      const rushInput = JSON.parse(JSON.stringify(base));
      rushInput.snapshotId = "M4-RUSH";
      rushInput.energy.amount = 3000;
      rushInput.energy.reserveRequired = 500;
      rushInput.abilities[3] = ability("MEAT_RUSH", "Meat Rush", "meat", {
        available: true, energyCost: 1600, projectedGain: 100000000000, gainRatio: 2, targetAligned: true,
      });
      const rush = api.evaluate(rushInput);

      window.kbcSwarmBot.runOnce();
      const inspector = window.kbcSwarmBot.getStrategyInspector?.() || {};
      return { clone, save, mirror, rush, cloneUnchanged: JSON.stringify(cloneInput) === cloneBefore, inspector };
    });

    for (const result of [report.clone, report.save, report.mirror, report.rush]) {
      assert(result.schemaVersion === "energy-ability-timing-advisor.v1", "unexpected M4 advisor schema");
      assert(result.mode === "advisor-only", "M4 advisor left advisor-only mode");
      assert(result.executionAuthority === false, "M4 advisor gained execution authority");
      assert(result.branches.every((branch) => branch.snapshotId === result.snapshotId), "branches did not use one immutable snapshot identity");
      assert(result.branches.every((branch) => branch.activeMilestone === result.activeMilestone), "branches did not use one milestone model");
      assert(result.bestNonCastAlternative.actionId === "WAIT", "explicit non-cast alternative is missing");
      assert(result.branches.every((branch) => branch.postActionPolicy.includes("no downstream purchases or casts are assumed")), "post-action policy invented downstream spending");
      assert(result.reconsiderCondition && result.reconsiderCondition !== "none", "recommendation lacks a reconsider condition");
      assert(!result.branches.some((branch) => branch.actionId === "SWARMWARP"), "unverified Swarmwarp entered M4 scope");
    }

    assert(report.clone.recommendation === "CAST_NOW" && report.clone.recommendedActionId === "CLONE_LARVAE", "Clone Larvae cannot honestly win a prepared state");
    assert(report.save.recommendation === "SAVE" && report.save.recommendedActionId === "WAIT", "reserve violation did not select WAIT/save");
    assert(report.mirror.recommendedActionId === "HOUSE_OF_MIRRORS", "House of Mirrors cannot honestly win an aligned state");
    assert(report.rush.recommendedActionId === "MEAT_RUSH", "source-verified Rush cannot honestly win an aligned state");
    assert(report.cloneUnchanged, "M4 advisor mutated its input snapshot");
    assert(report.inspector.abilityTimingExecutionAuthority === "advisor-only", "Inspector does not preserve advisor-only authority");
    assert(report.inspector.abilityTimingReconsiderCondition, "Inspector lacks reconsider guidance");
  } finally {
    await browser.close();
  }

  console.log("BOOK00 M4 ABILITY TIMING ADVISOR CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
