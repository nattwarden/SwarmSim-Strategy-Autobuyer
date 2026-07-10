# 0.11.3 Deterministic Scenario Summary

- Run at: 2026-07-10T02:16:20.019Z
- Source: deterministic-scenario
- Script version: 0.11.3
- Scenario report version: 0.11.3
- Autobuyer version in report: null
- Invariants total: 30
- Invariants pass: 29
- Invariants fail: 1

## Scenario Status

- H1 pass 2 fail 0
- H2 pass 2 fail 0
- H3 pass 1 fail 0
- H4 pass 3 fail 0
- H5 pass 3 fail 0
- H6 pass 3 fail 0
- R1 pass 3 fail 0
- R2 pass 2 fail 0
- R3 pass 4 fail 0
- R4 pass 2 fail 0
- R5 pass 1 fail 0
- R6 pass 1 fail 0
- R7 pass 1 fail 0
- R8 pass 1 fail 1

## Single Remaining Failure

- Scenario: R8 cycle 2
- Invariant: r8-c2-parent-refill
- Field: actionUnitRefillDecision
- Expected: BUY
- Actual: OBSERVE

## Key Verification Notes

- H2 cycle semantics validated from state transitions: cycle 1 missing preferred units, cycle 2 sees preferred units present and no missing-unit reason.
- H4 payoff gate validated: decision HOLD with payoff gating and low gain ratios.
- H5 arbitration validated: house-of-mirrors wins best-use ranking and couples with General Mandible.
- R2 and R3 planner-path authenticity validated via role changes from background to primary without direct invariant forcing.
- R4 and R5 clone thresholds validated in this run: threshold HOLD for low benefit and ADVISE when meaningful.
- P4 is not defined as a standalone scenario in 0.11.3 definitions; coverage is represented by H5 arbitration and R4/R5 clone controls.

## Safety Snapshot (Post-Run)

- autoCastAbilities false
- autoAscend false
- energySupportBrokerAllowAutoCast false

## Verdict Basis

- Harness and scenario gates behave as expected.
- Most H and R requirements pass.
- A deterministic behavioral gap remains in R8 parent-refill cycle 2 and should be fixed in 0.11.4.
