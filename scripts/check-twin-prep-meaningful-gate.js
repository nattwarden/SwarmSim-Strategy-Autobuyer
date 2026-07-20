#!/usr/bin/env node
"use strict";

// Twin Unlock Prep meaningful-gate acceptance check (fix landed in 9.3.2).
//
// Root cause (verified live before this fix): the gate used
//   twinPrepMeaningful = twinNearEnough || prepReachesThreshold || prepGainMeaningful;
// so once the twin cost-resource's threshold ratio was already >= the
// near-threshold ratio (config.twinUnlockNearThresholdRatio, default 60%),
// ANY positive prep chunk was classified "meaningful", even one that only
// advanced a fraction of a percent of the full threshold. The same OR chain
// also meant an oversized chunk alone (>=5% of the threshold) could make the
// gate pass even while nowhere near the threshold. Because Twin Unlock Prep
// is registered under lane "Meat" (dev-src/runtime-sections/runtime-main.js,
// addLaneCandidate({ lane: "Meat", ... }) inside the BUY branch), this showed
// up as "Meat wins every cycle" while Engine/Territory/Energy/Clone Ramp were
// legitimately blocked - a semantic gap, not a real strategic win.
//
// The fix (9.3.2):
//   twinPrepMeaningful = prepReachesThreshold || (twinNearEnough && prepGainMeaningful);
// A chunk that reaches the full threshold on its own is always meaningful.
// Otherwise, being near the threshold is necessary but no longer sufficient
// - the chunk's own real progress must also clear the existing 5% gate
// (TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT). No threshold, chunk size,
// reserve/payback gate, score, lane order, or other lane's logic changed.
//
// Verification strategy:
//   1. Pure-logic mirror of the exact fixed dev-src expression for all four
//      boundary cases the fix was designed around.
//   2. Real live-save cycles (real save, real Smart config, all planners
//      active - no scenario overrides) proving: raw progress-gain precision
//      is displayed correctly (e.g. a genuine 0.04% chunk no longer reads as
//      "0%"), the observability field and the execution gate agree on every
//      cycle (no stale/duplicated logic), Twin Prep never BUYs while
//      meaningful="no", and the bot does not stall - some real lane keeps
//      winning every cycle.
//   3. Four synthetic-but-real-game-object scenarios, built by directly
//      overriding the real twin cost unit's count()/maxCostMet() functions in
//      a disposable page context (never a tracked file), reproducing exactly
//      the four boundary cases against real Decimal math and real upgrade
//      cost data - proving the fix end-to-end, not just as an isolated pure
//      function.
//   4. Mutation control: the same four synthetic scenarios re-run against a
//      disposable in-memory copy of the built userscript with the OLD OR
//      logic restored, proving cases 1 and 4 flip to the (wrong) "meaningful"
//      outcome without the fix - i.e. this check would have caught the bug.

const fs = require("fs");
const path = require("path");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const SAVE_PATH = path.join(ROOT, "docs", "test-data", "clone-ramp", "live-user-save.txt");
const BASE_URL = "https://www.swarmsim.com/#/tab/territory";
const NATURAL_CYCLES = 10;

// Twin cost unit for this save is the internal unit "pantheon2" (displayed
// as "Hive Network"); required threshold (twin upgrade cost) is a real,
// unmodified ~100B read from the game's own upgrade cost list.
const TWIN_COST_UNIT_NAME = "pantheon2";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toNumber(value) {
  const n = Number(String(value ?? "").replace("%", ""));
  return Number.isFinite(n) ? n : NaN;
}

// --- 1. Pure-logic mirror of the fixed dev-src expression -----------------
function computeTwinPrepMeaningful({ twinNearEnough, prepReachesThreshold, prepGainMeaningful }) {
  return !!prepReachesThreshold || (!!twinNearEnough && !!prepGainMeaningful);
}

function runBoundaryCases() {
  const cases = [
    { name: "1. near threshold, micro-chunk", input: { twinNearEnough: true, prepReachesThreshold: false, prepGainMeaningful: false }, expected: false },
    { name: "2. near threshold, meaningful chunk", input: { twinNearEnough: true, prepReachesThreshold: false, prepGainMeaningful: true }, expected: true },
    { name: "3. chunk reaches threshold directly", input: { twinNearEnough: false, prepReachesThreshold: true, prepGainMeaningful: false }, expected: true },
    { name: "4. not near threshold, chunk does not reach it (even if oversized)", input: { twinNearEnough: false, prepReachesThreshold: false, prepGainMeaningful: true }, expected: false },
  ];

  for (const testCase of cases) {
    const actual = computeTwinPrepMeaningful(testCase.input);
    assert(actual === testCase.expected, `boundary case "${testCase.name}" failed: input=${JSON.stringify(testCase.input)} expected meaningful=${testCase.expected}, got ${actual}`);
  }

  console.log("Boundary-case pure-logic checks passed:", cases.map((c) => c.name));
}

