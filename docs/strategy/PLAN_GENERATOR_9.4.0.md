# 9.4.0 — Target-Path Bounded Plan Generator Laboratory (final report)

Read-only. No runtime change, no version bump, no merge. Harness:
`scripts/lab-9.4.0-plan-generator.js`. Evidence:
`docs/test-data/9.4.0-plan-laboratory/plan-generator-default-user-save.json`.

## Verdict: `PLAN_GENERATOR_PROVEN`

All requirements met on the frozen pathological save:
- plans generated **structurally** (cartesian over target-path actions, depth 1–4; no hardcoded winner);
- `Neural Cluster → Hive Network` **discovered** (and ranked) without a hardcoded sequence;
- every step recomputes its **bounded amount from fresh state**; the first action's real per-planner gate
  is verified against the real proposal set (later steps are re-verified on replan — see §6/execution
  limit);
- target-progress measured with the **frozen real engine** counterfactual (GATE 1 determinism);
- the winner is **order-invariant**;
- first-action runtime realizability is **exactly explained** (§6);
- **no forbidden heuristics** (no economicScore, lane bonus, tier-distance, flat %, planner order, or
  buyMax as value — buyMax appears only as a mechanical upper reference);
- **mutation controls all green**.

---

## 1. Why Neural Cluster / Hive Network are (not) among proposals

**Correction of an earlier GATE-2 mis-statement.** GATE2_CORRECTED said pantheon *and* pantheon2 are
"not proposed at all." Only **pantheon2** is unproposed. The real proposal set on the frozen save is:

| proposal | internalId | plannerKind | decision | safeEligible | milestone metric |
|---|---|---|---|---|---|
| Hive Neuron | goddess | **action-unit** | BUY | yes | NO_EFFECT |
| **Neural Cluster** | **pantheon** | **parent-step** | BUY | **yes** | NO_EFFECT |
| Expansion | expansion | engine | HOLD | no | (not buyable) |
| Hatchery | hatchery | engine | HOLD | no | (not buyable) |
| Lepidoptera | moth | energy | HOLD | no | (stop threshold) |

`buildMeatGoalPlan` descends the target's bottleneck chain (pantheon3 → pantheon2 → pantheon → goddess…),
depth-limited, and emits exactly the **action-unit** (goddess) plus its **immediate parent-step**
(pantheon = Neural Cluster). Both are safeEligible and reserve-safe; both are `NO_EFFECT` under
`binding-resource-eta.v1` (buying goddess/pantheon does not touch pantheon2), so M6 abstains. Classified:

| unit | display | count | velocity | cost resources | buyable | classification |
|---|---|---|---|---|---|---|
| goddess | Hive Neuron | 1.5e29 | 8.6e23 | meat, prophet, larva | yes | EMITTED action-unit — winner; `CONSIDERED_BUT_HOLD` (NO_EFFECT) |
| pantheon | Neural Cluster | 1.9e20 | 2.6e11 | meat, goddess, larva | yes | EMITTED parent-step — runner-up; `PLANNER_ORDER_PREEMPTED` |
| pantheon2 | Hive Network | 9.3e8 | 0 | meat, pantheon, larva | yes | **`NOT_EMITTED_TO_GLOBAL_COORDINATOR`** — target-path node beyond action-unit+parent-step |
| pantheon3 | Lesser Hive Mind | 0 | 0 | meat, pantheon2, larva | no | `TARGET` (goal; not a buy candidate) |

**So runtime picks Hive Neuron as the only action-unit** because the meat goal planner builds *bottom-up*
(deepest not-yet-saturated meat unit + its immediate parent), never the milestone's *direct* binding-
resource producer (pantheon2). pantheon2 is buyable but simply never enumerated.

## 2. Generated action universe (TRACK 2)

Lab-only, read-only, from the target-path graph (buyable nodes toward pantheon3) + real proposal roles +
real per-planner gates. Target-path membership only enumerates; it is never a score.

| canonicalActionId | plannerKind | targetPathRole | amountPolicy | reserveGate | currentlyProposed |
|---|---|---|---|---|---|
| meat::goddess::unit::base | action-unit | action-unit | floor(maxCostMet(0.85)·25/100) | meatActionUnitMinReserveRatio=5 | yes |
| meat::pantheon::unit::base | parent-step | parent-of-action-unit | floor(maxCostMet(0.85)·25/100) | meatParentStepMinReserveRatio=1.5 | yes |
| meat::pantheon2::unit::base | binding-resource-producer | target-direct-bottleneck | floor(maxCostMet(0.85)·25/100) | inherits action-unit/parent-step gate when emitted | **no** |

## 3. All generated plans + 4. ranking at 5 / 30 / 60 min

Binding resource pantheon2 has velocity 0, so at-horizon progress equals post-action progress
(horizon-invariant); all three horizons are measured explicitly and agree.

