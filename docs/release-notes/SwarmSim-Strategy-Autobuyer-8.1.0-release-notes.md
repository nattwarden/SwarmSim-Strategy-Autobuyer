# SwarmSim Strategy Autobuyer 8.1.0

## Milestone 8

This release extends Milestone 8 with a less restrictive Smart default profile so progression feels more continuous.

### Player-visible behavior

- Smart mode spends in larger chunks by default (`smartUnitBuyPercent` from `0.25` to `0.35`).
- Meat fallback becomes available earlier in sustained HOLD patterns (`meatFallbackMinHoldRuns` from `5` to `2`).
- Meat fallback can evaluate a wider lower-chain window and spend larger bounded chunks (`meatFallbackMaxRankDrop` from `8` to `12`, `meatFallbackChunkPercent` from `10` to `20`).
- Meat reserve/payback guards are still active but less restrictive (`meatChainReserveMultiplier` from `2` to `1.25`, `meatChainMaxPaybackSeconds` from `1800` to `3600`).
- Hatchery/Expansion save windows are tightened to reduce over-saving (`saveForHatcherySeconds` from `600` to `180`, `saveForExpansionSeconds` from `1800` to `600`).

### Safety and authority

- Hard irreversible defaults remain unchanged.
- Ability, Ascension, and Mutagen remain advisor-only and non-executable.
- Reserve/protected-resource guards and bounded revalidation remain active.

### Verification

- Added version-surface checker: `check:8.1.0:versions`
- Verify chain now checks `check:8.1.0:versions`
- Focused M8 checker remains in the verify chain
