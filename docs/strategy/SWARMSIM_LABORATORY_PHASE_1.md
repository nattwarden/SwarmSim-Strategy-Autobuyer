# SwarmSim Laboratory Phase 1

Status: 0.12.3 Phase 1A snapshot foundation plus live effective-count and reason-propagation hardening.

## Current disposition (2026-07-23)

Phase 1 and Phase 2A remain useful, verified, version-scoped Laboratory
contracts. They are not the complete current strategy-testing system and
should not be expanded in place or interpreted as a global recommendation
engine.

The canonical testing objective, next-click protocol, three-surface evidence
model, hard boundaries, and complete-coverage L1--L6 development direction now live in
`docs/BOOK-04-strategy-intelligence-findings.md` under:

- `Canonical strategy-testing protocol`
- `Laboratory disposition and development direction`

The accepted direction is **keep and extend** until every canonical DT decision
test is runnable through Laboratory. Begin with a read-only decision
snapshot/candidate manifest, then add disposable cloned-save branch execution
instead of attempting to encode the entire game in one simulator. Preserve the
immutable snapshot, player-save non-mutation, formula provenance, explicit
uncertainty, and development gates. Add new versioned experiment schemas rather
than changing the meaning of the Phase 1/2A results described below.

The implementation program, required LD test-data catalog, slice boundaries,
and verification gates are canonical in
`docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` under
`Laboratory Complete Decision Coverage program (LC)`. The selected LC-1 work
package is canonical in `docs/strategy/BOOK00_CURRENT_STATUS.md`.

### LC-1 capture mapping (2026-07-23)

LC-1 deliberately captures the existing runtime verdict rather than producing
another planner. The mapping is therefore one-way and read-only:

| Decision-snapshot field | Runtime source | Honest limitation retained in the schema |
| --- | --- | --- |
| phase, milestone, target, verdict and declared horizon | `strategyInspector`, `getCurrentStrategyIdentity(...)`, and the existing six-domain coordinator snapshot | A missing inspector becomes an explicit `UNMODELED` verdict; capture never runs a planner merely to fill it. |
| action budget and executed main actions | `strategyInspector.maxMainActions`, `globalMainActionBudget*`, and `executedMainActions` | The capture reports the most recently observed cycle; it does not create a new cycle. |
| lane proposals, BUY/HOLD identity, reason, blockers, amount, cost and reserve | `laneCandidates`, `summarizeLaneCandidates()`, and each row's existing `wouldBuyAmount`, `resource`, `reserveAfter`, and sanitized `raw` metrics | Legacy candidate rows lack a stable per-main-path origin and may lack a numeric cost/reserve. LC-1 records those fields as `UNMODELED`, never invents them. |
| main-cycle path coverage | `MAIN_CYCLE_COVERAGE_PATHS` and `strategyInspector.mainCycleCoverage` / `buildMainCycleCoverageLedger()` | A path without current-cycle applicability evidence is emitted as `UNMODELED`; this is a coverage gap, not a negative result. |
| complete visible Army roster | the live `game.unitlist()` filtered to visible Territory/army units, with runtime count, buyability and territory production | This roster is broader than the 11 House-of-Mirrors rows and preserves visible zero-count families. |
| formula provenance | the immutable base Laboratory snapshot's `formulaProvenance` and its source hash | LC-1 does not introduce formula claims; candidate-only values retain their runtime-observability provenance. |

The resulting schemas are `swarmsim-lab.decision-snapshot.v1` and
`swarmsim-lab.candidate-manifest.v1`. They are capture-only contracts: no
candidate is executed, ranked, re-scored, or used as production authority by
this slice.

#### Implemented LC-1 surface (intermediate, 2026-07-23)

The development-only API now exposes:

- `laboratory.captureDecisionSnapshot(...)` for a deterministic scenario or,
  with both existing Laboratory gates enabled, a live read-only capture;
- `laboratory.captureLiveDecisionSnapshot(...)` for the explicit live form;
- `laboratory.validateDecisionSnapshot(...)`,
  `exportDecisionSnapshotJson(...)`, `exportDecisionSnapshotMarkdown(...)`,
  and `getLastDecisionSnapshot()` for inspection and export.

The capture embeds the existing immutable Phase 1/2A-compatible state snapshot
as `stateSnapshot`; it does not change that schema or its exports. It emits the
complete visible Territory/Army roster from `game.unitlist()`, including
zero-count families, and deep-freezes the finished decision evidence.

The first LC-1 focused browser check is
`npm run check:laboratory:decision-snapshot`. It verifies fixture and live
read-only capture, deterministic hashing, existing Strategy Inspector parity,
all 11 current main-cycle coverage paths, visible zero-count Army families,
formula-provenance retention, deep immutability, and source/run-history
non-mutation. It also exercises the LD-05 focused data explicitly: it imports
the retained real player save
`docs/test-data/player-saves/manual-play-active-chain-pre-ascension-2026-07-18.txt`
(hash-pinned), captures a read-only decision snapshot against that real
economy, and reasserts capture validity, deep immutability, schema identity,
a non-empty visible Army roster, formula provenance, and both source-state and
run-history non-mutation. It is a development check until the required
exact-SHA verification protocol is completed.

`npm run verify:laboratory:decision-snapshot` is the corresponding declared
evidence generator. It writes only the LC-1 paths named in the delivery
runbook and must not run before the LC-1 implementation commit has been pushed
and re-synchronized to its exact SHA.

On 2026-07-24 the LC-1 check, build check, guardrails, and a prior complete
non-evidence chain were green. Later full-chain retries were blocked before
LC-1 by the pre-existing 0.12.3 live browser verifier timing out during its
60-second navigation to SwarmSim; its isolated run remained green. This is
recorded as external browser/site availability, not evidence of a Laboratory
behavior change, and no evidence generator was run from the dirty worktree.

