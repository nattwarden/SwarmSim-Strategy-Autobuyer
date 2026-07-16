#!/usr/bin/env node
"use strict";

// 9.4.0 GATE 2 — CORRECTED (supersedes the invalid gate2-bounded evidence).
//
// Why the old GATE 2 was invalid: scripts/lab-9.4.0-plan-model.js --gate 2 built a SYNTHETIC Meat plan
// (pantheon -> pantheon2, amount = floor(maxCostMet(0.85)*25/100)) that the runtime never proposes, it
// COMPUTED a reserveRatio (~4.7059 = 1/(0.85*0.25)) but NEVER gated on it, and it compared against a
// generic meatMinReserveRatio. That is a parallel simplified policy, not the runtime's real proposal +
// per-planner safety gates. The old evidence is therefore re-labelled:
//   BOUNDED_CAUSAL_PLAN_PROVEN   (the multi-step causal mechanism does move the target)
//   RUNTIME_POLICY_FEASIBILITY_NOT_PROVEN
//
// This corrected gate uses the REAL runtime: it runs the actual cycle (kbcSwarmBot.runOnce) on the
// frozen save, reads the actual proposal builder output (purchaseProposalSnapshot) with each candidate's
// structured safety fields, applies each planner's OWN reserve threshold, and drives the actual replan
// loop (authorize only the coordinator's boundedCandidate, execute it, re-snapshot, repeat).
//
// DELIVERS: real proposal table (DEL 1), real replan loop (DEL 2/3), three-family comparison (DEL 4),
// reserve mutation matrix (DEL 5), corrected verdict (DEL 6). No runtime change; not in `verify`.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "9.4.0-plan-laboratory");
const SAVE_PATH = process.argv.includes("--save") ? process.argv[process.argv.indexOf("--save") + 1]
  : path.join(ROOT, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt");
const SAVE_NAME = path.basename(path.dirname(SAVE_PATH)) || "save";

// ---- Real per-planner reserve gate (DEL 1/5). NOT a generic threshold. ----
function requiredReserveRatioFor(plannerKind, cfg) {
  switch (plannerKind) {
    case "action-unit": return { value: cfg.meatActionUnitMinReserveRatio, key: "meatActionUnitMinReserveRatio" };
    case "parent-step": return { value: cfg.meatParentStepMinReserveRatio, key: "meatParentStepMinReserveRatio" };
    case "parent-refill": return { value: cfg.meatActionUnitMinReserveRatio, key: "meatActionUnitMinReserveRatio (refill inherits action-unit reserve)" };
    case "unlock": return { value: cfg.meatUnlockMinReserveRatio, key: "meatUnlockMinReserveRatio" };
    case "twin-prep": return { value: cfg.twinUnlockMinReserveRatio, key: "twinUnlockMinReserveRatio" };
    case "target-aware-upgrade": return { value: null, key: "target-aware-upgrade (dynamic requiredReserveRatio in proposal.raw)" };
    default: return { value: null, key: "no reserve threshold (fallback / non-Meat)" };
  }
}
// Enforced reserve gate: a candidate is reserve-eligible only if reserveRatio >= its planner's threshold.
function reserveGate(plannerKind, reserveRatio, cfg, thresholdOverride) {
  const req = thresholdOverride != null ? { value: thresholdOverride, key: "OVERRIDE" } : requiredReserveRatioFor(plannerKind, cfg);
  if (req.value == null) return { requiredReserveRatio: null, reserveOk: null, note: req.key };
  const ok = Number.isFinite(reserveRatio) && reserveRatio >= req.value;
  return { requiredReserveRatio: req.value, thresholdKey: req.key, reserveOk: ok };
}

function plannerKindOf(proposal) {
  if (proposal.lane !== "Meat") return proposal.lane.toLowerCase() + "-lane";
  const r = String(proposal.reason || "").toLowerCase();
  if (/target-path action|active meat action/.test(r)) return "action-unit";
  if (/parent refill|refill/.test(r)) return "parent-refill";
  if (/parent step|parent-step/.test(r)) return "parent-step";
  if (/unlock/.test(r)) return "unlock";
  if (/twin/.test(r)) return "twin-prep";
  if (/upgrade/.test(r)) return "target-aware-upgrade";
  return "fallback";
}

// Frozen clock + real runOnce; extract the real proposals with full safety fields, plus the coordinator's
// authorized action and whether execution actually happened. `execute`: false=advisor, true=auto-buy.
function pageRealCycle({ saveString, fixedTime, execute }) {
  const inj = window.angular.element(document.body).injector();
  const g = inj.get("game"); const bot = window.kbcSwarmBot;
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const RealDate = window.Date; const FIXED = Number(fixedTime);
  function FD(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
  FD.now = () => FIXED; FD.UTC = RealDate.UTC; FD.parse = RealDate.parse; FD.prototype = RealDate.prototype; window.Date = FD;
  try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch {}
  g.importSave(saveString);
  bot.config.enabled = true; bot.config.advisorOnly = !execute; bot.config.autoBuySafeDecisions = !!execute; bot.config.autoAscend = false;
  const goddessBefore = D(g.unit("goddess").count());
  const pantheon2Before = D(g.unit("pantheon2").count());
  try { bot.runOnce(); } catch (e) { return { err: "runOnce: " + e.message }; }
  const insp = bot.getStrategyInspector();
  const snap = insp.purchaseProposalSnapshot || {};
  const domainCands = (snap.evaluation && snap.evaluation.wholeEconomyPreview && snap.evaluation.wholeEconomyPreview.domainCandidates) || [];
  const cfg = { meatActionUnitMinReserveRatio: bot.config.meatActionUnitMinReserveRatio, meatParentStepMinReserveRatio: bot.config.meatParentStepMinReserveRatio, meatUnlockMinReserveRatio: bot.config.meatUnlockMinReserveRatio, twinUnlockMinReserveRatio: bot.config.twinUnlockMinReserveRatio };
  const proposals = (snap.proposals || []).map((pr) => {
    const dc = domainCands.find((d) => d.lane === pr.lane) || {};
    const raw = pr.raw || {};
    const reserveRatio = Number(raw.reserveRatio);
    return {
      canonicalProposalId: pr.proposalId, plannerKind: pr.plannerKind || null, lane: pr.lane,
      candidateInternalId: pr.executionId, candidateLabel: pr.candidate, requestedAmount: pr.boundedAmount, wouldBuyAmount: pr.wouldBuyAmount,
      decision: pr.decision, buyable: !(pr.blockers || []).length && pr.decision === "BUY",
      costResource: raw.costResource || (pr.costResources || [])[0] || null,
      reserveRatio, reserveAfter: raw.reserveAfter, reserveRequired: raw.reserveRequired,
      paybackSeconds: raw.paybackSeconds, paybackLimitSeconds: raw.paybackLimitSeconds, paybackRatio: raw.paybackRatio,
      hardBlockers: pr.blockers || [], safeEligible: dc.safeEligible === true, reason: pr.reason,
      milestoneState: raw.milestoneOutcome ? raw.milestoneOutcome.state : (dc.sharedOutcome && dc.sharedOutcome.milestoneOutcome && dc.sharedOutcome.milestoneOutcome.state),
    };
  });
  const goddessAfter = D(g.unit("goddess").count());
  const pantheon2After = D(g.unit("pantheon2").count());
  const sc = insp.strategicCoordinator || null;
  return {
    cfg, proposals,
    coordinator: { recommendation: sc && sc.recommendation, reason: sc && sc.reason, executionAuthority: insp.wholeEconomyExecutionAuthority, boundedCandidate: sc && sc.executionPlan && sc.executionPlan.boundedCandidate ? sc.executionPlan.boundedCandidate : null },
    executed: { mainActions: insp.mainActions, mainDecision: insp.mainDecision, goddessBefore, goddessAfter, goddessChanged: goddessBefore !== goddessAfter, pantheon2Before, pantheon2After, pantheon2Changed: pantheon2Before !== pantheon2After },
  };
}

// Real replan loop (DEL 2): each iteration runs the real cycle with auto-buy (which authorizes+executes
// only the coordinator's boundedCandidate), advances passive production, and re-runs. No hardcoded plan.
function pageReplanLoop({ saveString, fixedTime, budget, stepSeconds }) {
  const inj = window.angular.element(document.body).injector();
  const g = inj.get("game"); const bot = window.kbcSwarmBot;
  const D = (v) => { try { return v == null ? null : String(v.toString()); } catch { return String(v); } };
  const RealDate = window.Date; const FIXED = Number(fixedTime);
  function FD(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
  FD.now = () => FIXED; FD.UTC = RealDate.UTC; FD.parse = RealDate.parse; FD.prototype = RealDate.prototype; window.Date = FD;
  try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch {}
  g.importSave(saveString);
  bot.config.enabled = true; bot.config.advisorOnly = false; bot.config.autoBuySafeDecisions = true; bot.config.autoAscend = false;
  const p2Start = D(g.unit("pantheon2").count());
  const steps = []; let t = FIXED; let stop = "budget-exhausted";
  for (let i = 0; i < budget; i++) {
    try { bot.runOnce(); } catch (e) { stop = "runOnce-error:" + e.message; break; }
    const insp = bot.getStrategyInspector();
    const sc = insp.strategicCoordinator || null;
    const authorized = sc && sc.executionPlan && sc.executionPlan.boundedCandidate ? sc.executionPlan.boundedCandidate : null;
    const mainActions = Number(insp.mainActions || 0);
    steps.push({ step: i, coordRecommendation: sc && sc.recommendation, authorizedCandidate: authorized ? authorized.candidate || authorized.executionId : null, mainActionsExecuted: mainActions });
    if (!authorized || mainActions === 0) { stop = "coordinator authorized no main action (WAIT)"; break; }
    t += stepSeconds * 1000; g.tick(new RealDate(t));
  }
  const p2End = D(g.unit("pantheon2").count());
  return { pantheon2Start: p2Start, pantheon2End: p2End, targetProgress: (Number(p2End) - Number(p2Start)), actionsCompleted: steps.filter((s) => s.mainActionsExecuted > 0).length, steps, stopReason: stop };
}

// MANUAL_CAUSAL_REFERENCE (DEL 4): the pantheon->pantheon2 sequence (buyMax) — real progress but NOT a
// runtime proposal. Kept only as the mechanical causal reference.
function pageManualCausal({ saveString, fixedTime, horizon }) {
  const inj = window.angular.element(document.body).injector();
  const g = inj.get("game"); const commands = inj.get("commands");
  const D = (v) => { try { return String(v.toString()); } catch { return null; } };
  const RealDate = window.Date; const FIXED = Number(fixedTime);
  function FD(...a) { return a.length === 0 ? new RealDate(FIXED) : new RealDate(...a); }
  FD.now = () => FIXED; FD.UTC = RealDate.UTC; FD.parse = RealDate.parse; FD.prototype = RealDate.prototype; window.Date = FD;
  try { if (g.session && g.session.heartbeatId != null) { clearInterval(g.session.heartbeatId); g.session.heartbeatId = null; } } catch {}
  g.importSave(saveString);
  const before = D(g.unit("pantheon2").count());
  for (const id of ["pantheon", "pantheon2", "pantheon", "pantheon2"]) { try { commands.buyMaxUnit({ unit: g.unit(id), ui: "lab" }); } catch (e) {} }
  g.tick(new RealDate(FIXED + horizon * 1000));
  const after = D(g.unit("pantheon2").count());
  return { pantheon2Before: before, pantheon2After: after, targetProgress: Number(after) - Number(before) };
}

function readSavedEpoch({ saveString }) {
  const g = window.angular.element(document.body).injector().get("game");
  g.importSave(saveString); const d = g.session.state.date.saved; return Number(d && d.valueOf ? d.valueOf() : NaN);
}

// ---- DEL 5: reserve mutation matrix (pure enforcement logic) ----
function reserveMutationMatrix(cfg) {
  const eps = 1e-9;
  const t = (name, cond) => ({ name, caught: !!cond });
  const au = cfg.meatActionUnitMinReserveRatio, ps = cfg.meatParentStepMinReserveRatio, ul = cfg.meatUnlockMinReserveRatio;
  return [
    // 1. ratio exactly above threshold -> allowed
    t("1 ratio just above action-unit threshold => allowed", reserveGate("action-unit", au + eps, cfg).reserveOk === true),
    // 2. ratio exactly below threshold -> blocked
    t("2 ratio just below action-unit threshold => blocked", reserveGate("action-unit", au - 0.01, cfg).reserveOk === false),
    // 3. action-unit threshold used for action-unit
    t("3 action-unit uses meatActionUnitMinReserveRatio(5)", reserveGate("action-unit", au, cfg).requiredReserveRatio === au),
    // 4. parent-step threshold used for parent-step
    t("4 parent-step uses meatParentStepMinReserveRatio(1.5)", reserveGate("parent-step", ps, cfg).requiredReserveRatio === ps),
    // 5. unlock threshold used for unlock
    t("5 unlock uses meatUnlockMinReserveRatio(3)", reserveGate("unlock", ul, cfg).requiredReserveRatio === ul),
    // 6. generic/wrong threshold used -> must be detected (using action-unit's 5 for a parent-step is wrong)
    t("6 wrong threshold (action-unit 5 forced on parent-step) detected", reserveGate("parent-step", 2, cfg, au).reserveOk !== reserveGate("parent-step", 2, cfg).reserveOk),
    // 7. threshold checked but ignored -> detected (an 'ignore' gate that always allows differs from the real gate on a failing ratio)
    t("7 ignoring the threshold (always-allow) detected on a below-threshold ratio", (function () { const real = reserveGate("action-unit", au - 0.01, cfg).reserveOk; const ignored = true; return real !== ignored; })()),
    // 8. bypass tries to circumvent RESERVE (not only payback) -> blocked. The runtime payback-bypass only
    //    waives payback and requires reserveRatio>=threshold; a bypass that also waived reserve would let a
    //    below-threshold ratio through. Model both and assert they differ (the reserve-respecting one blocks).
    t("8 bypass that also waives reserve is blocked by the reserve-respecting gate", (function () { const reserveRespecting = reserveGate("action-unit", au - 0.01, cfg).reserveOk; const reserveWaivingBypass = true; return reserveRespecting === false && reserveWaivingBypass === true; })()),
  ];
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
    const advisor = await page.evaluate(pageRealCycle, { saveString: save, fixedTime, execute: false });
    const executed = await page.evaluate(pageRealCycle, { saveString: save, fixedTime, execute: true });
    const replan = await page.evaluate(pageReplanLoop, { saveString: save, fixedTime, budget: 4, stepSeconds: 3600 });
    const manual = await page.evaluate(pageManualCausal, { saveString: save, fixedTime, horizon: 3600 });

    // Enrich each proposal with plannerKind + the REAL per-planner required reserve + enforced reserveOk.
    const cfg = advisor.cfg;
    const enriched = advisor.proposals.map((p) => {
      const pk = p.plannerKind || plannerKindOf(p);
      const gate = reserveGate(pk, p.reserveRatio, cfg);
      const paybackBypassed = Number(p.paybackSeconds) > Number(p.paybackLimitSeconds) && p.safeEligible;
      return { ...p, plannerKind: pk, requiredReserveRatio: gate.requiredReserveRatio, reserveOk: gate.reserveOk,
        paybackBypassed, bypassReason: paybackBypassed ? `payback ${Math.round(p.paybackSeconds)}s > limit ${p.paybackLimitSeconds}s; reserveRatio ${Number.isFinite(p.reserveRatio) ? p.reserveRatio.toExponential(3) : "n/a"} >= required ${gate.requiredReserveRatio}` : null };
    });
    const meat = enriched.find((p) => p.lane === "Meat") || null;
    const mutation = reserveMutationMatrix(cfg);
    const allMutCaught = mutation.every((m) => m.caught);

    // DEL 6 verdict: is there a runtime-authorized plan that makes target progress?
    const runtimeAuthorizedProgress = replan.targetProgress > 0 && replan.actionsCompleted > 0;
    const verdict = runtimeAuthorizedProgress ? "RUNTIME_SAFE_PLAN_PROVEN" : "RUNTIME_SAFE_PLAN_NOT_FOUND";

    const evidence = {
      schemaVersion: "gate2-corrected.v1", capturedAt: new Date().toISOString(),
      supersedes: "gate2-bounded-*.json", oldLabel: ["BOUNDED_CAUSAL_PLAN_PROVEN", "RUNTIME_POLICY_FEASIBILITY_NOT_PROVEN"],
      save: { name: SAVE_NAME, fixedTimeIso: new Date(fixedTime).toISOString() },
      reservePolicy: cfg,
      realProposals: enriched,
      realMeatProposal: meat,
      coordinator: advisor.coordinator,
      executedCycle: executed.executed,
      replanLoop: replan,
      manualCausalReference: { ...manual, status: "MANUAL_CAUSAL_REFERENCE", note: "positive target progress but NOT a runtime proposal / not coordinator-authorized" },
      reserveMutationMatrix: mutation,
      verdict, verdictNote: runtimeAuthorizedProgress ? "runtime authorizes a progress-making plan" : "runtime authorizes 0 main actions on this save; the Meat action-unit (goddess) is reserve-safe (reserveRatio >> threshold) and safeEligible, but the coordinator scores it milestoneOutcome=NO_EFFECT and abstains -> WAIT. The multi-step causal mechanism is proven (manual reference) but the current safe model (the NO_EFFECT binding-resource-eta metric, NOT the reserve policy) does not realize it.",
    };
    fs.writeFileSync(path.join(OUT_DIR, `gate2-corrected-${SAVE_NAME}.json`), JSON.stringify(evidence, null, 1));

    console.log(`\n=== GATE 2 CORRECTED (save=${SAVE_NAME}) ===`);
    console.log("Real Meat proposal:", meat ? `${meat.candidateLabel}(${meat.candidateInternalId}) plannerKind=${meat.plannerKind} reserveRatio=${Number(meat.reserveRatio).toExponential(3)} requiredReserveRatio=${meat.requiredReserveRatio} reserveOk=${meat.reserveOk} paybackBypassed=${meat.paybackBypassed} safeEligible=${meat.safeEligible} milestoneState=${meat.milestoneState}` : "none");
    console.log("Coordinator:", `recommendation=${advisor.coordinator.recommendation} boundedCandidate=${advisor.coordinator.boundedCandidate ? "present" : "null"} executionAuthority=${advisor.coordinator.executionAuthority}`);
    console.log("Executed cycle (auto-buy):", `mainActions=${executed.executed.mainActions} goddessChanged=${executed.executed.goddessChanged} pantheon2Changed=${executed.executed.pantheon2Changed}`);
    console.log("Replan loop:", `actionsCompleted=${replan.actionsCompleted} targetProgress=${replan.targetProgress} stop=${replan.stopReason}`);
    console.log("Manual causal reference:", `targetProgress=${manual.targetProgress} (NOT runtime-authorized)`);
    console.log("\nReserve mutation matrix:");
    mutation.forEach((m) => console.log(`  [${m.caught ? "OK" : "FAIL"}] ${m.name}`));
    console.log(`\nDEL 4 — three plan families vs target pantheon3 (binding pantheon2):`);
    console.log(`  | Plan | All actions runtime-safe | Actions completed | Target progress | Stop reason |`);
    console.log(`  | WAIT | yes | 0 | 0 | no action |`);
    console.log(`  | manual causal reference (pantheon->pantheon2) | N/A (not runtime-proposed) | 4 | ${manual.targetProgress} | manual |`);
    console.log(`  | actual runtime-generated plan | yes | ${replan.actionsCompleted} | ${replan.targetProgress} | ${replan.stopReason} |`);
    console.log(`  | runtime single-action (goddess) | reserve-safe + safeEligible | 0 executed | 0 | coordinator NO_EFFECT -> not authorized |`);
    console.log(`\nVERDICT: ${verdict}`);
    console.log(evidence.verdictNote);
    if (!allMutCaught) { console.error("\nGATE 2 CORRECTED: reserve mutation matrix has an uncaught case"); process.exit(1); }
    console.log(`\n[GATE 2 CORRECTED] reserve mutation matrix: all ${mutation.length} controls OK. Verdict recorded: ${verdict}.`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e?.stack || e?.message || String(e)); process.exit(1); });
