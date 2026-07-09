# SwarmSim Strategy Autobuyer 0.8.3 — release notes

Date: 2026-07-09

## Summary

0.8.3 is a conservative hotfix on top of 0.8.2.

It does not add broad new strategy and it does not make Smart Mode aggressive.
Safe defaults are unchanged.

This hotfix addresses endless action-unit filler in meat-chain unlock flow by adding a narrow parent-step conversion decision.

## What changed

### Parent Step Conversion (direct target path only)

Unlock Planner now evaluates a direct target-path parent-step conversion candidate before default action-unit filler logic.

For a target path like:

- Lesser Hive Mind -> Hive Network -> Neural Cluster -> Hive Neuron

when action unit is `Hive Neuron`, the planner can now choose parent step `Neural Cluster` if all conservative conditions hold:

- active action unit is on target path
- candidate is the direct parent step on the same target path
- candidate is visible and buyable
- candidate directly consumes the action unit as cost resource
- candidate supports target-path progress
- reserve ratio is safe after buy
- payback is bypassed only for this direct parent-step value case

### Conservative limits

Added config keys (default-safe):

- `meatParentStepPlanner: true`
- `meatParentStepPaybackBypass: true`
- `meatParentStepMinReserveRatio: 1.5`
- `meatParentStepMaxChunkPercent: 25`

Notes:

- Uses exact chunked buys (no buyMax behavior introduced).
- Does not lower global `meatChainReserveMultiplier`.
- Does not lower global `meatChainMaxPaybackSeconds`.
- Parent-step bypass is limited to direct target-path parent-step conversion.

### Same-run behavior guard

If a parent-step conversion is executed in the unlock phase, the goal planner now avoids immediately re-filling the same lower action unit in that same run.

### Export and inspector fields

Added observability fields:

- `parentStepCandidate`
- `parentStepDecision`
- `parentStepReason`
- `parentStepTarget`
- `parentStepActionUnit`
- `parentStepCostResource`
- `parentStepReserveRatio`
- `parentStepPaybackBypassed`
- `parentStepSupportsActionUnit`

## Safety

Still preserved:

- no default ability auto-cast
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default auto-ascend
- no default Nightbug/Bat auto-buy
- no Smart meat-chain buyMax behavior

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source remains `src/SwarmSim-Strategy-Autobuyer.user.js`.
Release folders remain documentation-only.
