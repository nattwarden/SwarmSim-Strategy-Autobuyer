# Copilot Work Order — Implement BOOK-00 M6 Six-Domain Strategic Coordinator

Implement the complete Milestone 6 product slice as release `6.0.0`. Continue
until implementation, focused acceptance, full exact-SHA verification, pushed
implementation provenance, and a separate pushed evidence commit are complete
on the authorized M6 branch.

Do not merge or push to `main` unless the user explicitly authorizes main
integration after branch acceptance.

## 1. Start from Git truth

Create or use an isolated worktree and branch:

```text
branch: codex/m6-six-domain-coordinator
base: origin/main containing M5 integration evidence af6a41b9534b6ff682a2903d938fa17686a3a9d2
suggested worktree: C:\Users\info\OneDrive\Dokument\SwarmSim-m6-six-domain-coordinator
```

Run before editing:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git log -8 --oneline --decorate
```

Requirements:

- start from a clean checkout containing `af6a41b9534b6ff682a2903d938fa17686a3a9d2`;
- preserve unrelated work;
- do not share a dirty worktree with another agent;
- never reset, rewrite history, or force-push;
- stop if required files overlap another uncommitted workstream.

## 2. Mandatory reading order

Read completely before editing:

1. `AGENTS.md`
2. `AI.md`
3. `docs/strategy/BOOK00_CURRENT_STATUS.md`
4. `docs/BOOK-00-vision-goals-and-dreams.md`
5. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`, especially M6
6. `docs/SWARMSIM_GAME_MODEL.md`
7. `scripts/canonical-build.config.json`
8. `docs/process/GIT_VERIFICATION_PROTOCOL.md`
9. `docs/strategy/BOOK00_M6_SIX_DOMAIN_COORDINATOR_FOUNDATION.md`
10. `docs/test-data/6.0.0-book00-m6-six-domain/m6-domain-contract-manifest.json`
11. `docs/strategy/BOOK00_M5_ASCENSION_MUTAGEN_FOUNDATION.md`
12. `docs/release-notes/SwarmSim-Strategy-Autobuyer-4.0.0-release-notes.md`
13. `docs/release-notes/SwarmSim-Strategy-Autobuyer-5.0.0-release-notes.md`
14. relevant runtime functions and verifiers listed below
15. `package.json`

Search by symbol, not historical line number. At minimum inspect:

```text
evaluatePurchaseCandidate
buildWholeEconomyShadowPreview
buildUnifiedPurchaseEvaluator
buildWholeEconomyExecutionDecisionV1
applyWholeEconomyExecutionRevalidationV1
executeUnifiedPurchaseWinner
evaluateEnergyAbilityTimingSnapshot
evaluateAscensionMutagenSnapshot
captureAscensionMutagenSnapshot
buildStrategyInspector
buildCouncilViewModel
window.kbcSwarmBot
```

Also read the focused M2–M5 checkers. Do not infer production behavior from
scenario names.

## 3. Work package contract

```text
Product capability:
One strategic coordinator compares all six BOOK-00 domains from one decision
identity and explains the best allowed comparable action.

Player-visible change:
Council/Inspector show one active milestone, winner, important alternatives,
outcomes, blockers, confidence, reconsideration trigger, and authority state.

Domains included:
Meat, Larva/Engine, Army/Territory, Energy production, Energy abilities,
Ascension/Mutagen.

Domains explicitly excluded:
No seventh domain; Swarmwarp remains unsupported; unsupported mutation
portfolio effects remain unranked; no new ability, Ascension, or Mutagen
execution.

Current milestone and horizons:
M6 / 6.0.0. Use one explicit active milestone and versioned short/medium/long
horizons, with one selected comparison horizon per decision.

Authority:
Global recommendation plus existing bounded reversible purchase execution only.
Abilities, Ascension, Mutagen, WAIT, and uncertainty are advisor/no-action.

Hard safety boundaries:
All AGENTS.md defaults and gates; no new execution key or irreversible command.

Focused acceptance:
The twelve grouped states in the M6 foundation.

Expected files:
Runtime/build output, focused/version checkers, package versions/scripts,
README/history/status/release notes, and separate formal evidence.

Evidence generator:
Only the final authored provenance report after exact-SHA checks.

Evidence allowlist:
docs/test-data/6.0.0-book00-m6-six-domain/verification-<short-sha>.md

Stop condition:
All six domains share one contract; rank uses real shared outcomes; advisor
authority cannot leak; exact reversible execution remains matched/revalidated;
focused/full exact-SHA checks and separate pushed evidence pass.
```

