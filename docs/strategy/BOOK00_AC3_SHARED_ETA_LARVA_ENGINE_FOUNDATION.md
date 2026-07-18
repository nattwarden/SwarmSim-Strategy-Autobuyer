# BOOK-00 AC3 shared ETA metric — design foundation (first domain: Larva/Engine)

Status: DESIGN PROPOSAL for review. No runtime change is authorized by this
document. It designs how the Larva/Engine reversible domain can emit a real,
non-fabricated `milestone-eta-seconds` outcome so M6 can rank it — the measured
prerequisite that blocks M6 completeness and, ultimately, whole-cycle ownership.
`NO_GO_GLOBAL_EXECUTION_OWNERSHIP` remains in force.

Author date: 2026-07-18

Direct inputs:
- [BOOK00_M6_COMPLETENESS_LARVA_ENGINE_FOUNDATION.md](BOOK00_M6_COMPLETENESS_LARVA_ENGINE_FOUNDATION.md)
  §9 — the feasibility finding that made this necessary.
- [BOOK00_ETA_DRIVEN_SELECTION_SPEC_FOUNDATION.md](BOOK00_ETA_DRIVEN_SELECTION_SPEC_FOUNDATION.md)
  — AC2/AC3 (this doc implements AC3 for one domain).
- [GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md](GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md)
  — findings R1/R3/R5 (never fabricate an ETA conversion) and the FAIL gate.
- `docs/BOOK-07-realtime-play-data-and-reproducible-saves.md` — the human treats
  gate progress as an ETA problem (§"Territory-to-larva checkpoint", §237) and
  the unlock gates are fixed (game data), so ETA-to-next-gate is well-defined.

## 1. The measured problem

Feasibility measurement (2026-07-18): in every real cycle where the legacy
`LARVA_ENGINE_GUARD` executes, the M6 `LARVA_ENGINE` domain is
`comparability = UNRANKED`. Cause: the Engine purchase row emits
`metricBasis = same-unit-milestone-progress-delta` (Expansion/Hatchery
completion, a percent), while the cycle's selected comparison basis is
`milestone-eta-seconds`. Slice 3 correctly refuses to compare across bases, so
Engine is unranked and can never be the executable, comparable proposal that M6
completeness requires. Identity and amount equivalence already hold — only the
comparable ETA value is missing.

## 2. The proven, non-fabricated pattern to copy

Two domains already emit a real `milestone-eta-seconds` outcome, and they are
the template AC3 must follow exactly (never invent a value):

- **Energy pre-Nexus (Lepidoptera):** `scoreLepidopteraInvestment` computes
  `etaBeforeSeconds` and `etaAfterSeconds` toward the next Nexus by recomputing
  the real energy-accumulation time at the pre-buy and post-buy energy
  production rate; `etaImprovementSeconds = before - after`. Metric target = the
  Nexus, `metricId = strategicEtaMetricId(Nexus)`, unit `seconds`, basis
  `milestone-eta-seconds`.
- **Army/Territory:** territory production increases shorten the real time to
  the next Expansion gate on the same basis.

The invariant in both: the ETA improvement is a **measured recomputation of a
real accumulation time at a real changed production rate** — not a rescaled
progress percentage. AC3 for Larva/Engine must meet the same bar.

## 3. AC3 contract for the Larva/Engine domain

> When, and only when, buying the Engine-selected Expansion/Hatchery upgrade
> genuinely accelerates the **active target's** own resource gate through its
> real larva-production increase, the Larva/Engine domain emits a
> `milestone-eta-seconds` outcome whose value is the measured
> `etaBeforeSeconds - etaAfterSeconds` for that active target. Otherwise it stays
> `UNRANKED` (fail-closed). No value is fabricated from a completion percentage.

Concretely:

1. **Bind to the active target.** The ETA is computed toward the cycle's
   `activeTarget` (the same target every domain is measured against, per slice
   2), not toward "Expansion completion". The metric target must equal the
   active target or the outcome stays `UNRANKED` (slice 2 already enforces
   target alignment).
2. **Real before/after production.** `etaBefore` = time for the active target's
   binding resource to reach its gate at the current production rate;
   `etaAfter` = the same time recomputed at the production rate that the
   Expansion/Hatchery upgrade actually yields (read from the real post-upgrade
   larva/meat rate the game exposes, exactly as the Energy pattern reads the
   post-buy energy rate). `etaImprovementSeconds = etaBefore - etaAfter`.
3. **Only a direct, measurable acceleration counts.** If the active target's
   binding resource is not one that the Engine upgrade's larva increase
   measurably accelerates (e.g. a purely meat-gated distant milestone with no
   modeled larva→meat coupling), the improvement is not honestly measurable and
   the domain stays `UNRANKED`. Do **not** model a speculative multi-hop
   feedback chain to force a number (R1/R3/R5).
