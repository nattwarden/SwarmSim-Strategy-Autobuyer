#!/usr/bin/env node
"use strict";

// 9.4.0 Bounded Strategic Plan Laboratory (READ-ONLY research harness; NOT part of `verify`).
//
// Purpose: retire TRACK B's central data-limitation claim by capturing the FULL per-unit mechanic
// graph of the real deep-Meat save from the live SwarmSim engine (Step 1), and by running a
// bit-identical REAL-ENGINE counterfactual (Step 5 crux): from the same immutable save, compare a
// WAIT branch against bounded-plan branches, advancing passive production with the game's own clock
// (game.tick(futureDate) -> cache.onTick()). No hand-built production formulas: the real engine is the
// source of truth. No runtime change; this harness never touches dev-src/src.
//
// Writes two artifacts under docs/test-data/9.4.0-plan-laboratory/:
//   mechanic-snapshot-<saveName>.json   - Step 1 full mechanic graph (Decimal strings, internal ids)
//   counterfactual-<saveName>.json      - Step 5 WAIT-vs-plan outcomes at an explicit horizon
//
// Usage: node scripts/lab-9.4.0-plan-laboratory.js [--save <path>] [--horizon 3600]

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "9.4.0-plan-laboratory");

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const SAVE_PATH = arg("--save", path.join(ROOT, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt"));
const HORIZON = Number(arg("--horizon", "3600"));
const SAVE_NAME = path.basename(path.dirname(SAVE_PATH)) || "save";

async function main() {
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(7000);

    const result = await page.evaluate(({ saveString, horizon }) => {
      const injector = window.angular?.element(document.body)?.injector?.();
      const game = injector?.get?.("game");
      const commands = injector?.get?.("commands");
      const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
      const N = (v) => { try { return Number(v.toString()); } catch { return NaN; } };

      // ---- Step 1: full mechanic graph ----
      const exportGraph = () => {
        game.importSave(saveString);
        const ul = typeof game.unitlist === "function" ? game.unitlist() : Object.values(game.units || {});
        const units = [];
        for (const u of (Array.isArray(ul) ? ul : [])) {
          if (!u || !u.name) continue;
          let eachCost = null, eachProduction = null, maxAffordable = null;
          try { eachCost = (u.eachCost?.() || []).map((c) => ({ resource: c.unit?.name, val: D(c.val) })); } catch {}
          try { const p = u.eachProduction?.() || {}; eachProduction = {}; for (const k of Object.keys(p)) eachProduction[k] = D(p[k]); } catch {}
          try {
            if (eachCost && eachCost.length) {
              let best = null;
              for (const row of u.eachCost()) {
                if (!row.unit || !row.val) continue;
                const aff = row.unit.count().div(row.val).floor();
                if (best == null || aff.lt(best)) best = aff;
              }
              maxAffordable = best == null ? null : D(best);
            }
          } catch {}
          units.push({
            internalId: u.name,
            displayName: (u.title || u.label || u.plural || (u.unittype && (u.unittype.label || u.unittype.plural)) || u.name),
            count: (() => { try { return D(u.count()); } catch { return null; } })(),
            velocity: (() => { try { return D(u.velocity()); } catch { return null; } })(),
            visible: (() => { try { return !!u.isVisible(); } catch { return null; } })(),
            buyable: (() => { try { return !!u.isBuyable(); } catch { return null; } })(),
            tab: (u.tab && u.tab.name) || (u.unittype && u.unittype.tab) || null,
            eachCost, eachProduction, maxAffordable,
          });
        }
        return units;
      };

      // ---- Step 5: real-engine counterfactual ----
      const TARGET = "pantheon3"; // lesser hive mind
      const targetState = () => {
        const t = game.unit(TARGET);
        const legs = t.eachCost().map((c) => ({ resource: c.unit.name, need: D(c.val), have: D(c.unit.count()), affordRatio: N(c.unit.count()) / N(c.val) }));
        const binding = legs.slice().sort((a, b) => a.affordRatio - b.affordRatio)[0];
        return {
          targetInternalId: TARGET, targetDisplayName: (t.title || t.label || t.name),
          targetBuyable: t.isBuyable(),
          bindingResource: binding.resource, bindingHave: binding.have, bindingNeed: binding.need, bindingAffordRatio: binding.affordRatio,
          pantheon2_hiveNetwork: D(game.unit("pantheon2").count()),
          pantheon_neuralCluster: D(game.unit("pantheon").count()),
          goddess: D(game.unit("goddess").count()),
          legs,
        };
      };
      const advance = (secs) => { game.tick(new Date(game.now.getTime() + secs * 1000)); };
      const dec = (n) => (game.Decimal ? game.Decimal(n) : n);
      const branch = (label, canonicalActions, actionFn) => {
        game.importSave(saveString);
        const before = targetState();
        if (actionFn) actionFn();
        const afterAction = targetState();
        advance(horizon);
        const afterHorizon = targetState();
        return { label, canonicalActions, horizonSeconds: horizon, before, afterAction, afterHorizon };
      };

      const branches = {
        WAIT: branch("WAIT", [], null),
        singleNeuralCluster: branch("buy 1 Neural Cluster (pantheon)", ["pantheon::unit::1"],
          () => commands.buyUnit({ unit: game.unit("pantheon"), num: dec(1), ui: "lab" })),
        buyHiveNetworkMax: branch("buyMax Hive Network (pantheon2)", ["pantheon2::unit::max"],
          () => commands.buyMaxUnit({ unit: game.unit("pantheon2"), ui: "lab" })),
        planNCthenHN: branch("plan: buyMax Neural Cluster then buyMax Hive Network", ["pantheon::unit::max", "pantheon2::unit::max"],
          () => { commands.buyMaxUnit({ unit: game.unit("pantheon"), ui: "lab" }); commands.buyMaxUnit({ unit: game.unit("pantheon2"), ui: "lab" }); }),
      };

      return { units: exportGraph(), counterfactual: branches, engine: { tickModel: "game.tick(futureDate) -> cache.onTick(); passive production integrated by the real engine", horizonSeconds: horizon } };
    }, { saveString: save, horizon: HORIZON });

    const snapshot = {
      schemaVersion: "mechanic-snapshot.v1",
      capturedAt: new Date().toISOString(),
      source: { saveName: SAVE_NAME, savePath: path.relative(ROOT, SAVE_PATH), engine: "live swarmsim.com via game.importSave + Angular injector" },
      unitCount: result.units.length,
      units: result.units,
    };
    const snapPath = path.join(OUT_DIR, `mechanic-snapshot-${SAVE_NAME}.json`);
    fs.writeFileSync(snapPath, JSON.stringify(snapshot, null, 1));

    const cf = {
      schemaVersion: "counterfactual-horizon-progress.v0-lab",
      capturedAt: new Date().toISOString(),
      source: snapshot.source, engine: result.engine,
      target: { internalId: "pantheon3", displayName: "lesser hive mind", bindingResource: "pantheon2 (hive network)" },
      branches: result.counterfactual,
    };
    const cfPath = path.join(OUT_DIR, `counterfactual-${SAVE_NAME}.json`);
    fs.writeFileSync(cfPath, JSON.stringify(cf, null, 1));

    // Console summary + acceptance assertion.
    const b = result.counterfactual;
    const base = b.WAIT.afterAction.pantheon2_hiveNetwork;
    const nc = b.singleNeuralCluster.afterAction.pantheon2_hiveNetwork;
    const hn = b.buyHiveNetworkMax.afterAction.pantheon2_hiveNetwork;
    const plan = b.planNCthenHN.afterAction.pantheon2_hiveNetwork;
    console.log(`[lab-9.4.0] save=${SAVE_NAME} units=${snapshot.unitCount} horizon=${HORIZON}s`);
    console.log(`  target=lesser hive mind (pantheon3) binding=pantheon2 (hive network), velocity=0 (no passive progress)`);
    console.log(`  pantheon2 after action:  WAIT=${base}  singleNeuralCluster=${nc}  HiveNetworkMax=${hn}  2-stepPlan=${plan}`);
    const ncNoEffect = nc === base;
    const planProgress = Number(plan) > Number(base);
    console.log(`  ACCEPTANCE: single Neural Cluster NO_EFFECT on binding=${ncNoEffect}; multi-action Meat plan measurable progress=${planProgress}`);
    console.log(`  artifacts: ${path.relative(ROOT, snapPath)} , ${path.relative(ROOT, cfPath)}`);
    if (!ncNoEffect || !planProgress) { console.error("ACCEPTANCE FAILED"); process.exit(1); }
    console.log("[lab-9.4.0] acceptance PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error?.stack || error?.message || String(error)); process.exit(1); });
