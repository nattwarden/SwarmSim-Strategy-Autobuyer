# SwarmSim Strategy Autobuyer 0.8.14 - Swarm Council Advisor UI

Date: 2026-07-10

## Summary

0.8.14 is a presentation-only UI/UX release built on top of 0.8.13.

It adds the Swarm Council advisor view for the Strategy Bar so the existing
Strategy Inspector state is easier to scan without changing planner decisions,
scoring, guards, purchase behavior, Twin Prep gating, or Parent Refill logic.

## What changed

### Swarm Council Strategy Bar

The Strategy Bar can now render as The Swarm Council with:

- a compact summary row for phase, goal, main selected, side selected, actions
  used, next likely buy, and important blocker
- a Focus now section built from existing Strategy Inspector fields
- advisor cards for each major lane
- visible BUY/HOLD/OBSERVE/PLAN badges
- expandable technical details per advisor card

### Advisor personas

Added UI-only personas:

- General Mandible - Territory & Army
- Beetle Magus - Energy & Abilities
- Larva Steward - Larvae & Clone Buffer
- Flesh Smith - Meat Chain
- Twin Oracle - Upgrades & Thresholds
- Brood Architect - Hatchery & Expansion

### Council UI toggle

Added a UI-only setting:

- `Council UI`

When enabled, the Strategy Bar uses the Swarm Council presentation. When
disabled, it falls back to the classic Strategy Bar card layout.

## Debug detail preserved

The technical Strategy Inspector rows, Markdown export, JSON export, run
history, lane candidates, raw blockers, reserve ratios, payback fields,
parent-step/refill fields, Twin Prep meaningful fields, clone buffer fields,
and territory diagnostics remain available.

## Hard safety defaults preserved

Still preserved in 0.8.14:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Clone Buffer protection remains enabled
- Smart Mode remains bounded/chunked
- the 0.8.13 Twin Prep meaningful gate remains intact
- the 0.8.12 Parent Refill path remains intact

## What did not change

- No planner changes
- No scoring changes
- No reserve/payback changes
- No purchase behavior changes
- No safety default changes
- No Twin Prep gate changes
- No Parent Refill logic changes
- No external assets, images, fonts, CDNs, or generated media

## What to inspect after installation

Open the Strategy Bar and check:

- The Swarm Council summary reads quickly at the top.
- Focus now explains the current user-facing priority.
- Advisor cards map to existing lanes and show BUY/HOLD/OBSERVE/PLAN.
- Technical details expand on each card without hiding raw Strategy Inspector
  or export fields.
- Turning Council UI off restores the classic Strategy Bar view.
