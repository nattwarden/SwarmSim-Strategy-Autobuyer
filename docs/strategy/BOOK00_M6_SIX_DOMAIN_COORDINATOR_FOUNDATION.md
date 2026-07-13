# BOOK-00 Milestone 6 — Six-Domain Strategic Coordinator Foundation

Status: implementation-ready handoff contract; this document adds no M6
runtime behavior.

Target release: `6.0.0`

Baseline:

- integrated M5 implementation on `main`:
  `c10d8c5a9160708e1d657ad5f08496dfb8e2e698`;
- integrated M5 evidence on `main`:
  `af6a41b9534b6ff682a2903d938fa17686a3a9d2`;
- M5 implementation/evidence:
  `060a5654fe409db54d196b0368533d6696bb3361` /
  `fdd278c4788495f1e9ab4058b1f61b5d9240552f`;
- M4 implementation/evidence:
  `f2db145e368f77e1b348a6cb70e1f8ef2f6a0a90` /
  `b9040d5943e621e6f41c6d247794e6866859ff64`;
- current runtime version: `5.0.0`;
- intended implementation branch: `codex/m6-six-domain-coordinator`;
- machine-readable authored contract manifest:
  `docs/test-data/6.0.0-book00-m6-six-domain/m6-domain-contract-manifest.json`.

## 1. Product outcome

M6 creates one explainable strategic decision loop for exactly these six
BOOK-00 domains:

1. Meat chain;
2. Larva/Engine;
3. Army/Territory;
4. Energy production;
5. Energy abilities;
6. Ascension/Mutagen.

The player-visible result must show, in one coherent view:

- active milestone, target, and comparison horizon;
- the best allowed and honestly comparable action;
- the most important alternatives, including blocked and unranked actions;
- projected milestone outcome and relevant costs;
- hard blockers separately from economic rank;
- confidence and missing evidence;
- the condition that should trigger reconsideration;
- whether the winner is advisory or may execute;
- selected, revalidated, and actually executed identity when execution occurs.

Player-facing release sentence:

> The bot now coordinates Meat, Larva, Territory, Energy, abilities, and
> Ascension as one economy and explains the best next strategic move.

M6 does not authorize a new irreversible action. Existing bounded reversible
purchase authority may be reused only when the global winner is the exact same
purchase that passes all existing M2/M3 gates and immediate revalidation.

## 2. Current architecture and the gap M6 closes

### 2.1 Existing purchase coordinator

The `5.0.0` runtime currently normalizes four purchase domains into
`whole-economy-outcome.v2` and displays a
`whole-economy-shadow-preview.v2` result:

- Meat chain;
- Larva/Engine;
- Army/Territory;
- Energy production.

Existing bounded execution is implemented by
`buildWholeEconomyExecutionDecisionV1(...)`, immediate proposal revalidation,
canonical identity/fingerprint matching, and exact lane adapters. Allowed
execution keys are limited to `meat`, `engine`, `territory`, and `energy`, with
Energy further limited to the accepted Nexus/Lepidoptera production slice.

### 2.2 Existing advisor domains

M4 exposes `energy-ability-timing-advisor.v1`. It can recommend WAIT/save,
Clone Larvae, House of Mirrors, and supported Rush abilities, but always has
`executionAuthority: false`.

M5 exposes `ascension-mutagen-advisor.v1`. It can recommend `CONTINUE_RUN`,
`ASCEND_NOW`, or `UNCERTAIN`, and can compare supported Mutagen effects, but
always has `executionAuthority: false` and never spends Mutagen.

### 2.3 The integration gap

The four purchase domains, M4 advisor, and M5 advisor are visible in the same
runtime but do not yet participate in one global comparison. Their local scores
are not on a common economic scale. M6 must not solve this by placing the M4
ability score, M5 qualitative recommendation, and purchase economic score in
one numeric sort.

The M6 slice adds an adapter and coordinator layer above the accepted M1–M5
contracts. It preserves those contracts for regression compatibility.

## 3. Non-negotiable decision principles

### 3.1 One decision identity

Every domain outcome in one M6 evaluation must carry the same:

- `snapshotId`;
- `snapshotHash` or deterministic state fingerprint;
- `decisionCycleId`;
- `activeMilestone`;
- `activeTarget`;
- horizon set;
- `capturedAt` revision;
- source script version.

All six outcomes must be derived before any main action executes. Evaluator
input is deep-cloned/frozen and must remain unchanged.

