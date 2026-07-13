# BOOK-00 Milestone 5 — Ascension and Mutagen Foundation

Status: implementation-ready handoff contract; no M5 runtime behavior is added
by this document.

Target release: `5.0.0`

Baseline:

- M4 implementation: `f2db145e368f77e1b348a6cb70e1f8ef2f6a0a90`
- M4 evidence: `b9040d5943e621e6f41c6d247794e6866859ff64`
- M5 branch: `codex/m5-ascension-mutagen-advisor`
- Base-game formula repository: `https://github.com/swarmsim/swarm`
- Pinned base-game commit: `06b4f404aa324a0b454348508cfa63d5c0f1ff54`
- Machine-readable formula manifest:
  `docs/test-data/5.0.0-book00-m5-ascension-mutagen/m5-source-formula-manifest.json`

## 1. Product outcome

M5 answers two connected questions without performing irreversible actions:

1. Is the remaining value of the current run greater than the value of
   ascending now?
2. How would a supported Mutagen allocation change the next run, after the
   opportunity cost of removing unallocated Mutagen larva production?

The player-visible result must include:

- `CONTINUE_RUN`, `ASCEND_NOW`, or `UNCERTAIN`;
- both explicit counterfactual branches from one immutable snapshot;
- current Ascension legality and Energy ETA;
- current-run opportunity cost;
- estimated recovery/break-even and the modeled next-run horizon;
- active and inactive Mutagen amounts;
- supported Mutagen plan or an explicit reason it is unranked;
- confidence, uncertainty, and a reconsideration condition.

Authority is advisor-only. `autoAscend` remains `false`, no command calls
`commands.ascend`, and no Mutagen is spent.

## 2. Source authority and claim classes

Use this priority order:

1. Runtime-resolved values from the live `game` object.
2. Semantics verified against the pinned base-game source.
3. Deterministic recomputation from captured snapshot inputs.
4. Explicit `incomplete`, `unsupported`, or `uncertain` status.

Never promote a community strategy number into a formula or threshold.
`reference/` is sanity-check material only.

Every formula/result must carry one of:

- `runtime-derived`;
- `source-verified`;
- `observed-estimate`;
- `incomplete`;
- `mismatch`;
- `unsupported`.

The difference between formula certainty and strategic certainty is important:
the effect of Warp Mutation is source-verified, but its whole-run strategic
value is unsupported while Swarmwarp timing remains outside the accepted model.

## 3. Verified Ascension mechanics

Authoritative source:
`swarmsim-coffee/app/scripts/services/game.coffee`.

### 3.1 Energy spent

`game.ascendEnergySpent()` returns `game.unit("energy").spent()`.
`Unit.spent()` reconstructs Energy invested in current units and upgrades from
their current counts and costs. Prefer the runtime method; do not invent a
parallel historical-spend counter.

### 3.2 Ascension cost

Executable source semantics:

```text
spent = game.ascendEnergySpent()
ascensions = game.unit("ascension").count()
penalty = 1.12 ^ ascensions
costVelocity = 50000 * game.unit("mutagen").stat("ascendCost", 1)
ascendCost = ceil(penalty * 5000000 / 2 ^ (spent / costVelocity))
```

Important discrepancy: the adjacent source comment says the cost increases
20% per past Ascension, but executable code uses `1.12`. The implementation
must trust the executable expression and include a regression assertion for
`1.12`, not the stale comment.

Lepidoptera Mutation increases `mutagen.ascendCost` asymptotically toward
`1.6`. This increases `costVelocity`, so the same spent Energy reduces
Ascension cost less strongly. It is a real cross-effect and must be visible.

### 3.3 Legality and ETA

```text
ascendCostPercent = min(1, currentEnergy / ascendCost)
ASCEND_NOW is legal only when currentEnergy >= ascendCost
```

`game.ascendCostDurationSecs(cost)` returns an ETA only when the cost is below
the current Energy cap. Capture runtime output when present. If the cost is at
or above cap, report `ENERGY_CAP_BLOCKED`; do not emit a fake finite ETA.

### 3.4 Reset transition

On Ascension:

- inactive `premutagen` is added to active `mutagen`;
- `premutagen` becomes zero;
- Ascension count increases by one;
- every third Ascension grants one free respec;
- units without `ascendPreserve` reset to `init` or zero;
- upgrades outside the Mutagen tab reset to zero;
- preserved Mutagen resources, mutation units, mutation unlocks, Ascension
  count, free respecs, and other source-marked preserved units remain.

