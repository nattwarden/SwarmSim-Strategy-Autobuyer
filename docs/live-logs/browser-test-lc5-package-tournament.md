# SwarmSim Laboratory LC-5 Package Tournament Verification

- Verdict: LABORATORY LC-5 PACKAGE TOURNAMENT VERIFIED
- Implementation commit: 2dd52c62c310c858ae08582071264483b9700c7c
- Metric model: active-larva-rate-post-package
- Timing model: live-site-nonhermetic-active-only
- Horizon model: active-only: live-site game.skipTime is a no-op, so passive/offline horizons are not measured
- Requested horizons (s): [0,300,3600]; reserve multiplier: 1.25
- Source save (LD-02): docs/test-data/player-saves/manual-play-first-nest-threshold-2026-07-18.txt (sha256 a86d8524e351fd3034ff4fe89e10644713a40f87a69e00ca55b19bf5d5076cbd)
- All branch restores identical / source unchanged: true / true
- Laboratory winner (active larva rate): engine-hatchery-expansion

| Package | Steps | Completed | Invalidated at | active larva/s | active larva |
|---|---|---|---|---|---|
| HOLD | 0 | true | - | 8.857805 | 4815462.880883092 |
| engine-hatchery-expansion | 2 | true | - | 11.6923026 | 4815462.916314312 |
| queen-nest-sacrifice-rebuild | 3 | true | - | 8.857805 | 4815460.252910902 |
| invalid-stop | 1 | false | build-nonexistent | 8.857805 | 4815463.633796517 |

