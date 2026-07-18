# BOOK-00 M6 completeness foundation — first path: Larva Engine guard

Status: DESIGN PROPOSAL for review. No runtime change is authorized by this
document. It defines the fail-closed contract by which a retained legacy path
may earn `m6Coverage = COMPLETE`, and proposes `LARVA_ENGINE_GUARD` as the
first path to convert. `NO_GO_GLOBAL_EXECUTION_OWNERSHIP` remains in force.

Author date: 2026-07-18

Relationship to prior work:
[GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md](GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md)
(findings R1–R9, readiness gates) and
[BOOK00_CURRENT_STATUS.md](BOOK00_CURRENT_STATUS.md) (Phase 3 slices 1–16). The
path-boundary sweep (slices 8–16) gave all ten retained legacy paths a proven,
cycle-bound, fail-closed, real-delta-confirmed proposal boundary. This document
opens the *next* phase: earning `COMPLETE` M6 execution coverage one path at a
time, still without any ownership toggle.

## 1. Why this is not a flag flip

`m6Coverage` is a **static** field on each row of `MAIN_CYCLE_COVERAGE_PATHS`
(`dev-src/runtime-sections/runtime-main.js`). Whole-cycle ownership eligibility
is computed as:

```js
const uncoveredPaths = paths.filter((path) => path.m6Coverage !== "COMPLETE");
const wholeCycleOwnershipEligible =
  uncoveredPaths.length === 0 && missingCycleEvidencePaths.length === 0;
```

Nothing currently *earns* `COMPLETE` from evidence — the field is asserted.
Flipping it by hand would be exactly the class of shortcut findings R1–R9
rejected: a label standing in for a proven capability. Converting a path to
`COMPLETE` therefore means building a **runtime classifier** that raises
coverage to `COMPLETE` only from proven, same-cycle equivalence evidence, and
falls closed to the path's declared floor (`PARTIAL`/`NONE`) otherwise, with a
mutation control that reproduces and is rejected.

## 2. The completeness contract (`m6-path-completeness-evidence.v1`)

A retained legacy path `P` with domain(s) `D` earns `COMPLETE` **for one real
cycle** if and only if every condition below holds, observed from that cycle,
bound to the coordinator's snapshot and decision-cycle identities:

1. **Applicability parity.** For the real state this cycle, the legacy path `P`
   and M6's domain `D` agree on whether an executable purchase exists. Three
   agreeing cases:
   - both would execute a bounded purchase (ACTIONABLE parity);
   - both decline (P is HOLD/NOT_APPLICABLE and D emits no executable
     proposal) (IDLE parity);
   - P is legitimately skipped (budget / exact-M6 already executed) — carried,
     not proof by itself.
2. **Executable M6 proposal.** When P is ACTIONABLE, M6's domain `D` outcome is
   `authorityClass = BOUNDED_REVERSIBLE`, `safety.status = ALLOWED`,
   `comparability.status = COMPARABLE`, and carries a bounded, authorized
   proposal (canonical id + authorization id bound to this cycle).
3. **Identity equivalence.** M6's executable proposal and the legacy path's
   own boundary proposal (from the slice 8–16 path boundary) share the **exact**
   canonical proposal identity: `executionId`, `executionKind`,
   `executionVariant`, and `boundedAmount` are equal strings.
4. **Target/metric equivalence.** Both describe the same `activeTarget`,
   `metricId`, `metricUnit`, `metricBasis`, `horizonId`, `horizonSeconds`
   (the slice 2–4 contract already enforces this for M6 rows).
5. **Amount equivalence.** The amount M6 would command equals the amount the
   legacy path commands (both fail-closed to the same bounded token; the
   confirmation basis matches the boundary's — exact for amount-1 upgrades,
   real positive delta for large-magnitude unit buys).
6. **No authority widening.** Advisor-only, irreversible and hard-safety
   actions in `D` remain outside purchase authority; `D` never grants ability /
   ascension / mutagen execution.

If any condition fails, coverage for `P` this cycle is the declared floor, not
`COMPLETE`. `COMPLETE` is **per-cycle earned**, never latched.

### 2.1 Runtime shape (proposed, not yet built)

- Add `m6CoverageFloor` (the current static value) and compute a dynamic
  `m6Coverage` in `buildMainCycleCoverageLedger` from an
  `m6-path-completeness-evidence.v1` record attached to the cycle, exactly as
  `pathBoundaryEvidence` is already classified from `cycleDisposition`.
- The classifier `classifyPathCompleteness(pathId, domainOutcomes,
  cycleDisposition, boundaryProposal, expectedContext)` returns `COMPLETE`
  only on full equivalence, else the floor. It is pure and fail-closed, like
  `classifyPathBoundaryEvidence`.
- `wholeCycleOwnershipEligible` is unchanged in form; it simply now sees a
  dynamic `m6Coverage`. Because the other nine paths still report their floor,
  eligibility stays `false` and `NO_GO` holds.

