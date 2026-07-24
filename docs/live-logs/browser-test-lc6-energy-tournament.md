# SwarmSim Laboratory LC-6 Energy Tournament Verification

- Verdict: LABORATORY LC-6 ENERGY TOURNAMENT VERIFIED
- Implementation commit: 1e42009dd3121c5dd587c42a07f2b05fe45521d1
- Metric model: larva-at-horizon-with-energy-spend; timing: live-site-tick-reify-horizons; horizons (s): [0,3600]
- Advisor-only authority unchanged (advisor-only actions non-executable in production): true
- Auto-cast after: {"autoCastAbilities":false,"autoCastCloneLarvae":true,"autoCastHouseOfMirrors":false,"autoAscend":false}

## LD-09 (balanced natural Nexus 5)
- Winner: CAST_CLONE_LARVAE; executed: 7; source unchanged: true

| Candidate | Executed | energy spent | larva by horizon |
|---|---|---|---|
| HOLD | false | 0 | 0s=75636895843.136392619, 3600s=77866614772.318672335 |
| CONSTRUCT_NEXUS | false | 0 | 0s=75636903894.899192444, 3600s=77866622824.08147216 |
| CAST_MEAT_RUSH | true | 1600 | 0s=75636911327.295623051, 3600s=77866630256.477902767 |
| CAST_TERRITORY_RUSH | true | 1600 | 0s=75636931766.385807222, 3600s=77866650695.568086938 |
| CAST_LARVA_RUSH | true | 1600 | 0s=77384229630.747401701, 3600s=79613948559.929681417 |
| CAST_CLONE_LARVAE | true | 12000 | 0s=148435521810.51115542, 3600s=150665240739.69343514 |
| CAST_HOUSE_OF_MIRRORS | true | 2500 | 0s=75636974502.665283216, 3600s=77866693431.847562932 |
| CAST_SWARM_WARP | true | 2000.000350830300273 | 0s=76292174313.173650024, 3600s=78521893242.35592974 |
| BUY_LEPIDOPTERA | true | 10 | 0s=75637001134.41915956, 3600s=77866720063.601439276 |

## LD-07 (pre-Nexus-5, kept separate)
- Winner: CAST_LARVA_RUSH; executed: 2; source unchanged: true; authority unchanged: true