M4 and M5 may retain their own internal snapshot schemas, but their M6 adapters
must bind them to the shared M6 decision identity. Mismatched identity makes an
outcome unrankable and removes execution authority.

### 3.2 Hard safety before ranking

Safety is not a score component. Each candidate first receives a safety state:

```text
ALLOWED
BLOCKED
ADVISOR_ONLY
UNSUPPORTED
```

`BLOCKED` and `UNSUPPORTED` candidates remain visible but cannot win.
`ADVISOR_ONLY` candidates may win the recommendation but can never execute.
Only an `ALLOWED` supported reversible purchase can enter the existing bounded
execution path.

No high projected value may override:

- protected resources;
- Hatchery/Expansion save windows;
- Clone Buffer hard locks;
- Nexus/Energy protection;
- disabled auto-cast;
- disabled auto-Ascension;
- Mutagen spend prohibition;
- reserve, rebuild, payback, identity, or action-budget gates.

### 3.3 Comparable outcome before rank

Every domain participates by emitting an outcome, but a candidate is globally
rankable only when it has a comparable result for the active milestone and
horizon.

Allowed shared comparison bases, in priority order:

1. `milestoneEtaImprovementSeconds` for the same named milestone and horizon;
2. `projectedMilestoneProgressDelta` only when unit and basis are identical;
3. an explicitly versioned source-/runtime-derived common value model accepted
   by a focused test.

Forbidden cross-domain ranking inputs:

- raw lane score;
- M4 ability score;
- priority or urgency bonus;
- local ROI with a different unit;
- renamed or normalized scores without a shared economic meaning;
- scenario labels or expected winners.

When no honest shared metric exists, set `comparability.status` to `UNRANKED`
and name the missing conversion. Missing data is not zero.

### 3.4 Deterministic global selection

Global selection order:

1. remove `BLOCKED` and `UNSUPPORTED` candidates from winner eligibility;
2. retain them as explained alternatives;
3. keep only candidates with `comparability.status = COMPARABLE`;
4. require active milestone, target, and horizon alignment;
5. rank by the accepted shared outcome basis;
6. use confidence/evidence quality only as a gate or exact-tie breaker;
7. use a documented stable domain id only for a true deterministic tie.

If no candidate is both allowed and comparable, return:

```text
recommendation = UNCERTAIN
recommendedActionId = WAIT
executionAuthority = false
```

with an explicit reconsideration condition.

## 4. Shared six-domain outcome contract

Schema: `strategic-domain-outcome.v1`.

Required shape:

```json
{
  "schemaVersion": "strategic-domain-outcome.v1",
  "snapshotId": "M6-...",
  "snapshotHash": "sha256:...",
  "decisionCycleId": "cycle-...",
  "sourceSchemaVersion": "whole-economy-outcome.v2",
  "domainId": "MEAT",
  "domainLabel": "Meat chain",
  "action": {
    "actionId": "...",
    "label": "...",
    "class": "PURCHASE",
    "amount": "1",
    "executionKey": "meat",
    "executionId": "queen",
    "executionKind": "unit",
    "executionVariant": "base",
    "fingerprint": "..."
  },
  "context": {
    "activeMilestone": "...",
    "activeTarget": "...",
    "horizonId": "medium",
    "horizonSeconds": 1800
  },
  "safety": {
    "status": "ALLOWED",
    "executionClass": "BOUNDED_REVERSIBLE",
    "hardBlockers": [],
    "protectedResourcesTouched": []
  },
  "comparability": {
    "status": "COMPARABLE",
    "basis": "milestone-eta-seconds",
    "metricUnit": "seconds",
    "missingConversions": []
  },
  "outcome": {
    "milestoneEtaBeforeSeconds": null,
    "milestoneEtaAfterSeconds": null,
    "milestoneEtaImprovementSeconds": null,
    "projectedMilestoneProgressDelta": null,
    "recoverySeconds": null,
    "paybackSeconds": null,
    "opportunityCost": "...",
    "resourceCosts": [],
    "effects": []
  },
  "evidence": {
    "confidence": "medium",
    "status": "runtime-derived",
    "supportingFields": [],
    "warnings": []
  },
  "reason": "...",
  "reconsiderCondition": "..."
}
```

The six canonical `domainId` values are:

```text
MEAT
LARVA_ENGINE
ARMY_TERRITORY
ENERGY_PRODUCTION
ENERGY_ABILITIES
ASCENSION_MUTAGEN
```

