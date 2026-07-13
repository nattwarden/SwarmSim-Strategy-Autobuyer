# BOOK-00 Current Execution Status

Status: Active handoff board. Update this file at every completed work package,
blocked handoff, milestone transition, and accepted verification result.

Last reviewed: 2026-07-13

## Read this first

A new implementation agent should read, in order:

1. `AGENTS.md`
2. `AI.md`
3. this file
4. `docs/BOOK-00-vision-goals-and-dreams.md`
5. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`
6. `docs/SWARMSIM_GAME_MODEL.md`
7. only the files named under **Current work package** below

Do not start by reading every historical audit or release note. Follow the
current work package and open evidence only when that package requires it.

## Git truth gate

The values below are an observed handoff snapshot, not permission to trust
stale Git state. Every agent must run:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git log -8 --oneline --decorate
```

Observed when this board was created:

- verified 0.13.0 implementation commit: `3896ad5`
- verified 0.13.0 evidence commit / `origin/main`: `bcd1910`
- current feature workspace HEAD: `d4a9db8`
- current feature branch: `feature/strategy-audit-testbed-runners`
- working tree: dirty because BOOK-00/runbook work and separate preliminary
  Strategy Intelligence automation work are both present

If observed Git state differs, update this board before implementation.

## Product north star

> Select or recommend the allowed action that gives the best total progression
> toward the next strategic milestone, over the relevant horizon, after
> rebuild, opportunity cost, protected resources, risk, and whole-economy
> effects are considered.

## Active milestone

**Milestone 0 — Stabilize the launchpad**

This is the one allowed infrastructure-first milestone. It must finish once and
must not expand into more general test-platform work.

Player-visible delta for the following milestone:

> The bot previews why Meat, Larva, or Territory is the best investment for the
> current milestone instead of showing only unrelated lane scores.

Milestone 0 exists only to make that product slice safe to begin.

## Milestone 0 checklist

- [x] Define the BOOK-00 product vision and six strategic questions.
- [x] Save the whole-economy dependency diagram.
- [x] Create the product delivery runbook and anti-stagnation rules.
- [x] Make BOOK-00 and the runbook discoverable in repository reading order.
- [ ] Separate BOOK-00/runbook documentation from Copilot's automation changes.
- [ ] Resolve which feature-branch commits should move onto current `main`.
- [ ] Make the supported Strategy Intelligence automation path complete
      successfully, or reduce it to an honest passing subset.
- [ ] Remove fixed `sweep150` as a prerequisite for supported-core/v2; retain it
      only as optional stress research or replace it with bounded adaptive
      coarse-to-fine breakpoint search.
- [ ] Ensure failed or partial audit results cannot be reported as passing
      coverage.
- [ ] Replace coverage inferred from scenario names with coverage recorded from
      actual mutations, proposals, mechanics, and invariants, or explicitly
      defer this to a later non-blocking improvement.
- [ ] Correct stale current-version statements needed by the next work package.
- [ ] Leave a clean reproducible baseline with implementation and generated
      evidence separated.
- [ ] Close Milestone 0 and activate Milestone 1.

## Current work package

Product capability:

- Clean, truthful launchpad for the first whole-economy comparison slice.

Player-visible change:

- None in Milestone 0. This is the single explicitly capped foundation
  exception. The next work package must be player-visible Milestone 1 work.

Included:

- Git/worktree separation;
- BOOK-00 and delivery documentation;
- correctness of the current automation summary;
- minimum supported automation command;
- current-version documentation required for truthful handoff.

Explicitly excluded:

- production strategy changes;
- lane score tuning;
- new Territory sweeps;
- new Laboratory formulas;
- version bump;
- widening auto-cast or auto-ascend behavior;
- a comprehensive rewrite of the test platform.

Authority:

- documentation and test infrastructure only;
- no runtime execution-authority change.

Expected changed areas:

- `docs/BOOK-00-vision-goals-and-dreams.md`
- `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`
- this status board
- reading-order/index documentation
- separately owned Strategy Intelligence automation files
- generated evidence only in predeclared paths and never mixed with authored
  implementation

Stop condition:

- one clean baseline exists;
- the supported automation command reports truthfully and completes;
- Milestone 1 can begin without more infrastructure work.

## Immediate next actions

Execute these in order:

1. Stop simultaneous editing in the shared working tree.
2. Preserve the current dirty work safely without deleting or restoring another
   agent's changes.