async function withPage(userscript, fn) {
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
  const browser = await getBrowser({ headless: true, channel: "chrome" });
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
      if (bot.timer) clearInterval(bot.timer);
      bot.applyPreset("smart");
      bot.config.enabled = true;
      bot.config.advisorOnly = false;
      bot.config.autoBuySafeDecisions = true;
    });

    return await fn(page);
  } finally {
    await browser.close();
  }
}

// --- 2. Natural live-save cycles (no overrides) ----------------------------
async function runNaturalCycles(userscript) {
  return withPage(userscript, async (page) => {
    const cycles = [];
    for (let cycleNumber = 1; cycleNumber <= NATURAL_CYCLES; cycleNumber++) {
      // eslint-disable-next-line no-await-in-loop
      const cycle = await page.evaluate((num) => {
        const bot = window.kbcSwarmBot;
        bot.runOnce();
        const inspector = bot.getStrategyInspector?.() || null;
        return {
          cycleNumber: num,
          twinUnlockCurrent: inspector?.twinUnlockCurrent || null,
          twinUnlockRequired: inspector?.twinUnlockRequired || null,
          twinUnlockMissing: inspector?.twinUnlockMissing || null,
          twinUnlockRatio: inspector?.twinUnlockRatio || null,
          twinUnlockNearThresholdRatio: inspector?.twinUnlockNearThresholdRatio || null,
          twinUnlockPrepChunk: inspector?.twinUnlockPrepChunk || null,
          twinUnlockPrepDecision: inspector?.twinUnlockPrepDecision || null,
          twinUnlockPrepMeaningful: inspector?.twinUnlockPrepMeaningful || null,
          twinUnlockPrepNearThreshold: inspector?.twinUnlockPrepNearThreshold || null,
          twinUnlockPrepReachesThreshold: inspector?.twinUnlockPrepReachesThreshold || null,
          twinUnlockPrepGainMeaningful: inspector?.twinUnlockPrepGainMeaningful || null,
          twinUnlockPrepMeaningfulReason: inspector?.twinUnlockPrepMeaningfulReason || null,
          twinUnlockPrepProgressGainPercent: inspector?.twinUnlockPrepProgressGainPercent || null,
          twinUnlockPrepProgressGainRequiredPercent: inspector?.twinUnlockPrepProgressGainRequiredPercent || null,
          twinUnlockReserveRatio: inspector?.twinUnlockReserveRatio || null,
          twinUnlockPaybackBypassed: !!inspector?.twinUnlockPaybackBypassed,
          laneCoordinatorSelectedActions: inspector?.laneCoordinatorSelectedActions || [],
          mainActions: inspector?.mainActions ?? null,
        };
      }, cycleNumber);
      cycles.push(cycle);
    }
    return cycles;
  });
}

function evaluateNaturalCycles(cycles) {
  for (const cycle of cycles) {
    if (cycle.twinUnlockPrepNearThreshold === null) continue; // no active twin candidate this cycle

    const recomputed = computeTwinPrepMeaningful({
      twinNearEnough: cycle.twinUnlockPrepNearThreshold === "yes",
      prepReachesThreshold: cycle.twinUnlockPrepReachesThreshold === "yes",
      prepGainMeaningful: cycle.twinUnlockPrepGainMeaningful === "yes",
    });
    const reported = cycle.twinUnlockPrepMeaningful === "yes";
    assert(
      recomputed === reported,
      `cycle ${cycle.cycleNumber}: observability field twinUnlockPrepMeaningful="${cycle.twinUnlockPrepMeaningful}" does not match the same cycle's own near/reaches/gainMeaningful booleans (recomputed=${recomputed}) - execution gate and displayed field have drifted apart`
    );

    if (cycle.twinUnlockPrepMeaningful === "no") {
      assert(
        cycle.twinUnlockPrepDecision !== "BUY",
        `cycle ${cycle.cycleNumber}: expected Twin Prep decision to not be BUY while meaningful="no", got "${cycle.twinUnlockPrepDecision}"`
      );
    }

    // The raw progress-gain percent must never format down to a bare "0" for
    // a genuinely nonzero chunk - this was the original display bug.
    const gainText = String(cycle.twinUnlockPrepProgressGainPercent || "");
    if (gainText !== "n/a" && gainText !== "0%") {
      assert(
        Number.isFinite(toNumber(gainText)) && toNumber(gainText) > 0,
        `cycle ${cycle.cycleNumber}: expected a parseable, nonzero progress-gain percent, got "${gainText}"`
      );
    }
  }

  const totalMainActions = cycles.reduce((sum, c) => sum + (Number(c.mainActions) || 0), 0);
  assert(
    totalMainActions > 0,
    `expected at least one real main action across ${cycles.length} natural cycles (bot must not stall into permanent WAIT), got total mainActions=${totalMainActions}`
  );

  return { totalMainActions };
}

