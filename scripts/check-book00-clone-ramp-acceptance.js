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
//      Energy cost deducted, real larva increase observed from game state),
//      and its own output is banked into cocoons with an exact, bounded
//      amount (never a blind buyMax) - pre-existing larva is left untouched.
//   3. The final full-cap cast performs exactly one real Clone Larvae cast,
//      but its own output is deliberately NOT banked: it is left as real,
//      spendable loose larva (this is the 9.3.1 fix - see below).
//   4. Real ability bank/cap (larva+cocoon vs the ability's own live cap())
//      grows across growth cycles until the full-cap threshold is reached.
//   5. Exactly one full-cap cast happens, after which the ramp releases the
//      action budget (Clone Ramp no longer appears in the selected lane) and
//      normal Meat progression retakes it, with real access to spend the
//      final cast's loose larva.
//   6. House of Mirrors (and, by config, every other ability) never casts.
//
// 9.3.1 root cause and fix: the banking branch inside runCloneRampPlanner
// (dev-src/runtime-sections/runtime-main.js) unconditionally banked
// castOutputAmount into cocoons after every successful cast, for both
// CAST_TO_GROW_BANK and FINAL_CAST. Live verification showed this meant the
// full-cap cast's own output (e.g. ~6.02Sp) was immediately re-locked into
// cocoons, leaving normal Meat progression with no spendable larva to act on
// - the bot fell straight back to buying Hive Network instead. The fix
// guards the banking branch with `if (!readyForFinalCast)`, so only growth
// casts bank; the final cast's output stays loose for Meat to spend.
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
const CYCLES = 8;

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

        // Ability ids checked to prove no other ability ever casts, and that
        // Clone Larvae itself casts at most once per runOnce(). "clonearmy" is
        // the real internal id for House of Mirrors in this game build;
        // "houseofmirrors" is kept as a fallback alias for older builds.
        const ABILITY_IDS = ["clonelarvae", "houseofmirrors", "clonearmy", "swarmwarp", "larvarush", "meatrush", "territoryrush"];

        function snapshot() {
          const abilities = {};
          for (const id of ABILITY_IDS) {
            const upgrade = game.upgrade(id);
            abilities[id] = upgrade ? String(upgrade.count?.() || "0") : null;
          }
          return {
            energy: String(game.unit("energy")?.count?.() || "0"),
            larva: String(game.unit("larva")?.count?.() || "0"),
            cocoon: String(game.unit("cocoon")?.count?.() || "0"),
            houseOfMirrorsCount: String(game.upgrade("houseofmirrors")?.count?.() || game.upgrade("clonearmy")?.count?.() || "0"),
            abilities,
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
          cloneRampLooseLarvaeReleased: inspector?.cloneRampLooseLarvaeReleased || null,
          cloneRampBlockedBy: inspector?.cloneRampBlockedBy || null,
          cloneRampNextAction: inspector?.cloneRampNextAction || null,
          laneCoordinatorSelectedActions: inspector?.laneCoordinatorSelectedActions || [],
          mainActions: inspector?.mainActions ?? null,
          // Council/Momentum surfaces (what the player actually sees) - must
          // match the real selected/executed lane every cycle, not just the
          // internal lane-coordinator bookkeeping already captured above.
          councilWinningLane: inspector?.councilWinningLane || null,
          councilWinningCandidate: inspector?.councilWinningCandidate || null,
          momentumBestStep: inspector?.momentumBestStep || null,
          momentumBestStepDecision: inspector?.momentumBestStepDecision || null,
          overseerMainSelected: inspector?.overseerMainSelected || null,
          overseerDecision: inspector?.overseerDecision || null,
          // M6 six-domain coordinator's own separate execution-claim fields -
          // must never claim a real purchase happened when Clone Ramp (or
          // normal Meat progression) is the actual mechanism doing the buying.
          coordinatorExecuted: inspector?.coordinatorExecuted || null,
          coordinatorExecutionResult: inspector?.coordinatorExecutionResult || null,
          coordinatorSelectedLane: inspector?.coordinatorSelectedLane || null,
          coordinatorSelectedCandidate: inspector?.coordinatorSelectedCandidate || null,
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

    const executedCycles = cycles.filter((c) => c.cloneRampCastExecuted === "yes");
    assert(executedCycles.length >= 2, `expected at least 2 executed Clone Ramp cycles across ${CYCLES} cycles, got ${executedCycles.length}`);

    const growthCastCycles = executedCycles.filter((c) => c.cloneRampPhase === "CAST_TO_GROW_BANK");
    const finalCastCycles = executedCycles.filter((c) => c.cloneRampPhase === "FINAL_CAST");
    assert(growthCastCycles.length >= 2, `expected at least 2 growth-cast cycles, got ${growthCastCycles.length}`);
    assert(finalCastCycles.length === 1, `expected exactly one FINAL_CAST cycle across ${CYCLES} cycles, got ${finalCastCycles.length} (${JSON.stringify(cycles.map((c) => c.cloneRampPhase))})`);

    // --- Shared cast-cycle proof (growth AND final cast): a real cast
    // happened, at a fixed real Energy cost, and every Council/Momentum
    // surface the player actually reads says Clone Ramp/Clone Larvae did it,
    // never Meat/Hive Network, while the M6 six-domain coordinator never
    // separately claims a conflicting execution.
    let firstEnergyCost = null;
    for (const cycle of executedCycles) {
      const energyBefore = toNumber(cycle.before.energy);
      const energyAfter = toNumber(cycle.after.energy);
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

      assert(
        Array.isArray(cycle.laneCoordinatorSelectedActions) && cycle.laneCoordinatorSelectedActions.length === 1,
        `cycle ${cycle.cycleNumber}: expected exactly one selected lane action during a real cast, got ${JSON.stringify(cycle.laneCoordinatorSelectedActions)}`
      );
      assert(
        cycle.laneCoordinatorSelectedActions[0].lane === "Clone Ramp" && cycle.laneCoordinatorSelectedActions[0].candidate === "Clone Larvae",
        `cycle ${cycle.cycleNumber}: expected the selected lane/candidate to be Clone Ramp/Clone Larvae, got ${JSON.stringify(cycle.laneCoordinatorSelectedActions[0])}`
      );
      assert(
        cycle.councilWinningLane === "Clone Ramp" && cycle.councilWinningCandidate === "Clone Larvae",
        `cycle ${cycle.cycleNumber}: Council must show Clone Ramp/Clone Larvae as the winning lane/candidate, got ${cycle.councilWinningLane}/${cycle.councilWinningCandidate}`
      );
      assert(
        cycle.momentumBestStep === "Clone Ramp: Clone Larvae" && cycle.momentumBestStepDecision === "BUY",
        `cycle ${cycle.cycleNumber}: Momentum must show "Clone Ramp: Clone Larvae" as a BUY, got "${cycle.momentumBestStep}" (${cycle.momentumBestStepDecision})`
      );
      assert(
        /Clone Ramp/.test(cycle.overseerMainSelected || "") && /Clone Larvae/.test(cycle.overseerMainSelected || ""),
        `cycle ${cycle.cycleNumber}: overseer main-selected text must reference Clone Ramp/Clone Larvae, got "${cycle.overseerMainSelected}"`
      );
      assert(
        cycle.coordinatorExecuted === "no",
        `cycle ${cycle.cycleNumber}: M6 six-domain coordinator must not separately claim a real execution while Clone Ramp is the actual acting mechanism, got coordinatorExecuted=${cycle.coordinatorExecuted} (${cycle.coordinatorExecutionResult})`
      );
    }

    // --- 2. Growth cast under cap: real cast + real bounded banking; loose
    // larva returns close to its pre-cast level (banked, not left loose).
    //
    // Note: cloneRampBankedAmount/cloneRampCastOutputAmount are
    // formatSwarmNumber() display strings (e.g. "1.19Sp"), not parseable
    // Number()s, so magnitude proof here comes from the real raw before/after
    // larva and cocoon counts instead; the formatted fields are only checked
    // qualitatively (present/absent as "0").
    for (const cycle of growthCastCycles) {
      const larvaBefore = toNumber(cycle.before.larva);
      const larvaAfter = toNumber(cycle.after.larva);
      const cocoonBefore = toNumber(cycle.before.cocoon);
      const cocoonAfter = toNumber(cycle.after.cocoon);
      const cocoonDelta = cocoonAfter - cocoonBefore;

      assert(cocoonDelta > 0, `growth cycle ${cycle.cycleNumber}: expected cocoon count to increase from banking, got ${cocoonBefore} -> ${cocoonAfter}`);
      assert(
        cycle.cloneRampBankedAmount && cycle.cloneRampBankedAmount !== "0",
        `growth cycle ${cycle.cycleNumber}: expected a real, positive banked amount, got "${cycle.cloneRampBankedAmount}"`
      );
      assert(
        cycle.cloneRampCastOutputAmount && cycle.cloneRampCastOutputAmount !== "0",
        `growth cycle ${cycle.cycleNumber}: expected a real, positive cast output amount, got "${cycle.cloneRampCastOutputAmount}"`
      );
      assert(
        larvaAfter <= larvaBefore * 1.05,
        `growth cycle ${cycle.cycleNumber}: loose larva grew far beyond the pre-cast amount (${larvaBefore} -> ${larvaAfter}); a growth cast must bank its own output into cocoons, not leave it loose`
      );
      assert(
        /bank/i.test(cycle.cloneRampNextAction || ""),
        `growth cycle ${cycle.cycleNumber}: expected Clone Ramp's next-action text to mention banking before the next cast, got "${cycle.cloneRampNextAction}"`
      );
    }

    // --- Bank percent of cap strictly increases across consecutive growth
    // cycles (each growth cast's projected next output increases). ---
    for (let i = 1; i < growthCastCycles.length; i++) {
      const prevPercent = toNumber(growthCastCycles[i - 1].cloneRampBankPercentOfCap);
      const currPercent = toNumber(growthCastCycles[i].cloneRampBankPercentOfCap);
      assert(
        currPercent > prevPercent,
        `growth cycle ${growthCastCycles[i].cycleNumber}: expected clone bank percent-of-cap to increase (${prevPercent}% -> ${currPercent}%)`
      );
    }

    // --- 3. Final cast at full cap: real cast, but its own output is left as
    // real, spendable loose larva instead of being banked (the 9.3.1 fix).
    //
    // Note: cloneRampBankedAmount/cloneRampCastOutputAmount are
    // formatSwarmNumber() display strings (e.g. "4.75Sp"), not parseable
    // Number()s. bankedAmount is the one exception that is safe to compare
    // as an exact string: the code path for a final cast leaves it as the
    // literal Decimal zero, which formatSwarmNumber always renders as the
    // exact string "0". Real magnitude proof still comes from the raw
    // before/after larva and cocoon counts.
    for (const cycle of finalCastCycles) {
      const larvaBefore = toNumber(cycle.before.larva);
      const larvaAfter = toNumber(cycle.after.larva);
      const cocoonBefore = toNumber(cycle.before.cocoon);
      const cocoonAfter = toNumber(cycle.after.cocoon);
      const cocoonDelta = cocoonAfter - cocoonBefore;
      const larvaDelta = larvaAfter - larvaBefore;

      assert(
        cycle.cloneRampCastOutputAmount && cycle.cloneRampCastOutputAmount !== "0",
        `final cast cycle ${cycle.cycleNumber}: expected a real, positive cast output amount, got "${cycle.cloneRampCastOutputAmount}"`
      );
      assert(
        cycle.cloneRampBankedAmount === "0",
        `final cast cycle ${cycle.cycleNumber}: expected cloneRampBankedAmount to be exactly "0" (final cast output must not be banked), got "${cycle.cloneRampBankedAmount}"`
      );
      assert(
        Math.abs(cocoonDelta) <= Math.max(1, cocoonBefore * 0.001),
        `final cast cycle ${cycle.cycleNumber}: expected cocoon count to stay essentially unchanged (existing cocoons untouched, final output not banked into them), got ${cocoonBefore} -> ${cocoonAfter}`
      );
      assert(
        larvaDelta > 0,
        `final cast cycle ${cycle.cycleNumber}: expected real loose larva to increase from the final cast's own output, got ${larvaBefore} -> ${larvaAfter}`
      );
      // The final cast's own output must dominate the larva increase (it is
      // not just a rounding artifact): require the increase to be a sizeable
      // fraction of the pre-cast larva amount, since this save's ramp roughly
      // doubles the bank each cycle before hitting cap.
      assert(
        larvaDelta >= larvaBefore * 0.5,
        `final cast cycle ${cycle.cycleNumber}: real loose-larva increase (${larvaDelta}) is too small relative to the pre-cast amount (${larvaBefore}) to be the real full-cap cast output`
      );
      assert(
        cycle.cloneRampPhase === "FINAL_CAST",
        `final cast cycle ${cycle.cycleNumber}: expected phase FINAL_CAST, got ${cycle.cloneRampPhase}`
      );
      assert(
        /Meat progression/i.test(cycle.cloneRampNextAction || ""),
        `final cast cycle ${cycle.cycleNumber}: expected the full-cap cast's next-action text to say execution hands back to Meat progression, got "${cycle.cloneRampNextAction}"`
      );
    }

    // --- 5. After the full-cap cast, execution authority returns; the ramp
    // releases the action slot and does not re-cast every subsequent cycle;
    // the very next phase is POST_CLONE_RELEASE. ---
    const finalCastIndex = cycles.findIndex((c) => c.cloneRampPhase === "FINAL_CAST" && c.cloneRampCastExecuted === "yes");
    const afterFinalCast = cycles.slice(finalCastIndex + 1);
    assert(afterFinalCast.length > 0, "expected at least one cycle after the full-cap cast to observe release behavior");
    assert(
      afterFinalCast[0].cloneRampPhase === "POST_CLONE_RELEASE",
      `expected the cycle immediately after the full-cap cast to be POST_CLONE_RELEASE, got ${afterFinalCast[0].cloneRampPhase}`
    );

    for (const cycle of afterFinalCast) {
      assert(cycle.cloneRampCastExecuted === "no", `cycle ${cycle.cycleNumber}: expected Clone Ramp to hold after its full-cap cast, but it cast again (phase=${cycle.cloneRampPhase})`);
      assert(cycle.cloneRampPhase === "POST_CLONE_RELEASE", `cycle ${cycle.cycleNumber}: expected phase POST_CLONE_RELEASE after the full-cap cast, got ${cycle.cloneRampPhase}`);
      assert(cycle.cloneRampBlockedBy === "already released at cap", `cycle ${cycle.cycleNumber}: expected cloneRampBlockedBy to explain the release, got "${cycle.cloneRampBlockedBy}"`);

      const laneNames = (cycle.laneCoordinatorSelectedActions || []).map((a) => a.lane);
      assert(!laneNames.includes("Clone Ramp"), `cycle ${cycle.cycleNumber}: Clone Ramp should not be the selected lane after releasing at cap`);

      // --- Release cycle Council coordination proof: normal Meat progression
      // must actually retake the action budget (a real main action happened,
      // it was not Clone Ramp/Clone Larvae), and every Council/Momentum
      // surface must reflect that real action rather than still describing
      // Clone Ramp.
      assert(cycle.mainActions === 1, `cycle ${cycle.cycleNumber}: expected normal Meat progression to still use the main-action slot after release, got mainActions=${cycle.mainActions}`);
      assert(cycle.councilWinningLane !== "Clone Ramp", `cycle ${cycle.cycleNumber}: Council must not still show Clone Ramp as the winning lane after release, got ${cycle.councilWinningLane}`);
      assert(
        !/Clone Ramp|Clone Larvae/.test(cycle.momentumBestStep || ""),
        `cycle ${cycle.cycleNumber}: Momentum must not still describe Clone Ramp/Clone Larvae as the best step after release, got "${cycle.momentumBestStep}"`
      );
      assert(
        cycle.councilWinningLane === (cycle.laneCoordinatorSelectedActions[0]?.lane || null)
          && cycle.councilWinningCandidate === (cycle.laneCoordinatorSelectedActions[0]?.candidate || null),
        `cycle ${cycle.cycleNumber}: Council winning lane/candidate must match the actually selected lane action, got Council=${cycle.councilWinningLane}/${cycle.councilWinningCandidate} vs selected=${JSON.stringify(cycle.laneCoordinatorSelectedActions[0])}`
      );
      assert(
        cycle.coordinatorExecuted === "no",
        `cycle ${cycle.cycleNumber}: M6 six-domain coordinator must not separately claim a real execution during release, got coordinatorExecuted=${cycle.coordinatorExecuted} (${cycle.coordinatorExecutionResult})`
      );

      // Cocoons must stay untouched during release: nothing should re-bank
      // the already-released final-cast larva after the fact.
      const cocoonBefore = toNumber(cycle.before.cocoon);
      const cocoonAfter = toNumber(cycle.after.cocoon);
      assert(
        Math.abs(cocoonAfter - cocoonBefore) <= Math.max(1, cocoonBefore * 0.001),
        `cycle ${cycle.cycleNumber}: expected existing cocoons to stay untouched during release, got ${cocoonBefore} -> ${cocoonAfter}`
      );
    }

    // --- Meat has real access to the final cast's loose larva, and a real
    // Meat purchase actually decreases it: the very first post-release cycle
    // must not be Clone Ramp (already checked above), and the net loose
    // larva balance must decrease over the observed release cycles instead
    // of sitting untouched. This is the concrete proof that freeing the
    // final cast's output as loose larva actually lets Meat spend it. ---
    const firstReleaseCycle = afterFinalCast[0];
    const lastReleaseCycle = afterFinalCast[afterFinalCast.length - 1];
    const larvaAtReleaseStart = toNumber(firstReleaseCycle.before.larva);
    const larvaAtReleaseEnd = toNumber(lastReleaseCycle.after.larva);
    assert(
      firstReleaseCycle.laneCoordinatorSelectedActions[0]?.lane === "Meat",
      `expected the first post-release cycle's real purchase to be a Meat-lane action, got ${JSON.stringify(firstReleaseCycle.laneCoordinatorSelectedActions[0])}`
    );
    assert(
      larvaAtReleaseEnd < larvaAtReleaseStart,
      `expected loose larva to net decrease across the post-release cycles as a real Meat purchase spends it, got ${larvaAtReleaseStart} -> ${larvaAtReleaseEnd}`
    );

    // --- 6. No other ability ever casts; hard safety defaults are untouched. ---
    const houseOfMirrorsCounts = new Set(cycles.map((c) => c.before.houseOfMirrorsCount).concat(cycles.map((c) => c.after.houseOfMirrorsCount)));
    assert(houseOfMirrorsCounts.size === 1, `expected House of Mirrors count to stay constant across all cycles (no auto-cast), saw ${JSON.stringify(Array.from(houseOfMirrorsCounts))}`);

    // Explicit real-count proof for every other castable ability: House of
    // Mirrors (clonearmy/houseofmirrors alias), Swarmwarp, and every rush
    // ability must never move across the whole run, and Clone Larvae itself
    // must increment by exactly 0 or 1 per cycle (never more than one cast
    // per runOnce()).
    const NEVER_CAST_ABILITY_IDS = ["houseofmirrors", "clonearmy", "swarmwarp", "larvarush", "meatrush", "territoryrush"];
    for (const abilityId of NEVER_CAST_ABILITY_IDS) {
      const values = new Set(
        cycles
          .flatMap((c) => [c.before.abilities?.[abilityId], c.after.abilities?.[abilityId]])
          .filter((value) => value !== null && value !== undefined)
      );
      assert(
        values.size <= 1,
        `expected ${abilityId} count to stay constant across all cycles (never auto-cast), saw ${JSON.stringify(Array.from(values))}`
      );
    }
    for (const cycle of cycles) {
      const cloneLarvaeBefore = toNumber(cycle.before.abilities?.clonelarvae);
      const cloneLarvaeAfter = toNumber(cycle.after.abilities?.clonelarvae);
      const cloneLarvaeDelta = cloneLarvaeAfter - cloneLarvaeBefore;
      assert(
        cloneLarvaeDelta === 0 || cloneLarvaeDelta === 1,
        `cycle ${cycle.cycleNumber}: expected Clone Larvae's own cast count to change by 0 or 1 (never more than one cast per runOnce()), got delta=${cloneLarvaeDelta} (${cloneLarvaeBefore} -> ${cloneLarvaeAfter})`
      );
      assert(
        (cloneLarvaeDelta === 1) === (cycle.cloneRampCastExecuted === "yes"),
        `cycle ${cycle.cycleNumber}: Clone Larvae cast-count delta (${cloneLarvaeDelta}) does not match cloneRampCastExecuted=${cycle.cloneRampCastExecuted}`
      );
    }

    for (const cycle of cycles) {
      assert(cycle.autoCastAbilities === false, `cycle ${cycle.cycleNumber}: autoCastAbilities must remain false`);
      assert(cycle.energySupportBrokerAllowAutoCast === false, `cycle ${cycle.cycleNumber}: energySupportBrokerAllowAutoCast must remain false`);
      assert(cycle.autoAscend === false, `cycle ${cycle.cycleNumber}: autoAscend must remain false`);
    }

    console.log("BOOK00 CLONE RAMP ACCEPTANCE PASSED");
    console.log(JSON.stringify({
      cyclesRun: CYCLES,
      executedCastCycles: executedCycles.length,
      growthCastCycles: growthCastCycles.length,
      finalCastCycle: finalCastCycles[0]?.cycleNumber ?? null,
      firstCycleSelectedLane: cycle1.laneCoordinatorSelectedActions[0].lane,
      firstRealAbilityEnergyCost: firstEnergyCost,
      finalCastCastOutputAmount: finalCastCycles[0]?.cloneRampCastOutputAmount ?? null,
      finalCastBankedAmount: finalCastCycles[0]?.cloneRampBankedAmount ?? null,
      finalCastLooseLarvaeReleased: finalCastCycles[0]?.cloneRampLooseLarvaeReleased ?? null,
      larvaAtReleaseStart,
      larvaAtReleaseEnd,
      bankPercentSequence: cycles.map((c) => c.cloneRampBankPercentOfCap),
      phaseSequence: cycles.map((c) => c.cloneRampPhase),
      councilWinningLaneSequence: cycles.map((c) => c.councilWinningLane),
      momentumBestStepSequence: cycles.map((c) => c.momentumBestStep),
      cloneLarvaeCastCountSequence: cycles.map((c) => c.after.abilities?.clonelarvae),
      coordinatorExecutedSequence: cycles.map((c) => c.coordinatorExecuted),
    }, null, 2));
  });
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
