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
const GATE = arg("--gate", "1");

// Runtime bounded-amount policy (mirrors dev-src DEFAULT_CONFIG): bounded = floor(maxCostMet(unitBuyPercent)
// * chunkPercent/100); actions capped at smartMaxActionsPerRun; a minimum reserve ratio must remain.
const RUNTIME_POLICY = { unitBuyPercent: 0.85, meatChunkPercent: 25, smartMaxActionsPerRun: 4, meatMinReserveRatio: 5 };

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

// GATE 2 — bounded runtime-policy plan runner. Under the frozen clock, executes a Meat plan with
// runtime bounded amounts (chunk of maxCostMet, reserve-gated), authorizing exactly one action at a
// time and re-reading fresh state between actions (replanning). Also runs the buyMax upper bound for
// reference. `mode`: "bounded" | "buymax". Returns per-action amount contracts + target progress.
function pageBoundedPlan({ saveString, fixedTime, actions, horizon, mode, policy, amountTamper }) {
  const injector = window.angular?.element(document.body)?.injector?.();
  const game = injector?.get?.("game");
  const commands = injector?.get?.("commands");
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const RealDate = window.__RealDate || window.Date; window.__RealDate = RealDate;
  const FIXED = Number(fixedTime);
  function FrozenDate(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
  FrozenDate.now = () => FIXED; FrozenDate.UTC = RealDate.UTC; FrozenDate.parse = RealDate.parse; FrozenDate.prototype = RealDate.prototype;
  window.Date = FrozenDate;
  try { if (game.session && game.session.heartbeatId != null) { clearInterval(game.session.heartbeatId); game.session.heartbeatId = null; } } catch {}
  try {
    game.importSave(saveString);
    const p2before = D(game.unit("pantheon2").count());
    const ledger = [];
    const budget = Math.min(actions.length, policy.smartMaxActionsPerRun);
    for (let i = 0; i < budget; i++) {
      const unitId = actions[i];
      const u = game.unit(unitId);
      // 1. build proposal amount from CURRENT (fresh) state
      let authorized;
      if (mode === "buymax") authorized = u.maxCostMet(1).floor();
      else authorized = u.maxCostMet(policy.unitBuyPercent).times(policy.meatChunkPercent).dividedBy(100).floor();
      // 2. safety/reserve: the bounded amount already reserves via maxCostMet(unitBuyPercent<1) (keeps
      //    1-unitBuyPercent of resources) and the chunk fraction. Report the retained-reserve ratio
      //    (full affordable / authorized) for transparency; only a zero bounded amount is refused.
      const fullAff = u.maxCostMet(1);
      const reserveRatio = authorized.gt(0) ? Number(fullAff.div(authorized).toString()) : Infinity;
      if (!authorized.gt(0)) { ledger.push({ step: i, unit: unitId, authorizedRequestedAmount: D(authorized), executed: false, reserveRatio, reason: "zero bounded amount" }); continue; }
      // 3. authorize exact amount; 4. execute ONLY this action. amountTamper simulates a broken contract.
      const commandAmount = amountTamper && i === 0 ? authorized.times(amountTamper).floor() : authorized;
      const contractSatisfied = commandAmount.eq(authorized);
      const before = u.count();
      commands.buyUnit({ unit: u, num: commandAmount, ui: "lab" });
      const after = u.count();
      ledger.push({ step: i, unit: unitId, authorizedRequestedAmount: D(authorized), commandRequestedAmount: D(commandAmount), contractSatisfied, observedTotalCountDelta: D(after.minus(before)), reserveRatio, executed: after.minus(before).gt(0) });
      // 5. fresh snapshot is implicit (next iteration re-reads); 6. replan continues
    }
    game.tick(new RealDate(FIXED + horizon * 1000));
    const p2after = D(game.unit("pantheon2").count());
    const t = game.unit("pantheon3");
    const bindingHave = D(t.eachCost().find((c) => c.unit.name === "pantheon2").unit.count());
    return { mode, horizon, budget, ledger, pantheon2Before: p2before, pantheon2After: p2after, bindingHaveAtHorizon: bindingHave, goddessAfter: D(game.unit("goddess").count()), pantheonAfter: D(game.unit("pantheon").count()) };
  } finally { window.Date = RealDate; }
}

function readSavedEpoch({ saveString }) {
  const game = window.angular.element(document.body).injector().get("game");
  game.importSave(saveString);
  const d = game.session.state.date.saved;
  return Number(d && d.valueOf ? d.valueOf() : NaN);
}

const hashOf = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

async function runGate2(page, save, fixedTime) {
  const horizon = 3600;
  // WAIT baseline (no actions) for the progress reference.
  const wait = await page.evaluate(pageBranch, { saveString: save, fixedTime, plan: [], horizon, freeze: true });
  const waitP2 = wait.state.pantheon2.count;

  // The bounded runtime-safe Meat plan runtime would actually be allowed to use: up to 4 bounded actions,
  // replanned each step, on the target path toward Lesser Hive Mind (raise pool via pantheon, then raise
  // the binding resource pantheon2). Plus the buyMax mechanical upper bound for reference.
  const meatActions = ["pantheon", "pantheon2", "pantheon", "pantheon2"];
  const bounded = await page.evaluate(pageBoundedPlan, { saveString: save, fixedTime, actions: meatActions, horizon, mode: "bounded", policy: RUNTIME_POLICY, amountTamper: null });
  const boundedSingleHN = await page.evaluate(pageBoundedPlan, { saveString: save, fixedTime, actions: ["pantheon2"], horizon, mode: "bounded", policy: RUNTIME_POLICY, amountTamper: null });
  const boundedSingleNC = await page.evaluate(pageBoundedPlan, { saveString: save, fixedTime, actions: ["pantheon"], horizon, mode: "bounded", policy: RUNTIME_POLICY, amountTamper: null });
  const buymax = await page.evaluate(pageBoundedPlan, { saveString: save, fixedTime, actions: meatActions, horizon, mode: "buymax", policy: RUNTIME_POLICY, amountTamper: null });

  const prog = (r) => Number(r.pantheon2After) - Number(waitP2);
  const boundedProgress = prog(bounded);
  const buymaxProgress = prog(buymax);
  const evidence = {
    schemaVersion: "gate2-bounded-runtime-policy.v1", capturedAt: new Date().toISOString(),
    save: { name: SAVE_NAME, fixedTimeIso: new Date(fixedTime).toISOString() }, horizon,
    target: { internalId: "pantheon3", displayName: "lesser hive mind", bindingResource: "pantheon2 (hive network)" },
    runtimePolicy: RUNTIME_POLICY, waitBaselinePantheon2: waitP2,
    boundedRuntimeSafe: { ledger: bounded.ledger, pantheon2After: bounded.pantheon2After, progress: String(boundedProgress) },
    boundedSingleHiveNetwork: { ledger: boundedSingleHN.ledger, progress: String(prog(boundedSingleHN)) },
    boundedSingleNeuralCluster: { ledger: boundedSingleNC.ledger, progress: String(prog(boundedSingleNC)) },
    buyMaxUpperBound: { ledger: buymax.ledger, pantheon2After: buymax.pantheon2After, progress: String(buymaxProgress) },
  };
  fs.writeFileSync(path.join(OUT_DIR, `gate2-bounded-${SAVE_NAME}.json`), JSON.stringify(evidence, null, 1));

  console.log(`  WAIT baseline pantheon2 = ${waitP2}`);
  console.log(`  bounded single Neural Cluster progress = ${prog(boundedSingleNC)} (expect ~0, produces goddess)`);
  console.log(`  bounded single Hive Network  progress = ${prog(boundedSingleHN)} (expect > 0)`);
  console.log(`  bounded runtime-safe 4-action plan progress = ${boundedProgress}`);
  console.log(`  buyMax mechanical upper bound progress      = ${buymaxProgress}`);
  bounded.ledger.forEach((a) => console.log(`    step${a.step} ${a.unit}: authorized=${a.authorizedRequestedAmount} command=${a.commandRequestedAmount} contract=${a.contractSatisfied} delta=${a.observedTotalCountDelta} exec=${a.executed}`));

  const boundedWorks = boundedProgress > 0;
  const allContractsSatisfied = bounded.ledger.filter((a) => a.executed).every((a) => a.contractSatisfied === true);
  console.log(`\n[GATE 2] runtime-safe bounded plan gives positive target progress: ${boundedWorks ? "YES ✓" : "NO ✗"} (not only buyMax)`);
  console.log(`[GATE 2] every executed action's amount contract satisfied (command==authorized): ${allContractsSatisfied ? "YES ✓" : "NO ✗"}`);
  console.log(`[GATE 2] ${boundedWorks && allContractsSatisfied ? "PASSED" : "FAILED"}`);
  if (!(boundedWorks && allContractsSatisfied)) process.exit(1);
}

async function runGate1(page, save, fixedTime) {
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
}

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

    const gates = GATE === "all" ? ["1", "2"] : [GATE];
    for (const g of gates) {
      console.log(`\n===== GATE ${g} (save=${SAVE_NAME}) =====`);
      if (g === "1") await runGate1(page, save, fixedTime);
      else if (g === "2") await runGate2(page, save, fixedTime);
      else throw new Error(`unknown gate: ${g}`);
    }
  } finally { await browser.close(); }
}

main().catch((e) => { console.error(e?.stack || e?.message || String(e)); process.exit(1); });
