# 9.4.0 — Prove the Bounded Plan Model (final report)

Read-only laboratory. No runtime change, no version bump, no merge. Harness:
`scripts/lab-9.4.0-plan-model.js` (`--gate 1|2|56|all`; not part of `verify`). Evidence:
`docs/test-data/9.4.0-plan-laboratory/`.

## Verdict (GATE 7): `PLAN_MODEL_PROMISING_NEEDS_MORE_DATA`

Everything provable without additional saves is proven. The **only** unmet `PLAN_MODEL_PROVEN`
requirement is a *complete* lane-sensitivity matrix, and that is blocked by a **data** gap (no
Engine-binding or Territory-binding real save exists in the repo or its full git history, and neither
can be legally derived from the one saturated late-game save) — not by any model or heuristic gap.

> **Correction (2026-07-16):** the original GATE 2 claim below (row 2) was **retracted** — see
> [GATE2_CORRECTED_9.4.0.md](GATE2_CORRECTED_9.4.0.md). The old GATE 2 tested a synthetic plan the runtime
> never proposes and never enforced the reserve gate. Against the **real** runtime the coordinator
> authorizes **0** actions on this save (verdict `RUNTIME_SAFE_PLAN_NOT_FOUND`). This does not weaken the
> overall verdict — it makes the "deep Meat → WAIT" finding stronger and confirms the blocker is the
> NO_EFFECT milestone metric, not the reserve policy.

| PLAN_MODEL_PROVEN requirement | status |
|---|---|
| full determinism | ✅ GATE 1 |
| ~~runtime-safe bounded Meat plan gives progress (not only buyMax)~~ | ❌ **RETRACTED** → `RUNTIME_SAFE_PLAN_NOT_FOUND` (GATE 2 corrected): runtime authorizes 0 actions; multi-step mechanism proven but not runtime-realizable under the current NO_EFFECT metric |
| lane-sensitivity matrix green | ⚠️ Meat-wins + WAIT-wins ✅; Engine-wins + Territory-wins = MISSING_DATA |
| order-invariant ranking | ✅ GATE 5 |
| mutation controls green | ✅ GATE 6 |
| no buyMax required for the winning result | ✅ GATE 2 |
| first action compatible with Track A authorization/amount contract | ✅ GATE 2 (command == authorized) |

## 1. Determinism results (GATE 1)

Each branch is a pure function `simulate(save, plan, horizon)`: `window.Date` is frozen to
`FIXED = save.date.saved` (2026-07-14T00:02:09.201Z, derived from the save → session-independent), the
session heartbeat is stopped, and passive production advances only via explicit
`game.tick(new Date(FIXED + horizon·1000))`. `importSave` under the frozen clock ticks
`date.reified → FIXED` (~0 ms), so the start is the exact as-saved state, no wall-clock offline.
**Acceptance:** 10 runs of the same `(save, plan, horizon)` are **byte-identical** (string-exact
Decimals) for both WAIT and the 2-step Meat plan. **Mutation control:** the unfrozen clock yields 10
distinct results. Evidence: `gate1-determinism-default-user-save.json`.

## 2. All found save fixtures (GATE 3)

Exhaustive search of the working tree **and full git history** (`git grep -F Q2hlYXRlci` — the swarmsim
save "Cheater :(" wrapper — across every ref; plus all `*save*` paths ever added):

| fixture | blob | phase | active target | importable | usable for |
|---|---|---|---|---|---|
| `docs/test-data/clone-ramp/live-user-save.txt` (≡ untracked `strategy-audit-0/default-user-save/save.txt`) | `2198a6f8` | deep late-game Meat (meat≈9e156, pantheon2 present) | pantheon3 (lesser hive mind) | **yes** | Meat, WAIT |

Everything else that pattern-matches "save" in history is a captured **state snapshot** (schemaVersion /
snapshot / strategyInspector — e.g. `live-real-save-*-2026-07-10.json`, `browser-test-0.10.0-loaded-
save-export.json`), **not** a re-importable swarmsim save. There is exactly **one** importable save, and
it is a saturated Meat state. No Engine-binding or Territory-binding importable save exists.

GATE 4 (legal derivation): a lane fixture may only be derived via real commands + explicit `game.tick` +
legal purchases + real export. From the one saturated save this is **infeasible** — you cannot legally
regress to an early/mid state (no un-buy; only a full ascension reset, which is not a clean targeted
fixture), and no target on the saturated save binds on Engine/Territory-affected resources
(meat/larva/territory are all abundant). So Engine/Territory fixtures cannot be manufactured.

### 2b. Second real fixture (user-provided, 2026-07-16)

