# Book 02 - Energy, House of Mirrors, and Laboratory Diagnostics

> Historical evidence notice
>
> This book records live observations from SwarmSim Strategy Autobuyer
> 0.10.1 through 0.12.2.
>
> The 0.12.2 House of Mirrors effective-count capture defect documented
> here was fixed and mature-save live-verified in version 0.12.3.
>
> Current acceptance evidence:
>
> - `docs/live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md`
> - `docs/live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json`
>
> Historical 0.12.2 evidence below must not be interpreted as the current
> runtime state.

Date range: 2026-07-10
Purpose: summarize ability-value findings and lab-capture correctness limits.

## Sources

- live-logs/2026-07-10-0.10.1-energy-support-counterfactual.md
- live-logs/2026-07-10-0.12.1-first-real-save-laboratory-result.md
- live-logs/2026-07-10-0.12.1-live-hom-runtime-forensics.md
- live-logs/2026-07-10-0.12.1-live-house-of-mirrors-cast.md
- live-logs/2026-07-10-energy-support-counterfactual-0.10.1.json
- test-data/0.12.2-laboratory/live-real-save-post-hom-capture-run-2026-07-10.md
- test-data/0.12.2-laboratory/live-real-save-post-hom-capture-run-2026-07-10.json
- test-data/0.12.2-laboratory/live-second-hom-vs-lab-delta-2026-07-10.md
- test-data/0.12.2-laboratory/live-second-hom-vs-lab-delta-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-json-root-cause-after-second-hom-2026-07-10.md
- test-data/0.12.2-laboratory/live-exported-json-root-cause-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-snapshot-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-result-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-clone-expansion-diagnostics-after-second-hom-2026-07-10.md
- test-data/0.12.2-laboratory/live-exported-clone-expansion-diagnostics-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-higher-energy-recapture-after-second-hom-2026-07-10.md
- test-data/0.12.2-laboratory/live-higher-energy-recapture-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-snapshot-higher-energy-after-second-hom-2026-07-10.json
- test-data/0.12.2-laboratory/live-exported-result-higher-energy-after-second-hom-2026-07-10.json

## Executive summary

- Energy lane acted primarily as a support lane in observed windows.
- Clone Larvae can be strongly positive in the right larva-absorption window.
- House of Mirrors is confirmed as a 2500-energy action and can produce immediate 2x army-row and territory/sec effects when army state is suitable.
- A 0.12.1 laboratory capture bug mixed scenario/UI ids with runtime ids and could output false zero affected-army values.
- In 0.12.2, the same real save produced a fresh live-read-only Laboratory result where House of Mirrors was `Valid` when energy exceeded 2500.
- A second live House of Mirrors cast in 0.12.2 doubled visible army rows and aggregate territory/sec again, but Laboratory still reported `Territory/sec delta = 0`; legality is fixed, value projection remains suspect.
- Exported 0.12.2 JSON narrows the HoM value bug: affected unit ids and per-unit territory/sec are captured, but every affected unit `count` is serialized as `0`.
- Exported 0.12.2 Clone Larvae data is coherent while blocked, but the visible table loses the precise insufficient-energy reason and renders `UNKNOWN:`.
- Exported 0.12.2 Expansion ETA `0` is internally consistent for the tested snapshot because `expansion.territoryRemaining = 0`.
- A higher-energy 0.12.2 recapture reproduced the HoM affected-count zero bug at `9652.8344353907358377` energy.

## Confirmed ability facts

- Clone Larvae cost: 12000 energy.
- House of Mirrors cost: 2500 energy.
- Live cast evidence confirms expected energy spend and approximately doubled affected army rows.
- Live cast evidence confirms immediate aggregate territory/sec doubling in the tested state.

## Diagnostic findings from first real-save laboratory run

- Read-only run integrity was confirmed (save preserved).
- WAIT projections were legal and coherent.
- Clone Larvae and House of Mirrors were both correctly blocked by insufficient current energy in that snapshot.
- House of Mirrors affected-unit capture was not reliable in that run due to id-resolution mismatch.
- Reserve provenance label and observation-summary text required stricter state labeling.

