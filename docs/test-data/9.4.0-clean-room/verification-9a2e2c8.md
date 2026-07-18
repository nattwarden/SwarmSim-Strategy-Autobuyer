# 9.4.0 clean-room Smart-unit path-boundary verification

Verification date: 2026-07-18

## Immutable implementation identity

- implementation SHA: `9a2e2c8e5b4743d4d9048c55131dc14994d758f0`
- implementation tree: `f2af65874fc02c2f47e1c559ce244098689369d9`
- evidence base SHA: `9a2e2c8e5b4743d4d9048c55131dc14994d758f0`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `9a2e2c8e5b4743d4d9048c55131dc14994d758f0`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/Documents/SwarmSim-9.4.0-clean-room-verify-9a2e2c8`
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
- a first `GIT_COMMIT=9a2e2c8e... npm run verify` attempt failed at
  `check:live-purchase-acceptance` Scenario B with
  `expected M6 execution authority but got false` after `38.5s`. An isolated
  rerun of the same check at the same SHA passed both scenarios, confirming a
  transient live-staging outcome, not a code regression; the same complete
  suite had also passed at this exact code state in the primary workspace
  before the implementation commit. Per the established protocol the failed
  attempt was discarded and is recorded here instead of being counted as
  acceptance.
- `GIT_COMMIT=9a2e2c8e5b4743d4d9048c55131dc14994d758f0 npm run verify`
  (complete rerun) - exit `0`; the complete configured suite, now including
  `check:9.4.0:critical-upgrade-boundary`,
  `check:9.4.0:smart-upgrade-boundary` and
  `check:9.4.0:smart-unit-boundary`, passed in `117.2s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `node scripts/check-9.4.0-smart-unit-boundary.js --mutate-amount`
  - exit `1`, expected. The in-memory mutant doubled the bounded buy amount;
  the fail-closed boundary guard refused every buy as a contract violation
  before any real purchase, and the verifier rejected the cycle.
- `node scripts/check-9.4.0-smart-unit-boundary.js --mutate-identity`
  - exit `1`, expected. The in-memory mutant drifted the authorized proposal
  identity away from the unit the command targets; the guard refused the buy
  fail-closed and the verifier rejected the cycle.
- `node scripts/check-9.4.0-smart-unit-boundary.js --mutate-accounting`
  - exit `1`, expected. The in-memory mutant dropped the boundary from the
  disposition row; boundary evidence degraded to `MISSING` and was rejected.
- final identity, `git status --porcelain` and `git diff --check` - exit `0`;
  status count `0`, `HEAD` and the remote branch still matched the exact
  implementation SHA, and the tree remained
  `f2af65874fc02c2f47e1c559ce244098689369d9`.

All checks and mutations were self-cleaning. No runtime, fixture, verifier,
package, configuration, JSON, Markdown or strategy-audit artifact remained in
the exact-SHA worktree. This file is the only post-implementation evidence.

## Path-boundary contract

`buySmartUnits` now emits one `smart-unit-path-boundary.v1` per evaluated
cycle:

1. every ranked queue candidate that reaches the buy decision carries an
   exact canonical proposal identity
   (`smart-unit::<executionId>::unit::<variant>`) and an authorization bound
   to the coordinator's decision cycle, snapshot and active target;
2. the buy command is bounded by the exact per-candidate amount; a command
   amount or unit identity that differs from the authorization is refused
   fail-closed and recorded as `CONTRACT_VIOLATION`;
3. an `EXECUTED` outcome requires authorized, command and confirmed amounts
   to be exactly equal on a real unit-count basis
   (`real-unit-count-delta`);
4. the orchestrated branches are explicit accounted records instead of
   silent control flow: the ascension pause, the delegated meat-guard
   planner (`SKIPPED_EXACT_M6_EXECUTION` / `EXECUTED_DELEGATED` /
   `STOPPED_FURTHER_BUYS` / `NO_ACTION` / `NOT_EVALUATED`), the pre-queue
   and post-meat territory guards and meat chain prep all report their real
   bought counts;
5. held queue candidates are accounted per class (meat guards, generic
   guards, fallback disabled), and a disabled path or an empty queue states
   an explicit not-applicable reason;
6. the proposal metric identity is the candidate's own owned-count with
   `rankingAuthority: PATH_BOUNDARY_OBSERVABILITY_ONLY` - observability,
   never an M2/M6 ranking input, and no ETA conversion is invented.

The coverage ledger validates the contract with contract-specific rules; the
slice-8/9 rules are unchanged, and legitimate skips remain `NOT_EVALUATED`,
never proof.

## Real fixed-cycle results

The verifier reuses the exact proven legacy-purchase state and grounds
execution identity in real unit counts read from game state.

In the executed cycle, the ranked queue executes exactly one real bounded
`drone` purchase:

- executed candidate: `drone`, authorized `446`, command `446`, confirmed
  `446` on a real unit-count delta;
- delegated branches all at explicit zero: meat-guard planner `NO_ACTION`,
  territory guard `0`/`0`, chain prep `0`;
- no other tracked unit increased, M6 execution authority stayed `false`,
  and the disposition is `EXECUTED` with a real main-action ledger delta.

In the advisor-only cycle on the identical staged state, the reached
candidate is accounted `BLOCKED_SAFE_MODE`, nothing executes, and no tracked
unit count changes.

In the disabled cycle, the callsite itself supplies the boundary with the
explicit reason `generic Smart units are disabled by configuration`, zero
proposals, zero held candidates and a `NOT_EVALUATED` planner branch.

## Coverage, WAIT and ownership verdict

Three of ten retained legacy paths now carry a proven path boundary
(`CRITICAL_PRODUCTION_UPGRADES`, `SMART_UPGRADES`, `SMART_UNITS`). This
slice does not claim new M6 execution coverage:

- `SMART_UNITS` `m6Coverage` remains `PARTIAL`, exactly as declared by
  slice 6;
- complete M6 execution paths: `0` of `10`;
- WAIT precondition: `FAIL`;
- WAIT recommendation authority: `ADVISOR_ONLY`;
- whole-cycle ownership eligible: `false`;
- `m6DecisionOwnsMainCycle`: `false`.

Phase 3 slice 10 is valid. The generic Smart-unit path now has a truthful
reversible-path boundary covering its own bounded queue purchase and making
every orchestrated branch explicit, proven against real production cycles
and three independently rejected mutations. Global execution ownership
remains a `NO_GO`; the next defensible work is the same boundary discipline
on the next reversible path, not an ownership toggle or an ETA-conversion
shortcut.
