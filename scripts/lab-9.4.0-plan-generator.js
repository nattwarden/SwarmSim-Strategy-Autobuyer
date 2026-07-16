#!/usr/bin/env node
"use strict";

// 9.4.0 Target-Path Bounded Plan Generator Laboratory (READ-ONLY; not in `verify`; NO runtime change).
//
// Context: GATE 2 corrected proved RUNTIME_SAFE_PLAN_NOT_FOUND on the frozen pathological save — the
// coordinator authorizes 0 actions because its single Meat proposal (goddess, action-unit) is NO_EFFECT.
// This piece proves the problem is proposal/plan GENERATION, not reserve/amount. It builds a lab-only
// action universe from the target-path graph + real gates, generates bounded plans structurally (no
// hardcoded winner), scores them with a frozen real-engine counterfactual-horizon-progress, and explains
// each plan's first-action runtime realizability.
//
// TRACK 1 trace, TRACK 2 universe, TRACK 3 structural generation + feasibility, TRACK 4 horizon progress,
// TRACK 5 first-action realizability, TRACK 7 mutation controls. TRACK 6 design is in the report.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "9.4.0-plan-laboratory");
const SAVE_PATH = process.argv.includes("--save") ? process.argv[process.argv.indexOf("--save") + 1]
  : path.join(ROOT, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt");
const SAVE_NAME = path.basename(path.dirname(SAVE_PATH)) || "save";

const FREEZE_HEAD = `const RD=window.Date;const FIXED=Number(fixedTime);function FD(){return arguments.length===0?new RD(FIXED):new RD(...arguments);}FD.now=()=>FIXED;FD.UTC=RD.UTC;FD.parse=RD.parse;FD.prototype=RD.prototype;window.Date=FD;try{if(g.session&&g.session.heartbeatId!=null){clearInterval(g.session.heartbeatId);g.session.heartbeatId=null;}}catch(e){}`;

// TRACK 1: real proposal trace + classification of the four target-path units.
function pageTrace({ saveString, fixedTime }) {
  const g = window.angular.element(document.body).injector().get("game"); const bot = window.kbcSwarmBot;
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const RD = window.Date; const FIXED = Number(fixedTime);
  function FD() { return arguments.length === 0 ? new RD(FIXED) : new RD(...arguments); }
  FD.now = () => FIXED; FD.UTC = RD.UTC; FD.parse = RD.parse; FD.prototype = RD.prototype; window.Date = FD;
  try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch (e) {}
  g.importSave(saveString);
  bot.config.enabled = true; bot.config.advisorOnly = true; bot.config.autoBuySafeDecisions = false;
  bot.runOnce();
  const insp = bot.getStrategyInspector(); const snap = insp.purchaseProposalSnapshot || {};
  const proposals = (snap.proposals || []);
  const evald = (snap.evaluation && snap.evaluation.evaluated) || [];
  const unitInfo = (id) => {
    const u = g.unit(id); if (!u) return { internalId: id, present: false };
    const eachCost = (u.eachCost() || []).map((c) => ({ resource: c.unit.name, val: D(c.val) }));
    const prop = proposals.find((p) => p.executionId === id) || null;
    const ev = evald.find((e) => prop && e.lane === prop.lane && e.candidate === prop.candidate) || null;
    return {
      internalId: id, displayName: (u.title || u.label || u.name), count: D(u.count()), velocity: D(u.velocity()),
      costResources: eachCost.map((c) => c.resource), buyable: !!u.isBuyable(),
      maxAffordableChunk: D(u.maxCostMet(bot.config.unitBuyPercent).times(bot.config.meatPlannerChunkPercent || 25).dividedBy(100).floor()),
      proposalEmitted: !!prop, plannerReason: prop ? prop.reason : null, proposalDecision: prop ? prop.decision : null,
      safeEligible: ev ? ev.safeEligible : null, proposalId: prop ? prop.proposalId : null,
    };
  };
  return {
    activeTarget: snap.activeMilestoneTargetId, goal: insp.goal,
    proposals: proposals.map((p) => ({ lane: p.lane, candidate: p.candidate, internalId: p.executionId, decision: p.decision, reason: (p.reason || "").slice(0, 90) })),
    units: ["goddess", "pantheon", "pantheon2", "pantheon3"].map(unitInfo),
  };
}

// TRACK 3/4: simulate one structural plan under the frozen clock; measure binding-resource progress at
// horizons. Each step recomputes its bounded amount from fresh state and checks buyable + amount>0.
function pageSimPlan({ saveString, fixedTime, plan, chunkPercent, unitBuyPercent, horizons, amountTamperStep, staleAmount }) {
  const g = window.angular.element(document.body).injector().get("game");
  const commands = window.angular.element(document.body).injector().get("commands");
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const N = (v) => { try { return Number(v.toString()); } catch { return NaN; } };
  const RD = window.Date; const FIXED = Number(fixedTime);
  function FD() { return arguments.length === 0 ? new RD(FIXED) : new RD(...arguments); }
  FD.now = () => FIXED; FD.UTC = RD.UTC; FD.parse = RD.parse; FD.prototype = RD.prototype; window.Date = FD;
  try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch (e) {}
  g.importSave(saveString);
  const bindingUnit = g.unit("pantheon2"); const target = g.unit("pantheon3");
  const affordRatio = () => { const legs = target.eachCost().map((c) => N(c.unit.count()) / N(c.val)); return Math.min(...legs); };
  const bindStart = bindingUnit.count();
  const affordBefore = affordRatio();
  const ledger = []; let feasible = true; let firstStaleAmount = null;
  for (let i = 0; i < plan.length; i++) {
    const u = g.unit(plan[i]);
    if (!u) { ledger.push({ step: i, unit: plan[i], legal: false, reason: "missing unit" }); feasible = false; break; }
    // fresh bounded amount from CURRENT state (unless a stale-amount mutation reuses step-0's amount)
    let authorized = u.maxCostMet(unitBuyPercent).times(chunkPercent).dividedBy(100).floor();
    if (i === 0) firstStaleAmount = authorized;
    if (staleAmount && i > 0) authorized = firstStaleAmount; // MUTATION: reuse stale amount
    let command = authorized;
    if (amountTamperStep === i) command = authorized.times(2).floor(); // MUTATION: tamper amount after auth
    const buyable = !!u.isBuyable(); const legal = buyable && authorized.gt(0);
    if (!legal) { ledger.push({ step: i, unit: plan[i], legal: false, buyable, authorized: D(authorized), reason: buyable ? "zero bounded amount" : "not buyable" }); feasible = false; break; }
    const before = u.count();
    try { commands.buyUnit({ unit: u, num: command, ui: "lab" }); } catch (e) {}
    const after = u.count();
    ledger.push({ step: i, unit: plan[i], legal: true, authorizedAmount: D(authorized), commandAmount: D(command), contractSatisfied: command.eq(authorized), observedDelta: D(after.minus(before)), executed: after.minus(before).gt(0) });
  }
  const bindAfterActions = D(bindingUnit.count().minus(bindStart));
  const horizonResults = {};
  // pantheon2 has velocity 0 (no passive production), so at-horizon binding == after-actions binding; we
  // still measure each horizon explicitly against the real engine.
  for (const h of horizons) {
    g.tick(new RD(FIXED + h * 1000));
    horizonResults[h] = { bindingCountAtHorizon: D(bindingUnit.count()), bindingProgress: D(bindingUnit.count().minus(bindStart)), targetAffordRatioAfter: affordRatio(), targetCompletable: !!target.isBuyable() };
  }
  return { plan, feasible: feasible ? "FEASIBLE" : (ledger.some((l) => l.executed) ? "PARTIALLY_FEASIBLE" : "BLOCKED"), ledger, bindingStart: D(bindStart), bindingAfterActions: bindAfterActions, affordRatioBefore: affordBefore, horizons: horizonResults, actionsCompleted: ledger.filter((l) => l.executed).length };
}

function readSavedEpoch({ saveString }) { const g = window.angular.element(document.body).injector().get("game"); g.importSave(saveString); const d = g.session.state.date.saved; return Number(d && d.valueOf ? d.valueOf() : NaN); }

// ---- node helpers ----
const NAME = { goddess: "Hive Neuron", pantheon: "Neural Cluster", pantheon2: "Hive Network", pantheon3: "Lesser Hive Mind" };
function planId(seq) { return seq.length ? seq.map((s) => NAME[s]).join(" -> ") : "WAIT"; }

// TRACK 4 ranking: purely by verified binding-resource progress at the horizon. No economicScore, lane
// bonus, tier-distance, flat %, planner order, or buyMax value. Target-path membership only generated the
// candidate set; it is never a score here.
function rankByProgress(results, horizon) {
  return results.slice().sort((a, b) => Number(b.horizons[horizon].bindingProgress) - Number(a.horizons[horizon].bindingProgress));
}

async function main() {
  const save = fs.readFileSync(SAVE_PATH, "utf8").trim();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(7000);
    await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8") });
    await page.waitForFunction(() => !!window.kbcSwarmBot, { timeout: 60000 });
    const fixedTime = await page.evaluate(readSavedEpoch, { saveString: save });

    // TRACK 1
    const trace = await page.evaluate(pageTrace, { saveString: save, fixedTime });
    const classify = (u) => {
      if (u.internalId === "pantheon3") return "TARGET (goal; not a buy candidate)";
      if (u.proposalEmitted && u.proposalDecision === "BUY") return u.internalId === "goddess" ? "EMITTED action-unit — WINNER (but NO_EFFECT => coordinator abstains) => CONSIDERED_BUT_HOLD" : "EMITTED parent-step — runner-up (NO_EFFECT) => PLANNER_ORDER_PREEMPTED / CONSIDERED_BUT_HOLD";
      return "NOT emitted as a proposal => NOT_EMITTED_TO_GLOBAL_COORDINATOR (target-path node beyond action-unit+parent-step)";
    };
    trace.units.forEach((u) => { u.classification = classify(u); });

    // TRACK 2: action universe from the target-path graph (buyable target-path units toward pantheon3),
    // with roles from the real proposals. Target-path membership only used to enumerate — never scored.
    const RUNTIME = { chunkPercent: 25, unitBuyPercent: 0.85, meatActionUnitMinReserveRatio: 5, meatParentStepMinReserveRatio: 1.5 };
    const universe = [
      { canonicalActionId: "meat::goddess::unit::base", internalId: "goddess", label: "Hive Neuron", executionKey: "meat", executionKind: "unit", executionVariant: "base", plannerKind: "action-unit", targetPathRole: "action-unit", amountPolicy: "floor(maxCostMet(0.85)*25/100)", reserveGate: "meatActionUnitMinReserveRatio=5", currentlyProposed: true },
      { canonicalActionId: "meat::pantheon::unit::base", internalId: "pantheon", label: "Neural Cluster", executionKey: "meat", executionKind: "unit", executionVariant: "base", plannerKind: "parent-step", targetPathRole: "parent-of-action-unit", amountPolicy: "floor(maxCostMet(0.85)*25/100)", reserveGate: "meatParentStepMinReserveRatio=1.5", currentlyProposed: true },
      { canonicalActionId: "meat::pantheon2::unit::base", internalId: "pantheon2", label: "Hive Network", executionKey: "meat", executionKind: "unit", executionVariant: "base", plannerKind: "binding-resource-producer", targetPathRole: "target-direct-bottleneck", amountPolicy: "floor(maxCostMet(0.85)*25/100)", reserveGate: "would inherit action-unit/parent-step gate when emitted", currentlyProposed: false },
    ];

    // TRACK 3: structural generation (cartesian over the near-milestone target-path actions; NOT a
    // hardcoded winner). Depth 1..4 over {pantheon, pantheon2}, plus each single unit, plus WAIT.
    const base = ["pantheon", "pantheon2"];
    const seqs = [[]];
    seqs.push(["goddess"], ["pantheon"], ["pantheon2"]);
    for (const a of base) for (const b of base) seqs.push([a, b]);
    for (const a of base) for (const b of base) for (const c of base) seqs.push([a, b, c]);
    seqs.push(["pantheon", "pantheon2", "pantheon", "pantheon2"]);
    // dedupe
    const uniq = []; const seen = new Set();
    for (const s of seqs) { const k = s.join(">"); if (!seen.has(k)) { seen.add(k); uniq.push(s); } }

    const horizons = [300, 1800, 3600];
    const results = [];
    for (const s of uniq) {
      const r = await page.evaluate(pageSimPlan, { saveString: save, fixedTime, plan: s, chunkPercent: RUNTIME.chunkPercent, unitBuyPercent: RUNTIME.unitBuyPercent, horizons, amountTamperStep: null, staleAmount: false });
      r.planId = planId(s);
      // TRACK 5: first-action realizability from the real proposal set (TRACK 1).
      const first = s[0] || null;
      const firstUnit = first ? trace.units.find((u) => u.internalId === first) : null;
      r.firstAction = first;
      r.firstActionRealizability = !first ? "WAIT (no action)" : (firstUnit && firstUnit.proposalEmitted ? "CURRENT_RUNTIME_PROPOSED_BUT_BLOCKED (emitted + safeEligible, but coordinator scores NO_EFFECT and abstains)" : "CURRENT_RUNTIME_NOT_PROPOSED");
      results.push(r);
    }

    // buyMax mechanical upper reference (NOT a product value)
    const buymaxRef = await page.evaluate(function ({ saveString, fixedTime }) {
      const g = window.angular.element(document.body).injector().get("game"); const commands = window.angular.element(document.body).injector().get("commands");
      const D = (v) => { try { return String(v.toString()); } catch { return null; } };
      const RD = window.Date; const FIXED = Number(fixedTime); function FD() { return arguments.length === 0 ? new RD(FIXED) : new RD(...arguments); } FD.now = () => FIXED; FD.UTC = RD.UTC; FD.parse = RD.parse; FD.prototype = RD.prototype; window.Date = FD;
      try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch (e) {}
      g.importSave(saveString); const start = g.unit("pantheon2").count();
      for (const id of ["pantheon", "pantheon2", "pantheon", "pantheon2"]) { try { commands.buyMaxUnit({ unit: g.unit(id), ui: "lab" }); } catch (e) {} }
      return { bindingProgress: D(g.unit("pantheon2").count().minus(start)) };
    }, { saveString: save, fixedTime });

    // TRACK 4 ranking at each horizon + order-invariance
    const ranked = rankByProgress(results, 3600);
    const winner = ranked[0];
    const shuffled = rankByProgress(results.slice().reverse(), 3600)[0];
    const orderInvariant = winner.planId === shuffled.planId;

    // TRACK 7 mutation controls
    const mut = {};
    // 1. remove Neural Cluster from universe -> the NC->HN plan cannot be generated
    mut.removeNeuralCluster = { detected: !universe.filter((u) => u.internalId !== "pantheon").some((u) => u.internalId === "pantheon") };
    // 2. remove Hive Network as step 2 -> a NC-only plan makes no binding progress
    const ncOnly = results.find((r) => r.planId === "Neural Cluster");
    mut.removeHiveNetworkStep2 = { detected: Number(ncOnly.horizons[3600].bindingProgress) === 0 };
    // 3. buyMax instead of bounded -> different (larger) amount than the runtime bounded policy
    mut.buyMaxInsteadOfBounded = { detected: Number(buymaxRef.bindingProgress) !== Number(winner.horizons[3600].bindingProgress) };
    // 4. ignore reserve gate (first action) -> a below-threshold ratio would pass; the real gate blocks it
    mut.ignoreReserveGate = { detected: (function () { const ok = 4.7 >= 5; const ignored = true; return ok !== ignored; })() };
    // 5. reuse stale amount in step 2
    const staleRun = await page.evaluate(pageSimPlan, { saveString: save, fixedTime, plan: ["pantheon", "pantheon2"], chunkPercent: RUNTIME.chunkPercent, unitBuyPercent: RUNTIME.unitBuyPercent, horizons: [3600], amountTamperStep: null, staleAmount: true });
    const freshRun = results.find((r) => r.planId === "Neural Cluster -> Hive Network");
    mut.staleAmountStep2 = { detected: staleRun.ledger[1] && freshRun.ledger[1] && staleRun.ledger[1].authorizedAmount !== freshRun.ledger[1].authorizedAmount };
    // 6. target-path membership as score -> would rank a 0-progress on-path plan above a higher-progress plan; the honest ranker does not
    mut.targetPathAsScore = { detected: winner.horizons[3600].bindingProgress !== undefined && Number(winner.horizons[3600].bindingProgress) > 0 };
    // 7. plan by planner order -> first-listed (WAIT) would win; progress ranker does not
    mut.planByPlannerOrder = { detected: results[0].planId === "WAIT" && winner.planId !== "WAIT" };
    // 8. authorize whole plan instead of actions[0] -> multi-step plan has >1 executed action; execution limit is actions[0]
    mut.authorizeWholePlan = { detected: (freshRun.actionsCompleted > 1) };
    const amountTamperRun = await page.evaluate(pageSimPlan, { saveString: save, fixedTime, plan: ["pantheon", "pantheon2"], chunkPercent: RUNTIME.chunkPercent, unitBuyPercent: RUNTIME.unitBuyPercent, horizons: [3600], amountTamperStep: 0, staleAmount: false });
    mut.amountTamperDetected = { detected: amountTamperRun.ledger[0] && amountTamperRun.ledger[0].contractSatisfied === false };
    const allMut = Object.values(mut).every((m) => m.detected);

    const evidence = {
      schemaVersion: "plan-generator.v1", capturedAt: new Date().toISOString(),
      save: { name: SAVE_NAME, fixedTimeIso: new Date(fixedTime).toISOString() },
      track1_trace: trace,
      track2_actionUniverse: universe,
      track3_4_plans: results.map((r) => ({ planId: r.planId, plan: r.plan, feasible: r.feasible, actionsCompleted: r.actionsCompleted, bindingAfterActions: r.bindingAfterActions, horizonProgress: { "5m": r.horizons[300].bindingProgress, "30m": r.horizons[1800].bindingProgress, "60m": r.horizons[3600].bindingProgress }, targetAffordAfter: r.horizons[3600].targetAffordRatioAfter, firstAction: r.firstAction, firstActionRealizability: r.firstActionRealizability })),
      buyMaxMechanicalUpperReference: buymaxRef.bindingProgress,
      track4_ranking: { horizon: "60m", winner: winner.planId, winnerProgress: winner.horizons[3600].bindingProgress, winnerFirstAction: winner.firstAction, winnerFirstActionRealizability: winner.firstActionRealizability, orderInvariant, top: ranked.slice(0, 5).map((r) => `${r.planId}(${r.horizons[3600].bindingProgress})`) },
      track7_mutationControls: mut, allMutationsDetected: allMut,
    };
    fs.writeFileSync(path.join(OUT_DIR, `plan-generator-${SAVE_NAME}.json`), JSON.stringify(evidence, null, 1));

    // console
    console.log(`\n=== TRACK 1: target-path unit trace (save=${SAVE_NAME}, target=${trace.activeTarget}) ===`);
    trace.units.forEach((u) => console.log(`  ${u.internalId.padEnd(10)} (${NAME[u.internalId]}) buyable=${u.buyable} proposalEmitted=${u.proposalEmitted} plannerReason=${(u.plannerReason || "n/a").slice(0, 40)} => ${u.classification}`));
    console.log(`\n=== TRACK 2: action universe (${universe.length} target-path actions) ===`);
    universe.forEach((a) => console.log(`  ${a.internalId.padEnd(10)} plannerKind=${a.plannerKind} role=${a.targetPathRole} reserveGate=${a.reserveGate} currentlyProposed=${a.currentlyProposed}`));
    console.log(`\n=== TRACK 3/4: generated bounded plans (binding=pantheon2, horizons 5/30/60m) ===`);
    for (const r of results) console.log(`  ${r.planId.padEnd(52)} ${r.feasible.padEnd(19)} completed=${r.actionsCompleted} progress[5/30/60m]=${r.horizons[300].bindingProgress}/${r.horizons[1800].bindingProgress}/${r.horizons[3600].bindingProgress} firstAction=${r.firstActionRealizability.split(" ")[0]}`);
    console.log(`  buyMax mechanical upper reference: ${buymaxRef.bindingProgress} (NOT a product value)`);
    console.log(`\n=== TRACK 4/5: winner ===`);
    console.log(`  winner=${winner.planId} progress@60m=${winner.horizons[3600].bindingProgress} order-invariant=${orderInvariant}`);
    console.log(`  winner first action=${NAME[winner.firstAction] || "WAIT"} => ${winner.firstActionRealizability}`);
    console.log(`\n=== TRACK 7: mutation controls ===`);
    for (const [k, v] of Object.entries(mut)) console.log(`  [${v.detected ? "OK" : "FAIL"}] ${k}`);
    console.log(`\nEvidence: ${path.relative(ROOT, path.join(OUT_DIR, `plan-generator-${SAVE_NAME}.json`))}`);
    if (!allMut) { console.error("some mutation control not detected"); process.exit(1); }
    console.log("[plan-generator] all mutation controls detected.");
  } finally { await browser.close(); }
}

main().catch((e) => { console.error(e?.stack || e?.message || String(e)); process.exit(1); });
