# AI.md — SwarmSim Strategy Autobuyer

Version: 2026-07-09-canonical-0.8.8-planning
Status: Project source map for ChatGPT/Codex/Copilot/AI agents.

## Purpose

This file tells AI agents which project files to trust, in what order to read them, and which rules must not be violated.

The goal is to avoid building from old uploaded scripts, stale release copies, or transitional game-model snapshots.

## Primary reading order

1. `AI.md`
2. `docs/SWARMSIM_GAME_MODEL.md`
3. `src/SwarmSim-Strategy-Autobuyer.user.js`
4. Relevant prompt in `docs/prompts/`
5. Relevant release notes or live logs if needed
6. Reference files only for strategy/math sanity checks:
   - `reference/REFERENCE_SwarmSim_ichbinsisyphos_2015.txt`
   - `reference/REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt`
   - `reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt`

## Source-of-truth hierarchy

### 1. Actual implementation

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

This is the current Tampermonkey source and the only executable script source.

### 2. Strategic truth

```text
docs/SWARMSIM_GAME_MODEL.md
```

This is the single active game model. Older dated game model files were transitional snapshots and must not be used as active truth.

### 3. Prompts and release notes

```text
docs/prompts/
docs/release-notes/
docs/live-logs/
releases/
```

Release folders are documentation-only. Do not create script copies in `releases/`.

## Repository policy

From 0.8.0 onward:

- GitHub is source of truth for code, docs, prompts, live logs, and release history.
- The only executable script is `src/SwarmSim-Strategy-Autobuyer.user.js`.
- Do not create `.txt` script mirrors.
- Do not create duplicated release `.user.js` files.
- Do not build from old uploaded script files.
- Do not change `AGENTS.md` unless explicitly needed.

## Current baseline

Current verified main baseline:

```text
0.8.7 — Twin Upgrade Opportunity Cost Bypass
```

0.8.7 has been live-verified for:

- Twin Neural Clusters opportunity-cost bypass.
- Hatchery save-window and Hatchery purchase.
- Meat-chain progression resuming after Hatchery.
- Twin threshold prep toward 10K Hive Networks.
- Parent-step conversion toward Lesser Hive Mind.
- Clone Buffer hard lock release after recovery.

## Next planned work

```text
0.8.8 — Multi-Lane Coordinator / Territory Starvation Fix
```

Prompt:

```text
docs/prompts/next-0.8.8-multi-lane-coordinator-territory-starvation.md
```

Reason:

- Meat-chain planning now works well enough that it can dominate every run.
- Latest live logs showed 20/20 main-buy runs on meat while Territory lane reported `OBSERVE none`.
- Ability Prep simultaneously reported `HOLD House of Mirrors — army prep missing` with top fighting units empty.
- Screenshot showed fighting units were buyable.
- This is a lane coordination/starvation problem, not a meat-chain problem.

## Implemented capabilities through 0.8.7

- Smart Mode.
- Advisor log.
- Purchase log.
- Strategy Bar.
- Strategy Inspector and export.
- Larva Engine Priority.
- Production Upgrade priority.
- Energy Strategy and Nexus target.
- Lepidoptera ROI guard.
- Nightbug/Bat HOLD advisor in default Smart Mode.
- Clone Larvae cocoon prep, side-task only.
- Territory ROI with minimum-improvement guard.
- Meat Goal Planner with lookahead.
- Meat-chain reserve/payback guard.
- Twin Prep with recovery buffer.
- Meat fallback queue.
- Stall breaker diagnostics.
- Active meat-action fallback floor.
- Active action payback bypass.
- Target-aware upgrade/twin support planner.
- Unlock planner.
- Clone Buffer Planner.
- Ability Prep Planner, advisor-only.
- Parent-step conversion.
- Twin unlock threshold planner.
- Twin unlock cost resource detection.
- Twin upgrade opportunity-cost bypass.

## Safety defaults

These must not be changed without explicit instruction:

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
cloneBufferPlanner: true
cloneBufferProtectLarvae: true
```

Do not introduce as default automation:

- Nightbug auto-buy.
- Bat auto-buy.
- Ability auto-cast.
- Clone Larvae auto-cast.
- House of Mirrors auto-cast.
- Auto-ascend.
- Aggressive buyMax in Smart Mode.
- Blind highest-unit buying.

## Work rules for AI agents

- Read AI.md, canonical game model, and current source first.
- Build against `src/SwarmSim-Strategy-Autobuyer.user.js` only.
- Keep strategy and implementation separate: GitHub source shows actual behavior; game model shows desired behavior.
- Preserve conservative defaults.
- Prefer narrow hotfixes over broad strategy rewrites.
- Risky planners should start as advisor/observability or be tightly config-gated.
- Smart Mode should use safe chunks, not buyMax.
- Every changed behavior needs Inspector/export observability.

## Validation after script changes

Run:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Also verify:

- correct `@version`,
- correct `scriptVersion`/panel title if present,
- no stale active UI version strings,
- `autoCastAbilities` remains false unless explicitly changed,
- `autoAscend` remains false unless explicitly changed,
- House of Mirrors is not cast by default,
- Clone Larvae is not cast by default,
- no Nightbug/Bat auto-buy defaults,
- no buyMax for Smart Mode meat-chain or army,
- Strategy Inspector/export shows new relevant fields.