The M5 advisor simulates this transition only in an immutable plain-data model.
It must never call `game.ascend()` or mutate a live game object.

## 4. Verified Mutagen economy

### 4.1 Active versus inactive Mutagen

- Runtime unit ids: `mutagen`, `premutagen`, `ascension`.
- Each unallocated active Mutagen produces `0.1 larva/second`.
- Inactive Mutagen produces no current-run larvae and becomes active at
  Ascension.
- Each Mutagen allocated to a mutation costs one active Mutagen.

Therefore, allocating amount `A` has an immediate verified opportunity cost:

```text
lostMutagenLarvaPerSecond = A * 0.1
lostMutagenLarvaeOverHorizon = A * 0.1 * horizonSeconds
```

No allocation recommendation is honest unless this cost is shown.

### 4.2 Mutation unlock costs

All ten mutation unlock upgrades have base cost `1` Mutagen and factor `15625`.
Each purchased unlock adds one `mutagen.upgradecost`, one hidden tracker level,
and one unit of the corresponding mutation through `addUnit`. For `n` already
unlocked mutations:

```text
nextMutationUnlockCost = 15625 ^ n
```

Use the runtime upgrade cost when available and use this formula as a parity
check. Do not use legacy milestone numbers such as `270M` or `300M` as product
thresholds.

Keep unlock spending distinct from later allocation: the unlock consumes the
full geometric Mutagen cost and grants mutation level 1, while later mutation
levels cost one Mutagen each. Lost unallocated-Mutagen larva production applies
to the full Mutagen amount spent, not merely the resulting mutation level.

### 4.3 Premutagen generation

Hatchery and Expansion use seeded `addUnitRand` effects. The source guarantees
a spawn at the configured minimum level and every eighth level; otherwise it
uses deterministic seeded rolls. Quantity uses the upgrade-specific growth
factor, `random.each`, and a seeded `0.9–1.1` modifier.

For the next Hatchery/Expansion opportunity, prefer runtime
`effect.outputNext()` because it contains the deterministic next spawn and
quantity. Do not replace it with expected value unless the result is clearly
marked `observed-estimate` and both probability and variance are visible.

## 5. Verified effect functions

For mutation level `L`:

```text
logStat(L) = 1 + val3 * (log(val * L + val2) / log(val2) - 1)
asympStat(L) = 1 + (val - 1) * (1 - 1 / (1 + L * val2))
expStat(L) = 1 + (L ^ val) * val2
initStat(L) = multiply current/default stat by val
```

Preserve Decimal precision. JavaScript `Number` may be used only for bounded UI
scores after exact outcome strings have already been retained.

## 6. Initial M5 Mutagen support matrix

| Mutation | Source effect | Initial M5 treatment | Why |
| --- | --- | --- | --- |
| Keep unallocated | `0.1 larva/s` per Mutagen | rankable baseline | direct verified common metric |
| Hatchery | `logStat` on invisible-hatchery production | rankable when unlocked and runtime inputs resolve | benefit and cost can both be expressed in larvae over one horizon |
| Bat | `logStat` on global Energy ability power | effect visible, unranked | cross-ability value not in a shared next-run metric |
| Clone | `logStat` on Clone Larvae power | effect visible, unranked | requires M4 ability-window frequency across a future run |
| Warp | `logStat` on Swarmwarp power | unsupported and unranked | Swarmwarp formula/timing is outside accepted M4 scope |
| Rush | `logStat` on three Rush powers | effect visible, unranked | future cast cadence and cross-resource conversion missing |
| Meta | Mutagen quantity plus minimum levels | effect visible, unranked | stochastic multi-run value needs a premutagen model |
| Frequency | asymptotic Mutagen spawn probability | effect visible, unranked | stochastic multi-run value needs a premutagen model |
| Lepidoptera | Nexus production, Energy cap, Ascension-cost coupling | effect visible, unranked | benefit and higher Ascension cost must be modeled together |
| Territory | `expStat` on eleven army production rates | effect visible, unranked | needs next-run Territory/Expansion conversion |
| Meat | unit-specific `logStat` across the meat chain | effect visible, unranked | needs full next-run producer-chain simulation |

