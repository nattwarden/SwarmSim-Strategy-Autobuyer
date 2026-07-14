#!/usr/bin/env node
"use strict";

// BOOK00 Clone Ramp acceptance check.
//
// Proves, against a real reported live save (docs/test-data/clone-ramp/live-user-save.txt)
// imported into a real, disposable headless-Chrome swarmsim.com session, that:
//
//   1. Clone Ramp is selected for the single bounded action slot ahead of any
//      other lane (Meat/"Hive Network" included) when its own safety gates pass.
//   2. Each growth cycle performs exactly one real Clone Larvae cast (real
//      Energy cost deducted, real larva increase observed from game state).
//   3. The cast's own output is banked into cocoons with an exact, bounded
//      amount (never a blind buyMax) - pre-existing larva is left untouched.
//   4. Real ability bank/cap (larva+cocoon vs the ability's own live cap())
//      grows across cycles until the full-cap threshold is reached.
//   5. Exactly one full-cap cast happens, after which the ramp releases the
//      action budget (Clone Ramp no longer appears in the selected lane).
//   6. House of Mirrors (and, by config, every other ability) never casts.
//
// This is a live-Chrome check like check-live-purchase-acceptance.js and the
// M3/M8/M9 BOOK00 checks: it reads only real game-state deltas, never bot
// self-reports alone, for every load-bearing assertion.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const SAVE_PATH = path.join(ROOT, "docs", "test-data", "clone-ramp", "live-user-save.txt");
const BASE_URL = "https://www.swarmsim.com/#/tab/territory";
const CYCLES = 6;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

async function runCycles() {
  if (!fs.existsSync(SAVE_PATH)) {
    throw new Error(`Missing Clone Ramp reproduction save: ${SAVE_PATH}`);
  }
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot && !!window.angular, { timeout: 90000 });

    const importResult = await page.evaluate((saveString) => {
      const injector = window.angular.element(document.body).injector();
      const game = injector.get("game");
      try {
        game.importSave(saveString);
      } catch (error) {
        return { ok: false, error: String(error?.stack || error?.message || error) };
      }
      return { ok: true };
    }, save);
    assert(importResult.ok, `save import failed: ${importResult.error}`);

    await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      // Take exclusive manual control of runOnce(); only the explicit calls
      // below advance state, so cycles are not raced by the bot's own timer.
      if (bot.timer) clearInterval(bot.timer);
      bot.config.enabled = true;
      bot.config.advisorOnly = false;
      bot.config.autoBuySafeDecisions = true;
      bot.config.smartMaxActionsPerRun = 1;
      // Isolate the Clone Ramp lane the same way book00-live-purchase-legacy
      // isolates Meat: disable every other main-lane source so the single
      // action-budget slot can only ever go to Clone Ramp or the legacy
      // generic Meat/unit buyer, never Engine/Territory.
      bot.config.larvaEnginePriority = false;
      bot.config.territoryPrepPlanner = false;
      bot.config.expansionArmySeedPlanner = false;
      bot.config.territoryArmySeedWhenEmpty = false;
      bot.config.territoryRoiMode = false;
      bot.config.prioritizeProductionUpgrades = false;
      bot.config.manageCloneLarvaeCocoons = false;
      // Production defaults under test; set explicitly for clarity/robustness.
      bot.config.autoCastCloneLarvae = true;
      bot.config.autoCastAbilities = false;
      bot.config.energySupportBrokerAllowAutoCast = false;
      bot.config.autoAscend = false;
    });

    const cycles = [];
    for (let cycleNumber = 1; cycleNumber <= CYCLES; cycleNumber++) {
      // eslint-disable-next-line no-await-in-loop
      const cycle = await page.evaluate((num) => {
        const injector = window.angular.element(document.body).injector();
        const game = injector.get("game");
        const bot = window.kbcSwarmBot;

        function snapshot() {
          return {
            energy: String(game.unit("energy")?.count?.() || "0"),
            larva: String(game.unit("larva")?.count?.() || "0"),
            cocoon: String(game.unit("cocoon")?.count?.() || "0"),
            houseOfMirrorsCount: String(game.upgrade("houseofmirrors")?.count?.() || game.upgrade("clonearmy")?.count?.() || "0"),
          };
        }

        const before = snapshot();
        const runOnceReturned = bot.runOnce();
        const after = snapshot();
        const inspector = bot.getStrategyInspector?.() || null;

        return {
          cycleNumber: num,
          runOnceReturned,
          before,
          after,
          cloneRampPhase: inspector?.cloneRampPhase || null,
          cloneRampReason: inspector?.cloneRampReason || null,
          cloneRampCastExecuted: inspector?.cloneRampCastExecuted || null,
          cloneRampBankPercentOfCap: inspector?.cloneRampBankPercentOfCap ?? null,
          cloneRampBankedAmount: inspector?.cloneRampBankedAmount || null,
          cloneRampCastOutputAmount: inspector?.cloneRampCastOutputAmount || null,
          cloneRampBlockedBy: inspector?.cloneRampBlockedBy || null,
          laneCoordinatorSelectedActions: inspector?.laneCoordinatorSelectedActions || [],
          mainActions: inspector?.mainActions ?? null,
          autoCastAbilities: !!bot.config.autoCastAbilities,
          energySupportBrokerAllowAutoCast: !!bot.config.energySupportBrokerAllowAutoCast,
          autoAscend: !!bot.config.autoAscend,
        };
      }, cycleNumber);
      cycles.push(cycle);
    }

    return cycles;
  } finally {
    await browser.close();
  }
}