Known bounded gap retained intentionally: the current legacy main-cycle ledger
records path dispositions and candidate decisions but not a stable
path-to-candidate ID. LC-1 reports that link as `UNMODELED` in every affected
coverage row rather than assigning one heuristically. LC-2 or a later narrow
observability package may add an origin ID only after proving it does not alter
planner behavior.

### LC-2 disposable cloned-save branch backend (2026-07-24)

LC-2 adds real bounded command execution against a save restored into the live
game, never against the player's source save. The development-only API exposes
`laboratory.runDisposableBranchExperiment({ sourceSave, branches })`,
`laboratory.getLastBranchResult()`, and
`laboratory.validateBranchResult(...)`. The result schema is
`swarmsim-lab.branch-result.v1`.

Isolation model (`sequential-single-instance`): one browser page holds one game
instance, so sibling sandbox branches are proven sequentially. For every branch
the backend restores the source with `game.importSave(...)`, records the raw
pre-reification state hash, executes exactly one bounded command through the
same `buyUpgradeAmount`/`buyUnitAmount` path as production (never `buyMax`), and
after all branches re-restores the source and proves its raw state is unchanged.
The bot's own automation is quiesced (`config.enabled=false`) for the duration
and restored afterward, so no background cycle buys into a sandbox.

Timing model (`live-site-nonhermetic-raw-state`): SwarmSim units reify continuous
production against the wall clock, and a days-old save triggers large offline
reconciliation, so `unit.count()` is never bit-identical across restores. The
fingerprint therefore reads the raw `session.state.unittypes` written by
`importSave` before any getter or command reifies it - the deliberate,
controlled offline-reconciliation point. This makes restore identity and source
non-mutation deterministic on the live site. It does **not** claim fully hermetic
timing: because executing a command reifies live production, per-branch
post-command whole-state is intentionally not asserted bit-identical. Fully
hermetic sibling timing needs the pinned local game build (RH-4 Outcome 2), which
is not yet available; per the delivery runbook's LC-2 caution the live-site
dependency is retained and no hermetic-timing claim is made.

Verified by `npm run check:laboratory:branch-backend`: identical raw-state
restore for every sibling, a bounded upgrade command with agreeing
requested/command/confirmed/observed amounts (the four-value contract), the
executed branch mutating only its own sandbox, explicit rejection of an illegal
(unresolved-target) command, and raw source-state non-mutation across all
branches - exercised on both the hash-pinned LD-05 real save and an LD-00
clean-start source captured via `session.exportSave()`.
`npm run verify:laboratory:branch-backend` is the declared evidence generator.

Remaining LC-2 data coverage (bounded follow-up, not asserted yet): LD-04 Twin
Queen reserve boundaries and LD-16 exact-target/decimal/stale-button edges, and
any fully hermetic timing once the local build lands.

### LC-3 Engine one-click tournament and independent evaluator (2026-07-24)

LC-3 builds the first strategy comparison on top of the LC-2 branch backend. The
development-only API exposes
`laboratory.runEngineTournament({ sourceSave, phaseTarget })`,
`laboratory.getLastEngineTournament()`, and
`laboratory.validateEngineTournament(...)`; the result schema is
`swarmsim-lab.engine-tournament.v1`.

For each Engine candidate (`BUY_EXPANSION`, `BUY_HATCHERY`, the optional
achievement-based larva upgrade) and `HOLD`, the tournament restores the source
into a disposable branch, measures the larva production rate before and after one
bounded click, and records the larva-rate delta and percentage gain plus the
current Expansion/Hatchery ETAs. The **independent winner** is the candidate with
the largest larva-rate gain, ranked by Laboratory's own metric - the production
planner's winner score is never consulted, honouring the hard Laboratory boundary
against a circular oracle. Separately, the tournament observes what the production
Engine planner actually chooses by reading the Strategy Inspector's Engine lane
decision after one advisor-only cycle, and reports whether the independent winner
agrees.

Verified by `npm run check:laboratory:engine-tournament` on the hash-pinned LD-01
early-Engine save: identical raw-state restore per candidate, source non-mutation,
an independent winner selected, and the production Engine choice observed and
compared. On LD-01 the Laboratory metric ranks `BUY_HATCHERY` first (larger
instantaneous larva-rate gain) while the fixed-order planner picks
`BUY_EXPANSION` - a genuine, honestly surfaced disagreement.
`npm run verify:laboratory:engine-tournament` is the declared evidence generator.

Honest bounds (`metricModel: instantaneous-larva-rate-delta`,
`timingModel: live-site-nonhermetic-raw-state`): the instantaneous larva-rate
metric under-credits Expansion's indirect territory -> drone -> larva loop, so the
disagreement above is a flag that a time-to-gate horizon projection is the needed
refinement, **not** a claim that the production order is wrong. That horizon
projection, the 180s/600s save-window matrix, and a guaranteed Hatchery/Expansion
winner-change boundary all need the LD-08/LD-09 Nexus-boundary saves, which are
not yet captured; they are a declared LC-3 follow-up.

### LC-4 cross-lane bounded one-click tournament (2026-07-24)

LC-4 extends the LC-3 pattern to every lane. The development-only API exposes
`laboratory.runCrossLaneTournament({ sourceSave, phaseTarget })`,
`laboratory.getLastCrossLaneTournament()`, and
`laboratory.validateCrossLaneTournament(...)`; the result schema is
`swarmsim-lab.cross-lane-tournament.v1`.

Candidates are **enumerated from the production Strategy Inspector's own lane
candidates** - so no lane is omitted, and a candidate the production planner
declined (HOLD/OBSERVE) is still evaluated rather than hidden. Each distinct
candidate is resolved to a live unit/upgrade through a `getDisplayName` index and
run in its own disposable branch restored from the same source; because every
sibling restores the identical raw source state, shared larvae cannot be
double-spent across candidates. Candidates whose display name does not resolve are
recorded as `enumerated-unresolved`, never hidden. The **winner is ranked by
Laboratory's own larva-rate metric**, keeping production ordering bias separate
from Laboratory outcome ranking; the production first-BUY choice is recorded
alongside for comparison.

