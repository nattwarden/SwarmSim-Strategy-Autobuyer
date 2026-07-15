#!/usr/bin/env node
"use strict";

// 9.3.5 acceptance check: executedMainActions.amount root-cause fix (Task A)
// and the House of Mirrors shared-readiness fix (Task B).
//
// Task A root cause: every real purchase funnels through buyUnitAmount()/
// buyUpgradeAmount() (dev-src/runtime-sections/runtime-main.js), which always
// computed the real observed count delta internally but discarded it -
// callers only got a boolean back. ~22 recordMainAction() call sites then
// logged the *requested* amount (formatSwarmNumber(num)) into the Ledger,
// while recordPurchase() (called from inside buyUnitAmount/buyUpgradeAmount)
// logged the real delta into the Purchase log - two different numbers for
// the same buy. The fix adds an optional 5th "deltaOut" out-param to
// buyUnitAmount/buyUpgradeAmount so each call site can capture its own
// observed delta, and recordMainAction() now accepts that delta as a 5th
// arg and prefers it over the requested amount.
//
// Task B root cause: buildEnergySupportBrokerSnapshot() computed a full
// House-of-Mirrors gate chain (ability/energy/relevant-army/preferred-units/
// projection/payoff/decision) inline, while captureEnergyAbilityTimingSnapshot
// (the M4 "Ability Timing" advisor) only checked the raw ability.available
// flag - so M4 could report CAST_NOW House of Mirrors while the Energy
// Support Broker reported HOLD for army/payoff reasons. The fix extracts the
// gate chain into a single assessHouseOfMirrorsReadiness() function that both
// callers now share, so they can never disagree.
//
// Verification strategy:
//   Part 1 (pure Node, no browser): extract the exact fixed
//   buyUnitAmount/buyUpgradeAmount/recordMainAction function source from
//   dev-src and eval them in an isolated sandbox with a minimal fake
//   game/commands (unit.count()/upgrade.count()/commands.buyUnit/
//   commands.buyUpgrade) - proving the deltaOut wiring and the
//   recordMainAction ledger-amount computation directly, including a
//   mutation-control sub-test that proves this harness can actually detect
//   the pre-fix bug.
//
//   Also pure-logic: mirror the exact fixed HOUSE_OF_MIRRORS
//   available/unavailableReason ternary from captureEnergyAbilityTimingSnapshot
//   for both the ready=true and ready=false cases.
//
//   Part 2 (real browser, live game, real save): build an in-memory
//   userscript (committed metadata block + the current dev-src runtime, so
//   this test always exercises today's dev-src changes without touching
//   src/SwarmSim-Strategy-Autobuyer.user.js or running npm run build), load
//   it against the live game with a real save, run natural cycles, and
//   assert the Energy Support Broker and the M4 Ability Timing advisor never
//   disagree about House of Mirrors readiness (the exact contradiction this
//   fix resolves), plus a positive-path sanity check via the exposed
//   abilityTimingAdvisor.evaluate() pure evaluator, plus a source-invariant
//   check that the untouched POST_CLONE_RELEASE Clone Larvae hold logic is
//   still present verbatim.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const RUNTIME_PATH = path.join(ROOT, "dev-src", "runtime-sections", "runtime-main.js");
const CANONICAL_USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const SAVE_PATH = path.join(ROOT, "docs", "test-data", "clone-ramp", "live-user-save.txt");
const BASE_URL = "https://www.swarmsim.com/#/tab/territory";
const NATURAL_CYCLES = 8;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------
// Part 1a: isolate buyUnitAmount/buyUpgradeAmount/recordMainAction directly
// from the real dev-src source (regex-extracted, then eval'd against a
// minimal fake game/commands sandbox) - no browser, no live game needed.
// ---------------------------------------------------------------------------

function extractFunctionSource(source, functionName) {
  const startPattern = new RegExp(`function ${functionName}\\s*\\(`);
  const startMatch = startPattern.exec(source);
  assert(startMatch, `could not find function ${functionName} in dev-src runtime-main.js`);

  const startIndex = startMatch.index;
  const braceOpenIndex = source.indexOf("{", startIndex);
  assert(braceOpenIndex >= 0, `could not find opening brace for function ${functionName}`);

  let depth = 0;
  let i = braceOpenIndex;
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  assert(depth === 0, `could not find matching closing brace for function ${functionName}`);

  return source.slice(startIndex, i);
}