## 3. Invariants preserved (hard boundaries)

- `m6DecisionOwnsMainCycle` stays `false`. This phase never toggles ownership.
- `wholeCycleOwnershipEligible` cannot become `true` from one COMPLETE path;
  it needs **all ten** COMPLETE **and** same-cycle evidence for all ten.
- The **sole-owner live-purchase-acceptance gate** must pass against any future
  ownership change (readiness gate "Sole-owner live acceptance"); this phase
  does not approach that toggle.
- No scoring/comparability change (`evaluatePurchaseCandidate`,
  `projectedMilestoneProgressDelta`, `sixDomainComparableValue`) without a
  fresh SA1/live evidence run (readiness hard constraint).
- No invented milestone-ETA conversion to make heterogeneous actions rankable
  (findings R1, R3, R5).
- Advisor-only / irreversible / hard-safety actions stay out of purchase
  authority (`M6-ABILITY-AUTHORITY`, `M6-ASCENSION-AUTHORITY`).

## 4. First path: `LARVA_ENGINE_GUARD`

Rationale (from the readiness domain matrix and the path-distance assessment):

- single domain `LARVA_ENGINE`; already `PARTIAL`;
- the readiness matrix records "Exact selected Hatchery/Expansion upgrade is
  supported" — the M6 domain can already emit the executable proposal;
- the path boundary (`larva-engine-guard-path-boundary.v1`, slice 11) already
  emits the legacy proposal with exact identity + amount-`1` +
  real-upgrade-count-delta confirmation, giving a clean equivalence anchor;
- lowest state-count of the four `PARTIAL` paths (one upgrade class,
  amount-1), so it is the smallest honest first proof.

### 4.1 What "COMPLETE for Larva Engine" must prove

Across the real states the guard handles this cycle:

- **Execute parity + identity/amount equivalence.** When the guard would buy
  the selected Engine upgrade (Expansion/Hatchery, amount 1), M6's
  `LARVA_ENGINE` domain emits a `BOUNDED_REVERSIBLE` / `ALLOWED` /
  `COMPARABLE` proposal whose canonical id and bounded amount equal the guard
  boundary's executed proposal, on the same target/metric/horizon contract.
- **Idle parity.** When the guard holds or is not applicable (locked,
  disabled, nothing buyable), M6's domain emits no executable `LARVA_ENGINE`
  purchase.
- **No widening.** M6 still does not execute; this is coverage evidence, not an
  ownership grant. The guard remains the executor while `m6DecisionOwnsMainCycle`
  is `false`.

### 4.2 Known scoping question to resolve before implementation

The guard's `m6Domains` is `["LARVA_ENGINE"]`, but `handleLarvaEnginePriority`
may act on more than the single M6-selected upgrade (it has its own
Expansion/Hatchery ordering). `COMPLETE` requires that **every** executable
guard buy is equivalently covered by M6, not just the one the coordinator
happens to select. The first implementation slice must either:

- (a) prove that in every state the guard's executable buy is exactly the M6
  domain's selected upgrade (full equivalence), or
- (b) narrow the `COMPLETE` claim to the sub-states where that holds and keep
  the remainder at the floor (documented partial-within-path), deferring the
  remainder to a follow-up slice.

Recommendation: start with (b) — earn `COMPLETE` only on the proven-equivalent
sub-state, fail closed elsewhere — because it is honest, incremental, and
mutation-testable. Widen to (a) only with evidence.

## 5. Acceptance criteria (per slice, exact-SHA + live)

Mirror the boundary-slice discipline:

1. A live headless-Chrome cycle where the guard executes the Engine upgrade
   shows the `LARVA_ENGINE_GUARD` row at `m6Coverage = COMPLETE` with an
   `m6-path-completeness-evidence.v1` record proving identity/amount/target
   equivalence, bound to the real cycle identity.
2. A live cycle where the guard is idle shows the domain emits no executable
   proposal and coverage stays at the floor (fail-closed), **not** COMPLETE.
3. `wholeCycleOwnershipEligible` remains `false`; the WAIT precondition remains
   `FAIL`/`ADVISOR_ONLY`; `completeM6PathCount` becomes `1` of `10` (not more).
4. Mutation controls, each reproduced and rejected:
   - identity drift (M6 proposal points at a different upgrade) → floor, not
     COMPLETE;
   - amount drift (M6 amount ≠ guard amount) → floor;
   - latching (coverage stays COMPLETE on a later idle cycle) → rejected;
   - a hardcoded `COMPLETE` floor bypass → rejected by the classifier being the
     only source of `COMPLETE`.
5. Full `npm run verify` green at the exact implementation SHA in an isolated
   worktree; clean tree; separate implementation / evidence / closure commits.
6. No change to scoring, proposal selection, action budgets, safety defaults,
   or execution ownership.

## 6. Slice plan (proposed sequence)

