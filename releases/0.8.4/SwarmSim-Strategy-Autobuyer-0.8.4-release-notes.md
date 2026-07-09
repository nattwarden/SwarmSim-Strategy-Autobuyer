# SwarmSim Strategy Autobuyer 0.8.4 — release notes

Date: 2026-07-09

## Summary

0.8.4 is a conservative hotfix on top of 0.8.3.

It does not add broad new strategy and it does not make Smart Mode aggressive.
Safe defaults are unchanged.

This hotfix adds a narrow Twin Unlock Threshold Planner to handle concrete target-path twin thresholds such as Twin Neural Clusters at 1000 Hive Networks.

## What changed

### Twin Unlock Threshold Planner (target-path and conservative)

Added a narrow planner path in `runUnlockPlanner` with two phases:

- Phase 1: threshold prep.
- Phase 2: buy/hold the twin upgrade with rebuild guard.

For target path example:

- Lesser Hive Mind -> Hive Network -> Neural Cluster -> Hive Neuron

planner can now evaluate:

- candidate upgrade: `Twin Neural Clusters`
- threshold cost resource: `Hive Network`
- current vs required threshold amount
- missing amount to threshold

and perform conservative prep buys of `Hive Network` when all guards pass.

### New config gates (default-safe)

Added config keys:

- `twinUnlockPlanner: true`
- `twinUnlockPaybackBypass: true`
- `twinUnlockMinReserveRatio: 1.25`
- `twinUnlockMaxPrepChunkPercent: 25`
- `twinUnlockNearThresholdRatio: 0.60`
- `twinUnlockPostUpgradeRebuildRatio: 0.50`

Notes:

- Uses exact chunked buys (no buyMax behavior introduced).
- Does not lower global `meatChainReserveMultiplier`.
- Does not lower global `meatChainMaxPaybackSeconds`.
- Does not change global `twinRecoveryBufferMultiplier`.
- Payback bypass is limited to concrete twin threshold prep with reserve checks.

### Upgrade buy/hold recovery guard

When the twin upgrade becomes buyable, planner now requires post-upgrade rebuild safety.
If rebuild ratio is unsafe, planner returns HOLD with explicit reason.

### Same-run guard

If twin threshold prep or twin upgrade executes, planner marks execution and same-run unit filler is skipped in that run.

### Export and inspector fields

Added observability fields:

- `twinUnlockCandidate`
- `twinUnlockDecision`
- `twinUnlockReason`
- `twinUnlockTarget`
- `twinUnlockUpgrade`
- `twinUnlockCostResource`
- `twinUnlockCurrent`
- `twinUnlockRequired`
- `twinUnlockMissing`
- `twinUnlockPrepCandidate`
- `twinUnlockReserveRatio`
- `twinUnlockPaybackBypassed`
- `twinUnlockPostUpgradeRebuildRatio`
- `twinUnlockRebuildSafe`

## Safety

Still preserved:

- `autoCastAbilities` default remains `false`
- `autoAscend` default remains `false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- no aggressive Smart planner buyMax behavior
- no unrelated generic twin buying path added

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source remains `src/SwarmSim-Strategy-Autobuyer.user.js`.
Release folders remain documentation-only.