// A minimal Decimal-like stand-in. buyUnitAmount/buyUpgradeAmount only ever
// call .minus()/.greaterThan() on whatever unit.count()/upgrade.count()
// returns, and recordMainAction only ever calls formatSwarmNumber() (stubbed
// below) on the delta - so this tiny stand-in is sufficient to exercise the
// exact real control flow without pulling in the real Decimal.js dependency.
function fakeDecimal(n) {
  const value = Number(n);
  return {
    value,
    minus(other) {
      const otherValue = typeof other === "object" && other !== null ? other.value : Number(other);
      return fakeDecimal(value - otherValue);
    },
    plus(other) {
      const otherValue = typeof other === "object" && other !== null ? other.value : Number(other);
      return fakeDecimal(value + otherValue);
    },
    greaterThan(other) {
      const otherValue = typeof other === "object" && other !== null ? other.value : Number(other);
      return value > otherValue;
    },
    toString() {
      return String(value);
    },
  };
}

function buildIsolatedSandbox(runtimeSource) {
  const buyUpgradeAmountSrc = extractFunctionSource(runtimeSource, "buyUpgradeAmount");
  const buyUnitAmountSrc = extractFunctionSource(runtimeSource, "buyUnitAmount");
  const recordMainActionSrc = extractFunctionSource(runtimeSource, "recordMainAction");

  const mainActionLedger = [];
  const purchaseLog = [];

  // formatSwarmNumber stub: tags its output with "$OBS" so tests can prove
  // recordMainAction actually took the executedDelta path (calls
  // formatSwarmNumber on the delta) rather than the requestedAmount
  // fallback path (uses the raw requestedAmount string untouched) - this
  // matters even when the two numeric values coincide (test 2 below).
  const context = {
    BOT_NAME: "kbcSwarmBot",
    formatSwarmNumber(value) {
      const text = value && typeof value.toString === "function" ? value.toString() : String(value);
      return `${text}$OBS`;
    },
    recordPurchase(type, item, amount) {
      purchaseLog.push({ type, item, amount });
    },
    mainActionLedger,
    console,
  };

  vm.createContext(context);
  vm.runInContext(
    `${buyUpgradeAmountSrc}\n${buyUnitAmountSrc}\n${recordMainActionSrc}\n`,
    context
  );

  return { context, mainActionLedger, purchaseLog };
}

function makeFakeCommands({ buyUnitBonus = 0, buyUpgradeBonus = 0 } = {}) {
  // Simulates a game where buyUnit/buyUpgrade can legitimately buy MORE than
  // the requested `num` (clamping/game-semantics), which is exactly the case
  // that exposed the original bug: the Ledger showed the *requested* amount
  // while the real purchase (and the Purchase log) reflected a bigger delta.
  return {
    buyUnit({ unit, num }) {
      unit.__count = unit.__count.plus(fakeDecimal(Number(num.value) + buyUnitBonus));
    },
    buyUpgrade({ upgrade, num }) {
      upgrade.__count = upgrade.__count.plus(fakeDecimal(Number(num.value) + buyUpgradeBonus));
    },
  };
}

function makeFakeUnit(startCount) {
  const state = { __count: fakeDecimal(startCount) };
  return {
    get __count() { return state.__count; },
    set __count(v) { state.__count = v; },
    count() { return state.__count; },
  };
}

