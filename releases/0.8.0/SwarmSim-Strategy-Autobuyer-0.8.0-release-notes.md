# SwarmSim Strategy Autobuyer 0.8.0 — release notes

Date: 2026-07-09

## Purpose

0.8.0 is a conservative planner release focused on three narrow gaps from 0.7.9:

- Unlock Planner
- Clone Buffer Planner
- Ability Prep Planner

This is not an aggressive autobuyer release.

## What changed from 0.7.9

### 1. Unlock Planner

0.8.0 adds a target-aware unlock step evaluator before normal meat action buying.

It can treat a parent step on the active target path as an unlock candidate when:

- the candidate is on the current target path,
- unlock value is concrete (for example relevant twin unlock progression),
- reserve after buy is safe,
- protected resources are still respected,
- the buy is exact chunked buyUnit amount (never buyMaxUnit).

Payback can be bypassed only for clear unlock value and safe reserve according to:

- `meatUnlockPaybackBypass`
- `meatUnlockMinReserveRatio`

New config:

```js
meatUnlockPlanner: true
meatUnlockPaybackBypass: true
meatUnlockMinReserveRatio: 3
meatUnlockMaxChunkPercent: 25
```

New inspector/export fields:

- `unlockPlannerCandidate`
- `unlockPlannerDecision`
- `unlockPlannerReason`
- `unlockPlannerTarget`
- `unlockPlannerUnlocks`
- `unlockPlannerCostResource`
- `unlockPlannerReserveRatio`
- `unlockPlannerPaybackBypassed`

### 2. Clone Buffer Planner

0.8.0 adds a dedicated clone-buffer state machine with three modes:

- `BUILDUP`
- `POST_CLONE_LOCK`
- `MATURE`

Behavior summary:

- BUILDUP uses partial larvae protection and allows progression.
- POST_CLONE_LOCK protects cloned larvae and prioritizes cocoon recovery before normal larva spending.
- MATURE calculates spendable larvae after debt to clone buffer.

The planner never auto-casts Clone Larvae by default. It protects, prepares and logs.

New config:

```js
cloneBufferPlanner: true
cloneBufferMode: "auto"
cloneBufferEarlyProtectRatio: 0.5
cloneBufferMatureProtectRatio: 1.0
cloneBufferPostCloneProtectRatio: 1.0
cloneBufferMinLarvaProductionForHardLock: 0
cloneBufferProtectLarvae: true
```

New inspector/export fields:

- `cloneBufferMode`
- `cloneBufferTarget`
- `cloneBufferCurrent`
- `cloneBufferPercent`
- `cloneBufferDebt`
- `cloneBufferSpendableLarvae`
- `cloneBufferLarvaeProtected`
- `cloneBufferReason`

### 3. Ability Prep Planner (advisor-only)

0.8.0 adds an advisor-only prep evaluator for:

- Clone Larvae
- House of Mirrors

Default output remains PLAN/HOLD, not CAST.

House of Mirrors checks army prep readiness and reports missing top fighting tiers before recommending plan state.

New inspector/export fields:

- `abilityPrepCandidate`
- `abilityPrepDecision`
- `abilityPrepReason`
- `abilityPrepType`
- `abilityPrepEnergyAvailable`
- `abilityPrepRequiresArmyPrep`
- `abilityPrepRequiresCloneBuffer`
- `houseOfMirrorsArmyValue`
- `houseOfMirrorsMissingUnits`

## Safety preserved

Preserved defaults and constraints:

- `autoCastAbilities: false`
- `autoAscend: false`
- no default Nightbug/Bat auto-buy
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no aggressive Smart Mode buyMax for meat-chain planning
- active action payback bypass from 0.7.8 preserved
- fallback floor at active planner action unit preserved
- target-aware upgrade/twin planner from 0.7.9 preserved

## Versioning

Updated markers:

- userscript header `@version` = `0.8.0`
- export payload `scriptVersion` = `"0.8.0"`
- settings title `SwarmBot v0.8.0`

## Validation

Ran:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
node --check releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.user.js
```

Static checks performed:

- no remaining `SwarmBot v0.7.9` UI title
- safety defaults preserved
- release `.user.js` and `.txt` are byte-identical
- source and release files are byte-identical for 0.8.0

## Files

- `src/SwarmSim-Strategy-Autobuyer.user.js`
- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.user.js`
- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.txt`
- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-release-notes.md`
- `docs/release-notes/SwarmSim-Strategy-Autobuyer-0.8.0-release-notes.md`
- `AI-2026-07-09-script-0.8.0-indexed.md`