No seventh pseudo-domain is allowed. WAIT/save, `CONTINUE_RUN`, and Mutagen
subplans remain actions or sub-counterfactuals inside their owning domain.

## 5. Domain adapter requirements

### 5.1 Meat, Larva/Engine, Army/Territory, Energy production

Adapt the accepted `whole-economy-outcome.v2` purchase rows without changing
the lane planners. Preserve canonical identity, bounded amount, costs,
blockers, shared Energy fields, and existing fingerprints.

A purchase outcome is not automatically comparable merely because it has an
`economicScore`. Use only real common outcome fields. Local components remain
diagnostics.

### 5.2 Energy abilities

Adapt the M4 winning branch and WAIT branch from the same M6 identity.

- `CAST_NOW` actions are `ADVISOR_ONLY`.
- WAIT/save is a legitimate advisory action.
- Swarmwarp remains unsupported.
- A projected resource gain is not automatically milestone ETA.
- The ability may rank globally only when a source-/runtime-derived conversion
  to the active milestone outcome exists.
- Otherwise it remains visible and `UNRANKED` with the missing conversion.

### 5.3 Ascension/Mutagen

Adapt the M5 `CONTINUE_RUN` and `ASCEND_NOW` branches plus supported Mutagen
plan context.

- `ASCEND_NOW` and every Mutagen allocation remain `ADVISOR_ONLY`.
- `UNCERTAIN` safely maps to WAIT/continue and cannot execute.
- Missing recovery evidence keeps Ascension globally unranked.
- Break-even and next-run horizon must match the shared M6 context.
- Unsupported mutation portfolio effects remain unranked.

## 6. Cross-domain effects and double-count prevention

Schema for each outcome effect: `strategic-effect.v1`.

Required fields:

```text
effectId
sourceActionId
sourceDomainId
causalRole = DIRECT | INTERMEDIATE | FINAL | OPPORTUNITY_COST
metric
unit
horizonId
delta
includedInRanking
derivedFromEffectIds[]
provenance
```

Rules:

1. `effectId` must be stable within the snapshot and unique.
2. Only one final representation of the same causal benefit may contribute to
   ranking.
3. Intermediate effects remain visible but use `includedInRanking: false` when
   their downstream final effect is counted.
4. Opportunity costs are negative effects, not separate positive candidates.
5. Shared resource conflicts are reported once and are not added independently
   to every downstream metric.
6. Duplicate included effect ids, causal cycles, or incompatible units make the
   candidate `UNRANKED` and remove execution authority.

Example: a Territory purchase may show direct army production, intermediate
Territory gain, and final Expansion ETA improvement. If Expansion ETA is the
ranking basis, army and Territory effects are diagnostic and must not be added
again to the final ETA benefit.

## 7. Strategic coordinator result contract

Schema: `six-domain-strategic-coordinator.v1`.

Required top-level fields:

```text
schemaVersion
mode
snapshotId / snapshotHash / decisionCycleId
activeMilestone / activeTarget
horizons[] / selectedHorizonId
recommendation = ACT | WAIT | UNCERTAIN
recommendedActionId
winner
alternatives[]
domainOutcomes[6]
blockedOutcomes[]
unrankedOutcomes[]
resourceConflicts[]
confidence
reason
reconsiderCondition
doubleCountAudit
executionPlan
warnings[]
```

`domainOutcomes` must contain exactly one primary outcome for every canonical
domain id. A missing adapter creates an explicit placeholder outcome with
`safety.status = UNSUPPORTED`, not silent omission.

The result must expose at least the top three alternatives when present:

- best allowed comparable loser;
- most important hard-blocked candidate;
- most strategically relevant unranked candidate.

## 8. Authority and execution consistency

### 8.1 Authority classes

```text
BOUNDED_REVERSIBLE
ADVISOR_ONLY
NO_ACTION
UNSUPPORTED
```

Only `BOUNDED_REVERSIBLE` may ever receive `executionAuthority: true`.

### 8.2 Existing execution scope only

M6 adds no execution key. The only possible executable global winners remain:

- accepted Meat purchase;
- accepted Larva/Engine purchase;
- accepted Army/Territory purchase;
- accepted Energy-production Nexus/Lepidoptera purchase.

The winner must match the accepted purchase coordinator on:

- domain/lane;
- candidate;
- execution key/id/kind/variant;
- bounded amount;
- target;
- fingerprint;
- action budget;
- confidence and evidence gates.