Verified by `npm run check:laboratory:cross-lane-tournament` on the hash-pinned
LD-05 real save and the LD-09 balanced natural Nexus-5 save. On LD-05 it
enumerated 27 candidates across all lanes, executed 24 in isolated branches with
identical raw-state restores and source non-mutation, and ranked `Engine:Expansion`
first - matching production's first BUY (a cross-lane agreement, in contrast to
the LC-3 LD-01 disagreement). `npm run verify:laboratory:cross-lane-tournament`
is the declared evidence generator.

Honest bounds (`metricModel: instantaneous-larva-rate-delta`,
`timingModel: live-site-nonhermetic-raw-state`): the shared larva-rate metric
under-credits non-larva lanes - Territory army buys show large territory-rate
deltas but zero larva-rate delta - so it cannot fairly adjudicate a
Territory-versus-Meat one-click. The **Territory-over-Meat crossover is therefore
honestly left open** (`territoryOverMeatCrossover: "open"`), pending a per-target
time-to-gate horizon projection. The one/two/four-action budget matrix and that
crossover need the LD-12 pre-Mirror data and remain a declared follow-up.

## 0.12.3 narrow contract update

0.12.3 adds a narrow live-capture hardening patch for House of Mirrors and ability
reason propagation without widening strategy behavior.

Required 0.12.3 runtime contract:

- House of Mirrors affected army capture remains keyed by exactly eleven canonical
  base ids.
- Live count resolution prefers the authoritative `clonearmy.effect[].unit`
  runtime target and records parity diagnostics versus independent canonical
  lookup.
- Ambiguous unresolved count states remain explicit (`count: null`) and are not
  silently serialized as verified zero.
- Clone Larvae and House of Mirrors blocked states propagate explicit
  `INSUFFICIENT_ENERGY` reason code and text through snapshot, run payload, UI,
  JSON, CSV, Markdown, and copy summary.
- Legal ability states clear stale unavailable reason/code fields.

## 0.12.0 Phase 1A implementation scope

0.12.0 implements the development-only snapshot foundation and the Phase 1 experiment chain. It still does not implement scoring, recommendations, or normal strategy changes.

Phase 1 now covers:

- action schema `swarmsim-lab.action.v1`
- result schema `swarmsim-lab.result.v1`
- `WAIT`, `CLONE_LARVAE`, and `HOUSE_OF_MIRRORS`
- immediate action application at `t=0`
- passive 60/300-second projections from the same snapshot
- JSON, CSV, and Markdown exports
- development-only browser runner/API
- deterministic experiment hashing

Frozen baseline:

- Frozen behavior version: `0.11.7`
- Verified runtime commit: `1ee631901cd04a1d97ddb0bcee5efa2499481ecc`
- Baseline repository/evidence commit: `ea999526994c75899b6b1a478e7146f046417803`
- Browser evidence is summarized in BOOK-02 and the current verifier output.

Known baseline limitation:

- Scenario `R8` uses harness-only pre-planner input overrides for target, action unit, and parent unit. These overrides do not force BUY/HOLD output fields, but they bypass normal meat-path construction for that scenario. This does not block Phase 1A because Phase 1A captures state and does not simulate Parent Step or meat-plan construction.

## Base-Game Formula Authority

Base game mechanics are verified against Swarm Simulator's external source repository:

```text
https://github.com/swarmsim/swarm
```

The pinned source commit is:

```text
06b4f404aa324a0b454348508cfa63d5c0f1ff54
```

This repository is an external formula reference only. It is not copied into this project and is not a runtime dependency for the Tampermonkey script.

Phase 1A references these files:

- `swarmsim-coffee/app/scripts/services/effect.coffee`
- `swarmsim-coffee/app/scripts/services/unit.coffee`
- `tables/src/upgrade/data.ts`
- `tables/src/unittype/data.ts`

Formula provenance in every snapshot must include source repository, source commit, source file, relevant function or effect type, whether the value was runtime-derived or recomputed by Laboratory, and one of these verification statuses:

- `runtime-derived`
- `source-verified`
- `incomplete`
- `mismatch`

Priority order:

1. Capture runtime-resolved values when the base game exposes them.
2. Verify calculation semantics against the pinned base-game source.
3. Recompute in Laboratory only when runtime values cannot be captured directly.
4. Never guess missing formulas.
5. Report uncertainty or mismatch explicitly in `formulaProvenance.warnings`, `uncertainFields`, and per-formula status.

Phase 1A source verification summary:

| Laboratory field | Base-game source | Function/effect | Value source | Status |
|---|---|---|---|---|
| Energy amount/rate/cap | `tables/src/unittype/data.ts`; `unit.coffee` | `nexus` prod, `capBase`, `Unit.velocity`, `Unit.capValue` | runtime-derived | `runtime-derived` |
| Larvae amount/rate | `tables/src/unittype/data.ts`; `unit.coffee` | `invisiblehatchery` prod, `Unit.velocity` | runtime-derived | `runtime-derived` |
| Cocoons amount/rate | `tables/src/unittype/data.ts`; `unit.coffee` | `Unit.count`, `Unit.velocity` | runtime-derived | `runtime-derived` |
| Clone Larvae | `tables/src/upgrade/data.ts`; `effect.coffee`; `unit.coffee` | `clonelarvae`, `compoundUnit`, `Effect.power` | runtime preview when available; otherwise source-verified recompute from captured inputs | `runtime-derived` or `source-verified` |
| House of Mirrors | `tables/src/upgrade/data.ts`; `unit.coffee` | `clonearmy`, eleven `compoundUnit` effects, `Unit.eachProduction` | source-verified recompute from runtime-derived unit counts and effective territory/unit | `source-verified` |
| Affected army units | `tables/src/upgrade/data.ts` | `clonearmy.effect[]` | source-verified fixed set | `source-verified` |
| Territory/sec | `tables/src/unittype/data.ts`; `unit.coffee` | army `prod`, `Unit.totalProduction`, `Unit.velocity` | runtime-derived with affected/unaffected consistency check | `runtime-derived` |
| Meat/sec coefficients | `unit.coffee` | `ProducerPath`, `ProducerPaths.getCoefficientsNow` | runtime-derived coefficients | `runtime-derived` or `mismatch` |
| Expansion next cost/ETA | `tables/src/upgrade/data.ts`; `unit.coffee` | `expansion` cost factor, `estimateSecsUntilEarned`, bisection | runtime-derived ETA plus Laboratory remaining check | `runtime-derived` |

