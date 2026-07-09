# SwarmSim Strategy Autobuyer 0.7.9 — release notes

Historical note: artifact lists in this file describe the original 0.7.9
release packaging. The current repo keeps executable source only in
`src/SwarmSim-Strategy-Autobuyer.user.js`; do not recreate old `.user.js` or
`.txt` release mirrors.

Date: 2026-07-08

## Purpose

0.7.9 is a focused planner release: **Target-aware Upgrade / Twin Planner**.

0.7.8 fixed active meat-action payback bypass, so the bot now keeps pressure on the active planner action unit, for example Hive Neuron when the target is Lesser Hive Mind. The next observed gap was that buyable twin upgrades such as Twin Neuroprophets were still being held only with the generic message:

```text
twin upgrades are handled by goal planner / chain prep, not generic safe-upgrade buying
```

That was not a real decision. It meant the generic upgrade lane had filtered the twin out before it was evaluated against the active target path.

## What changed from 0.7.8

### Target-aware support planner

0.7.9 adds a target-aware upgrade/twin layer before the generic safe-upgrade filter.

When the meat goal planner has an active plan, for example:

```text
Target: Lesser Hive Mind
Active action: Hive Neuron
```

0.7.9 can evaluate buyable upgrades and twins that support the active path:

- the active action unit itself,
- the active action unit's direct meat-chain cost resource,
- the next parent step toward the current target,
- visible units on the current target path.

In the live-log scenario this means Twin Neuroprophets is no longer held solely by the generic twin filter, because Neuroprophets are the direct cost resource used by Hive Neuron.

### Production vs twin distinction

Target-aware support classifies upgrades as:

- `production` for Faster/Speed/Production style upgrades,
- `twin` for Twin upgrades.

Target-aware production upgrades are deferred out of the generic Critical Production layer when they affect the active target path, so their reason and safety gates are logged as target-aware instead of as a generic critical upgrade.

### Stronger target-aware twin reserve/recovery gate

For target-aware twins, 0.7.9 requires meat-chain recovery to survive the purchase.

The required post-buy reserve is:

```text
meatChainReserveMultiplier + twinRecoveryBufferMultiplier
```

With current defaults this is:

```text
2.0x + 0.5x = 2.5x cost remaining after purchase
```

This is intentionally conservative because twin upgrades often stop being worth it later or can wipe out the unit that the planner is actively trying to build.

Example HOLD shape:

```text
HOLD twin neuroprophets
Reason: target-aware twin support for lesser hive mind; active action hive neuron uses/supports neuroprophets; blocked: costs 10.0Sx hive neurons; after buy 71.4Sx; reserve 1.7x < required 2.5x
```

Example BUY shape:

```text
BUY twin neuroprophets
Reason: target-aware twin support for lesser hive mind; active action hive neuron uses/supports neuroprophets; reserve/recovery ok; reserve/recovery 4788x ok
```

### Generic twin hold still exists, but not for relevant twins

The old generic reason remains for irrelevant twins, such as lower-chain filler twins that do not support the current active target path.

But for target-relevant buyable twins, 0.7.9 now produces either:

- a target-aware BUY, or
- a target-aware HOLD with the exact blocker.

It should no longer hold a relevant Twin Neuroprophets only with:

```text
twin upgrades are handled by goal planner / chain prep, not generic safe-upgrade buying
```

### Strategy Inspector / export fields

0.7.9 adds visible/exported fields:

- `targetAwareUpgradeCandidate`
- `targetAwareUpgradeDecision`
- `targetAwareUpgradeReason`
- `targetAwareUpgradeName`
- `targetAwareUpgradeType`
- `targetAwareUpgradeSupportsActionUnit`
- `targetAwareUpgradeReserveRatio`
- `targetAwareUpgradeCostResource`

Strategy Inspector now includes rows for:

```text
Target-aware upgrade
Target-aware decision
Target-aware reason
Target-aware type
Target-aware supports action
Target-aware reserve
Target-aware cost
```

## Preserved from 0.7.8

Still preserved:

- active action payback bypass,
- fallback floor at active planner action unit,
- no drop to lower filler below active action unit,
- Neural Cluster / Hive Network reserve/payback guards,
- exact chunk buying only for Smart Mode meat planner,
- no Smart Mode meat-chain `buyMaxUnit`,
- Strategy Inspector fields from 0.7.8.

## Safety / defaults preserved

Unchanged defaults:

```js
autoCastAbilities: false
autoAscend: false
saveEnergyForNexus: true
nexusTarget: 5
energyPlanner: true
blockLepidopteraBeforeNexus: 4
fastNexus5MothSoftTarget: 572
territoryMinEtaImprovementSeconds: 2
territoryMinEtaImprovementRatio: 0.001
smartUnitBuyPercent: 0.25
meatChainReserveMultiplier: 2
meatChainMaxPaybackSeconds: 1800
meatActionUnitPaybackBypass: true
meatActionUnitMinReserveRatio: 5
meatFallbackDoNotDropBelowActionUnit: true
```

Still not introduced:

- Nightbug auto-buy,
- Bat auto-buy,
- ability auto-cast,
- Clone Larvae auto-cast,
- auto-ascend,
- aggressive `buyMaxUnit` in Smart Mode,
- lower filler buys under the active planner action unit.

## Validation

Ran:

```bash
node --check SwarmSim-Strategy-Autobuyer-0.7.9-target-aware-upgrade-twin-planner.user.js
```

Result: passed.

Static checks performed:

- `@version` is `0.7.9`.
- `scriptVersion` is `"0.7.9"`.
- Panel title is `SwarmBot v0.7.9`.
- No remaining `SwarmBot v0.7.8` UI string.
- `.txt` source is byte-identical to `.user.js`.
- `autoCastAbilities` remains `false` by default.
- `autoAscend` remains `false` by default.
- Clone Larvae remains gated by `autoCastAbilities` and is not auto-cast by default.
- No Nightbug/Bat auto-buy rule was introduced.
- Smart Mode meat planner still uses exact `buyUnitAmount`, not `buyMaxUnit`.
- Active action payback bypass remains present.
- Fallback floor under active action unit remains present.
- Target-aware upgrade/twin fields are present in Strategy Inspector and export.

## Files

- `SwarmSim-Strategy-Autobuyer-0.7.9-target-aware-upgrade-twin-planner.user.js`
- `SwarmSim-Strategy-Autobuyer-0.7.9-target-aware-upgrade-twin-planner.txt`
- `SwarmSim-Strategy-Autobuyer-0.7.9-release-notes.md`
- `AI-2026-07-08-script-0.7.9-indexed.md`
- `AI.md`
