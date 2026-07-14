# SwarmSim Game Model

Version: 2026-07-10-current
Status: Active strategy contract for SwarmSim Strategy Autobuyer.

This is the single active game model for AI/Codex/Copilot agents. Older dated
game model files were transitional snapshots and must not be used as active
source material.

This file defines:
- what the bot is supposed to do and why
- hard safety defaults that must not change without explicit user request
- game principles every planner must respect
- the lane architecture the bot is built around

The durable product vision and the six cross-system strategic questions live
in `BOOK-00-vision-goals-and-dreams.md`. This game model remains the active
contract for current rules, planner behavior, and safety defaults.

## 0. Optimization posture

The bot is not conservative by identity. It is a methodical optimizer and advisor.

Default automation avoids irreversible or high-risk actions, but ordinary
progression should be optimized logically within the selected user mode. Hard
safety defaults are guardrails; they are not an instruction to under-buy when a
normal reversible action is well-scored and unblocked.

The bot has two modes:

1. **Self-playing Piano**
   - The bot plays the game autonomously.
   - It buys, plans, and progresses without the user needing to intervene.
   - Hard safety defaults still apply — no ability auto-casts, no auto-ascend,
     no blind buyMax unless explicitly enabled.
   - All decisions are observable and explainable.

2. **Player Companion**
   - The bot acts as an advisor for players who want to play manually.
   - It explains opportunities, risks, and timing.
   - It does not buy unless the player explicitly enables auto-buy.
   - It highlights what the best next step is and why.

When this document says "safe", read it as "passes the explicit hard blockers
and selected-mode risk rules", not as "passive".

## 1. Source-of-truth policy

GitHub is source of truth for code, docs, prompts, release notes, and live logs.

Canonical executable script source:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

Rules:

- Do not create `.txt` script mirrors.
- Do not create release `.user.js` copies.
- Do not build from old uploaded script files.
- Release folders are documentation-only.
- Current code in `src/` shows what is actually implemented.
- This document describes desired strategy and planner behavior.

## 2. Current verified runtime

Current verified runtime: `0.12.3`

Verdict: `0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED`

For what has been built and what comes next, see:

- `docs/process/HISTORY.md` — version history
- `docs/strategy/STRATEGY_INTELLIGENCE_ROADMAP.md` — current phase and next work
- `docs/BOOK-03-verification-history-and-artifacts.md` — acceptance evidence map

## 3. Hard safety defaults

These must remain unchanged unless explicitly changed by the user:

```js
autoCastAbilities: false
autoAscend: false
saveEnergyForNexus: true
nexusTarget: 5
energyPlanner: true
blockLepidopteraBeforeNexus: 4
fastNexus5MothSoftTarget: 572
lepidopteraStopAtBoostPercent: 90
territoryRoiMode: true
territoryMinEtaImprovementSeconds: 2
territoryMinEtaImprovementRatio: 0.001
smartUnitBuyPercent: 0.35
meatChainReserveMultiplier: 1.25
meatChainMaxPaybackSeconds: 3600
meatActionUnitPaybackBypass: true
meatActionUnitMinReserveRatio: 5
meatFallbackDoNotDropBelowActionUnit: true
meatUnlockPlanner: true
meatParentStepPlanner: true
twinUnlockPlanner: true
twinUpgradeOpportunityCostBypass: true
cloneBufferPlanner: true
cloneBufferProtectLarvae: true
```

Default automation that must not be introduced:

- Nightbug auto-buy.
- Bat auto-buy.
- Ability auto-cast.
- Clone Larvae auto-cast.
- House of Mirrors auto-cast.
- Auto-ascend.
- Aggressive buyMax in Smart Mode.
- Blind highest-unit buying.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: `reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt` now marks Clone, mutation, and ascension claims as HEURISTIC/OPEN rather than implementation-ready.
> Supports: Hard safety defaults are still the correct baseline because several late-game guide claims are not live-verified.
> Script implication: Any future automation around Clone Larvae, House of Mirrors, Bats/Nightbugs, or Ascension must be explicit and separately validated.

## 4. Game principles

SwarmSim is not a simple “buy the most expensive thing” game.

Higher units often consume lower producers. A purchase can be correct long-term and still be harmful if it empties the resource that keeps the chain alive.

Every planner should ask:

