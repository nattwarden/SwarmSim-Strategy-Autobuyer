# 9.4.0 clean-room meat unlock planner path-boundary verification

Verification date: 2026-07-18

- implementation SHA: `6ce6b3df986e766b08edea31b578c9fafb2b69f9`
- implementation tree: `d40233e9e4badb8fceece7b5e55bde7159100e01`
- verification checkout: detached exact-SHA
  `C:/Users/info/Documents/SwarmSim-verify-6ce6b3d`
- Node.js `v24.14.0`; npm `11.9.0`; `npm ci --ignore-scripts` exit `0`.
- `GIT_COMMIT=6ce6b3df986e766b08edea31b578c9fafb2b69f9 npm run verify`
  exit `0` in `127s`; final tracked status and `git diff --check` were clean.

`MEAT_UNLOCK_PLANNER` now emits `meat-unlock-planner-path-boundary.v1`. The
legacy `runUnlockPlanner` issues at most one bounded command per cycle (every
buy path returns immediately), so its body is wrapped so the boundary attaches
at a single exit carrying at most one proposal. Each of the four real buy sites
— the two twin-unlock threshold upgrades (opportunity-cost-bypass and
rebuild-safe branches), the twin-prep unit buy and the unlock/parent-step unit
buy — creates a canonical proposal (`meat-unlock-guard::<id>::<kind>::<variant>`)
with cycle-bound authorization and a fail-closed identity/amount check that
bounds the command to the authorized amount before it is issued; a mismatch is
accounted as `CONTRACT_VIOLATION` with no purchase.

Confirmation basis: amount-`1` twin upgrades confirm exactly via
`real-upgrade-count-delta` (upgrade counts have no passive production); the
large-magnitude unit buys (twin-prep, unlock/parent-step) confirm via a real
positive `real-unit-count-delta`, because those counts carry `Decimal`
precision noise — the fail-closed command check carries the exact-bounded
guarantee, not string equality of a precision-lossy delta.

Live boundary proof against the pinned Clone Ramp save
(`docs/test-data/clone-ramp/live-user-save.txt`), driven through real
headless-Chrome `runOnce()` cycles with the meat unlock/parent-step/twin lane
isolated: the `MEAT_UNLOCK_PLANNER` row reports `disposition = EXECUTED`,
`pathBoundaryEvidence = PROVEN`, a single `parent-step` proposal (`pantheon`,
`unit`) `EXECUTED` with a bounded command and a real positive
`real-unit-count-delta`, bound to the real `cycle-1` / `Expansion` identity,
`contractViolationCount = 0`, accounting covering every proposal. The twin and
unlock-step variants share the identical validated boundary machinery
(`isMeatUnlockPlannerBoundaryValid`).

This does not change the target/parent/twin resolution, the reserve/payback/
rebuild guards, any buy amount, hard safety defaults, M6 coverage (`PARTIAL`)
or whole-cycle ownership (`m6DecisionOwnsMainCycle` stays `false`).
