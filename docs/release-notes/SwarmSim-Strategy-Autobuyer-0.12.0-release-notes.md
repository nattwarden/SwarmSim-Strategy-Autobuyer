# SwarmSim Strategy Autobuyer 0.12.0 - Laboratory Snapshot Foundation

Date: 2026-07-10

## Summary

0.12.0 starts SwarmSim Laboratory as a development-only snapshot foundation.

This is snapshot-only:

- no action simulation
- no WAIT projection
- no Clone Larvae cast
- no House of Mirrors cast
- no CSV or Markdown experiment report
- no total score
- no recommendation
- no normal autobuyer behavior change

## Formula Authority

Laboratory formula provenance is pinned to Swarm Simulator's external source repository:

```text
https://github.com/swarmsim/swarm
commit 06b4f404aa324a0b454348508cfa63d5c0f1ff54
```

The external Swarm repository is used only as a formula reference. It is not copied into this repository and is not a runtime dependency for the Tampermonkey script.

Phase 1A references:

- `swarmsim-coffee/app/scripts/services/effect.coffee`
- `swarmsim-coffee/app/scripts/services/unit.coffee`
- `tables/src/upgrade/data.ts`
- `tables/src/unittype/data.ts`

## What Changed

- Added a gated `swarmsim-lab.snapshot.v1` JSON capture path.
- Added `formulaProvenance.sourceCommit` with the pinned base-game commit.
- Captured Energy, larvae, cocoons, territory, meat producer coefficients, Expansion consistency, Clone Larvae observability, and House of Mirrors army inputs.
- Added deterministic canonical JSON hash rules with `snapshotHashScope: deterministic-payload-v1`.
- Added local Laboratory snapshot contract checks to `npm run verify`.
- Updated documentation for Phase 1A scope, hash rules, development gating, formula provenance, and known baseline limitations.

## Safety

Hard safety defaults are unchanged:

- `autoCastAbilities=false`
- `autoAscend=false`
- Nexus/energy protection remains enabled
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no aggressive Smart buyMax default

## Explicitly Not Changed

- No planner strategy change
- No normal advisor/autobuyer behavior change
- No action simulator
- No full base-game simulator
- No copied base-game source
