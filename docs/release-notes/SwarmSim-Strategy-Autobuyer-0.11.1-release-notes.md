# SwarmSim Strategy Autobuyer 0.11.1 - Energy Broker Consistency + Speaker Mapping Fix

Date: 2026-07-10

## Summary

0.11.1 is a narrow consistency and observability patch on top of 0.11.0.

This release fixes four specific issues in Energy Support Broker, momentum priority,
Council speaker mapping, and House of Mirrors readiness/reason refresh. No broad strategy
rewrite is included.

## What changed

### 1) Expansion save-window hard priority over Energy primary

When Expansion save-window priority is active:

- Lepidoptera cannot be assigned primary role.
- Energy broker cannot replace Expansion momentum as primary focus.
- Lepidoptera is limited to background/hold/wait behavior.
- Momentum advisor and Council speaker follow Expansion ownership.

### 2) Role/best-step consistency for Lepidoptera background

When Lepidoptera role is background:

- momentumBestStep cannot be Lepidoptera.
- primary focus cannot drift to Energy.
- Lepidoptera is kept in background actions and support messaging.

### 3) Primary Lepidoptera speaker mapping

When Lepidoptera is truly primary and no higher-priority gate blocks it:

- momentumPrimaryAdvisor is Beetle Magus.
- active Council speaker is mapped from the same primary source.
- momentumBestStep and Do this now align with energy growth.

### 4) House of Mirrors readiness/reason refresh

House of Mirrors readiness now reads from a single current-army source in each evaluation.
This updates missing preferred units and reason text from live state changes instead of
stale or divergent scanner paths.

## New observability fields (minimal)

- momentumPrimaryPrioritySource
- momentumPrimarySelectionReason
- energySupportMirrorReadinessState

## Safety defaults

Preserved:

- autoCastAbilities: false
- autoAscend: false
- energySupportBrokerAllowAutoCast: false
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no blind buyMax behavior
- Nexus/energy protection unchanged
- Lepidoptera stop threshold unchanged
- Twin Prep meaningful gate unchanged
- Parent Step/ReFill logic unchanged
- Army Seed scoring unchanged
