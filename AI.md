# AI.md - SwarmSim Strategy Autobuyer

Version: 2026-07-09-agent-guardrails
Status: Source map and repo policy for ChatGPT/Codex/Copilot/AI agents.

## Purpose

This file tells AI agents which project files to trust, in what order to read
them, and which safety rules must not be violated.

The goal is to prevent work from old uploaded scripts, stale release copies,
transitional game-model snapshots, or broad strategy rewrites when a narrow fix
was requested.

## Canonical sources

Executable Tampermonkey source:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

Active strategy model:

```text
docs/SWARMSIM_GAME_MODEL.md
```

Repo/process guard:

```text
AGENTS.md
```

Release history belongs in Git commits, tags, `docs/HISTORY.md`, and
`docs/release-notes/`.

## Required reading order

Before code changes, read:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `src/SwarmSim-Strategy-Autobuyer.user.js`
5. Relevant prompt in `docs/prompts/`
6. Relevant release notes or live logs if needed
7. `reference/` only for strategy/math sanity checks

Do not use old dated game-model files as active truth.

## Current state

Current script version in `src/`:

```text
0.8.8
```

Last live-verified baseline documented in release notes:

```text
0.8.7 - Twin Upgrade Opportunity Cost Bypass
```

Current 0.8.8 focus:

```text
Multi-Lane Coordinator / Territory Starvation Fix
```

Reason:

- Meat-chain planning can dominate every run.
- Territory/Army can remain stuck at OBSERVE while buyable fighting units exist.
- Ability Prep can report House of Mirrors army prep missing, but no safe army
  seed action is selected.
- This is a lane coordination/starvation problem, not a broad meat-chain rewrite.

## Repository policy

From 0.8.0 onward:

- GitHub is source of truth for code, docs, prompts, live logs, and release
  history.
- The only executable script is `src/SwarmSim-Strategy-Autobuyer.user.js`.
- Do not create `.txt` script mirrors.
- Do not create duplicated release `.user.js` files.
- Do not create byte-identical script copies outside `src/`.
- Do not build from old uploaded script files.
- Do not recreate `releases/` as executable source or as duplicate release-note
  storage.
- Do not change `AGENTS.md` unless the repo/process policy itself changes.

## Safety defaults

These must not change unless explicitly requested:

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

- Build against `src/SwarmSim-Strategy-Autobuyer.user.js` only.
- Keep strategy and implementation separate: code shows actual behavior; the game
  model shows desired behavior.
- Preserve conservative defaults.
- Prefer narrow hotfixes over broad strategy rewrites.
- Risky planners should start as advisor/observability or be tightly
  config-gated.
- Smart Mode should use safe chunks, not buyMax.
- Every changed behavior needs Strategy Inspector/export observability.
- Do not mix repo hygiene changes with gameplay strategy changes unless the user
  explicitly asks for both.

## Validation

Always run:

```bash
node scripts/validate-repo-guardrails.js
```

This includes:

- `node --check src/SwarmSim-Strategy-Autobuyer.user.js`
- safe-default checks
- duplicate script artifact checks

If the validation script cannot run, at minimum run:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

and manually verify the safety defaults above.