4. **Non-negative, bounded.** A worsening or zero improvement stays out of the
   BUY ranking (it may still be reported as `0`/HOLD); the value must come from
   the real rate delta, never from the completion percent.

## 4. What this does and does NOT change

- **Does:** add a real `etaImprovementSeconds` / `milestone-eta-seconds` outcome
  to the Engine purchase row (the same `raw` fields the Energy row already
  populates), so `sixDomainComparableValue` can rank it and the M6
  `LARVA_ENGINE` domain can become `COMPARABLE` in the states where the
  acceleration is real.
- **Does NOT:** grant execution ownership. Engine becoming rankable only lets M6
  *compare* it; M6 still executes nothing extra while `m6DecisionOwnsMainCycle`
  stays `false`, and whole-cycle ownership still needs the completeness
  classifier (deferred Slice A) plus all-ten COMPLETE plus the sole-owner live
  acceptance gate. `NO_GO` stays in force.
- **Does NOT:** change any buy amount, reserve, safety default, or the legacy
  execution path. The legacy guard still buys; this only enriches the M6
  observability/ranking input.

## 5. Mandatory evidence gate (readiness hard constraint)

This is a change to scoring/comparability (`sixDomainComparableValue` inputs and
the Engine row's declared metric), so per the readiness hard constraint it may
not land without a fresh SA1 / live evidence run documented alongside it. The
evidence must show:

1. **No unintended winner/decision drift.** Run the SA1 scenario matrix (and the
   pinned live saves) before and after; every changed winner/decision must be
   explained by a real, larger Engine ETA improvement — not by a fabricated or
   mis-scaled value. Unchanged states must stay unchanged.
2. **Honest UNRANKED preservation.** In states where the Engine acceleration is
   not real, the domain stays `UNRANKED` (a mutation that forces a value must be
   rejected).
3. **Same-contract comparability.** When Engine does rank, it shares the exact
   `activeTarget` / `metricId` / `unit` / `basis` / `horizon` contract with the
   competing domains (slices 2–4 gates still pass).
4. **No ownership change.** `m6DecisionOwnsMainCycle` stays `false`;
   `completeM6PathCount` stays `0`; the live-purchase acceptance check still
   passes.

## 6. Scope and sequence

- **This work item: Larva/Engine only.** It is the smallest reversible domain
  and the one whose identity/amount equivalence is already proven. Meat and
  Energy (post-Nexus) have their own metric shapes and are separate follow-ups.
- **After AC3 for Larva/Engine lands with evidence,** the deferred completeness
  classifier (Slice A) becomes achievable for that domain, because the M6
  `LARVA_ENGINE` domain can finally be `COMPARABLE` in its execute states.
- **Ownership remains gated** behind all-ten completeness plus sole-owner live
  acceptance — unchanged and out of scope here.

## 7. Open questions to resolve during implementation

- **Active-target coupling.** For which active targets is the Engine larva
  increase a *direct, measurable* accelerator? The first implementation must
  enumerate those cases from real state (e.g. a larva-gated unlock/threshold on
  the active target's path) and stay UNRANKED elsewhere. This is the crux and
  must be settled with live measurement, not assumption.
- **Larva→meat coupling.** If the active target is meat-gated, is there a real,
  already-exposed rate that captures the Expansion's downstream meat effect, or
  is it genuinely UNRANKED? Prefer UNRANKED over a modeled chain.
- **Interaction with slice 3's single-basis contract.** Confirm that adding a
  real eta-seconds value to the Engine row makes it rank on the selected basis
  without disturbing the completion-delta path that other consumers may read.

## 8. Decision requested

Approve, revise, or reject:

1. the AC3 contract in §3 (real measured ETA toward the active target, fail-
   closed UNRANKED, never fabricated);
2. Larva/Engine as the first (and, for this work item, only) domain;
3. the mandatory SA1/live evidence gate in §5 as a precondition for landing;
4. that this is design-only until approved, and that even once implemented it
   changes ranking only — not ownership.

Only after approval does implementation begin, and only with the SA1/live
evidence run produced alongside the change and verified at an exact SHA.

## 9. Implementation-time measurement — the §3 contract is REFRAMED (2026-07-18)

Before writing scoring code, the crux from §7 was measured directly on a live
save in a real Engine-execute cycle (`getCurrent().domainOutcomes`):

```
activeTarget    = "Expansion"
activeMilestone = "Buy Expansion now; it is the strongest larva-engine upgrade."
LARVA_ENGINE:  action=expansion  etaBefore=0  progressDelta=100  comparability=UNRANKED
ARMY_TERRITORY: UNSUPPORTED (no proposal)   MEAT/ENERGY: BLOCKED
```

Decisive result: **the Engine action is a direct completion, not a
production-acceleration.** `etaBefore = 0` (the Expansion is affordable now) and
the honest metric is `progressDelta = 100`. In every state where the Engine
guard executes, the Expansion/Hatchery is by definition affordable (otherwise
the guard HOLDs), so `etaBefore` is always `0`. Injecting a
`milestone-eta-seconds` value for a target whose ETA is `0` would be exactly the
fabrication R1/R3/R5 forbid. **Therefore the §3 "emit an ETA improvement"
contract is withdrawn — it is not honestly implementable for this domain.**

### 9.1 Corrected, non-fabricating design

The measurement shows Engine already emits its honest metric (`progressDelta =
100`). It is UNRANKED only because (a) the cycle's selected comparison basis is
hard-defaulted to `milestone-eta-seconds`, and (b) the Engine row's
`metricTarget` is `null`, so it cannot target-align even on the right basis. The
honest fix is therefore two small, non-fabricating parts:

1. **Basis follows the active target's decision type.** When the active target
   is a directly-buyable completion step (the selected action is affordable now,
   `etaBefore = 0`, and its honest metric is a same-unit completion delta), the
   cycle selects `same-unit-milestone-progress-delta` as the comparison basis;
   when the active target is a future gate being accumulated toward, it selects
   `milestone-eta-seconds` (today's default). This makes completion domains rank
   on the basis they already honestly emit, and acceleration domains rank on
   theirs — no value is invented.
2. **Completion domains carry an aligned `metricTarget`.** The Engine row must
   set `metricTarget` to the active target it completes, so slice 2's target
   alignment can pass. (Measurement showed it is currently `null`.)

This preserves every slice 1–4 guarantee: missing values stay UNRANKED, one
basis per cycle, exact target/metric/horizon identity. It does not fabricate an
ETA; it selects the honest basis for the decision actually being made.

### 9.2 Revised decision requested

The original §3/§8 contract (add an ETA to Engine) is not honestly
implementable and is withdrawn. Approve, revise, or reject the corrected design
in §9.1 instead:

1. select the comparison basis from the active target's decision type
   (completion → progress-delta; future gate → eta-seconds);
2. give completion domains an aligned `metricTarget`;
3. same mandatory SA1/live evidence gate (§5), same ranking-only /
   no-ownership-change invariants (§4);
4. still Larva/Engine first.

This remains design-only until the corrected §9.1 direction is approved; the
approved-but-refuted §3 contract will not be implemented.

## 10. Implementation attempt — §9.1 is BLOCKED by an accepted safety invariant (2026-07-18)

The corrected §9.1 basis selection was implemented (a `decisionType` on the
strategy identity — `COMPLETION` for the buy-now Expansion/Hatchery branches —
selecting `same-unit-milestone-progress-delta` for completion cycles) and
measured live: the M6 `LARVA_ENGINE` domain became `COMPARABLE` exactly as
designed, and M6's recommendation moved from `UNCERTAIN` to `ACT`.

But `npm run verify` failed at `check-book00-m2-coordinator` (lines 89–92),
which enforces an accepted, tested invariant:

```
local completion-only Expansion: legacy executes it;
coordinatorExecutionAuthority === "false"; coordinatorSelectedExecutionId === "none".
```

Making the Engine completion rank turns it into the M6 winner and gives it M6
execution authority — which this invariant forbids. The runtime change was
reverted; the tree is green again.

### 10.1 Why this is a real block, not a check to edit

The invariant encodes the architecture's division of labour (findings
R1/R3/R5): **M6 ranks economic ETA comparisons; a "buy the affordable
completion now" step is legacy-owned and must not gain M6 authority from a 100%
completion metric.** Combined with the feasibility finding (§9: the Larva/Engine
guard's executable action is *always* a completion, `etaBefore = 0`), this means:

> The Larva/Engine path cannot be given M6 ranking-with-authority — and
> therefore cannot be converted to M6 `COMPLETE` / ownership — without
> overturning the "completions stay legacy-owned" invariant. That is not a
> scoring tweak; it *is* the gated ownership decision that
> `NO_GO_GLOBAL_EXECUTION_OWNERSHIP` and the sole-owner live-acceptance gate
> exist to protect.

### 10.2 Consequence for the whole completeness direction

Because every reversible domain whose action is a directly-buyable completion
falls under the same legacy-owned invariant, converting such a path to M6
COMPLETE is blocked by design, not by a missing metric. The M6-completeness
route to lifting `NO_GO` therefore reduces to one deliberate, evidence-heavy
decision — allow M6 to own completions (change the invariant) under the
sole-owner live-acceptance gate — rather than a sequence of incremental scoring
slices. This is the honest end state of the AC3/completeness investigation: the
remaining work is a single gated ownership decision, and no smaller runtime
change can reach it without violating an accepted safety invariant. Recorded so
the next agent does not re-attempt the incremental path.
