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

Development-only modular scaffolds:

```text
dev-src/
```

These files are non-executable and must never become a byte-identical full
script copy of `src/SwarmSim-Strategy-Autobuyer.user.js`.

## Required reading order

Before code changes, read:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `src/SwarmSim-Strategy-Autobuyer.user.js`
5. Relevant prompt in `docs/prompts/`
6. Relevant release notes or live logs if needed
7. `reference/` only for strategy/math sanity checks
8. `docs/MODULARIZATION_PLAN.md` for lane/overseer extraction work
9. Relevant `dev-src/` modules for scaffold/contract context

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

## Current live/mechanics findings

Before changing strategy logic, read the current observation logs:

```text
docs/live-logs/2026-07-09-clean-start-game-observation.md
docs/live-logs/2026-07-09-clicked-mechanics-progression.md
```

Use these as empirical context for 0.8.8 planning:

- Clean start has only meat, larvae, drones, and base upgrades visible.
- Early Energy/Nexus diagnostics can appear before Energy/Nexus is unlocked;
  treat that as observability noise unless behavior proves otherwise.
- SwarmSim is a sacrifice/rebuild game: many correct purchases temporarily
  consume productive banks.
- `Faster X` upgrades are producer multipliers and need payback/rebuild checks.
- `Twin X` upgrades are hatch-conversion tools, not passive production
  multipliers.
- Military Twin upgrades do not carry into a different military unit, but they
  do carry through empower/suffix tiers of the same unit, such as
  Arachnomorph to Arachnomorph II.
- Hatchery and Expansion are a coupled larva-engine pair.
- Territory actions should be evaluated by their effect on Expansion and later
  army/House of Mirrors prep, not only raw territory/sec.
- House of Mirrors doubles existing army counts at Nexus 5; zero-count army
  tiers remain zero, so advisor logic should report missing meaningful army
  tiers without enabling default auto-cast.

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

For modularization:

- Keep runtime behavior in the canonical userscript unless migration scope is explicit.
- Extract one lane at a time and keep observability parity in Strategy Inspector/export.
- Use `dev-src/contracts/lane-proposal.js` proposal shape for lane module boundaries.

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
- Keep commits small and scoped to one completed sub-task.
- Push after each completed sub-task to avoid mixing unrelated changes.
- Risky planners should start as advisor/observability or be tightly
  config-gated.
- Smart Mode should use safe chunks, not buyMax.
- Every changed behavior needs Strategy Inspector/export observability.
- Do not mix repo hygiene changes with gameplay strategy changes unless the user
  explicitly asks for both.
- `dev-src/` is allowed for modular scaffolds, but `src/SwarmSim-Strategy-Autobuyer.user.js`
  remains the executable source of truth until explicitly migrated.
- For territory/army lane runtime work, use the extracted adapter boundary
  `executeTerritoryGuardAction(...)` in the canonical userscript and keep
  behavior parity unless explicitly changing strategy.
- For territory/army lane proposal work, use
  `buildTerritoryGuardProposal(...)` as the adapter boundary and keep
  behavior parity unless explicitly changing strategy.
- For meat lane execution work, use `executeMeatGuardAction(...)` as the
  adapter boundary and keep behavior parity unless explicitly changing strategy.
- For engine lane execution work, use `executeEngineGuardAction(...)` as the
  adapter boundary and keep behavior parity unless explicitly changing strategy.
- For energy lane execution work, use `executeEnergyGuardAction(...)` as the
  adapter boundary and keep behavior parity unless explicitly changing strategy.
- For clone lane execution work, use `executeCloneGuardAction(...)` as the
  adapter boundary and keep behavior parity unless explicitly changing strategy.

## Validation

Always run:

```bash
node scripts/validate-repo-guardrails.js
```

Build/check commands (Phase 4 bootstrap):

```bash
npm run build:check
npm run build
npm run verify
```

Build assembly config:

```text
scripts/canonical-build.config.json
```

Build engine supports configured parts across sources (`metadata`, `runtime`,
and `file`) to enable gradual lane extraction without changing the canonical
runtime contract.

Runtime adapter extraction in practice uses build marker sections in
`src/SwarmSim-Strategy-Autobuyer.user.js` and syncs from
`dev-src/runtime-sections/` via `scripts/canonical-build.config.json`.

This includes:

- `node --check src/SwarmSim-Strategy-Autobuyer.user.js`
- safe-default checks
- duplicate script artifact checks

If the validation script cannot run, at minimum run:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

and manually verify the safety defaults above.
