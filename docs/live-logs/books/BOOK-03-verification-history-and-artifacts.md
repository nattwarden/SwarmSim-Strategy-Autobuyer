# Book 03 - Verification History and Artifact Map

> Historical verification notice
>
> This book records verification history and browser/test artifacts from
> earlier SwarmSim Strategy Autobuyer versions.
>
> It is an historical index, not the current acceptance verdict.
>
> Current accepted implementation:
>
> - version `0.12.3`
> - implementation commit
>   `c819c7d7adc8ab0280e06d25466f6697fb915409`
> - mature-save evidence commit
>   `636cfb4b061ce9a0c72d273812a977ede0114c27`
> - verdict
>   `0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED`
>
> Current acceptance evidence:
>
> - `../live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md`
> - `../live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json`
>
> Older failures and warnings below are preserved as historical evidence.

Date range: 0.10.0 to 0.12.2 artifacts
Purpose: keep one map of what historical browser exports exist and where to find them.

## Artifact location

Historical verification artifacts available in this repository are concentrated in:

- ../2026-07-09-clean-start-game-observation.md
- ../2026-07-09-clicked-mechanics-progression.md
- ../2026-07-10-0.10.1-energy-support-counterfactual.md
- ../2026-07-10-0.12.2-live-hom-effective-count-capture-analysis.md
- ../2026-07-10-base-game-claims-crosscheck.md
- ../../test-data/0.12.2-laboratory/LIVE_EVIDENCE_INDEX.md

This includes:

- dated source logs and claim crosschecks under `docs/live-logs/`
- salvaged 0.12.2 raw live-capture artifacts indexed under `docs/test-data/0.12.2-laboratory/`
- accepted 0.12.3 mature-save evidence under `docs/live-logs/`

Additional pre-sync archived browser-export bundles from earlier local history are preserved externally in the pre-sync bundle archive and are intentionally not mirrored as live repository paths.

## Why this archive exists

- Reduce top-level live-log noise.
- Keep historical payloads available for deep forensics.
- Encourage decision-making from books plus active claim logs, not from random old export files.

## How to use this archive

1. Start with BOOK-01 and BOOK-02.
2. Open a specific historical payload only when a claim needs payload-level verification.
3. Prefer current claim-level conclusions in ../2026-07-10-base-game-claims-crosscheck.md over isolated older snapshots.

## Version windows covered by archive files

- 0.10.0
- 0.10.1
- 0.11.5
- 0.11.6
- 0.11.7
- 0.12.0
- 0.12.1
- 0.12.2

## Maintenance rules

- New long-form dated raw logs should go into `docs/live-logs/`.
- New compact raw payload exports should go into `docs/test-data/<version>-laboratory/` with an index entry.
- Keep top-level live-logs for active claim logs, current summary books, and small high-signal notes.
- If a new export changes conclusions, update BOOK-01 or BOOK-02 and the claim crosscheck file.

## Related books

- Base mechanics and claim status:
	`BOOK-01-base-mechanics-and-claims.md`
- Energy, House of Mirrors, and Laboratory diagnostics:
	`BOOK-02-energy-house-of-mirrors-and-lab.md`
