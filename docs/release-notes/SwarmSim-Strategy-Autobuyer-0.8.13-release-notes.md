# SwarmSim Strategy Autobuyer 0.8.13 — Twin Prep Meaningful Gate Regression Fix

Date: 2026-07-10

## Summary

0.8.13 is a narrow hotfix for a 0.8.12 regression in the Twin Unlock Prep path.

0.8.12 correctly preserved parent-step refill and same-run bounded action-unit recovery, but Twin Unlock Prep could again spend a main action on tiny threshold prep chunks even when the threshold was still far away.

This release restores a strict meaningfulness gate for Twin Prep without widening automation, changing safety defaults, or weakening the 0.8.12 parent-step refill fix.

## What changed

### Twin Prep meaningfulness restored

Twin Unlock Prep now buys only when the prep is materially meaningful.

Prep may BUY only when at least one of these is true:

- current threshold ratio is already at or above the configured near-threshold ratio
- the bounded prep chunk reaches the threshold this run
- the bounded prep chunk advances threshold progress by a meaningful amount

When the threshold is still far away and the bounded chunk is tiny, Twin Prep now stays HOLD/OBSERVE.

### “Below near-threshold” no longer acts like a BUY reason

The old path where low ratio text such as `27.2% < required 60%` could still flow into a BUY has been removed.

In those states, logs now explain that the threshold is too far and the prep chunk is not meaningful yet.

### Parent-step refill preserved

The 0.8.12 parent-step fix remains intact:

- parent-step conversion can still execute when safe
- same-run target-path refill can still follow when budget remains
- anti-pingpong still allows bounded refill when the refill is genuine target-path recovery

### Twin observability expanded

Inspector/export now surfaces the Twin Prep decision more explicitly, including:

- current threshold amount
- required threshold amount
- missing threshold amount
- threshold ratio
- configured near-threshold ratio
- prep candidate
- prep chunk
- prep decision
- prep meaningful yes/no
- prep progress gain
- prep deferred reason
- why Twin Prep did not win
- parent-step/refill preserved visibility

## Hard safety defaults preserved

Still preserved in 0.8.13:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Clone Buffer protection remains enabled
- Smart Mode remains bounded/chunked

## What did not change

- No global reserve/payback loosening
- No aggressive buyMax behavior
- No territory/army strategy rewrite
- No parent-step refill rollback
- No new broad strategy layer

## What to inspect after installation

In the prior regression scenario, expect:

- Twin threshold ratio well below near-threshold
- tiny prep chunk shown explicitly
- `Twin prep meaningful: no`
- `Twin prep decision: HOLD`
- a deferred reason explaining that the threshold is too far and the chunk is too small

At the same time, when parent-step remains the correct path, expect to keep seeing:

- `Parent Step`
- `Parent Refill`
- same-run follow-through when safe