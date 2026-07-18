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
