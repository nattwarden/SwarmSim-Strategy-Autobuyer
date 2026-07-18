# BOOK-00 ETA-driven selection — strategy specification foundation

Status: SPECIFICATION / TARGET BEHAVIOR for review. No runtime change is
authorized by this document. It distills the manual-play evidence in
`docs/BOOK-07-realtime-play-data-and-reproducible-saves.md` into testable
acceptance criteria for a future planner scoring/gate change, and maps each
criterion to the concrete failure it must remove.

Author date: 2026-07-18

Evidence sources (not duplicated here — read them for the raw observations):

- [BOOK-07 real-time play data](../BOOK-07-realtime-play-data-and-reproducible-saves.md)
  — the manual, script-free play log and its "Active-play principles".
- [LANE_DOMINANCE_ROOT_CAUSE_LABORATORY_2026-07-15.md](LANE_DOMINANCE_ROOT_CAUSE_LABORATORY_2026-07-15.md)
  — why Meat wins by fallthrough in the saturated state (GATE_ASYMMETRY,
  ADVISOR_FALLTHROUGH, METRIC_NOT_COMPARABLE, FALSE_ASCENSION_PAUSE).
- [GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md](GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md)
  — finding R5 (progress-delta bases not globally commensurable) and the FAIL
  gate "four reversible domains share the active milestone metric".

Governance: BOOK-07 states its observations are "working hypotheses to test,
not production rules", and that drawing a script change from a save "requires a
separate work order and fresh verification". This spec inherits that: it is the
acceptance target for such a work order, not authorization to change scoring.
The readiness hard constraint still holds — no change to
`evaluatePurchaseCandidate`, `projectedMilestoneProgressDelta`, or
`sixDomainComparableValue` without a fresh SA1 / live evidence run documented
alongside the change.

## 1. The core reframing

The manual play establishes that skilled play is **ETA minimization across
lanes with cross-lane feedback and dynamic reserves**, not maximizing one
lane. The bot's meat-dominance is the direct negation of this: in a saturated
state the honestly-gated lanes HOLD, the only unconditionally-buyable lane
(Meat/Twin, via payback bypass) acts, the whole-economy coordinator abstains
with no authority, and 3/4 of the action budget sits idle behind a false
ascension pause. Fixing scoring means making the planner *select the bounded
action that most reduces the active target's ETA*, and only truly WAIT when no
such action passes a real reserve/payback test.

## 2. Acceptance criteria

Each criterion is a measurable behavior a corrected planner must exhibit,
paired with the failure it removes and a verification method. `AC` = acceptance
criterion.

### AC1 — WAIT is a last resort with a named blocker
- **Principle** (BOOK-07 §"Active-play principles"): when no target is directly
  affordable, search for a bounded ETA-reducing action; if every candidate
  fails a reserve/payback rule, state the exact blocker instead of an
  unqualified wait.
- **Failure removed**: FALSE WAIT / idle budget (lab TRACK 5: 3/4 budget unused,
  `M6 = UNCERTAIN`, no second candidate sought).
- **Verify**: on a saturated save, every cycle either executes a bounded action
  that reduces the active target's ETA, or emits a WAIT carrying a specific
  per-lane blocker (reserve deficit, payback horizon, unlock gate) for **every**
  non-acting lane. No cycle may idle remaining budget without a named blocker
  per unused lane.

### AC2 — Cross-lane feedback is scored, not just direct target growth
- **Principle** (BOOK-07 §"Army-to-larva feedback loop"): Meat funds Army; Army
  shortens Expansion; Expansion raises larva production; larvae finance Army and
  Nest/GQ rebuilds. A planner that ignores a feeder lane can miss the fastest
  path to the target.
- **Failure removed**: METRIC_NOT_COMPARABLE / R5 — heterogeneous lane scores
  (Clone Ramp 96000 vs Meat 10974) are not one ranking; feeder lanes are
  invisible to the target's ETA.
- **Verify**: when a feeder-lane action (e.g. a Territory bridge) measurably
  reduces the active gate's ETA more than a direct-lane action, the planner
  ranks the feeder action higher on the **same** `milestone-eta-seconds` basis.

### AC3 — One comparable ETA-to-next-gate metric across reversible lanes
- **Principle**: the recurring decision is "which bounded action most reduces
  the next gate's ETA" (BOOK-07 §Territory-to-larva checkpoint, §concurrent
  test): ETA before vs after a candidate, on one basis.
- **Failure removed**: readiness gate "four reversible domains share the active
  milestone metric" = FAIL; only Territory reliably carries real ETA today.