“Unranked” does not mean hidden. Show current level, proposed level, exact effect
delta, opportunity cost, verification status, and missing model dependency.

The first implementation must not claim a globally optimal Mutagen portfolio.
It may rank `KEEP_UNALLOCATED` against Hatchery Mutation when all direct larva
inputs are available. Other effects are an explainable catalog until their
cross-domain models are separately accepted.

## 7. Runtime data map

Use existing helpers where possible:

| Field | Preferred runtime access |
| --- | --- |
| current Energy/rate/cap | `getCurrentResource`, `getVelocity`, Energy unit `capValue()` |
| spent Energy | `game.ascendEnergySpent()` |
| Ascension cost | `game.ascendCost()` |
| legality ratio | `game.ascendCostPercent()` |
| Energy ETA | `game.ascendCostDurationSecs(cost)` |
| active Mutagen | `getCurrentResource(game, "mutagen")` |
| inactive Mutagen | `getCurrentResource(game, "premutagen")` |
| Ascension count | `getCurrentResource(game, "ascension")` |
| mutation level | corresponding `getGameUnit(game, unitId).count()` |
| unlock state/cost | corresponding `getGameUpgrade(game, upgradeId)` |
| mutation-resolved stat | target unit `.stat(statName, default)` |
| current run start | `game.session.state.date.restarted`, if valid |
| next premutagen spawn | Hatchery/Expansion `addUnitRand` effect `outputNext()` |

Missing, throwing, non-finite, or structurally unexpected runtime fields must
downgrade confidence. A missing field must not become zero silently.

## 8. Proposed immutable snapshot contract

Schema: `ascension-mutagen-snapshot.v1`.

```json
{
  "schemaVersion": "ascension-mutagen-snapshot.v1",
  "snapshotId": "M5-...",
  "snapshotHash": "sha256:... or deterministic runtime identity",
  "source": {
    "scriptVersion": "5.0.0",
    "baseGameCommit": "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
    "capturedAt": "ISO-8601",
    "activeMilestone": "...",
    "activeTarget": "..."
  },
  "authority": {
    "mode": "advisor-only",
    "executionAuthority": false,
    "autoAscend": false,
    "liveStateMutable": false
  },
  "currentRun": {
    "elapsedSeconds": null,
    "energy": { "amount": "0", "perSecond": "0", "cap": "0", "spent": "0" },
    "nextBoundedOpportunity": { "label": "unknown", "etaSeconds": null, "value": null }
  },
  "ascension": {
    "count": "0",
    "cost": "0",
    "costPercent": "0",
    "legal": false,
    "energyEtaSeconds": null,
    "energyCapBlocked": false
  },
  "mutagen": {
    "active": "0",
    "inactive": "0",
    "activeAfterAscend": "0",
    "newLarvaPerSecondAfterAscend": "0",
    "nextUnlockCost": "0",
    "mutations": []
  },
  "recoveryModel": {
    "basis": "observed-run-scaled-v1 or unavailable",
    "breakEvenSeconds": null,
    "rangeLowSeconds": null,
    "rangeHighSeconds": null,
    "nextRunHorizonSeconds": null,
    "confidence": "low",
    "warnings": []
  },
  "formulaProvenance": []
}
```

Deep-clone and deep-freeze the snapshot before evaluating either branch. Both
branches must carry the same `snapshotId`, hash, active milestone, target, and
horizon.

## 9. Advisor result contract

Schema: `ascension-mutagen-advisor.v1`.

Required top-level fields:

```text
schemaVersion
mode = advisor-only
executionAuthority = false
snapshotId
activeMilestone
activeTarget
recommendation = CONTINUE_RUN | ASCEND_NOW | UNCERTAIN
recommendedActionId = CONTINUE_RUN | ASCEND_NOW
confidence = low | medium | high
reason
reconsiderCondition
breakEvenSeconds / range
nextRunHorizonSeconds
currentRunOpportunityCost
mutagenPlan
branches[]
warnings[]
```

Required branches:

### `CONTINUE_RUN`

- Ascension is not applied.
- Preserve current active/inactive Mutagen.
- Include the best bounded next-run opportunity supported by current runtime
  evidence, normally next Hatchery/Expansion premutagen output or Energy ETA.
- State what additional Mutagen or progress could be earned before reconsidering.

