# SwarmSim Strategy Autobuyer - Repo Guard

## Role

This is the mandatory repository and process guard for AI coding agents working in this repository.

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

The Laboratory contract is:

```text
docs/laboratory/SWARMSIM_LABORATORY_PHASE_1.md
```

Release history is tracked through Git commits, tags, `docs/HISTORY.md`, and `docs/release-notes/`.

Empirical evidence belongs under `docs/live-logs/` and versioned `docs/test-data/` paths.

## Required reading order

Before changing code, read:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `scripts/canonical-build.config.json`
5. `docs/GIT_VERIFICATION_PROTOCOL.md`
6. relevant `docs/prompts/`
7. relevant `docs/release-notes/`
8. relevant `docs/live-logs/` and `docs/test-data/`
9. `dev-src/runtime-sections/runtime-main.js`
10. `src/SwarmSim-Strategy-Autobuyer.user.js`
11. relevant verifier scripts and `package.json`
12. `reference/` only when needed for sanity checks

For modularization tasks, also read `docs/MODULARIZATION_PLAN.md` and relevant `dev-src/` modules.

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
- no Clone Larvae auto-cast by default
- no House of Mirrors auto-cast by default
- no Nightbug/Bat auto-buy by default
- Nexus and Energy protection remain enabled
- default Smart planners do not use blind aggressive buyMax behavior
- Laboratory remains gated, manually triggered, read-only, and simulation-only

These are hard boundaries, not a directive to under-optimize reversible normal purchases.

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
docs/GIT_VERIFICATION_PROTOCOL.md
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