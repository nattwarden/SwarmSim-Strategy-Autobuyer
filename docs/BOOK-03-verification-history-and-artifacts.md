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
> - `live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md`
> - `live-logs/live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json`
>
> Older failures and warnings below are preserved as historical evidence.

Date range: 0.10.0 to 0.12.2 artifacts
Purpose: keep one map of what historical browser exports exist and where to find them.

## Artifact location

Historical verification artifacts available in this repository are concentrated in:

- live-logs/2026-07-09-clean-start-game-observation.md
- live-logs/2026-07-09-clicked-mechanics-progression.md
- live-logs/2026-07-10-0.10.1-energy-support-counterfactual.md
- live-logs/2026-07-10-0.12.2-live-hom-effective-count-capture-analysis.md
- live-logs/2026-07-10-base-game-claims-crosscheck.md
- test-data/0.12.2-laboratory/LIVE_EVIDENCE_INDEX.md

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

## Official SA1 one-command test flow

The SA1 breakpoint suite has a separate batch entry point:

```bash
npm run strategy:audit:matrix:sa1
```

It runs all seven configured breakpoint scenarios twice by default. The faster
smoke entry point runs every scenario once:

```bash
npm run strategy:audit:matrix:sa1:single
```

The fast matrix reuses one Chrome window, browser context, and page for all
sequential runs. It exits non-zero if a run fails, reset is not verified, or
state leakage is detected. Stronger process-level confirmation is available as:

```bash
npm run strategy:audit:matrix:sa1:isolated
```

That variant starts a new Node process and Chrome instance for every run. Each
run writes timestamped JSON and Markdown artifacts under
`docs/test-data/strategy-audit-1/<scenario-id>/live/`; the matrix runner does not yet write a
separate aggregate summary artifact.

This is official Strategy Audit test infrastructure, not a replacement for
Laboratory version checks or guardrails. Strategy Audit stress-tests real
strategy decisions across staged states. Laboratory verification protects its
read-only snapshot, formula, determinism, gating, isolation, and non-mutation
contracts. The efficient one-command orchestration pattern can later support a
separate Laboratory batch runner.

### Practical research loop

Keep the loop small: state one question, choose Laboratory for counterfactuals
or Strategy Audit for strategy behavior, run the smallest useful batch, and
inspect the collected artifacts. Use the fast single-window matrix normally and
the isolated variant only to confirm an important result. Treat any reset
failure or state leakage as a test failure. Reproduce interesting behavior
before proposing a narrow strategy change; do not turn one favorable simulation
into new automation. Formal release claims remain governed by the existing Git
verification protocol.
3. Prefer current claim-level conclusions in live-logs/2026-07-10-base-game-claims-crosscheck.md over isolated older snapshots.

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
