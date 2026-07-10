# 0.12.2 Live Real-Save Post-HoM Capture Run

Date: 2026-07-10

Scope: SwarmSim `v1.1.17`, SwarmBot `v0.12.2`, same saved game after the earlier manual House of Mirrors cast.

Raw companion: `live-real-save-post-hom-capture-run-2026-07-10.json`

## Result

- `Capture + Run` produced a fresh `live-read-only` Laboratory result.
- Snapshot hash: `sha256:10298651b481f159656729afafc847212a90cf488f5c06024c7400b34f213ba8`
- Experiment hash: `sha256:ef7743b80e8e501bd4792ebe0724f2dfeb3ad0a08848f430e6c5f12747423032`
- Validity: `valid-with-warnings`
- Non-mutation proof: `true`

## Key Rows

60 seconds:

| Action | Status | Energy | Energy delta vs WAIT | Territory/sec delta | Reserve after action | Formula status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| WAIT | Valid | `4474.4716940114254929` | | | `4316.0234181493565274` | Inputs verified |
| CLONE_LARVAE | Action unavailable | | | | | Inputs captured |
| HOUSE_OF_MIRRORS | Valid | `1974.4716940114254929` | `-2500` | `0` | `1816.0234181493565274` | Inputs verified |

300 seconds:

| Action | Status | Energy | Energy delta vs WAIT | Territory/sec delta | Reserve after action | Formula status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| WAIT | Valid | `4897.000429643609401` | | | `4316.0234181493565274` | Inputs verified |
| CLONE_LARVAE | Action unavailable | | | | | Inputs captured |
| HOUSE_OF_MIRRORS | Valid | `2397.000429643609401` | `-2500` | `0` | `1816.0234181493565274` | Inputs verified |

## Facts

- `HOUSE_OF_MIRRORS` is no longer falsely invalid in this 0.12.2 live capture when energy is above 2500.
- `CLONE_LARVAE` reports `Action unavailable`, not `Invalid action`, when the current energy bank is below 12000.
- HoM's reported value delta is zero in this snapshot, but later second-cast testing shows this is likely a Laboratory value/projection mismatch rather than a real already-mirrored no-op.
- A 10-second UI energy sample moved from `4 343` to `4 361` energy while the Energy row reported `+1.76/sec`; this is a coarse UI-level match.
