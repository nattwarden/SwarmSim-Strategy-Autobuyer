# 9.4.0 clean-room Smart-upgrade path-boundary verification

Verification date: 2026-07-18

## Immutable implementation identity

- implementation SHA: `84fa70e4a3f4e7c2c8d8dfaebb1e84349428fb4b`
- implementation tree: `aa8efe3d7a7a2d035340c37e8f37badd89f188eb`
- evidence base SHA: `84fa70e4a3f4e7c2c8d8dfaebb1e84349428fb4b`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `84fa70e4a3f4e7c2c8d8dfaebb1e84349428fb4b`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/Documents/SwarmSim-9.4.0-clean-room-verify-84fa70e`
- working tree before and after verification: clean, status count `0`

## Environment

- Node.js: `v24.14.0`
- npm: `11.9.0`
- operating system: Windows
- live game URL used by browser acceptance: `https://www.swarmsim.com/`

## Command classification and results

Setup, not a product check:

- `npm ci --ignore-scripts` - exit `0`; installed the locked dependencies with
  `0` reported vulnerabilities.

Predeclared generator:

- `npm run build` - exit `0`; the only allowlisted generated implementation
  path was `src/SwarmSim-Strategy-Autobuyer.user.js`. It was already current
  and no file changed.

Pure checks:

- exact `HEAD`, tree and remote-branch identity checks - exit `0`.
- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `GIT_COMMIT=84fa70e4a3f4e7c2c8d8dfaebb1e84349428fb4b npm run verify`
  - exit `0`; the complete configured suite, now including both
  `check:9.4.0:critical-upgrade-boundary` and
  `check:9.4.0:smart-upgrade-boundary`, passed in `121.3s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `node scripts/check-9.4.0-smart-upgrade-boundary.js --mutate-percent`
  - exit `1`, expected. The in-memory mutant doubled the buy-max command
  percent; the fail-closed boundary guard refused every buy as a contract
  violation before any real purchase, and the verifier rejected the cycle.
- `node scripts/check-9.4.0-smart-upgrade-boundary.js --mutate-identity`
  - exit `1`, expected. The in-memory mutant pointed the buy-max command at a
  different ranked candidate than the authorized proposal; no execution could
  be confirmed against the authorized identity and the cycle was rejected.
- `node scripts/check-9.4.0-smart-upgrade-boundary.js --mutate-accounting`
  - exit `1`, expected. The in-memory mutant dropped the boundary from the
  disposition row; boundary evidence degraded to `MISSING` and was rejected.
- final identity, `git status --porcelain` and `git diff --check` - exit `0`;
  status count `0`, `HEAD` and the remote branch still matched the exact
  implementation SHA, and the tree remained
  `aa8efe3d7a7a2d035340c37e8f37badd89f188eb`.

All checks and mutations were self-cleaning. No runtime, fixture, verifier,
package, configuration, JSON, Markdown or strategy-audit artifact remained in
the exact-SHA worktree. This file is the only post-implementation evidence.

## Path-boundary contract

`buySmartUpgrades` now emits one `smart-upgrade-path-boundary.v1` per
evaluated cycle. The generic safe-upgrade command is buy-max bounded by a
percent, and the boundary reflects that honestly instead of pretending a unit
amount:

1. every ranked candidate carries an exact canonical proposal identity
   (`smart-upgrade::<executionId>::upgrade::base`) and an authorization bound
   to the coordinator's decision cycle, snapshot and active target;
2. the authorized command is `BUY_MAX_PERCENT` at the exact percent computed
   from the configured `upgradeBuyPercent` and the candidate's watch divisor;
   a command percent that differs from the authorized percent is refused
   fail-closed and recorded as `CONTRACT_VIOLATION`;
3. execution is confirmed only by the real upgrade-count delta
   (`real-upgrade-count-delta`), which may legitimately exceed one level;
4. the target-aware upgrade delegation is an explicit accounted branch
   (`EXECUTED_DELEGATED`, `NO_ACTION` or `NOT_EVALUATED`), held candidates
   are accounted per class (ability, twin, protected cost), and structural
   exclusions (engine-owned, target-aware evaluated, critical-production
   deferral, max-per-run truncation) are inventoried;
5. every ranked candidate outcome is explicit: `EXECUTED`,
   `BLOCKED_SAFE_MODE`, `SKIPPED_BUDGET`, `COMMAND_NO_EFFECT`,
   `COMMAND_FAILED` or `CONTRACT_VIOLATION`; a disabled path states its
   not-applicable reason;
6. the proposal metric identity is the candidate's own owned-count
   (`<candidate>-owned-count` / `count` / `real-upgrade-count-delta`) with
   `rankingAuthority: PATH_BOUNDARY_OBSERVABILITY_ONLY` - observability,
   never an M2/M6 ranking input, and no ETA conversion is invented.

The coverage ledger validates each declared boundary contract with
contract-specific rules; the slice-8 critical-upgrade rules are unchanged and
legitimate skips remain `NOT_EVALUATED`, never proof.

## Real fixed-cycle results

The verifier exercises three real production URL cycles; execution identity
is grounded in real upgrade counts read from game state.

In the executed cycle, real seeding exposes thirteen available autobuy
upgrades: one engine-owned exclusion, eight twin upgrades held for the twin
planner (their real counts provably unchanged), and four ranked generic
candidates. The single-action budget executes exactly the top-ranked
candidate:

- executed candidate: `greaterqueenprod`, real upgrade count delta `1`,
  authorized and command percent `0.65`;
- accounting: `1` executed, `3` skipped-budget, `0` violations;
- delegation branch: explicit `NO_ACTION` record;
- `SMART_UNITS` is `SKIPPED_BUDGET`, M6 execution authority stayed `false`,
  and the disabled critical-upgrade path still proves its own boundary in the
  same cycle.

In the advisor-only cycle on the identical staged state, all four ranked
candidates are accounted `BLOCKED_SAFE_MODE`, nothing executes, and no
tracked upgrade count changes.

In the disabled cycle (`book00-live-purchase-legacy`), the callsite itself
supplies the boundary with the explicit reason `generic Smart upgrades are
disabled by configuration`, zero proposals, zero held candidates and a
`NOT_EVALUATED` delegation branch.

## Coverage, WAIT and ownership verdict

Two of ten retained legacy paths now carry a proven path boundary
(`CRITICAL_PRODUCTION_UPGRADES`, `SMART_UPGRADES`). This slice does not claim
M6 execution coverage:

- `SMART_UPGRADES` `m6Coverage` remains `NONE`;
- complete M6 execution paths: `0` of `10`;
- WAIT precondition: `FAIL`;
- WAIT recommendation authority: `ADVISOR_ONLY`;
- whole-cycle ownership eligible: `false`;
- `m6DecisionOwnsMainCycle`: `false`.

Phase 3 slice 9 is valid. The generic Smart-upgrade path now has a truthful
reversible-path boundary that reflects its real buy-max semantics, proven
against real production cycles and three independently rejected mutations.
Global execution ownership remains a `NO_GO`; the next defensible work is the
same boundary discipline on the next reversible path, not an ownership toggle
or an ETA-conversion shortcut.
