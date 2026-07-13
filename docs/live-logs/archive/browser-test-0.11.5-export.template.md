# SwarmSim Strategy Autobuyer 0.11.5 - Browser Verification Template

Date: 2026-07-10
Target version: 0.11.5

## Hard gate version surfaces

Record exact observed values:

- userscript metadata @version:
- browser badge:
- export scriptVersion:
- scenario report autobuyerVersion:

Gate verdict:

- PASS if all four equal 0.11.5
- FAIL otherwise

## R8 acceptance (Parent transition finalization)

Cycle 1 expected:

- parentStepDecision = BUY
- actionUnitRefillDecision != BUY

Cycle 2 expected:

- actionUnitRefillDecision = BUY
- parentStepDecision != BUY
- activePlannerAction includes Parent Refill

Single-active-BUY requirement:

- In each cycle, at most one of Parent Step and Parent Refill is BUY

## State consistency

Confirm runtime/export/scenario report agree for cycle 2:

- parentStepDecision
- parentStepReason
- actionUnitRefillDecision
- actionUnitRefillReason
- activePlannerAction

## Safety confirmation

Verify unchanged defaults:

- autoCastAbilities=false
- autoAscend=false
- energySupportBrokerAllowAutoCast=false
- no Clone Larvae auto-cast
- no House of Mirrors auto-cast
- no Nightbug/Bat default buys

## Final verdict

- PASS / REQUIRES NEXT PATCH
- Notes:
