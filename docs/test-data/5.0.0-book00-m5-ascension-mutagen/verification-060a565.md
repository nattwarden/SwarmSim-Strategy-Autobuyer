# BOOK-00 M5 Exact-SHA Verification Evidence

Date: 2026-07-13

## Provenance

- Implementation branch: `codex/m5-ascension-mutagen-advisor`
- Implementation SHA: `060a5654fe409db54d196b0368533d6696bb3361`
- Implementation tree SHA: `74718b87ccf7b566eb6cfa8bea9040b02998a8b9`
- Evidence base branch SHA (`origin/codex/m5-ascension-mutagen-advisor` at run time): `060a5654fe409db54d196b0368533d6696bb3361`
- `origin/main` at run time: `7ef846d29e52a6a43bc67564b663a8e390687692`
- Node: `v24.14.0`
- npm: `11.9.0`
- Dependency resolution: reused existing Playwright dependency via `NODE_PATH=c:\Users\info\OneDrive\Dokument\SwarmSim-Strategy-Autobuyer-main\node_modules`.

## Verification mode

- Exact immutable implementation SHA verification on the implementation branch checkout.
- Working tree was clean before suite execution.

## Command classification

Pure checks:

- `npm run build`
- `node scripts/validate-repo-guardrails.js`
- `npm run check:book00:m5:ascension-mutagen`
- `npm run verify`
- `git diff --check`

Evidence generators:

- None in this verification run.

Allowlisted evidence paths for post-suite commit:

- `docs/test-data/5.0.0-book00-m5-ascension-mutagen/verification-060a565.md`

## Commands and exits

1. `npm run build` -> `0`
2. `node scripts/validate-repo-guardrails.js` -> `0`
3. `npm run check:book00:m5:ascension-mutagen` -> `0`
4. `npm run verify` -> `0`
5. `git diff --check` -> `0`

## Required suite highlights

- Canonical build check passed.
- Guardrail validation passed.
- Focused M5 advisor acceptance passed.
- Full verify pipeline passed, including:
  - `check:0.12.3:laboratory`
  - `check:5.0.0:versions`
  - `check:ui-shell`
  - `check:laboratory:phase2a`
  - `check:purchase-evaluator`
  - `check:book00:m3:energy`
  - `check:book00:m3:energy:execution`
  - `check:book00:m4:ability-timing`
  - `check:book00:m5:ascension-mutagen`

## Git state after verification

- `HEAD`: `060a5654fe409db54d196b0368533d6696bb3361`
- `origin/codex/m5-ascension-mutagen-advisor`: `060a5654fe409db54d196b0368533d6696bb3361`
- `origin/main`: `7ef846d29e52a6a43bc67564b663a8e390687692`
- Working tree after suite: clean (no tracked changes)
- Tracked changes after writing evidence: only this evidence file.

## Player-visible change

- The bot now explains whether to continue the current run or ascend now, what Mutagen gain/reset implications are, and how supported mutagen choices compare over a horizon, while remaining advisor-only.

## Narrow scope confirmation

Changed implementation scope was limited to:

- M5 runtime advisor/snapshot/evaluator plumbing and observability fields.
- New focused M5 checker and 5.0.0 version-surface checker.
- Version surfaces/docs/release notes for `5.0.0`.
- Canonical userscript build output.

Intentionally not changed:

- No execution authority for Ascension.
- No execution authority for Mutagen spending/allocation.
- No changes to auto-ascend, auto-cast, or energy auto-cast defaults.
- No Nightbug/Bat auto-buy changes.
- No Laboratory authority changes.
- No unrelated UI redesign work.