- **Slice A (classifier + Larva Engine, sub-state COMPLETE).** Add
  `m6-path-completeness-evidence.v1`, the fail-closed `classifyPathCompleteness`,
  the dynamic `m6Coverage` in the ledger, and earn `COMPLETE` for
  `LARVA_ENGINE_GUARD` only on the proven-equivalent execute state. Add a
  dedicated check (not necessarily in `npm run verify`, matching the
  guard-boundary precedent) plus the DECLARED-map style enforcement so the
  other checks see the new dynamic field without drift.
- **Slice B (Larva Engine full-state).** Extend `COMPLETE` to the remaining
  guard buy states, or document why they stay at the floor.
- **Later paths.** Repeat for `ENERGY_GUARD` (resolving the post-Nexus
  legacy-owned scoping first), then `SMART_UNITS`, then `MEAT_UNLOCK_PLANNER`,
  then the `NONE` paths — each only after its own equivalence proof.
- **Ownership toggle is out of scope** for every slice here; it is gated behind
  all-ten COMPLETE plus the sole-owner live-acceptance gate and is a separate,
  explicitly authorized decision.

## 7. Open risks

- **Equivalence may not hold in all states.** If the guard's executable buy is
  not always the M6 domain's selected upgrade, `COMPLETE` is only honestly
  earnable on a sub-state (option 4.2b). This is expected and acceptable; it
  must be measured, not assumed.
- **Domain outcome availability.** The `LARVA_ENGINE` domain must emit a
  `COMPARABLE` executable proposal in the execute state; readiness gate "four
  reversible domains share the active milestone metric" is still `FAIL`
  globally, so even Larva Engine may lack the shared metric in some states —
  those states stay at the floor.
- **Interaction with the other agent's uncommitted work.** `AGENTS.md` and
  `BOOK-00` currently carry another agent's uncommitted manual-play
  documentation. This foundation doc is intentionally referenced only from
  `BOOK00_CURRENT_STATUS.md`; the `AGENTS.md` Book index update is deferred
  until that work lands, to avoid entangling commits.

## 8. Decision requested

Approve, revise, or reject:

1. the completeness contract in §2 (equivalence-proven, per-cycle earned,
   fail-closed, no ownership change);
2. `LARVA_ENGINE_GUARD` as the first path (§4);
3. the incremental option 4.2(b) (earn COMPLETE only on the proven-equivalent
   sub-state first);
4. the slice plan in §6.

Only after approval does any runtime change proceed, one exact-SHA-verified
slice at a time.

## 9. Feasibility finding (measured 2026-07-18) — Slice A is BLOCKED on the shared-metric prerequisite

Before implementing the classifier, the equivalence conditions of §2 were
measured directly on two live saves, over real cycles where the legacy
`LARVA_ENGINE_GUARD` executes (`bot.strategicCoordinator.mainCycleCoverage()`
for the legacy boundary proposal, `getCurrent().domainOutcomes` for the M6
`LARVA_ENGINE` domain outcome):

- **Identity + amount equivalence HOLD.** When the guard executes `expansion x1`,
  the M6 `LARVA_ENGINE` domain's `action.executionId`/`executionKind`/`amount`
  are `expansion`/`upgrade`/`1` — an exact match. The path-boundary sweep
  (slice 11) set this up cleanly. (In some cycles the guard bought `hatchery`
  while the M6 domain still pointed at `expansion`; identity then diverged, as
  option 4.2 anticipated.)
- **Executability FAILS in every observed cycle.** The M6 `LARVA_ENGINE` domain
  outcome is `authorityClass = BOUNDED_REVERSIBLE`, `safety = ALLOWED`, but
  `comparability = UNRANKED` in every cycle. Its metric (Expansion/Hatchery
  completion, a `same-unit-milestone-progress-delta`) does not match the
  cycle's selected comparison basis (target ETA seconds), so it is never
  `COMPARABLE`.

Therefore condition §2.2 ("executable M6 proposal", which requires
`comparability = COMPARABLE`) can never be met while the guard executes, and
`COMPLETE` is **not earnable** for `LARVA_ENGINE` under the current metric
contract. This is the readiness FAIL gate "four reversible domains share the
active milestone metric" / finding R5, in concrete measured form, and it
confirms §5 of this document: a completeness conversion is meaningless until the
reversible domains share one comparable ETA-to-next-gate metric (spec AC3 in
[BOOK00_ETA_DRIVEN_SELECTION_SPEC_FOUNDATION.md](BOOK00_ETA_DRIVEN_SELECTION_SPEC_FOUNDATION.md)).

**Consequence:** Slice A (the completeness classifier) is deferred. The real
prerequisite is AC3 — giving the reversible domains (starting with
Larva/Engine) a comparable `milestone-eta-seconds` outcome so the Engine domain
can rank on the cycle's basis. That is a scoring change to the metric contract
(`sixDomainComparableValue` / the selected-basis logic) and, per the readiness
hard constraint, requires a fresh SA1 / live evidence run documented alongside
it. It is a larger, separately-scoped work item than the boundary slices and
must not be started as an incidental change.
