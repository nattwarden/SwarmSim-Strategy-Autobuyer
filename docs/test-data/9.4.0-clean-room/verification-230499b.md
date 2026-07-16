# 9.4.0 clean-room main-cycle coverage ledger verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `230499b57f4b24f3f22b3b9ba37249cbc888d958`
- implementation tree: `3278b013e26e6aab8e9a90a07b33209ca35cd49c`
- evidence base SHA: `230499b57f4b24f3f22b3b9ba37249cbc888d958`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `230499b57f4b24f3f22b3b9ba37249cbc888d958`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/OneDrive/Dokument/SwarmSim-9.4.0-clean-room-verify-230499b`
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
- `GIT_COMMIT=230499b57f4b24f3f22b3b9ba37249cbc888d958 npm run verify`
  - exit `0`; the complete configured suite passed in `139.6s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `git diff --check` - exit `0`.
- `node scripts/check-9.4.0-main-cycle-coverage.js
  --mutate-ledger-path` - exit `1`, expected. The in-memory mutant renamed the
  critical-production-upgrade row while leaving its real `smartRunOnce`
  callsite intact; the verifier rejected the ledger/source identity drift.
- `node scripts/check-9.4.0-main-cycle-coverage.js
  --mutate-wait-precondition` - exit `1`, expected. The in-memory mutant
  hardcoded whole-cycle eligibility and the verifier rejected the resulting
  false `PASS`.
- `node scripts/check-live-purchase-acceptance.js
  --mutate-m6-cycle-ownership` - exit `1`, expected. The in-memory mutant set
  `m6DecisionOwnsMainCycle=true`; Scenario A lost its real legacy selected
  action and was rejected.
- final identity, `git status --porcelain=v1` and `git diff --check` - exit
  `0`; status count `0`, and `HEAD` still matched the remote implementation.

All checks and mutations were self-cleaning. No runtime, fixture, verifier,
package, configuration, JSON, Markdown or strategy-audit artifact remained in
the exact-SHA worktree. This file is the only post-implementation evidence.

## Source-grounded inventory

The acceptance does not trust the runtime ledger by itself. It extracts the
real `smartRunOnce` body from the canonical userscript, requires one ordered
`main-cycle-coverage` marker for every declared path, binds every marker to its
actual execution call, and verifies the exact callsite count. The runtime API
and every coordinator result must expose the same canonical ledger.

Ten distinct legacy-owned execution paths are present:

1. Larva Engine guard;
2. critical production upgrades;
3. Energy guard;
4. Clone Ramp;
5. normal Clone Buffer;
6. zero-budget Clone Buffer hard-lock recovery;
7. Meat unlock planner;
8. generic Smart upgrades;
9. generic Smart units;
10. final Clone Prep side task.

The split between normal Clone Buffer and zero-budget recovery is material:
they share one adapter but have different budget semantics and separate
`smartRunOnce` callsites. Combining them would hide a path that global M6
ownership currently suppresses.

## Coverage and WAIT result

The machine-readable result is:

- required paths: `10`;
- retained legacy owners: `10`;
- complete M6 paths: `0`;
- partial M6 representation: Larva Engine guard, Energy guard, Meat unlock
  planner and generic Smart units;
- no M6 execution representation: critical upgrades, Clone Ramp, both Clone
  Buffer paths, Smart upgrades and final Clone Prep;
- same-cycle applicability evidence: `MISSING` for all ten paths;
- WAIT precondition: `FAIL`;
- whole-cycle ownership eligible: `false`;
- WAIT recommendation authority: `ADVISOR_ONLY`.

`PARTIAL` means that an M6 domain overlaps some actions in the legacy path; it
does not mean that the path can be disabled. A retained legacy owner is an
explicit safety declaration, not complete M6 coverage.

WAIT may become a whole-cycle conclusion only after every safe normal path has
both `COMPLETE` M6 coverage and same-cycle applicability evidence. Advisor-
only abilities and Ascension remain outside bounded purchase authority even
if those two preconditions are later met.

## Preserved invariants and verdict

This slice changes observability and verification only. It changes no score,
winner, proposal, bounded amount, purchase order, command, action budget,
resource protection, safety threshold, auto-cast default, ability authority
or Ascension authority. `m6DecisionOwnsMainCycle` remains `false`.

Phase 3 slice 6 is valid. The source-grounded ledger closes the documentation-
only inventory gap and makes the WAIT blocker machine-readable, but it also
proves that global execution ownership remains unready. The next defensible
step is same-cycle applicability evidence for all ten paths; it is not an M6
ownership toggle.
