# docs/test-data/strategy-audit-1/ - Retention Note

## Prune (2026-07-19, RH-6, audit finding R8)

On 2026-07-19 the user explicitly authorized pruning this directory (PRUNE
decision, recorded in `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`,
"Repository health hardening track (RH)" -> RH-6, remediating finding R8 in
`docs/strategy/REPOSITORY_AUDIT_REVIEW_2026-07-19.md`).

Deleted in this pass: all 150 `sa1-sweep-001` .. `sa1-sweep-150` directories
and all 7 `sa1-0{4-9}`/`sa1-10-rank-bp-*` breakpoint-probe directories,
614 files (~35.4 MB / ~33.8 MiB) of routine raw `-result.json` /
`-result.md` sweep-matrix run artifacts, all dated 2026-07-13.

## What was kept, and why

Nothing under the deleted set survived, for these reasons:

- **No script requires these files to exist for correctness.** The only
  script with a real read dependency on this tree,
  `scripts/run-sa1-breakpoint-v2.js` (via `scripts/run-sa1-sweep-v2.js`),
  reads `sa1-sweep-*/live/**/*-result.json` only to pick representative
  seed states, and it has a documented, by-design fallback: when that
  history is absent it auto-runs a fresh stratified bootstrap sweep instead
  (`autoBootstrapSweep`, default on). Nothing else in `scripts/` reads a
  specific path under this tree by name; `scripts/strategy-intelligence-coverage-manifest.js`
  and `scripts/strategy-intelligence-failure-triage.js` opportunistically
  walk whatever `-result.json` files exist anywhere under
  `docs/test-data/` for reporting only, and degrade gracefully (smaller
  report) when files are absent.
- **The project's own documentation already says these are not meant to be
  retained.** `docs/strategy/STRATEGY_AUDIT_1_BREAKPOINT_MATRIX.md` states:
  "Each child run writes temporary JSON and Markdown results. ... findings
  are distilled into BOOK-04 and no raw run files are retained." Keeping
  614 files of this raw run history in Git was already inconsistent with
  that stated policy before this prune.
- **No storageState fixtures exist to keep.** `docs/strategy/BOOK00_CURRENT_STATUS.md`
  claims live acceptance runs "get byte-identical starting state by
  capturing and restoring Playwright `storageState`" from
  `docs/test-data/strategy-audit-1/**/live/`. A grep of every file in this
  tree and every script in `scripts/` for `storageState` found zero
  matches anywhere except that doc claim itself: no `storageState` file
  was ever written here, and no runner script reads one from this path.
  That claim does not describe an implemented mechanism in this repository
  and should not be relied on; it is out of scope for RH-6 to correct, so
  it is flagged here as a discrepancy rather than corrected silently.
- **The scenario definitions are not lost.** Every scenario referenced by
  the deleted directory names (`sa1-04-rank-bp-y80` .. `sa1-10-rank-bp-y160-meat-tight-fallback-off`,
  `sa1-sweep-001` .. `sa1-sweep-150`) is still fully defined in
  `scripts/strategy-audit-testbed-core.js` (untouched by this prune) and
  reproducible on demand via `npm run strategy:audit:matrix:sa1`,
  `npm run strategy:audit:matrix:sa1:sweep150`, or
  `npm run strategy:audit:live -- --scenario <id> --cycles 5`.
- Distilled findings from prior sweeps (which lane won, representative
  scenario ids, score margins) already live in
  `docs/BOOK-04-strategy-intelligence-findings.md` and
  `docs/strategy/STRATEGY_AUDIT_1_BREAKPOINT_MATRIX.md`; only the raw
  per-run JSON/Markdown artifacts were deleted, not the conclusions drawn
  from them.

## Archive

Git history is the archive. This is not a history rewrite: every deleted
file remains fully recoverable from the commit that removed it and every
commit before it. No `archive/` tree was created, per repository hygiene
rules in `AGENTS.md`.

## Going forward

Per anti-stagnation rule 8 (referenced in the RH-6 work package), routine
SA1 sweep/matrix output should not be committed to Git as a matter of
course. Future sweep runs should either stay untracked locally, or be
pruned again at the close of the work cycle that produced them, with
findings distilled into `docs/BOOK-04-strategy-intelligence-findings.md`
and `docs/BOOK-05-community-strategy-claims.md` instead of retaining the
raw per-case artifacts.