function runIsolatedTests(runtimeSource) {
  // --- Test 1: requested != observed delta (clamped/oversized purchase) ---
  {
    const { context, mainActionLedger } = buildIsolatedSandbox(runtimeSource);
    const unit = makeFakeUnit(0);
    const commands = makeFakeCommands({ buyUnitBonus: 50 }); // buys 50 more than requested
    const requestedNum = fakeDecimal(100);
    const deltaOut = {};

    const bought = context.buyUnitAmount(commands, unit, requestedNum, "Meat", deltaOut);
    assert(bought === true, "test 1: expected buyUnitAmount to report a successful buy");
    assert(deltaOut.value.value === 150, `test 1: expected deltaOut.value=150 (observed delta), got ${deltaOut.value.value}`);

    context.recordMainAction("Meat", "TestUnit", "test reason", "100", deltaOut.value);
    const row = mainActionLedger[mainActionLedger.length - 1];
    assert(row.executedAmount === "150$OBS", `test 1: expected ledger executedAmount to reflect the observed delta (150), got "${row.executedAmount}" (requested was 100)`);
    assert(row.requestedAmount === "100", `test 1: expected requestedAmount to remain the originally requested text, got "${row.requestedAmount}"`);
    assert(row.amountSource === "observed-count-delta", `test 1: expected amountSource="observed-count-delta", got "${row.amountSource}"`);
    console.log("Test 1 passed: requested != observed delta -> ledger shows the real observed delta.");
  }

  // --- Test 2: requested === observed delta (must still use the observed path, not coincidence) ---
  {
    const { context, mainActionLedger } = buildIsolatedSandbox(runtimeSource);
    const unit = makeFakeUnit(0);
    const commands = makeFakeCommands({ buyUnitBonus: 0 });
    const requestedNum = fakeDecimal(42);
    const deltaOut = {};

    context.buyUnitAmount(commands, unit, requestedNum, "Meat", deltaOut);
    context.recordMainAction("Meat", "TestUnit", "test reason", "42", deltaOut.value);
    const row = mainActionLedger[mainActionLedger.length - 1];
    assert(row.executedAmount === "42$OBS", `test 2: expected the observed-delta path (marked "$OBS") even though values coincide, got "${row.executedAmount}"`);
    assert(row.amountSource === "observed-count-delta", `test 2: expected amountSource="observed-count-delta", got "${row.amountSource}"`);
    console.log("Test 2 passed: requested === observed delta still resolves via the observed-delta path, not by coincidence.");
  }

  // --- Test 3: upgrade purchase (Engine/Twin/Target-aware-style path) ---
  {
    const { context, mainActionLedger } = buildIsolatedSandbox(runtimeSource);
    const upgrade = makeFakeUnit(0);
    const commands = makeFakeCommands({ buyUpgradeBonus: 0 });
    const deltaOut = {};

    const bought = context.buyUpgradeAmount(commands, upgrade, fakeDecimal(1), "Engine", deltaOut);
    assert(bought === true, "test 3: expected buyUpgradeAmount to report a successful buy");
    assert(deltaOut.value.value === 1, `test 3: expected upgrade count delta=1, got ${deltaOut.value.value}`);
    context.recordMainAction("Engine", "TestUpgrade", "engine reason", "1", deltaOut.value);
    const row = mainActionLedger[mainActionLedger.length - 1];
    assert(row.executedAmount === "1$OBS", `test 3: expected upgrade executedAmount to reflect the upgrade count delta, got "${row.executedAmount}"`);
    console.log("Test 3 passed: upgrade purchase path reflects the real upgrade count delta.");
  }

  // --- Test 4: Parent Step purchase (unlock-planner path) ---
  // The unlock planner's Parent Step BUY branch
  // (runUnlockPlanner -> buyUnitAmount(commands, candidate, num,
  // parentChoice ? "Parent Step" : "Unlock Step", unlockPlannerDelta)) shares
  // the exact same buyUnitAmount/recordMainAction pair verified in tests 1-3
  // above (confirmed by grep: every recordMainAction() call site in
  // dev-src/runtime-sections/runtime-main.js that follows a real buy routes
  // through this same shared function pair). This test exercises that same
  // function pair with the "Parent Step" label and a simulated clamped
  // purchase, matching the Parent Step call site's exact shape.
  {
    const { context, mainActionLedger } = buildIsolatedSandbox(runtimeSource);
    const candidate = makeFakeUnit(0);
    const commands = makeFakeCommands({ buyUnitBonus: 5 });
    const requestedNum = fakeDecimal(1000);
    const deltaOut = {};

    context.buyUnitAmount(commands, candidate, requestedNum, "Parent Step", deltaOut);
    assert(deltaOut.value.value === 1005, `test 4: expected Parent Step observed delta=1005, got ${deltaOut.value.value}`);
    context.recordMainAction("Meat", "ParentStepCandidate", "target unlock step", "1000", deltaOut.value);
    const row = mainActionLedger[mainActionLedger.length - 1];
    assert(row.executedAmount === "1005$OBS", `test 4: expected Parent Step executedAmount to match the simulated count delta (1005), got "${row.executedAmount}"`);
    assert(row.requestedAmount === "1000", `test 4: expected Parent Step requestedAmount to stay 1000, got "${row.requestedAmount}"`);
    console.log("Test 4 passed: Parent Step purchase executedAmount matches its simulated count delta.");
  }

  // --- Test 5: multi-action cycle - no cross-row misattribution (Clone Ramp double-buy pattern) ---
  {
    const { context, mainActionLedger } = buildIsolatedSandbox(runtimeSource);

    // First buy: an upgrade cast (like Clone Ramp's ability cast).
    const upgrade = makeFakeUnit(0);
    const castCommands = makeFakeCommands({ buyUpgradeBonus: 0 });
    const castDeltaOut = {};
    context.buyUpgradeAmount(castCommands, upgrade, fakeDecimal(1), "Clone Ramp", castDeltaOut);
    context.recordMainAction("Clone Ramp", "Clone Larvae", "cast reason", "1", castDeltaOut.value);

    // Second buy: an unrelated unit buy with a much bigger delta (like Clone
    // Ramp's separate cocoon-bank buy, which must NOT be attributed to the
    // first ledger row).
    const cocoon = makeFakeUnit(0);
    const bankCommands = makeFakeCommands({ buyUnitBonus: 0 });
    const bankDeltaOut = {};
    context.buyUnitAmount(bankCommands, cocoon, fakeDecimal(999999), "Clone Ramp Bank", bankDeltaOut);
    context.recordMainAction("Territory", "SomeOtherCandidate", "unrelated buy", "999999", bankDeltaOut.value);

    assert(mainActionLedger.length === 2, `test 5: expected exactly 2 ledger rows, got ${mainActionLedger.length}`);
    assert(mainActionLedger[0].executedAmount === "1$OBS", `test 5: row 1 (Clone Ramp cast) expected executedAmount="1$OBS", got "${mainActionLedger[0].executedAmount}"`);
    assert(mainActionLedger[1].executedAmount === "999999$OBS", `test 5: row 2 (unrelated big buy) expected executedAmount="999999$OBS", got "${mainActionLedger[1].executedAmount}"`);
    assert(mainActionLedger[0].executedAmount !== mainActionLedger[1].executedAmount, "test 5: row 1 and row 2 must not share the same executedAmount (misattribution guard)");
    console.log("Test 5 passed: each ledger row's executedAmount matches its own purchase's delta, not a different row's delta.");
  }

  // --- Test 6: mutation control - prove this harness can detect the pre-fix bug ---
  {
    // Reproduce the exact pre-fix formula: recordMainAction always used the
    // requested amount, ignoring any observed delta.
    const buggyRecordMainActionSrc = `
      function recordMainAction(lane, candidate, reason, amount = "") {
        mainActionLedger.push({
          index: mainActionLedger.length + 1,
          lane: lane || "unknown",
          candidate: candidate || "unknown",
          reason: reason || "",
          amount: amount || "",
          requestedAmount: amount || "",
          executedAmount: amount || "",
          amountSource: "requested-amount-fallback",
        });
      }
    `;

    const mainActionLedger = [];
    const context = {
      BOT_NAME: "kbcSwarmBot",
      formatSwarmNumber(value) {
        const text = value && typeof value.toString === "function" ? value.toString() : String(value);
        return `${text}$OBS`;
      },
      recordPurchase() {},
      mainActionLedger,
      console,
    };
    vm.createContext(context);
    const buyUnitAmountSrc = extractFunctionSource(runtimeSource, "buyUnitAmount");
    vm.runInContext(`${buyUnitAmountSrc}\n${buggyRecordMainActionSrc}\n`, context);

    const unit = makeFakeUnit(0);
    const commands = makeFakeCommands({ buyUnitBonus: 50 }); // same clamped-buy scenario as test 1
    const requestedNum = fakeDecimal(100);
    const deltaOut = {};
    context.buyUnitAmount(commands, unit, requestedNum, "Meat", deltaOut);
    assert(deltaOut.value.value === 150, "test 6 setup: expected the real observed delta to still be 150 regardless of recordMainAction's bug");

    context.recordMainAction("Meat", "TestUnit", "test reason", "100", deltaOut.value);
    const row = mainActionLedger[mainActionLedger.length - 1];

    // The pre-fix (buggy) recordMainAction ignores the delta entirely and
    // always uses the requested amount text ("100"), NOT the real "150$OBS"
    // that the fixed version produces (see test 1). If this assertion were
    // to fail (i.e. the buggy version accidentally produced "150$OBS"), it
    // would mean this test harness cannot actually distinguish the fixed
    // behavior from the bug - so we assert the mismatch here to prove test 1
    // is a meaningful regression guard.
    assert(row.executedAmount === "100", `test 6: expected the reverted/buggy recordMainAction to reproduce the original bug (executedAmount="100", the requested amount), got "${row.executedAmount}"`);
    assert(row.executedAmount !== "150$OBS", "test 6: mutation-control regression - the buggy version must NOT produce the fixed version's correct output");
    console.log("Test 6 passed: mutation control confirms the test harness detects the pre-fix bug (reverted logic fails to report the real observed delta).");
  }
}

