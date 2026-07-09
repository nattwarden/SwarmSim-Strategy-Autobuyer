# SwarmSim Game Model

Version: 2026-07-09-canonical-0.8.8-planning
Status: Canonical strategy model for SwarmSim Strategy Autobuyer.

This is the single active game model for AI/Codex/Copilot agents. Older dated game model files were transitional snapshots and should not be used as active source material.

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

## 2. Current baseline and next work

Current verified baseline:

```text
0.8.7 — Twin Upgrade Opportunity Cost Bypass
```

0.8.7 is verified in live logs to:

- buy Twin Neural Clusters when opportunity-cost loss is negligible versus child-resource bank,
- wait for Hatchery when Hatchery is inside the save-window,
- buy Hatchery when ready,
- resume meat-chain progression after Hatchery,
- prep Hive Networks toward the next Twin Neural Clusters threshold,
- release Clone Buffer hard lock after POST_CLONE recovery is complete.

Next planned work:

```text
0.8.8 — Multi-Lane Coordinator / Territory Starvation Fix
```

Reason for 0.8.8:

- Meat-chain planning now works well enough that it can dominate every run.
- Latest live logs showed 20/20 main-buy runs on meat while Territory lane reported `OBSERVE none`.
- Ability Prep simultaneously reported `HOLD House of Mirrors — army prep missing` with top fighting units empty.
- Screenshot showed fighting units were buyable.
- This is a lane coordination/starvation problem, not a meat-chain problem.

## 3. Safety defaults

These must remain conservative unless explicitly changed by the user:

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
smartUnitBuyPercent: 0.25
meatChainReserveMultiplier: 2
meatChainMaxPaybackSeconds: 1800
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

The bot should be modeled as coordinated planner lanes, not one monolithic “best buy” rule.

Required lanes:

1. Engine / Larva lane
   - Hatchery and Expansion readiness.
   - Save-windows.
   - Clone Buffer protected larvae.
   - Whether other lanes are allowed to spend meat/larvae/territory.

2. Meat lane
   - Meat goal planner.
   - Unlock planner.
   - Parent-step conversion.
   - Twin unlock threshold prep.
   - Twin opportunity-cost bypass.
   - Meat fallback and stall diagnostics.

3. Army / Territory lane
   - Fighting-unit scanning.
   - Territory ROI toward Expansion.
   - House of Mirrors army prep, without casting House of Mirrors.
   - Anti-starvation when meat dominates every run.

4. Energy / Ability lane
   - Nexus target and energy protection.
   - Lepidoptera ROI.
   - Nightbug/Bat default HOLD unless a future mode explicitly needs them.
   - Ability Prep as advisor/observability only.
   - No default ability casts.

5. Clone lane
   - Clone cocoon prep as side-task.
   - Clone Buffer debt/protection/spendable larvae.
   - No default Clone Larvae cast.

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

## 8. Anti-starvation rule

A lane should not become permanently dead simply because another lane always has a safe action.

Track action age per lane, at minimum:

```text
runsSinceMeatAction
runsSinceTerritoryAction
runsSinceEngineAction
runsSinceCloneAction
```

If Army/Territory has safe proposals but has not been selected for many runs, the coordinator may grant it a small action if all hard blockers allow it.

Guideline:

```text
If Territory/Army has safe candidate and last territory action age >= 10–20 runs:
    allow a small safe Army/Territory action
unless Engine/Clone/Energy hard blockers say no.
```

This is not permission to be aggressive. It is permission to avoid permanent lane starvation.

## 9. Army / Territory lane requirements

The Army/Territory planner must not rely only on generic unit candidate flow winning over meat.

It should independently scan visible/buyable fighting units and produce diagnostics even when meat is selected.

It should consider a buy only when:

- Expansion is relevant,
- Hatchery and Expansion are not inside save-window,
- Clone Buffer is not hard-locking larvae,
- protected resources are respected,
- the candidate improves territory ETA enough, or army is completely empty and needs a tiny seed for House of Mirrors prep,
- the chunk is small and safe.

Suggested conservative config for future implementation:

```js
territoryPrepPlanner: true
territoryPrepChunkPercent: 5
territoryStarvationRunThreshold: 12
territoryArmySeedWhenEmpty: true
```

