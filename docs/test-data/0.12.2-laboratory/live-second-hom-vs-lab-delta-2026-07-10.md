# 0.12.2 Second Live HoM vs Laboratory Delta

Date: 2026-07-10

Scope: SwarmSim `v1.1.17`, SwarmBot `v0.12.2`, same saved game after one previous manual House of Mirrors cast.

Raw companion: `live-second-hom-vs-lab-delta-2026-07-10.json`

## Summary

This test intentionally cast House of Mirrors a second time in the live save, then compared live UI effects with read-only Laboratory projections.

Result: `0.12.2` fixes HoM legality, stale snapshot handling is coherent, but HoM value projection still appears wrong. The Laboratory reports `Territory/sec delta = 0` for legal HoM branches, while the live cast doubled visible army rows and aggregate territory/sec again.

## Live Cast Evidence

Before second cast:

- Energy: `4 870`
- Territory: `171DTg +45.6UTg/sec`
- Swarmling V: `203Sx +6.43UTg/sec`
- Goon IV: `49.3Sp +34.6UTg/sec`

After second cast:

- Energy: `2 377`
- Territory: `171DTg +91.2UTg/sec`
- Swarmling V: `407Sx +12.8UTg/sec`
- Goon IV: `98.7Sp +69.2UTg/sec`

The live UI therefore confirms another approximately 2x army/territory production effect.

## Laboratory Evidence

Previous snapshot before the second cast:

- Snapshot hash: `sha256:10298651b481f159656729afafc847212a90cf488f5c06024c7400b34f213ba8`
- `HOUSE_OF_MIRRORS Valid`
- Energy delta vs WAIT: `-2500`
- Territory/sec delta: `0`

After the second cast, `Run Last Snapshot` kept the same snapshot and experiment hashes, proving immutable snapshot replay.

Fresh capture below the threshold:

- Snapshot hash: `sha256:6ae61d8024f51b5839c4e0e9ca3b352c52068f09ab1f309c65ccb1f40b36fe96`
- Energy: about `2401`
- `HOUSE_OF_MIRRORS Action unavailable`

Fresh capture after waiting above the threshold:

- Snapshot hash: `sha256:05080d202f41dca73651f3a480584c998c916012ae3caba2778ef16bdd3a3275`
- Energy: about `2583`
- `HOUSE_OF_MIRRORS Valid`
- Energy delta vs WAIT: `-2500`
- Territory/sec delta: `0`
- Current live territory/sec: `+91.2UTg/sec`

## Interpretation

- HoM legality is behaving correctly in 0.12.2.
- Snapshot immutability is behaving correctly.
- Current-state capture is behaving correctly for energy threshold changes.
- HoM value projection is still suspect: the live game doubles territory/sec, but Phase 1 reports zero territory/sec improvement.

Code inspection points to the affected army contribution path rather than the immediate action legality path. `laboratoryHouseOfMirrorsImmediate()` returns `territoryPerSecondAfterAction` from its computed value, so the likely fault is in affected-unit contribution capture or the affected/unaffected territory split.
