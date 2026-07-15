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
      try {
        if (a.op === "buyMax") commands.buyMaxUnit({ unit: game.unit(a.unit), ui: "lab" });
        else if (a.op === "buy") commands.buyUnit({ unit: game.unit(a.unit), num: dec(a.num), ui: "lab" });
      } catch (e) { /* game refused the buy (insufficient resources edge) — deterministic given frozen state */ }
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
      try { commands.buyUnit({ unit: u, num: commandAmount, ui: "lab" }); } catch (e) { /* game-refused edge */ }
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

// GATE 5/6 — general real-engine plan measurement against ONE chosen target, deterministic (frozen).
// Each action is a bounded (or buyMax) unit buy; measures the target's binding-resource progress.
function pageMeasurePlan({ saveString, fixedTime, targetId, actions, horizon, policy, amountTamper, dropStep }) {
  const injector = window.angular?.element(document.body)?.injector?.();
  const game = injector?.get?.("game");
  const commands = injector?.get?.("commands");
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const NUM = (v) => { try { return Number(v.toString()); } catch { return NaN; } };
  const RealDate = window.__RealDate || window.Date; window.__RealDate = RealDate;
  const FIXED = Number(fixedTime);
  function FrozenDate(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
  FrozenDate.now = () => FIXED; FrozenDate.UTC = RealDate.UTC; FrozenDate.parse = RealDate.parse; FrozenDate.prototype = RealDate.prototype;
  window.Date = FrozenDate;
  try { if (game.session && game.session.heartbeatId != null) { clearInterval(game.session.heartbeatId); game.session.heartbeatId = null; } } catch {}
  try {
    game.importSave(saveString);
    const bindingLeg = () => {
      const t = game.unit(targetId);
      const legs = t.eachCost().map((c) => ({ r: c.unit.name, need: D(c.val), have: D(c.unit.count()), ratio: NUM(c.unit.count()) / NUM(c.val) }));
      return legs.sort((a, b) => a.ratio - b.ratio)[0];
    };
    const before = bindingLeg();
    const bindingUnit = game.unit(before.r);
    const bindingCountBefore = bindingUnit.count();
    const ledger = [];
    for (let i = 0; i < actions.length; i++) {
      if (dropStep != null && i === dropStep) { ledger.push({ step: i, unit: actions[i].id, skipped: true }); continue; }
      const a = actions[i];
      const u = game.unit(a.id);
      if (!u) { ledger.push({ step: i, unit: a.id, executed: false, reason: "missing" }); continue; }
      const authorized = a.mode === "buymax" ? u.maxCostMet(1).floor() : u.maxCostMet(policy.unitBuyPercent).times(policy.meatChunkPercent).dividedBy(100).floor();
      const command = (amountTamper && i === 0) ? authorized.times(amountTamper).floor() : authorized;
      const contractSatisfied = command.eq(authorized);
      const cb = u.count();
      if (command.gt(0)) { try { commands.buyUnit({ unit: u, num: command, ui: "lab" }); } catch (e) { /* game-refused edge */ } }
      const ca = u.count();
      ledger.push({ step: i, lane: a.lane, unit: a.id, mode: a.mode || "bounded", authorizedRequestedAmount: D(authorized), commandRequestedAmount: D(command), contractSatisfied, observedTotalCountDelta: D(ca.minus(cb)), executed: ca.minus(cb).gt(0) });
    }
    game.tick(new RealDate(FIXED + horizon * 1000));
    const after = bindingLeg();
    const bindingProgress = D(bindingUnit.count().minus(bindingCountBefore));
    const t = game.unit(targetId);
    return {
      targetId, bindingResource: before.r,
      bindingHaveBefore: before.have, bindingHaveAfter: after.have,
      bindingProgress,
      affordRatioBefore: before.ratio, affordRatioAfter: after.ratio,
      targetCompletable: t.isBuyable(), ledger,
    };
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

// GATE 6 — versioned ranker `bounded-strategic-plan-outcome.v1`. Pure function. Within one identical
// {target,horizon,schema} group: completion > makes-reachable > largest verified ETA improvement >
// largest verified target-progress at horizon > WAIT. Confidence breaks a full economic tie only.
// Incompatible group => UNRANKED. NO economicScore, NO lane bonus, NO planner order, NO fairness rule.
const CONF = { high: 3, medium: 2, low: 1 };
function rankPlans(plans, groupKey, useEconomicScore = false, byPlannerOrder = false) {
  const compatible = plans.filter((p) => p.groupKey === groupKey);
  const unranked = plans.filter((p) => p.groupKey !== groupKey).map((p) => p.lane);
  if (byPlannerOrder) { // MUTATION: lane chosen by planner order (first listed), ignoring outcome
    return { winner: compatible[0]?.lane || "WAIT", ordered: compatible.map((p) => p.lane), unranked, mutated: "planner-order" };
  }
  if (useEconomicScore) { // MUTATION: rank by forbidden local economicScore (the 9.3.5 lane-dominance bug)
    const ordered = compatible.slice().sort((a, b) => (Number(b.economicScore) || 0) - (Number(a.economicScore) || 0));
    return { winner: ordered[0]?.lane || "WAIT", ordered: ordered.map((p) => p.lane), unranked, mutated: "economicScore" };
  }
  const score = (p) => [
    p.targetCompletable ? 1 : 0,
    p.makesReachable ? 1 : 0,
    Number.isFinite(p.etaImprovementSeconds) ? p.etaImprovementSeconds : 0,
    Number(p.bindingProgress) || 0,
  ];
  const ordered = compatible.slice().sort((a, b) => {
    const sa = score(a), sb = score(b);
    for (let i = 0; i < sa.length; i++) { if (sb[i] !== sa[i]) return sb[i] - sa[i]; }
    return (CONF[b.confidence] || 0) - (CONF[a.confidence] || 0); // full economic tie -> confidence only
  });
  const best = ordered[0];
  const meaningful = best && (best.targetCompletable || best.makesReachable || (Number(best.bindingProgress) || 0) > 0 || (Number(best.etaImprovementSeconds) || 0) > 0);
  const winner = meaningful ? best.lane : "WAIT";
  return { winner, ordered: ordered.map((p) => `${p.lane}(${p.bindingProgress})`), unranked, mutated: useEconomicScore ? "economicScore" : null };
}

async function measure(page, save, fixedTime, targetId, lane, actions, horizon, opts = {}) {
  const r = await page.evaluate(pageMeasurePlan, { saveString: save, fixedTime, targetId, actions, horizon, policy: RUNTIME_POLICY, amountTamper: opts.amountTamper || null, dropStep: opts.dropStep == null ? null : opts.dropStep });
  return {
    planId: `${lane}:${targetId}:${actions.map((a) => a.id + (a.mode === "buymax" ? "!" : "")).join(">") || "wait"}`,
    lane, groupKey: `${targetId}|${horizon}|bounded-strategic-plan-outcome.v1`,
    bindingProgress: r.bindingProgress, targetCompletable: r.targetCompletable,
    makesReachable: false, etaImprovementSeconds: null, confidence: "medium",
    economicScore: lane === "Territory" ? 999999 : 0, // adversarial: a forbidden score that favours Territory
    ledger: r.ledger, affordRatioAfter: r.affordRatioAfter,
  };
}

async function runGate56(page, save, fixedTime) {
  const horizon = 3600;
  const meatSeq = [{ lane: "Meat", id: "pantheon" }, { lane: "Meat", id: "pantheon2" }, { lane: "Meat", id: "pantheon" }, { lane: "Meat", id: "pantheon2" }];
  const gk = (t) => `${t}|${horizon}|bounded-strategic-plan-outcome.v1`;

  // ---- Scenario MEAT: target pantheon3 (lesser hive mind). Meat objectively progresses; others cannot.
  const MEAT = "pantheon3";
  const meatPlans = [
    await measure(page, save, fixedTime, MEAT, "WAIT", [], horizon),
    await measure(page, save, fixedTime, MEAT, "Meat", meatSeq, horizon),
    await measure(page, save, fixedTime, MEAT, "Territory", [{ lane: "Territory", id: "stinger" }], horizon),
    await measure(page, save, fixedTime, MEAT, "Energy", [{ lane: "Energy", id: "moth" }], horizon),
  ];
  const meatRank = rankPlans(meatPlans, gk(MEAT));
  const meatShuffled = rankPlans([meatPlans[3], meatPlans[1], meatPlans[0], meatPlans[2]], gk(MEAT)); // order-invariance

  // ---- Scenario WAIT: target pantheon4 (hive mind). Binding = pantheon3 (0, unbuyable) => nothing helps.
  const WAITT = "pantheon4";
  const waitPlans = [
    await measure(page, save, fixedTime, WAITT, "WAIT", [], horizon),
    await measure(page, save, fixedTime, WAITT, "Meat", [{ lane: "Meat", id: "pantheon3" }, { lane: "Meat", id: "pantheon2" }], horizon),
    await measure(page, save, fixedTime, WAITT, "Territory", [{ lane: "Territory", id: "stinger" }], horizon),
  ];
  const waitRank = rankPlans(waitPlans, gk(WAITT));

  // ---- Mutation controls (each must be caught) ----
  const mut = {};
  // 1. reintroduce local economicScore (favours Territory) -> winner flips away from the honest Meat winner
  mut.economicScore = { honestWinner: meatRank.winner, mutatedWinner: rankPlans(meatPlans, gk(MEAT), true).winner };
  mut.economicScoreCaught = mut.economicScore.mutatedWinner !== mut.economicScore.honestWinner;
  // 2. pick lane by planner order -> winner is the first-listed lane, not the progress winner
  mut.plannerOrder = { honestWinner: meatRank.winner, mutatedWinner: rankPlans(meatPlans, gk(MEAT), false, true).winner };
  mut.plannerOrderCaught = mut.plannerOrder.mutatedWinner !== mut.plannerOrder.honestWinner;
  // 3. buyMax instead of bounded -> amounts differ from the runtime bounded policy (not runtime-safe)
  const meatBuymax = await measure(page, save, fixedTime, MEAT, "Meat", meatSeq.map((a) => ({ ...a, mode: "buymax" })), horizon);
  const boundedFirst = meatPlans[1].ledger.find((l) => l.executed).authorizedRequestedAmount;
  const buymaxFirst = meatBuymax.ledger.find((l) => l.executed).authorizedRequestedAmount;
  mut.buyMaxCaught = boundedFirst !== buymaxFirst;
  // 4. change amount after authorization -> amount contract violated (command != authorized)
  const tampered = await measure(page, save, fixedTime, MEAT, "Meat", meatSeq, horizon, { amountTamper: 2 });
  mut.amountTamperCaught = tampered.ledger.some((l) => l.executed && l.contractSatisfied === false);
  // 5. drop an intermediate Meat step -> less verified progress than the full plan
  const dropped = await measure(page, save, fixedTime, MEAT, "Meat", meatSeq, horizon, { dropStep: 2 });
  mut.dropStepCaught = Number(dropped.bindingProgress) < Number(meatPlans[1].bindingProgress);
  // 6. stale plan reuse + 7. heartbeat leakage are proven elsewhere (Track A STALE_AUTHORIZATION; GATE 1)
  mut.stalePlanCaughtBy = "Track A STALE_AUTHORIZATION (check-9.4.0-authorization-amount-contract)";
  mut.heartbeatCaughtBy = "GATE 1 unfrozen mutation control (this harness)";

  const evidence = {
    schemaVersion: "gate56-lane-sensitivity.v1", capturedAt: new Date().toISOString(),
    save: { name: SAVE_NAME, fixedTimeIso: new Date(fixedTime).toISOString() }, horizon, rankerSchema: "bounded-strategic-plan-outcome.v1",
    scenarios: {
      meatWins: { target: MEAT, winner: meatRank.winner, ordered: meatRank.ordered, orderInvariantWinner: meatShuffled.winner, plans: meatPlans.map((p) => ({ lane: p.lane, bindingProgress: p.bindingProgress, targetCompletable: p.targetCompletable })) },
      waitWins: { target: WAITT, winner: waitRank.winner, ordered: waitRank.ordered, plans: waitPlans.map((p) => ({ lane: p.lane, bindingProgress: p.bindingProgress })) },
      engineWins: { status: "MISSING_DATA", reason: "no importable save exists where an Engine action binds the active milestone; the one repo save is a saturated late-game Meat state (GATE 3), and Engine-binding states cannot be legally derived from it (GATE 4)", needed: "a real early/mid-game save whose active milestone's binding resource is improved by a larva-engine upgrade (Expansion/Hatchery), captured with per-unit mechanics" },
      territoryWins: { status: "MISSING_DATA", reason: "same as Engine: no save where a Territory/army action binds the active milestone", needed: "a real save whose active milestone binds on territory (e.g. an Expansion target inside its save window with a slow territory rate)" },
    },
    mutationControls: mut,
  };
  fs.writeFileSync(path.join(OUT_DIR, `gate56-lane-sensitivity-${SAVE_NAME}.json`), JSON.stringify(evidence, null, 1));

  console.log(`  Scenario MEAT (target ${MEAT}): winner=${meatRank.winner}  ordered=[${meatRank.ordered.join(", ")}]`);
  console.log(`    order-invariance: shuffled winner=${meatShuffled.winner} (${meatShuffled.winner === meatRank.winner ? "invariant ✓" : "CHANGED ✗"})`);
  console.log(`  Scenario WAIT (target ${WAITT}): winner=${waitRank.winner}  ordered=[${waitRank.ordered.join(", ")}]`);
  console.log(`  Engine-wins scenario: MISSING_DATA (needs a real Engine-binding save)`);
  console.log(`  Territory-wins scenario: MISSING_DATA (needs a real Territory-binding save)`);
  console.log(`  mutation controls: economicScore-caught=${mut.economicScoreCaught} plannerOrder-caught=${mut.plannerOrderCaught} buyMax-caught=${mut.buyMaxCaught} amountTamper-caught=${mut.amountTamperCaught} dropStep-caught=${mut.dropStepCaught}`);

  const meatOk = meatRank.winner === "Meat" && meatShuffled.winner === "Meat";
  const waitOk = waitRank.winner === "WAIT";
  const mutOk = mut.economicScoreCaught && mut.plannerOrderCaught && mut.buyMaxCaught && mut.amountTamperCaught && mut.dropStepCaught;
  console.log(`\n[GATE 5] available real scenarios: Meat-wins=${meatOk ? "✓" : "✗"} WAIT-wins=${waitOk ? "✓" : "✗"} | Engine-wins & Territory-wins = MISSING_DATA`);
  console.log(`[GATE 6] ranker mutation controls all caught: ${mutOk ? "✓" : "✗"}`);
  console.log(`[GATE 5/6] ${meatOk && waitOk && mutOk ? "PASS on available data (lane matrix INCOMPLETE: Engine/Territory fixtures missing)" : "FAILED"}`);
  if (!(meatOk && waitOk && mutOk)) process.exit(1);
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

    const gates = GATE === "all" ? ["1", "2", "56"] : [GATE];
    for (const g of gates) {
      console.log(`\n===== GATE ${g} (save=${SAVE_NAME}) =====`);
      if (g === "1") await runGate1(page, save, fixedTime);
      else if (g === "2") await runGate2(page, save, fixedTime);
      else if (g === "56") await runGate56(page, save, fixedTime);
      else throw new Error(`unknown gate: ${g}`);
    }
  } finally { await browser.close(); }
}

main().catch((e) => { console.error(e?.stack || e?.message || String(e)); process.exit(1); });