These defaults should be conservative. Do not buy max.

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
- Territory prep ETA before/after if available.
- Army prep missing units.
- Why Territory did not buy:
  - no visible fighting units,
  - no buyable fighting units,
  - `eachProduction().territory` missing/zero,
  - ROI below minimum,
  - protected resource,
  - Hatchery save-window,
  - Expansion save-window,
  - Clone Buffer hard lock,
  - not selected by coordinator.

Top-level Strategy Inspector reason must match the action actually selected.

If `Decision: BUY`, top-level `Reason` should not show an unrelated Ability HOLD reason.

## 11. Meat lane requirements

Keep 0.8.7 behavior intact:

- Twin threshold prep can buy safe Hive Network prep even below near-threshold ratio when threshold prep is reachable.
- Twin upgrade opportunity-cost bypass is allowed only when lost child-resource production is negligible versus current child-resource bank.
- Rebuild buffer remains enforced when opportunity cost is not negligible.
- Parent-step conversion may bypass normal payback only when it advances a target-path parent step and reserve is safe.
- Same-run lower filler guards should prevent immediate action-unit filler after target-path conversion or twin threshold prep.

Meat lane should remain powerful, but not consume all coordinator attention forever.

## 12. Energy / Nexus strategy

Nexus remains high priority until `nexusTarget` is met.

Lepidoptera strategy:

- Before Nexus 4: HOLD Lepidoptera.
- Between Nexus 4 and 5: use ROI and the 572 soft target as sanity check.
- After Nexus 5: buy only when a dedicated energy planner says ROI is useful; otherwise OBSERVE.
- Stop or downweight as bonus approaches `lepidopteraStopAtBoostPercent`.

Nightbugs:

- HOLD by default unless storage/offline mode or target cap explicitly requires them.

Bats:

- HOLD by default unless an explicit ability planner is active.

Abilities:

- Do not auto-cast by default.
- Ability Prep can PLAN/HOLD for observability.

## 13. Clone lane

Clone Larvae is a cascade amplifier, not a generic energy dump.

Default:

- `autoCastAbilities: false`.
- Clone Prep can cocoon small chunks as side-task.
- Clone Buffer protects larvae after Clone Larvae was manually used.

The Clone Buffer must use Decimal arithmetic end-to-end:

```js
const rawDebt = target.minus(cocoons);
const debt = rawDebt.greaterThan(0) ? rawDebt : newDecimal(0);
const desiredProtected = debt.times(protectRatio);
const larvaeProtected = decimalMin(larvae, desiredProtected);
const rawSpendable = larvae.minus(larvaeProtected);
const spendableLarvae = rawSpendable.greaterThan(0) ? rawSpendable : newDecimal(0);
```

## 14. Territory and Expansion strategy

Expansion is a global larvae engine upgrade and usually more valuable than normal unit growth.

Territory units should be evaluated by:

- extra territory/sec,
- ETA improvement toward next Expansion,
- meat/larvae cost,
- whether Hatchery is near,
- whether the unit also seeds House of Mirrors army value.

A territory action should be small and explainable.

## 15. Validation checklist for code changes

After any script change:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Then verify:

- Correct `@version`.
- Correct `scriptVersion` and panel title if present.
- No stale active UI version strings.
- `autoCastAbilities` remains false unless explicitly changed.
- `autoAscend` remains false unless explicitly changed.
- House of Mirrors is not cast by default.
- Clone Larvae is not cast by default.
- Nightbug/Bat auto-buy defaults are not introduced.
- Smart Mode does not use buyMax for meat-chain or army.
- Hatchery/Expansion save-window can block Army/Territory.
- Clone Buffer hard lock can block Army/Territory.
- Strategy Inspector/export includes new lane diagnostics.

## 16. Agent reading order

Agents should read:

1. `AI.md`
2. `docs/SWARMSIM_GAME_MODEL.md`
3. `src/SwarmSim-Strategy-Autobuyer.user.js`
4. Relevant prompt in `docs/prompts/`
5. Relevant release notes/live logs if needed
6. Reference files only for strategy/math sanity checks

Do not read old dated game model files as active truth.