### `ASCEND_NOW`

- Mark illegal when Energy is below cost.
- Apply only the verified reset transition to the plain snapshot.
- Add inactive Mutagen to active Mutagen.
- Show new unallocated-Mutagen larva/sec.
- Do not invent post-Ascension purchases, casts, or allocation.
- Apply an optional supported Mutagen plan as a separate sub-counterfactual,
  never as an assumed follow-up action.

## 10. Recovery and break-even policy

No source formula directly predicts “time until the next run catches the current
run.” M5 must separate exact mechanics from estimates.

Allowed evidence tiers:

1. `observed-run-milestone`: prior reset-safe telemetry contains time from
   Ascension to the same named milestone. Preferred; medium/high confidence
   depending on sample count and dispersion.
2. `observed-run-scaled-v1`: current run elapsed time is scaled only by a
   source-verified directly modeled production ratio. Must publish a wide range
   and low confidence.
3. `unavailable`: emit `breakEvenSeconds: null`, `UNCERTAIN`, and a concrete
   reconsideration condition. Never synthesize a fixed recovery time.

M5 v1 need not build a persistent multi-run telemetry system. If no honest
recovery input exists, the safe advisor result is `UNCERTAIN` with
`recommendedActionId: CONTINUE_RUN`, not a fabricated `ASCEND_NOW`.

Synthetic acceptance fixtures may inject explicit observed recovery evidence to
prove that `ASCEND_NOW` can honestly win. The fixture must label its evidence
basis and must not inject the expected recommendation.

## 11. Recommendation gates

`ASCEND_NOW` may be recommended only when all pass:

- Ascension is legal now;
- one immutable snapshot feeds both branches;
- reset transition inputs are complete;
- inactive Mutagen gain is positive or another source-verified next-run benefit
  is explicit;
- recovery/break-even evidence is available;
- break-even is inside the declared next-run horizon;
- `ASCEND_NOW` beats the best supported `CONTINUE_RUN` opportunity;
- confidence is at least medium;
- no formula mismatch or live-state mutation occurred.

Otherwise recommend `CONTINUE_RUN` or `UNCERTAIN`. Safety is independent of the
economic score.

## 12. Mutagen plan contract

The plan must always include `KEEP_UNALLOCATED` because unallocated Mutagen is a
productive alternative.

For each candidate include:

```text
mutationId / label
unlockState
currentLevel
proposedAllocationAmount
unlockCostIfNeeded
totalMutagenSpent
levelAfter
effectBefore / effectAfter / effectDelta
lostMutagenLarvaPerSecond
lostMutagenLarvaeOverHorizon
targetMetric
targetAligned
verificationStatus
rankingStatus
blockedBy / unrankedBecause
```

Do not choose allocation amounts from historical guides. The evaluator may
accept an explicit analysis amount in deterministic tests or calculate a
bounded sensitivity probe clearly labeled as a probe. A probe is not permission
to spend and must not be worded as an exact portfolio allocation.

## 13. Player-visible observability

Expose the result in Strategy Inspector, JSON export, Markdown export, and the
public diagnostic API. Minimum flat fields:

```text
ascensionAdvisorRecommendation
ascensionAdvisorConfidence
ascensionAdvisorReason
ascensionAdvisorReconsiderCondition
ascensionAdvisorSnapshotId
ascensionAdvisorCost
ascensionAdvisorCostPercent
ascensionAdvisorEnergyEtaSeconds
ascensionAdvisorBreakEvenSeconds
ascensionAdvisorBreakEvenRange
ascensionAdvisorNextRunHorizonSeconds
ascensionAdvisorCurrentRunOpportunity
ascensionAdvisorInactiveMutagen
ascensionAdvisorActiveAfterAscend
ascensionAdvisorNewLarvaPerSecond
ascensionAdvisorMutagenPlan
ascensionAdvisorExecutionAuthority
```

Suggested diagnostic API:

```js
window.kbcSwarmBot.ascensionMutagenAdvisor.evaluate(snapshot)
window.kbcSwarmBot.ascensionMutagenAdvisor.getCurrent()
window.kbcSwarmBot.ascensionMutagenAdvisor.formulaManifest()
```

The API evaluates plain data only and has no command/execution method.

## 14. Focused deterministic acceptance matrix

Required scenarios:

