# BOOK-00 M5 5.0.1 Hotfix Exact-SHA Verification Evidence

Date: 2026-07-13

## Provenance

- Implementation branch: `main`
- Implementation SHA: `a4221ea4ae741d1dc86e09bbafef616200f87d0c`
- Implementation tree SHA: `05286613e00c1158137a5e807c821e46b9b63784`
- `origin/main` during verification: `a4221ea4ae741d1dc86e09bbafef616200f87d0c`
- Node: `v24.14.0`
- npm: `11.9.0`
- Verification mode: immediate exact-SHA verification from a clean synchronized checkout

## Command classification

Pure checks:

- `npm run build` (deterministic canonical reproduction; no tracked delta)
- `node scripts/validate-repo-guardrails.js`
- `npm run check:5.0.1:versions`
- `npm run check:book00:m5:ascension-mutagen`
- `npm run verify`
- `git diff --check`

Evidence generators during the suite: none.

Post-suite evidence allowlist:

- `docs/test-data/5.0.0-book00-m5-ascension-mutagen/verification-a4221ea.md`

## Commands and exits

1. `npm run build` -> `0` (`Canonical userscript already up to date.`)
2. `node scripts/validate-repo-guardrails.js` -> `0`
3. `npm run check:5.0.1:versions` -> `0`
4. `npm run check:book00:m5:ascension-mutagen` -> `0`
5. `npm run verify` -> `0`
6. `git diff --check` -> `0`

The tracked working tree remained clean after every pure check.

## Verified outcome

- Tampermonkey update surface is `5.0.1` across metadata, runtime, package,
  README, status, history, release notes, and focused version checker.
- Live Ascension Energy ETA is Decimal-safe and does not call the incompatible
  game helper.
- M4 Ability Timing and M5 Ascension/Mutagen advice render in Council Chamber
  and Matrix Diagnostics.
- Unknown break-even is explicit, and Council fallback/reason/Avoid wording is
  aligned with actual guarded fallback activity.
- All hard safety defaults and advisor-only execution boundaries are preserved.
