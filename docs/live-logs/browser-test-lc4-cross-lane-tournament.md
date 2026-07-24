# SwarmSim Laboratory LC-4 Cross-Lane Tournament Verification

- Verdict: LABORATORY LC-4 CROSS-LANE TOURNAMENT VERIFIED
- Implementation commit: bfb29df081a9a5861840e8b7dd484f6595263221
- Metric model: instantaneous-larva-rate-delta
- Timing model: live-site-nonhermetic-raw-state

## LD-05 (rich multi-lane)
- Save: docs/test-data/player-saves/manual-play-active-chain-pre-ascension-2026-07-18.txt (sha256 c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c)
- Lanes covered (no omission): ["Territory","Engine","Energy","Meat","Upgrade","Twin","Clone Prep"]
- Enumerated / executed / unresolved: 27 / 24 / 2
- All restores identical (no larva double-spend): true
- Source raw state unchanged: true
- Laboratory winner: Engine:Expansion
- Production first BUY: Engine:Expansion (winner agrees: true)
- Territory-over-Meat crossover: open

| Executed candidate | Lane | Prod decision | larva/s delta | territory/s delta | meat/s delta |
|---|---|---|---|---|---|
| Territory:swarmling | Territory | HOLD | 0 | 0.28 | 0 |
| Engine:Expansion | Engine | BUY | 7.157635370578499091 | 0 | 0 |
| Engine:Hatchery | Engine | BUY | 6.506941245980453719 | 0 | 0 |
| Energy:construct nexus | Energy | BUY | 1.208018398113312113 | 0 | 0 |
| Meat:nest | Meat | BUY | 0 | 0 | 0 |
| Upgrade:faster queens | Upgrade | OBSERVE | 0 | 0 | 0 |
| Twin:twin drones | Twin | OBSERVE | 0 | 0 | 0 |
| Upgrade:faster drones | Upgrade | BUY | 0 | 0 | 5511881108201240 |
| Twin:twin swarmlings | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin stingers | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin arachnomorphs | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin culicimorphs | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin locusts | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin roaches | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin giant arachnomorphs | Twin | HOLD | 0 | 0 | 0 |
| Twin:twin chilopodomorphs | Twin | HOLD | 0 | 0 | 0 |
| Meat:queen | Meat | OBSERVE | 0 | 0 | -800 |
| Meat:drone | Meat | OBSERVE | 0 | 0 | 256 |
| Territory:stinger | Territory | HOLD | 0 | 6.3 | 0 |
| Territory:arachnomorph | Territory | HOLD | 0 | 141.75 | 0 |
| Territory:culicimorph | Territory | HOLD | 0 | 51030 | 0 |
| Territory:locust | Territory | HOLD | 0 | 287043.75 | 0 |
| Territory:roach | Territory | HOLD | 0 | 12916968.75 | 0 |
| Territory:giant arachnomorph | Territory | HOLD | 0 | 581263593.8 | 0 |

## LD-09 (balanced natural Nexus 5)
- Lanes covered: ["Territory","Engine","Upgrade","Energy","Clone Ramp","Clone Prep","Ability"]; executed: 8; winner: Engine:Expansion; source unchanged: true

