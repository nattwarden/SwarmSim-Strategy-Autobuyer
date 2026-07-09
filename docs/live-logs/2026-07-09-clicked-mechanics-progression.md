# 2026-07-09 Clicked Mechanics Progression

## Scope

This log documents actual clicked gameplay in an isolated clean Swarm Simulator
profile. The goal was to understand the game structure, not to tune the bot yet.

The run used the live game UI and, for later milestones, the game's own exposed
model to slow down or accelerate the isolated instance. The user's real save was
not used.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Direct clicked gameplay in this file.
> Supports: This file is empirical evidence for sacrifice/rebuild, Faster/Twin differences, Hatchery/Expansion coupling, and early Territory mechanics.
> Script implication: Use this file to validate mechanics before changing strategy logic.

## UI Structure Observed

- The top bar shows global resources and global upgrade actions.
- Unit rows link to unit detail pages.
- Unit detail pages contain:
  - a quantity input
  - dynamic buy buttons such as `Hatch 1`, `Hatch 3`, `Hatch 90`
  - unit-specific upgrades once unlocked
- Cost rows can include links to missing requirements. Example:
  - Queen page showed `100 drones`
  - clicking it navigated to `#/tab/meat/unit/drone?num=@100`
  - the Drone page then used `@100` as a target and offered a matching hatch
    action toward that requirement
- Buy button labels are not stable commands. They change continuously with
  resource state, for example `Hatch 5` becoming `Hatch 17` or `Hatch 28`.

## Opening Purchases

Observed from clean start:

- Start: `35 meat`, larvae ticking upward from the hidden hatchery.
- Drone page:
  - Drone cost: `10 meat + 1 larva`
  - each Drone produces `1 meat/sec`
- Clicking `Hatch 3`:
  - produced `3 drones`
  - reduced meat from `35` to roughly `9`
  - changed production to `3 meat/sec`
- At `300+ meat`, the top bar showed `Buy all 1 upgrade`.
- Clicking that bought the first Hatchery:
  - Hatchery cost: `300 meat`
  - Hatchery count became `1`
  - larvae production increased through the hidden hatchery engine

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: This section plus `docs/live-logs/2026-07-09-clean-start-game-observation.md`.
> Supports: Hatchery is an early engine priority.
> Script implication: Keep Hatchery save-window protection.

## Queen Unlock And Cost

Queen became visible at exactly `10 drones`.

Queen page showed:

- Queen cost: `810 meat + 100 drones + 1 larva`
- each Queen produces `2 drones/sec`

This is the first strong example of the game's sacrifice loop:

- build Drones for meat income
- sacrifice a large Drone bank into Queen
- short term: lose Drones and meat production
- long term: gain passive Drone production

After buying the first Queen:

- Queen count became `1`
- Drone bank dropped sharply because `100 drones` were consumed
- Queen generated `2 drones/sec`
- Meat/sec recovered as the new Drones accumulated

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed Queen cost and post-buy recovery in this section.
> Supports: SwarmSim is a sacrifice/rebuild game, not a simple highest-cost purchase game.
> Script implication: Preserve reserve, rebuild, target-aware planning, and payback logic.

## Drone Upgrades

At high enough Drone count, the Drone page showed two upgrades:

### Faster Drones

Observed before buying:

- Drones: about `20.8K`
- Meat velocity: about `20.8K/sec`
- `Faster Drones (0)`
- Next upgrade cost: `66 drones`

After clicking `Faster Drones`:

- Drones dropped by about `66`
- `Faster Drones` count became `1`
- each Drone production changed from `1 meat/sec` to `2 meat/sec`
- Meat velocity jumped from about `20.8K/sec` to about `41.5K/sec`

Finding:

`Faster X` upgrades are structurally strong because they multiply an active
producer. They still consume a bank of the same unit, so a bot should respect
rebuild/payback, but the mechanical direction is clearly favorable.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed before/after production in this section.
> Supports: Faster upgrades are producer multipliers.
> Script implication: Score Faster upgrades with rebuild/payback rather than treating all unit-consuming upgrades as bad.

### Twin Drones

Observed before buying:

- `Twin Drones (0)`
- cost: `1 queen`
- description: multiple Drones hatch from each larva
- game text explicitly says this does not affect Queen production

After clicking `Twin Drones`:

- Queen count dropped from `1` to `0`
- `Twin Drones` count became `1`
- Drone passive production from Queens stopped
- Drone hatch button changed from `Hatch 1` to `Hatch 2`
- hatching Drones from larvae became `x2`

Finding:

`Twin X` is not the same class of upgrade as `Faster X`.

