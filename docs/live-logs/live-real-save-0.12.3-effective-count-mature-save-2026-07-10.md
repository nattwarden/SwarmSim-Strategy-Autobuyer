# SwarmSim Strategy Autobuyer 0.12.3 mature-save live verification

Verdict: 0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED

## Repository and build

- main/evidence SHA before evidence commit: `943bb60d6f95802d75c6f01bc5268058d4fcebd4`
- implementation SHA: `c819c7d7adc8ab0280e06d25466f6697fb915409`
- implementation tree SHA: `31cd04d0be2ffe79801be62f48ad2debc4b95a86`
- active browser URL: `https://www.swarmsim.com/#/tab/territory`
- SwarmSim UI build: `v1.1.17`
- Laboratory game build: `live-browser`
- capture timestamp: `2026-07-10T11:12:56.125Z`
- script version: `0.12.3`
- browser panel/runtime version: `SwarmBot v0.12.3`
- repo userscript metadata checked read-only: `// @version 0.12.3` in `src/SwarmSim-Strategy-Autobuyer.user.js`
- source-state fingerprint: `sha256:892d413a1c5e4d9c37c51d4bfd2373f0a91642d02db43018ed8648f57f07ded8`
- snapshot hash: `sha256:63787525ddfd17c4f848be8e82fc0ba19491c9dbffeaae710f82c3af06266bf8`
- experiment hash: `sha256:c1b0305f34103e19a9ad7ff1f456ed8be6a9bd3314a8c1cbca61f4d3df33a452`

## Preconditions

- Nexus count: `5`
- Energy current: `14603.373000524835455`
- Energy/sec: `1.7605363984674329502`
- House of Mirrors visible: `true`
- House of Mirrors affordable: `true`
- House of Mirrors cost: `2500`
- Clone Larvae visible: `true`
- Clone Larvae affordable: `true`
- Clone Larvae cost: `12000`
- total territory/sec: `9.1296614409746199606e+97`
- total army production captured as affected+unaffected territory/sec: `9.1296614409746199606e+97` + `0`
- positive affected army rows: `10`
- Expansion level: `257`
- territory amount: `5.2018612970913562362e+101`

## Visible UI army rows before Laboratory

| Row | Count | Production |
| --- | ---: | ---: |
| Giant Arachnomorph V | 0 | 0 |
| Roach V | 50.3B | +293NVi/sec |
| Locust V | 511B | +66.1NVi/sec |
| Culicimorph V | 236T | +680NVi/sec |
| Arachnomorph V | 130Qi | +8.36UTg/sec |
| Stinger V | 411Qi | +584Tg/sec |
| Swarmling V | 407Sx | +12.8UTg/sec |
| Goon IV | 98.7Sp | +69.2UTg/sec |
| Devourer IV | 12.6Sp | +197Tg/sec |
| Wasp IV | 16.8Sp | +5.84Tg/sec |
| Chilopodomorph IV | 143Sp | +1.10Tg/sec |

## Canonical House of Mirrors unit set

- affected IDs: `swarmling, stinger, spider, mosquito, locust, roach, giantspider, centipede, wasp, devourer, goon`
- exact count: `11`
- duplicates: `none`
- IDs starting with "unit ": `none`
- forbidden IDs present: `none`
- setMatchesExpected: `true`
- resolvedUnitCount: `11`
- unresolvedUnitIds: `none`
- positiveCountUnitIds: `swarmling, stinger, spider, mosquito, locust, roach, centipede, wasp, devourer, goon`

## Effective count diagnostics

| Unit | Count | Count source | Status | Identity parity | Count parity | effectUnitCount == resolvedUnitCount | Contribution |
| --- | ---: | --- | --- | --- | --- | --- | ---: |
| swarmling | 4.0766308633529764388e+23 | clonearmy-effect-unit-count | resolved | true | true | true | 1.2867546083388519157e+97 |
| stinger | 411670444278971105280 | clonearmy-effect-unit-count | resolved | true | true | true | 5.8473157509711772683e+95 |
| spider | 130809592637437247490 | clonearmy-effect-unit-count | resolved | true | true | true | 8.361014275290222985e+96 |
| mosquito | 236653301989376 | clonearmy-effect-unit-count | resolved | true | true | true | 6.8068229427973516432e+92 |
| locust | 511101108224 | clonearmy-effect-unit-count | resolved | true | true | true | 6.6153255591042002082e+91 |
| roach | 50398756864 | clonearmy-effect-unit-count | resolved | true | true | true | 2.9354638559601686716e+92 |
| giantspider | 0 | clonearmy-effect-unit-count | resolved | true | true | true | 0 |
| centipede | 1.4338433423983123091e+26 | clonearmy-effect-unit-count | resolved | true | true | true | 1.1036859443332549836e+93 |
| wasp | 1.6881983803753659382e+25 | clonearmy-effect-unit-count | resolved | true | true | true | 5.8476288576939382651e+93 |
| devourer | 1.2661864216802225063e+25 | clonearmy-effect-unit-count | resolved | true | true | true | 1.9736334041769107391e+95 |
| goon | 9.8767604743983199024e+25 | clonearmy-effect-unit-count | resolved | true | true | true | 6.9277967438815154676e+97 |

