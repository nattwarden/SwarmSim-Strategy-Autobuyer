# SwarmSim Strategy Autobuyer 0.11.6 - Deterministic Harness Progression Patch

Date: 2026-07-10

## Summary

0.11.6 is a narrow 0.11.x patch that improves deterministic scenario progression
without widening runtime automation or touching Laboratory scope.

Primary intent:

1. reduce scenario alias/matching brittleness for deterministic unit overrides,
2. prevent scenario-mode planner standstill when visible-state depth is shallow,
3. preserve hard safety defaults and existing runtime guardrails.

## What changed

### 1) Scenario override suffix aliasing

Deterministic unit override matching now supports Roman/number suffix aliases
used in scenario payloads.

This improves matching stability for tiered unit labels in scenario input where
suffix forms may differ.

### 2) Army-prep label alias matching

House-of-Mirrors army-prep label matching now includes explicit alias fallback:

- Culicimorph <-> mosquito
- Arachnomorph <-> spider
- V <-> 5 suffix compatibility

This is strictly a deterministic/state-label matching hardening change.

### 3) Scenario-mode meat target fallback

When deterministic harness runs from shallow live visibility, scenario mode can
select a deeper meat-chain target fallback to keep parent-step/refill evaluation
alive instead of degrading to inert planner state.

This fallback is scoped to scenario mode and does not alter normal runtime lane
risk posture.

## Safety defaults preserved

Unchanged:

- autoCastAbilities=false
- autoAscend=false
- energySupportBrokerAllowAutoCast=false
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no aggressive buyMax default in Smart mode

## Verification artifacts

Deterministic evidence for this patch version is tracked under:

- docs/test-data/0.11.6-scenarios/
- docs/live-logs/browser-test-0.11.6-export.md
