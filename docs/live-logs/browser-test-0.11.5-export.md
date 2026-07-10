# SwarmSim Strategy Autobuyer 0.11.5 - Browser Verification Export

Date: 2026-07-10
Target version: 0.11.5

## Hard gate version surfaces

Observed values:

- userscript metadata @version: 0.11.5
- browser badge version: 0.11.5
- export scriptVersion: 0.11.5
- scenario report autobuyerVersion: 0.11.5

Gate verdict: PASS

## Harness gate-off check

Result while disabled:

- ok: false
- error: Scenario harness is disabled. Enable explicitly with localStorage key kbcSwarmBotScenarioHarnessEnabled_v1=true.

## Batch run summary

- run.ok: true
- source: deterministic-scenario
- runAt: 2026-07-10T03:05:07.130Z
- scenarios executed: 14
- invariants: 28 pass, 10 fail

Failed scenarios:

- H3 (1 fail)
- H4 (2 fail)
- H5 (1 fail)
- R2 (1 fail)
- R3 (4 fail)
- R8 (1 fail)

## R8 acceptance (Parent transition finalization)

Cycle 1 observed:

- parentStepDecision = HOLD
- actionUnitRefillDecision = OBSERVE
- activePlannerAction = Meat: drone
- parentStepReason = no direct parent step above drone on target path to drone

Cycle 2 observed:

- betweenCycleApplied = yes
- plannerTransitionMarker = r8-parent-step-completed
- parentStepCompletedForRefill = yes
- transitionSeenByCycle = yes
- actionUnitRefillDecision = BUY
- parentStepDecision = HOLD
- activePlannerAction = Parent Refill: drone
- actionUnitRefillReason = action-unit refill after parent-step none; buy 5 drone for target path drone; payback/reserve guard ok

R8 gate verdict: FAIL

## State consistency checks

Sampled scenarios H4, H5, R2, R3, R5 for runtime/export payload consistency:

- no undefined tokens in sampled decision payloads
- no NaN tokens in sampled decision payloads

Behavioral mismatches remain in H4/H5/R2/R3 as captured in scenario results.

## Restoration and leak checks

- runHistory before normal runOnce: 14
- runHistory after normal runOnce: 15
- latest normal run has scenarioId field: false
- leaked scenario entries in runHistory: 0

## Safety confirmation

Verified unchanged defaults:

- autoCastAbilities=false
- autoAscend=false
- energySupportBrokerAllowAutoCast=false

No evidence in this run of default auto-cast enablement for Clone Larvae or House of Mirrors.

## Final verdict

REQUIRES NEXT PATCH

Notes:

- Hard gate version parity is correct.
- Primary blocker is R8 cycle 1 parent-step acceptance failure.
- Additional expectation mismatches remain in H3/H4/H5 and R2/R3.
