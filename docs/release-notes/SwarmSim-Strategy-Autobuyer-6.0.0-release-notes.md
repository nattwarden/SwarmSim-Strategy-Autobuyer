# SwarmSim Strategy Autobuyer 6.0.0

## Version policy

Milestone-aligned major versioning continues from M5. This release begins
Milestone 6 at `6.0.0`.

## What changed

- Added the six-domain strategic coordinator across Meat, Larva/Engine,
  Army/Territory, Energy production, Energy abilities, and Ascension/Mutagen.
- Council and Inspector now surface the active milestone, selected horizon,
  best allowed comparable action, important alternatives, blockers, confidence,
  reconsideration trigger, authority state, and shared-cost/effect audit data.
- Added a public read-only `window.kbcSwarmBot.strategicCoordinator` API for
  evaluating the coordinator, reading the current result, reading the manifest,
  and exposing coverage data.
- Preserved the existing bounded reversible purchase execution path and kept
  Energy abilities, Ascension, Mutagen, and Swarmwarp advisor-only.

## Safety and scope

- `autoCastAbilities`, `autoAscend`, and `energySupportBrokerAllowAutoCast`
  defaults remain disabled.
- Nexus and Energy protection remain enabled.
- No new execution key was added.
- Laboratory remains gated, manual, read-only, and simulation-only.