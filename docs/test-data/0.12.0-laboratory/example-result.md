# SwarmSim Laboratory Phase 1 Result

- Experiment ID: `LAB-001`
- Experiment hash: `sha256:f14c3d66b4670535925fdcb03171636f7ddbf0eee1129c24bc96728e0ebb246a`
- Snapshot ID: `LAB-001`
- Snapshot hash: `sha256:1bbc715d2d2730ee414a1bee3862f479e3922248580ae181a4208f7454f252c5`
- Formula set: `swarmsim-runtime-formulas`
- Post-action policy: `passive-only`

WAIT, Clone Larvae, and House of Mirrors are compared from the same immutable snapshot. No total winner or global recommendation is produced.

## 60 seconds

| Action | Status | Legal | Applied | Safe | Larvae | Cocoons | Meat/sec | Territory | Territory/sec | Energy | Expansion ETA | Reserve | Safety | Formula | Warnings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| WAIT | ok | true | true | true | 900719925474106707410 | 123456789012345 | 1000000 | 1.6055654038901603482e+21 | 26759423381502672470 | 500750 | 0 | 499625 | false | ok |  |
| CLONE_LARVAE | ok | true | true | true | 900719925486452386310 | 123456789012345 | 1000000 | 1.6055654038901603482e+21 | 26759423381502672470 | 488750 | 0 | 487625 | false | ok |  |
| HOUSE_OF_MIRRORS | ok | true | true | true | 900719925474106707410 | 123456789012345 | 1000000 | 3.2111308067803206964e+21 | 53518846763005344940 | 498250 | 0 | 497125 | false | ok |  |

## 300 seconds

| Action | Status | Legal | Applied | Safe | Larvae | Cocoons | Meat/sec | Territory | Territory/sec | Energy | Expansion ETA | Reserve | Safety | Formula | Warnings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| WAIT | ok | true | true | true | 900719925474136337040 | 123456789012345 | 1000000 | 8.027827015450801741e+21 | 26759423381502672470 | 503750 | 0 | 499625 | false | ok |  |
| CLONE_LARVAE | ok | true | true | true | 900719925486482015940 | 123456789012345 | 1000000 | 8.027827015450801741e+21 | 26759423381502672470 | 491750 | 0 | 487625 | false | ok |  |
| HOUSE_OF_MIRRORS | ok | true | true | true | 900719925474136337040 | 123456789012345 | 1000000 | 1.6055654029901603482e+22 | 53518846763005344940 | 501250 | 0 | 497125 | false | ok |  |

No larvae-spending policy is active, so meat/sec is normally identical across branches unless a formula mismatch or incomplete snapshot is reported.