It improves manual larvae-to-unit conversion, but it does not improve parent
production of that unit. It is valuable when larvae conversion into that unit is
the bottleneck, especially while rebuilding toward a higher unit requirement.
It becomes less important when the parent unit already produces far more of the
lower unit than the run can usefully buy.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed game text and post-buy production change in this section.
> Supports: Twin upgrades are hatch-conversion tools, not passive production multipliers.
> Script implication: Twin upgrades need recovery or opportunity-cost checks and should not be bought merely because they are buyable.

## Territory Unlock

After rebuilding Drones with `Twin Drones`, the Queen page allowed a large Queen
purchase. Buying a Queen batch unlocked Territory.

Observed after the batch:

- Queen count: `207`
- Drone count: about `690`
- Territory became visible at `0 territory`
- Swarm Simulator tutorial changed to military/territory guidance:
  - build military units
  - swarmlings and stingers were now visible
- Queen page gained `Faster Queens`
  - cost: `66 queens`
  - effect: Queens produce more Drones

## Territory And Expansion

The Territory tab became visible after the Queen threshold.

Initial Territory tab rows:

- `Arachnomorph 0`
- `Stinger 0`
- `Swarmling 0`
- `Territory 0`

Observed military units:

- Swarmling:
  - cost: `750 meat + 1 larva`
  - production: `0.07 territory/sec`
  - had `Twin Swarmlings`
- Stinger:
  - cost: about `337K meat + 1 larva`
  - production: `3 territory/sec`
  - had `Twin Stingers`

Buying `338 stingers` consumed almost the entire meat bank but changed
Territory production from `0/sec` to about `1,064/sec`.

This immediately made Expansion buyable.

Expansion lives on the Larva unit page:

```text
#/tab/larva/unit/larva
```

Observed before first Expansion:

- Hatchery count: `1`
- Expansion count: `0`
- Larva velocity: `2/sec`
- Expansion cost: `10 territory`

After buying first Expansion:

- Expansion count: `1`
- Larva velocity changed from `2/sec` to `2.2/sec`
- Expansion bonus became `x1.1`
- next Expansion cost became `24 territory`

Finding:

Territory is not a side objective by itself. Its early purpose is to buy
Expansion, which multiplies the larva engine. This means a safe Army/Territory
action can be an Engine action indirectly when Expansion is close or buyable.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed fighting-unit territory production and first Expansion before/after larva velocity in this section.
> Supports: Hatchery and Expansion are coupled larva-engine mechanics; Territory can indirectly advance the Engine lane.
> Script implication: Territory/Army candidates should be evaluated by effect on Expansion and later prep, not only raw territory/sec.

## Follow-Up Tests

### Faster Queens

Observed before buying:

- Queens: `207`
- each Queen produced `2 drones/sec`
- total Drone production from Queens: `414 drones/sec`
- `Faster Queens (0)` cost: `66 queens`

After buying:

- Queens dropped from `207` to `141`
- `Faster Queens` count became `1`
- each Queen produced `4 drones/sec`
- total Drone production became `564 drones/sec`

Finding:

`Faster Queens` confirmed the same pattern as `Faster Drones`: it sacrifices
some of the producer bank but directly multiplies the remaining producers. Even
after losing `66 queens`, total Drone production increased.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed before/after total Drone production in this section.
> Supports: Faster upgrades can improve total production even after sacrificing part of the producer bank.
> Script implication: Faster upgrades should be scored with rebuild/payback, not dismissed just because they consume units.

### Twin Drones Diminishing Value

Observed before buying the second `Twin Drones`:

- `Twin Drones`: `1`
- Drone hatch multiplier: `x2`
- Larva velocity: `2.2 larvae/sec`
- manual Drone rate if every larva is spent: about `4.4 drones/sec`
- passive Drone production from Queens: `564 drones/sec`
- Queens: `141`

After buying the second `Twin Drones`:

- `Twin Drones`: `2`
- Drone hatch multiplier: `x4`
- manual Drone rate if every larva is spent: about `8.8 drones/sec`
- Queens dropped from `141` to `131`
- passive Drone production dropped from `564 drones/sec` to `524 drones/sec`

Finding:

This was a bad trade in this state. The upgrade gained roughly `+4.4` possible
manual Drones/sec from larvae conversion but lost `-40` passive Drones/sec from
the sacrificed Queens.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed before/after hatch multiplier and passive Queen production in this section; `docs/release-notes/SwarmSim-Strategy-Autobuyer-0.8.7-release-notes.md` formalizes a conservative opportunity-cost comparison.
> Supports: Twin upgrades need state-sensitive opportunity-cost checks.
> Script implication: 0.8.7-style lost-production-per-hour vs bank ratio is justified. Do not replace it with simple buyable-state logic.