## 0.12.2 live Laboratory verification

- Scope: real saved game after the prior manual House of Mirrors cast.
- Capture: `Capture + Run` on SwarmBot `v0.12.2`.
- Snapshot hash: `sha256:10298651b481f159656729afafc847212a90cf488f5c06024c7400b34f213ba8`.
- Experiment hash: `sha256:ef7743b80e8e501bd4792ebe0724f2dfeb3ad0a08848f430e6c5f12747423032`.
- Result: `valid-with-warnings`, `Non-mutation proof: true`.
- `HOUSE_OF_MIRRORS`: `Valid`, `Energy delta vs WAIT = -2500`, `Formula status = Inputs verified`.
- `CLONE_LARVAE`: `Action unavailable`, `Formula status = Inputs captured`, because current energy was below 12000.
- Interpretation: 0.12.2 fixed the false HoM invalidity seen in the 0.12.1 live capture. However, later second-cast testing shows the `Territory/sec delta = 0` table output is probably a Laboratory value/projection mismatch, not a real no-op.

## 0.12.2 second-cast value mismatch

- Scope: same real saved game, manual second House of Mirrors cast, followed by stale and fresh Laboratory runs.
- Live before second cast: `Territory 171DTg +45.6UTg/sec`.
- Live after second cast: `Territory 171DTg +91.2UTg/sec`.
- Live HoM spend: energy fell from about `4870` to `2377`, matching 2500 cost plus tick regeneration.
- `Run Last Snapshot` after the live cast retained snapshot `sha256:10298651b481f159656729afafc847212a90cf488f5c06024c7400b34f213ba8`, confirming immutable snapshot replay.
- Fresh capture below 2500 energy made `HOUSE_OF_MIRRORS Action unavailable`.
- Fresh capture above 2500 energy made `HOUSE_OF_MIRRORS Valid` again, but still reported `Territory/sec delta = 0`.
- Likely fault area: affected-unit contribution capture or affected/unaffected territory split. `laboratoryHouseOfMirrorsImmediate()` does return `territoryPerSecondAfterAction` from its computed value, so action legality is not the likely failure point.

## 0.12.2 exported JSON root cause

- Scope: exported `Live JSON`, `Export Result JSON`, and `Export Result Markdown` after the second live House of Mirrors cast.
- Snapshot hash: `sha256:05080d202f41dca73651f3a480584c998c916012ae3caba2778ef16bdd3a3275`.
- Snapshot `resources.territory.perSecond`: `9.1296614409746199606e+97`.
- Snapshot `army.affectedTerritoryPerSecondTotal`: `0`.
- Snapshot `army.unaffectedTerritoryPerSecond`: `9.1296614409746199606e+97`.
- Snapshot `abilities.houseOfMirrors.sourceVerifiedTerritoryPerSecondAfter`: `9.1296614409746199606e+97`.
- `houseOfMirrorsResolution` resolves all 11 expected ids and `setMatchesExpected = true`.
- Every `army.houseOfMirrorsAffectedUnits[*].count` is `0`.
- Every affected unit has a captured `effectiveTerritoryPerSecondPerUnit`, so per-unit production lookup is not the missing field.
- Conclusion: the remaining defect is live affected-unit count capture. Phase 1 is projecting from bad affected-count inputs, so result rows report `Territory/sec delta = 0`.

## 0.12.2 Clone and Expansion diagnostics

- Scope: same exported live snapshot/result after the second manual House of Mirrors cast.
- Expansion `currentLevel`: `257`.
- Expansion `nextCost`: `1.0367730072995752038e+101`.
- Expansion `territoryRemaining`: `0`.
- Expansion `etaSeconds`: `0`.
- Expansion `laboratoryComputedEtaSeconds`: `0`.
- Expansion `etaComparison`: `match`.
- Clone Larvae `available`: `false`.
- Clone Larvae exact block reason in exported snapshot: `not enough energy (current Energy 2572.973084816023194, cost 12000, deficit 9427.026915183976806)`.
- Clone Larvae `sourceVerifiedOutput` and `runtimePreviewOutput` both equal `5.91497243127343332e+22`.
- Result JSON rows mark Clone Larvae as `invalid-action` with the exact insufficient-energy warning, but the visible UI table renders `Action unavailable ... UNKNOWN:`.
- Interpretation: Clone Larvae formula capture is coherent while blocked. The remaining Clone issue observed here is diagnostic presentation in the visible table, not formula math.
- Safety reserve provenance is now live-specific: `reserveSource = live-config:postNexusEnergyReserveSeconds`.

