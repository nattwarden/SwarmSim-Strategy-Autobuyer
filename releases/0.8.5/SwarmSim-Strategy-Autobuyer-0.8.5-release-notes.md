# SwarmSim Strategy Autobuyer 0.8.5 — release notes

Date: 2026-07-09

## Summary

0.8.5 is a narrow hotfix on top of 0.8.4.

It fixes Twin Unlock Threshold Planner cost resource detection for twin upgrades where the cost resource differs from the current action unit.

Safe defaults are unchanged.

## What changed

### Twin unlock cost resource detection fix

Updated twin threshold extraction so twin upgrade costs are read from upgrade cost rows (with narrow fallbacks), instead of assuming the threshold cost row must match the current action unit.

This fixes cases such as:

- `Twin Neural Clusters` candidate detected correctly
- threshold cost resource now detected as `Hive Network`
- required threshold now detected as `1000`
- current threshold amount now read from current `Hive Network` count
- missing threshold amount now calculated as `max(0, required - current)`
- prep candidate now becomes `Hive Network`

### Twin unlock diagnostics improvements

Twin planner reason text now separates failure modes:

- `could not read twin upgrade cost resource`
- `invalid twin upgrade threshold amount`
- `twin cost resource <name> not on target path <path>`

It no longer reports `prep resource not on target path` when the cost resource cannot be read.

### Scope and behavior

This hotfix is intentionally narrow:

- no broad strategy changes
- no widened automation scope
- no aggressive Smart Mode buyMax behavior
- no changes to ability auto-cast defaults
- no changes to auto-ascend defaults
- no Nightbug/Bat default auto-buy behavior

## Safety

Still preserved:

- `autoCastAbilities` default remains `false`
- `autoAscend` default remains `false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Smart Mode meat-chain planning remains exact chunk-based (non-aggressive)

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source remains `src/SwarmSim-Strategy-Autobuyer.user.js`.
Release folders remain documentation-only.
