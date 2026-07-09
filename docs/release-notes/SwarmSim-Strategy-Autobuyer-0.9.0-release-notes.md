# SwarmSim Strategy Autobuyer 0.9.0 - Post-Nexus Strategy Pack

Date: 2026-07-10

## Summary

0.9.0 is a larger strategy pack built on the local 0.8.14 Council UI baseline.

The release adds a conservative post-Nexus Lepidoptera planner, improves
remaining action-budget diagnostics, and maps the new planner state into the
Strategy Inspector, export, and Swarm Council without changing hard safety
defaults.

## What changed

### Post-Nexus Energy Planner

After the configured Nexus target is met, the Energy lane can now buy a bounded
Lepidoptera chunk when all hard guards pass:

- Nexus target is already met
- Lepidoptera is visible and buyable
- current boost is below the configured stop threshold
- the chunk is capped by `maxLepidopteraPerRun`
- an energy reserve is kept
- the expected boost gain is meaningful

The planner does not use buyMax, does not buy Nightbug or Bat by default, and
does not cast abilities.

### Action-budget diagnostics

Coordinator remaining-budget reasons are now more concrete when Smart Mode does
not spend all configured actions. Reasons are normalized toward:

- no safe chunk
- protected resource
- save window
- payback
- reserve
- cooldown
- not meaningful
- better target-path action already used budget

### Council UI and export

The new post-Nexus Energy Planner state is visible in:

- Strategy Inspector
- Markdown/JSON export
- Swarm Council Focus now
- Beetle Magus advisor card

Larva Steward copy now distinguishes hard lock, active cocoon side-task,
waiting/cooldown, and satisfied buffer states.

### Territory / Army and Clone / Cocoon

0.9.0 keeps the existing bounded Territory/Army and Clone/Cocoon planner hooks.
The release improves observability and Council wording rather than widening
automation.

## Hard safety defaults preserved

Still preserved in 0.9.0:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/energy protection remains enabled
- Clone Buffer protection remains enabled
- Smart Mode remains bounded/chunked
- no blind buyMax in Smart Mode
- 0.8.12 Parent Refill remains intact
- 0.8.13 Twin Prep meaningful gate remains intact
- 0.8.14 Council UI remains presentation-only

## What did not change

- No broad strategy rewrite
- No global reserve/payback loosening
- No aggressive Territory/Army flow
- No ability auto-casting
- No auto-ascend
- No Nightbug/Bat planner
- No changes to the Twin Prep meaningfulness thresholds
- No changes to Parent Step / Parent Refill scoring

## What to inspect after installation

In a post-Nexus state, check:

- `Post-Nexus energy decision`
- `Post-Nexus energy reason`
- `Post-Nexus energy amount`
- `Post-Nexus energy boost`
- `Post-Nexus energy reserve`
- `Post-Nexus energy blocked by`
- Beetle Magus Council card

For baseline regression, check:

- Parent Step to Parent Refill still shows `parentStepRefillPreserved: yes`
  when the known 0.8.13 scenario is present.
- Tiny Twin Prep chunks below near-threshold still show
  `twinUnlockPrepMeaningful: no` and `twinUnlockPrepDecision: HOLD`.
