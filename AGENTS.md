# SwarmSim Strategy Autobuyer - Repo Guard

## Role

This is the mandatory repository and process guard for AI coding agents working in this repository.

This file is the sole AI steering authority for this repository.

Its job is to:

- start from the correct Git source of truth
- preserve repository structure
- keep fixes narrow
- protect hard safety defaults
- separate implementation from verification evidence
- make every final claim reconstructable from Git history
- avoid duplicate or stale artifacts

## Canonical source map

The only executable Tampermonkey userscript is:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

The configured runtime assembly source is:

```text
dev-src/runtime-sections/runtime-main.js
```

Inspect this before editing:

```text
scripts/canonical-build.config.json
```

The active game and strategy model is:

```text
docs/SWARMSIM_GAME_MODEL.md
```

The strategic product north star is:

```text
docs/BOOK-00-vision-goals-and-dreams.md
```

The Laboratory contract is:

```text
docs/strategy/SWARMSIM_LABORATORY_PHASE_1.md
```

Release history is tracked through Git commits, tags, `docs/process/HISTORY.md`, and `docs/release-notes/`.

Empirical evidence belongs under `docs/live-logs/` and versioned `docs/test-data/` paths.

The active status board and the currently selected work order are linked from
`docs/strategy/BOOK00_CURRENT_STATUS.md`. Audit review notes in
`docs/strategy/` are timestamped evidence about one audited commit and are not
automatically current runtime truth.

## Required reading order

Before changing code, read:

1. `AGENTS.md`
2. `docs/strategy/BOOK00_CURRENT_STATUS.md`
3. `docs/BOOK-00-vision-goals-and-dreams.md` for strategy, architecture, or roadmap work
4. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` for product milestone work
5. `docs/SWARMSIM_GAME_MODEL.md`
6. `scripts/canonical-build.config.json`
7. `docs/process/GIT_VERIFICATION_PROTOCOL.md`
8. relevant `docs/prompts/`
9. relevant `docs/release-notes/`
10. relevant `docs/live-logs/` and `docs/test-data/`
11. `dev-src/runtime-sections/runtime-main.js`
12. `src/SwarmSim-Strategy-Autobuyer.user.js`
13. relevant verifier scripts and `package.json`
14. `reference/` only when needed for sanity checks

`AI.md` has been merged into this file and deleted; every unique rule it carried now lives here. Historical prompts and release notes referencing it describe the repository as it was at their timestamps. For mechanics claims, also read the relevant evidence book in `docs/BOOK-01` through `docs/BOOK-07`.

For modularization tasks, also read `docs/process/MODULARIZATION_PLAN.md` and relevant `dev-src/` modules.

Search by function, constant, schema, and test name. Do not rely on line numbers from an older commit.

Do not use old dated game-model files, uploaded scripts, stale reports, or indexed AI snapshots as current truth.

## Optimization posture

The project posture is methodical optimization, not passive caution.

The bot should be logical, evidence-based, and transparent. It should optimize normal reversible progression when the math and selected user mode support action.

Hard safety defaults block irreversible or high-risk automation. They are not permission to make ordinary progression timid.

User-facing modes:

- Advisor Mode: explain opportunities, risks, and timing for manual play.
- Methodical Optimizer: default Smart behavior; goal-driven, rebuild/payback aware, and willing to act when evidence supports it.
- Higher-tempo modes: explicit future or user-selected behavior only, still observable and still bounded by hard safety rules.

## Hard safety defaults

These must not change unless explicitly requested:

- `autoCastAbilities` defaults to false
- `autoAscend` defaults to false
- `energySupportBrokerAllowAutoCast` defaults to false
- `autoCastCloneLarvae` defaults to true (explicit, user-authorized exception,
  see below) - every other ability stays advisor-only
- no House of Mirrors auto-cast by default
- no Nightbug/Bat auto-buy by default
- Nexus and Energy protection remain enabled
- default Smart planners do not use blind aggressive buyMax behavior
- Laboratory remains gated, manually triggered, read-only, and simulation-only

### Narrow exception: Clone Ramp (Clone Larvae only)

`autoCastCloneLarvae` (default `true`) is the one deliberate, user-requested
exception to "no ability auto-cast by default." It only ever runs through the
bounded Clone Ramp planner (`runCloneRampPlanner`/`executeCloneRampGuardAction`
in `dev-src/runtime-sections/runtime-main.js`), which:

- casts Clone Larvae at most once per `runOnce()` cycle, through the same
  `buyUpgradeAmount(..., newDecimal(1), ...)` command path used for every other
  single ability/upgrade purchase;
- reads the ability's own real, live `bank()`/`cap()` (not a synthetic
  formula) before every decision, and never casts if that would violate the
  Nexus/Energy reserve or if the ability is not visible/buyable;
- banks the cast's own output into cocoons with an exact, bounded amount
  (never `buyMax`), leaving any pre-existing larva untouched;
- performs exactly one "full cap" cast once bank reaches
  `CLONE_RAMP_FULL_CAP_THRESHOLD_PERCENT` (99.9%) of cap, then releases the
  action budget back to normal Meat progression until bank drops below that
  threshold again.

House of Mirrors, rush abilities, Swarmwarp, Ascension, and Mutagen remain
fully advisor-only regardless of this flag; `autoCastAbilities` still
gates every ability except this one narrow case. Do not widen this exception
to any other ability without an equally explicit, separate user request.

These are hard boundaries, not a directive to under-optimize reversible normal purchases.

The full numeric contract (verified against `DEFAULT_CONFIG` in
`dev-src/runtime-sections/runtime-main.js`, 2026-07-18; the runtime is the
source of truth if they ever diverge — fix the divergence, do not guess):

```js
autoCastAbilities: false
autoCastCloneLarvae: true
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
smartUnitBuyPercent: 0.35
meatChainReserveMultiplier: 1.25
meatChainMaxPaybackSeconds: 3600
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

