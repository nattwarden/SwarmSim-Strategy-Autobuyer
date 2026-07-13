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
- Live coordination consumes the evaluated M4 and M5 advisor results rather
  than their raw input snapshots.
- A reversible global winner receives authority only when its lane, candidate,
  execution key/id/kind/variant, bounded amount, fingerprint, and decision cycle
  exactly match the accepted purchase coordinator before and after immediate
  revalidation. Advisor, uncertain, mismatched, or drifted winners do not fall
  through to another purchase.
- The existing `council-ui-state.v1` public API and 5.0.1 Council artwork and ETA
  fixes remain intact.

## Safety and scope

- `autoCastAbilities`, `autoAscend`, and `energySupportBrokerAllowAutoCast`
  defaults remain disabled.
- Nexus and Energy protection remain enabled.
- No new execution key was added.
- Laboratory remains gated, manual, read-only, and simulation-only.
