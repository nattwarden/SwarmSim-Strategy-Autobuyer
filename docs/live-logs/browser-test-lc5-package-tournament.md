# SwarmSim Laboratory LC-5 Package Tournament Verification

- Verdict: LABORATORY LC-5 PACKAGE TOURNAMENT VERIFIED
- Implementation commit: 3a1dda4e7ae24b28ded25309a55d88422c404c92
- Metric model: larva-at-horizon-with-reconstruction
- Timing model: live-site-tick-reify-horizons
- Horizon model: elapsed horizons advanced by game.tick(future)+reify (game.skipTime is a no-op); comparative, near-deterministic to the usual live-site micro-drift
- Horizons (s): [0,300,3600]; reserve multiplier: 1.25
- Horizon primitive advanced (s): 3600
- Source save (LD-02): docs/test-data/player-saves/manual-play-first-nest-threshold-2026-07-18.txt (sha256 a86d8524e351fd3034ff4fe89e10644713a40f87a69e00ca55b19bf5d5076cbd)
- All branch restores identical / source unchanged: true / true
- Laboratory winner (larva at 3600s): engine-hatchery-expansion

| Package | Steps | Completed | Invalidated at | larva by horizon |
|---|---|---|---|---|
| HOLD | 0 | true | - | 0s=4823412.902595472, 300s=4826070.244095472, 3600s=4855301.000595472 |
| engine-hatchery-expansion | 2 | true | - | 0s=4823413.026604742, 300s=4826920.717384742, 3600s=4865505.315964742 |
| queen-nest-sacrifice-rebuild | 3 | true | - | 0s=4823410.416348162, 300s=4826067.757848162, 3600s=4855298.514348162 |
| invalid-stop | 1 | false | build-nonexistent | 0s=4823413.859238412, 300s=4826071.200738412, 3600s=4855301.957238412 |

