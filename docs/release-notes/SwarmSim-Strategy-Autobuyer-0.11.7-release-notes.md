# SwarmSim Strategy Autobuyer 0.11.7 - Deterministic Harness Input Stabilization

Date: 2026-07-10

## Summary

0.11.7 is a narrow harness-input patch for deterministic scenario reliability.
It is not a strategy patch and does not start Laboratory 0.12.0.

Primary intent:

1. stabilize scenario input resolution for House of Mirrors army tiers,
2. keep planner decisions runtime-authentic (no scenario decision overrides),
3. add deterministic observability required for Laboratory Phase 1 baseline work.

## What changed

### 1) Canonical army alias resolution with early setup failure

Scenario overrides now support `armyUnitCounts` as alias input (for example
`Culicimorph V`).

During harness setup, aliases are resolved against runtime units into canonical
unit keys, then injected via normal runtime count overrides.

If an alias is missing or ambiguous, the scenario fails early with setup error
(`SCENARIO_SETUP_ALIAS_RESOLUTION_FAILED`) instead of silently continuing with
effective zero counts.

### 2) HoM-related injection and parity observability

Cycle reports now include setup observability with alias -> canonical runtime id
resolution, injected vs runtime effective counts, visibility, per-unit territory
contribution, and HoM affected/unaffected territory/sec breakdown.

### 3) R8 parent-step input diagnostics

Cycle decisions now expose parent-step candidate diagnostics, including
candidate id/label/count, cost/resource snapshots, visible/available/buyable
flags, plus reserve/payback result signals.

This is reporting/diagnostics only; planner decision logic remains unchanged.

### 4) Clone Larvae observability parity

Cycle decisions now expose deterministic Clone Larvae readouts used by baseline
validation (availability, energy cost, larva/cocoon counts, larva/cocoon
velocity, and runtime preview gain field when available).

### 5) 0.11.7 version and scenario templates

Added/updated:

- runtime/package/userscript version surfaces -> `0.11.7`
- The retained verifier fixture is documented in `docs/test-data/README.md`.
- `scripts/run-0.11.7-deterministic-scenarios.js`
- `scripts/check-0.11.7-version-surfaces.js`

## Explicitly not changed

- No planner decision override by scenario id
- No hardcoded BUY/HOLD/ADVISE for target scenarios
- No normal runtime assertion special-casing
- No safety-default changes
- No Lepidoptera strategy fixes in R2/R3
- No Laboratory simulator implementation

## Safety defaults preserved

Unchanged:

- autoCastAbilities=false
- autoAscend=false
- energySupportBrokerAllowAutoCast=false
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no aggressive buyMax default in Smart mode
