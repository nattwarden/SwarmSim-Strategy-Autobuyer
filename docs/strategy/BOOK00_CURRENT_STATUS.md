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
- The first Milestone 3 shadow slice is implemented in the current work package:
  Energy is the fourth whole-economy domain, emits `whole-economy-outcome.v2`,
  and remains excluded from coordinator execution authority. Exact-SHA branch
  checks passed against `42847a4258ba299132f0c7c8c85489371fe68a12`;
  the feature history was fast-forwarded to `main` at `e9918dd` on 2026-07-13.
- The shadow slice was formally accepted on `main` by implementation
  `6d5a020f7d47713f7abdb980a0b8324efce846a3` and evidence
  `ec3aea2221fb5600e41a74bb476f16c9fea292ea`.
- The bounded Milestone 3 execution slice is implemented on `main` at
  `df402cea59da8bd3cb7591c2ce7117f2b1bd57ce`: only the current Nexus target or
  Lepidoptera may receive Energy execution authority, after the whole-economy
  winner, evidence, Nexus gate, identity, amount, and immediate Energy proposal
  revalidation all pass.

## Active milestone

**Milestone 4 — Energy ability timing advisor (next; not yet implemented)**

Milestone 3 capability is implementation-complete. The transition is formally
accepted only when the exact-SHA suite and separate evidence commit for the
closure package pass. No Milestone 4 ability logic is included in that package.

Milestone 4 player-visible target:

> The player sees whether to cast or save a supported Energy ability, with
> projected gain, Energy opportunity cost, milestone impact, horizon, and
> confidence.

Authority begins and remains advisor-only. Ability auto-cast stays disabled by
default.

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

## Milestone 3 completion checklist

- [x] Energy reserve and recovery are shared outcome fields.
- [x] Nexus protection remains a hard gate.
- [x] Cap waste and delayed ability opportunity are visible where supported.
- [x] Energy can honestly win, lose, or remain uncertain in focused states.
- [x] Reversible Energy production receives authority only after the accepted
      shadow slice, sufficient evidence, exact identity/amount revalidation,
      and the production-only Nexus gate pass.

## Current work package

Implementation status: bounded Energy execution is integrated on `main` at
`df402cea59da8bd3cb7591c2ce7117f2b1bd57ce`. Formal exact-SHA verification and
the separate evidence/provenance commit are the remaining acceptance gate.

Product capability:

- Allow a sufficiently evidenced Energy-production winner to make the first
  reversible purchase through the shared whole-economy coordinator.

Player-visible change:

- In Autobuyer mode, a winning supported Energy proposal can execute the exact
  current Nexus or bounded Lepidoptera purchase shown by Council and Inspector;
  Advisor mode continues to explain without buying.

Included:

- current Nexus upgrades and bounded Lepidoptera chunks only;
- medium/high confidence and a positive score margin or no runner-up;
- hard Nexus production gate before and during revalidation;
- exact canonical identity, variant, target, and bounded amount matching;
- a final Energy proposal rebuild immediately at the buy boundary;
- duplicate sequential Energy execution suppression after a matched
  coordinator purchase.

Explicitly excluded:

- ability auto-cast;
- Ascension or Mutagen logic;
- Nightbug or Bat auto-buy;
- broad score tuning or sweeps;
- new Laboratory formulas unless separately authorized;
- version bump or broad release work.

Authority:

- bounded reversible coordinator execution for supported Energy production;
- no authority in Advisor mode or when safe auto-buy is disabled;
- no ability, Nightbug/Bat, Ascension, or Mutagen authority.

Expected changed areas:

- `dev-src/runtime-sections/runtime-main.js`
- canonical userscript produced by `npm run build`
- focused purchase-evaluator check
- focused Energy execution acceptance
- this status board at handoff

Stop condition:

- passing Nexus and Lepidoptera winners can receive authority after exact
  revalidation;
- a blocked Nexus gate and an Energy ability candidate cannot receive authority;
- M2 Meat/Engine/Territory execution remains accepted;
- canonical build, full verify, guardrails, and exact-SHA evidence pass.

## Immediate next actions

Execute these in order:

1. Verify the immutable Milestone 3 closure SHA in an isolated worktree.
2. Commit only the predeclared Milestone 3 closure provenance record.
3. Confirm `HEAD == origin/main` and a clean tree.
4. Begin Milestone 4 with advisor-only cast-versus-save scope.

## Known current blockers and cautions

- Formal Milestone 3 closure cannot be claimed until the exact-SHA evidence
  commit exists on `origin/main`.
- The focused testbed is deterministic only when staged count, command deltas,
  and `velocity()` describe the same state; preserve that invariant.
