# SwarmSim Strategy Autobuyer 0.11.4 - Parent Step to Parent Refill Transition Fix

Date: 2026-07-10

## Summary

0.11.4 is an extremely narrow patch that fixes one confirmed deterministic scenario gap:

- R8 cycle 2 previously reported actionUnitRefillDecision=OBSERVE.
- Expected transition is actionUnitRefillDecision=BUY after Parent Step.

No strategy expansion was added.

## Root cause

The fault was in deterministic harness transition semantics, not in HoM/energy/clone planners.

In 0.11.3:

- cycle 1 could report parentStepDecision=BUY,
- but harness runs in advisor-only mode and does not execute the buy,
- cycle 2 therefore had no carried transition state for parent-step completion,
- refill branch stayed at OBSERVE because its gate depends on parent-step execution state.

R8 between-cycle overrides also lacked an explicit transition marker that cycle 2 could observe.

## What changed

### 1) Harness transition replay for R8-style between-cycle tests

Added narrow, harness-only transition replay state:

- betweenCycleApplied
- plannerTransitionMarker
- parentStepCompletedForRefill

When a between-cycle action marks parentStepCompletedForRefill=true, cycle 2 can replay parent-step completion state for refill evaluation without direct decision overrides.

### 2) Per-cycle transition observability

Cycle decision payload now includes compact transition and trace fields used by deterministic checks:

- parentStepTargetUnit
- parentStepParentUnit
- actionUnitRefillTargetUnit
- actionUnitRefillParentUnit
- remainingActions
- actionUnitCount
- parentUnitCount
- affordability
- reserveResult
- activePlannerAction
- plannerTransitionState
- betweenCycleApplied
- plannerTransitionMarker
- parentStepCompletedForRefill
- transitionSeenByCycle
- plannerEvaluationRevision
- harnessCycleRevision

### 3) R8 definition hardened for real transition assertions

R8 now includes a between-cycle transition marker and cycle-specific invariants to ensure:

- cycle 1 parent step first,
- cycle 2 transition seen,
- cycle 2 parent refill decision is BUY,
- repeated Parent Step in cycle 2 is treated as failure.

### 4) New 0.11.4 checks

Added:

- scripts/check-0.11.4-invariants.js
- scripts/check-0.11.4-scenarios.js
- scripts/check-0.11.4-cycle-semantics.js
- scripts/check-0.11.4-r8-transition.js
- scripts/run-0.11.4-deterministic-scenarios.js

## Safety defaults preserved

Unchanged:

- autoCastAbilities: false
- autoAscend: false
- energySupportBrokerAllowAutoCast: false
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no blind buyMax behavior
- Nexus/energy protection preserved
- Expansion save-window behavior preserved