1. **Illegal Ascension** — Energy below cost; `CONTINUE_RUN`, explicit deficit
   or ETA, no authority.
2. **Energy cap blocked** — cost cannot fit cap; no finite fake ETA.
3. **Continue wins** — legal Ascension but next deterministic premutagen
   opportunity is better inside the declared horizon.
4. **Ascend wins** — legal Ascension, positive inactive Mutagen, explicit
   observed recovery evidence, break-even inside horizon.
5. **Uncertain recovery** — legal Ascension but no honest recovery basis;
   `UNCERTAIN` and safe `CONTINUE_RUN` action.
6. **Lepidoptera coupling** — increasing Lepidoptera Mutation changes both
   Energy production/cap effects and Ascension cost multiplier.
7. **Unlock progression** — next unlock costs `1`, `15625`, `244140625` for
   zero, one, and two prior unlocks.
8. **Hatchery allocation wins** — direct larva benefit exceeds lost Mutagen
   larvae over an explicit horizon.
9. **Keep unallocated wins** — allocation opportunity cost exceeds Hatchery
   benefit.
10. **Unsupported mutations** — Warp and other cross-domain candidates remain
    visible but unranked.
11. **Snapshot identity** — both branches and all Mutagen candidates share one
    snapshot/milestone/horizon.
12. **Non-mutation** — evaluator input and live state are unchanged.
13. **Safety** — `autoAscend` remains false and result/API never gains execution
    authority.
14. **Formula parity** — generic effect helpers match pinned constants and
    runtime-resolved stats for representative levels.

Fixtures must supply mechanics and observations, never expected decisions.

## 15. Expected implementation files

Narrow expected scope:

- `dev-src/runtime-sections/runtime-main.js`;
- canonical `src/SwarmSim-Strategy-Autobuyer.user.js` from `npm run build`;
- `scripts/check-book00-m5-ascension-mutagen-advisor.js`;
- `scripts/check-5.0.0-version-surfaces.js`;
- `package.json` and `package-lock.json` version/scripts;
- README, history, status board, and `5.0.0` release notes;
- separate exact-SHA evidence under
  `docs/test-data/5.0.0-book00-m5-ascension-mutagen/`.

Do not edit UI artwork/contracts owned by the parallel UI workstream unless
integration is explicitly coordinated.

## 16. Version and verification protocol

M5 starts at `5.0.0`. Historical `4.0.0` and M3 evidence remain unchanged.

Before formal verification, inspect every command for writes. Minimum suite:

```bash
node scripts/validate-repo-guardrails.js
npm run build
npm run verify
npm run check:book00:m5:ascension-mutagen
git diff --check
```

Follow `docs/process/GIT_VERIFICATION_PROTOCOL.md` exactly:

1. commit and push implementation;
2. record full implementation SHA and tree SHA;
3. verify that exact clean SHA;
4. allow only predeclared evidence paths;
5. commit generated evidence separately;
6. report final acceptance only when the integration target is synchronized
   and clean.

## 17. Hard stop conditions

Stop rather than guess when:

- runtime Ascension cost disagrees with the recomputed pinned formula;
- mutation effect parity fails;
- recovery evidence is missing but `ASCEND_NOW` would otherwise win;
- a candidate requires Swarmwarp or another unsupported downstream model;
- a command/API path could ascend or allocate Mutagen;
- Decimal values are collapsed into unsafe `Number` calculations;
- tests modify expectations after execution;
- UI or another workstream has overlapping dirty changes.

## 18. M5 completion checklist

- [ ] `CONTINUE_RUN` and `ASCEND_NOW` use the same immutable snapshot.
- [ ] Legality, Energy ETA/cap block, inactive Mutagen, and reset effects are
      visible.
- [ ] Break-even basis, horizon, range, and uncertainty are explicit.
- [ ] `KEEP_UNALLOCATED` is always a Mutagen alternative.
- [ ] Hatchery allocation includes lost Mutagen larva production.
- [ ] Other mutations are visible but unranked until their cross-domain model
      is supported.
- [ ] No historical fixed Mutagen portfolio numbers are used.
- [ ] `executionAuthority` is false everywhere.
- [ ] `autoAscend` remains false.
- [ ] Input/live-state non-mutation is proven.
- [ ] Version surfaces consistently report `5.0.0`.
- [ ] Focused and full exact-SHA verification pass with separate evidence.