The lane proposal must then be rebuilt immediately. Any drift denies execution.

### 8.3 Advisor winner behavior

If Energy abilities, Ascension/Mutagen, WAIT, or `UNCERTAIN` wins globally:

- `executionAuthority` is false;
- no ability, Ascension, or Mutagen command is called;
- a lower-ranked purchase must not silently replace the recommendation as the
  first main action in that decision cycle;
- Inspector/Council must state that player action or new evidence is awaited.

This is required decision/execution consistency, not expanded irreversible
automation.

### 8.4 Cycle policy

One global decision authorizes at most one main action. After a successful
purchase, recapture state and create a new decision cycle before another main
action. A stale M6 winner cannot authorize a second action.

Existing side-task behavior is not redesigned in M6. A side task may continue
only through its existing guard and may not contradict the global hard safety
state or consume resources protected by the winner. If this cannot be proven,
defer the side task and explain why.

## 9. Observability and public diagnostic API

Expose the structured M6 result in:

- Swarm Council current strategy view;
- Strategy Inspector;
- JSON export;
- Markdown export;
- public diagnostic API.

Minimum flat fields:

```text
strategicCoordinatorSchemaVersion
strategicCoordinatorSnapshotId
strategicCoordinatorCycleId
strategicCoordinatorActiveMilestone
strategicCoordinatorActiveTarget
strategicCoordinatorSelectedHorizon
strategicCoordinatorRecommendation
strategicCoordinatorWinnerDomain
strategicCoordinatorWinnerAction
strategicCoordinatorWinnerAuthorityClass
strategicCoordinatorExecutionAuthority
strategicCoordinatorConfidence
strategicCoordinatorReason
strategicCoordinatorReconsiderCondition
strategicCoordinatorAlternatives
strategicCoordinatorBlocked
strategicCoordinatorUnranked
strategicCoordinatorResourceConflicts
strategicCoordinatorDoubleCountStatus
strategicCoordinatorSelectedFingerprint
strategicCoordinatorExecutedFingerprint
strategicCoordinatorMatchedExecution
```

Suggested diagnostic-only API:

```js
window.kbcSwarmBot.strategicCoordinator = {
  schemaVersion,
  evaluate(snapshot),
  getCurrent(),
  domainManifest(),
  coverage()
}
```

`evaluate(snapshot)` accepts plain data. The API has no command method.

Do not redesign Council artwork. Add or bind the minimum fields needed to make
the M6 result coherent in the existing Council UI.

## 10. Mechanic-based coverage contract

The M6 coverage report must be built from assertions that actually ran against
production contracts. It must not infer coverage because a scenario id contains
words such as `energy`, `ascend`, or `territory`.

Each coverage row must contain:

```text
mechanicId
domainId
productionContract
invariantId
assertionId
status = PASS | FAIL | NOT_COVERED
evidenceBasis
```

Required mechanic groups:

- six-domain emission and shared identity;
- hard safety gating;
- shared metric comparability;
- ability advisor authority isolation;
- Ascension/Mutagen authority isolation;
- effect-ledger double-count audit;
- bounded reversible identity/revalidation;
- decision/execution cycle consistency;
- input/live-state non-mutation;
- Council/Inspector/export/API observability.

The authored manifest lists required mechanics. The focused checker must mark a
mechanic PASS only after the corresponding runtime assertion passes.

## 11. Focused deterministic acceptance matrix

Initial acceptance budget: twelve grouped states. Fixtures supply mechanics and
observations, never expected winners.

1. **Six-domain identity** — exactly six canonical domains share snapshot,
   cycle, milestone, target, and horizon; evaluator input is unchanged.
2. **Meat honest winner** — Meat wins on shared milestone ETA, not local score.
3. **Larva/Engine honest winner** — Larva/Engine wins on the same basis.
4. **Army/Territory honest winner** — Territory wins without double-counting
   army, Territory, and Expansion effects.
5. **Energy-production honest winner** — supported Nexus/Lepidoptera outcome
   wins while Nexus protection passes.
6. **Energy-ability honest winner** — an aligned source-verified ability wins
   the recommendation but has no execution authority and no purchase fallback;
   WAIT and Swarmwarp boundaries are also asserted.
7. **Ascension honest winner** — M5 recovery evidence supports `ASCEND_NOW`, it
   wins globally, and no Ascension/Mutagen execution or purchase fallback occurs;
   missing recovery maps safely to unranked/uncertain.