Base-game `compoundUnit` semantics:

```text
bank = unit.count + optional secondary unit.count
cap = (unit.velocity + optional secondary unit.velocity) * val2 * effect.power
output = min(bank * (val - 1), cap) when cap exists
```

Clone Larvae uses `compoundUnit` over `larva` plus `cocoon`, with `val: 2`, `val2: 100000`, Nexus requirement `4`, and Energy cost `12000`.

House of Mirrors uses ability id `clonearmy`, Nexus requirement `5`, Energy cost `2500`, and eleven `compoundUnit` effects with `val: 2` for:

```text
swarmling, stinger, spider, mosquito, locust, roach, giantspider, centipede, wasp, devourer, goon
```

## Phase 1A Snapshot Schema

Phase 1A snapshot capture exports JSON only. Phase 1 experiment runs export JSON, CSV, and Markdown.

```json
{
  "schemaVersion": "swarmsim-lab.snapshot.v1",
  "kind": "deterministic-simulation-snapshot",
  "snapshotId": "LAB-...",
  "snapshotHash": "sha256:...",
  "snapshotHashScope": "deterministic-payload-v1",
  "source": {
    "scriptVersion": "0.12.0",
    "frozenBaselineVersion": "0.11.7",
    "verifiedRuntimeCommit": "1ee631901cd04a1d97ddb0bcee5efa2499481ecc",
    "baselineRepositoryCommit": "ea999526994c75899b6b1a478e7146f046417803",
    "currentCommit": null,
    "scenarioHarnessVersion": "0.12.0",
    "scenarioId": null,
    "scenarioHash": null,
    "gameBuild": null,
    "capturedAt": null
  },
  "simulation": {
    "mode": "deterministic-simulation",
    "interventionTimeSeconds": "0",
    "horizonsSeconds": ["60", "300"],
    "postActionPolicy": "passive-only",
    "normalAutobuyerEnabled": false,
    "liveSaveMutable": false
  },
  "resources": {
    "energy": { "amount": "0", "perSecond": "0", "cap": "0" },
    "larvae": { "amount": "0", "perSecond": "0" },
    "cocoons": { "amount": "0", "perSecond": "0" },
    "territory": { "amount": "0", "perSecond": "0" },
    "meat": {
      "perSecond": "0",
      "rateProjection": {
        "basis": "factorial-polynomial-derivative",
        "coefficients": ["0"],
        "maxDegree": 0,
        "valueAtZero": "0",
        "validation": "source-verified"
      }
    }
  },
  "army": {
    "houseOfMirrorsAffectedUnits": [],
    "affectedTerritoryPerSecondTotal": "0",
    "unaffectedTerritoryPerSecond": "0"
  },
  "expansion": {
    "currentLevel": "0",
    "nextCost": "0",
    "territoryRemaining": "0",
    "etaSeconds": "0",
    "laboratoryComputedEtaSeconds": "0",
    "etaComparison": "match"
  },
  "abilities": {
    "cloneLarvae": {},
    "houseOfMirrors": {}
  },
  "safety": {
    "resource": "energy",
    "requiredReserve": "0",
    "headroomBefore": "0",
    "ruleId": null,
    "reserveSource": "scenario-harness"
  },
  "context": {
    "nexusCount": "0",
    "lepidopteraCount": "0",
    "activePhase": null,
    "activeMilestone": null,
    "activeTarget": null
  },
  "formulaProvenance": {
    "formulaSetId": "swarmsim-runtime-formulas",
    "status": "verified",
    "sourceRepository": "https://github.com/swarmsim/swarm",
    "sourceCommit": "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
    "externalReferenceOnly": true,
    "runtimeDependency": false,
    "ratesCapturedFromRuntime": true,
    "uncertainFields": [],
    "warnings": [],
    "formulas": {}
  }
}
```

All large or precise game quantities are serialized as Decimal strings.

## Phase 1A Hash Rules

`snapshotHash` uses `snapshotHashScope: deterministic-payload-v1`.

Excluded from the deterministic payload hash:

- `snapshotHash`
- `source.capturedAt`

The hash payload uses canonical key ordering before SHA-256. `currentCommit` remains part of the hash as `null` when runtime Git SHA cannot be determined. The snapshot is deep-frozen after construction.

## Phase 1A Development Gate

Snapshot capture is unavailable unless both gates are active:

```text
localStorage.kbcSwarmBotScenarioHarnessEnabled_v1=true
localStorage.kbcSwarmBotLaboratoryEnabled_v1=true
```

When the Laboratory gate is off, no `kbcSwarmBot.laboratory` API is exposed. Normal autobuyer execution never calls snapshot capture, runPhase1Experiment, or any export helper. Capture and simulation do not buy units, buy upgrades, cast abilities, mutate the save, or append to normal run history.

## Purpose

SwarmSim Laboratory is a development-only experiment layer built on top of the deterministic scenario harness.

Phase 1 answers one narrow question:

> From an identical game state, does Energy help most through Clone Larvae, House of Mirrors, or waiting?

The experiment compares exactly three branches:

- `WAIT`
- `CLONE_LARVAE`
- `HOUSE_OF_MIRRORS`

Each branch starts from the same immutable snapshot, applies at most one intervention at `t=0`, and then runs a passive deterministic projection to:

- 60 seconds
- 300 seconds

The result is raw comparison data. Phase 1 does not assign a total score, recommend a global strategy, or change autobuyer behavior.

## Hard boundaries

