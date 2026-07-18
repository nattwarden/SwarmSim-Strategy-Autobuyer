# 9.4.0 clean-room Larva Engine guard path-boundary verification

Verification date: 2026-07-18

## Immutable implementation identity

- implementation SHA: `c0101cc1055fac8f82b81202771c3f1e3cee29e7`
- implementation tree: `cd84ae8df987ba66223c0e533a529c3029b87858`
- evidence base SHA: `c0101cc1055fac8f82b81202771c3f1e3cee29e7`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `c0101cc1055fac8f82b81202771c3f1e3cee29e7`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/Documents/SwarmSim-verify-c0101cc`
- working tree before and after verification: clean, status count `0`

## Environment and command classification

- Node.js: `v24.14.0`; npm: `11.9.0`; Windows; browser acceptance against
  `https://www.swarmsim.com/`.
- `npm ci --ignore-scripts` was setup only and exited `0`.
- `npm run build` is an implementation generator; it was already current and
  made no change. Every command below was a pure, self-cleaning check.
- `GIT_COMMIT=c0101cc1055fac8f82b81202771c3f1e3cee29e7 npm run verify` - exit
  `0` in `125.1s`; the complete configured suite passed.
- `npm run check:9.4.0:larva-engine-guard-boundary` - exit `0`.
- `node scripts/check-9.4.0-larva-engine-guard-boundary.js --mutate-amount`
  - exit `1`, expected: the amount guard makes boundary evidence `MISSING`.
- `node scripts/check-9.4.0-larva-engine-guard-boundary.js --mutate-identity`
  - exit `1`, expected: the real upgrade delta no longer matches the proposal.
- `node scripts/check-9.4.0-larva-engine-guard-boundary.js --mutate-accounting`
  - exit `1`, expected: removing the disposition boundary makes evidence
  `MISSING`.
- final `git status --short --untracked-files=no` and `git diff --check` -
  exit `0`; no tracked implementation, verifier, fixture, package or
  configuration file changed during verification.

## Proven path contract

`LARVA_ENGINE_GUARD` now emits `larva-engine-guard-path-boundary.v1` whenever
it evaluates the existing Expansion-then-Hatchery guard. A buyable upgrade
gets a canonical identity, cycle/snapshot/active-target authorization and
an exactly-one amount authorization before its command. A mismatched target
or amount is refused and accounted as `CONTRACT_VIOLATION`; successful buys
require the real upgrade-count delta to confirm the exact amount.

The focused live acceptance proves one real Engine upgrade in its existing
order, an otherwise identical advisor cycle accounted as `BLOCKED_SAFE_MODE`,
and a disabled Engine guard with zero proposals and the explicit reason
`larva engine priority is disabled by configuration`.

This is observability and fail-closed command binding only. It does not alter
Engine ranking, eligibility, save windows, M6 coverage (`PARTIAL`), hard
safety defaults, or `m6DecisionOwnsMainCycle` (`false`). Four of ten retained
legacy paths now carry a proven boundary; complete M6 paths remain `0` and
the WAIT precondition remains `FAIL` / `ADVISOR_ONLY`.