| plan | feasible | actions | binding progress (5/30/60m) | first action |
|---|---|--:|--:|---|
| WAIT | FEASIBLE | 0 | 0 | WAIT |
| Hive Neuron | FEASIBLE | 1 | 0 (NO_EFFECT) | proposed-but-blocked |
| Neural Cluster | FEASIBLE | 1 | 0 (NO_EFFECT) | proposed-but-blocked |
| Hive Network | FEASIBLE | 1 | +4.06e7 | not-proposed |
| Neural Cluster → Hive Network | FEASIBLE | 2 | +1.07e8 | proposed-but-blocked |
| Neural Cluster → Hive Network → Hive Network | FEASIBLE | 3 | +1.92e8 | proposed-but-blocked |
| **Neural Cluster → Hive Network → Neural Cluster → Hive Network** | FEASIBLE | 4 | **+2.44e8** | proposed-but-blocked |
| (buyMax mechanical upper reference) | — | 4 | 1.67e9 | — (not a product value) |

**Winner (60 min): `Neural Cluster → Hive Network → Neural Cluster → Hive Network`, +2.44e8,
order-invariant.** Single Neural Cluster and single Hive Neuron are honestly 0 (NO_EFFECT); the value
appears only as a multi-step plan.

## 5. Winning plan — first-action runtime feasibility (TRACK 5)

The winner's first action is **Neural Cluster (pantheon)** →
`CURRENT_RUNTIME_PROPOSED_BUT_BLOCKED`: it is **already an emitted, safeEligible parent-step proposal**
with a passing reserve gate (reserveRatio ≫ 1.5) and payback-bypass — it is blocked only because the
coordinator scores the *single action* `NO_EFFECT`. Determination for `Neural Cluster → Hive Network`:
- would Neural Cluster pass its real planner gate? **Yes** — emitted, safeEligible, reserve-safe.
- plannerKind that owns it? **parent-step** (`meatParentStepMinReserveRatio = 1.5`).
- payback-bypass contract? the existing meat payback-bypass (waives payback only; requires reserveRatio ≥
  threshold — satisfied).
- execution adapter? **yes** — `executeExactMeatCoordinatorCandidate` already handles `meat::…::unit`.
- why not emitted/executed today? it **is** emitted; the coordinator abstains because the single-action
  `binding-resource-eta.v1` metric is `NO_EFFECT`.

## 6. Minimal proposal-expansion design (TRACK 6)

The generator shows the only missing ingredient is **valuation**, not proposal machinery: the winning
plan's first action already exists as a safe proposal with a working adapter. Minimal, **general** change
(no special-case, no hardcoded pantheon, no Meat bonus, no forced two-step, no auto-execution of later
steps):

1. **Enumerate buyable target-path nodes toward the active milestone as candidates** (this generically
   adds pantheon2 / Hive Network, and any binding-resource producer, to the proposal set — target-path
   membership used only to enumerate).
2. **Value each candidate by the counterfactual-horizon-progress of the best feasible bounded plan it
   starts** (not by the single-action metric), using the frozen deterministic model proven here.
3. **Emit a plan-derived proposal** carrying:
   `planId, planSchema, firstActionCanonicalId, planTargetId, planHorizonId, planOutcome,
   authorization-compatible requestedAmount`.
4. **Authorize only `firstAction`** under Track A's existing `authorizationId` + four-value amount
   contracts (unchanged), then re-snapshot / re-authorize / re-rank — never auto-run later steps.

Because the winner's first action is already a proposal, in many states this reduces to *re-ranking an
existing parent-step proposal by its plan outcome*; where the first action is an unemitted target-path
producer (Hive Network), step 1 emits it generically. No policy limit changes.

## 7. Mutation controls (TRACK 7) — all detected

remove Neural Cluster from universe · remove Hive Network as step 2 (NC-only → 0 progress) · buyMax
instead of bounded (different amount) · ignore reserve gate (below-threshold would pass; real gate blocks)
· reuse stale amount in step 2 (differs from fresh recompute) · target-path membership as score (winner
is chosen by measured progress, not membership) · plan by planner order (WAIT would win; progress ranker
does not) · authorize whole plan instead of actions[0] (>1 executed action detected) · amount tampered
after authorization (contract violated). All green.

## 8/9. Commit SHAs

- plan generator (harness + evidence): `f28acb0a13761312009b98c6fdeb69202475c41e`.
- corrected GATE 2 (context): `396e6162653babe281d42b691592b21c41c4ca61`.
- GATE 1 determinism (frozen engine): `fecd4c75d9be8f6449cbc5b757c8a42e22da2dd4`.
- branch HEAD recorded on the report commit below.

## 10. Recommended next runtime port

Implement the §6 minimal expansion as a versioned `counterfactual-horizon-progress` plan-outcome that
(a) generically enumerates buyable target-path producers of the active milestone's binding resource,
(b) ranks them by the deterministic frozen-model plan progress proven here, (c) emits a plan-derived
proposal whose `firstAction` is authorized under Track A's unchanged contracts, and (d) executes only
`actions[0]` then re-plans. This turns deep-Meat `WAIT` into a verified, progress-making, bounded,
Track-A-authorized first action — resolving the pathology **without** lowering any reserve threshold and
**without** any Meat special-case.
