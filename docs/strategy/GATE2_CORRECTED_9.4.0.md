# 9.4.0 GATE 2 — corrected (runtime feasibility)

Corrective report. It does **not** modify the earlier artifacts. It re-labels them and supersedes them
with a run against the real runtime proposal/gate/coordinator chain. Harness:
`scripts/lab-9.4.0-gate2-corrected.js` (read-only, not in `verify`). Evidence:
`docs/test-data/9.4.0-plan-laboratory/gate2-corrected-default-user-save.json`.

## Re-label of the earlier GATE 2 evidence

`docs/test-data/9.4.0-plan-laboratory/gate2-bounded-default-user-save.json` and commit
`644caf5ff5cbdc8d714b66df449c1c1718529608` are re-labelled (left byte-unchanged):

```
BOUNDED_CAUSAL_PLAN_PROVEN
RUNTIME_POLICY_FEASIBILITY_NOT_PROVEN
```

## 1. Why the old GATE 2 wrongly passed

The old harness built a **synthetic parallel policy**, not the runtime's real proposals:
- It invented a Meat plan `pantheon → pantheon2` with amount `floor(maxCostMet(0.85)·25/100)`. **The runtime
  never proposes this.** The runtime's real Meat action on this save is a different unit (goddess).
- It computed `reserveRatio` and then **never gated on it** — the only refusal was a zero amount. The
  committed evidence shows `reserveRatio ≈ 4.705882 = 1/(0.85·0.25)` for every step, which is an artifact
  of the synthetic amount formula, and 4.705882 < 5 would have failed the action-unit reserve gate had it
  been enforced.
- It compared against a single generic `meatMinReserveRatio`, not the real per-planner thresholds.

So the old "runtime-safe bounded plan PASS" measured a hand-built causal sequence, not anything the
runtime can generate, authorize, and execute.

## 2. Which plan steps are legal / illegal under the real runtime

Real proposals from the actual builder (`purchaseProposalSnapshot`) on the frozen save, each with its
planner's own reserve gate:

| candidate (internalId) | plannerKind | requestedAmount | costResource | reserveRatio | requiredReserveRatio | reserveOk | paybackBypassed | milestoneState | safeEligible |
|---|---|---|---|---:|---:|---|---|---|---|
| **hive neuron (goddess)** | action-unit | 2.25e21 | neuroprophet | **5.544e7** | 5 | **yes** | yes | **NO_EFFECT** | **yes** |
| Expansion (engine upgrade) | engine-lane | 1 | territory | — | — | — | — | NO_EFFECT | no (territory threshold) |
| Hatchery (engine upgrade) | engine-lane | 1 | meat | — | — | — | — | NO_EFFECT | no (meat threshold) |
| Lepidoptera (moth) | energy-lane | 0 | energy | — | — | — | — | — | no (stop threshold) |

- The runtime's only **BUY / safeEligible** proposal is the **goddess action-unit**. Its `reserveRatio`
  is ~5.5e7, far above the action-unit threshold (5) — it is **reserve-legal** and payback-bypass legal.
- **Hive Network (pantheon2) is not proposed at all.** (Correction, recorded in
  [PLAN_GENERATOR_9.4.0.md](PLAN_GENERATOR_9.4.0.md) §1: **Neural Cluster / pantheon _is_ proposed** — as a
  safeEligible **parent-step**, the runner-up to the goddess action-unit. This corrective report examined
  only the first Meat proposal and mis-stated that pantheon is unproposed; the plan-generator trace shows
  both goddess (action-unit) and pantheon (parent-step) are emitted, and it is pantheon2 that is missing.)
- **No step is illegal on reserve.** The binding constraint is not reserve: the goddess action-unit is
  `milestoneOutcome = NO_EFFECT` (buying goddess does not touch pantheon2, the target's binding resource).

## 3. The real runtime-generated plan (DEL 2/3)

Real replan loop (budget 4): each iteration runs the actual cycle with auto-buy (which authorizes and
executes only the coordinator's `boundedCandidate`), then advances passive production and re-runs.

- **Step 1:** coordinator `recommendation = UNCERTAIN`, `boundedCandidate = null`, `executionAuthority`
  not granted. `mainActions = 0`; goddess count unchanged; pantheon2 unchanged. **Loop stops: the
  coordinator authorized no main action (WAIT).**
- There is **no Step 2** — nothing was authorized to execute in Step 1.

Confirmed independently with execution enabled (`advisorOnly=false, autoBuySafeDecisions=true`):
`mainActions = 0`, goddess unchanged — the runtime executes no main Meat action on this save.

## 4. Target progress + three plan families (DEL 4)

Target pantheon3 (lesser hive mind), binding resource pantheon2, frozen save, horizon 3600 s:

| Plan | All actions runtime-safe | Actions completed | Target progress | Stop reason |
|---|---|---:|---:|---|
| WAIT | yes | 0 | 0 | no action |
| manual causal reference (`pantheon→pantheon2`) | N/A — **not runtime-proposed** | 4 | **+1.67e9** | manual |
| **actual runtime-generated plan** | yes | **0** | **0** | coordinator authorized no main action (WAIT) |
| runtime single-action (goddess) | reserve-safe + safeEligible | 0 executed | 0 | coordinator NO_EFFECT → not authorized |

The manual reference makes real progress, but **it does not count as product proof because the runtime
plan is not permitted to execute it.**

## 5. Reserve mutation matrix (DEL 5) — all 8 controls caught

| # | control | result |
|---|---|---|
| 1 | ratio just **above** action-unit threshold → allowed | ✅ |
| 2 | ratio just **below** action-unit threshold → blocked | ✅ |
| 3 | action-unit uses `meatActionUnitMinReserveRatio` (5) | ✅ |
| 4 | parent-step uses `meatParentStepMinReserveRatio` (1.5) | ✅ |
| 5 | unlock uses `meatUnlockMinReserveRatio` (3) | ✅ |
| 6 | generic/wrong threshold (action-unit 5 forced on parent-step) detected | ✅ |
| 7 | threshold checked but ignored (always-allow) detected on a below-threshold ratio | ✅ |
| 8 | a bypass that also waives reserve (not only payback) is blocked by the reserve-respecting gate | ✅ |

## 6. Corrected verdict (DEL 6)

```
RUNTIME_SAFE_PLAN_NOT_FOUND
```

The runtime authorizes **0** main actions on this save. The Meat action-unit (goddess) is reserve-safe
and safeEligible, so the blocker is **not** the reserve policy — it is the coordinator scoring the action
`milestoneOutcome = NO_EFFECT` under `binding-resource-eta.v1` and abstaining (UNCERTAIN → WAIT).

> **Multi-step mechanism is proven, but the current safe model cannot realize it.**

Policy limits were **not** changed. The reserve thresholds are respected exactly. Realizing the proven
multi-step mechanism requires the milestone-metric upgrade (a proven `counterfactual-horizon-progress`
model), **not** lowering any reserve threshold. This is consistent with, and strengthens, the overall
laboratory verdict `PLAN_MODEL_PROMISING_NEEDS_MORE_DATA`.

## 7. Full commit SHAs

- corrected GATE 2 (this report + harness + evidence): `396e6162653babe281d42b691592b21c41c4ca61`.
- superseded old GATE 2: `644caf5ff5cbdc8d714b66df449c1c1718529608` (re-labelled, unchanged).
- GATE 1 determinism: `fecd4c75d9be8f6449cbc5b757c8a42e22da2dd4`.
