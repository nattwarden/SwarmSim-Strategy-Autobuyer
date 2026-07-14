# Repository Audit Review Note (Fable)

Status: timestamped read-only audit evidence for one exact commit; this document
adds no runtime behavior and is NOT automatically current runtime truth for any
later commit.
Date: 2026-07-14
Auditor: Claude (Fable 5), read-only systems/strategy/AI-repo audit
Audited commit: `2eef0248a2d3ce8a01265ccbc537b2b97ff01c69` (`main`, equal to
`origin/main` at audit time)
Runtime version at audited commit: `9.1.0`
Working tree: clean of tracked changes (only disposable untracked
`docs/test-data/*` run artifacts and the stray `tmp-user-save.txt` were present)

Verification commands executed during the audit (all pure checks, all passed):

```bash
node scripts/build-canonical-userscript.js --check   # exit 0
npm run verify                                       # exit 0 (full chain incl.
                                                     # live-Chrome M8/M9 checks)
```

Line references below are exact for the audited commit only. Re-locate by
function/constant name on later commits, per `AGENTS.md`.

Evidence confidence labels used below:

- `VERIFIED` — read directly in code/history/test output at the audited SHA.
- `LIKELY` — strongly supported by code reading, but not observed in live play.
- `NEEDS-EVIDENCE` — cannot be settled from the repository alone.

## 1. Executive summary

- The architecture is coherent at the execution/safety layer: hard safety
  defaults are intact and machine-checked, the build pipeline is drift-free,
  and M6 execution authority is strictly chained to identity matching plus
  same-cycle revalidation.
- At the decision layer, three coexisting ranking systems must coincide for
  the coordinator to own a purchase; otherwise decisions silently fall back to
  the fixed legacy lane order, which is the real arbiter in most cycles (F1).
- Largest verified risk: the 9.1.0 comparability fix changed the executing
  evaluator's economicScore and confidence, and triple-counts "completion" for
  Engine candidates; never live-verified (F2).
- Largest test gap: nothing in the `verify` chain proves the bot actually buys
  anything through a real `runOnce()` in autobuy mode. This exact gap let the
  "bot buys nothing" bug (`m6DecisionOwnsMainCycle = true`) survive four
  formally closed major versions, 6.0.0 through 8.1.0 (F4).
- Largest AI-steering risk: `docs/SWARMSIM_GAME_MODEL.md` still claims runtime
  0.12.3 and describes the coordinator as future work (F6).
- Most valuable next action: the verify-integrated real-purchase acceptance
  check specified in
  `docs/strategy/BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md`.

## 2. Repo map and truth status

| File/dir | Responsibility | Truth status |
|---|---|---|
| `src/SwarmSim-Strategy-Autobuyer.user.js` | only executable userscript (22,469 lines) | canonical executable; generated from dev-src body + own metadata header |
| `dev-src/runtime-sections/runtime-main.js` | runtime assembly source (22,442 lines) | normative editing source for runtime body |
| `scripts/canonical-build.config.json` | build parts: `metadata` from src + `file` from dev-src | normative |
| `AGENTS.md` | sole steering authority | normative |
| `AI.md` | orientation, explicitly demoted to supplementary | informative |
| `docs/SWARMSIM_GAME_MODEL.md` | active game/strategy contract | normative in intent, DRIFTED (F6) |
| `docs/strategy/BOOK00_CURRENT_STATUS.md` | live handoff board | normative for status; append-heavy, internally contradictory in older sections (F9) |
| `docs/process/HISTORY.md` | version history | historical/descriptive, current through 9.1.0 |
| `docs/release-notes/` | per-version narrative | historical; 8.0.0/8.1.0 notes describe capability later found unverified |
| `docs/BOOK-01..06` | distilled empirical findings | informative evidence |
| `docs/strategy/SWARMSIM_LABORATORY_PHASE_1.md` | Laboratory contract | normative (note: lives in `docs/strategy/`, not `docs/laboratory/`) |
| `scripts/strategy-audit-testbed-core.js` | Playwright testbed, drives real `runOnce()` in Chrome | authentic test instrument |
| `scripts/check-book00-m2..m9*`, `check-unified-purchase-evaluator.js` | focused acceptance in verify | test instruments; M2/M6/M7 feed SYNTHETIC inputs (F4) |
| `scripts/check-0.11.*`, `run-0.11.*`, `check-<ver>-version-surfaces.js` | old per-version scripts | dead historical artifacts (per `AGENTS.md`) |
| `scripts/validate-repo-guardrails.js` | mechanical safety/hygiene checks | normative automation |
| `reference/`, `CHATGPT_REPO_CONTEXT.md` | sanity references / chat orientation | informative; self-declared non-truth |
| `docs/test-data/` (untracked dirs) | generated run evidence | disposable per repo policy |
| `tmp-user-save.txt` | stray scratch file at root | unreferenced; should be removed |