- Territory suffix tiers require canonical name plus variant identity. Do not
  fall back to display-label lookup for execution.

## Do not do next

- Do not widen Energy execution beyond Nexus/Lepidoptera production.
- Do not grant any Energy ability execution authority in Milestone 4.
- Do not build Ascension/Mutagen yet.
- Do not change hard safety defaults.

## Next product milestone

**Milestone 4 — Energy ability timing advisor**

Required product outcome:

- advise cast-versus-save timing for supported abilities from the same shared
  outcome contract;
- keep ability execution disabled by default;
- show projected gain, Energy opportunity cost, reserve recovery, and the next
  condition that would change the recommendation.

Start Milestone 4 implementation only after the Milestone 3 closure evidence
commit is on `origin/main` and the working tree is clean.

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

### 2026-07-13 — Milestone 3 bounded Energy-production execution

- Agent: Codex
- Worktree/branch: primary workspace, `main`
- Code implementation SHA: `df402cea59da8bd3cb7591c2ce7117f2b1bd57ce`
- Code tree SHA: `a9d14c6bc0a7e2571a0425409b778c2705f3a2bc`
- Product capability changed: a sufficiently evidenced whole-economy Energy
  winner may execute the exact current Nexus target or bounded Lepidoptera
  chunk after immediate production-proposal revalidation.
- Player-visible result: Autobuyer can act on the same supported Energy winner
  Council/Inspector explains; Advisor remains read-only.
- Safety: Nexus protection is an explicit precheck and revalidation gate;
  abilities, Nightbug/Bat, Ascension, and Mutagen remain outside authority.
- Pre-commit commands: `npm run build`,
  `node scripts/validate-repo-guardrails.js`, `npm run verify`,
  `npm run check:book00:m2:coordinator`, and `git diff --check` all exited `0`;
  no evidence was generated.
- Focused acceptance: supported Lepidoptera and protected Nexus winners pass;
  a blocked Nexus gate and Clone Larvae candidate are denied; M2 exact Territory
  execution remains matched.
- Generated evidence paths: none.
- Milestone checklist items completed: all Milestone 3 product items at the
  authored implementation level.
- Remaining blocker: exact-SHA verification and a separate provenance commit.
- Exact next action: verify the final authored closure SHA, commit only the
  allowlisted evidence record, then begin Milestone 4.

### 2026-07-13 — Milestone 3 Energy-production shadow comparison

- Agent: Codex
- Worktree/branch: `feature/strategy-audit-testbed-runners`
- Implementation SHA: `42847a4258ba299132f0c7c8c85489371fe68a12`
- Implementation tree SHA: `9dd3bf4a97cb1e2ccff8130dc0802657e1afa604`
- Product capability changed: Energy production now joins Meat, Larva/Engine,
  and Army/Territory as the fourth whole-economy comparison domain.
- Player-visible result: Council/Inspector expose the Energy candidate, Nexus
  protection gate, reserve after/required/recovery, cap headroom and avoided
  cap waste, supported Clone Larvae/House of Mirrors delay, production gain,
  and the condition that would change the comparison.
- Authority: shadow/advisor only. Energy remains outside the allowed
  Meat/Engine/Territory coordinator execution scope; ability auto-cast and
  auto-Ascension remain disabled.
- Focused acceptance: Energy wins, loses, and remains uncertain in honest
  synthetic states; an Energy winner is explicitly denied execution authority.
- 0.14.1 Chrome smoke: Advisor/Autobuyer mode mapping, collapsed Advanced
  controls, Council resize support, and persisted Council layout passed; the
  pre-test Autobuyer mode was restored.
- Pre-commit commands: `npm run build`, `npm run verify`,
  `node scripts/validate-repo-guardrails.js`, and `git diff --check` all exited
  `0`; no generated evidence was written.
- Generated evidence paths: none.
- Exact-SHA branch checks: `node scripts/validate-repo-guardrails.js`,
  `npm run build:check`, `npm run check:book00:m3:energy-shadow`,
  `npm run verify`, and `git diff --check` all exited `0` in a detached worktree;
  Node `v24.14.0`, npm `11.9.0`, no tracked changes, no evidence written.
- Main integration: the complete feature history was fast-forwarded and pushed
  to `main` at `e9918dd564e5a2cf3d9255dc7805b2fc1f7f8562`.
- Remaining blocker: formal exact-SHA verification and a separate
  evidence/provenance commit must complete before a published-main acceptance
  claim.
- Exact next action: verify the final authored main tree in an isolated worktree,
  commit only the predeclared provenance record, then decide whether Milestone 3
  should receive a separately gated bounded Energy-production execution slice.

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
