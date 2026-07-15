# Multi-Tier Meat Outcome Research (9.4.0, TRACK B, read-only)

Status: research only. No runtime code, no Meat adapter, no build/sync. Branch
`feature/9.4.0-global-execution-ownership`. This document evaluates whether a
richer, still-honest milestone-value model could value a purchase several
producer-tiers *below* the active milestone's direct binding-cost resource —
the known limitation of the current `binding-resource-eta.v1` metric.

**Verdict (B5): `MODEL_PROMISING_NEEDS_MORE_DATA`.** Reasoning at the end.

**Headline honesty statement:** the lane-dominance problem is **not**
product-solved. On the real pathological live save the deep Meat chain toward
Lesser Hive Mind can only honestly be `WAIT` under any single-purchase,
no-follow-up model — including the two richer models studied here — because of
a structural fact proven below (passive production flows *downward* while that
milestone's binding resource is *upward*). Making that purchase valuable is a
**multi-purchase planning** problem, not a single-purchase valuation-metric
problem. Nothing here authorizes calling deep Meat `GLOBALLY_BEST`.

---

## 0. What data was and was not obtainable (read this first)

This is decisive for the verdict, so it is stated up front.

**Obtainable from the repo:**
- The exact metric logic (`estimateMilestoneBottleneck`, `buildMilestoneOutcome`,
  `milestoneOutcomeIdentity`, ranking) — `dev-src/runtime-sections/runtime-main.js`
  ~lines 15121–15268.
- The exact game-API surface any model may use: `unit.count()`, `unit.velocity()`,
  `unit.eachProduction()` (via `productionPerUnit`, line 15121), `unit.eachCost()`
  / `getCostList` (line 11976), `isSameGameItem`, `getActiveMilestoneTargetItem`
  (line 2688), `buildMeatGoalPlan` (line 17656), `getUnitBottleneckCost` (17533).
- The **topology** of the meat chain, by internal id, from
  `MEAT_CHAIN_NAMES` (runtime line 464) cross-checked against
  `docs/SWARMSIM_GAME_MODEL.md` §5. This is complete and unambiguous (see B1).

**NOT obtainable from the repo (the substrate a numeric model needs):**
- **The pathological deep-Meat live save is absent.** Across **all 864**
  `*-result.json` snapshots in `docs/test-data/`, the deepest meat-chain unit
  ever captured with count > 0 is **`nest`** (tier index 2 of 14). No snapshot
  reaches `prophet`/`goddess`/`pantheon*` (Lesser Hive Mind = `pantheon3`). The
  string "goddess" appears in only 2 non-snapshot files (a scenario definition
  and a formula manifest).
- **Per-unit velocities / `eachProduction` / `eachCost` were never captured.**
  `productionBefore` and `targetEtaBefore` are populated in **0 / 864** files.
  `resourceBankBefore/After` holds *counts only* (`meat, larva, territory,
  energy, drone, queen, nest, greaterqueen, mosquito, spider, stinger,
  swarmling`). `laneProposals` carries only
  `lane/decision/candidate/reason/blockers/blockerCategories/score` — no numeric
  production state.
- **The SwarmSim production/cost formulas are not vendored.** `gameSourceUrl` is
  the live production URL `https://www.swarmsim.com/#/tab/territory`; there is no
  in-repo game engine or coefficient table.
- **The one save file present cannot be decoded here.** Both
  `docs/test-data/strategy-audit-0/default-user-save/save.txt` and
  `docs/test-data/clone-ramp/live-user-save.txt` are the *same* healthy
  (post-Nexus, "Engine wins") save, LZString-compressed
  (`MS4xLjE3|…` = version `1.1.17` + `compressToBase64` body). No `lz-string`
  / `pako` in `node_modules`; installing packages is out of scope and forbidden
  by the read-only constraints, so exact healthy-state counts are also
  unavailable.

**Consequence.** A "bit-identical counterfactual simulation" (Model 3) cannot
be made *bit-identical or verified against the real engine* from available data:
we have neither the pathological state nor the real formulas. Every number in
§B2/B3 therefore comes from an **explicitly constructed, SwarmSim-*shaped*
scenario**, clearly labelled as such, used to test *model discrimination and
structural behavior* — not to report live outcomes. The verdict is bounded by
this honestly.

---

## B1. The production graph (topology from source of truth)

Internal ids are `unit.name` (from `MEAT_CHAIN_NAMES`, runtime line 464). UI
names and the "produces" relation are from `docs/SWARMSIM_GAME_MODEL.md` §5. The
cost relation (each tier costs the tier directly below + meat, and *produces the
same tier it costs*) is confirmed by the runtime payback logic
`productionPerUnit(unit, costUnit.name)` in `getMeatChainPurchaseAnalysis`
(runtime line 17273): a meat-chain unit's payback is computed against the very
resource it costs, i.e. it produces its own cost-tier.

| idx | internal id | UI name | produces (passive, DOWN) | direct cost inputs |
|----:|-------------|---------|--------------------------|--------------------|
| 0 | `drone` | Drone | meat | meat |
| 1 | `queen` | Queen | drones | drones + meat |
| 2 | `nest` | Nest | queens | queens + meat |
| 3 | `greaterqueen` | Greater Queen | nests | nests + meat |
| 4 | `hive` | Hive | greater queens | greater queens + meat |
| 5 | `hivequeen` | Hive Queen | hives | hives + meat |
| 6 | `empress` | Hive Empress | hive queens | hive queens + meat |
| 7 | `prophet` | Neuroprophet | hive empresses | hive empresses + meat |
| 8 | `goddess` | Hive Neuron | neuroprophets | neuroprophets + meat |
| 9 | `pantheon` | **Neural Cluster** | hive neurons (`goddess`) | `goddess` + meat |
| 10 | `pantheon2` | **Hive Network** | neural clusters (`pantheon`) | `pantheon` + meat |
| 11 | `pantheon3` | **Lesser Hive Mind** (TARGET) | hive networks (`pantheon2`) | `pantheon2` + meat |
| 12 | `pantheon4` | Hive Mind | lesser hive minds (`pantheon3`) | `pantheon3` + meat |
| 13 | `pantheon5` | Arch-Mind | hive minds (`pantheon4`) | `pantheon4` + meat |

**Two directions that matter (this is the crux of the whole report):**
- **Passive production flows DOWNWARD only.** Owning `pantheon3` (Lesser Hive
  Mind) passively yields `pantheon2`; owning `pantheon2` yields `pantheon`; …;
  `drone` yields `meat`. Nothing flows upward.
- **Buying tier N consumes tier N-1 (upward acquisition).** To *buy* more
  `pantheon2` you spend `pantheon` + meat; to buy `pantheon3` you spend
  `pantheon2` + meat.

**For the active milestone target `pantheon3` (Lesser Hive Mind):**
- Direct binding-cost resource = whichever of `{pantheon2, meat}` the target is
  furthest from affording (`estimateMilestoneBottleneck` picks max-ETA cost).
- The **only** passive producer of `pantheon2` (the upward binding resource) is
  `pantheon3` **itself**. If you own zero Lesser Hive Minds, the `pantheon2`
  binding resource has **zero velocity → ETA = ∞ → UNREACHABLE**.
- `pantheon` (Neural Cluster) produces `goddess` (downward), **not** `pantheon2`.
  `productionPerUnit(pantheon, "pantheon2") = 0`. It is 2 tiers *below* the
  binding resource on the acquisition path.

**Data not obtainable per the task's B1 request:** current `count`, current
`velocity`, per-unit `eachProduction`/`eachCost` *magnitudes*, and "distance to
active target" *in real units* for the live pathological save. These require the
live save and/or the game formulas, both absent (see §0). The *relationships*
above are exact; the *numbers* below are constructed.

---

## B2 / B3. Three-model comparison — methodology and results

### Models

- **Model 1 — `binding-resource-eta.v1` (baseline).** Re-implemented exactly:
  `estimateMilestoneBottleneck` finds the max-ETA cost of the target; a purchase
  is valued only via (a) `productionPerUnit(bought, bindingResource)` (velocity
  boost to the binding resource) and (b) the amount of binding resource the buy
  *spends*. `touchesBinding = rateBoost>0 || spent>0`; otherwise `NO_EFFECT`.
- **Model 2 — bounded multi-tier propagation.** Apply the one purchase at t=0,
  then integrate **passive** dynamics only (forward Euler, dt=1s, `dN_belowTier
  += coeff·N_tier·dt`, `meat += coeff·N_drone·dt`), **no follow-up buys**.
  Measure the target's binding resource `count`, `velocity`, and affordability
  ETA at horizons **300 / 1800 / 3600 s**.
- **Model 3 — counterfactual (WAIT vs BUY).** From one immutable snapshot, run
  Branch WAIT and Branch buy through the *same* integrator (passive only, no
  follow-up buys, no casts/upgrades/offline). Report `waitEta`, `buyEta`,
  `etaImprovement`, and `deficitClosed` (binding-resource deficit reduced).
  Deterministic *within this constructed model*; **not** bit-identical to the
  real engine.

Simulator: `scratchpad/multitier-sim.js` (read-only; not committed). Full raw
output: `scratchpad/sim-output.txt`. Numbers below are **constructed**.

### Scenario P — pathological shape: upward binding UNREACHABLE

Target `pantheon3`; own **0** Lesser Hive Minds ⇒ binding resource `pantheon2`
has velocity 0, deficit 3 (have 5, need 8), ETA = ∞. (This is the structural
shape of the real live save's "M6 UNCERTAIN → WAIT".)

| Candidate | Model 1 | Model 3 (all horizons) | Correct? |
|-----------|---------|------------------------|----------|
| Neural Cluster (`pantheon`) ×1 — 2 tiers below binding | `NO_EFFECT`, value 0 | `deficitClosed 0`, `etaImp 0` | ✔ genuinely no help |
| Hive Network (`pantheon2`) ×1 — **is** the binding unit | `NO_EFFECT`, value 0 | `deficitClosed 1`, ETA still ∞ | ✗ M1 misses the count progress M3 sees |
| Hive Network (`pantheon2`) ×3 — **closes the deficit** | `NO_EFFECT`, value 0 | `deficit → 0`, `buyEta 0`, **COMPLETION** | ✗ **M1 fails to see a milestone-COMPLETING buy** |
| Drone ×1 — deep meat producer | `NO_EFFECT`, value 0 | `deficitClosed 0`, `etaImp 0` | ✔ no help |

**Key discrimination result:** Model 1 assigns identical `NO_EFFECT` to a
purchase that *literally completes the milestone* (Hive Network ×3) and to one
that does nothing (Neural Cluster). Model 3 distinguishes them
(`COMPLETION` vs 0) on affordable, legitimate buys. This is the strongest,
cleanest evidence that the counterfactual direction fixes a real Model-1
blind spot — Model 1 cannot value directly *acquiring* the binding resource,
only boosting its velocity or spending it.

**But** note the equally important negative result: buying **Neural Cluster**
(the motivating deep purchase) is `deficitClosed 0 / etaImp 0` in **all** models
at **all** horizons. Under the "no follow-up buys" rule its passive output flows
*downward* (to `goddess`, …, meat) and can never raise `pantheon2`, which is
*upward*. The richer models do **not** rescue the deep-Neural-Cluster→Lesser-Hive-
Mind case. Only a *multi-purchase* plan (buy Neural Clusters → then Hive Networks
→ then Lesser Hive Mind) — i.e. the meat goal planner's parent-step conversion —
justifies it, and that is outside any single-purchase metric.

### Scenario M — meat is the binding resource (shallow target, no deep cascade)

Target `greaterqueen`; `pantheon2`-equivalent cost affordable, **meat binds**
(have 1e6, need 2e6, velocity 20/s, ETA 50000 s). Isolates one purchase's
marginal meat effect with no deep stock swamping the horizon.

| Candidate | tiers above meat | Model 1 value (s) | Model 3 @300s `etaImp` / `deficitClosed` |
|-----------|-----------------:|------------------:|------------------------------------------|
| Drone ×2000 | 1 (direct meat producer) | **+47571** | +99.4 / 100000 |
| Queen ×10 | 2 | **−20** | +16.4 / 8255 |
| Nest ×1 | 3 | **−10** | +17.5 / 5074 |
| Neural Cluster ×1 | 9 (unaffordable) | −500000 | (flagged unaffordable) |

**Key discrimination result:** Model 1 gets the *sign* right only for the
one-tier producer (Drone). It scores **Queen and Nest negative** — they merely
*spend* meat in `eachCost`, and Model 1 cannot see that they raise drone→meat
output over time — whereas Model 3 correctly gives them **positive** meat
contribution (`deficitClosed` 8255, 5074). This is the downward multi-tier gap:
Model 1 systematically undervalues 2–3-tiers-above-the-binding producers.

**Two cautions this scenario also exposes:**
1. **Model 1's ETA *magnitude* is unreliable even when its sign is right.** Drone
   scores `+47571 s` in Model 1 but only `+99 s` in the bounded counterfactual —
   Model 1 linearly extrapolates deficit/newRate to the target and ignores that
   other production (and the target) also ramps; its cardinal value is not a
   trustworthy shared magnitude.
2. **Horizon washout.** By 1800 s every candidate (and WAIT) self-completes in
   this scenario; the marginal signal exists only at the short horizon. The
   "value" of a purchase is highly horizon-sensitive.

### Engine candidate and WAIT

- **Engine** (Expansion, binding `territory`, a *one-tier* target): Model 1
  scores it correctly (`+600 s` improvement in the constructed case), because the
  binding resource's producer is exactly one `eachProduction` hop away. **Model 1
  handles Engine well and only fails on Meat depth** — precisely matching the
  observed behavior (Engine wins on the healthy save; deep Meat = `NO_EFFECT` →
  `WAIT`).
- **WAIT**: no purchase; Model 1 emits no value; Model 3 `etaImprovement = 0`,
  `deficitClosed = 0` by definition — the honest baseline every candidate is
  compared against.

### Can the model distinguish the three product questions?

- **"Engine helps most"** — yes, Model 1 already does (one-tier target).
- **"No candidate helps enough"** — yes; Scenario P shows all models agree WAIT
  when nothing creates upward binding-resource progress.
- **"Meat helps most"** — *partially, and only the counterfactual model*: Model 3
  correctly values (a) directly acquiring the binding resource unit and even a
  milestone-completing multiple of it (Scenario P), and (b) multi-tier-downward
  meat producers when meat binds (Scenario M) — both of which Model 1 misvalues.
  It does **not** value the deep upward-path purchase (Neural Cluster toward
  Lesser Hive Mind) under the no-follow-up-buys rule, because that is a
  multi-purchase plan, not a single-purchase outcome.

---

## B4. Forbidden shortcuts — explicit confirmation

None of the following was used as economic value anywhere in the models or the
simulator: tier-distance score, flat progress %, local `economicScore`, lane
bonus, hand-written Meat priority, "purchase is on the target path" as a numeric
value, or round-robin. Every value reported is one of: (i) binding-resource
affordability ETA in seconds (Model 1, unchanged), (ii) integrated passive
production of the *actual* binding resource over an explicit horizon (Model 2),
or (iii) a WAIT-vs-BUY counterfactual difference in the binding resource's
deficit / ETA (Model 3). Target-path membership is used **only** to identify
which resource is the target's binding cost (causal identification), never as a
score. Purchases that cannot be paid for are flagged `affordable:false` rather
than credited.

---

## B5. Verdict — `MODEL_PROMISING_NEEDS_MORE_DATA`

Chosen over `MODEL_PROVEN` and over `MODEL_REJECTED` / `NO_HONEST_MODEL_YET` for
these reasons:

**Why not `MODEL_PROVEN`.** Proof requires the real pathological live save and
the real SwarmSim production/cost formulas; both are absent from the repo
(§0: deepest captured meat unit = `nest`; velocities never captured;
formulas not vendored; the one save is undecodable here). Every numeric result
is from a constructed, SwarmSim-shaped scenario. A model that will gate live
purchases must not be called proven on constructed data.

**Why not `MODEL_REJECTED` / `NO_HONEST_MODEL_YET`.** The counterfactual
direction (Model 3) demonstrably and honestly fixes two concrete Model-1
blind spots, on affordable buys, using only real game-API quantities:
1. it values *directly acquiring* the binding resource — including a
   milestone-**completing** purchase that Model 1 reports as `NO_EFFECT`
   (Scenario P); and
2. it gives the correct *sign* to multi-tier-downward meat producers that
   Model 1 scores negative (Scenario M).
These are real, reproducible improvements, so an honest richer model plausibly
exists — it just is not yet substantiated on live data.

**Load-bearing caveats that must travel with this verdict:**
- The multi-tier / counterfactual model, **as specified (single purchase, no
  follow-up buys)**, does **not** make the deep Neural-Cluster→Lesser-Hive-Mind
  purchase valuable. That case is structurally a **multi-purchase completion /
  planning** problem (passive flow is downward, the binding resource is upward).
  A single-purchase valuation metric is the wrong tool for it; do not expect any
  version of this model to turn deep Meat into `GLOBALLY_BEST` on the real save.
- Horizon valuation is **non-monotonic and ill-conditioned**: the downward
  cascade is polynomial in time (`t^k` for a k-tier drop), so deep stock floods
  meat over long horizons and candidate rankings flip with the horizon choice.
  Any future schema must fix a justified horizon and be tested for
  horizon-stability, or it will be gameable/unstable.
- Model 1's ETA *magnitude* is itself an unreliable cardinal value (Scenario M);
  a successor should prefer discrete states + counterfactual deltas over linear
  ETA extrapolation.

**What "more data" concretely means before this could advance toward PROVEN:**
1. Capture ≥1 real deep-Meat live snapshot (reach `pantheon2`/`pantheon3`) with
   **per-unit** `count`, `velocity`, `eachProduction`, `eachCost` — the existing
   testbed (`scripts/strategy-audit-testbed-core.js`) would need to serialize the
   full unit graph, which it currently does not.
2. Obtain the real SwarmSim production/cost coefficients (or a verified vendored
   engine) so a counterfactual integrator can be validated as deterministic
   against the actual game, not a constructed proxy.
3. Decide the horizon and prove horizon-stability of rankings on real data.
4. Separately, scope the deep-Meat advancement as a **multi-step plan-value**
   metric (sequential parent-step conversion), which the single-purchase
   `binding-resource-eta.v1` and both richer single-purchase models cannot
   express.

Until all of the above exist, the current honest behavior — deep Meat toward
Lesser Hive Mind resolves to `NO_EFFECT → UNCERTAIN → WAIT` — remains **correct
for the shipped model**, and the lane-dominance problem remains **not
product-solved** for the real live save.