## 3. Verified truth hierarchy

1. Runtime behavior is determined by `dev-src/runtime-sections/runtime-main.js`
   built into the canonical userscript; the metadata header comes from `src`
   itself (`scripts/canonical-build.config.json`). `VERIFIED`.
2. Drift between the two is possible in principle but `npm run build:check`
   is part of `verify` and detects it; it passed at the audited SHA. The
   hotfix flow (`sync:from-canonical`) covers the reverse direction.
   Drift protection is automated and works. `VERIFIED`.
3. Documentation is mixed normative/descriptive: `AGENTS.md` is normative and
   correct; the game model is normative by name but descriptively stale;
   `BOOK00_CURRENT_STATUS.md` is the de facto current truth but contradicts
   itself in older sections. `VERIFIED`.
4. Release notes are partially reliable: they record intent at release time.
   The 8.0.0/8.1.0 M8 claims were validated against a broken execution state
   (documented in BOOK00). Corrections exist only in later entries. Release
   notes must be read as timestamped hypotheses — as `AGENTS.md` already
   instructs. `VERIFIED`.

Deviations from commonly assumed canonical paths: the Laboratory contract
lives in `docs/strategy/` (not `docs/laboratory/`); history lives in
`docs/process/HISTORY.md` (README's layout tree, lines 25-26, still points at
`docs/HISTORY.md`). Everything else (source of truth, build flow, safety
defaults, no force-pushes — history is linear, 166 commits at audit time)
holds. `VERIFIED`.

## 4. Actual decision flow (verified in code)

All references into `dev-src/runtime-sections/runtime-main.js` at the audited
SHA.

1. Cycle start — `smartRunOnce()` (18621) resets all planner state and the
   advisor log (18628-18655). No state leakage between cycles in the main
   flow.
2. State read — `analyzeLarvaEngine` (11660); save windows =
   `protectedResourcesFromEngine` (11682: ETA <= `saveForExpansionSeconds` /
   `saveForHatcherySeconds`) merged with `getEnergyProtectedResources`;
   `decideSmartFocus` (14242).
3. Proposal build (M2) — `buildUnifiedPurchaseProposals` (17950): Engine
   (Hatchery/Expansion), Energy (`buildEnergyProductionProposal`, 17802, four
   branches with a Nexus protection gate), Meat (goal-planner action unit),
   Territory (`buildTerritoryGuardProposal` -> army-seed planner 14432).
   Evaluated by `buildUnifiedPurchaseEvaluator` (2303) via
   `evaluatePurchaseCandidate` (2092) -> `economicScore`, confidence,
   `sharedOutcome`.
4. Advisors (M4/M5) — energy ability timing (5658), ascension/mutagen (4395);
   always advisor-only.
5. M6 coordinator — `evaluateSixDomainStrategicCoordinator` (5408): six
   domains adapted, sorted on `sixDomainComparableValue` (4633).
   `buildSixDomainExecutionPlan` (5541) requires the M6 winner to EXACTLY
   match the M2 evaluator winner (identity comparison 5579-5586);
   `applySixDomainExecutionRevalidation` (5599) rebuilds proposals and
   requires an unchanged fingerprint.