- What target is this advancing?
- What resource does this consume?
- Which producer or bank is being sacrificed?
- How quickly can it recover?
- Does it improve a concrete target, not just raw cost rank?
- Does it block Hatchery, Expansion, Nexus, Clone Buffer, or a near threshold?

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: BOOK-01 records the Queen purchase and Faster/Twin tests.
> Supports: Queen consumes Drones before rebuilding through passive Drone production; Faster upgrades sacrifice producer bank but multiply remaining production; Twin upgrades can sacrifice parent production for hatch conversion.
> Script implication: Keep reserve/rebuild/payback and target-path checks as core planner rules. Do not implement blind highest-visible-unit purchase logic.

## 5. Meat-chain names

| Internal | UI | Role |
|---|---|---|
| `drone` | Drone | early meat unit |
| `queen` | Queen | produces drones |
| `nest` | Nest | produces queens |
| `greaterqueen` | Greater Queen | produces nests |
| `hive` | Hive | produces greater queens |
| `hivequeen` | Hive Queen | produces hives |
| `empress` | Hive Empress | produces hive queens |
| `prophet` | Neuroprophet | produces hive empresses |
| `goddess` | Hive Neuron | produces neuroprophets |
| `pantheon` | Neural Cluster | produces hive neurons |
| `pantheon2` | Hive Network | produces neural clusters |
| `pantheon3` | Lesser Hive Mind | produces hive networks |
| `pantheon4` | Hive Mind | produces lesser hive minds |
| `pantheon5` | Arch-Mind | produces hive minds |

Logs should show UI name first and internal name when useful:

```text
+23 hive network (pantheon2)
```

## 6. Core planner lanes

The bot is built as coordinated planner lanes, not one monolithic "best buy" rule.

### Implemented lanes (as of 0.12.3)

1. **Engine / Larva lane**
   - Hatchery and Expansion readiness.
   - Save-windows.
   - Clone Buffer protected larvae.
   - Whether other lanes are allowed to spend meat/larvae/territory.

2. **Meat lane**
   - Meat goal planner.
   - Unlock planner.
   - Parent-step conversion.
   - Twin unlock threshold prep.
   - Twin opportunity-cost bypass.
   - Meat fallback and stall diagnostics.

3. **Army / Territory lane**
   - Fighting-unit scanning.
   - Territory ROI toward Expansion.
   - Army Seed planner.
   - House of Mirrors army prep - advisor-only, no auto-cast.
   - Anti-starvation when meat dominates every run.

4. **Energy / Ability lane**
   - Nexus target and energy protection.
   - Lepidoptera ROI.
   - Energy Support Broker (advisor/observability layer).
   - Nightbug/Bat default HOLD.
   - Ability Prep as advisor/observability only.
   - No default ability casts.

5. **Clone lane**
   - Clone cocoon prep as side-task.
   - Clone Buffer debt/protection/spendable larvae.
   - No default Clone Larvae cast.

### Advisor and observability surfaces (implemented)

- **Swarm Council** - real-time lane coordination UI showing each lane's status
- **Strategy Inspector** - export format showing full decision state
- **Laboratory** - read-only simulation for ability value comparison (gated, manually triggered)

### Lane expansion

The 5-lane model may need additional lanes as Strategy Intelligence work reveals
gaps. Any new lane proposal requires a strategy decision record in `docs/strategy/`.

## 7. Multi-Lane Coordinator

The next architecture step is a central coordinator/arbiter that receives proposals from lanes.

Each lane should produce proposal-like data:

```js
{
  lane: "Meat" | "Engine" | "Territory" | "Energy" | "Clone" | "Ability",
  decision: "BUY" | "HOLD" | "OBSERVE" | "SIDE",
  candidate,
  unit,
  amount,
  score,
  priority,
  urgency,
  reason,
  blockers,
  costs,
  protectedResourcesUsed,
  canRunAsSideAction
}
```

The coordinator should:

1. Collect lane proposals.
2. Apply hard blockers first.
3. Choose up to `smartMaxActionsPerRun` safe actions.
4. Prefer hard priorities such as buyable Hatchery/Expansion/Nexus.
5. Preserve meat-chain progression.
6. Allow safe Army/Territory progress when it is starved.
7. Keep Clone Prep as side-task only.
8. Keep Ability Prep advisor-only.
9. Log why each lane did or did not act.

### Hard blockers

Hard blockers override lane desire:

- Protected resource cost.
- Hatchery save-window.
- Expansion save-window.
- Clone Buffer hard lock or protected larvae.
- Energy protected for Nexus.
- Auto-cast disabled for abilities.
- Explicit unsafe reserve/rebuild/payback guards.

