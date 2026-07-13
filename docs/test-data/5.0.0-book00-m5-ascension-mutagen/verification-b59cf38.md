# BOOK-00 M5 Live Advisor Hotfix Verification Evidence

Date: 2026-07-13

## Provenance

- Implementation branch: `main`
- Implementation SHA: `b59cf3884c492b9c63e81091055285f580b8f541`
- Implementation tree SHA: `2a27a4af4bedebed1d690c06b61db4857fcf4ebc`
- `origin/main` during verification: `b59cf3884c492b9c63e81091055285f580b8f541`
- Node: `v24.14.0`
- npm: `11.9.0`
- Verification mode: immediate exact-SHA verification from a clean synchronized checkout

## Command classification

Pure checks:

- `npm run build` (deterministic canonical reproduction; produced no tracked delta)
- `node scripts/validate-repo-guardrails.js`
- `npm run check:book00:m5:ascension-mutagen`
- `npm run verify`
- `git diff --check`

Evidence generators during the suite: none.

Post-suite evidence allowlist:

- `docs/test-data/5.0.0-book00-m5-ascension-mutagen/verification-b59cf38.md`

## Commands and exits

1. `npm run build` -> `0` (`Canonical userscript already up to date.`)
2. `node scripts/validate-repo-guardrails.js` -> `0`
3. `npm run check:book00:m5:ascension-mutagen` -> `0`
4. `npm run verify` -> `0`
5. `git diff --check` -> `0`

The tracked working tree remained clean after every pure check.

## Verified behavior

- Live Ascension Energy ETA uses Decimal-safe linear calculation and no longer
  calls the incompatible game helper that emitted a repeating `.toNumber` type
  error.
- Council Chamber visibly presents structured M4 Ability Timing and M5
  Ascension/Mutagen advice.
- Matrix Diagnostics contains matching M4/M5 rows.
- Unknown Ascension break-even is displayed as unavailable, not zero seconds.
- Council distinguishes guarded fallback activity from coordinator execution
  and uses blocker-oriented `Avoid` guidance.
- `autoAscend`, `autoCastAbilities`, and
  `energySupportBrokerAllowAutoCast` remain false by default.
- Ascension and Mutagen advisors retain `executionAuthority: false`.

## Scope

Intentionally unchanged:

- No Ascension execution path was added.
- No Mutagen spending or allocation path was added.
- No ability auto-cast authority was added.
- Nightbug/Bat behavior, Nexus/Energy protection, and Laboratory authority were
  not changed.
