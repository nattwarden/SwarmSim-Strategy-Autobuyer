# 9.4.0 clean-room same-cycle applicability verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `495513c660909cce9390af2a923256d8ecf52c23`
- implementation tree: `9aab4ca5d1ac5cef03d3b64793940bb17bf6ecca`
- evidence base SHA: `495513c660909cce9390af2a923256d8ecf52c23`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `495513c660909cce9390af2a923256d8ecf52c23`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/OneDrive/Dokument/SwarmSim-9.4.0-clean-room-verify-495513c`
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
- `GIT_COMMIT=495513c660909cce9390af2a923256d8ecf52c23 npm run verify`
  - exit `0`; the complete configured suite passed in `136.9s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `node scripts/check-9.4.0-same-cycle-applicability.js
  --mutate-missing-disposition` - exit `1`, expected. The in-memory mutant
  removed the critical-production-upgrade disposition; the verifier rejected
  the incomplete same-cycle ledger as `MISSING`.
- `node scripts/check-9.4.0-same-cycle-applicability.js
  --mutate-stale-cycle-evidence` - exit `1`, expected. The in-memory mutant
  supplied a stale cycle identity; the verifier rejected the evidence as
  `MISSING`.
- `node scripts/check-9.4.0-same-cycle-applicability.js
  --mutate-global-ownership` - exit `1`, expected. The in-memory mutant set
  `m6DecisionOwnsMainCycle=true`; evidence produced after global suppression
  was not accepted as proof of legacy-path applicability.
- final identity, `git status --porcelain` and `git diff --check` - exit `0`;
  status count `0`, `HEAD` and the remote branch still matched the exact
  implementation SHA, and the tree remained
  `9aab4ca5d1ac5cef03d3b64793940bb17bf6ecca`.

All checks and mutations were self-cleaning. No runtime, fixture, verifier,
package, configuration, JSON, Markdown or strategy-audit artifact remained in
the exact-SHA worktree. This file is the only post-implementation evidence.

## Same-cycle evidence contract

The runtime now emits `main-cycle-applicability-evidence.v1` from the actual
`smartRunOnce` cycle. Evidence is accepted only when:

1. its snapshot and cycle identities match the coordinator context;
2. it contains exactly the ten source-grounded path identities;
3. every path has one allowed disposition;
4. evidence was not obtained by suppressing the legacy cycle through global
   M6 ownership.

The allowed dispositions are `EXECUTED`, `EVALUATED_ACTIONABLE`,
`EVALUATED_BLOCKED`, `NOT_APPLICABLE`, `SKIPPED_BUDGET`,
`SKIPPED_EXACT_M6_EXECUTION`, and `SKIPPED_GLOBAL_M6_OWNERSHIP`. The last
disposition is observable but can never prove applicability; this prevents
the ownership flag from manufacturing its own prerequisite.

## Real fixed-cycle results

The verifier exercises two real production URL cycles through the strategy
testbed, not scenario labels or a hand-authored expected ledger.

In the legacy-purchase cycle, the real Drone count and main-action ledger both
increase. The path dispositions are:

- Larva Engine guard: `NOT_APPLICABLE`;
- critical production upgrades: `NOT_APPLICABLE`;
- Energy guard: `EVALUATED_BLOCKED`;
- Clone Ramp: `NOT_APPLICABLE`;
- normal Clone Buffer: `NOT_APPLICABLE`;
- zero-budget Clone Buffer hard-lock recovery: `NOT_APPLICABLE`;
- Meat unlock planner: `NOT_APPLICABLE`;
- generic Smart upgrades: `NOT_APPLICABLE`;
- generic Smart units: `EXECUTED`;
- final Clone preparation: `NOT_APPLICABLE`.

In the exact-M6 cycle, the real Swarmling count increases by three under the
bounded M6 purchase. The retained paths have these dispositions:

- Larva Engine guard, critical production upgrades, Energy guard, Clone Ramp,
  normal Clone Buffer, Meat unlock planner, generic Smart upgrades and generic
  Smart units: `SKIPPED_BUDGET`;
- zero-budget Clone Buffer hard-lock recovery and final Clone preparation:
  `NOT_APPLICABLE`.

Both cycles produce `PROVEN` same-cycle applicability evidence for all ten
ledger paths. The proof is grounded in actual evaluation, result objects,
candidate decisions, side-action deltas, main-action ledger deltas and real
unit-count deltas as appropriate to each path.

## Coverage, WAIT and ownership verdict

This slice closes only the missing same-cycle-evidence prerequisite. It does
not claim M6 replacement coverage:

- required paths: `10`;
- retained legacy owners: `10`;
- paths with proven same-cycle disposition: `10`;
- complete M6 execution paths: `0`;
- partial M6 representation: `4`;
- no M6 execution representation: `6`;
- WAIT precondition: `FAIL`;
- WAIT recommendation authority: `ADVISOR_ONLY`;
- whole-cycle ownership eligible: `false`;
- `m6DecisionOwnsMainCycle`: `false`.

Phase 3 slice 7 is valid. Same-cycle disposition evidence is now complete and
fail-closed for the exercised production cycles, but global execution
ownership remains a `NO_GO` because none of the ten retained legacy paths has
complete M6 execution coverage. The next defensible work is to close proposal
and accountability coverage path by path, starting with one reversible path;
it is not an ownership toggle or an ETA-conversion shortcut.
