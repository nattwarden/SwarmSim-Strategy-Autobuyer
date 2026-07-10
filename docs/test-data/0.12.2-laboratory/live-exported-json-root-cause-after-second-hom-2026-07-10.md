# 0.12.2 Exported JSON Root Cause After Second HoM

Date: 2026-07-10

Scope: exported `Live JSON`, `Export Result JSON`, and `Export Result Markdown` after the second live House of Mirrors cast.

Raw exports:

- `live-exported-snapshot-after-second-hom-2026-07-10.json`
- `live-exported-result-after-second-hom-2026-07-10.json`
- `live-exported-result-after-second-hom-2026-07-10.md`

## Finding

The 0.12.2 live snapshot resolves the correct House of Mirrors unit ids and captures nonzero per-unit territory production, but captures every affected unit count as `0`.

Snapshot fields:

| Field | Value |
| --- | --- |
| `snapshotHash` | `sha256:05080d202f41dca73651f3a480584c998c916012ae3caba2778ef16bdd3a3275` |
| `resources.territory.perSecond` | `9.1296614409746199606e+97` |
| `army.affectedTerritoryPerSecondTotal` | `0` |
| `army.unaffectedTerritoryPerSecond` | `9.1296614409746199606e+97` |
| `abilities.houseOfMirrors.sourceVerifiedTerritoryPerSecondAfter` | `9.1296614409746199606e+97` |
| `abilities.houseOfMirrors.available` | `true` |
| `abilities.houseOfMirrors.affordable` | `true` |

Affected-unit capture:

| Unit | Count | Per-unit territory/sec | Contribution |
| --- | ---: | ---: | ---: |
| `swarmling` | `0` | `3.156416785012790696e+73` | `0` |
| `stinger` | `0` | `1.4203875532557558132e+75` | `0` |
| `spider` | `0` | `6.3917439896509011593e+76` | `0` |
| `mosquito` | `0` | `2.8762847953429055217e+78` | `0` |
| `locust` | `0` | `1.2943281579043074848e+80` | `0` |
| `roach` | `0` | `5.8244767105693836814e+81` | `0` |
| `giantspider` | `0` | `2.6210145199816809984e+83` | `0` |
| `centipede` | `0` | `7.6973956059047505194e+66` | `0` |
| `wasp` | `0` | `3.4638280226247671258e+68` | `0` |
| `devourer` | `0` | `1.5587226101808215005e+70` | `0` |
| `goon` | `0` | `7.0142399037003560852e+71` | `0` |

The live UI contradicts the zero counts. Immediately after the second cast, visible rows included:

- `Territory 171DTg +91.2UTg/sec`
- `Swarmling V 407Sx +12.8UTg/sec`
- `Goon IV 98.7Sp +69.2UTg/sec`
- `Roach V 50.3B +293NVi/sec`

## Interpretation

The remaining HoM defect is now narrowed to live affected-unit count capture.

It is not primarily:

- action legality: HoM is correctly `Valid` above 2500 energy
- stale snapshot replay: `Run Last Snapshot` correctly preserves hashes
- result rendering: the exported JSON has zero affected counts before rendering
- per-unit production lookup: per-unit territory/sec values are present

Because the snapshot starts with affected counts `0`, Phase 1 correctly projects a bad input and reports `Territory/sec delta = 0`.