0.11.x is the frozen behavior baseline.

Laboratory must:

- be development-only
- use the existing deterministic scenario harness
- avoid changing normal advisor or autobuyer decisions
- avoid changing safety defaults
- never mutate the real save
- start every branch from the exact same snapshot
- label every result `deterministic-simulation`
- use real game formulas where they are known
- report missing or uncertain formulas instead of guessing

Phase 1 must not include:

- Lepidoptera actions
- Army Seed
- Parent Step
- repeated casts
- post-action advisor or planner decisions
- automatic unit purchases
- automatic Expansion purchases
- automatic strategy changes
- a broad game simulator
- a combined best-action score

## Experiment semantics

The run order for every branch is:

1. Validate the immutable snapshot.
2. Create a fully isolated branch state.
3. Apply exactly one action at `t=0`.
4. Project passive game development directly to the requested horizon.
5. Calculate the requested metrics.
6. Compare the branch with `WAIT` at the same horizon.

The 60-second and 300-second runs are independent. A 300-second result must not continue from a previously produced 60-second branch.

### Passive-only policy

After the initial action, Laboratory does not:

- buy units
- spend larvae
- cast another ability
- run the advisor
- run the planner
- change the active target
- buy Expansion when its cost is reached

This isolates the direct causal effect of each Energy choice.

A consequence is that Clone Larvae does not increase meat/sec in Phase 1, because the additional larvae are not spent on meat-producing units. Meat/sec remains a useful control metric and should be equal across all three branches when the same projection formula is used.

A later experiment type may add an explicit post-cast spending policy. It must not be hidden inside Phase 1.

# 1. Snapshot schema

Schema identifier:

```text
swarmsim-lab.snapshot.v1
```

All game quantities and calculated rates must be stored as decimal strings, not JavaScript numbers.

## Canonical shape

```json
{
  "schemaVersion": "swarmsim-lab.snapshot.v1",
  "kind": "deterministic-simulation-snapshot",
  "snapshotId": "LAB-001",
  "snapshotHash": "sha256:...",

  "source": {
    "scriptVersion": "0.12.0",
    "baselineVersion": "0.11.x",
    "commit": "full-commit-sha",
    "scenarioHarnessVersion": "scenario-harness-version",
    "scenarioId": "scenario-id",
    "scenarioHash": "sha256:...",
    "gameBuild": "runtime-game-build-or-unknown",
    "capturedAt": "2026-07-10T00:00:00.000Z"
  },

  "simulation": {
    "mode": "deterministic-simulation",
    "interventionTimeSeconds": "0",
    "horizonsSeconds": ["60", "300"],
    "postActionPolicy": "passive-only",
    "normalAutobuyerEnabled": false,
    "liveSaveMutable": false
  },

  "resources": {
    "energy": {
      "amount": "0",
      "perSecond": "0",
      "cap": "0"
    },
    "larvae": {
      "amount": "0",
      "perSecond": "0"
    },
    "cocoons": {
      "amount": "0",
      "perSecond": "0"
    },
    "territory": {
      "amount": "0",
      "perSecond": "0"
    },
    "meat": {
      "perSecond": "0",
      "rateProjection": {
        "basis": "factorial-polynomial-derivative",
        "coefficients": ["0"],
        "maxDegree": 1
      }
    }
  },

  "army": {
    "houseOfMirrorsAffectedUnits": [
      {
        "unitId": "swarmling",
        "count": "0",
        "effectiveTerritoryPerSecondPerUnit": "0",
        "territoryPerSecondContribution": "0"
      }
    ],
    "affectedTerritoryPerSecondTotal": "0",
    "unaffectedTerritoryPerSecond": "0"
  },

  "expansion": {
    "currentLevel": "0",
    "nextCost": "0",
    "territoryRemaining": "0",
    "etaSeconds": "0"
  },

  "abilities": {
    "cloneLarvae": {
      "gameAbilityId": "clonelarvae",
      "available": false,
      "unavailableReason": null,
      "energyCost": "0",
      "formulaInputs": {
        "larvaeBank": "0",
        "cocoonBank": "0",
        "combinedBank": "0",
        "larvaePerSecond": "0",
        "cocoonsPerSecond": "0",
        "combinedVelocity": "0",
        "capSeconds": "100000",
        "abilityPower": "1"
      },
      "runtimePreviewOutput": "0"
    },

    "houseOfMirrors": {
      "gameAbilityId": "clonearmy",
      "available": false,
      "unavailableReason": null,
      "energyCost": "0",
      "affectedUnitIds": [
        "swarmling",
        "stinger",
        "spider",
        "mosquito",
        "locust",
        "roach",
        "giantspider",
        "centipede",
        "wasp",
        "devourer",
        "goon"
      ],
      "runtimePreviewTerritoryPerSecondAfter": "0"
    }
  },

  "safety": {
    "resource": "energy",
    "requiredReserve": "0",
    "headroomBefore": "0",
    "ruleId": "active-energy-safety-rule",
    "reserveSource": "scenario-harness"
  },

  "context": {
    "nexusCount": "0",
    "lepidopteraCount": "0",
    "activePhase": null,
    "activeMilestone": null,
    "activeTarget": null
  },

  "formulaProvenance": {
    "formulaSetId": "swarmsim-runtime-formulas",
    "status": "verified",
    "ratesCapturedFromRuntime": true,
    "uncertainFields": [],
    "warnings": []
  }
}
```

## Required fields beyond the initial proposal

The following values are required even though they were not all present in the first sketch:

- `energy.perSecond`, because Energy after 60 or 300 seconds cannot be calculated from current Energy alone
- `energy.cap`, because Energy may hit its cap
- `larvae.perSecond`, for passive larvae growth and Clone Larvae cap calculation
- `cocoons.perSecond`, because Clone Larvae includes cocoon velocity
- `expansion.nextCost`, because current ETA alone is insufficient after territory/sec changes
- `expansion.territoryRemaining`, for validation and reporting
- meat production coefficients, because future meat/sec is not necessarily constant
- effective territory production per army unit, because upgrades and modifiers must already be resolved

