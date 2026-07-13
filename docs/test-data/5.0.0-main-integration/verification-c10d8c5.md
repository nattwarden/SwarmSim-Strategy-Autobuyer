# 5.0.0 Main Integration Exact-SHA Verification Evidence

Date: 2026-07-13

## Provenance

- Integration branch: `main`
- Integration implementation SHA: `c10d8c5a9160708e1d657ad5f08496dfb8e2e698`
- Integration implementation tree SHA: `286b7ebec2a95ea8a616597c749366fa452a7235`
- UI parent SHA: `cf2b96900559c5b70cac7ed4b44e916fb5772bdf`
- M5 evidence parent SHA: `fdd278c4788495f1e9ab4058b1f61b5d9240552f`
- M5 implementation SHA: `060a5654fe409db54d196b0368533d6696bb3361`
- M4 implementation SHA: `f2db145`
- `origin/main` before exact-SHA verification: `c10d8c5a9160708e1d657ad5f08496dfb8e2e698`

## Verification mode

- Exact immutable integration SHA verification on `main` after the integration commit was pushed.
- `HEAD == origin/main` before the suite.
- Working tree was clean before the suite.
- The suite produced no implementation, verifier, fixture, package, configuration, or generated-evidence changes.

## Command classification

Pure checks:

- `node scripts/validate-repo-guardrails.js`
- `npm run build`
- `npm run verify`
- `git diff --check`

Evidence generators:

- None during the exact-SHA verification run.

Allowlisted post-suite evidence path:

- `docs/test-data/5.0.0-main-integration/verification-c10d8c5.md`

## Commands and exits

1. `node scripts/validate-repo-guardrails.js` -> `0`
2. `npm run build` -> `0`
3. `npm run verify` -> `0`
4. `git diff --check` -> `0`

## Required suite highlights

- Canonical build and repository guardrails passed.
- Version surfaces passed for `5.0.0`.
- Council UI shell passed after integration with M4 and M5.
- Laboratory effective-count and Phase 2A source-math checks passed.
- Unified purchase evaluator passed.
- M3 Energy shadow and bounded execution acceptance passed.
- M4 Energy ability timing advisor acceptance passed.
- M5 Ascension and Mutagen advisor acceptance passed.

## Integrated scope

- The Council UI commits already present on `main` were preserved.
- M4 advisor-only Energy ability timing was integrated.
- M5 advisor-only Ascension and Mutagen planning was integrated.
- The canonical userscript and package/version surfaces now identify version `5.0.0`.
- Existing M4 and M5 branch evidence remains preserved in its original separate commits.

## Safety confirmation

- `autoAscend` still defaults to `false`.
- `autoCastAbilities` still defaults to `false`.
- `energySupportBrokerAllowAutoCast` still defaults to `false`.
- M4 and M5 advisor execution authority remains `false`.
- Mutagen allocation execution authority remains `false`.
- No advisor Ascension execution path was added.
- No Mutagen spend or allocation execution path was added.
- Nightbug/Bat auto-buy, Nexus/Energy protections, and Laboratory authority were not widened.

## Post-suite state

- Verified implementation `HEAD`: `c10d8c5a9160708e1d657ad5f08496dfb8e2e698`
- Verified `origin/main`: `c10d8c5a9160708e1d657ad5f08496dfb8e2e698`
- Working tree immediately after the suite: clean
- Tracked changes after writing evidence: only this evidence file

