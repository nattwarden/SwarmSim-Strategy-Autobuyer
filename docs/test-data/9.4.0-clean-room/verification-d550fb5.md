# 9.4.0 clean-room Energy guard path-boundary verification

Verification date: 2026-07-18

- implementation SHA: `d550fb5b7199f78047b7ac809b197a7eedd31683`
- implementation tree: `cbf8c4662df65eaffab72d19ddecf52bb680bb3b`
- verification checkout: detached exact-SHA
  `C:/Users/info/Documents/SwarmSim-verify-d550fb5`
- Node.js `v24.14.0`; npm `11.9.0`; `npm ci --ignore-scripts` exit `0`.
- `GIT_COMMIT=d550fb5b7199f78047b7ac809b197a7eedd31683 npm run verify`
  exit `0` in `146.3s`; final tracked status and `git diff --check` were clean.

`ENERGY_GUARD` now emits `energy-guard-path-boundary.v1` for each existing
reversible Energy purchase: Nexus, pre-Nexus Lepidoptera ROI, and post-Nexus
Lepidoptera. Each proposal is canonicalized and bound to the decision cycle,
snapshot and active target; a command with mismatched identity or amount is
accounted as `CONTRACT_VIOLATION`. Executed upgrades and units require their
real count delta to confirm the authorized amount.

This does not change Energy ranking, amounts, reserves, ability auto-cast,
hard safety defaults, M6 coverage (`PARTIAL`) or whole-cycle ownership.