## Relevant army units

House of Mirrors affects exactly:

1. swarmling
2. stinger
3. spider
4. mosquito
5. locust
6. roach
7. giantspider
8. centipede
9. wasp
10. devourer
11. goon

These IDs come from the base-game `clonearmy` ability definition.

# 2. Action schema

Schema identifier:

```text
swarmsim-lab.action.v1
```

Common shape:

```json
{
  "actionSchemaVersion": "swarmsim-lab.action.v1",
  "actionId": "CLONE_LARVAE",
  "type": "CLONE_LARVAE",
  "requestedAtSeconds": "0",
  "castCount": "1",
  "safetyPolicy": "observe-and-report",
  "invalidActionPolicy": "report-not-applied"
}
```

Allowed action IDs:

```text
WAIT
CLONE_LARVAE
HOUSE_OF_MIRRORS
```

`WAIT` has `castCount: "0"`. Both abilities have `castCount: "1"`.

## Legal versus safe

Laboratory must distinguish between:

- game-legal action
- safety-safe action

An ability is game-legal only when it is available and the branch has enough Energy for the real cost.

A game-legal action may still be simulated when it goes below the configured safety reserve. Because Laboratory does not mutate the live save, this is useful counterfactual information. The result must be marked as a safety violation.

An action that is not game-legal must not be forced. Its status is `invalid-action`, with `actionApplied: false`.

# 3. Action application

## WAIT

Immediate state changes:

```text
none
```

All starting resource amounts, rates and unit counts remain unchanged before passive projection.

## CLONE_LARVAE

Legality:

```text
available == true
energy >= energyCost
```

Energy after action:

```text
energyAfterAction = energyBefore - energyCost
```

Clone bank:

```text
bank = larvae + cocoons
```

Clone velocity cap:

```text
cap = (larvaePerSecond + cocoonsPerSecond)
    * capSeconds
    * abilityPower
```

Clone output:

```text
cloneOutput = min(bank, cap)
```

State after action:

```text
larvaeAfterAction = larvaeBefore + cloneOutput
cocoonsAfterAction = cocoonsBefore
```

Clone Larvae does not change larvae/sec, meat/sec, army counts or territory/sec in Phase 1.

The calculated output must match the runtime preview captured in the snapshot. A mismatch must produce `formula-mismatch`; Laboratory must not silently choose one value.

Base-game references:

- `tables/src/upgrade/data.ts`: ability `clonelarvae`
- `swarmsim-coffee/app/scripts/services/effect.coffee`: effect type `compoundUnit`

## HOUSE_OF_MIRRORS

Legality:

```text
available == true
energy >= energyCost
```

Energy after action:

```text
energyAfterAction = energyBefore - energyCost
```

For each affected army unit:

```text
countAfter = countBefore * 2
```

Affected territory production after action:

```text
affectedTerritoryPerSecondAfter =
  sum(floor(countAfter[i]) * effectiveTerritoryPerSecondPerUnit[i])
```

Total territory production after action:

```text
territoryPerSecondAfter =
  unaffectedTerritoryPerSecond
  + affectedTerritoryPerSecondAfter
```

Do not assume that total territory/sec always doubles. Snapshot data may contain unaffected territory production.

The calculated territory/sec must match the runtime preview captured in the snapshot. A mismatch produces `formula-mismatch`.

Base-game references:

- `tables/src/upgrade/data.ts`: ability `clonearmy`
- `tables/src/unittype/data.ts`: army unit production
- `swarmsim-coffee/app/scripts/services/unit.coffee`: effective unit production

# 4. Required formulas

## Decimal arithmetic

All core calculations must use the same Decimal semantics as the project or an equivalent exact decimal library.

Do not use JavaScript `Number`, `parseFloat`, or ordinary floating-point exponentiation for game quantities.

## Energy projection

```text
energyUncapped(t) = energyAfterAction + energyPerSecond * t
energyAfter(t) = min(energyCap, energyUncapped(t))
```

If Energy cap is missing, `energyAfter` must be `null` with a warning. Do not assume unlimited Energy.

## Larvae projection

```text
larvaeAfter(t) = larvaeAfterAction + larvaePerSecond * t
```

## Meat/sec projection

SwarmSim production chains use factorial polynomial terms:

```text
count(t) = sum(coefficient[d] * t^d / d!)
```

Future production rate is the derivative:

```text
meatPerSecond(t) =
  coefficient[1]
  + coefficient[2] * t
  + coefficient[3] * t^2 / 2!
  + coefficient[4] * t^3 / 3!
  + ...
```

The snapshot stores the runtime-resolved coefficients so Phase 1 does not need the full meat unit chain.

The same meat/sec result is expected for all three branches at the same horizon. If required coefficients cannot be captured, the metric is `null` and the run is `incomplete-formula`.

Base-game reference:

- `swarmsim-coffee/app/scripts/services/unit.coffee`: `ProducerPath` and `ProducerPaths`

## Territory projection

Army production is direct and constant in this experiment:

```text
territoryAfter(t) =
  territoryBefore + territoryPerSecondAfterAction * t
```

```text
territoryPerSecondAfter(t) = territoryPerSecondAfterAction
```

## Expansion ETA

```text
remainingAfter(t) = expansionNextCost - territoryAfter(t)
```

If `remainingAfter(t) <= 0`:

```text
expansionEtaAfter(t) = 0
```

Otherwise, when territory production is positive:

```text
expansionEtaAfter(t) =
  remainingAfter(t) / territoryPerSecondAfterAction
```

When territory production is zero:

```text
expansionEtaAfter(t) = null
reason = zero-territory-production
```

Expansion is not purchased when the cost is reached. ETA simply becomes zero.

## Safety reserve

```text
reserveAfterAction = energyAfterAction - requiredReserve
```

Report:

```text
violationBeforeAction = energyBefore < requiredReserve
violationAfterAction = energyAfterAction < requiredReserve
introducedByAction = !violationBeforeAction && violationAfterAction
```

