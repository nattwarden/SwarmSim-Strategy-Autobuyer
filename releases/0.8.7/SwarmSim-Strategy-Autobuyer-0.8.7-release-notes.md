# SwarmSim Strategy Autobuyer 0.8.7 — release notes

Date: 2026-07-09

## Summary

0.8.7 is a narrow hotfix on top of 0.8.5.

Because main was still 0.8.5, this release includes both:

- missing 0.8.6 Twin Threshold Reachability Fix behavior (safe prep below near-threshold ratio)
- 0.8.7 Twin Upgrade Opportunity Cost Bypass behavior

It keeps the Twin Unlock post-upgrade rebuild buffer guard while allowing reachability prep and conservative opportunity-cost buy decisions in the requested twin states.

Safe defaults are unchanged.

## What changed

### Included 0.8.6 reachability behavior

Twin unlock planning no longer stops at `threshold not near enough` when concrete threshold prep is reachable.

If current threshold resource is below `twinUnlockNearThresholdRatio` (for example 522/1000), the planner now still evaluates twin threshold prep safety and will BUY prep when safe.

Reason text now identifies this path explicitly as:

- `threshold reachability prep below near-threshold ratio (...)`

### Twin unlock opportunity-cost bypass

When a target-path twin upgrade is already buyable and HOLD was caused only by post-upgrade rebuild buffer, the planner now evaluates opportunity cost:

- estimate lost child-resource production from spending the twin threshold cost resource
- estimate one-hour production loss
- compare one-hour loss to current child-resource bank
- allow BUY only if loss ratio is within configured limit

New conservative config:

- `twinUpgradeOpportunityCostBypass: true`
- `twinUpgradeMaxLostProductionBankRatioPerHour: 0.001` (0.1%/h)

This is not an absolute-count shortcut and does not blanket-allow low thresholds.

### Observability additions

Twin unlock state/inspector/export now includes:

- `twinUnlockOpportunityCostBypass`
- `twinUnlockOpportunityCostReason`
- `twinUnlockLostProductionPerSecond`
- `twinUnlockLostProductionPerHour`
- `twinUnlockLostProductionBankRatioPerHour`
- `twinUnlockLostProductionBankRatioLimit`
- `twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe`

Reasons now clearly report:

- upgrade buyable state
- rebuild unsafe state
- opportunity-cost pass/fail
- lost production and ratio vs bank
- final BUY/HOLD decision

## Scope and behavior

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
- post-upgrade rebuild buffer remains active when opportunity-cost bypass does not pass

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source remains `src/SwarmSim-Strategy-Autobuyer.user.js`.
Release folders remain documentation-only.
