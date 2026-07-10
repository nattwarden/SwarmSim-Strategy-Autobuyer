# 0.12.2 Clone and Expansion Diagnostics After Second HoM

Date: 2026-07-10

Scope: exported 0.12.2 live snapshot/result after the second manual House of Mirrors cast.

Raw exports:

- `live-exported-snapshot-after-second-hom-2026-07-10.json`
- `live-exported-result-after-second-hom-2026-07-10.json`

## Expansion

Expansion ETA `0` is internally consistent in this snapshot.

| Field | Value |
| --- | --- |
| `expansion.currentLevel` | `257` |
| `expansion.nextCost` | `1.0367730072995752038e+101` |
| `expansion.territoryRemaining` | `0` |
| `expansion.etaSeconds` | `0` |
| `expansion.laboratoryComputedEtaSeconds` | `0` |
| `expansion.etaComparison` | `match` |

WAIT projections also keep `expansionTerritoryRemaining = 0` and `expansionEtaSecondsAfter = 0`.

Conclusion: the table's Expansion ETA `0` is not the same class of bug as the HoM territory delta issue.

## Clone Larvae

Clone Larvae is blocked by insufficient energy, but its formula inputs are captured.

| Field | Value |
| --- | --- |
| `available` | `false` |
| `energyCost` | `12000` |
| `unavailableReason` | `not enough energy (current Energy 2572.973084816023194, cost 12000, deficit 9427.026915183976806)` |
| `formulaInputs.sourceVerifiedOutput` | `5.91497243127343332e+22` |
| `runtimePreviewOutput` | `5.91497243127343332e+22` |

Result rows:

- 60s: `status = invalid-action`, `actionLegal = false`, warning contains exact insufficient-energy reason.
- 300s: `status = invalid-action`, `actionLegal = false`, warning contains exact insufficient-energy reason.

Visible UI table mismatch:

- UI shows `CLONE_LARVAE Action unavailable ... Inputs captured UNKNOWN:`
- Exported JSON has exact current energy, cost, and deficit.

Conclusion: Clone Larvae math capture is coherent while blocked, but the visible table loses the useful blocked reason.

## Safety

Energy reserve provenance is correct in this exported live snapshot:

- `requiredReserve = 52.816091954022988506`
- `headroomBefore = 2520.1569928620002055`
- `ruleId = post-nexus-energy-reserve`
- `reserveSource = live-config:postNexusEnergyReserveSeconds`