All rows use `clonearmy-effect-unit-count`; all rows are resolved with identity/count parity true. Giantspider is the only zero-count affected row.

## Production parity

- affectedTerritoryPerSecondTotal: `9.1296614409746199606e+97`
- unaffectedTerritoryPerSecond: `0`
- runtime total territory/sec: `9.1296614409746199606e+97`
- Decimal comparison: affected + unaffected equals runtime total within captured Decimal precision.
- Each positive row reports `productionParity: true`; contribution equals count x effectiveTerritoryPerSecondPerUnit in the exported diagnostics.

## Ability state

- House of Mirrors: unlocked `true`, visible `true`, affordable `true`, available `true`, energyCost `2500`, energyDeficit `0`, unavailableReasonCode `null`, unavailableReason `null`
- Clone Larvae: unlocked `true`, visible `true`, affordable `true`, available `true`, energyCost `12000`, energyDeficit `0`, unavailableReasonCode `null`, unavailableReason `null`
- Exported JSON/MD/CSV contain no `UNKNOWN` occurrences.

## House of Mirrors simulation

| Horizon | WAIT territory/sec | HoM territory/sec | HoM territory/sec delta | HoM energy delta | Status | Legal | Applied |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 60 | 9.1296614409746199606e+97 | 1.8259322881949239921e+98 | 9.1296614409746199604e+97 | -2500 | ok | true | true |
| 300 | 9.1296614409746199606e+97 | 1.8259322881949239921e+98 | 9.1296614409746199604e+97 | -2500 | ok | true | true |

HoM delta matches the captured affected total: `9.1296614409746199604e+97` vs affected `9.1296614409746199606e+97` at 60s, and `9.1296614409746199604e+97` vs affected `9.1296614409746199606e+97` at 300s.

## Clone Larvae simulation

Clone Larvae is legal in this mature save: available `true`, affordable `true`, energyCost `12000`, energyDeficit `0`, unavailableReasonCode `null`.
60s Clone Larvae: status `ok`, actionLegal `true`, actionApplied `true`, energy delta `-12000`, larvae delta `5.9149724312734333201e+22`.
300s Clone Larvae: status `ok`, actionLegal `true`, actionApplied `true`, energy delta `-12000`, larvae delta `5.91497243127343332e+22`.

## Expansion ETA

- currentLevel: `257`
- territoryRemaining: `0`
- etaSeconds: `0`
- laboratoryComputedEtaSeconds: `0`
- etaComparison: `match`
`territoryRemaining == 0` correctly gives ETA 0. No false immediate ETA case with positive remaining territory was present.

## Reserve provenance

- requiredReserve: `52.816091954022988506`
- ruleId: `post-nexus-energy-reserve`
- reserveSource: `live-config:postNexusEnergyReserveSeconds`

## Non-mutation proof

- structuralBeforeHash: `sha256:892d413a1c5e4d9c37c51d4bfd2373f0a91642d02db43018ed8648f57f07ded8`
- structuralAfterHash: `sha256:892d413a1c5e4d9c37c51d4bfd2373f0a91642d02db43018ed8648f57f07ded8`
- structuralUnchanged: `true`
- resourceDriftWithinExpectedRange: `true`
- unchanged: `true`
- Visual browser check after run: Energy did not decrease by 2500, army rows did not double, no purchase/cast/ascension was performed; only passive resource growth was visible.

## Export consistency

- Laboratory panel, raw JSON, Markdown export, CSV export, and Copy Summary agree on legal House of Mirrors, legal Clone Larvae, energy costs 2500/12000, HoM territory/sec delta, and non-mutation true.
- Copy Summary was read back from the system clipboard and contained script version 0.12.3, legal/status `legal / ok` for both abilities, matching 60s/300s HoM deltas, and the same snapshot/experiment hashes.
- Exported Markdown and CSV were checked for HoM/Clone rows and `UNKNOWN`; no `UNKNOWN` occurrences were found.

## Warnings

- Runtime Git SHA is unavailable in Tampermonkey; source.currentCommit is null by design.
- House of Mirrors direct runtime territory/sec preview is unavailable; source-verified affected-unit inputs are captured instead.

## Evidence files

- Raw JSON: `docs/live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json`
- Markdown summary: `docs/live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md`