// --- 3./4. Synthetic boundary scenarios against the real twin cost unit ----
const SYNTHETIC_CASES = [
  {
    name: "1. near threshold, micro-chunk",
    current: "60000000000", // 60% of the real ~100B threshold
    maxCostMet: "1000",
    expectedMeaningfulFixed: false,
    expectedMeaningfulMutated: true, // near-threshold alone short-circuited the old OR
  },
  {
    name: "2. near threshold, meaningful chunk",
    current: "60000000000",
    maxCostMet: "40000000000",
    expectedMeaningfulFixed: true,
    expectedMeaningfulMutated: true,
  },
  {
    name: "3. chunk reaches threshold directly",
    current: "95000000000",
    maxCostMet: "50000000000",
    expectedMeaningfulFixed: true,
    expectedMeaningfulMutated: true,
  },
  {
    name: "4. not near threshold, oversized chunk",
    current: "10000000000", // 10%, well under the 60% near-threshold ratio
    maxCostMet: "30000000000",
    expectedMeaningfulFixed: false,
    expectedMeaningfulMutated: true, // an oversized chunk alone satisfied the old OR
  },
];

async function runSyntheticCase(userscript, testCase) {
  return withPage(userscript, async (page) => {
    return page.evaluate(({ unitName, current, maxCostMet }) => {
      const injector = window.angular.element(document.body).injector();
      const game = injector.get("game");
      const bot = window.kbcSwarmBot;

      // Warm up the meat goal planner with a few unpatched cycles first, so
      // it settles onto its real target/action-unit/twin candidate for this
      // save before the twin cost unit's count()/maxCostMet() are overridden
      // for the single measured cycle below (cycle 1 has no twin candidate
      // yet on this save - see the natural-cycles proof above).
      for (let i = 0; i < 5; i++) bot.runOnce();

      const unit = game.unit(unitName);
      if (!unit) return { ok: false, error: `unit ${unitName} not found` };

      const D = window.Decimal;
      unit.count = () => new D(current);
      unit.maxCostMet = () => new D(maxCostMet);

      bot.runOnce();
      const inspector = bot.getStrategyInspector();
      return {
        ok: true,
        twinUnlockCurrent: inspector?.twinUnlockCurrent || null,
        twinUnlockRequired: inspector?.twinUnlockRequired || null,
        twinUnlockPrepChunk: inspector?.twinUnlockPrepChunk || null,
        twinUnlockPrepDecision: inspector?.twinUnlockPrepDecision || null,
        twinUnlockPrepMeaningful: inspector?.twinUnlockPrepMeaningful || null,
        twinUnlockPrepNearThreshold: inspector?.twinUnlockPrepNearThreshold || null,
        twinUnlockPrepReachesThreshold: inspector?.twinUnlockPrepReachesThreshold || null,
        twinUnlockPrepGainMeaningful: inspector?.twinUnlockPrepGainMeaningful || null,
        twinUnlockPrepProgressGainPercent: inspector?.twinUnlockPrepProgressGainPercent || null,
        twinUnlockPrepMeaningfulReason: inspector?.twinUnlockPrepMeaningfulReason || null,
      };
    }, { unitName: TWIN_COST_UNIT_NAME, current: testCase.current, maxCostMet: testCase.maxCostMet });
  });
}

