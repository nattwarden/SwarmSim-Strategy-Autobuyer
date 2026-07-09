# 2026-07-09 Clean Start Game Observation

## Scope

This log documents a clean-start observation of Swarm Simulator from an isolated
temporary Chromium profile, plus a controlled injection of the current
SwarmBot userscript.

The observation was intentionally separate from the user's active game save.
The user's visible Chrome tab was already far into a run, so the clean-start
capture used a temporary browser profile with no prior Swarm Simulator
localStorage.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Direct clean-start observation plus upstream game data cross-reference in this file.
> Supports: Clean start has only meat, larvae, drones, and base upgrades visible; future lanes such as Energy/Nexus should not be treated as active blockers before unlock.
> Script implication: Diagnostics should distinguish locked/unavailable lanes from protected active lanes. This is observability cleanup, not permission to broaden buying.

## Captured artifacts

- Game-only clean start:
  `docs/live-logs/assets/2026-07-09-clean-start-game-only-before.png`
- Same clean start before bot injection:
  `docs/live-logs/assets/2026-07-09-clean-start-with-bot-before.png`
- Clean start after bot injection and first action:
  `docs/live-logs/assets/2026-07-09-clean-start-with-bot-after-bot.png`

## Clean Start Baseline

Observed page:

- URL: `https://www.swarmsim.com/#/`
- Title: `Swarm Simulator`
- Game version shown in UI: `Swarm Simulator v1.1.17`
- Initial visible resources after a few seconds:
  - `35 meat`
  - `14 larvae`
- Initial visible rows:
  - `Drone 0`
  - `Meat 35`
- Initial visible buttons:
  - `More...`
  - `Buy all 0 upgrades`
  - `Buy cheapest 0 upgrades`
  - `Undo`
- Initial localStorage keys:
  - `v0.2:heartbeat`

The upstream game fixture confirms the persisted initial baseline as
`invisiblehatchery = 1`, `meat = 35`, and `larva = 10`. The browser observation
showed `14 larvae` because several seconds elapsed before capture and the
invisible hatchery produces larvae at `+1/sec`.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Browser observation and upstream fixture cross-reference in this section.
> Supports: Initial resource and hidden hatchery assumptions are stable for clean-start planning.
> Script implication: Early-game planner should not assume Territory, Energy, Nexus, or abilities are already active.

## Upstream Game Code Cross-Reference

Upstream source checked from `swarmsim/swarm` at commit
`06b4f404aa324a0b454348508cfa63d5c0f1ff54`.

Relevant game data:

- `tables/src/unittype/data.ts`
  - `invisiblehatchery`: starts at `1`, is disabled/unbuyable, produces larvae.
  - `meat`: starts at `35`, is unbuyable.
  - `larva`: starts at `10`, is shown through `invisiblehatchery`.
  - `territory`: requires `queen 5`, is unbuyable.
  - `energy`: requires `nexus 1`.
  - `nexus`: requires `nexus 1`, produces energy, is unbuyable.
  - `drone`, `queen`, `swarmling`, and `stinger` define the early visible unit
    progression after the opening state.
- `tables/src/upgrade/data.ts`
  - `hatchery`: costs `300 meat` initially and adds hatchery production.
  - `expansion`: costs `10 territory` initially and multiplies hatchery
    production.
  - `cocooning`: requires `nexus 4`.
  - `larvarush`, `territoryrush`, and `clonelarvae` are later ability/upgrade
    mechanics and are not available in the clean-start opening.
- `swarmsim-coffee/app/scripts/directives/tutorial.coffee`
  - Tutorial flow introduces drones, hatchery, queens, territory, military
    units, and first expansion in that order.

## Bot Behavior At Clean Start

Script observed:

- Userscript version: `0.8.8`
- Smart preset enabled.
- Auto-buy enabled.
- Strategy Inspector enabled.
- `autoCastAbilities` default remains off.
- `autoAscend` default remains off.

After injection, the bot made one purchase:

- `Goal Step`: `+1 drone`

The resulting visible game state was:

- `36 meat`
- `26 larvae`
- `Drone 1`
- `Meat 36 +1.00/sec`

The bot then held instead of immediately spending further. The Strategy Advisor
reported:

- `HOLD Units No safe unit candidate. Focus: save-meat`
- `HOLD drone saving meat for Hatchery`
- `INFO Smart focus save-meat`
- `HOLD Energy spending saving energy for Nexus`
- `HOLD Meat spending saving meat for Hatchery`
- `INFO Larva engine Expansion 0% ... Hatchery 11% ...`

The hatchery estimate is internally consistent with the observed state:
`300 meat` target minus `36 meat` current at `+1 meat/sec` gives roughly
`264 seconds`, or about `4m 24s` to `4m 26s` depending on tick timing.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Observed bot state and ETA calculation in this section.
> Supports: Hatchery save-window math is internally consistent in the clean-start capture.
> Script implication: Keeping early Hatchery protection is justified; the premature Nexus/Energy blocker text is diagnostics noise unless later behavior proves it affects purchases.

## Findings

1. The bot successfully recognizes the clean-start page and can act from a
   fresh save.

2. The first action is conservative and narrow: buy one drone, then save meat
   toward Hatchery.

3. The early hold may be strategically conservative, but it is not yet proven
   wrong from this single capture. It should be compared against the game's
   intended early curve before changing buy behavior.

4. The Strategy Bar reports `Nexus save` and `energy plan` as blockers before
   the Energy/Nexus systems are visible in the game UI. Upstream data confirms
   energy requires `nexus 1`, so this should be treated as an observability
   issue unless later evidence shows it affects purchases.

5. The diagnostics should distinguish between:
   - locked/unavailable lanes, such as Energy before Nexus exists
   - protected active lanes, where spending is intentionally blocked

6. The clean-start game surface is much smaller than the mid/late-game save:
   only meat, larvae, drones, and base upgrades are visible. Early-game
   documentation should therefore avoid assuming territory, energy, Nexus, or
   abilities are active before their unlock points.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: Findings in this file plus `docs/SWARMSIM_GAME_MODEL.md` lane diagnostics notes.
> Supports: Locked lane vs active blocker distinction is a verified observability need.
> Script implication: Next script review should fix misleading diagnostics before changing early-game buying aggressiveness.

## Implications For Autobuyer Work

- Keep safe defaults unchanged:
  - `autoCastAbilities = false`
  - `autoAscend = false`
  - no default Clone Larvae automation
  - no default House of Mirrors automation
  - no Nightbug/Bat auto-buy by default
  - Nexus/energy protection remains enabled
- Do not broaden strategy based only on this clean-start observation.
- Prioritize diagnostics cleanup first: locked future lanes should not appear
  as active blockers in the opening state.
- Any early-game tuning should be backed by milestone captures, not only one
  screenshot after first drone purchase.

## Next Milestones To Capture

Capture these in order before changing opening strategy:

1. Before first drone purchase.
2. After first drone purchase.
3. When Hatchery first becomes buyable at `300 meat`.
4. Immediately after first Hatchery.
5. First queen unlock and purchase path.
6. Territory unlock at `5 queens`.
7. First military units: swarmling and stinger.
8. First Expansion at `10 territory`.
9. First Nexus unlock and the first point where Energy becomes visible.
10. Later ability unlocks, especially Cocooning and Clone Larvae, with defaults
    still disabled unless explicitly enabled by the user.
