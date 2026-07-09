# SwarmSim Strategy Autobuyer 0.8.12 — Parent-Step Refill / Action Budget Fix

Date: 2026-07-10

## Summary

0.8.12 is a narrow follow-up to 0.8.11.

The fix targets one specific remaining issue: after a safe parent-step conversion consumes the active action-unit, the same run could still skip bounded action-unit refill even when action budget remained.

0.8.12 adds an explicit parent-step refill pass with bounded guards and concrete blocker diagnostics.

## What changed

### Explicit parent-step refill pass

After a parent-step BUY is executed, the meat coordinator now evaluates a bounded refill pass for the active action-unit when all of the following are true:

- action budget remains in the current run
- parent-step consumed the active action-unit
- action-unit is still on the active target path
- refill chunk is buyable
- protected-resource and guard checks pass

Expected path in relevant states:

- `BUY neural cluster`
- follow-up evaluation for `BUY hive neuron`

### Nuanced same-run anti-pingpong

The old broad blocker was replaced by a narrower rule.

The anti-pingpong guard stays active, but it now allows refill when parent-step consumed the action-unit and refill is still target-path progress.

When refill is blocked, diagnostics now report concrete reasons, for example:

- `blocked by Hatchery save-window`
- `blocked by Expansion save-window`
- `blocked by clone buffer`
- `blocked by larva reserve`
- `blocked by payback`
- `blocked by reserve`
- `blocked by no safe chunk`
- `blocked by coordinator single-main limit`
- `blocked by anti-pingpong because refill would undo parent-step without target gain`

### Action-unit payback bypass now evaluated during refill

In parent-step refill evaluation, action-unit payback bypass is explicitly evaluated instead of being skipped.

When bypass does not apply, the reason is now concrete instead of generic.

### Action budget and follow-up observability

Inspector/export now includes explicit follow-up and budget fields for the parent-step refill path.

## Observability additions

Added/expanded in Strategy Inspector, run history, and export:

- `Parent step consumed action unit`
- `Parent step consumed unit`
- `Action-unit refill candidate`
- `Action-unit refill decision`
- `Action-unit refill reason`
- `Action-unit refill blocked by`
- `Action-unit refill reserve ratio`
- `Action-unit refill payback`
- `Action-unit refill payback bypassed`
- `Action budget remaining after parent-step`
- `Follow-up action selected`
- `Why no follow-up action`
- `Anti-pingpong guard active`
- `Anti-pingpong guard allowed refill`
- `Coordinator remaining-budget reason`

## Versioning

- script/export version bumped to `0.8.12`
- settings panel/version text updated to `0.8.12`
- package version bumped to `0.8.12`

## Hard safety defaults preserved

Still preserved in 0.8.12:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Hatchery/Expansion save windows remain enabled
- Clone Buffer hard lock remains enabled
- Smart Mode remains bounded/chunked (no blind buyMax)

## What did not change

- No global reserve/payback loosenings
- No aggressive buyMax behavior
- No broad territory/army strategy rewrites
- No rollback of the 0.8.11 Twin Prep meaningful gate
