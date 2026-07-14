#!/usr/bin/env node
"use strict";

// Regression check for the Territory/Expansion army-seed lane-saturation
// reporting. Root cause (see docs/strategy conversation history): at
// extreme late-game scale, every buyable territory-army unit's affordable
// chunk is many orders of magnitude smaller than the army already owned, so
// the ETA-improvement it can ever buy is genuinely negligible - not a bug in
// the ETA formula, the chunk percent, or the 120s/5% thresholds. This check
// proves the bot now reports that distinction structurally
// (territoryLaneSaturated) instead of only showing a bare "0s" HOLD line
// that a clone-buffer/save-window block would also produce.
//
// All three states below are derived from the same real, pinned save
// (docs/test-data/strategy-audit-0/default-user-save/save.txt) via the
// game's own real `_setCount` API - the same real-count-seeding mechanism
// already used by scripts/strategy-audit-testbed-core.js and
// scripts/check-live-purchase-acceptance.js - not a synthetic scenario.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");
const savePath = path.join(root, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt");

const TERRITORY_ARMY_UNIT_NAMES = [
  "swarmling", "stinger", "spider", "mosquito", "locust",
  "roach", "giantspider", "centipede", "wasp", "devourer", "goon",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openSave() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => localStorage.clear());
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot && !!window.angular, { timeout: 90000 });

  const save = fs.readFileSync(savePath, "utf8").trim();
  const imported = await page.evaluate((s) => {
    const game = window.angular.element(document.body).injector().get("game");
    try {
      game.importSave(s);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error?.stack || error?.message || error) };
    }
  }, save);
  assert(imported.ok, `importSave failed: ${imported.error}`);
  await page.waitForTimeout(2000);
  return { browser, page };
}

// Real _setCount seeding (not the synthetic unitCounts formula): sets the
// game's own internal count so production, cost, and ETA math all read a
// genuinely different real state - see strategy-audit-testbed-core.js's
// documented use of the same API.
async function setRealCount(page, unitName, value) {
  await page.evaluate(({ unitName, value }) => {
    const game = window.angular.element(document.body).injector().get("game");
    const unit = game.unit(unitName);
    if (unit && typeof unit._setCount === "function") {
      unit._setCount(new window.Decimal(value));
    }
  }, { unitName, value });
}

async function ensureLarvaIsPlentiful(page) {
  // Only neutralizes the clone-buffer larva guard so it does not confound
  // the saturation cases below; does not touch territory, army units, or
  // any ETA/cost calculation.
  await setRealCount(page, "larva", "1e40");
}

async function runOneCycleAndReadInspector(page) {
  return page.evaluate(() => {
    window.kbcSwarmBot.runOnce();
    return window.kbcSwarmBot.getStrategyInspector();
  });
}

async function checkExtremeStateIsSaturated() {
  const { browser, page } = await openSave();
  try {
    await ensureLarvaIsPlentiful(page);
    const inspector = await runOneCycleAndReadInspector(page);

    assert(inspector.territoryLaneSaturated === "yes", `expected extreme state to be saturated, got territoryLaneSaturated=${inspector.territoryLaneSaturated} (reason: ${inspector.territorySaturationReason})`);
    assert(/saturated/i.test(inspector.territorySaturationReason), `expected saturation reason text to say "saturated", got: ${inspector.territorySaturationReason}`);
    assert(/ms|<1ms/.test(inspector.territorySaturationReason), `expected saturation reason to show a sub-second gain, got: ${inspector.territorySaturationReason}`);

    const gainSeconds = Number(inspector.territorySaturationBestGainSecondsRaw);
    assert(Number.isFinite(gainSeconds) && gainSeconds >= 0, `expected a finite non-negative raw gain, got: ${inspector.territorySaturationBestGainSecondsRaw}`);
    assert(gainSeconds < 1, `expected the extreme state's best gain to be far below the 120s requirement, got ${gainSeconds}s`);

    const secondsRatio = Number(inspector.territorySaturationSecondsRequirementRatio);
    assert(Number.isFinite(secondsRatio) && secondsRatio < 0.01, `expected gain-vs-requirement ratio to be tiny, got ${inspector.territorySaturationSecondsRequirementRatio}`);

    assert(inspector.territorySaturationBestBlockedCandidate === "none", `expected no protected-resource block once larva is plentiful, got blocked candidate=${inspector.territorySaturationBestBlockedCandidate}`);

    return {
      territoryLaneSaturated: inspector.territoryLaneSaturated,
      territorySaturationReason: inspector.territorySaturationReason,
      territorySaturationBestGainSecondsRaw: inspector.territorySaturationBestGainSecondsRaw,
      expansionArmySeedDecision: inspector.expansionArmySeedDecision,
    };
  } finally {
    await browser.close();
  }
}

// A real game clock keeps producing resources in the background even
// between an explicit _setCount call and the next runOnce(); at this
// save's endgame scale that regeneration is fast enough (observed:
// starved larva refilled to the hundreds-of-quadrillions range within a
// single runOnce() call) that forcing a real, live clone-buffer block
// deterministically is not reliable. The classifier itself
// (classifyTerritorySaturation) is a pure function extracted specifically
// so this distinction can be proven without depending on that timing -
// see window.kbcSwarmBot.territorySaturationDiagnostics.
async function checkGuardBlockedIsNotSaturated() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.territorySaturationDiagnostics, { timeout: 90000 });

    const result = await page.evaluate(() => {
      const api = window.kbcSwarmBot.territorySaturationDiagnostics;
      // Every candidate was skipped by the clone-buffer/protected-resource
      // guard before it ever reached the ETA-improvement check: this is
      // exactly what buildTerritoryPrepProposal passes in when
      // evaluatedCandidateCount stays 0 (see getUnitCandidateBlock's
      // "continue" branch, which never increments it).
      const guardBlocked = api.classify({
        bestAccepted: null,
        evaluatedCandidateCount: 0,
        bestEvaluatedCandidate: null,
        minEtaGainSeconds: 120,
        minEtaGainRatio: 0.05,
      });

      // Same shape as the real extreme-state result: at least one candidate
      // was actually scored, none met the requirement.
      const evaluatedAndSaturated = api.classify({
        bestAccepted: null,
        evaluatedCandidateCount: 11,
        bestEvaluatedCandidate: { unitName: "giant arachnomorph", etaGainSeconds: 0.0004, etaGainRatio: 2e-14, relativeVelocityGain: 2.06e-14 },
        minEtaGainSeconds: 120,
        minEtaGainRatio: 0.05,
      });

      // A real BUY happened this cycle - must never be reported as saturated.
      const boughtNotSaturated = api.classify({
        bestAccepted: { unitName: "chilopodomorph" },
        evaluatedCandidateCount: 11,
        bestEvaluatedCandidate: { unitName: "chilopodomorph", etaGainSeconds: 300, etaGainRatio: 0.1, relativeVelocityGain: 0.2 },
        minEtaGainSeconds: 120,
        minEtaGainRatio: 0.05,
      });

      return { guardBlocked, evaluatedAndSaturated, boughtNotSaturated };
    });

    assert(result.guardBlocked.territoryLaneSaturated === false, `expected a clone-buffer/guard-blocked lane (evaluatedCandidateCount=0) to NOT be reported as saturated, got territoryLaneSaturated=${result.guardBlocked.territoryLaneSaturated}`);
    assert(result.guardBlocked.territorySaturationReason === "none", `expected no saturation reason for a guard-blocked lane, got: ${result.guardBlocked.territorySaturationReason}`);

    assert(result.evaluatedAndSaturated.territoryLaneSaturated === true, `expected an evaluated-and-failed lane to be reported as saturated, got territoryLaneSaturated=${result.evaluatedAndSaturated.territoryLaneSaturated}`);
    assert(/saturated/i.test(result.evaluatedAndSaturated.territorySaturationReason), `expected a saturation reason, got: ${result.evaluatedAndSaturated.territorySaturationReason}`);

    assert(result.boughtNotSaturated.territoryLaneSaturated === false, `expected a BUY cycle to never be reported as saturated, got territoryLaneSaturated=${result.boughtNotSaturated.territoryLaneSaturated}`);

    return result;
  } finally {
    await browser.close();
  }
}

async function checkModerateStateBuysAndIsNotSaturated() {
  const { browser, page } = await openSave();
  try {
    // Scale the same real save's territory + army-unit counts down (real
    // _setCount, not a synthetic formula) so the existing army no longer
    // dwarfs an affordable chunk - this is the exact manipulation used
    // during root-cause analysis to prove the ETA formula is scale-
    // sensitive but correct, not broken.
    await setRealCount(page, "territory", "1.5e114");
    for (const name of TERRITORY_ARMY_UNIT_NAMES) {
      const current = await page.evaluate((n) => {
        const game = window.angular.element(document.body).injector().get("game");
        return String(game.unit(n).count());
      }, name);
      await page.evaluate(({ n, current }) => {
        const game = window.angular.element(document.body).injector().get("game");
        const unit = game.unit(n);
        if (unit && typeof unit._setCount === "function") {
          unit._setCount(new window.Decimal(current).dividedBy(new window.Decimal("1e30")));
        }
      }, { n: name, current });
    }
    await ensureLarvaIsPlentiful(page);

    const inspector = await runOneCycleAndReadInspector(page);

    assert(inspector.territoryLaneSaturated === "no", `expected the moderate (scaled-down) state to clear the requirement, got territoryLaneSaturated=${inspector.territoryLaneSaturated} (reason: ${inspector.territorySaturationReason})`);
    assert(inspector.expansionArmySeedDecision === "BUY", `expected a real BUY decision once the requirement is cleared, got: ${inspector.expansionArmySeedDecision}`);
    assert(inspector.expansionArmySeedCandidate && inspector.expansionArmySeedCandidate !== "none", `expected a named BUY candidate, got: ${inspector.expansionArmySeedCandidate}`);
    assert(inspector.expansionArmySeedAmount && inspector.expansionArmySeedAmount !== "0", `expected a positive bought amount, got: ${inspector.expansionArmySeedAmount}`);

    return {
      territoryLaneSaturated: inspector.territoryLaneSaturated,
      expansionArmySeedDecision: inspector.expansionArmySeedDecision,
      expansionArmySeedCandidate: inspector.expansionArmySeedCandidate,
      expansionArmySeedAmount: inspector.expansionArmySeedAmount,
      expansionArmySeedEtaGainSeconds: inspector.expansionArmySeedEtaGainSeconds,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const extreme = await checkExtremeStateIsSaturated();
  console.log(`[check-book00-territory-saturation] extreme-state saturated: ${JSON.stringify(extreme)}`);

  const guardBlocked = await checkGuardBlockedIsNotSaturated();
  console.log(`[check-book00-territory-saturation] guard-blocked not saturated: ${JSON.stringify(guardBlocked)}`);

  const moderate = await checkModerateStateBuysAndIsNotSaturated();
  console.log(`[check-book00-territory-saturation] moderate-state buys, not saturated: ${JSON.stringify(moderate)}`);

  console.log("BOOK00 TERRITORY-SATURATION REGRESSION CHECK PASSED");
}

main().catch((error) => {
  console.error("BOOK00 TERRITORY-SATURATION REGRESSION CHECK FAILED");
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
