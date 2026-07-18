# 9.4.0 clean-room Clone Buffer guard path-boundary verification

Verification date: 2026-07-18

- implementation SHA: `e2569dec0fcf2dd81d79e7a33f98aea216c3f1ad`
- implementation tree: `b9d37b41bcd7b6958561815f40487a4a436ff378`
- verification checkout: detached exact-SHA
  `C:/Users/info/Documents/SwarmSim-verify-e2569de`
- Node.js `v24.14.0`; npm `11.9.0`; `npm ci --ignore-scripts` exit `0`.
- `GIT_COMMIT=e2569dec0fcf2dd81d79e7a33f98aea216c3f1ad npm run verify`
  exit `0` in `128s`; final tracked status and `git diff --check` were clean.

`CLONE_BUFFER` and its budget-exempt `CLONE_BUFFER_HARD_LOCK_RECOVERY` branch
now emit `clone-buffer-guard-path-boundary.v1`. Both retained ledger rows share
`executeCloneGuardAction` / `runCloneBufferPlanner`; the decision-cycle
identity (and each row's own `pathId`) is threaded through both callsites so
each row's boundary is self-consistent. The one real command — the hard-lock
cocoon recovery buy — carries a canonical proposal identity
(`clone-buffer-guard::<id>::unit::recovery`), cycle-bound authorization, and a
fail-closed identity/amount check that bounds the command to the authorized
amount (never `buyMax`) before it is issued; a mismatch is accounted as
`CONTRACT_VIOLATION` with no purchase.

Confirmation basis: the recovery amount is a large-magnitude unit count whose
real count delta carries `Decimal` precision noise (it is the difference of two
~1e24 cocoon/larva banks, unlike the amount-`1` upgrade paths and Clone Ramp's
fresh cast output). `EXECUTED` therefore records the real `real-unit-count-delta`
as a positive confirmed purchase rather than an exact-string match of the
request; the exact-bounded guarantee is carried by the fail-closed command
check, not by demanding string equality of a precision-lossy delta.

Live boundary proof against the pinned Clone Ramp save
(`docs/test-data/clone-ramp/live-user-save.txt`), driven through real
headless-Chrome `runOnce()` cycles with a manual `post-clone-lock` override:

- `CLONE_BUFFER` row: `disposition = EXECUTED`, `pathBoundaryEvidence = PROVEN`,
  a single cocoon recovery proposal `EXECUTED` with a bounded command and a real
  positive `real-unit-count-delta`, bound to the real `cycle-1` / `Expansion`
  identity, `contractViolationCount = 0`.
- `CLONE_BUFFER_HARD_LOCK_RECOVERY` row: with the single action slot consumed by
  the critical-upgrade lane and Clone Ramp off (so the recovery debt survives),
  `CLONE_BUFFER` is `SKIPPED_BUDGET` and the budget-exempt recovery else-branch
  runs; the row reports `disposition = EXECUTED`, `pathBoundaryEvidence =
  PROVEN`, `boundary.pathId = CLONE_BUFFER_HARD_LOCK_RECOVERY`, again bound to
  the real cycle identity.

This does not change the Clone Buffer mode/target resolution, protection ratios,
the recovery buy amount, the budget-exempt recovery behavior, hard safety
defaults, M6 coverage (`NONE`) or whole-cycle ownership
(`m6DecisionOwnsMainCycle` stays `false`).