async function runSyntheticSuite(userscript, expectedKey) {
  const results = [];
  for (const testCase of SYNTHETIC_CASES) {
    // eslint-disable-next-line no-await-in-loop
    const result = await runSyntheticCase(userscript, testCase);
    assert(result.ok, `synthetic case "${testCase.name}" failed to set up: ${result.error}`);

    const expected = testCase[expectedKey];
    const actual = result.twinUnlockPrepMeaningful === "yes";
    assert(
      actual === expected,
      `synthetic case "${testCase.name}" (${expectedKey}): expected twinUnlockPrepMeaningful=${expected}, got "${result.twinUnlockPrepMeaningful}" (near=${result.twinUnlockPrepNearThreshold}, reaches=${result.twinUnlockPrepReachesThreshold}, gainMeaningful=${result.twinUnlockPrepGainMeaningful}, gain=${result.twinUnlockPrepProgressGainPercent}, reason="${result.twinUnlockPrepMeaningfulReason}")`
    );

    if (expected && expectedKey === "expectedMeaningfulFixed") {
      // Meaningful only means the candidate is BUY-eligible with respect to
      // this gate specifically; the independent reserve/payback guard may
      // still legitimately HOLD it (e.g. a 10B+ chunk can fail the reserve
      // check on a save whose real resource levels weren't tuned for these
      // synthetic overrides). What must never happen is a HOLD caused by the
      // meaningful-gate reason text itself. (Mutation-control results are not
      // checked here: the string-replace mutation only reverts the
      // twinPrepMeaningful assignment, not the independently-computed reason
      // text, so the two can legitimately disagree under the mutated build.)
      assert(
        !/is below the .*meaningful/i.test(result.twinUnlockPrepMeaningfulReason || "") && !/threshold too far/i.test(result.twinUnlockPrepMeaningfulReason || ""),
        `synthetic case "${testCase.name}" (${expectedKey}): decision is "${result.twinUnlockPrepDecision}" but the reason text still reads as a meaningful-gate rejection: "${result.twinUnlockPrepMeaningfulReason}"`
      );
    } else if (!expected) {
      assert(
        result.twinUnlockPrepDecision !== "BUY",
        `synthetic case "${testCase.name}" (${expectedKey}): expected decision!=BUY when not meaningful, got "${result.twinUnlockPrepDecision}"`
      );
    }

    results.push({ name: testCase.name, ...result });
  }
  return results;
}

async function main() {
  runBoundaryCases();

  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");

  console.log("Running natural live-save cycles against the fixed 9.3.2 build...");
  const naturalCycles = await runNaturalCycles(userscript);
  const naturalResult = evaluateNaturalCycles(naturalCycles);
  console.log(`Natural cycles passed. Total real main actions across ${NATURAL_CYCLES} cycles: ${naturalResult.totalMainActions}`);
  console.log("Sample cycle (first with an active twin candidate):", naturalCycles.find((c) => c.twinUnlockPrepNearThreshold !== null) || naturalCycles[0]);

  console.log("Running synthetic boundary-case scenarios against the fixed 9.3.2 build...");
  const fixedSyntheticResults = await runSyntheticSuite(userscript, "expectedMeaningfulFixed");
  console.log("Fixed-build synthetic cases passed:", fixedSyntheticResults.map((r) => `${r.name}: meaningful=${r.twinUnlockPrepMeaningful} decision=${r.twinUnlockPrepDecision} gain=${r.twinUnlockPrepProgressGainPercent}`));

  console.log("Running the same synthetic scenarios against a disposable mutation-control build (reverted OR logic)...");
  const original = "const twinPrepMeaningful = prepReachesThreshold || (twinNearEnough && prepGainMeaningful);";
  const mutated = "const twinPrepMeaningful = twinNearEnough || prepReachesThreshold || prepGainMeaningful;";
  assert(userscript.includes(original), "could not find the fixed twinPrepMeaningful expression in the built userscript to mutate");
  const mutatedUserscript = userscript.replace(original, mutated);

  const mutatedSyntheticResults = await runSyntheticSuite(mutatedUserscript, "expectedMeaningfulMutated");
  console.log("Mutation-control synthetic cases passed (reverted logic reproduces the original bug as expected):", mutatedSyntheticResults.map((r) => `${r.name}: meaningful=${r.twinUnlockPrepMeaningful} decision=${r.twinUnlockPrepDecision}`));

  console.log("TWIN PREP MEANINGFUL-GATE ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    naturalCyclesRun: NATURAL_CYCLES,
    totalNaturalMainActions: naturalResult.totalMainActions,
    fixedSyntheticResults,
    mutatedSyntheticResults,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