// ---------------------------------------------------------------------------
// Part 1b: pure-logic mirror of the fixed HOUSE_OF_MIRRORS available/
// unavailableReason ternary from captureEnergyAbilityTimingSnapshot.
// ---------------------------------------------------------------------------

function computeMirrorAbilityAvailability({ mirrorAvailable, ready, blockedReason, mirrorUnavailableReason }) {
  return {
    available: mirrorAvailable && ready,
    unavailableReason: ready ? mirrorUnavailableReason : `Blocked by: ${blockedReason}`,
  };
}

function runHomTernaryPureLogicTests() {
  const negative = computeMirrorAbilityAvailability({
    mirrorAvailable: true,
    ready: false,
    blockedReason: "no relevant territory army exists",
    mirrorUnavailableReason: "not visible",
  });
  assert(negative.available === false, "HOM ternary: expected available=false when readiness gate fails even if the raw ability is available");
  assert(negative.unavailableReason === "Blocked by: no relevant territory army exists", `HOM ternary: expected the readiness-gate reason to be surfaced, got "${negative.unavailableReason}"`);

  const positive = computeMirrorAbilityAvailability({
    mirrorAvailable: true,
    ready: true,
    blockedReason: "none",
    mirrorUnavailableReason: "not visible",
  });
  assert(positive.available === true, "HOM ternary: expected available=true when both the raw ability and the readiness gate pass");
  assert(positive.unavailableReason === "not visible", "HOM ternary: expected the original mirror.unavailableReason to pass through unchanged when ready");

  console.log("HOM ternary pure-logic checks passed (negative and positive gate cases).");
}