> **Verification note — 2026-07-09**
> Status: PARTIALLY CONFIRMED
> Evidence: `docs/process/HISTORY.md (0.8.8 entry)` reports meat dominance with Territory `OBSERVE none`; live mechanics confirm Territory can matter through Expansion.
> Supports: A coordinator is the right design direction, but exact scoring and action cadence still need script/live-log validation.
> Script implication: Implement coordinator changes narrowly, preserving hard blockers and hard safety defaults.

## 8. Anti-starvation rule

A lane should not become permanently dead simply because another lane always has a safe action.

Track action age per lane, at minimum:

```text
runsSinceMeatAction
runsSinceTerritoryAction
runsSinceEngineAction
runsSinceCloneAction
```

If Army/Territory has safe proposals but has not been selected for many runs, the coordinator may grant it a bounded action if all hard blockers allow it.

Guideline:

```text
If Territory/Army has safe candidate and last territory action age >= 10–20 runs:
    allow a bounded scored Army/Territory action
unless Engine/Clone/Energy hard blockers say no.
```

This is not permission to buy blindly. It is permission to avoid permanent lane starvation.

> **Verification note — 2026-07-09**
> Status: PARTIALLY CONFIRMED
> Evidence: `docs/process/HISTORY.md (0.8.8 entry)` documents a 20/20 meat-action run with Territory `OBSERVE none` while army prep was missing.
> Supports: Anti-starvation is needed as a planner coordination concept.
> Script implication: Allow bounded scored Army/Territory actions after hard blockers and diagnostics. This is not a default buyMax permission.

## 9. Army / Territory lane requirements

The Army/Territory planner must not rely only on generic unit candidate flow winning over meat.

It should independently scan visible/buyable fighting units and produce diagnostics even when meat is selected.

It should consider a buy only when:

- Expansion is relevant,
- Hatchery and Expansion are not inside save-window,
- Clone Buffer is not hard-locking larvae,
- protected resources are respected,
- the candidate improves territory ETA enough, or army is completely empty and needs a tiny seed for House of Mirrors prep,
- the chunk is bounded, scored, and observable.

Suggested methodical config for future implementation:

```js
territoryPrepPlanner: true,
territoryPrepChunkPercent: 5,
territoryStarvationRunThreshold: 12,
territoryArmySeedWhenEmpty: true,
```

These defaults should remain bounded and observable. Do not buy max by default.

### House of Mirrors interaction

House of Mirrors must remain advisor-only by default.

If Ability Prep says army prep is missing, Army/Territory may use that as a signal to seed top fighting units. It must not cast House of Mirrors.

Expected log shape:

```text
PLAN House of Mirrors — army prep missing; top fighting units Culicimorph V, Arachnomorph V, Stinger V are empty
BUY Army Prep — +small Stinger V chunk; territory ROI positive; last territory action 14 runs ago
```

or:

```text
HOLD Army Prep — Hatchery save-window active
```

> **Verification note — 2026-07-09**
> Status: PARTIALLY CONFIRMED
> Evidence: BOOK-01 and BOOK-02 record fighting-unit territory production, Expansion coupling, and the House of Mirrors boundary.
> Supports: Army/Territory lane needs independent scanning and better diagnostics.
> Script implication: A small army seed may be appropriate only when safe and clearly explained; House of Mirrors must not auto-cast.

## 10. Diagnostics requirements

Strategy Inspector/export should make lane coordination obvious.

Recommended fields for 0.8.8:

- Lane coordinator decision.
- Lane actions selected this run.
- Lane proposals summary.
- Territory starvation count.
- Last territory action age.
- Territory prep candidate.
- Territory prep decision.
- Territory prep reason.
- Territory prep amount.
- Army prep missing units.
- Why Territory did not buy:
  - no visible fighting units,
  - no buyable fighting units,
  - territory production missing/zero,
  - ROI below minimum,
  - protected resource,
  - Hatchery save-window,
  - Expansion save-window,
  - Clone Buffer hard lock,
  - not selected by coordinator.

> **Verification note — 2026-07-09**
> Status: CONFIRMED
> Evidence: BOOK-01 and BOOK-03 record the historical diagnostic limitations.
> Supports: Observability must distinguish actual BUY reasons from advisor-only HOLD reasons and distinguish locked future lanes from active blockers.
> Script implication: Any next code change should keep behavior and Strategy Inspector/export aligned.
