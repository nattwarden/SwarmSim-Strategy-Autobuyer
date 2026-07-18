# 9.4.0 clean-room Clone Ramp guard path-boundary verification

Verification date: 2026-07-18

- implementation SHA: `23fdf2a52ec58bcd3b230cbec9b2ab81bcf52aac`
- implementation tree: `06c105761cbf68efd10e59f890729cd2585eb7d9`
- verification checkout: detached exact-SHA
  `C:/Users/info/Documents/SwarmSim-verify-23fdf2a`
- Node.js `v24.14.0`; npm `11.9.0`; `npm ci --ignore-scripts` exit `0`.
- `GIT_COMMIT=23fdf2a52ec58bcd3b230cbec9b2ab81bcf52aac npm run verify`
  exit `0` in `148s`; final tracked status and `git diff --check` were clean.

`CLONE_RAMP` now emits `clone-ramp-guard-path-boundary.v1` for the narrow,
user-authorized Clone Larvae auto-cast exception. The single Clone Larvae cast
carries an exact bounded amount of `1`, and — on a growth cast — the cocoon
bank carries its exact bounded cloned-larvae amount. Each real command is
canonicalized (`clone-ramp-guard::<id>::<kind>::<variant>`), bound to the
decision cycle/snapshot/active target, checked fail-closed for identity and
amount before it is issued, and confirmed by a real count delta
(`real-upgrade-count-delta` for the cast, `real-unit-count-delta` for the
bank). A command with mismatched identity or amount is accounted as
`CONTRACT_VIOLATION` and no purchase is issued.

Live boundary proof against the pinned Clone Ramp save
(`docs/test-data/clone-ramp/live-user-save.txt`), driven through real
headless-Chrome `runOnce()` cycles: the CLONE_RAMP ledger row reports
`disposition = EXECUTED`, `pathBoundaryEvidence = PROVEN`, and a two-proposal
boundary — cast `EXECUTED` with amount contract `1/1/1`
(`real-upgrade-count-delta`) and the cocoon bank `EXECUTED` with an exact
`real-unit-count-delta` — all bound to the real `cycle-1` / `Expansion`
identity, `contractViolationCount = 0`, accounting covering every proposal.

This does not change the Clone Ramp strategy, cast or bank amounts, the
Nexus/Energy reserve or visibility gates, the release-at-cap behavior, the
`autoCastCloneLarvae` exception boundary, hard safety defaults, M6 coverage
(`NONE`) or whole-cycle ownership (`m6DecisionOwnsMainCycle` stays `false`).