A second importable save was supplied: blob `d6e7efb`, `date.saved` 2026-07-15T23:21Z — an **even deeper
late-game Meat state** (meat≈8.1e166; pantheon2≈1.3e20; **pantheon3 / lesser hive mind is buyable =
completable**; expansion=304, hatchery=165 both maxed). Still Meat-phase; meat/larva/territory all
abundant, so **not** Engine- or Territory-binding. Cross-fixture results:
- **GATE 1 determinism generalizes**: 10 frozen runs byte-identical for both WAIT and the 2-step plan;
  unfrozen = 10 distinct. Evidence `gate1-determinism-user-save-2.json`.
- **GATE 2 generalizes**: the runtime-safe bounded 4-action plan again gives positive pantheon2 progress
  with every amount contract satisfied. Evidence `gate2-bounded-user-save-2.json`.
- **Ranker tracks real progressability, not lane, across both saves**: on this deeper save pantheon3 is
  completable and pantheon4 is *progressable* (buying pantheon3 raises pantheon4's binding resource), so
  the ranker correctly makes **Meat** win at pantheon4 too — whereas on the shallower save pantheon4 was
  unprogressable and **WAIT** won. WAIT only emerges at a genuinely unprogressable target (here
  pantheon5 / arch-mind). This is strong evidence the ranker is progress-driven and unbiased.

Both user saves are late-game Meat. An Engine-binding or Territory-binding milestone exists only in
**early game**, and neither save is such a state.

### 2c. Why fresh-game self-derivation is blocked (attempted 2026-07-16)

A fresh swarmsim game (empty localStorage) is a legal early state (meat=35, larva=17, drone buyable).
Two concrete blockers prevent deriving Engine/Territory fixtures from it within the lab's constraints:
1. **The 9.4.0 coordinator abstains on early states.** Driving the fresh game with the real bot
   (`kbcSwarmBot.runOnce()` in auto-buy mode) for 120 cycles bought **nothing** — the DEL 3 honest-WAIT
   ownership refuses to execute when the milestone metric cannot rank the early action. That is the
   intended lane-dominance fix, but it means the bot will not auto-advance a fresh game.
2. **The active target is exposed only as display text** (`"Meat-chain target: drone; current action:
   drone."`), not an internal id + binding resource. Honestly asserting "this is THE active milestone and
   Engine/Territory objectively wins" needs the runtime's `getActiveMilestoneTargetItem`, which is not on
   the lab's public API; exposing it is a runtime change (out of scope for this piece).

Deriving the two early fixtures is therefore possible only via a **manual command-by-command early-game
progression driver** (real `commands.buyUnit`/`buyUpgrade` + explicit `game.tick`, choosing the early
build order by hand until territory / larva-production binds, then real export) — a sizable separate
build, not a derivation from the available saves.

## 3. buyMax vs runtime-safe bounded Meat (GATE 2)

Target pantheon3 (lesser hive mind), binding resource pantheon2 (hive network, velocity 0), horizon
3600 s, all deterministic:

| plan | pantheon2 progress | amount policy |
|---|---:|---|
| WAIT | 0 | — |
| bounded **single** Neural Cluster (pantheon) | 0 (`NO_EFFECT` — produces goddess) | bounded |
| bounded **single** Hive Network (pantheon2) | +4.06e7 | bounded |
| **bounded runtime-safe 4-action plan** (replanned each step) | **+2.44e8** | `floor(maxCostMet(0.85)·25%)`, budget 4 |
| buyMax mechanical upper bound | +1.67e9 | reference only |

The runtime-safe bounded plan (~15 % of the buyMax upper bound) produces **verified positive** target
progress, and **every executed action's amount contract holds** (`commandRequestedAmount ==
authorizedRequestedAmount`), so its first action is Track A-authorizable. The model is therefore
runtime-provable, not buyMax-dependent. Evidence: `gate2-bounded-default-user-save.json`.

## 4. Lane-sensitivity matrix (GATE 5)

Real-engine, deterministic, shared `{target, horizon, schema}` per scenario, bounded safe amounts:

| scenario (target) | Meat | Engine | Territory | Energy | WAIT | winner |
|---|---:|---:|---:|---:|---:|---|
| **Meat-wins** (pantheon3) | +2.44e8 | — | 0 | 0 | 0 | **Meat** ✅ |
| **WAIT-wins** (pantheon4, binding pantheon3=0 unbuyable) | 0 | — | 0 | — | 0 | **WAIT** ✅ |
| **Engine-wins** | — | — | — | — | — | **MISSING_DATA** |
| **Territory-wins** | — | — | — | — | — | **MISSING_DATA** |

Meat wins the Meat scenario purely because it is the only plan that moves the target's binding resource;
Territory/Energy real actions yield 0 against that target. WAIT wins when no plan gives meaningful
improvement. Order-invariance: shuffling the plan list keeps the winner. Evidence:
`gate56-lane-sensitivity-default-user-save.json`.

## 5. Ranker results (GATE 6)

`bounded-strategic-plan-outcome.v1` (pure function): within one identical `{target, horizon, schema}`
group, rank by **completion > makes-reachable > largest verified ETA improvement > largest verified
target-progress at horizon > WAIT**; confidence breaks a full economic tie only; incompatible groups →
`UNRANKED`. No `economicScore`, lane bonus, planner order, or fairness rule. It ranks the Meat scenario
`[Meat(2.44e8), WAIT(0), Territory(0), Energy(0)]` and the WAIT scenario to `WAIT`.

## 6. Mutation controls (GATE 6) — all caught

| mutation | detection |
|---|---|
| reintroduce local `economicScore` (favouring Territory) | ranker that lets it dominate flips winner to Territory; honest ranker keeps Meat ✅ |
| pick lane by planner order | first-listed lane ≠ progress winner ✅ |
| buyMax instead of bounded amount | buyMax amount ≠ runtime bounded amount ✅ |
| change amount after authorization | `commandRequestedAmount ≠ authorizedRequestedAmount` → contract violated ✅ |
| drop an intermediate Meat step | verified progress drops below the full plan ✅ |
| reuse a stale plan | Track A `STALE_AUTHORIZATION` (`check-9.4.0-authorization-amount-contract`) ✅ |
| enable heartbeat / wall-clock leakage | GATE 1 unfrozen mutation control (non-identical) ✅ |
| change plan evaluation order | winner **invariant** (positive control) ✅ |

## 7. Full commit SHAs

Laboratory (this work piece):
- GATE 1 determinism `fecd4c75d9be8f6449cbc5b757c8a42e22da2dd4`
- GATE 2 bounded runtime-safe `644caf5ff5cbdc8d714b66df449c1c1718529608`
- GATE 5/6 ranker + matrix + mutations `77aa364227ed74e03a1dc99d7bd8b533fea96389`
- (Step 1 + real-engine counterfactual crux, prior) `fcb104b6c0ec8e79a029326750273cc74d8069ed`

Track A / TRACK B (context):
- stale-authorization `b40d3e3d427b2e4315ff851dd28e91c7ca4e8863`
- amount contract `2cd0a07b8cd1cf5df7e0adf078eb51ab39726df6`
- mutation controls `14087ab1acdb850d98bcc4dbcff237fa178cd231`
- TRACK B research `42e9fdda4ba88ab5ffa8249d5027ed2d7279f805`

## 8. Exact remaining data need

Two real, importable swarmsim saves (exported via the game's own save/export, `MS4…|Q2hlYXRlci…`
format), each captured with the per-unit mechanic export already in `lab-9.4.0-plan-model.js`:

1. **Engine-binding save** — a state whose active milestone's binding cost resource is improved more by
   a larva-engine upgrade (Expansion / Hatchery) than by any Meat action. Concretely: an early/mid-game
   state where meat or larva production (not a deep meat tier) is the milestone bottleneck, so a Hatchery
   / Expansion buy shortens the target ETA. (The saturated save has no such target.)
2. **Territory-binding save** — a state whose active milestone binds on **territory** (e.g. an Expansion
   target inside its save window with a slow real territory rate and low territory bank), so a Territory
   army-seed buy gives measurable target-ETA improvement.

With these two saves the Engine-wins and Territory-wins rows can be filled by the existing GATE 5/6
harness (no new code), completing the matrix and enabling a `PLAN_MODEL_PROVEN` re-evaluation.

**Update (2026-07-16):** two importable saves have now been supplied and both are late-game Meat states
(§2b) — neither is Engine- or Territory-binding, and such states cannot be derived from them (§0). A
fresh-game self-derivation is blocked by the coordinator's early-state abstention and the text-only
active-target exposure (§2c). So the remaining need is specifically **an early/mid-game save** where the
active milestone binds on **territory** (a Territory army-seed buy shortens the target ETA) and one where
it binds on **larva/meat production** (a Hatchery/Expansion buy shortens it). The alternative path is to
**authorise a manual early-game progression driver** (real commands + ticks) to construct both fixtures
in-lab; that is a separate build, not covered here.

## 9. Recommended minimal runtime port (only after PROVEN)

Do **not** port yet. When the matrix is green, the minimal port is a versioned
`counterfactual-horizon-progress` outcome that:
- ranks bounded plans **only** within one identical `{milestone, target, horizon, metricSchema}` group
  by verified target progress / ETA (the GATE 6 order), with **no** economicScore / lane bonus;
- generates plan candidates from target-path membership (causal identification only, never as value);
- authorizes **only `plan.actions[0]`** under Track A's existing `authorizationId` + four-value amount
  contracts, then re-snapshots, re-authorizes and re-ranks after every real buy — never blind-running a
  stale multi-step plan;
- falls back to an honest, evidence-backed WAIT when no bounded plan gives meaningful progress.

Deep Meat toward Lesser Hive Mind then yields either a verified progress-making first action (bounded,
Track A-authorized) or a proven-correct WAIT — the shipped-model pathology resolved without any forbidden
heuristic.
