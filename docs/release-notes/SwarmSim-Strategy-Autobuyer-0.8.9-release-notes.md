# SwarmSim Strategy Autobuyer 0.8.9 — Methodical Lane Follow-through / Visible Progress Fix

Date: 2026-07-09

## Summary

0.8.9 is a narrow runtime follow-through fix on top of the 0.8.8 multi-lane coordinator baseline.

The goal is not another observability-only pass. The goal is to make Smart Mode act more methodically when Territory/Army has a safe, bounded reason to move, while keeping hard safety defaults intact.

## What changed

### Energy/Nexus locked/unavailable diagnostics

Before Energy/Nexus is visible or unlocked, the Energy lane no longer surfaces as an active blocker.

Instead, the lane stays in a locked/unavailable observe state until the Nexus/Energy surface is actually visible. Once the lane is unlocked, normal Nexus and energy protection continues unchanged.

### Top-level Reason now matches the action that actually ran

When the bot executes a BUY action, the top-level Strategy Inspector reason now comes from the selected main action instead of falling back to a later advisor-only HOLD such as House of Mirrors prep.

The inspector/export now also includes:

- `Main reason`
- `Side reason`

This makes it easier to verify that `Decision`, `Main`, and `Reason` all describe the same action.

### Methodical Territory/Army follow-through

Territory/Army follow-through is still bounded and guarded, but it is no longer limited to starvation-only selection when Meat does not take the run.

A Territory proposal can now be selected earlier when at least one of these is true:

- the proposal is a bounded safe army seed for House of Mirrors prep,
- the proposal passes Territory ROI minimums toward Expansion,
- the Territory lane has already starved long enough to force selection.

This should make live runs more visibly methodical:

- `Main: BUY Meat ...`
- `Side: BUY Territory ...`

or, when Meat does not buy first:

- `Main: BUY Territory ...`

and when it still does not buy, the lane should more often report a concrete HOLD reason instead of looking inert.

### Version and wording cleanup

The visible version strings were bumped to `0.8.9`.

Methodical wording was kept or reinforced in version-facing UI and docs.

## Why this should be noticeable in live-test

The previous coordinator baseline could still look passive when Territory had a safe candidate but did not win selection often enough to be visible.

0.8.9 makes that follow-through easier to see without widening automation scope:

- locked Energy/Nexus no longer creates false active blockers early,
- top-level reason text now reflects the real action,
- Territory/Army can surface as a concrete bounded action earlier when the math supports it.

## Hard safety defaults preserved

Still preserved in 0.8.9:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled after unlock
- Hatchery save-window remains active
- Expansion save-window remains active
- Clone Buffer hard lock remains active
- Smart Mode still uses bounded chunks, not blind buyMax

## What to inspect after installation

Check these fields in the Strategy Inspector or exported log:

- `Script` / visible version should show `0.8.9`
- metadata `@description` should say `Methodical`, not `Conservative`
- `Decision`
- `Main`
- `Side`
- `Reason`
- `Main reason`
- `Side reason`
- `Selected lanes`
- `Territory starvation`
- `Last territory action age`
- `Territory prep candidate`
- `Territory prep decision`
- `Territory prep reason`
- `Army prep missing units`
- `Why territory did not buy`

Look specifically for:

- no active Energy/Nexus blocker before that lane is visible,
- top-level `Reason` matching the actual BUY action,
- Territory/Army showing a concrete BUY or HOLD reason instead of an unhelpful inert state,
- meat-chain progression still continuing normally when it remains the correct main action.