6. Possible M6 execution — only when
   `!advisorOnly && autoBuySafeDecisions && executionAuthority` (18775-18777);
   executes via `executeUnifiedPurchaseWinner` (18557) with exact
   `executeExact*CoordinatorCandidate` functions; `coordinatorExecutedKey`
   prevents same-cycle double-running of the same lane (18856, 18871, 18883).
7. Legacy lanes in fixed order (the real normal flow): Engine (18856) ->
   Critical upgrades (18866) -> Energy (18871) -> Clone buffer (18876) ->
   Unlock planner/Meat (18883) -> protected-resource HOLD advisories
   (18888-18930) -> Smart upgrades (18934) -> `buySmartUnits` (18942 ->
   17322).
8. `buySmartUnits` internal arbitration: meat goal planner first
   (`executeMeatGuardAction`), Parent Refill follow-up, territory "post-meat"
   follow-through (17403), otherwise territory pre-queue with
   starvation/relevance gate (17278), then the ranked unit queue with meat
   fallback rules (rank-drop cap, lower-chain requirement, action-unit floor
   17524-17537), strategic-action payback bypass (17567) and stall-breaker
   payback bypass (17574; reserve is never bypassed).
9. Side tasks — Clone prep (`manageCloneCocoons`, 18961) and Ability Prep
   advisor (18964).
10. Final state — `buildStrategyInspector` (18966) is built AFTER all actions;
    `recordRunHistoryEntry` (18967) feeds the hold/stall counters. Council UI
    (`buildCouncilUiState`, 6548) and exports (`buildLogExportPayload`, 7436)
    read this final state. UI/export show the end-of-cycle result, not
    intermediate states. `VERIFIED`.

Implicit contracts worth knowing:

- In advisor mode, "WOULD BUY" counts as a taken action (`boughtCount++`
  without a purchase, 17650-17655 and 17298-17301). Hold counters and lane
  age therefore behave differently between advisor and autobuy mode.
- `smartMaxActionsPerRun` defaults to 4, so legacy lanes can buy up to 3 more
  actions in the same cycle after an M6 execution. M6's "exactly one bounded
  winner" ceremony covers only the first action of the cycle.

## 5. Strategic architecture

Shared architecture (good): all purchase paths pass the same protection
layers: `shouldAvoidProtectedCost` (11698, resource-scoped, M9-verified), the
clone-buffer lock (`getCloneBufferProtectionIssue`, 11728), and
`getUnitCandidateBlock` reserve/payback. Save windows are a single mechanism
respected by all lanes. Lane observability uses one candidate schema
(`addLaneCandidate`).

Separate special rules (risk):

- Meat has four buy paths (goal-planner action unit, unlock planner, parent
  step/refill, fallback queue), each with its own reserve knob
  (`meatChainReserveMultiplier`, `meatUnlockMinReserveRatio`,
  `meatParentStepMinReserveRatio`, `meatActionUnitMinReserveRatio`,
  `twinUnlockMinReserveRatio`) — five reserve concepts for one idea.
- Territory has three paths: the army-seed proposal (M6 /
  `executeTerritoryGuardAction`), the ranked smart-unit queue (ROI-gated,
  15072), and the "post-meat" follow-through that skips the
  starvation/relevance gate (17278). The proposal is however only ever set
  with `meetsMinimum: true` after full gates (14868-14872); the
  `meetsMinimum === false` branch in `buildUnifiedPurchaseProposals` (18031)
  is effectively dead defensive code. `VERIFIED`.
- Energy is four distinct branches in one function (17802) with three
  different value bases (etaSeconds=0 + progressDelta=100,
  etaImprovementSeconds, boostGain-as-progressDelta).
- Stall breaker and fallback are text-pattern driven (F3).

## 6. Findings

### F1 — Three ranking systems; fixed order wins (`VERIFIED`, architecture)