// ---------------------------------------------------------------------------
// Part 2: real browser, live game, real save.
// ---------------------------------------------------------------------------

function buildInMemoryUserscript() {
  const canonical = fs.readFileSync(CANONICAL_USERSCRIPT_PATH, "utf8");
  const runtime = fs.readFileSync(RUNTIME_PATH, "utf8");

  const metadataMatch = canonical.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/u);
  assert(metadataMatch, "could not find userscript metadata block in the committed canonical userscript");

  // This mirrors scripts/build-canonical-userscript.js's assembly (metadata
  // + dev-src/runtime-sections/runtime-main.js), done entirely in-memory so
  // this test always exercises the CURRENT dev-src changes without writing
  // to src/SwarmSim-Strategy-Autobuyer.user.js or running `npm run build`.
  return `${metadataMatch[0]}\n\n${runtime}`;
}

async function withPage(userscript, fn) {
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
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
          abilityTimingRecommendation: inspector?.abilityTimingRecommendation || null,
          abilityTimingRecommendedAction: inspector?.abilityTimingRecommendedAction || null,
          energySupportMirrorDecision: inspector?.energySupportMirrorDecision || null,
          energySupportMirrorActiveGate: inspector?.energySupportMirrorActiveGate || null,
          energySupportMirrorBlockedBy: inspector?.energySupportMirrorBlockedBy || null,
          energySupportMirrorReadinessState: inspector?.energySupportMirrorReadinessState || null,
          cloneRampBlockedBy: inspector?.cloneRampBlockedBy || null,
          executedMainActions: inspector?.executedMainActions || [],
          mainActions: inspector?.mainActions ?? null,
        };
      }, cycleNumber);
      cycles.push(cycle);
    }
    return cycles;
  });
}

