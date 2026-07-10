# 0.11.5 Deterministic Scenario Summary

- Run at: 2026-07-10T03:05:07.130Z
- Source: deterministic-scenario
- Script version: 0.11.5
- Scenario report version: 0.11.5
- Autobuyer version: 0.11.5
- Invariants: 28 pass / 10 fail
- Scenarios: 14 total

## Hard gate version surfaces

- userscript metadata @version: 0.11.5
- browser badge: 0.11.5
- export scriptVersion: 0.11.5
- scenario report autobuyerVersion: 0.11.5
- Hard gate verdict: PASS

## Harness gate-off behavior

- `scenarioHarness.run(...)` while disabled returns:
	- `ok=false`
	- `error="Scenario harness is disabled. Enable explicitly with localStorage key kbcSwarmBotScenarioHarnessEnabled_v1=true."`

## Failed scenarios

- H3: 1 failed invariant (`h3-stinger-missing`)
- H4: 2 failed invariants (`h4-payoff-gate`, `h4-reason`)
- H5: 1 failed invariant (`h5-mirror-decision`)
- R2: 1 failed invariant (`r2-role`)
- R3: 4 failed invariants (`r3-role`, `r3-best-use`, `r3-advisor`, `r3-speaker`)
- R8: 1 failed invariant (`r8-c1-parent-step`)

## R8 cycle-by-cycle trace

Cycle 1 observed:

- `parentStepDecision=HOLD` (expected BUY)
- `actionUnitRefillDecision=OBSERVE` (expected not BUY; this part passed)
- `activePlannerAction=Meat: drone`
- `parentStepReason=no direct parent step above drone on target path to drone`
- `betweenCycleApplied=no`

Cycle 2 observed:

- `betweenCycleApplied=yes` (pass)
- `plannerTransitionMarker=r8-parent-step-completed` (pass)
- `parentStepCompletedForRefill=yes` (pass)
- `transitionSeenByCycle=yes` (pass)
- `actionUnitRefillDecision=BUY` (pass)
- `activePlannerAction=Parent Refill: drone` (pass)
- `actionUnitRefillReason=action-unit refill after parent-step none; buy 5 drone for target path drone; payback/reserve guard ok` (pass)
- `parentStepDecision=HOLD` (expected not BUY; this part passed)

## UI/export consistency sampling

- H4: no `undefined`/`NaN` in extracted decision payload, but mirror gate/reason mismatch remains.
- H5: no `undefined`/`NaN` in extracted decision payload, but mirror decision remains HOLD.
- R2: no `undefined`/`NaN` in extracted decision payload, but Lepidoptera role is `wait` instead of `background`.
- R3: no `undefined`/`NaN` in extracted decision payload, but Lepidoptera remains `wait` and advisor/speaker mismatch.
- R5: passes and payload has no `undefined`/`NaN`.

## Restoration and leakage checks

- Run history before normal run: 14
- Run history after normal run: 15
- Latest normal run has no `scenarioId` field
- Leaked scenario entries in run history: 0

## Safety defaults

- `autoCastAbilities=false`
- `autoAscend=false`
- `energySupportBrokerAllowAutoCast=false`
- No evidence of default auto-cast enablement for Clone Larvae or House of Mirrors.

## Final verdict

0.11.5 REQUIRES NEXT PATCH

Blocking reasons:

1. R8 cycle 1 Parent Step acceptance is still not met.
2. Lepidoptera role/selection expectations fail in R2 and R3.
3. HoM expectation mismatches remain in H3/H4/H5.
