#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const LIVE_SAVE_PATH = path.join(ROOT, "docs", "test-data", "clone-ramp", "live-user-save.txt");
const EXPECTED_SAVE_SHA256 = "58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec";
const FIXTURE_CLOCK_ISO = "2026-07-14T23:12:11.000Z";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const saveBytes = fs.readFileSync(LIVE_SAVE_PATH);
  const saveSha256 = crypto.createHash("sha256").update(saveBytes).digest("hex");
  assert(saveSha256 === EXPECTED_SAVE_SHA256, `live-save hash mismatch: ${saveSha256}`);

  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  if (process.env.KBC_MUTATE_SHARED_TARGET_IDENTITY === "1") {
    const needle = "activeTarget: strategyIdentity.activeTarget,";
    const matches = userscript.split(needle).length - 1;
    assert(matches === 2, `mutation control expected two shared-target bindings, got ${matches}`);
    userscript = userscript.split(needle).join("activeTarget: smartFocus || \"current strategic target\",");
  }
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();

  try {
    await page.addInitScript(({ now }) => {
      const NativeDate = Date;
      const fixedNow = NativeDate.parse(now);
      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedNow]));
        }

        static now() {
          return fixedNow;
        }
      }
      Object.setPrototypeOf(FixedDate, NativeDate);
      window.Date = FixedDate;
    }, { now: FIXTURE_CLOCK_ISO });
    await page.goto("https://www.swarmsim.com/#/tab/territory", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForFunction(() => {
      const injector = window.angular?.element(document.body)?.injector?.();
      return typeof injector?.get?.("game")?.importSave === "function";
    }, { timeout: 120000 });

    const imported = await page.evaluate((saveString) => {
      const injector = window.angular.element(document.body).injector();
      const game = injector.get("game");
      game.importSave(saveString);
      for (const [upgradeId, etaSeconds] of [["expansion", 1500], ["hatchery", 1800]]) {
        const upgrade = game.upgrade(upgradeId);
        Object.defineProperty(upgrade, "isBuyable", { configurable: true, value: () => false });
        Object.defineProperty(upgrade, "estimateSecsUntilBuyable", { configurable: true, value: () => etaSeconds });
      }
      localStorage.setItem("kbcSwarmBotConfig_v11", JSON.stringify({
        enabled: true,
        smartMode: true,
        advisorOnly: true,
        autoBuySafeDecisions: false,
        autoCastAbilities: false,
        autoCastCloneLarvae: false,
        autoAscend: false,
        energySupportBrokerAllowAutoCast: false,
        runEverySeconds: 60,
      }));
      return true;
    }, saveBytes.toString("utf8").trim());
    assert(imported === true, "live save was not imported");

    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot, { timeout: 120000 });

    const result = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      if (bot.timer) clearInterval(bot.timer);
      const game = window.angular.element(document.body).injector().get("game");
      const trackedIds = [
        "drone", "queen", "nest", "greaterqueen", "hive", "greaterhive",
        "hivenetwork", "lesserhivemind", "neuralcluster", "nexus", "moth",
      ];
      const counts = () => Object.fromEntries(trackedIds.map((id) => [id, String(game.unit(id)?.count?.() || "0")]));
      const before = counts();
      bot.runOnce();
      const after = counts();
      const inspector = bot.getStrategyInspector();
      const coordinator = inspector?.strategicCoordinator || null;
      return {
        before,
        after,
        goal: inspector?.goal || null,
        smartFocus: inspector?.smartFocus || null,
        activeMilestone: coordinator?.activeMilestone || null,
        activeTarget: coordinator?.activeTarget || null,
        executionAuthority: coordinator?.executionAuthority === true,
        domainContexts: (coordinator?.domainOutcomes || []).map((outcome) => ({
          domainId: outcome.domainId,
          activeMilestone: outcome.context?.activeMilestone || null,
          activeTarget: outcome.context?.activeTarget || null,
        })),
      };
    });

    assert(/lesser hive mind/i.test(String(result.goal)), `fixture did not reproduce the Lesser Hive Mind goal: ${result.goal}`);
    assert(result.before && JSON.stringify(result.before) === JSON.stringify(result.after), "advisor-only identity check mutated tracked unit counts");
    assert(result.executionAuthority === false, "advisor-only identity check unexpectedly gained execution authority");
    assert(result.domainContexts.length === 6, `expected six domain outcomes, got ${result.domainContexts.length}`);
    assert(result.activeMilestone === result.goal, "coordinator milestone must equal the Inspector goal");
    assert(
      String(result.activeTarget).toLowerCase() === "lesser hive mind",
      `shared active target must be Lesser Hive Mind, got ${result.activeTarget} (smartFocus=${result.smartFocus})`
    );
    assert(
      result.domainContexts.every((context) => context.activeMilestone === result.activeMilestone && context.activeTarget === result.activeTarget),
      "all six domains must share the resolved milestone and target identity"
    );

    console.log(JSON.stringify({
      status: "PASS",
      saveSha256,
      fixtureClock: FIXTURE_CLOCK_ISO,
      goal: result.goal,
      activeMilestone: result.activeMilestone,
      activeTarget: result.activeTarget,
      domains: result.domainContexts.map((context) => context.domainId),
      executionAuthority: result.executionAuthority,
      trackedUnitCountsUnchanged: true,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
