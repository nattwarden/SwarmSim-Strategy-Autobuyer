# SwarmSim Strategy Autobuyer 0.8.6 — release notes

Date: 2026-07-09

## Summary

0.8.6 is a narrow hotfix on top of 0.8.5.

It fixes Twin Unlock Threshold Planner deadlock when threshold cost detection is correct but current/required is below `twinUnlockNearThresholdRatio`.

Safe defaults are unchanged.

## What changed

### Twin threshold reachability fix

Twin unlock planning no longer stops at a pure static near-threshold gate.

Before 0.8.6, below-threshold states could stop at:

- `threshold not near enough`

Now the planner can still evaluate conservative threshold prep when the prep is concrete and meaningful:

- target-path-relevant twin threshold candidate
- prep candidate matches concrete threshold resource
- prep chunk is positive and capped by `twinUnlockMaxPrepChunkPercent`
- prep advances threshold progress (`current -> after`)
- reserve/payback safety still enforced
- payback bypass remains limited to concrete twin threshold prep value
- protected resources still block prep

### Reason text and diagnostics

Twin threshold prep reason text now includes:

- current/required
- missing
- near-threshold ratio and current ratio
- prep amount and after-prep ratio
- reserve after buy vs required reserve
- whether below-near-threshold was bypassed by reachability prep
- whether payback bypass was used for concrete twin threshold value

When unsafe, HOLD reason now reports the concrete blocker (for example reserve shortfall or protected resource), instead of only `threshold not near enough`.

### New observability fields

Added/filled in inspector/export fields:

- `twinUnlockReachable`
- `twinUnlockReachabilityReason`
- `twinUnlockNearThresholdRatio`
- `twinUnlockCurrentRatio`
- `twinUnlockPrepAmount`
- `twinUnlockPrepAfterCurrent`
- `twinUnlockPrepAfterRatio`
- `twinUnlockPrepReserveRequired`
- `twinUnlockPrepReserveAfter`

### Scope and behavior

This hotfix is intentionally narrow:

- no broad strategy additions
- no widened automation scope
- no aggressive Smart Mode buyMax behavior
- no default ability auto-cast changes
- no default auto-ascend changes
- no Nightbug/Bat default auto-buy behavior
- no change to `twinUnlockNearThresholdRatio` value itself

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
