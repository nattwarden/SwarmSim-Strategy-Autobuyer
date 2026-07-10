# Browser deterministic batch export 0.11.7

- Exported: 2026-07-10T06:16:02.592Z
- Commit SHA: 1ee631901cd04a1d97ddb0bcee5efa2499481ecc
- Branch: main
- Script version: 0.11.7
- Scenario report version: 0.11.7

## Batch result

- Scenarios: 14
- Cycles: 16
- Invariants: 38
- Failed invariants: 0
- Setup errors: 0
- Runtime errors: 0

## Focus scenarios

- H3: PASS
- H4: PASS
- H5: PASS
- R2: PASS
- R3: PASS
- R8 cycle 1: PASS
- R8 cycle 2: PASS

## Gating-off test

- PASS
- Returned error: Scenario harness is disabled. Enable explicitly with localStorage key kbcSwarmBotScenarioHarnessEnabled_v1=true.

## Restoration and leak check

- PASS
- Scenario leaks: 0
- Live-state unchanged during test: true
- Distinct action-unit counts across sequential runs: 12.3K vs 7

## Notes

- Deterministic harness suppresses buy command writes during scenario execution.
- Forced meat-plan overrides are consumed in pre-planner plan construction and do not write decision outputs.