- **Verify**: in the saturated state, Meat / Larva-Engine / Army-Territory /
  Energy each either supply a real `expansion-eta`/target-eta-seconds outcome or
  are explicitly `UNRANKED` with a reason — never a false comparable zero
  (already enforced for M6 rows by clean-room slices 1–4; AC3 extends the
  requirement to the legacy lanes' own inputs).

### AC4 — Reserve is the cost of the next intended action, not a fixed percent
- **Principle** (BOOK-07 §A/B larva liquidity, §active reconstruction): the
  binding reserve is the resource cost of the next intended composite action;
  active reconstruction can safely dominate a static 1.5x rule when the
  sacrificed link is immediately rebuildable.
- **Failure removed**: over-rigid static reserve gates that force lanes to HOLD
  and hand the cycle to Meat by fallthrough (lab §1.3 gate asymmetry).
- **Verify**: a lane is only blocked for reserve when the *next intended
  action's* cost in the constrained resource would breach the reserve — not a
  blanket percentage — and reconstructable sacrifices carry a rebuild-feasibility
  check rather than a flat threshold.

### AC5 — Symmetric gating: no unconditional payback bypass
- **Principle** (implied by BOOK-07 §"more expensive unit is not automatically
  better" + lab TRACK 4): every lane, Meat included, competes on the same
  comparable metric; no lane may act purely because it holds a private bypass.
- **Failure removed**: GATE_ASYMMETRY — only meat/twin carry payback bypasses,
  so Meat is the sole permitted actor in saturation (lab decisive proof: with
  all meat bypasses off, Meat stops and the honest answer is WAIT).
- **Verify**: with the meat/twin payback bypass required to compete on the
  shared ETA basis, Meat wins a cycle only when it is genuinely the best
  ETA-reducing action, not merely because other lanes are advisor-only or
  incomparable. Meat's win rate on the saturated save becomes state-justified,
  not 50/50-by-fallthrough.

### AC6 — Twin/Faster valued by marginal payback, not availability
- **Principle** (BOOK-07 §working hypotheses): Twin affects only manual
  hatching — its value falls when passive growth dominates the horizon; a Faster
  that spends `S` and doubles output is immediately positive only when `N > 2S`.
- **Failure removed**: reflexive Twin/Faster purchases that consume reserve and
  starve the real gate.
- **Verify**: a Twin/Faster candidate is ranked by its cost/payback over the
  decision horizon against direct-producer and multiplier candidates, and the
  `N > 2S` (or the retained-reserve `N ≥ 2.5S`) immediate-positivity test is a
  precondition for an isolated Faster buy.

## 3. Non-goals (explicit)

- Not round-robin, not per-lane quotas, not "equal wins per lane" (BOOK-07
  §"Do not implement… artificial per-lane quotas"). The goal is a winner that
  reacts correctly to state.
- Not repeat clone-cast as a throughput fix (lab TRACK 6: clone output piles up
  idle; not the bottleneck).
- Not manufacturing offline time or touching save-time semantics (BOOK-07
  §save-format research is read-only).
- Not an ownership toggle. `m6DecisionOwnsMainCycle` stays `false` and this spec
  does not by itself authorize whole-cycle ownership.

## 4. Regime caveat

BOOK-07's evidence is early/mid-game (the Territory→Meat→Larva→Nest→Queen→
Greater-Queen→Hive chain, pre-Ascension). The observed meat-dominance failure is
a later post-Nexus saturated state. The principles are treated as universal, but
each acceptance criterion must be demonstrated **in the regime where the failure
occurs** (a saturated post-Nexus save), not only where the manual play ran.
Where a principle is only evidenced early-game, mark the criterion `EARLY-ONLY`
until a saturated-state observation confirms it.

## 5. Relationship to the M6 completeness work

[BOOK00_M6_COMPLETENESS_LARVA_ENGINE_FOUNDATION.md](BOOK00_M6_COMPLETENESS_LARVA_ENGINE_FOUNDATION.md)
addresses *who executes* (converting a path to M6 ownership). This spec
addresses *what is compared* (the shared ETA metric and symmetric gating).
AC2/AC3/AC5 are the real wall behind the readiness FAIL gate; a completeness
conversion without them would still rank on incomparable bases. Sequence
implication: the shared ETA-to-next-gate metric (AC3) is the prerequisite that
makes both the completeness work and the symmetric-gating fix meaningful.

## 6. Next step (proposed)

Reproduce the meat-dominance against these criteria on a saturated save
(measure AC1 first: does the bot find a bounded ETA-reducing action, or idle the
budget behind a false WAIT/ascension pause?). Use that as the evidence baseline
before any scoring/gate change, per the readiness hard constraint. This baseline
is diagnostic only and commits no runtime change.
