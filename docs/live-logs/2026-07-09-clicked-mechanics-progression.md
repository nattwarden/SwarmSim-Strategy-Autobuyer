# 2026-07-09 Clicked Mechanics Progression

## Scope

This log documents actual clicked gameplay in an isolated clean Swarm Simulator
profile. The goal was to understand the game structure, not to tune the bot yet.

The run used the live game UI and, for later milestones, the game's own exposed
model to slow down or accelerate the isolated instance. The user's real save was
not used.

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
child unit than the run can usefully buy.

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

This confirms that `Twin X` should not be treated as always-good. Its value
depends on whether manual larvae conversion is still a meaningful bottleneck.

### Twin Stingers

Observed before buying:

- Stingers: `338`
- Territory production: about `1,064 territory/sec`
- `Twin Stingers (0)` cost: `100 meat + 1 larva`

After buying:

- Stingers stayed `338`
- Territory production stayed about `1,064 territory/sec`
- future Stinger hatching changed to `x2 twins`

Finding:

`Twin Stingers` confirmed the same Twin pattern outside the meat chain. It did
not improve existing Stinger production. It only improved future larva-to-unit
conversion.

### Military Chain And Arachnomorphs

Observed next military unit:

- Internal unit name: `spider`
- UI label/route slug: `arachnomorph`
- URL: `#/tab/territory/unit/arachnomorph`
- cost: about `151M meat + 1 larva`
- production: about `141 territory/sec`

Buying `4 arachnomorphs`:

- consumed about `606M meat`
- increased territory production from about `1,064/sec` to about `1,631/sec`
- left existing Stingers unchanged

Important route/model finding:

The internal model name and UI route slug can differ. The bot should not assume
the internal key is always the visible route segment.

### Twin Carry-Forward Test

`Twin Stingers` did not carry forward into Arachnomorphs.

After `Twin Stingers (1)`, the Arachnomorph page still showed:

- `Twin Arachnomorphs (0)`
- normal Arachnomorph hatching before buying its own Twin upgrade

Buying `Twin Arachnomorphs`:

- did not change existing Arachnomorph count
- did not change existing territory/sec
- changed future Arachnomorph hatching to `x2 twins`

Finding:

Military Twin upgrades are per-unit conversion upgrades. They do not upgrade the
next military unit and do not multiply existing territory/sec.

### Military Suffix / Empower Note

Player observation: later military units can appear as names like
`Arachnomorph II`.

Source cross-check:

- Upstream changelog describes empowered military units as higher-tier versions
  with suffixes, for example `Swarmling II`.
- Upstream effect code has a `suffix` effect that romanizes the tier.
- Upstream upgrade data has `swarmlingempower`, `stingerempower`,
  `spiderempower`, and similar upgrades.

Controlled isolated-model test:

- before `spiderempower`:
  - Arachnomorph suffix: empty
  - `Twin Arachnomorphs`: `1`
  - Arachnomorph twin multiplier: `x2`
  - Arachnomorph count: `4`
- after buying `spiderempower` with injected test resources:
  - Arachnomorph suffix became `II`
  - `Twin Arachnomorphs` stayed `1`
  - Arachnomorph twin multiplier stayed `x2`
  - Arachnomorph count became `0`
  - Arachnomorph territory production per unit jumped massively
  - Arachnomorph meat cost also jumped massively

Finding:

The player's correction is right: Twin upgrades on the same military unit carry
through that unit's empower/suffix tier. `Twin Arachnomorphs` remains active when
Arachnomorph becomes `Arachnomorph II`.

This is different from the normal military unit chain. `Twin Stingers` does not
carry into Arachnomorphs, but `Twin Arachnomorphs` does carry into
Arachnomorph II because it is the same internal unit (`spider`) with a suffix.

Player strategic note:

Military empower is always a tradeoff, but when a military unit has fallen to
the bottom of the useful territory/sec list, its existing count may contribute
almost nothing relative to current targets. In that state, resetting that unit
to `0` via empower can be acceptable because:

- the old tier is already low-value,
- the same unit's Twin multiplier carries forward,
- the new suffix tier has much higher territory production per unit,
- future larvae spent on that unit buy into the stronger tier.

This is different from blindly buying every Twin. For military empower, the key
question is whether the old tier's current territory/sec is still meaningful
relative to the new tier and current Expansion/House of Mirrors goals.

### House Of Mirrors Source Note

Open hypothesis from player observation:

Military Twin upgrades may still be worth buying even when direct territory/sec
impact is zero, because cheap lower-tier military units can matter later if
upgrades carry forward into stronger military chains or if House of Mirrors
copies/scales army state. This has not been proven in the clicked clean-start
run yet.

Source cross-check:

- Upstream `clonearmy` is labeled `house of mirrors`.
- It requires `nexus = 5`.
- It costs `2500 energy`.
- Its effect is `compoundUnit x2` across military units including swarmling,
  stinger, arachnomorph, culicimorph, locust, roach, giant arachnomorph,
  chilopodomorph, wasp, devourer, and goon.

This confirms that House of Mirrors doubles army units that already exist. It
does not prove that buying every cheap military unit is good. The value depends
on the territory/sec or later-tier value of the army being doubled and on energy
opportunity cost.

Controlled isolated-model test:

Test setup:

- added `5 nexus`
- added enough Energy for the ability
- added selected army counts:
  - `10 swarmlings`
  - `20` extra stingers on top of the existing stinger bank
  - `3 arachnomorphs`
  - `1 locust`
  - left several other army units at `0`

Before casting:

- House of Mirrors was visible and buyable.
- Energy was capped at `50,000` in this test state.
- Existing army examples:
  - Swarmling: `10`
  - Stinger: `358`
  - Arachnomorph: `3`
  - Locust: `1`
  - Mosquito/Roach/etc: `0`

