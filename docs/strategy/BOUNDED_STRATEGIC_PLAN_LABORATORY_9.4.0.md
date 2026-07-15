# 9.4.0 Bounded Strategic Plan Laboratory

Read-only research. No runtime change, no version bump, no merge. Harness:
`scripts/lab-9.4.0-plan-laboratory.js` (not part of `verify`). Artifacts under
`docs/test-data/9.4.0-plan-laboratory/`.

**Interim verdict: `PLAN_MODEL_PROMISING_NEEDS_MORE_DATA` — but the central scientific risk is
retired.** The hardest thing TRACK B could not do is now done: the deep-Meat mechanics are captured
from the live engine, and a bit-identical **real-engine** counterfactual proves the core acceptance
with real numbers and no artificial score. What remains for `PLAN_MODEL_PROVEN` is breadth
(more save states for the lane-sensitivity matrix) and determinism hardening — not a missing model.

---

## 0. Correction to TRACK B's data-limitation finding

TRACK B concluded `MODEL_PROMISING_NEEDS_MORE_DATA` largely because *"across 864 `*-result.json`
snapshots the deepest unit with count>0 is `nest`; per-unit velocities / `eachProduction` / `eachCost`
were populated in 0/864 files; the save is undecodable here."*

That was true of the **serialized static snapshots** — they captured only a hardcoded shortlist. It is
**false of the live engine.** Loading the repo save (`docs/test-data/strategy-audit-0/default-user-save/save.txt`,
identical to `clone-ramp/live-user-save.txt`) with `game.importSave(...)` and reading the Angular
`game` service exposes the **entire** deep chain with real per-unit `count()`, `velocity()`,
`eachProduction()`, `eachCost()`. The save IS the deep-Meat state (meat ≈ 9e156, `pantheon2` present).

## 1. Full mechanic snapshot (Step 1)

`mechanic-snapshot-default-user-save.json` — 58 units, Decimal strings, internal ids. The meat chain
(internal id → display name), with production being the game's `eachProduction()` (per-unit, keyed by
produced resource):

| internal id | display name | produces (per unit) | cost (binding leg) | count | buyable |
|---|---|---|---|---|---|
| pantheon | **neural cluster** | goddess ×4494.6 | goddess 1e10 | 1.9e20 | yes |
| pantheon2 | **hive network** | pantheon ×275.9 | pantheon 1e12 | 9.3e8 | yes |
| pantheon3 | **lesser hive mind** (TARGET) | pantheon2 ×33.8 | **pantheon2 1e14** | 0 | **no** |
| pantheon4 | hive mind | pantheon3 ×33.1 | pantheon3 1e16 | 0 | no |
| pantheon5 | arch-mind | pantheon4 ×32.4 | pantheon4 1e19 | 0 | no |

**The pathology, exactly:** the active milestone `pantheon3` (lesser hive mind) is gated by
`pantheon2` (hive network): needs `1e14`, has `9.3e8`, and **`pantheon2.velocity = 0`** — nothing
produces it passively (production flows *downward*: pantheon2→pantheon→goddess→…→meat). So its
affordability ETA is infinite and never improves by waiting.

`binding-resource-eta.v1` scores a **single** Neural Cluster (pantheon) buy as `NO_EFFECT`, correctly:
pantheon's `eachProduction` is `{goddess: 4494.6}`, which does not touch `pantheon2`. It *also* scores a
direct Hive Network (pantheon2) buy as `NO_EFFECT`, because that metric only credits (a) production
*rate* of the binding resource and (b) *cost* paid in the binding resource — never the direct **count
increase** from buying the binding resource itself. That is metric blind-spot #1 from TRACK B, now
confirmed on real data.

## 2. Real-engine counterfactual (Steps 3–5, the crux)