## 0.12.2 higher-energy recapture

- Scope: fresh `Capture + Run` after energy recovered to about `9650`, still below Clone Larvae's 12000 cost.
- Snapshot hash: `sha256:8c59485d009232d177bec531766293c5a3c97208b1751c1df0822fc92b7f5bc2`.
- Energy: `9652.8344353907358377`.
- Territory/sec: `9.1296614409746199606e+97`.
- `HOUSE_OF_MIRRORS`: `available=true`, `affordable=true`, `energyDeficit=0`.
- `army.affectedTerritoryPerSecondTotal`: `0`.
- All 11 HoM affected unit counts remain `0`.
- Live UI before capture still showed nonzero effective rows including `Swarmling V 407Sx +12.8UTg/sec` and `Goon IV 98.7Sp +69.2UTg/sec`.
- Clone Larvae remains blocked with exact exported deficit: `2347.1655646092641623`.
- Diagnostic issue: HoM exported `unavailableReason` still says `House of Mirrors is unavailable.` even when `available=true`; consumers should ignore unavailable reason fields unless `available=false`.

## Operational guidance

### Laboratory and batch testing

Laboratory Phase 1 is one controlled experiment family: it compares `WAIT`,
`CLONE_LARVAE`, and `HOUSE_OF_MIRRORS` at 60- and 300-second horizons from one
read-only snapshot. It is not the SA1 Strategy Audit matrix.

The separate SA1 one-command flow demonstrates a reusable repository pattern:
many local scenario runs can be orchestrated and collected without one AI
prompt per test. A future Laboratory batch runner may reuse that pattern to run
Laboratory experiment families across many snapshots. That integration is a
documented direction, not a current Laboratory capability, and it must preserve
Laboratory gating, deterministic formulas, branch isolation, and live-state
non-mutation verification.

- Do not infer House of Mirrors strategic value from the faulty zero-affected snapshot alone.
- Separate action legality from action value in reports.
- Keep ability-blocked summaries explicit (energy, cost, deficit, legal alternatives).
- Use canonical runtime base ids for House of Mirrors affected-unit accounting.
- Store compact lab observation payloads under `docs/test-data/<version>-laboratory/`; store conclusions in this book.
- Treat HoM Phase 1 value deltas from 0.12.2 as suspect until affected territory contribution is fixed and verified against a live cast.
- For the next fix, inspect `getLaboratoryUnitCount()` / `unit.count()` versus the visible effective tier count used by the live UI for rows like `Swarmling V`, `Goon IV`, and `Roach V`.
- Improve visible blocked-action reason rendering so Clone Larvae does not degrade exact insufficient-energy data into `UNKNOWN:`.
- Ignore or clear `unavailableReason`/`unavailableReasonCode` when an ability is available; the higher-energy HoM export shows stale default unavailable text despite `available=true`.

## What to read next

- For base mechanics and historical claim status:
	`BOOK-01-base-mechanics-and-claims.md`.
- For verification history and artifact provenance:
	`BOOK-03-verification-history-and-artifacts.md`.
- For the active game model: `SWARMSIM_GAME_MODEL.md`.
- For the base-game claims crosscheck: `live-logs/2026-07-10-base-game-claims-crosscheck.md`.
- For the salvaged 0.12.2 raw-evidence inventory: `test-data/0.12.2-laboratory/LIVE_EVIDENCE_INDEX.md`.
- For current 0.12.3 acceptance truth:
	- `live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md`
	- `live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json`