Purchases are ranked by three independent systems: (1) M6's
`sixDomainComparableValue` sort (5449-5461), (2) M2's `economicScore`
(2092-2176, 2303-2332), (3) the fixed legacy lane order in `smartRunOnce`
(18856-18957). M6 gains execution authority only when its winner exactly
matches the M2 winner (5579-5587) and all gates plus revalidation pass;
otherwise the decision silently falls back to fixed order. Root cause: M6 was
built on top of M2 rather than replacing it, and the 9.0.0 hotfix necessarily
restored legacy order as acting purchaser. Consequence: the strategic ranking
shown as "winner" in Council rarely decides the actual purchase. How often M6
actually executes in live play is `NEEDS-EVIDENCE` (no telemetry in repo).
Recommendation: document this honestly in the game model rather than implying
the coordinator owns the cycle.

### F2 — 9.1.0 progress-delta changed executing-evaluator ranking and triple-counts completion (`LIKELY` runtime impact; code state `VERIFIED`)

`projectedMilestoneProgressDelta: 100` was set for buyable Engine/Nexus
(17988, 17836) and safe Meat (18021), and `plan.boostGain` (a percent,
typically << 1) for post-Nexus Lepidoptera (17903). This flows into
`evaluatePurchaseCandidate.components.milestoneProgressDelta` (2110, up to
+100 of cap 120) and `evidenceFields` (2119, raising confidence). A buyable
Engine candidate now gets `etaProximity` ~= 100 (etaSeconds=0), the `unlock`
regex +100 ("hatchery" in reason/target matches line 2111), AND
progressDelta +100 — the same event ("it is buyable now") is rewarded three
times in the score that selects the executable purchase, while Territory's
real ETA gain is scored logarithmically (2105). M6's double-count prevention
covers the effect ledger, not score components. Additionally M6 domains are
sorted numerically across incommensurable bases (seconds vs 0-100 vs percent)
— acknowledged in the BOOK00 handoff, but the side effect on the M2 score is
not mentioned there. 9.1.0 was verified only with synthetic checks.
Recommendation: run the SA1 matrix on 9.1.0 and compare winner selection
against the existing 9.0.0 artifacts before changing anything (see section 10
of this note). Do NOT change scoring before that evidence exists.

### F3 — Decision gates regex-parse free text (`VERIFIED`, architecture)

The M8 stall breaker activates on regex over `blockedBySummary` ("reserve" +
"ability disabled", 2836-2841, 2860-2878), with a text fallback in
`laneCandidateHasEtaStallSignal` (2856-2857). Save-window classification for
UI/diagnostics is regex over reason/blocker text (11756-11777).
`classifyCoordinatorBudgetReason` (17357) and `summarizeBlockerLabels` (2340)
likewise. The unlock component of the purchase score itself is a regex over
reason text (2111). The M8 scenario explicitly needed "reserve/payback-worded"
reasons to be counted (BOOK00 handoff). Consequence: a harmless rewording of a
reason string can silently deactivate the stall breaker or change ranking.
Structured `blockerCategories` already exist and should be the decision
carrier.

### F4 — The verify chain does not prove the bot buys (`VERIFIED`, test gap, historically proven dangerous)

`check-unified-purchase-evaluator.js` and `check-book00-m2/m6/m7*.js` feed
SYNTHETIC candidate rows directly into the APIs. The M8 check asserts a HOLD
pattern plus the `stallBreakerActive` flag — not a fallback purchase (the
scenario's reserve=10000 makes purchase impossible; the stall breaker only
bypasses payback, never reserve, 17574). The M9 check asserts BUY eligibility,
not a purchase. No check in `verify` exercises "real runOnce -> actual count
delta > 0". This exact gap let `m6DecisionOwnsMainCycle = true` make the bot
purchase-incapable in live play through 6.0.0, 7.0.0, 8.0.0 and 8.1.0 — four
formally closed, exact-SHA-verified releases (BOOK00 handoff; commits
`5639699` -> `35090b9`). The bug was found by a player, not by the suite.
Remediation is specified in
`docs/strategy/BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md`.