The relevant minimum Energy is normally the immediate post-action value, because Phase 1 contains no later Energy spending and Energy regenerates passively.

# 5. Simulation horizons

The engine supports exactly:

```text
60 seconds
300 seconds
```

For every action, run both projections from a fresh clone of the same initial snapshot.

Expected run matrix:

```text
3 actions * 2 horizons = 6 runs
```

No internal one-second tick loop is required. Phase 1 should calculate the closed-form result directly when the formula is known.

# 6. Result schema

Schema identifier:

```text
swarmsim-lab.result.v1
```

Canonical shape:

```json
{
  "schemaVersion": "swarmsim-lab.result.v1",
  "kind": "deterministic-simulation",

  "experiment": {
    "experimentId": "LAB-001-ENERGY-CHOICE",
    "experimentType": "ENERGY_ACTION_COMPARISON_V1",
    "question": "Clone Larvae vs House of Mirrors vs Wait",
    "createdAt": "2026-07-10T00:00:00.000Z",
    "horizonsSeconds": ["60", "300"],
    "actions": ["WAIT", "CLONE_LARVAE", "HOUSE_OF_MIRRORS"],
    "postActionPolicy": "passive-only"
  },

  "snapshot": {
    "snapshotId": "LAB-001",
    "snapshotHash": "sha256:...",
    "scenarioId": "scenario-id",
    "scenarioHash": "sha256:..."
  },

  "runs": [
    {
      "runId": "LAB-001-WAIT-60",
      "actionId": "WAIT",
      "horizonSeconds": "60",
      "status": "ok",
      "actionLegal": true,
      "actionApplied": true,

      "immediate": {
        "energyCost": "0",
        "energyAfterAction": "0",
        "larvaeAdded": "0",
        "territoryPerSecondAfterAction": "0",
        "reserveAfterAction": "0"
      },

      "metrics": {
        "larvaeAfter": "0",
        "meatPerSecondAfter": "0",
        "territoryPerSecondAfter": "0",
        "energyAfter": "0",
        "expansionEtaSecondsAfter": "0",
        "reserveAfterAction": "0",
        "safetyViolation": false
      },

      "comparisonVsWait": {
        "larvaeDelta": "0",
        "meatPerSecondDelta": "0",
        "territoryPerSecondDelta": "0",
        "territoryPerSecondPercent": "0",
        "energyDelta": "0",
        "expansionEtaDeltaSeconds": "0",
        "expansionEtaImprovementSeconds": "0",
        "reserveDelta": "0"
      },

      "safety": {
        "violationBeforeAction": false,
        "violationAfterAction": false,
        "introducedByAction": false
      },

      "formulaValidation": {
        "status": "verified",
        "mismatches": []
      },

      "warnings": []
    }
  ],

  "metricLeaders": {
    "60": {
      "lowestExpansionEta": [],
      "highestLarvae": [],
      "highestMeatPerSecond": [],
      "highestTerritoryPerSecond": [],
      "highestEnergy": [],
      "highestReserve": []
    },
    "300": {}
  },

  "completeness": {
    "status": "complete",
    "missingMetrics": [],
    "uncertainFormulas": [],
    "warnings": []
  }
}
```

Allowed run statuses:

```text
ok
invalid-action
incomplete-snapshot
incomplete-formula
formula-mismatch
simulation-error
```

## Comparison with WAIT

Expansion ETA delta:

```text
expansionEtaDeltaSeconds = actionEta - waitEta
```

A positive value means a longer, worse ETA.

Readable improvement value:

```text
expansionEtaImprovementSeconds = waitEta - actionEta
```

A positive value means an improvement.

Territory/sec percentage:

```text
territoryPerSecondPercent =
  ((actionTerritoryPerSecond / waitTerritoryPerSecond) - 1) * 100
```

If Wait territory/sec is zero, the percentage is `null` with warning `zero-wait-denominator`.

## Metric leaders

Leaders are reported separately for each metric and horizon. Ties are represented as arrays containing every tied action.

Do not create:

- overall winner
- total score
- recommended action
- strategy recommendation

# 7. Export formats

## JSON

The complete `swarmsim-lab.result.v1` object.

## CSV

One row per action and horizon, normally six rows.

Required columns:

```text
snapshot_id
snapshot_hash
scenario_id
mode
action_id
horizon_seconds
status
action_legal
action_applied
energy_cost
larvae_after
larvae_delta_vs_wait
meat_per_second_after
meat_per_second_delta_vs_wait
territory_per_second_after
territory_per_second_delta_vs_wait
territory_per_second_pct_vs_wait
energy_after
energy_delta_vs_wait
expansion_eta_seconds_after
expansion_eta_delta_vs_wait
expansion_eta_improvement_seconds_vs_wait
reserve_after_action
reserve_delta_vs_wait
safety_violation
formula_status
warnings
```

## Markdown

The Markdown export contains:

- experiment identity
- `deterministic-simulation` label
- passive-only policy
- one table for 60 seconds
- one table for 300 seconds
- separate observations per metric
- explicit warnings and formula status

Permitted observations include:

- House of Mirrors had the lowest Expansion ETA.
- Clone Larvae produced X more larvae than Wait.
- Wait preserved the highest reserve.
- Clone Larvae delayed Expansion by X seconds versus Wait.
- House of Mirrors improved territory/sec by Y percent versus Wait.
- All actions had equal meat/sec because no larvae-spending policy was active.

The report must not state that an action is best overall.

# 8. Validation and error sources

## Branch isolation

Verify:

```text
hash(snapshotBefore) == hash(snapshotAfter)
```

Every branch must receive a separate deep clone and share the same starting `snapshotHash`.

## Live-save non-mutation

Laboratory must not call live mutation methods such as:

```text
buy
_addCount
_subtractCount
withSave
```

against the real game object.

The live state hash before and after an experiment must be identical.

## WAIT identity tests

Verify that Wait:

- has no immediate deltas
- receives correct passive Energy
- receives correct passive larvae
- receives correct passive meat/sec projection
- keeps territory/sec unchanged
- receives correct Expansion ETA progression

## Clone Larvae fixtures

Test at minimum:

- no cocoons
- only cocoons
- bank-limited output
- velocity-cap-limited output
- ability power above one
- Energy exactly equal to cost
- insufficient Energy
- unavailable ability
- reserve exactly met
- reserve crossed by action
- safety violation already present before action

The Laboratory output must match runtime preview output.

## House of Mirrors fixtures

Test at minimum:

- all army counts zero
- only swarmlings present
- only one high-tier unit present
- all eleven affected units present
- unaffected territory production present
- fractional unit counts
- upgraded effective per-unit production
- insufficient Energy
- unavailable ability
- reserve crossed by action

The Laboratory territory rate after action must match runtime preview.

## Energy cap tests

Test:

- no branch reaches cap
- Wait reaches cap
- Wait reaches cap but an action branch does not
- branches reach cap at different times
- Energy starts at cap
- cap is missing

## Meat projection tests

Test:

- linear coefficient only
- linear plus quadratic coefficient
- several polynomial degrees
- all coefficients zero
- very large Decimal values
- value at `t=0` matches captured meat/sec

Phase 1 invariant:

```text
meatPerSecondWait(t)
== meatPerSecondClone(t)
== meatPerSecondHouseOfMirrors(t)
```

## Expansion ETA tests

Test:

- target already reached
- target reached exactly at horizon
- target reached before horizon
- positive remaining territory
- zero territory production
- House of Mirrors shortens ETA
- ETA never becomes negative
- next Expansion cost is unchanged by actions

## Horizon isolation

A direct 300-second run must produce the same result regardless of whether a 60-second run has already executed.

## Determinism

The same snapshot, action and formula version must produce byte-identical canonical JSON, excluding a separately handled export timestamp.

Recommended result hash:

```text
SHA-256(canonicalResultWithoutExportTimestamp)
```

## Decimal precision

Fixtures must include:

- values above `Number.MAX_SAFE_INTEGER`
- exponent notation
- very small rates
- very large army counts
- non-integer division results

## Missing formulas

Missing mandatory data must produce `null` metrics and an explicit warning, for example:

```json
{
  "status": "incomplete-formula",
  "metrics": {
    "expansionEtaSecondsAfter": null
  },
  "warnings": [
    "Missing effective territory production for goon"
  ]
}
```

Missing data must never be replaced with an invented zero.

## Development gating

With Laboratory disabled, verify:

- no Laboratory UI is shown
- no Laboratory globals are exposed
- no snapshots are created
- no extra actions execute
- normal exports contain no Laboratory results
- advisor and autobuyer behavior match the frozen 0.11.x baseline

# 9. Minimum implementation scope for 0.12.0

0.12.0 should contain only the following Laboratory components.

## Snapshot capture adapter

Reads a deterministic scenario state and creates `swarmsim-lab.snapshot.v1`.

It captures:

- resources and passive rates
- Energy cap
- Expansion target and cost
- ability availability and costs
- Clone Larvae preview
- affected army units and effective production
- House of Mirrors territory preview
- meat production coefficients
- safety reserve
- scenario and source provenance
- snapshot hash

## Snapshot validator

Validates:

- schema version
- required fields
- decimal string representation
- rate and sum consistency
- Expansion consistency
- ability preview consistency
- formula provenance

## Three action applicators

Only:

```text
WAIT
CLONE_LARVAE
HOUSE_OF_MIRRORS
```

## Passive projection engine

Only:

- Energy with cap
- larvae growth
- meat/sec polynomial derivative
- linear territory growth
- Expansion ETA
- reserve and safety state

This is not a general game simulator.

## Experiment runner

Runs the fixed six-branch matrix from the same snapshot.

## Comparator

Calculates:

- absolute deltas versus Wait
- territory/sec percentage
- ETA delta and improvement
- separate metric leaders
- ties

It must not calculate a total score.

## Exporters

- JSON
- CSV
- Markdown

All outputs are marked `deterministic-simulation`.

## Development-only entry point

A minimal harness command or control is enough. 0.12.0 does not need a dashboard, database, graph system, batch scheduler, strategy editor or experiment history UI.

## Fixtures and regression tests

At minimum:

- neutral fixture
- Clone-favorable fixture
- House-of-Mirrors-favorable fixture
- safety-violation fixture
- invalid-action fixture
- formula-mismatch fixture

## Documentation

Document:

- snapshot schema
- experiment semantics
- output schemas
- formula provenance
- limitations
- mismatch behavior

# 10. Acceptance criteria

0.12.0 Phase 1 is complete only when:

1. A deterministic scenario can be captured as `swarmsim-lab.snapshot.v1`.
2. All six runs use the same starting snapshot hash.
3. Wait, Clone Larvae and House of Mirrors are applied correctly at `t=0`.
4. Clone output matches the base-game runtime preview.
5. House of Mirrors territory output matches the runtime preview.
6. The 60-second and 300-second horizons are independent.
7. Energy cap is handled.
8. Meat/sec is projected from real producer coefficients.
9. Expansion ETA is derived from cost, territory and territory/sec.
10. Safety violations are reported without changing safety defaults.
11. JSON, CSV and Markdown exports are produced.
12. Every result is labelled `deterministic-simulation`.
13. No total score exists.
14. Normal strategy behavior is unchanged.
15. The real save is never mutated.
16. Laboratory disabled produces behavior identical to the frozen 0.11.x baseline.
17. Repository guardrails and regression tests pass.

# Design conclusion

Phase 1 is a narrow causal comparison tool:

```text
identical snapshot
-> one action at t=0
-> passive deterministic projection
-> separate raw metrics
-> comparison with Wait
```

It is deliberately not a full simulator and deliberately does not decide what the autobuyer should do. Its first responsibility is to produce trustworthy, reproducible evidence about isolated Energy choices.