## Repository hygiene

Do not create:

- `.txt` mirrors of the userscript
- duplicate executable `.user.js` files
- duplicate release-note trees
- byte-identical userscript copies outside `src/`

Development scaffolding may live under `dev-src/`, but it is non-executable and must not become an uncontrolled duplicate of the canonical userscript.

Dependency and transient directories must not pollute Git status. At minimum, `node_modules/` must remain ignored.

Do not force-push or rewrite history.

## Narrow-change rule

For every patch:

- fix only the named issue
- do not add unrelated strategy
- do not widen automation unless explicitly requested
- do not change safety thresholds unless explicitly requested
- avoid unrelated refactors
- update observability when behavior changes
- preserve Decimal precision
- preserve deterministic hashes and non-mutation guarantees where applicable
- keep scenario and test fixtures honest
- never rewrite expectations merely to force a pass

## Lane adapter boundaries

For lane runtime work, use the extracted adapter boundaries in the canonical
userscript and keep behavior parity unless explicitly changing strategy:

- territory/army execution: `executeTerritoryGuardAction(...)`
- territory/army proposals: `buildTerritoryGuardProposal(...)`
- meat execution: `executeMeatGuardAction(...)`
- engine execution: `executeEngineGuardAction(...)`
- energy execution: `executeEnergyGuardAction(...)`
- clone execution: `executeCloneGuardAction(...)`

Use `dev-src/contracts/lane-proposal.js` for lane module boundaries when
modularizing; extract one lane at a time with Inspector/export observability
parity.

## Strategy research fast path

Keep browser-game research lightweight:

1. Use Laboratory to compare counterfactual actions from one read-only
   snapshot, and Strategy Audit to test actual behavior across staged states.
2. Run many SA1 cases locally with `npm run strategy:audit:matrix:sa1`; use
   `:single` for smoke and `:isolated` only to confirm an important finding.
3. Require `resetVerified=true` and `stateLeakageDetected=false`; read
   generated artifacts as a batch.
4. Reproduce a finding before proposing a narrow production change; keep
   Laboratory findings advisory until separately verified, and never widen
   automation or safety defaults merely because one experiment looks
   favorable.

For narrow deterministic scenario-transition issues: classify the root cause
layer (harness/definition/reporting versus production planner) before coding;
keep scenario expectations observing real planner outputs (no injected
decision overrides); make between-cycle transitions explicit input-state
overrides only; require cycle-level observability (decision, applied marker,
fresh snapshot/revision) and a targeted versioned check.

## Browser verification fact capture

When a browser verification pass discovers new, undocumented game-mechanics
data, write a concise factual note to the relevant evidence book in the same
work cycle: facts first, version-scoped, with reproducible evidence. If the
claim already exists, append a dated update instead of a new file.

## Version markers and guardrail compatibility

When bumping versions, update together: `package.json` and
`package-lock.json` (root + `packages[""]`), the userscript `// @version`
metadata, the runtime constants (`AUTOBUYER_VERSION`, from which
`SCRIPT_VERSION` and `SCENARIO_REPORT_VERSION` derive) in both
`dev-src/runtime-sections/runtime-main.js` and the built userscript, the
browser badge/version text, and scenario report templates for the new
version. `npm run check:version:surfaces` verifies these mechanically from
`package.json`. Do not create a new per-version
`check-X.Y.Z-version-surfaces.js` script — that pattern is retired; the old
numbered scripts are historical artifacts only.