After casting House of Mirrors:

- Energy dropped from `50,000` to `47,500`.
- House of Mirrors count became `1`.
- Existing army doubled:
  - Swarmling: `10 -> 20`
  - Stinger: `358 -> 716`
  - Arachnomorph: `3 -> 6`
  - Locust: `1 -> 2`
- Zero-count army stayed zero:
  - Mosquito: `0 -> 0`
  - Roach: `0 -> 0`
  - other missing tiers stayed `0`
- Territory velocity doubled with the army value.

Finding:

House of Mirrors is pure multiplication of existing army state. It does not seed
missing army units. This makes pre-Mirror army composition important, but only
for units that have meaningful count or production value before the cast.

Script implication:

The bot should not auto-cast House of Mirrors by default. Advisor logic can,
however, report whether the current army state has useful Mirror value and which
important army tiers are still zero.

Do not encode this as strategy until tested against:

- the military unit upgrade chain,
- how empower/suffix tiers change the value of already-owned Twin upgrades,
- House of Mirrors behavior,
- energy cost/opportunity cost,
- whether cheap lower-tier army buys improve a concrete Expansion or ability
  prep target.

### Hatchery Versus Expansion

Observed before buying the next engine upgrades:

- Hatchery count: `1`
- Expansion count: `1`
- Larva velocity: `2.2 larvae/sec`
- next Hatchery cost: `3,000 meat`
- next Expansion cost: `24 territory`

After buying Hatchery:

- Hatchery count: `2`
- Expansion count: `1`
- Larva velocity: `3.3 larvae/sec`

After buying Expansion:

- Hatchery count: `2`
- Expansion count: `2`
- Larva velocity: `3.63 larvae/sec`
- Expansion bonus shown as `x1.21`

Finding:

Hatchery adds base larva production. Expansion multiplies the current hatchery
base. Their value is coupled:

- Hatchery makes future Expansion levels stronger.
- Expansion makes all existing Hatchery levels stronger.
- They spend different resources, so blocking one lane can unintentionally
  slow the other.

## Mechanical Rules Learned

1. The game repeatedly asks the player to sacrifice an existing productive bank
   to unlock a stronger production layer.

2. The correct question is not only whether a purchase is affordable. It is:
   - what bank is sacrificed?
   - what production is lost?
   - what production or conversion improves?
   - how quickly does the sacrificed layer recover?
   - does the purchase advance the current unlock path?

3. `Faster X` and `Twin X` must be modeled differently.

4. `Faster X` generally improves a producer directly and is usually favorable
   when the sacrifice is recoverable.

5. `Twin X` improves manual purchase conversion, not passive parent production.
   It can be critical early on a path and later become low-value or irrelevant.

6. Top-bar upgrade availability matters. A bot that only scans the open unit's
   hatch buttons can miss high-impact upgrades.

7. Dynamic button labels are a weak automation target. The game model and
   target URLs such as `?num=@100` are better signals than literal button text.

8. Territory purchases should be evaluated by their effect on Expansion timing,
   not only by whether they increase territory/sec.

9. A `Twin X` upgrade can be actively bad when it sacrifices parent production
   that is already much larger than the manual larva conversion it improves.

10. Hatchery and Expansion form a coupled engine pair: base production plus
    multiplier. Strategy should reason about their combined marginal effect.

11. Military Twin upgrades are per-unit hatch conversion. They do not carry
    forward into a different military unit in the normal chain, such as Stinger
    to Arachnomorph. They do carry through empower/suffix tiers of the same
    internal unit, such as Arachnomorph to Arachnomorph II.

12. House of Mirrors doubles all existing army units, so zero-count army tiers
    stay zero. Army seeding may matter later, but only if the seeded units have
    meaningful value relative to energy opportunity cost.

13. Military empower can be correct even though it resets the unit count, when
    the old suffix tier's territory/sec is negligible and the preserved Twin
    multiplier makes rebuilding the stronger tier efficient.

14. House of Mirrors is a multiplier on current army composition. It rewards
    having useful nonzero army tiers before the cast, but it does not create
    missing tiers.

## Implications For Autobuyer

- Add a distinct upgrade-priority concept instead of treating every upgrade as
  generic.
- Treat `Faster` upgrades as producer multipliers with payback/rebuild checks.
- Treat `Twin` upgrades as conversion/rebuild tools, not permanent production
  multipliers.
- Parent production must be part of Twin value:
  - if the parent already overproduces the child unit, Twin value drops
  - if the child unit is needed for a near unlock, Twin value rises
- Upgrade actions should be considered alongside unit actions in the lane
  coordinator.
- Territory lane should report whether a military purchase advances Expansion
  and whether Expansion is already buyable.
- Twin upgrade planner should compare:
  - added manual conversion rate from the new twin multiplier
  - lost parent production from the sacrificed parent units
  - whether the child unit is needed for a near unlock
- Engine planner should evaluate Hatchery and Expansion together instead of as
  unrelated upgrades.
- Army planner should distinguish:
  - normal military unit unlocks, such as Stinger to Arachnomorph
  - per-unit Twin conversion upgrades
  - later empower/suffix tiers such as `Arachnomorph II`, which preserve that
    same unit's Twin multiplier while resetting/upshifting the unit tier
  - House of Mirrors prep, which doubles existing army counts but is locked
    behind Nexus 5 and energy
- Military empower planner should compare old-tier territory/sec lost against
  the stronger suffix tier's rebuild speed and value toward Expansion or House
  of Mirrors prep.
- Diagnostics should say whether an upgrade was skipped because:
  - cost bank is protected
  - payback/rebuild is poor
  - parent production already dominates
  - a nearer unlock/save-window has priority
