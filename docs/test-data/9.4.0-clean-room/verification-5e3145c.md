# 9.4.0 clean-room final clone prep path-boundary verification

Verification date: 2026-07-18

- implementation SHA: `5e3145c7db826e08ac72458b9c384f1343b372a9`
- implementation tree: `e80a330cc444134049718ac483a605fb39bb9a30`
- verification checkout: detached exact-SHA
  `C:/Users/info/Documents/SwarmSim-verify-5e3145c`
- Node.js `v24.14.0`; npm `11.9.0`; `npm ci --ignore-scripts` exit `0`.
- `GIT_COMMIT=5e3145c7db826e08ac72458b9c384f1343b372a9 npm run verify`
  exit `0` in `126s`; final tracked status and `git diff --check` were clean.

`FINAL_CLONE_PREP` now emits `final-clone-prep-path-boundary.v1` — the last of
the ten retained legacy paths to receive a proven path boundary. The Clone Prep
cocoon side-task (`manageCloneCocoons`) issues one real command, the bounded
cocoon side-buy; its body is wrapped so the boundary attaches at a single exit
with at most one proposal. The command carries a canonical proposal identity
(`final-clone-prep-guard::<id>::unit::cocoon-prep`), cycle-bound authorization
and a fail-closed identity/amount check that bounds the command to the
authorized amount before it is issued; a mismatch is accounted as
`CONTRACT_VIOLATION` with no purchase. Confirmation is a real positive
`real-unit-count-delta` (the cocoon count is a large-magnitude unit count that
carries `Decimal` precision noise), so the exact-bounded guarantee is carried by
the fail-closed command check rather than string equality of a precision-lossy
delta.

Live boundary proof against the pinned Clone Ramp save
(`docs/test-data/clone-ramp/live-user-save.txt`), driven through real
headless-Chrome `runOnce()` cycles with the cocoon buffer target set above the
current cocoon count: the `FINAL_CLONE_PREP` row reports `disposition =
EXECUTED`, `pathBoundaryEvidence = PROVEN`, a single `cocoon-prep` proposal
(`cocoon`, `unit`) `EXECUTED` with a bounded command and a real positive
`real-unit-count-delta`, bound to the real `cycle-1` / `Expansion` identity,
`contractViolationCount = 0`, accounting covering every proposal.

This does not change the Clone Prep cooldown, target/chunk sizing, the side-buy
amount, hard safety defaults, M6 coverage (`NONE`) or whole-cycle ownership
(`m6DecisionOwnsMainCycle` stays `false`).
