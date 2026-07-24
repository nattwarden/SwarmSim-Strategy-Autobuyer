# SwarmSim Laboratory LC-3 Engine Tournament Verification

- Verdict: LABORATORY LC-3 ENGINE TOURNAMENT VERIFIED
- Implementation commit: 12db48a7436b9ae9139def142f4ac02dabfc1183
- Metric model: instantaneous-larva-rate-delta
- Timing model: live-site-nonhermetic-raw-state
- Phase target: larva-engine-throughput
- Source save (LD-01): docs/test-data/player-saves/manual-play-early-pre-ascension-2026-07-18.txt (sha256 15d8b98302f833d4d8d2dc596def6fdb421d21e7fc2b955ba4462e58a01f22ff)
- Source raw-state unchanged after tournament: true
- All candidate restores identical to source: true
- Laboratory independent winner: BUY_HATCHERY (margin 9.090909090909092% )
- Runtime-observed Engine choice: BUY_EXPANSION (raw: Engine:Expansion:BUY)
- Winner agrees with runtime: false

| Candidate | Executed | larva/s before | larva/s after | larva gain % |
|---|---|---|---|---|
| HOLD | false | 8.857805 | 8.857805 | 0 |
| BUY_EXPANSION | true | 8.857805 | 9.7435855 | 10 |
| BUY_HATCHERY | true | 8.857805 | 10.629366 | 20 |

