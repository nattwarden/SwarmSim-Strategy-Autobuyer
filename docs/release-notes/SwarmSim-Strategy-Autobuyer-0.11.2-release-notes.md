# SwarmSim Strategy Autobuyer 0.11.2 - Deterministic Scenario Harness + House of Mirrors Live-State Fix

Date: 2026-07-10

## Summary

0.11.2 is a narrow patch with two tightly linked goals:

- fix confirmed House of Mirrors preferred-unit readiness staleness in live evaluations,
- add an explicitly gated deterministic scenario harness for reproducible strategy checks.

No broad strategy rewrite is included.

## What changed

### 1) House of Mirrors live-state readiness fix

Root cause fixed:

- preferred-unit matching used labels including suffix `V` (for example `Culicimorph V`),
- but game units expose suffix separately (`unit.suffix`) and some preferred tiers use internal names (`mosquito`, `spider`) with display labels (`culicimorph`, `arachnomorph`),
- matching text omitted suffix, so missing-list could remain stale even after unit counts changed.

Fix:

- HoM preferred-unit matching now includes `unit.suffix` in the matching text,
- live counts are recomputed from current unitlist each evaluation,
- mirror reason/missing-list are rebuilt per evaluation from current gate state,
- added minimal debug observability:
  - `energySupportMirrorArmyStateSource`
  - `energySupportMirrorEvaluationRevision`

### 2) Deterministic scenario harness (explicitly gated)

Added a debug API-only scenario harness under:

- `window.kbcSwarmBot.scenarioHarness`

Gating and safety:

- disabled by default,
- must be explicitly enabled through localStorage key `kbcSwarmBotScenarioHarnessEnabled_v1=true`,
- no scenario controls were added to normal release UI,
- harness runs in advisor-only mode and does not write save state,
- scenario overlays are in-memory override layers for resources, unit counts, velocities, ability visibility, and ability energy cost.

Runner capabilities:

- scenario id/source tagging,
- deterministic override application,
- multi-cycle evaluation with between-cycle override changes,
- structured invariant checks (`equals`, `includes`, `notIncludes`, `oneOf`),
- structured JSON report payload sections for state, decision, projection, and invariant outcomes.

### 3) Version consistency

Updated to `0.11.2` across:

- package version,
- userscript metadata,
- runtime script version,
- export `scriptVersion` field.

## New checks

Added:

- `scripts/check-0.11.2-invariants.js`
- npm script: `npm run check:0.11.2`

The 0.11.2 invariant check verifies:

- HoM suffix-aware matching,
- mirror source/revision observability fields,
- scenario harness explicit gate,
- scenario harness debug API exposure.

## Safety defaults preserved

Still preserved:

- `autoCastAbilities: false`
- `autoAscend: false`
- `energySupportBrokerAllowAutoCast: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no blind buyMax behavior
- Nexus/energy protection unchanged
- Lepidoptera stop threshold unchanged
- Army Seed scoring unchanged
