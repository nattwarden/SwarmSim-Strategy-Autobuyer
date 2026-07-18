# 9.4.0 clean-room critical-upgrade path-boundary verification

Verification date: 2026-07-18

## Immutable implementation identity

- implementation SHA: `e47c308e3d4398f5d5e431f1715ecfce00e78810`
- implementation tree: `ba35f4cf213b1003a28fa67452fb5e972f1dadae`
- evidence base SHA: `e47c308e3d4398f5d5e431f1715ecfce00e78810`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `e47c308e3d4398f5d5e431f1715ecfce00e78810`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/Documents/SwarmSim-9.4.0-clean-room-verify-e47c308`
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
- `GIT_COMMIT=e47c308e3d4398f5d5e431f1715ecfce00e78810 npm run verify`
  - exit `0`; the complete configured suite, now including
  `check:9.4.0:critical-upgrade-boundary`, passed in `122s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `node scripts/check-9.4.0-critical-upgrade-boundary.js --mutate-amount`
  - exit `1`, expected. The in-memory mutant raised the buy command amount to
  `2`; the fail-closed boundary guard refused every buy as a contract
  violation before any real purchase, and the verifier rejected the cycle.
- `node scripts/check-9.4.0-critical-upgrade-boundary.js --mutate-identity`
  - exit `1`, expected. The in-memory mutant bought a different ranked
  candidate than the authorized proposal; the real `droneprod` upgrade count
  read from game state did not increase and the claimed execution identity was
  rejected.
- `node scripts/check-9.4.0-critical-upgrade-boundary.js --mutate-accounting`
  - exit `1`, expected. The in-memory mutant dropped the boundary from the
  disposition row; boundary evidence degraded to `MISSING` and was rejected.
- final identity, `git status --porcelain` and `git diff --check` - exit `0`;
  status count `0`, `HEAD` and the remote branch still matched the exact
  implementation SHA, and the tree remained
  `ba35f4cf213b1003a28fa67452fb5e972f1dadae`.

All checks and mutations were self-cleaning. No runtime, fixture, verifier,
package, configuration, JSON, Markdown or strategy-audit artifact remained in
the exact-SHA worktree. This file is the only post-implementation evidence.

## Path-boundary contract

`handleCriticalProductionUpgrades` now emits one
`critical-upgrade-path-boundary.v1` per evaluated cycle. For every ranked
candidate the boundary requires, before any real buy:

1. an exact canonical proposal identity
   (`critical-upgrade::<executionId>::upgrade::base`);
2. an authorization identity bound to the coordinator's decision cycle,
   snapshot and active target;
3. a command amount exactly equal to the authorized bounded amount `1`,
   enforced fail-closed - a mismatch refuses the buy and is recorded as
   `CONTRACT_VIOLATION`;
4. an honest same-target metric identity
   (`<candidate>-step-completion` / `percent` /
   `same-unit-milestone-progress-delta`) with
   `rankingAuthority: PATH_BOUNDARY_OBSERVABILITY_ONLY` - the proposal is
   observability, never an M2/M6 ranking input, and no ETA conversion is
   invented.

Every candidate outcome is accounted explicitly: `EXECUTED` (with a
four-value amount contract confirmed by a real upgrade-count delta),
`BLOCKED_SAFE_MODE`, `BLOCKED_PROTECTED_COST`, `SKIPPED_BUDGET`,
`COMMAND_FAILED` or `CONTRACT_VIOLATION`; an empty or disabled path must
state an explicit not-applicable reason. The coverage ledger declares the
boundary contract on the `CRITICAL_PRODUCTION_UPGRADES` row only and
classifies per-cycle boundary evidence as `PROVEN`, `NOT_EVALUATED` (the
path was legitimately skipped - never proof) or `MISSING`.

## Real fixed-cycle results

The verifier exercises three real production URL cycles through the strategy
testbed; execution identity is grounded in real upgrade counts read from game
state, not in the bot's self-report.

In the executed cycle, meat-chain unit seeding makes the game's own rules
expose real `faster` production upgrades. The path proposes three ranked
candidates and the single-action budget executes exactly the top one:

- executed candidate: `droneprod`, real upgrade count `0 -> 1`;
- every other tracked production upgrade count unchanged;
- amount contract: authorized `1`, command `1`, confirmed `1`, basis
  `real-upgrade-count-delta`;
- accounting: `1` executed, `2` skipped-budget, `0` violations;
- the remaining paths saw the budget consumed (`SMART_UNITS` is
  `SKIPPED_BUDGET`), M6 execution authority stayed `false`, and the
  disposition is `EXECUTED` with a real main-action ledger delta.

In the advisor-only cycle on the identical staged state, all three ranked
candidates are accounted `BLOCKED_SAFE_MODE`, nothing executes, no tracked
upgrade count changes, and boundary evidence is still `PROVEN`.

In the disabled cycle (`book00-live-purchase-legacy`), the path proposes and
holds nothing, states `prioritizeProductionUpgrades is disabled` explicitly,
and boundary evidence is `PROVEN` for the honest `NOT_APPLICABLE` outcome.

## Coverage, WAIT and ownership verdict

This slice closes the proposal-identity, bounded-authorization and outcome
accountability prerequisite for one path. It does not claim M6 execution
coverage:

- `CRITICAL_PRODUCTION_UPGRADES` `m6Coverage` remains `NONE`;
- complete M6 execution paths: `0` of `10`;
- WAIT precondition: `FAIL`;
- WAIT recommendation authority: `ADVISOR_ONLY`;
- whole-cycle ownership eligible: `false`;
- `m6DecisionOwnsMainCycle`: `false`.

Phase 3 slice 8 is valid. The critical-upgrade path now has a truthful
reversible-path boundary with exact proposal identity, cycle-bound
authorization, a fail-closed amount guard and complete execute/block/
not-applicable accounting, proven against real production cycles and three
independently rejected mutations. Global execution ownership remains a
`NO_GO`; the next defensible work is the same boundary discipline on the next
reversible path, not an ownership toggle or an ETA-conversion shortcut.