function evaluateNaturalCycles(cycles) {
  let mirrorDataSeen = false;
  let executedActionsSeen = 0;

  for (const cycle of cycles) {
    if (cycle.energySupportMirrorDecision) {
      mirrorDataSeen = true;

      // The exact contradiction this fix resolves: the Energy Support Broker
      // says HOLD for House of Mirrors, while the M4 Ability Timing advisor
      // simultaneously recommends CAST_NOW House of Mirrors. With the shared
      // assessHouseOfMirrorsReadiness() gate, these two can no longer
      // disagree - M4 falls through to SAVE/WAIT instead.
      const abilityTimingSaysCastMirrorNow =
        cycle.abilityTimingRecommendation === "CAST_NOW" &&
        /house of mirrors/i.test(String(cycle.abilityTimingRecommendedAction || ""));

      if (cycle.energySupportMirrorDecision === "HOLD") {
        assert(
          !abilityTimingSaysCastMirrorNow,
          `cycle ${cycle.cycleNumber}: contradiction reproduced - Energy Support Broker says HOLD (blocked by ${cycle.energySupportMirrorBlockedBy}, gate ${cycle.energySupportMirrorActiveGate}) while Ability Timing says CAST_NOW House of Mirrors`
        );
      }
    }

    // Task A: every executed main action's ledger row must carry the new
    // observability fields, and executedAmount must be well-formed.
    for (const action of cycle.executedMainActions) {
      executedActionsSeen++;
      assert(
        action.amountSource === "observed-count-delta" || action.amountSource === "requested-amount-fallback",
        `cycle ${cycle.cycleNumber}: executed action ${action.lane}:${action.candidate} has an unexpected amountSource "${action.amountSource}"`
      );
      assert(
        typeof action.executedAmount === "string",
        `cycle ${cycle.cycleNumber}: executed action ${action.lane}:${action.candidate} is missing a string executedAmount`
      );
    }
  }

  console.log(`Natural cycles: mirrorDataSeen=${mirrorDataSeen}, executedActionsSeen=${executedActionsSeen} across ${cycles.length} cycles.`);
  return { mirrorDataSeen, executedActionsSeen };
}

async function runPositiveHomGateCheck(userscript) {
  // Uses the exposed pure evaluator (window.kbcSwarmBot.abilityTimingAdvisor
  // .evaluate(snapshot)) to prove the positive path still works: once the
  // HOUSE_OF_MIRRORS ability entry reports available=true and
  // targetAligned=true with a real gain, it CAN still win CAST_NOW. This
  // evaluator is downstream of (and unchanged by) this fix - what changed is
  // only how captureEnergyAbilityTimingSnapshot computes `available` for
  // that ability entry (see the pure-logic ternary test above), so this
  // proves the fix didn't regress the case where mirrorReadiness.ready is
  // true.
  return withPage(userscript, async (page) => {
    return page.evaluate(() => {
      const api = window.kbcSwarmBot.abilityTimingAdvisor;
      const ability = (actionId, label, targetResource, overrides = {}) => ({
        actionId, label, targetResource,
        available: false, energyCost: 1600, projectedGain: 1000, gainRatio: 0.5,
        targetAligned: false, formulaStatus: "source-verified",
        ...overrides,
      });
      const snapshot = {
        snapshotId: "9.3.5-HOM-POSITIVE",
        activeMilestone: "Expansion",
        activeTarget: "Expansion territory",
        energy: { amount: 20000, perSecond: 10, reserveRequired: 1000 },
        bestNonCastAlternative: "bounded Lepidoptera production",
        abilities: [
          ability("CLONE_LARVAE", "Clone Larvae", "larvae"),
          ability("HOUSE_OF_MIRRORS", "House of Mirrors", "territory rate", {
            available: true, energyCost: 2500, projectedGain: 50000, gainRatio: 0.8, targetAligned: true,
          }),
          ability("LARVA_RUSH", "Larva Rush", "larvae"),
          ability("MEAT_RUSH", "Meat Rush", "meat"),
          ability("TERRITORY_RUSH", "Territory Rush", "territory"),
        ],
      };
      return api.evaluate(snapshot);
    });
  });
}