8. **Safety outranks value** — a numerically stronger hard-blocked candidate
   loses; blocker remains visible and independent from economic rank.
9. **Comparability and uncertainty** — incompatible/missing units remain
   visible but unranked; no comparable candidate returns WAIT/UNCERTAIN.
10. **Effect ledger and resource conflicts** — duplicate included effects are
    rejected, one final causal effect is counted, and shared costs are reported
    once.
11. **Bounded execution and cycle drift** — supported reversible global winner
    executes only after exact revalidation; fingerprint or cycle drift denies;
    a successful action requires a new cycle before another main action.
12. **Observability, coverage, and safety regression** — Council, Inspector,
    exports, API, mechanic-based coverage, defaults, Laboratory non-mutation,
    and M2–M5 regression all pass.

Use a data-driven six-domain winner matrix inside the focused checker rather
than six duplicated browser harnesses where possible.

## 12. Expected implementation files

Narrow expected authored scope:

```text
dev-src/runtime-sections/runtime-main.js
src/SwarmSim-Strategy-Autobuyer.user.js
scripts/check-book00-m6-six-domain-coordinator.js
scripts/check-6.0.0-version-surfaces.js
package.json
package-lock.json
README.md
docs/process/HISTORY.md
docs/strategy/BOOK00_CURRENT_STATUS.md
docs/release-notes/SwarmSim-Strategy-Autobuyer-6.0.0-release-notes.md
```

The canonical userscript is build output from the configured runtime source.
Update the foundation, prompt, or manifest only for an evidence-backed contract
correction.

Do not edit unrelated UI artwork, strategy thresholds, game formulas,
Laboratory behavior, historical evidence, or old release notes.

## 13. Version and verification

M6 starts at `6.0.0`. Add a `6.0.0` version-surface checker and make
`npm run verify` call it while preserving all relevant M2–M5 and UI checks.

Minimum intermediate checks:

```bash
npm run build
node scripts/validate-repo-guardrails.js
npm run check:book00:m6:six-domain
npm run verify
git diff --check
```

Formal acceptance follows `docs/process/GIT_VERIFICATION_PROTOCOL.md`:

1. finish authored runtime, verifier, fixture, version, and release-note work;
2. commit and push the implementation;
3. record full implementation SHA and tree SHA;
4. verify that exact clean SHA;
5. stop on any unexpected source/configuration change;
6. write only predeclared M6 evidence;
7. commit and push evidence separately;
8. report completion only from synchronized clean Git state.

Expected formal evidence path:

```text
docs/test-data/6.0.0-book00-m6-six-domain/verification-<short-sha>.md
```

## 14. Hard stop conditions

Stop rather than guess when:

- a local lane/advisor score is being used as a cross-domain value;
- milestone, target, horizon, snapshot, or cycle identity differs;
- missing data would need to become zero;
- a duplicate causal effect would be counted twice;
- a candidate requires an unsupported conversion or Swarmwarp model;
- an advisor-only winner could gain authority or silently fall through to a
  lower-ranked purchase;
- execution identity, amount, fingerprint, budget, or revalidation differs;
- a stale decision could authorize another action;
- Decimal values are collapsed into unsafe ranking arithmetic;
- fixtures inject expected winners;
- verification changes implementation/verifier/package/configuration files;
- another workstream overlaps required files in a dirty worktree.

## 15. M6 completion checklist

- [ ] Exactly six canonical domains emit `strategic-domain-outcome.v1`.
- [ ] All outcomes share one immutable decision identity.
- [ ] Global ranking uses a real shared milestone outcome, never local scores.
- [ ] Blocked and unranked alternatives remain visible.
- [ ] Hard safety is independent from ranking.
- [ ] M4/M5 advisors remain advisor-only even when globally selected.
- [ ] Advisor winners cannot silently fall through to a purchase.
- [ ] Existing bounded purchase authority is reused without new execution keys.
- [ ] Purchase identity and amount are revalidated immediately before execution.
- [ ] Cross-domain causal effects cannot be double counted.
- [ ] One decision authorizes at most one main action.
- [ ] Council, Inspector, exports, and API expose one coherent result.
- [ ] Coverage reports mechanics and assertions, not inferred labels.
- [ ] Input/live-state non-mutation is proven.
- [ ] Hard defaults and Laboratory contract remain unchanged.
- [ ] Version surfaces consistently report `6.0.0`.
- [ ] Focused and full exact-SHA verification pass with separate evidence.
