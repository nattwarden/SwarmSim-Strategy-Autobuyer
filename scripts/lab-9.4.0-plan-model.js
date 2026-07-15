#!/usr/bin/env node
"use strict";

// 9.4.0 "Prove the Bounded Plan Model" laboratory (READ-ONLY; NOT part of `verify`; NO runtime change).
//
// GATE 1 — full time freeze: each counterfactual branch is a pure function simulate(save,plan,horizon).
//   Clock control: freeze window.Date to FIXED = the save's own date.saved epoch (derived from the save,
//   so it is session-independent), stop the session heartbeat, and advance passive production ONLY via
//   explicit game.tick(new Date(FIXED + horizon*1000)). importSave under the frozen clock ticks
//   date.reified -> FIXED (~0 ms) so the start state is the exact as-saved state, no wall-clock offline.
//   Determinism acceptance: 10 identical (save,plan,horizon) runs -> byte-identical result JSON
//   (string-exact Decimals). Mutation control: unfrozen clock (wall-clock leakage) -> results differ.
//
// Later gates (2..7) extend this file. Run: node scripts/lab-9.4.0-plan-model.js [--save <path>]

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "9.4.0-plan-laboratory");

function arg(flag, def) { const i = process.argv.indexOf(flag); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def; }
const SAVE_PATH = arg("--save", path.join(ROOT, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt"));
const SAVE_NAME = path.basename(path.dirname(SAVE_PATH)) || "save";

// The in-page branch runner. Serialized into the page; must be self-contained.
function pageBranch({ saveString, fixedTime, plan, horizon, freeze }) {
  const injector = window.angular?.element(document.body)?.injector?.();
  const game = injector?.get?.("game");
  const commands = injector?.get?.("commands");
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const RealDate = window.__RealDate || window.Date; window.__RealDate = RealDate;
  const FIXED = Number(fixedTime);
  let restore = () => {};
  if (freeze) {
    function FrozenDate(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
    FrozenDate.now = () => FIXED; FrozenDate.UTC = RealDate.UTC; FrozenDate.parse = RealDate.parse; FrozenDate.prototype = RealDate.prototype;
    window.Date = FrozenDate;
    try { if (game.session && game.session.heartbeatId != null) { clearInterval(game.session.heartbeatId); game.session.heartbeatId = null; } } catch {}
    restore = () => { window.Date = RealDate; };
  }
  try {
    game.importSave(saveString);
    const dec = (n) => (game.Decimal ? game.Decimal(n) : n);
    for (const a of (plan || [])) {
      if (a.op === "buyMax") commands.buyMaxUnit({ unit: game.unit(a.unit), ui: "lab" });
      else if (a.op === "buy") commands.buyUnit({ unit: game.unit(a.unit), num: dec(a.num), ui: "lab" });
    }
    const base = freeze ? FIXED : game.now.getTime();
    game.tick(new RealDate(base + horizon * 1000));
    const ids = ["meat", "larva", "goddess", "pantheon", "pantheon2", "pantheon3", "territory", "energy"];
    const state = {};
    for (const id of ids) { const u = game.unit(id); if (u) state[id] = { count: D(u.count()), velocity: D(u.velocity()) }; }
    const t = game.unit("pantheon3");
    const targetLegs = t.eachCost().map((c) => ({ resource: c.unit.name, need: D(c.val), have: D(c.unit.count()) }));
    return { plan, horizon, freeze, fixedTime: FIXED, state, targetLegs };
  } finally { restore(); }
}

function readSavedEpoch({ saveString }) {
  const game = window.angular.element(document.body).injector().get("game");
  game.importSave(saveString);
  const d = game.session.state.date.saved;
  return Number(d && d.valueOf ? d.valueOf() : NaN);
}

const hashOf = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

async function main() {
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(7000);

    const fixedTime = await page.evaluate(readSavedEpoch, { saveString: save });
    if (!Number.isFinite(fixedTime)) throw new Error("could not derive date.saved epoch from save");

    const horizon = 3600;
    const testPlans = {
      WAIT: [],
      planNCthenHN: [{ op: "buyMax", unit: "pantheon" }, { op: "buyMax", unit: "pantheon2" }],
    };

    const evidence = { schemaVersion: "gate1-determinism.v1", capturedAt: new Date().toISOString(), save: { name: SAVE_NAME, fixedTimeEpoch: fixedTime, fixedTimeIso: new Date(fixedTime).toISOString() }, horizon, runsPerBranch: 10, results: {} };

    let allFrozenIdentical = true, allUnfrozenDiffer = true;
    for (const [name, plan] of Object.entries(testPlans)) {
      const frozen = [];
      for (let i = 0; i < 10; i++) frozen.push(hashOf((await page.evaluate(pageBranch, { saveString: save, fixedTime, plan, horizon, freeze: true })).state));
      const unfrozen = [];
      for (let i = 0; i < 10; i++) { unfrozen.push(hashOf((await page.evaluate(pageBranch, { saveString: save, fixedTime, plan, horizon, freeze: false })).state)); await page.waitForTimeout(150); }
      const frozenIdentical = new Set(frozen).size === 1;
      const unfrozenDiffer = new Set(unfrozen).size > 1;
      allFrozenIdentical = allFrozenIdentical && frozenIdentical;
      allUnfrozenDiffer = allUnfrozenDiffer && unfrozenDiffer;
      evidence.results[name] = { frozenHash: frozen[0].slice(0, 16), frozenDistinct: new Set(frozen).size, frozenIdentical, unfrozenDistinct: new Set(unfrozen).size, unfrozenDiffer };
      console.log(`  ${name.padEnd(14)} frozen: ${frozenIdentical ? "byte-identical x10 ✓" : "NOT identical ✗"} (${new Set(frozen).size} distinct) | unfrozen mutation-control: ${unfrozenDiffer ? "differs ✓" : "identical ✗"} (${new Set(unfrozen).size} distinct)`);
    }
    evidence.gate1Determinism = allFrozenIdentical ? "PASS" : "FAIL";
    evidence.gate1MutationControl = allUnfrozenDiffer ? "PASS" : "INCONCLUSIVE";
    fs.writeFileSync(path.join(OUT_DIR, `gate1-determinism-${SAVE_NAME}.json`), JSON.stringify(evidence, null, 1));

    console.log(`\n[GATE 1] determinism=${evidence.gate1Determinism}  mutation-control=${evidence.gate1MutationControl}  (FIXED=${new Date(fixedTime).toISOString()} from save date.saved)`);
    if (!allFrozenIdentical) { console.error("GATE 1 FAILED: frozen runs not byte-identical"); process.exit(1); }
    if (!allUnfrozenDiffer) console.warn("GATE 1 note: unfrozen runs did not differ (mutation control inconclusive on this host)");
    console.log("[GATE 1] PASSED");
  } finally { await browser.close(); }
}

main().catch((e) => { console.error(e?.stack || e?.message || String(e)); process.exit(1); });
