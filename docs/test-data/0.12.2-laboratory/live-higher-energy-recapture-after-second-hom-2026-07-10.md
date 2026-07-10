# 0.12.2 Higher-Energy Recapture After Second HoM

Date: 2026-07-10

Scope: fresh `Capture + Run` and exports after energy had recovered to about `9650`, still below Clone Larvae's 12000 cost.

Raw exports:

- `live-exported-snapshot-higher-energy-after-second-hom-2026-07-10.json`
- `live-exported-result-higher-energy-after-second-hom-2026-07-10.json`
- `live-exported-result-higher-energy-after-second-hom-2026-07-10.md`

## Finding

The HoM affected-count bug reproduces in a fresh higher-energy snapshot.

| Field | Value |
| --- | --- |
| `snapshotHash` | `sha256:8c59485d009232d177bec531766293c5a3c97208b1751c1df0822fc92b7f5bc2` |
| `resources.energy.amount` | `9652.8344353907358377` |
| `resources.territory.perSecond` | `9.1296614409746199606e+97` |
| `army.affectedTerritoryPerSecondTotal` | `0` |
| `army.unaffectedTerritoryPerSecond` | `9.1296614409746199606e+97` |
| `houseOfMirrors.available` | `true` |
| `houseOfMirrors.affordable` | `true` |
| `houseOfMirrors.energyDeficit` | `0` |
| `houseOfMirrors.sourceVerifiedTerritoryPerSecondAfter` | `9.1296614409746199606e+97` |

All 11 affected units are resolved, but all captured affected counts and contributions remain `0`.

The live UI before capture still showed nonzero effective army rows:

- `Roach V 50.3B +293NVi/sec`
- `Swarmling V 407Sx +12.8UTg/sec`
- `Goon IV 98.7Sp +69.2UTg/sec`
- `Territory 263DTg +91.2UTg/sec`

## Clone Larvae

Clone Larvae remains correctly blocked below 12000 energy:

```text
not enough energy (current Energy 9652.8344353907358377, cost 12000, deficit 2347.1655646092641623)
```

The exported source-verified output and runtime preview still match:

```text
5.91497243127343332e+22
```

## Extra Diagnostic Note

The exported House of Mirrors object has `available=true`, `affordable=true`, and `energyDeficit=0`, but still contains:

```text
unavailableReason = House of Mirrors is unavailable.
unavailableReasonCode = UNKNOWN
```

This looks like a stale/default diagnostic field and should not be used when `available=true`.