3. Split documentation, authored automation, and generated evidence into
   separate reviewable scopes.
4. Review the preliminary automation against its actual outputs.
5. Fix only the blockers that prevent one honest supported automation run.
6. Ensure breakpoint research can stop adaptively without requiring sweep150.
7. Complete the Milestone 0 checklist.
8. Start Milestone 1 immediately.

## Known current blockers and cautions

- The latest observed Strategy Intelligence automation run reported
  `allPassed: false`; `sa1-v2` could not find complete sweep representatives.
- The preliminary coverage manifest reported reset/leakage failure and included
  one incomplete result. It is not formal acceptance evidence.
- The preliminary property sweep tests simplified helper mathematics rather
  than the complete production economic model. It must not be described as
  proof of whole-economy correctness.
- Current runtime and package surfaces are 0.13.0, while some books and roadmap
  text still describe 0.12.3 or 0.12.4 as current.
- The Unified Purchase Evaluator reports shadow/no execution authority in one
  surface while its winner is used by the first-action execution wrapper. That
  issue belongs to Milestone 2 unless it blocks truthful Milestone 1 shadow
  reporting.

## Do not do next

- Do not start another broad ranking or Territory sweep.
- Do not tune lane weights before the shared outcome contract exists.
- Do not build Ascension/Mutagen yet.
- Do not give abilities execution authority.
- Do not turn Milestone 0 into a perfect-coverage project.
- Do not merge large historical artifact deletion with product logic.
- Do not claim formal verification from the current dirty workspace.

## Next product milestone preview

**Milestone 1 — Whole-economy comparison preview**

Required product outcome:

- Meat, Larva, and Army/Territory emit a shared versioned outcome;
- all alternatives start from one pre-execution snapshot;
- Inspector/Council shows milestone, horizon, winner, best alternative,
  projected impact, and confidence;
- the new comparison remains shadow/advisor-only;
- existing 0.13.0 execution remains authoritative.

The first Milestone 1 work order must not begin until Milestone 0 is explicitly
checked complete in this file.

## Handoff update template

At every handoff, update the relevant checklist and append a short entry:

```text
Date/time:
Agent:
Worktree/branch:
Implementation SHA or uncommitted scope:
Product capability changed:
Player-visible result:
Commands and exit codes:
Generated evidence paths:
Milestone checklist items completed:
Remaining blocker:
Exact next action:
```

## Handoff log

### 2026-07-13 — Copilot preliminary Strategy Intelligence automation handoff

- Agent: Copilot
- Worktree/branch: shared dirty workspace on
  `feature/strategy-audit-testbed-runners`
- Implementation SHA or uncommitted scope: uncommitted test-infrastructure
  changes in `package.json`, `scripts/run-sa1-breakpoint-v2.js`, and new
  `scripts/strategy-intelligence-*.js` / orchestration files
- Product capability changed: none; test infrastructure only
- Player-visible result: none
- Passing checks reported: build parity, 0.13.0 version surfaces, Laboratory
  Phase 2A, purchase evaluator, Laboratory effective-count, SA1 single
- Failed supported flow: `strategy:intelligence:run` stopped in `sa1-v2` after
  sweep bootstrap failed around `sa1-sweep-143`
- Generated evidence paths: `docs/test-data/0.12.3-laboratory/`,
  `docs/test-data/strategy-audit-1/`, `docs/test-data/strategy-intelligence/`,
  and regenerated Laboratory live-log evidence
- Review classification: promising preliminary infrastructure, not a completed
  automated acceptance flow
- Known overclaims to correct: coverage is partly inferred from scenario names;
  the property sweep exercises simplified helper math rather than the
  production economic model; the end-to-end command does not pass
- Milestone checklist items completed: none beyond the already recorded
  documentation foundation
- Remaining blocker: separate authored testinfra from documentation and
  generated evidence, then make one honest supported automation subset pass
- Exact next action: preserve the Copilot scope separately and perform one
  bounded correction/review cycle; do not add engine-save-window or clone-lock
  coverage before the supported subset is truthful and passing

### 2026-07-13 — Board created

- Agent: Codex
- Scope: BOOK-00 vision, delivery runbook, and current-status handoff structure
- Product capability changed: none; documentation/foundation only
- Player-visible result: none yet
- Current milestone: Milestone 0
- Exact next action: separate the dirty scopes and complete the bounded
  launchpad stabilization checklist
