# SwarmSim Strategy Autobuyer 0.8.11 — Twin Prep Priority / Parent-Step Throughput Fix

Date: 2026-07-10

## Summary

0.8.11 is a focused planner fix for the meat lane.

The issue was that tiny Twin Prep threshold progress could still consume a main action and suppress better same-run parent-step conversion.

This release makes Twin Prep blocking conditional on meaningful prep, so buyable target-path parent steps can keep throughput when Twin Prep gain is too small.

## What changed

### Twin Prep meaningfulness gate

Twin threshold prep is now treated as meaningful only when at least one of these is true:

- near-threshold ratio is reached
- prep gain is materially large
- prep can finish the missing threshold chunk
- parent-step is not the better target-path action

Tiny, low-impact Twin Prep no longer automatically behaves like a hard same-run blocker.

### Parent-step preference preserved

When parent-step conversion is buyable, supports the active target path, and Twin Prep gain is not meaningful, parent-step keeps priority.

This addresses the observed path where small `hive network` prep stole budget from a stronger `neural cluster` conversion.

### Same-run filler blocking narrowed

The immediate same-run lower action-unit filler hold now requires meaningful Twin Prep, not only that Twin Prep executed.

This prevents overblocking after trivial threshold progress.

### Observability/export additions

Twin/Parent decision diagnostics are now exposed through Strategy Inspector, run history, and log export payload/markdown:

- twin prep meaningful
- twin prep progress gain
- twin prep meaningful gate
- twin deferred by parent step
- parent-step preferred over twin prep
- why parent-step won
- why twin prep did not win

### Versioning

- script/export version bumped to `0.8.11`
- settings panel title/help text version references updated to `0.8.11`

## Hard safety defaults preserved

Still preserved in 0.8.11:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Hatchery/Expansion save windows remain enabled
- Clone Buffer hard lock remains enabled
- Smart Mode remains bounded/chunked (no blind buyMax)

## What to inspect after installation

Look for these signals in Inspector/export when Twin Prep and parent-step both appear on path:

- `Twin prep meaningful`
- `Twin prep gain`
- `Twin deferred by parent`
- `Parent preferred over twin`
- `Why parent-step won`
- `Why twin prep did not win`

Expected behavior in the problematic case: parent-step conversion should run while tiny Twin Prep should not suppress same-run throughput.