### F5 — The in-runtime deterministic harness does not run the production cycle (`VERIFIED`, harness gap)

`runDeterministicScenarioHarness` (7961) runs `handleEnergyStrategy ->
runCloneBufferPlanner -> runUnlockPlanner -> buySmartUnits ->
runAbilityPrepPlanner` (8056-8060) — without the M6/M2 pipeline, without the
Engine lane, without critical/smart upgrades, without run history, in a
different order than `smartRunOnce`, always in forced advisor mode
(7989-7990). The Playwright testbed instead drives the real `bot.runOnce()`
(`scripts/strategy-audit-testbed-core.js`, `runPlannerCycle`). A scenario PASS
in the in-runtime harness proves lane logic, not cycle arbitration. New
cycle-level tests must go through the testbed.

### F6 — The game model is two architecture generations behind (`VERIFIED`, documentation drift)

`docs/SWARMSIM_GAME_MODEL.md` section 2: "Current verified runtime: 0.12.3";
section 6 "Implemented lanes (as of 0.12.3)"; section 7 "The next architecture
step is a central coordinator" — while M2/M6 coordinators shipped in
0.14.0/6.0.0. `README.md` lines 25-27 list `HISTORY.md` /
`MODULARIZATION_PLAN.md` / `PR_CHECKLIST.md` directly under `docs/` (they live
in `docs/process/`). The hard-defaults block in the game model IS correctly
updated to the 8.1.0 values. Agents following the mandatory reading order get
a stale architecture picture as active truth.

### F7 — Five truth sources for defaults; one real inconsistency (`VERIFIED`, maintenance)

Defaults exist in `DEFAULT_CONFIG` (105), `PRESETS.smart` (252, near-complete
duplicate), the AI.md list, the game-model list and the guardrail script's
list. Numeric values are currently in sync. But `unitStrategy` differs:
`DEFAULT_CONFIG.unitStrategy = "expensive-first"` (231) vs
`PRESETS.smart.unitStrategy = "balanced"` (357) — the effective value depends
on whether the preset was applied, and the difference is undocumented.
Whether it is intentional is `NEEDS-EVIDENCE` (user decision).

### F8 — M8's player-visible goal is unproven at the purchase level (`VERIFIED`, test gap; follows from F4)

M8 promises "bounded fallback progression"; acceptance proves flag + HOLD
pattern. The stall breaker can never purchase in the acceptance scenario (the
reserve guard remains). The 9.0.0 handoff required re-testing of "real
fallback-purchase behavior"; the re-test became a scenario re-tune that still
does not assert a purchase.

### F9 — Status board internal contradictions (`VERIFIED`, AI steering)

`BOOK00_CURRENT_STATUS.md` older forward-looking sections said M9 "has not
started" while the handoff log records M9 closed; one paragraph is duplicated.
The chronology is reconstructable, but only for a reader who reads the whole
file. Forward-looking sections should be rewritten (not appended) at milestone
transitions; historical handoff entries must remain untouched.

## 7. Harness assessment

Proven today:

- Playwright testbed (SA1/M8/M9): real `runOnce()` in real Chrome against the
  real game with staged state, reset verification and leakage detection;
  planner output is observed, never injected. A genuine instrument. Cost:
  requires network + Chrome; `verify` depends on swarmsim.com availability.
- In-runtime deterministic harness: lane-level behavior under override layers,
  with transition markers and cycle revisions. Does not prove cycle
  arbitration (F5).
- Verify chain: build drift, version surfaces, safety defaults, UI assets,
  Laboratory math, coordinator LOGIC (synthetic inputs), M8 pattern, M9
  scoping. All green at the audited SHA.

Not proven: that the bot buys in live play (F4); that the 9.1.0 ranking shift
is strategically correct (F2); that advisor and autobuy modes produce the same
decisions; that M6 ever wins execution authority in real play. A PASS today is
compatible with a cycle-level strategic contradiction — historically
demonstrated.

## 8. Laboratory assessment

Phase 1 is experimentally trustworthy within its contract and ready for
advisory use:

- identical starting states: snapshot deepFreeze + deterministic canonical
  hash (8949-8984); branch isolation per action;
- honesty under uncertainty: formula provenance
  (`runtime-derived/source-verified/incomplete/mismatch`); unknown values
  become null/warnings, never fabricated zeros (10364-10416);
- non-mutation: live fingerprint before/after with tolerance-based drift
  checking (8724-8916);
- outcome measures: field-by-field deltas vs WAIT for
  larvae/cocoons/meat/territory/energy/Expansion-ETA at 60/300 s
  (10418-10439) — the right measures for "Clone Larvae vs House of Mirrors vs
  wait".

Known limits: projections are linear except meat (source-verified
polynomial); ability effects are computed by Laboratory's own formula engine
against a pinned upstream commit — a second game engine in embryo, but
disciplined by provenance statuses. Sufficient for the Phase 1 question; do
not build a research platform. Results become strategy rules only after
reproduced live runs plus separate verification, as `AI.md` already requires.

## 9. Things that must not change

- Hard safety defaults (auto-cast/auto-ascend/broker auto-cast off,
  Nexus/Energy protection, no default casts) — correct in code and machine
  checked by `scripts/validate-repo-guardrails.js`.
- The M6 execution identity/fingerprint/revalidation chain (5541-5643,
  18239-18325).
- `m6DecisionOwnsMainCycle = false` and its warning comment (18731-18737).
  Must not be set true again before the purchase-acceptance gap (F4) is
  closed by a passing check.
- The legacy lane order — recently proven to carry the whole product.
- Laboratory gates, deepFreeze, hash and non-mutation disciplines.
- The testbed principle "planner output is observed, never injected".
- The build pipeline and the guardrail script (incl. the scriptVersion
  literal rule in `AI.md`).

## 10. Prioritized action plan

Do now (verified, small, high value):

1. Live purchase acceptance check in verify — see
   `docs/strategy/BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md`. Impact very
   high; effort small (testbed exists); no dependencies.
2. Documentation sync (game model sections 2/6/7, README layout tree, BOOK00
   forward-section consolidation). High impact for AI agents; no risk.
3. Structured stall-breaker/save-window gates on `blockerCategories` instead
   of text regex (F3). Medium impact, small-medium effort.
4. `PRESETS.smart` as a diff over `DEFAULT_CONFIG` plus an explicit decision
   on `unitStrategy` (F7). Very small.

Do soon:

5. SA1 comparison run 9.0.0 vs 9.1.0 (F2 evidence):
   `npm run strategy:audit:matrix:sa1:single`, compare winner selection
   against the existing 9.0.0 artifacts, document in BOOK-04. Must happen
   BEFORE any scoring/comparability change.
6. An M8 follow-up scenario where the fallback purchase actually happens
   (part of the purchase-acceptance work order's scenario set).
7. Move/archive dead 0.11.x scripts (hygiene, own commit).

Needs more evidence first:

8. Harmonizing M6 comparison bases (sort within basis, or unit conversion) —
   only after item 5 shows how often bases actually collide in real play.
9. Possible removal of the unlock-regex component in
   `evaluatePurchaseCandidate` — same evidence dependency.

Do not:

- Give M6 main-cycle ownership again before purchase acceptance exists and
  passes (and items 5/8 are resolved).
- General refactor of the 22k-line monolith beyond the existing
  modularization plan.
- Laboratory platform expansion.
- Cross-domain unit harmonization without live data.

## 11. Open questions (not answerable from the repository)

1. How often does M6 actually gain execution authority in real play after
   9.1.0? (No live telemetry retained.)
2. Is the `unitStrategy` difference (DEFAULT "expensive-first" vs smart
   preset "balanced") intentional?
3. Is it intentional that advisor-mode "WOULD BUY" counts as a taken action
   in hold/starvation counters (stall-breaker behavior differs between
   modes)?
4. Should `plan.boostGain` (a percent) really share a comparison scale with
   discrete 100-point completion events, or was that a pragmatic placeholder?