## 4. Product objective

Release `6.0.0` with:

- exactly six canonical domain outcomes;
- one immutable snapshot/cycle/milestone/target/horizon identity;
- one global recommendation;
- honest comparable ranking with explicit unranked states;
- hard safety independent from economic value;
- effect-ledger protection against double counting;
- existing bounded reversible execution only when the global winner exactly
  matches the revalidated purchase candidate;
- no lower-ranked purchase fallback when an advisor-only action wins;
- coherent Council, Inspector, export, and diagnostic API output;
- mechanic-based automated coverage.

Player-facing sentence:

> The bot now coordinates Meat, Larva, Territory, Energy, abilities, and
> Ascension as one economy and explains the best next strategic move.

## 5. Required schemas

Implement the foundation contracts exactly:

```text
strategic-domain-outcome.v1
strategic-effect.v1
six-domain-strategic-coordinator.v1
```

Use exactly these domain ids:

```text
MEAT
LARVA_ENGINE
ARMY_TERRITORY
ENERGY_PRODUCTION
ENERGY_ABILITIES
ASCENSION_MUTAGEN
```

Every domain outcome must carry the shared decision identity. Missing adapters
emit explicit `UNSUPPORTED` outcomes; they do not disappear.

Implement a pure plain-data evaluator plus a read-only live adapter. Suggested
functions:

```text
captureSixDomainDecisionSnapshot(game, strategyContext)
adaptPurchaseDomainOutcome(domainId, purchaseRow, sharedContext)
adaptAbilityDomainOutcome(abilityAdvisor, sharedContext)
adaptAscensionDomainOutcome(ascensionAdvisor, sharedContext)
auditStrategicEffects(domainOutcome)
evaluateSixDomainStrategicCoordinator(snapshot)
buildSixDomainExecutionPlan(result, purchaseProposalState)
applySixDomainExecutionRevalidation(plan, freshProposalState, freshCycle)
```

Names may differ if existing style requires it, but separation of pure
evaluation, live capture, authority, and execution revalidation is mandatory.

## 6. Shared identity and non-mutation

Capture all six domain inputs before the first main action. Bind M4 and M5
adapters to the same M6:

```text
snapshotId
snapshotHash/state fingerprint
decisionCycleId
activeMilestone
activeTarget
horizonId/horizonSeconds
scriptVersion
evaluation revision
```

Deep-clone/freeze evaluator input. Prove input non-mutation. The evaluator and
diagnostic API may not read commands or mutate game/session/config state.

After a successful main purchase, the next action requires a newly captured
snapshot and a different decision cycle id.

## 7. Comparability and ranking

Do not sort raw local scores across domains.

Allowed comparison basis order:

1. same-milestone `milestoneEtaImprovementSeconds` at the same horizon;
2. identical-unit `projectedMilestoneProgressDelta` with the same basis;
3. another explicitly versioned source-/runtime-derived common value accepted
   by the focused checker.

Local purchase `economicScore`, M4 ability `score`, lane priority, urgency, and
scenario labels are diagnostics only.

Missing or incompatible metrics produce:

```text
comparability.status = UNRANKED
missingConversions = [specific dependency]
```

Missing is never zero. If no allowed comparable action exists, recommend
`UNCERTAIN` / `WAIT`, set authority false, and name what evidence would change
the decision.

Use confidence as a gate or exact-tie breaker, not a substitute for economic
value. Preserve Decimal strings for economic quantities; use Number only for
bounded presentation after exact data is retained.

## 8. Safety and authority

Preserve all hard defaults, including:

```text
autoCastAbilities = false
autoAscend = false
energySupportBrokerAllowAutoCast = false
Nexus and Energy protection enabled
no Clone Larvae or House of Mirrors default cast
no Nightbug/Bat auto-buy
no blind Smart buyMax
Laboratory gated, manual, read-only, simulation-only
```

Safety is evaluated before rank and never converted into a score penalty.

Allowed execution keys remain exactly:

```text
meat
engine
territory
energy
```

Energy execution remains limited to the accepted current Nexus target or
bounded Lepidoptera production. No new adapter may cast an ability, ascend, or
spend/allocate Mutagen.

Do not delete or broaden legacy explicit opt-in paths outside the M6 advisor.

## 9. Decision and execution consistency

Only a global winner with authority class `BOUNDED_REVERSIBLE` can proceed.
Require exact agreement with existing purchase-coordinator output and immediate
fresh proposal revalidation:

```text
domain/lane
candidate
execution key/id/kind/variant
bounded amount
target
fingerprint
action budget
confidence/evidence gates
Nexus gate when Energy
```

Any mismatch, drift, new blocker, stale cycle, or budget change denies
execution. Never execute a runner-up.

If Energy abilities, Ascension/Mutagen, WAIT, or uncertainty wins:

- authority is false;
- no irreversible command runs;
- no lower-ranked purchase silently runs as the first main action;
- the result says whether player action or new evidence is awaited.

One global decision authorizes at most one main action. Recapture and re-evaluate
before a second main action.

## 10. Effect ledger and double-count audit

Implement `strategic-effect.v1`. Require unique effect ids and causal roles:

```text
DIRECT
INTERMEDIATE
FINAL
OPPORTUNITY_COST
```

Only one final representation of a causal benefit contributes to ranking.
Intermediate and diagnostic effects remain visible with
`includedInRanking: false` when their final downstream effect is included.

Duplicate included ids, cycles, incompatible units, or multiple included final
effects for one causal chain make the candidate unranked and remove authority.

Do not double-count Territory production plus Expansion ETA, Energy production
plus the same ability gain, or Mutagen effect plus the same modeled next-run
benefit.

## 11. Domain adapters

### Four purchase domains

Adapt existing `whole-economy-outcome.v2` rows. Do not rewrite lane planners or
change thresholds. Retain existing diagnostics and fingerprints. Do not treat
`economicScore` as the M6 shared value.

### Energy abilities

Use M4 output. WAIT is explicit; Swarmwarp remains unsupported. Abilities are
always advisor-only. Rank globally only when the active milestone conversion is
real and aligned; otherwise show it as unranked with the missing conversion.

### Ascension/Mutagen

Use M5 output. Missing recovery remains unranked/uncertain. `ASCEND_NOW` and
Mutagen allocations are always advisor-only. Preserve `KEEP_UNALLOCATED`,
Hatchery-only direct ranking, and all unsupported mutation labels.

## 12. Observability and API

Expose the structured result and all minimum flat fields from the foundation in:

- current Council strategy view;
- Strategy Inspector;
- JSON export;
- Markdown export;
- public diagnostic API.

Add:

```js
window.kbcSwarmBot.strategicCoordinator = {
  schemaVersion,
  evaluate(snapshot),
  getCurrent(),
  domainManifest(),
  coverage()
}
```

No execution method is allowed. Do not redesign Council artwork; bind the
minimum coherent M6 data into the existing UI structure and keep UI2 checks
green.

## 13. Mechanic-based coverage

Use the authored M6 manifest as the required mechanic list. The focused checker
must mark coverage from actual passed assertions against production contracts.
It must not derive coverage from filenames, scenario ids, titles, or labels.

Each coverage row includes:

```text
mechanicId
domainId
productionContract
invariantId
assertionId
status
evidenceBasis
```

Fail when a required mechanic is `FAIL` or `NOT_COVERED`.

## 14. Focused acceptance

Create:

```text
scripts/check-book00-m6-six-domain-coordinator.js
npm script: check:book00:m6:six-domain
```

Cover all twelve grouped states from the foundation. Use a data-driven winner
matrix where possible. At minimum assert:

- exactly six domain ids and one decision identity;
- each domain can honestly win a synthetic shared-outcome state;
- ability and Ascension winners never execute or fall through;
- WAIT/UNCERTAIN and unsupported Swarmwarp remain safe;
- a higher-value hard-blocked candidate cannot win;
- incompatible/missing metrics remain unranked;
- duplicate causal effects are rejected;
- shared costs are reported once;
- a reversible winner executes only after exact revalidation;
- fingerprint/cycle drift denies authority;
- one cycle cannot authorize two main actions;
- evaluator input and live state remain unchanged;
- Council/Inspector/export/API and mechanic coverage are present;
- M2–M5, UI, Laboratory, and safe-default regression remains green.

Fixtures provide input mechanics and observations, never an expected winner.
Do not modify expectations after observing output.

## 15. Version `6.0.0`

Update together:

- userscript metadata;
- runtime `SCRIPT_VERSION` and scenario/report version surfaces;
- `package.json` and root `package-lock.json`;
- README current version/capability;
- `docs/process/HISTORY.md`;
- `docs/strategy/BOOK00_CURRENT_STATUS.md`;
- new `docs/release-notes/SwarmSim-Strategy-Autobuyer-6.0.0-release-notes.md`;
- new `scripts/check-6.0.0-version-surfaces.js`;
- `npm run verify` to call the 6.0.0 and M6 checkers.

Do not relabel historical evidence or releases.

## 16. Expected authored scope

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

Update the M6 foundation/manifest/prompt only to correct an implementation
ambiguity with evidence. Do not alter unrelated UI artwork, thresholds,
formulas, Laboratory behavior, previous release notes, or historical evidence.

## 17. Build and intermediate checks

Use `apply_patch`. Build through the configured pipeline:

```bash
npm run build
node scripts/validate-repo-guardrails.js
npm run check:book00:m6:six-domain
npm run verify
git diff --check
```

Inspect command source before classifying it. Do not retain routine temporary
browser output. Reuse ignored dependencies if needed; do not change manifests
merely to expose an already installed Playwright runtime.

## 18. Git and exact-SHA evidence

Follow `docs/process/GIT_VERIFICATION_PROTOCOL.md` exactly:

1. Finish authored implementation, verifier, fixtures, versions, and docs.
2. Run intermediate checks.
3. Commit and push one scoped M6 implementation commit to the M6 branch.
4. Record the full implementation SHA and tree SHA.
5. Verify the exact clean implementation SHA in the correct verification mode.
6. Classify all commands and declare evidence allowlists before running.
7. Run the full required suite; stop on unexpected tracked changes.
8. Write only:

   `docs/test-data/6.0.0-book00-m6-six-domain/verification-<short-sha>.md`

9. Commit only evidence separately and push.
10. Report branch completion only when synchronized and clean.

Evidence must include implementation/tree/evidence SHAs, exact commands and
exit codes, Node/npm versions, evidence paths, coverage summary, player-visible
change, narrow scope, safety preserved, exclusions, remote synchronization, and
working-tree status.

Do not claim main integration unless it separately occurred and the final main
state is clean and synchronized.

## 19. Stop conditions

Stop rather than guess when:

- cross-domain ranking depends on a local score or incompatible unit;
- one of the six outcomes has a different snapshot/cycle/context;
- a missing metric would need to become zero;
- an effect could be counted twice;
- ability value requires unsupported Swarmwarp modeling;
- Ascension requires missing recovery evidence;
- an advisor winner could execute or silently fall through;
- reversible identity/revalidation/cycle differs;
- a stale decision could authorize another action;
- Decimal precision is lost;
- a fixture forces the expected decision;
- a required UI/runtime file overlaps unrelated dirt;
- verification writes outside the declared evidence allowlist.

## 20. Definition of done

M6 is complete on the authorized branch only when `6.0.0` exposes one coherent
six-domain result, all domains share one immutable identity, global rank uses a
real common outcome, missing conversions remain explicit, hard safety is
independent, advisor authority cannot leak, bounded reversible execution
remains exact and revalidated, double counting is audited, decision cycles stay
consistent, player-facing surfaces and mechanic coverage are complete, focused
and full checks pass on the exact implementation SHA, separate evidence is
pushed, and the branch is clean and synchronized.
