# SwarmSim Laboratory source-math roadmap

Status: Phase 2A implemented in 0.13.0; later roadmap phases remain advisory
Pinned base-game source: `swarmsim/swarm@06b4f404aa324a0b454348508cfa63d5c0f1ff54`

## Purpose

Extend Laboratory from formulas read directly from the pinned base-game source,
then use a small verifier set to prove runtime input capture, Decimal parity,
branch isolation, and live-save non-mutation. Broad empirical sweeps are not the
source of truth for deterministic game math.

This document does not widen automation. Laboratory remains gated, manually
triggered, read-only, simulation-only, and advisory.

## Source-derived ability formulas

The ability definitions are in `tables/src/upgrade/data.ts`. Effect semantics are
in `swarmsim-coffee/app/scripts/services/effect.coffee` and production-chain math
is in `swarmsim-coffee/app/scripts/services/unit.coffee`.

All quantities below must use project-equivalent Decimal arithmetic.

### Add-unit-by-velocity abilities

The source defines three deterministic rush abilities:

| Action | Nexus | Energy cost | Target | Velocity seconds | Flat addition |
| --- | ---: | ---: | --- | ---: | ---: |
| Larva Rush | 1 | 1600 | larvae | 2400 | 100000 |
| Meat Rush | 2 | 1600 | meat | 7200 | 100000000000 |
| Territory Rush | 3 | 1600 | territory | 7200 | 1000000000 |

For target resource `r`, the immediate output is:

```text
rushOutput = targetVelocity * velocitySeconds * abilityPower
           + flatAddition * abilityPower
```

The snapshot must capture the runtime-resolved effect power and target velocity.
Constants alone are insufficient because upgrades may alter effect power.

The immediate post-action amount is:

```text
targetAfterAction = targetBefore + rushOutput
energyAfterAction = energyBefore - 1600
```

These actions are suitable for the first Phase 2 experiment family because they
require no invented purchase policy and no mutation of the live game.

### Clone Larvae

The pinned source defines:

```text
energyCost = 12000
bank = larvae + cocoons
uncappedOutput = bank * (2 - 1)
cap = (larvaeVelocity + cocoonVelocity) * 100000 * abilityPower
cloneOutput = min(uncappedOutput, cap)
```

The existing Phase 1 contract already implements this isolated immediate effect.
Clone Larvae does not directly increase meat/sec. A future metric such as
"meat/sec gained from Clone Larvae" requires a declared post-clone spending
policy. Without such a policy, that metric is not determined by the game formula.

### House of Mirrors

The pinned source defines eleven `compoundUnit` effects with multiplier `2` and
Energy cost `2500`. For every affected army unit:

```text
addedCount = currentEffectiveCount * (2 - 1)
countAfterAction = currentEffectiveCount * 2
```

Effective territory production must use runtime-resolved per-unit production:

```text
territoryPerSecondAfter = unaffectedTerritoryPerSecond
  + sum(floor(countAfterAction[i]) * effectiveTerritoryPerSecondPerUnit[i])
```

This remains a source-derived formula with runtime-derived inputs. The fixed
eleven-unit set must still be checked against the runtime effect targets.

### Swarmwarp

The pinned source defines Energy cost `2000`, `skipTime(900)`, and a negative
900-second Energy-velocity adjustment. Swarmwarp advances the whole production
graph, not one resource. It therefore requires coefficients for every reported
resource and careful Energy semantics. It should not be part of the first Phase
2 increment.

## Source-derived production and ETA math

`ProducerPath` represents each production path as a factorial polynomial:

```text
resourceCount(t) = sum(coefficient[d] * t^d / d!)
```

`getCoefficientsNow()` resolves the coefficients from the current runtime state.
The instantaneous rate at horizon `t` is the derivative:

```text
resourcePerSecond(t)
  = sum(coefficient[d] * t^(d - 1) / (d - 1)!), for d >= 1
```

Time to a target is the smallest non-negative `t` where the count polynomial
reaches the target. The base game uses direct linear/quadratic solutions where
available and up to 50 bisection iterations for higher degrees.

Laboratory may use the same deterministic bisection over captured coefficients.
It must report `null` plus an explicit incomplete-formula warning when required
coefficients are missing; it must not substitute zero.

## Phase 2A: smallest exact extension

Add one new experiment family, separate from Phase 1:

```text
WAIT
LARVA_RUSH
MEAT_RUSH
TERRITORY_RUSH
```

Each action starts from the same immutable snapshot and is projected at declared
horizons. Phase 2A should report raw metrics and deltas versus Wait, never an
overall score or automatic recommendation.

Required new snapshot inputs:

- availability, Energy cost, effect power, and runtime preview for all three Rush abilities
- current meat amount and meat production coefficients
- current larvae amount and larvae production coefficients
- current territory amount and territory production coefficients
- target definitions and next costs for explicitly supported milestones
- Energy amount, velocity, cap, and configured reserve
- source repository, pinned commit, source files, effect types, and per-formula status

Exact metrics enabled by those inputs:

- immediate larvae, meat, or territory added
- resource amount at each horizon
- resource/sec at each horizon
- Energy at each horizon and reserve after action
- time to a declared resource threshold
- time saved versus Wait for that threshold
- whether the action is game-legal
- whether it crosses the configured safety reserve

Not included in Phase 2A:

- automatic spending of gained larvae, meat, or territory
- optimal purchase sequences
- payback from an unspecified purchase policy
- total score or overall winner
- Swarmwarp
- any auto-cast behavior

## Minimal verification set

Source reading replaces formula discovery by trial and error, but not integration
verification. Phase 2A needs only the following focused classes of checks:

1. One source-constant check for ability ids, requirements, costs, seconds, and flat additions.
2. Table-driven Decimal checks for each Rush formula, including ability power above one and values above `Number.MAX_SAFE_INTEGER`.
3. Runtime-preview parity for one legal capture per Rush ability when available.
4. Invalid-action checks for unavailable ability and insufficient Energy.
5. Energy-cap and reserve-crossing boundary checks.
6. Polynomial projection and target-ETA checks for linear, quadratic, and higher-degree coefficients.
7. Determinism, branch isolation, snapshot-hash stability, and live-state non-mutation checks.

No broad scenario sweep is required to establish these deterministic formulas.
Strategy Audit remains the correct tool for testing how the production planner
chooses among competing lanes across staged states.

## Implementation gate

Before runtime implementation, define a versioned Phase 2 snapshot/action/result
schema and decide which concrete resource thresholds are supported. Do not add
Clone-to-production metrics until a separate, explicit post-clone spending policy
has been specified and can be simulated without mutating the live save.