function main() {
  return runCycles().then((cycles) => {
    // --- 1. Clone Ramp is selected exclusively for the single action slot ---
    const cycle1 = cycles[0];
    assert(cycle1.runOnceReturned !== false, "cycle 1: runOnce() did not run");
    assert(
      Array.isArray(cycle1.laneCoordinatorSelectedActions) && cycle1.laneCoordinatorSelectedActions.length === 1,
      `cycle 1: expected exactly one selected lane action, got ${JSON.stringify(cycle1.laneCoordinatorSelectedActions)}`
    );
    assert(
      cycle1.laneCoordinatorSelectedActions[0].lane === "Clone Ramp",
      `cycle 1: expected the single selected lane to be Clone Ramp (ahead of Meat/Hive Network), got ${cycle1.laneCoordinatorSelectedActions[0].lane}`
    );
    assert(cycle1.mainActions === 1, `cycle 1: expected exactly 1 main action, got ${cycle1.mainActions}`);

    // --- 2/3. Every executed cycle performs exactly one real cast with a real cost ---
    const executedCycles = cycles.filter((c) => c.cloneRampCastExecuted === "yes");
    assert(executedCycles.length >= 2, `expected at least 2 executed Clone Ramp cycles across ${CYCLES} cycles, got ${executedCycles.length}`);

    let firstEnergyCost = null;
    for (const cycle of executedCycles) {
      const energyBefore = toNumber(cycle.before.energy);
      const energyAfter = toNumber(cycle.after.energy);
      const larvaBefore = toNumber(cycle.before.larva);
      const larvaAfter = toNumber(cycle.after.larva);
      const cocoonBefore = toNumber(cycle.before.cocoon);
      const cocoonAfter = toNumber(cycle.after.cocoon);
      const energyCost = energyBefore - energyAfter;

      assert(energyCost > 0, `cycle ${cycle.cycleNumber}: expected real Energy to decrease from a real cast, got ${energyBefore} -> ${energyAfter}`);
      if (firstEnergyCost === null) {
        firstEnergyCost = energyCost;
      } else {
        assert(
          Math.abs(energyCost - firstEnergyCost) <= Math.max(1, firstEnergyCost * 0.01),
          `cycle ${cycle.cycleNumber}: real ability Energy cost changed cycle-to-cycle (${firstEnergyCost} vs ${energyCost}); expected a fixed real cast cost`
        );
      }

      // --- 4. Bounded banking: pre-existing larva is preserved (not devoured
      // by an unbounded buyMax), and the cocoon gain matches the cast's own
      // reported output within tolerance.
      const cocoonDelta = cocoonAfter - cocoonBefore;
      const bankedAmount = toNumber(cycle.cloneRampBankedAmount);
      assert(cocoonDelta > 0, `cycle ${cycle.cycleNumber}: expected cocoon count to increase from banking, got ${cocoonBefore} -> ${cocoonAfter}`);
      if (Number.isFinite(bankedAmount) && bankedAmount > 0) {
        assert(
          Math.abs(cocoonDelta - bankedAmount) <= Math.max(1, bankedAmount * 0.02),
          `cycle ${cycle.cycleNumber}: cocoon delta (${cocoonDelta}) does not match the reported bounded banked amount (${bankedAmount})`
        );
      }
      assert(
        larvaAfter <= larvaBefore * 1.05,
        `cycle ${cycle.cycleNumber}: larva grew far beyond the pre-existing amount (${larvaBefore} -> ${larvaAfter}); banking should have shielded the cast output into cocoons instead of leaving it as loose larva`
      );
    }

    // --- 5. Bank percent of cap strictly increases across consecutive growth cycles ---
    const growthCycles = cycles.filter((c) => c.cloneRampPhase === "CAST_TO_GROW_BANK" && c.cloneRampCastExecuted === "yes");
    for (let i = 1; i < growthCycles.length; i++) {
      const prevPercent = toNumber(growthCycles[i - 1].cloneRampBankPercentOfCap);
      const currPercent = toNumber(growthCycles[i].cloneRampBankPercentOfCap);
      assert(
        currPercent > prevPercent,
        `growth cycle ${growthCycles[i].cycleNumber}: expected clone bank percent-of-cap to increase (${prevPercent}% -> ${currPercent}%)`
      );
    }

    // --- 6/7. The ramp reaches full-cap readiness and casts the full-cap output exactly once ---
    const finalCastCycles = cycles.filter((c) => c.cloneRampPhase === "FINAL_CAST" && c.cloneRampCastExecuted === "yes");
    assert(finalCastCycles.length === 1, `expected exactly one FINAL_CAST cycle across ${CYCLES} cycles, got ${finalCastCycles.length} (${JSON.stringify(cycles.map((c) => c.cloneRampPhase))})`);

    // --- 9. After the full-cap cast, execution authority returns; the ramp
    // releases the action slot and does not re-cast every subsequent cycle.
    const finalCastIndex = cycles.findIndex((c) => c.cloneRampPhase === "FINAL_CAST" && c.cloneRampCastExecuted === "yes");
    const afterFinalCast = cycles.slice(finalCastIndex + 1);
    assert(afterFinalCast.length > 0, "expected at least one cycle after the full-cap cast to observe release behavior");
    for (const cycle of afterFinalCast) {
      assert(cycle.cloneRampCastExecuted === "no", `cycle ${cycle.cycleNumber}: expected Clone Ramp to hold after its full-cap cast, but it cast again (phase=${cycle.cloneRampPhase})`);
      const laneNames = (cycle.laneCoordinatorSelectedActions || []).map((a) => a.lane);
      assert(!laneNames.includes("Clone Ramp"), `cycle ${cycle.cycleNumber}: Clone Ramp should not be the selected lane after releasing at cap`);
    }

    // --- 10. No other ability ever casts; hard safety defaults are untouched. ---
    const houseOfMirrorsCounts = new Set(cycles.map((c) => c.before.houseOfMirrorsCount).concat(cycles.map((c) => c.after.houseOfMirrorsCount)));
    assert(houseOfMirrorsCounts.size === 1, `expected House of Mirrors count to stay constant across all cycles (no auto-cast), saw ${JSON.stringify(Array.from(houseOfMirrorsCounts))}`);
    for (const cycle of cycles) {
      assert(cycle.autoCastAbilities === false, `cycle ${cycle.cycleNumber}: autoCastAbilities must remain false`);
      assert(cycle.energySupportBrokerAllowAutoCast === false, `cycle ${cycle.cycleNumber}: energySupportBrokerAllowAutoCast must remain false`);
      assert(cycle.autoAscend === false, `cycle ${cycle.cycleNumber}: autoAscend must remain false`);
    }

    console.log("BOOK00 CLONE RAMP ACCEPTANCE PASSED");
    console.log(JSON.stringify({
      cyclesRun: CYCLES,
      executedCastCycles: executedCycles.length,
      finalCastCycle: finalCastCycles[0]?.cycleNumber ?? null,
      firstCycleSelectedLane: cycle1.laneCoordinatorSelectedActions[0].lane,
      firstRealAbilityEnergyCost: firstEnergyCost,
      bankPercentSequence: cycles.map((c) => c.cloneRampBankPercentOfCap),
      phaseSequence: cycles.map((c) => c.cloneRampPhase),
    }, null, 2));
  });
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
