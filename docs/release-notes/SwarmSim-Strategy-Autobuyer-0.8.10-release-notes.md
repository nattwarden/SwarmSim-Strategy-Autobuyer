# SwarmSim Strategy Autobuyer 0.8.10 — Territory Scanner + Guard Bar / Overseer UI

Date: 2026-07-09

## Summary

0.8.10 is a narrow follow-up on 0.8.9. It focuses on two visible improvements:

- Territory/Army now gets a real scanner path for House of Mirrors army prep, including bounded army-seed proposals when the missing fighting units are empty.
- The Strategy Bar is now split into clearer guard sections with an explicit Overseer summary so lane proposals, overseer selection, and actual buys are easier to separate.

## What changed

### Territory Candidate Scanner

The Territory/Army lane now scans fighting units independently and can seed a bounded Army Prep proposal when House of Mirrors prep is missing its top fighting units.

The scanner now exposes clearer diagnostics when Territory does not buy, including:

- scanned fighting units
- visible fighting units
- buyable fighting units
- matched House of Mirrors missing units
- no matching unit found
- matching unit found but not buyable
- territory ROI below minimum
- blocked by Hatchery save-window
- blocked by Expansion save-window
- blocked by Clone Buffer hard lock
- blocked by protected resources
- not selected by coordinator

When the army is empty but House of Mirrors prep is missing, Territory can now present a bounded seed reason such as:

- `House of Mirrors army prep missing; seeding Stinger V with bounded scored chunk; hard blockers clear`
- `House of Mirrors army prep missing; no buyable matching fighting units found`

### HoM Army Seed proposal

House of Mirrors is still not auto-cast.

Instead, the Territory scanner can now use the current House of Mirrors missing-unit state to seed a small, bounded Army Prep proposal when:

- the missing fighting units are empty,
- a matching buyable fighting unit exists,
- the hard blockers are clear,
- and the config gate `territoryArmySeedWhenEmpty` is enabled.

This is meant to make the Army/Territory lane visible even when Meat also has a valid main action.

### Guard Status Bar / Overseer UI

The top Strategy Bar is now organized more clearly around the guards/lanes, with a separate Overseer summary and compact guard cards for:

- Engine / Larva
- Meat
- Territory / Army
- Energy
- Clone
- Ability
- Twin / Upgrade

The Overseer section now makes it easier to see:

- Decision
- Main selected
- Side selected
- Actions used
- Why selected
- Why no side
- Blocked by hard guard

### Diagnostics and versioning

The inspector/export now carries the new Territory scanner counts and the visible version was bumped to 0.8.10.

Hard safety defaults remain unchanged.

## Hard safety defaults preserved

Still preserved in 0.8.10:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Hatchery save-window remains active
- Expansion save-window remains active
- Clone Buffer hard lock remains active
- Smart Mode still uses bounded chunks, not blind buyMax

## What to inspect after installation

Look for these in the live log, Strategy Inspector, or exported markdown:

- `Territory: SIDE/BUY Army Prep ...`
- `Territory: HOLD Army Prep ...`
- `House of Mirrors army prep missing ...`
- `scanned fighting units`
- `visible fighting units`
- `buyable fighting units`
- `Why no side`
- `Blocked by hard guard`
- `Overseer decision`
- `Main selected`
- `Side selected`
- `Actions used`
- `Territory did not buy`

The main thing to avoid is the old inert state:

- `Territory: OBSERVE none — no lane-specific candidate this run`

when House of Mirrors prep is already telling us the army is missing.

## What did not change

- House of Mirrors still does not auto-cast.
- Clone Larvae still does not auto-cast.
- Auto-ascend stays off by default.
- Nightbug/Bat default auto-buy stays off.
- Meat-chain planning stays bounded and does not switch to blind buyMax.