Keep at least one explicit literal `scriptVersion: "<version>"` in the
canonical userscript export payload while
`scripts/validate-repo-guardrails.js` checks for string-literal matches; do
not replace all payload literals with constant references unless the
guardrail matcher is updated in the same narrow change.

## Git workflow

Use the repository workflow explicitly authorized by the user for the current task.

When the user authorizes direct work on `main`:

- synchronize first
- keep commits small and scoped
- push completed implementation work normally
- never force-push

When a branch or PR workflow is requested, follow that workflow instead.

Do not invent branch, push, HEAD, origin/main, or working-tree status. Read it from Git.

## Mandatory implementation, verification, and evidence separation

Every formal code/version verification must follow:

```text
docs/process/GIT_VERIFICATION_PROTOCOL.md
```

This is a hard gate, not optional guidance.

The required sequence is:

1. complete authored implementation, test, verifier, fixture, version, and release-note changes
2. commit and push the implementation
3. record the exact full implementation SHA and tree SHA
4. re-synchronize to that exact SHA with a clean working tree
5. classify every command as either a pure check or an evidence generator
6. run the complete required suite against the exact implementation SHA
7. allow dirty state only in predeclared generated-evidence paths
8. stop on any unexpected code, verifier, fixture, package, or configuration change
9. after the full suite passes, commit only generated evidence in a separate evidence commit
10. push evidence
11. report completion only when `HEAD == origin/main` and the working tree is clean

A command named `verify` is not assumed to be read-only. Inspect what it writes before running it.

Expected generated evidence changes, including timestamps, normalized drift, snapshot hashes, experiment hashes, Markdown, CSV, JSON, and Copy Summary files, are allowed only when:

- the command was declared an evidence generator
- the exact paths were allowlisted before execution
- no implementation or verifier source changed
- the entire suite passed
- the evidence records the exact implementation SHA
- the outputs are committed separately after verification

Do not stop merely because an evidence generator changed its declared evidence files. Do stop for any change outside the allowlist.

Do not create a final verdict from:

- a dirty implementation tree
- an unpushed implementation commit
- tests run before the implementation commit existed
- tests whose exact SHA is unknown
- a partial verification suite
- implementation and final evidence mixed in one commit

Intermediate status is allowed, but it must be labeled intermediate and must not use formal acceptance language.

## Validation

Always run the checks required by the active work order, `package.json`, and changed subsystem.

At minimum:

```bash
node scripts/validate-repo-guardrails.js
npm run build
npm run verify
git diff --check
```

Also run every relevant versioned verifier.

If an urgent direct edit is made in `src/SwarmSim-Strategy-Autobuyer.user.js`, immediately synchronize and validate through the configured build pipeline:

```bash
npm run hotfix:canonical
```

Equivalent explicit steps include:

```bash
npm run sync:from-canonical
npm run build
npm run verify
```

For formal verification, determine before execution whether each command is a pure check or an evidence generator. Follow the exact-SHA protocol rather than assuming all commands leave the tree clean.

## Release verification hard gates

For any formal version verification:

- fail fast unless all required version surfaces match the target version
- scenario reports must include non-empty cycles for every executed scenario
- multi-cycle acceptance scenarios must include required transition trace fields
- it is forbidden to edit expectations after execution to force a pass
- generated evidence must identify the exact implementation SHA
- final evidence must be in a separate commit after the implementation commit
- final verdict must be downgraded when any hard gate fails

A final report must include:

- implementation SHA
- evidence SHA
- exact commands and exit codes
- evidence paths
- `HEAD`
- `origin/main`
- working-tree status
- what changed
- why the change is narrow
- safety preserved
- what was intentionally not changed

## Browser and live-log caution

When changing behavior from live logs, inspect at minimum:

- script version
- decision/main/side
- best allowed and rejected actions
- active action unit
- unlock candidate and reason
- clone buffer state
- ability preparation reason
- purchase log
- config summary
- live-state non-mutation proof when Laboratory is involved

Known recurring bug patterns include:

- clone buffer reports recovery while a hard lock remains
- BUILDUP makes spendable larvae zero
- unlock candidate uses a final target instead of the current action unit
- target/source moves every tick and causes endless chasing
- config and lane reasons disagree
- lower filler is bought under the active meat action unit
- scenario/UI identity is confused with canonical runtime identity
- generated evidence is mistaken for implementation source
- verification is reported from a dirty or unpushed tree

## Core principle

Make the smallest correct fix, preserve hard safety defaults, improve observability, and keep Git history sufficient for the next agent to reconstruct exactly what was implemented, what SHA was tested, what evidence was generated, and what is currently on `origin/main`.
