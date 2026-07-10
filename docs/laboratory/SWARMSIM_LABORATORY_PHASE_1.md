# SwarmSim Laboratory Phase 1

Status: design specification for 0.12.0. No runtime implementation is defined by this document.

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