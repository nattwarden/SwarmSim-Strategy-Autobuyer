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

Observed at the start of the Milestone 2 closure fix:

- verified 0.13.0 implementation commit: `3896ad5`
- verified 0.13.0 evidence commit / `origin/main`: `bcd1910`
- current feature workspace starting HEAD: `e7730ad05853134faca3c1f24161182bdf695150`
- current feature branch: `feature/strategy-audit-testbed-runners`
- feature branch remote status before the closure commit: ahead 9
- working tree became dirty only with the authored Milestone 2 closure scope
  recorded in the handoff log below

If observed Git state differs, update this board before implementation.

## Product north star

> Select or recommend the allowed action that gives the best total progression
> toward the next strategic milestone, over the relevant horizon, after
> rebuild, opportunity cost, protected resources, risk, and whole-economy
> effects are considered.

## Milestone snapshot (2026-07-13)

- Milestone 1 (Whole-Economy Shadow Preview): implemented and accepted on
  `21adb7a`.
- Milestone 2 (Bounded Whole-Economy Coordinator Execution): locally accepted
  in `808f9e1` and packaged as the local 0.14.0 release candidate. Formal
  published-release verification remains separate work.
- The original `sa1-02` Engine regression now resolves `upgrade:expansion`,
  executes exactly one Expansion, and reports `matchedExecution=yes`.
- Focused product acceptance `book00-m2-coordinator` compares one preserved
  pre-execution snapshot: legacy ordering selects `Engine: Hatchery`, while the
  whole-economy coordinator selects and buys `Territory: Stinger V x9` through
  canonical identity `unit:stinger:v`.
- Milestone 3 is now active. Energy production must join in shadow comparison
  before it can receive any bounded reversible execution authority.

## Active milestone

**Milestone 3 — Energy production joins the economy**

Player-visible target:

> The bot explains whether producing more Energy now is worth delaying Meat,
> Larva, or Territory and shows the relevant Nexus or ability timing effect.

Authority begins in shadow/advisor mode. Reversible Energy production may only
execute after its shared outcome fields and hard Nexus gate pass focused
acceptance.

## Milestone 2 completion checklist

- [x] `executionAuthority`, confidence, and actual execution behavior agree.
- [x] Low-confidence comparison remains advisory and cannot execute.
- [x] Selected action is revalidated immediately before buy.
- [x] Selected and executed canonical identities, variants, and bounded amounts
      match.
- [x] Sequential fallback cannot silently override a successful first action.
- [x] Original Engine resolution failure is reproduced and fixed.
- [x] One deterministic product state materially changes the first purchase:
      legacy `Engine: Hatchery` becomes coordinator `Territory: Stinger V x9`.

## Current work package

Product capability:

- Add Energy production as the fourth domain in the shared whole-economy
  comparison.

Player-visible change:

- Council/Inspector explains whether Nexus/Lepidoptera or another supported
  reversible Energy-production investment is worth delaying Meat, Larva, or
  Territory.

Included:

- Energy reserve and recovery as shared outcome fields;
- hard Nexus protection in the shared gate;
- visible cap-waste and delayed-ability opportunity where runtime evidence
  supports them;
- shadow outcomes where Energy can honestly win, lose, or remain uncertain.

Explicitly excluded:

- ability auto-cast;
- Ascension or Mutagen logic;
- Nightbug or Bat auto-buy;
- broad score tuning or sweeps;
- new Laboratory formulas unless separately authorized;
- release/version work before the Milestone 3 shadow slice is accepted.

Authority:

- shadow/advisor only for the first Energy comparison slice;
- existing Nexus protection remains authoritative;
- no Energy execution authority until focused shadow acceptance passes.

Expected changed areas:

- `dev-src/runtime-sections/runtime-main.js`
- canonical userscript produced by `npm run build`
- focused purchase-evaluator check
- Inspector/Council/export fields needed for the Energy comparison
- this status board at handoff

Stop condition:

- Energy emits the same versioned outcome contract from the same snapshot;
- Energy can win, lose, and remain uncertain in focused honest states;
- Nexus protection and ability/Ascension safety defaults remain unchanged;
- the player can see Energy opportunity cost and switch conditions.

## Immediate next actions

Execute these in order:

1. Define the smallest Energy-production proposal that uses existing runtime
   evidence rather than a renamed lane score.
2. Add Energy to the shared comparison in shadow/advisor mode.
3. Expose reserve recovery, cap waste, and relevant ability-delay fields.
4. Run only the focused Energy comparison acceptance required by the runbook.
5. Keep reversible Energy execution disabled until shadow acceptance passes.

## Known current blockers and cautions

- Runtime/package surfaces now identify as 0.14.1. The accepted Milestone 2
  branch is still not a published release until it is pushed and the formal
  exact-SHA protocol is completed against that published implementation.
- The current branch is ahead of its remote and has not been merged or pushed.
- The focused testbed is deterministic only when staged count, command deltas,
  and `velocity()` describe the same state; preserve that invariant.
- Territory suffix tiers require canonical name plus variant identity. Do not
  fall back to display-label lookup for execution.

## Do not do next

- Do not run sweep150 or start another broad ranking exercise.
- Do not grant Energy or abilities execution authority in the first M3 slice.
- Do not build Ascension/Mutagen yet.
- Do not change hard safety defaults.
- Do not claim a released version from the unpushed feature branch.

## Next product milestone preview

**Milestone 4 — Energy ability timing advisor**

Required product outcome:

- advise cast-versus-save timing for supported abilities from the same shared
  outcome contract;
- keep ability execution disabled by default;
- show projected gain, Energy opportunity cost, reserve recovery, and the next
  condition that would change the recommendation.

Start Milestone 4 only after Milestone 3 Energy-production comparison is
accepted.

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

### 2026-07-13 — 0.14.1 control-surface cleanup

- Agent: Codex
- Worktree/branch: `feature/strategy-audit-testbed-runners`
- Implementation SHA: the commit containing this handoff entry
- Product capability changed: the default settings surface now exposes only
  Advisor and Autobuyer as primary modes; detailed controls and Laboratory are
  preserved under one collapsed advanced section.
- Player-visible result: readable high-contrast buttons and a movable,
  resizable Swarm Council with persisted layout.
- Strategy behavior changed: none; the two modes map to existing Smart authority
  flags and hard safety defaults remain unchanged.
- Generated evidence paths: none.
- Exact next action: visually smoke-test 0.14.1, then continue Milestone 3.

### 2026-07-13 — Milestone 2 packaged as local 0.14.0 release candidate

- Agent: Codex
- Worktree/branch: `feature/strategy-audit-testbed-runners`
- Accepted Milestone 2 SHA: `808f9e1bc16f21bff082e221d2ed875e6fb7b26e`
- Release-candidate SHA: the commit containing this handoff entry
- Product capability changed: no new strategy behavior beyond accepted
  Milestone 2; this package aligns the installable script, runtime, package,
  documentation, release notes, and current-version verifier on 0.14.0.
- Player-visible result: the installable userscript identifies as 0.14.0 and
  contains the accepted Whole-Economy Shadow Preview and bounded coordinator.
- Generated evidence paths: none.
- Commands passed before the release-candidate commit:
  - `npm run build` -> 0
  - `npm run build:check` -> 0
  - `npm run check:0.14.0:versions` -> 0
  - `npm run check:purchase-evaluator` -> 0
  - `npm run check:book00:m2:coordinator` -> 0
  - `npm run validate:guardrails` -> 0
  - `npm run verify` -> 0
  - `git diff --check` -> 0
- Milestone checklist items completed: Milestone 2 remains complete; local
  release packaging is complete when the checks below pass on the commit.
- Remaining blocker: the feature branch is not pushed or merged, so formal
  published-release verification and an evidence commit are not claimed.
- Exact next action: test the local 0.14.0 userscript, then start Milestone 3
  Energy-production shadow comparison after release disposition is decided.

### 2026-07-13 — Milestone 2 exact execution fixed and locally accepted

- Agent: Codex
- Worktree/branch: `feature/strategy-audit-testbed-runners`
- Starting acceptance/handoff SHA: `e7730ad05853134faca3c1f24161182bdf695150`
- Implementation SHA: the commit containing this handoff entry
- Product capability changed: coordinator proposals now carry canonical runtime
  id, kind, and suffix variant; exact bounded adapters resolve and verify that
  identity before buying.
- Shared outcome correction: Territory's existing Expansion ETA gain is
  normalized into the common `etaImprovementSeconds` field.
- Testbed correction: staged `count()`, `velocity()`, and command purchase
  deltas now describe one deterministic state.
- Player-visible result: in focused acceptance, legacy ordering selects
  `Engine: Hatchery`; the coordinator instead selects and buys
  `Territory: Stinger V x9`, with `executionAuthority=true`, `executed=yes`,
  and `matchedExecution=yes`.
- Focused Engine regression: `upgrade:expansion x1` resolves and executes with
  a matching fingerprint.
- Generated evidence paths: none; disposable scenario artifacts are removed by
  the check.
- Commands passed before commit:
  - `npm run build` -> 0
  - `npm run build:check` -> 0
  - `npm run check:purchase-evaluator` -> 0
  - `npm run check:book00:m2:coordinator` -> 0
  - `npm run validate:guardrails` -> 0
  - `npm run verify` -> 0
  - `git diff --check` -> 0
- Milestone checklist items completed: all Milestone 2 product acceptance items.
- Remaining blocker: formal release/version work is separate and has not begun.
- Exact next action: start Milestone 3 Energy-production shadow comparison.

### 2026-07-13 — Milestone 2 focused acceptance (blocked)

- Agent: Copilot
- Worktree/branch: `feature/strategy-audit-testbed-runners`
- Implementation SHA: `b9019cfff8ba47077e32d1a1faa2183ab3009f61`
- Acceptance scenario: `sa1-02` via `npm run check:book00:m2:coordinator`
- Scenario result: FAILED (reproducible)
- Legacy first-choice order: `engine -> meat -> territory`
- Legacy first BUY in scenario: `Engine: Expansion`
- Coordinator selected winner: `Engine: Expansion x1` with
  `executionAuthority=true`
- Actual execution result: `executed=no`, `matchedExecution=no`,
  `Engine exact execution unavailable`
- Product capability changed: none (acceptance/handoff only)
- Player-visible result: none
- Commands and exit codes:
  - `npm run build` -> 0
  - `npm run check:purchase-evaluator` -> 0
  - `npm run check:book00:m2:coordinator` -> 1
  - `npm run validate:guardrails` -> 0
  - `git diff --check` -> 0
- Remaining blocker: coordinator exact execution adapter fails selected Engine
  candidate in focused deterministic runtime acceptance scenario.
- Exact next action: fix coordinator exact adapter resolution for selected
  reversible candidates, then rerun the same single scenario.

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