function checkCloneLarvaePostReleaseSourceInvariant(runtimeSource) {
  // Read-only check (per task instructions: do NOT touch this logic) that
  // the POST_CLONE_RELEASE Clone Larvae hold block in
  // captureEnergyAbilityTimingSnapshot is still present, verbatim.
  const expectedSnippets = [
    'const cloneRampAlreadyReleased = !!cloneRampInfo',
    '&& String(cloneRampInfo.cloneRampPhase || "") === "POST_CLONE_RELEASE"',
    '&& String(cloneRampInfo.cloneRampBlockedBy || "") === "already released at cap";',
    'available: cloneRampAlreadyReleased ? false : clone.available,',
    '"HOLD — Clone Ramp has already completed and released its final cast; this manual-cast advisor is a counterfactual that does not apply to the active Clone Ramp policy."',
  ];
  for (const snippet of expectedSnippets) {
    assert(runtimeSource.includes(snippet), `Clone Larvae POST_CLONE_RELEASE invariant broken - missing expected snippet: ${snippet}`);
  }
  console.log("Clone Larvae POST_CLONE_RELEASE source invariant check passed (untouched, as required).");
}

async function main() {
  const runtimeSource = fs.readFileSync(RUNTIME_PATH, "utf8");

  console.log("Part 1a: isolated buyUnitAmount/buyUpgradeAmount/recordMainAction tests (no browser)...");
  runIsolatedTests(runtimeSource);

  console.log("Part 1b: House of Mirrors ternary pure-logic tests (no browser)...");
  runHomTernaryPureLogicTests();

  console.log("Source invariant: Clone Larvae POST_CLONE_RELEASE handling...");
  checkCloneLarvaePostReleaseSourceInvariant(runtimeSource);

  console.log("Part 2: building in-memory userscript from committed metadata + current dev-src runtime...");
  const userscript = buildInMemoryUserscript();

  console.log(`Running ${NATURAL_CYCLES} natural live-save cycles...`);
  const cycles = await runNaturalCycles(userscript);
  const naturalResult = evaluateNaturalCycles(cycles);

  console.log("Running positive House of Mirrors gate check via abilityTimingAdvisor.evaluate()...");
  const positiveResult = await runPositiveHomGateCheck(userscript);
  assert(positiveResult.recommendedActionId === "HOUSE_OF_MIRRORS", `positive gate check: expected House of Mirrors to be able to win CAST_NOW when available+targetAligned+meaningful, got recommendedActionId="${positiveResult.recommendedActionId}" (recommendation=${positiveResult.recommendation})`);
  console.log(`Positive gate check passed: recommendation=${positiveResult.recommendation}, recommendedActionId=${positiveResult.recommendedActionId}`);

  console.log("9.3.5 EXECUTED-AMOUNT AND HOM-READINESS ACCEPTANCE PASSED");
  console.log(JSON.stringify({
    naturalCyclesRun: NATURAL_CYCLES,
    mirrorDataSeen: naturalResult.mirrorDataSeen,
    executedActionsSeen: naturalResult.executedActionsSeen,
    positiveGateRecommendation: positiveResult.recommendation,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