Instead of a hand-built simulator with un-vendored formulas (TRACK B's blocker), the laboratory uses
the **real engine** as the source of truth:

- Immutable start: `game.importSave(save)` gives a bit-identical starting state for every branch.
- Action: the game's own `commands.buyUnit` / `buyMaxUnit`.
- Passive production over a horizon: `game.tick(new Date(game.now.getTime() + H*1000))`, which the
  engine integrates via `cache.onTick()` (the tick function allows forward time; it only guards
  backward jumps > 120 s). No fabricated production/cost math.

Branches measured against `pantheon3` (lesser hive mind), binding resource `pantheon2`, horizon 3600 s:

| branch | canonical actions | pantheon2 after action | binding afford-ratio (need 1e14) |
|---|---|---|---|
| WAIT | — | 9.28e8 (unchanged; velocity 0) | 9.28e-6 |
| single Neural Cluster | `pantheon ×1` | **9.28e8 (unchanged) → `NO_EFFECT`** | 9.28e-6 |
| buy Hive Network (max) | `pantheon2 ×max` | 1.12e9 (+1.9e8) | 1.12e-5 |
| **2-step plan** | `pantheon ×max` → `pantheon2 ×max` | **≈3.2e10 (+~34×) → measurable progress** | **≈3.2e-4 (~34×)** |

**Acceptance PROVEN (no artificial score):**
> a single Neural Cluster is honestly `NO_EFFECT`, yet a valid multi-action Meat plan produces
> measurable target progress.

The mechanism is real and honest: buying Neural Cluster (pantheon) with the large `goddess` reserve
enlarges the pantheon pool, so the following `buyMax` of Hive Network (pantheon2) converts far more
into the binding resource than a single Hive Network buy alone. This is exactly the *multi-purchase
completion* structure TRACK B identified — and the counterfactual, unlike `binding-resource-eta.v1`,
values it correctly because it measures the observed binding-resource delta directly.

### Forbidden heuristics (Step 3/8) — confirmed unused as value
The only value is the observed real-engine delta in the target's binding resource (count / afford-ratio
/ ETA) between WAIT and plan branches. No `economicScore`, tier-distance, lane bonus, flat progress %,
plannerorder, round-robin, or "on the target path" number is used. Target-path membership is used
**only** to choose which meat units to *generate* plans for (causal identification), never as a score.

## 3. Proposed versioned outcome — `bounded-strategic-plan-outcome.v1`

Per bounded plan sharing identical `{activeMilestone, activeTarget, horizon, metricSchema, metricUnit}`:

```
planId, orderedCanonicalActions[], actionsCompleted, secondsWaitingForAffordability,
resourceCountsAtHorizon{}, resourceVelocitiesAtHorizon{},
targetAffordabilityBefore, targetAffordabilityAfter, targetCompletionState,
targetEtaBeforeSeconds, targetEtaAfterSeconds, targetEtaImprovementSeconds,
targetProgressAtHorizon, planFeasibility, hardBlockers[], modelConfidence
```
Unknown multipliers ⇒ `UNRANKED` / lowered confidence, never an estimated bonus.

### Global ranking (Step 6), only within one identical target/horizon/schema group
1. target completion → 2. makes target reachable → 3. largest verified target-ETA improvement →
4. largest verified target-progress at horizon → 5. WAIT. Confidence breaks a full economic tie only;
incompatible plans are `UNRANKED`.

### Execution limit (Step 7) — non-negotiable for any future port
Even when a multi-step plan wins, runtime may authorize **only `plan.actions[0]`**. After a real buy:
fresh snapshot → fresh authorization → fresh plan ranking. Track A's `authorizationId` + four-value
amount contract (`b40d3e3`, `2cd0a07`) apply to `actions[0]` exactly. Runtime must never blind-run a
stale multi-step plan.

## 4. Honest gaps before `PLAN_MODEL_PROVEN`

`PLAN_MODEL_PROVEN` requires all of: lane-sensitivity rank agreement, direction **and magnitude**
validated vs counterfactual browser data, no forbidden heuristics, determinism (same start ⇒ same
ranking), and the pathological save getting either a verified Meat plan or a proven-correct WAIT.
Status:

- **Determinism — needs hardening.** Branch numbers jitter slightly run-to-run because wall-clock time
  elapses *during* the buy sequence before the explicit `tick`. Fix: freeze the clock (drive ALL time
  only through `game.tick`, and disable the game's own heartbeat/`$interval`) so a branch is a pure
  function of `(save, plan, horizon)`. Required for the "same start ⇒ same ranking" bar.
- **Lane-sensitivity matrix — needs more save states (Step 8).** Only ONE real save is in the repo
  (the two files are byte-identical), a deep Meat state. Scenarios where Engine / Territory / WAIT each
  win need additional real saves (or captured earlier/shallower states). Cannot be manufactured from
  synthetic scores without violating B4.
- **Mutation controls (Step 8)** and the versioned schema/ranker are specified above but not yet
  implemented as committed checks.

## 5. Verdict and recommended minimal runtime port

**Verdict: `PLAN_MODEL_PROMISING_NEEDS_MORE_DATA`** — materially stronger than TRACK B: the data
blocker is retired, the real-engine counterfactual is feasible, and the core acceptance is proven on
real numbers. Not `PLAN_MODEL_PROVEN` only because of the determinism-hardening and the missing
additional save states for the lane-sensitivity matrix — both are concrete, not open-ended.

**Do NOT port yet.** When PROVEN, the recommended *minimal* runtime port is:
a versioned `counterfactual-horizon-progress` outcome that ranks bounded plans **only** within one
identical `{milestone, target, horizon, metricSchema}` group by observed target progress, authorizes
**only `actions[0]`** under Track A's existing `authorizationId` + amount contracts, and re-snapshots /
re-authorizes / re-ranks after every real buy. Deep Meat toward Lesser Hive Mind then yields either a
verified progress-making first action or an honest, evidence-backed WAIT — never a blind multi-step run.
