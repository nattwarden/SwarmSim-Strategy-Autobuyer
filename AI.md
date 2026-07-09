# AI.md - SwarmSim Strategy Autobuyer

Version: 2026-07-09-methodical-optimizer-posture
Status: Source map, optimization posture, and repo policy for ChatGPT/Codex/Copilot/AI agents.

## Purpose

This file tells AI agents which project files to trust, in what order to read
them, which safety rules must not be violated, and how to reason about the
project's intended behavior.

The goal is to prevent work from old uploaded scripts, stale release copies,
transitional game-model snapshots, or broad strategy rewrites when a narrow fix
was requested.

## Optimization posture

SwarmSim Strategy Autobuyer is not conservative by identity. It is a methodical,
evidence-based optimizer/advisor.

Default automation avoids irreversible or high-risk actions, but ordinary
progression should be optimized logically within the selected user mode. Do not
confuse hard safety defaults with passivity.

Use this framing:

- Advisor Mode: explains opportunities, risks, and timing so the user can play
  more manually.
- Methodical Optimizer: default Smart behavior; goal-driven, rebuild/payback
  aware, and willing to buy when the evidence says the action is correct.
- High-Tempo Optimizer: future explicit user-selected mode; may push progression
  harder, while still preserving observability and hard safety defaults unless
  the user explicitly changes those defaults.

If a future prompt says the bot should be more forceful, interpret that as
"optimize harder inside the chosen risk mode", not as permission to auto-cast
abilities, auto-ascend, buyMax blindly, or ignore confirmed blockers.

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
0.8.9
```

Last live-verified baseline documented in release notes:

```text
0.8.7 - Twin Upgrade Opportunity Cost Bypass
```

Current 0.8.9 focus:

```text
Methodical Lane Follow-through / Visible Progress Fix
```

Reason:

- Keep the multi-lane coordinator narrow, but make follow-through more visible in
  live runs.
- Territory/Army should produce a bounded main or side action when ROI or army
  seed logic says the move is correct.
- Energy/Nexus diagnostics should stay protected without surfacing false active
  blockers before unlock.
- Top-level inspector reason should match the action that actually ran.

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

## Hard safety defaults

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

These are hard safety boundaries, not a directive to under-optimize reversible
normal purchases. If the math says a normal action is correct and all hard
blockers pass, the bot should be allowed to act within the selected mode.

## Work rules for AI agents

- Build against `src/SwarmSim-Strategy-Autobuyer.user.js` only.
- Keep strategy and implementation separate: code shows actual behavior; the game
  model shows desired behavior.
- Preserve hard safety defaults and selected-mode semantics.
- Prefer narrow fixes over broad rewrites.
- Keep commits small and scoped to one completed sub-task.
- Push after each completed sub-task to avoid mixing unrelated changes.
- Risky planners should start as advisor/observability or be tightly
  config-gated.
- Smart Mode should use scored chunks, not buyMax by default.
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
npm run sync:from-canonical
npm run hotfix:canonical
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

Current Phase 4 practical assembly source for full runtime:

```text
dev-src/runtime-sections/runtime-main.js
```

Canonical userscript remains executable source of truth in `src/`, but runtime
content is now produced through the configured build pipeline.

To avoid blocking app development during urgent fixes, direct edits in
`src/SwarmSim-Strategy-Autobuyer.user.js` are allowed when necessary if they are
immediately followed by `npm run hotfix:canonical`.

This includes:

- `node --check src/SwarmSim-Strategy-Autobuyer.user.js`
- safe-default checks
- duplicate script artifact checks

If the validation script cannot run, at minimum run:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

and manually verify the safety defaults above.
