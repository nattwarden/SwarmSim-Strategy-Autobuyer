# BOOK-00 Current Execution Status

Status: Active handoff board. Update this file at every completed work package,
blocked handoff, milestone transition, and accepted verification result.

Last reviewed: 2026-07-16

## 9.4.0 clean-room recovery (2026-07-16)

The rejected `feature/9.4.0-global-execution-ownership` series remains research
material only. Product reconstruction now runs on
`codex/9.4.0-clean-room`, created from exact main baseline
`da1fcede6419b8124b11004c7562819b67180330`.

Phase 1 - reproducible clean baseline - is complete:

- implementation SHA: `68b77d0a5bd45c005c28a956b5ca15d731bf69d0`;
- implementation tree: `da46c284e5bcd4e0bbb822a518527a777875f074`;
- evidence SHA: `f31e962c14125f9fda8f4d5b8c83716259ba0630`;
- evidence path:
  `docs/test-data/9.4.0-clean-room/verification-68b77d0.md`;
- the missing, untracked Territory/default-save path was replaced by the
  existing tracked, player-reported and SHA-256-pinned
  `docs/test-data/clone-ramp/live-user-save.txt`;
- successful M8, M9 and live-purchase checks now remove their ephemeral
  strategy-audit outputs, so the complete suite leaves an exact-SHA worktree
  clean;
- canonical runtime, product strategy, thresholds, defaults and version
  surfaces were intentionally unchanged;
- the detached exact-SHA worktree passed guardrails, canonical build, the full
  configured `npm run verify`, default-save import and `git diff --check`, all
  with exit code `0` and final status count `0`.

Phase 2 slice 1 - shared target/decision identity - is complete:

- implementation SHA: `bba78650d706f9fdade2fff57214117b255d3f8d`;
- implementation tree: `48493cd9c282327ca7e079f3ad1fbb60c5e48afd`;
- evidence SHA: `18adc8a3c92fa5c391efeab3fb3998e4b9f26608`;
- evidence path:
  `docs/test-data/9.4.0-clean-room/verification-bba7865.md`;
- `getCurrentStrategyIdentity()` now resolves the milestone and active target
  from one planner branch and supplies both the pre-execution M6 snapshot and
  the later Inspector/Council reconstruction;
- the pinned player save resolves `lesser hive mind` as both the meat-chain
  target and all six domains' shared `activeTarget`, rather than leaking the
  unrelated `smartFocus`/proposal target into the decision identity;
- focused mutation control restores the old binding in memory and fails with
  `activeTarget=balanced`, while tracked unit counts stay unchanged and M6
  execution authority stays false;
- the detached exact-SHA worktree passed the full configured suite, default
  save import, guardrails and `git diff --check`, ending clean;
- proposal ranking, authorization, amounts, thresholds, safety defaults,
  Laboratory gates and legacy execution ownership were intentionally
  unchanged.

Phase 2 slice 2 - canonical proposal identity versus decision authorization
identity - is complete:

- runtime implementation SHA: `21111d15d3e833673a8d6c6d7201ed20d402ae18`;
- exact verified implementation SHA (including the cross-worktree verifier
  correction): `cf7d0cfc88759e14069c569f12a1830fe02d53c9`;
- implementation tree: `5a6f0ac5e51904db76e802e1f26f136fa517f2be`;
- evidence SHA: `8820aa9b90f32c4cbea893f4660f1d048e472a51`;
- evidence path:
  `docs/test-data/9.4.0-clean-room/verification-cf7d0cf.md`;
- `canonicalProposalId` now names only execution key, internal execution ID,
  execution kind and variant, and deliberately excludes amount and display
  text;
- `authorizationId` separately binds that action type to decision cycle,
  snapshot and active target, and changes when any of those decision-context
  fields changes;
- proposals, M2/M6 plan structures, Inspector, Council and the public
  diagnostic API expose the two identities;
- two focused mutation controls prove that amount cannot leak into the
  canonical ID and that authorization cannot collapse to action type alone;
- authorization remains explicitly `observability-only`; existing matching,
  fingerprints, revalidation and execution behavior were intentionally not
  changed;
- the final detached exact-SHA run passed the full configured suite and ended
  clean. An LF/CRLF mutation-verifier issue and one transient
  `net::ERR_NETWORK_CHANGED` attempt were discarded and are recorded in the
  evidence instead of being counted as acceptance.

Current work package: Phase 2 slice 3 - stale authorization. The next change
may make the observed authorization context a hard pre-purchase gate, but must
not include the later four-value amount contract or enable global execution
ownership. Healthy same-cycle M2/M3/live purchases must remain unchanged.

## Current status snapshot (2026-07-15)

Runtime `9.3.0`, integrated on `main`. Closed and verified:

- Clone Ramp (`9.3.0`): a narrow, explicit, user-authorized exception to
  "no ability auto-cast by default" — `autoCastCloneLarvae` (default `true`)
  lets the bounded `runCloneRampPlanner` auto-cast Clone Larvae only, at most
  once per `runOnce()` cycle, gated on the ability's real live `bank()`/
  `cap()` and the Nexus/Energy reserve, banking the cast's own output into
  cocoons with an exact bounded amount before releasing the action budget
  back to normal Meat progression at ~99.9% of cap. Fixed an adjacent
  pre-existing bug found during manual live verification: the legacy Clone
  Buffer Planner's auto-detected `POST_CLONE_LOCK` mode triggered on any
  positive `bank()` (true almost always, since `bank()` is a live larva+cocoon
  total, not a "just cloned" debt signal) and drained protected larva behind
  Clone Ramp's back; now gated off when `autoCastCloneLarvae` is on. See the
  2026-07-15 handoff entry below for the verified live-mechanic evidence,
  acceptance check, and mutation control. All other abilities remain
  advisor-only.
- M2 bounded exact-execution coordinator and M6 six-domain strategic
  coordinator (both implemented; see `docs/SWARMSIM_GAME_MODEL.md` section 7).
- Milestone 8 (ETA-grounded false-wait reduction, `8.1.0`) and Milestone 9
  (resource-scoped save locks) are both closed.
- Live purchase acceptance (`check:live-purchase-acceptance`): proves a real
  `runOnce()` cycle actually buys something, through both the legacy path
  and the M6-authorized path, with count/resource deltas read from game
  state. Mutation-control verified.
- SA1 9.0.0-vs-9.1.0 comparison: 0 winner/decision differences across the
  7-scenario matrix. 9.1.0 scoring kept unchanged (audit finding F2 closed
  as "no observed regression"; the underlying triple-count code smell is
  tracked, not urgent).
- F3 (stall-breaker decision gate now reads structured `blockerCategories`
  instead of regex-over-text) and F7 (`DEFAULT_CONFIG.unitStrategy` now
  matches the Smart preset, `"balanced"`) are both closed.

Known architecture question, not a blocker: three ranking systems coexist
(M6's six-domain comparison, M2's `economicScore`, and the fixed legacy lane
order), and the legacy order remains the practical arbiter whenever M6 and
M2 disagree (F1, `REPOSITORY_AUDIT_REVIEW_2026-07-14.md`). This is accepted,
documented current architecture (see `docs/SWARMSIM_GAME_MODEL.md` section
7) — not something blocking further work, but worth harmonizing later with
real live-play evidence rather than a speculative refactor.

Next direction: live observation of the accepted 9.1.0 baseline in real
play, to surface the next strategy problem with actual evidence (rather
than starting Milestone 10/11 speculatively). See "Immediate next actions"
below.

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

Observed before the M7 foundation work:

- branch baseline: `origin/main`;
- accepted M6 implementation:
  `9da1b2312cc603c29f9d3add2270499fdbc1b269`;
- accepted M6 evidence:
  `60297dfbd8b686affd701258db40e94fb8ce3c53`;
- Council UI3 implementation:
  `40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5`;
- fixed Council window implementation / current baseline:
  `04bb94678ba9ac29d03e2b2c00760ffb40510e55`;
- runtime version: `9.0.0`;
- Council desktop layout: fixed `1180 x 700`, movable, `resize: none`, layout
  key `kbcSwarmBotCouncilPanelLayout_v2`;
- working tree: clean before the M7 documentation branch was created.

If observed Git state differs, update this board before implementation.

Observed after M8 8.1.0 closure (2026-07-14):

- accepted M8 8.1.0 implementation: `c014158cea82696cbdb18506045e60126c676116`;
- implementation tree: `ab2554626960fabfb699a73584efd421502f1af0`;
- verification worktree HEAD/tree matched the implementation SHA/tree exactly;
- `origin/main` at verification time: `c014158cea82696cbdb18506045e60126c676116`
  (equal to the implementation SHA; no intervening commits);
- full `npm run verify` (including the live-Chrome
  `check:book00:m8:false-wait` replay) passed with exit code `0` in both the
  primary workspace and the isolated exact-SHA verification worktree, with
  identical result: `blocker cycles=5, eta-grounded-by-cycle3=3,
  stall-breaker-cycle=3`;
- no tracked files changed during either verification run, so no separate
  generated-evidence commit was required; this status-board update is the
  provenance record for the accepted run.

Current runtime version: `9.3.0`

## Product north star

> Select or recommend the allowed action that gives the best total progression
> toward the next strategic milestone, over the relevant horizon, after
> rebuild, opportunity cost, protected resources, risk, and whole-economy
> effects are considered.

## Milestone snapshot (2026-07-13)

- Milestone 1 established the three-domain whole-economy shadow preview.
- Milestone 2 established bounded, exact, revalidated execution for supported
  Meat, Larva/Engine, and Army/Territory winners.
- Milestone 3 added Energy production to `whole-economy-outcome.v2` and bounded
  execution for the accepted current Nexus target or Lepidoptera production.
  Formal closure: implementation `45d989c31e1e802edcf80bfcfda3922fd5cdd6c4`,
  evidence `7ef846d29e52a6a43bc67564b663a8e390687692`.
- Milestone 4 added the advisor-only Energy ability timing contract at `4.0.0`.
  Branch implementation `f2db145e368f77e1b348a6cb70e1f8ef2f6a0a90`,
  evidence `b9040d5943e621e6f41c6d247794e6866859ff64`.
- Milestone 5 added the advisor-only Ascension/Mutagen contract at `5.0.0`.
  Branch implementation `060a5654fe409db54d196b0368533d6696bb3361`,
  evidence `fdd278c4788495f1e9ab4058b1f61b5d9240552f`.
- Council UI, M4, and M5 were integrated on `main` at
  `c10d8c5a9160708e1d657ad5f08496dfb8e2e698` and formally accepted by separate
  integration evidence `af6a41b9534b6ff682a2903d938fa17686a3a9d2`.
- Current M5 hotfix release: `5.0.1`.
- Starting with Milestone 4, release major version follows the active BOOK-00
  milestone. M6 therefore starts at `6.0.0`.
- Milestone 6 added the six-domain strategic coordinator at `6.0.0`. Formal
  closure: implementation `9da1b2312cc603c29f9d3add2270499fdbc1b269`,
  evidence `60297dfbd8b686affd701258db40e94fb8ce3c53`.
- M6 runtime is integrated, verified, and preserved as the executable `6.0.0`
  baseline for M7.
- Council UI3 and its fixed desktop window are integrated through `40c258a` and
  `04bb946`; both are mandatory M7 baselines.

## Active milestone

**Milestone 8 - ETA-grounded false-wait reduction (CLOSED at 8.1.0)**

M8 turned the pre-M8 wait-lock hotfix into a narrow, source-grounded ETA slice
for executable normal progression. The scope was Meat fallback selection under
repeated HOLD cycles where advisor-only ability opportunity exists but no legal
advisor execution authority exists. The 8.1.0 closure additionally tuned Smart
default chunk/fallback/reserve thresholds for more continuous progression (see
`docs/release-notes/SwarmSim-Strategy-Autobuyer-8.1.0-release-notes.md`) while
leaving hard irreversible safety defaults unchanged.

Milestone 8 player-visible target (met):

> The player sees fewer repeated false `Wait` loops in Smart mode, with explicit
> blocker reasons and bounded fallback progression that remains inside hard
> safety defaults.

Formal closure:

- implementation SHA: `c014158cea82696cbdb18506045e60126c676116`;
- implementation tree: `ab2554626960fabfb699a73584efd421502f1af0`;
- exact-SHA verification worktree reproduced the identical passing result;
- `HEAD` equals `origin/main` at the implementation SHA; working tree clean.

**Milestone 9 - Resource-scoped save locks (CLOSED)**, foundation at
`docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`. See the
2026-07-14 "Milestone 9 closed" handoff entry below for the closure record.

Energy abilities, Ascension, and Mutagen remain advisor-only and
non-executable.

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

## Milestone 4 completion checklist

- [x] Ability and WAIT branches share one immutable M4 snapshot.
- [x] Clone Larvae, House of Mirrors, and supported Rush abilities can be
      recommended with explicit Energy opportunity cost and reconsideration.
- [x] Swarmwarp remains excluded and ability execution authority remains false.
- [x] Exact-SHA implementation and separate evidence are integrated on `main`.

## Milestone 5 completion checklist

- [x] `CONTINUE_RUN` and `ASCEND_NOW` share one immutable M5 snapshot.
- [x] Recovery/break-even, next-run horizon, Mutagen gain, and uncertainty are
      explicit.
- [x] `KEEP_UNALLOCATED` is always present; only supported Hatchery analysis is
      directly rankable and unsupported mutation effects remain unranked.
- [x] Ascension and Mutagen execution authority remains false.
- [x] Exact-SHA implementation and separate evidence are integrated on `main`.

## Milestone 6 completion checklist

- [x] Exactly six canonical domains use the shared versioned M6 outcome.
- [x] All domains share one immutable decision identity.
- [x] Global rank uses a real shared milestone outcome, not local scores.
- [x] Hard safety remains independent from economic ranking.
- [x] Advisor-only winners cannot gain authority or silently fall through.
- [x] Existing reversible execution remains exact, bounded, and revalidated.
- [x] Cross-domain causal effects cannot be double counted.
- [x] Decision and execution remain consistent across cycles.
- [x] Mechanic-based coverage, observability, focused acceptance, and exact-SHA
      evidence are complete.

Formal closure:

- implementation SHA: `9da1b2312cc603c29f9d3add2270499fdbc1b269`;
- implementation tree: `c94a2e8e0b8487715a4b69b7bc7fe8960bc9a089`;
- evidence SHA: `60297dfbd8b686affd701258db40e94fb8ce3c53`;
- evidence path:
  `docs/test-data/6.0.0-book00-m6-six-domain/verification-9da1b23.md`.

## Milestone 6 exit review

1. The running script now emits and ranks exactly six strategic domain
   outcomes from one decision identity and can reuse only the exact revalidated
   bounded purchase winner.
2. The player sees one six-domain result, alternatives, blockers, confidence,
   reconsideration, and authority in Council and Inspector.
3. BOOK-00's central question is better answered because the four purchase
   domains and two advisor domains now share one safety-first coordinator.
4. Ability casts, Ascension, Mutagen spending, Swarmwarp, unsupported mutation
   conversions, and new execution keys were intentionally excluded.
5. Focused M6 acceptance plus the full exact-SHA suite protect identity,
   comparability, authority isolation, double-count prevention, cycle
   consistency, UI, Laboratory, and M2-M5 regression.
6. The next best step is a product capability: calibrate a real advisor action
   against WAIT on the same milestone/horizon.

## Current work package

Implementation status: Milestone 8 is formally closed at `8.1.0`
(implementation `c014158cea82696cbdb18506045e60126c676116`), but a critical
production bug was found and fixed on top of it on 2026-07-14 (see handoff
below): `m6DecisionOwnsMainCycle` was hardcoded `true`, disabling every
legacy purchase path and leaving the bot unable to buy anything in live
play. Fixed by setting it to `false`. `check:book00:m8:false-wait` failed
immediately afterward because its scenario relied on the same bug (advisor-only
replay was incidentally masked as permanent HOLD); the scenario has since been
re-tuned (2026-07-14, see handoff below) to isolate the Meat lane and produce a
genuine reserve/payback-guarded HOLD pattern, and `npm run verify` is fully
green again.

Milestone 9 (resource-scoped save locks) is closed as of 2026-07-14 (see
handoff below): the guard-level implementation (`shouldAvoidProtectedCost`)
already scoped protection to the specific resource being spent, so no new
runtime code was needed. Added a focused acceptance check
(`check:book00:m9:resource-locks`) proving Territory stays HOLD under an
active Expansion save window while Meat/Engine/Upgrade remain BUY-eligible.
`npm run verify` is green with the new check included.

A full read-only repository audit was performed on 2026-07-14 against
`2eef0248a2d3ce8a01265ccbc537b2b97ff01c69` (see the audit handoff entry and
[REPOSITORY_AUDIT_REVIEW_2026-07-14.md](REPOSITORY_AUDIT_REVIEW_2026-07-14.md)).

The live purchase acceptance foundation
([BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md](BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md))
is implemented as of 2026-07-14 (see handoff below): `check:live-purchase-acceptance`
is wired into `npm run verify` and proves, via real Chrome `runOnce()` cycles and
count/resource deltas read from game state, that both the legacy purchase path and
the M6-authorized purchase path actually buy something. Mutation control confirmed
the check fails when `m6DecisionOwnsMainCycle` is reintroduced as `true`.

Since that audit, the following were closed narrowly, in order, each with a
separate handoff entry below: the SA1 9.0.0-vs-9.1.0 comparison (F2 evidence;
0 winner/decision differences, 9.1.0 scoring kept as-is), F3 (structured
`blockerCategories` replace regex-over-text in the stall-breaker decision
gate), and F7 (`DEFAULT_CONFIG.unitStrategy` now matches the Smart preset).

No work package is currently in flight. The next direction is live
observation of the accepted baseline rather than a new coded milestone; see
"Immediate next actions" below.

## Immediate next actions

M8, M9, the live purchase acceptance check, the SA1 9.0.0-vs-9.1.0
comparison (F2 evidence), F3, and F7 are all closed as of 2026-07-14 (see
handoff entries below for each). The audited baseline was
`2eef0248a2d3ce8a01265ccbc537b2b97ff01c69` (9.1.0); current `main` is ahead
of that with the closures above.

No specific milestone is queued next. The next direction is live
observation: run the accepted 9.1.0 baseline against real/live-like play
(SA1 sweep matrix, or an actual reported save) and let the next strategy
problem be selected from what that evidence actually shows, rather than
starting Milestone 10/11 speculatively. If a concrete player-reported issue
or a new verified finding emerges, treat that as the next work package.

Hard constraints (still active):

- Do not change scoring/comparability (`evaluatePurchaseCandidate`,
  `projectedMilestoneProgressDelta`, `sixDomainComparableValue`) without a
  fresh SA1 (or equivalent live) evidence run documented alongside the
  change.
- Do not give M6 sole main-cycle ownership (`m6DecisionOwnsMainCycle =
  true`) without the live purchase acceptance check passing against that
  change first (it is designed to fail exactly that regression).

## Known current blockers and cautions

- M6's current Ascension adapter treats break-even horizon surplus as if it
  could be ETA improvement; M7 must reject that shortcut.
- A supported ability formula does not automatically provide a shared
  milestone conversion.
- WAIT/action identity, metric, unit, horizon, formula revision, and source
  revision must all align.
- Synthetic comparability cannot satisfy the required player-visible live
  capability by itself.
- Advisor winners must remain non-executable and must not fall through.
- UI3 and the fixed Council `1180 x 700` layout are baseline functionality, not
  M7 work to recreate.

## Do not do next

- Do not use local scores or labels as shared value.
- Do not coerce missing values to zero.
- Do not label `horizon - breakEven` as milestone ETA improvement.
- Do not grant ability, Ascension, or Mutagen execution authority.
- Do not execute a purchase runner-up when an advisor action wins.
- Do not duplicate or redesign Council UI3/fixed-layout work.
- Do not change hard safety defaults or normal strategy thresholds.

## Planned future milestones (not started)

Milestone 9 (resource-scoped save locks) is closed — see the current status
snapshot and handoff log, not this section. Nothing below has started;
neither is queued as the immediate next action (see "Immediate next
actions" above — that is live observation, not one of these).

**Milestone 10 - Council timeline and decision replay**

Planned player-visible change:

- Council displays a cycle timeline with action type, lane, blockers, reasons,
  and key before/after metrics to explain waits vs buys.

**Milestone 11 - Opt-in execution for abilities and ascension**

Planned player-visible change:

- if enabled, supported ability/ascension execution can be automatic;
- if not enabled, behavior remains advisor-only/default-safe as today.

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

### 2026-07-15 - DEL B research findings recorded (pre-9.3.5, read-only)

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `14d18fe` (9.3.4), clean working tree at start (excluding
  untracked `docs/test-data/` scenario evidence directories).
- Scope: this is a documentation-only record of a prior read-only research
  pass ("DEL B") into Parent Step payback and live purchase-log accuracy,
  written down here so it is not lost in chat history. No runtime code
  changed as part of this entry; the runtime fixes it motivates are tracked
  separately as 9.3.5 in this same handoff log.
- Current Parent Step / meat-chain payback formula, verified against
  `dev-src/runtime-sections/runtime-main.js` (`getMeatChainPurchaseAnalysis`,
  ~line 16852): for each meat-chain cost resource of the candidate,
  `totalCost = cost.val * num`, `addedVelocity = productionPerUnit(unit,
  costUnit.name) * num` where `productionPerUnit` reads
  `unit.eachProduction()[resourceName]` directly from the live runtime unit,
  and `paybackSeconds = totalCost / addedVelocity` (`Infinity` when
  `addedVelocity` is not positive). The worst (max) `paybackSeconds` across
  all meat-chain cost rows drives the guard; `paybackRatio =
  paybackSeconds / config.meatChainMaxPaybackSeconds`. This is an
  **estimate from the live `eachProduction()` snapshot at decision time**,
  not a measured/observed recovery — see the 9.3.5 entry below for why this
  matters and how it is now surfaced honestly in the Inspector.
- No cost-resource mismatch was found in the meat-chain guard: every cost
  row's `costUnit` used for `totalCost` is the same unit instance used to
  look up `addedVelocity` via `productionPerUnit(unit, costUnit.name)`, so
  cost and produced-resource are never crossed for different resources.
- Observed Parent Step production benefit: Parent Step candidates (meat-chain
  units bought specifically to unlock/feed further meat progression via
  `runUnlockPlanner`'s `parentChoice` path) measurably raise the relevant
  meat-chain resource's velocity once bought, consistent with the
  `eachProduction()`-derived `addedVelocity` estimate above; this was
  observed qualitatively across live cycles, not captured as an automated
  regression yet.
- The previously-quoted "1086 seconds" payback figure for a specific live
  Parent Step buy is a **60-second-local approximation** taken by sampling
  the resource velocity shortly after the buy and dividing remaining cost
  recovery by that local rate; it is **not** a verified immediate/instant
  payback measurement, and no replacement formula for
  `getMeatChainPurchaseAnalysis`'s `paybackSeconds` has been proven correct
  or superior. The formula above remains the only source of truth for
  payback gating; 9.3.5 only adds visibility into its raw output, it does
  not change or replace it.
- WAIT-harness integrity: the deterministic scenario harnesses under
  `scripts/check-*` and `scripts/run-*-deterministic-scenarios.js` were
  re-checked read-only and continue to exercise synthetic candidate rows
  rather than a full live `runOnce()` cycle for WAIT/HOLD reasoning; this is
  the same testing-gap pattern already recorded in the 2026-07-14 repository
  audit (`docs/strategy/REPOSITORY_AUDIT_REVIEW_2026-07-14.md`). No harness
  code was changed in this entry.
- `storageState` bit-identical snapshot method: Playwright live-acceptance
  runs capture browser `storageState` (cookies + localStorage, including the
  save-game blob) immediately after a known-good game load, then every
  subsequent live run restores that exact `storageState` file before
  navigating, giving byte-identical starting game state across repeated live
  runs so purchase-log/ledger deltas are directly comparable run-to-run
  (see `docs/test-data/strategy-audit-1/**/live/` for captured evidence
  directories using this method).
- Twin dual-path architecture confirmed read-only: Twin-unit upgrades are
  bought through two independent call sites in `runtime-main.js` — the
  goal-planner "twin-prep" path (`buyPlannerTwinIfUseful`, prepares a Twin
  upgrade ahead of a planned unit purchase) and the direct "Twin Unlock
  threshold" path inside `runUnlockPlanner`/target-aware upgrade flow. Both
  ultimately call the same `buyUpgradeAmount(commands, twinUpgrade,
  newDecimal(1), ...)` primitive, so both are covered by the 9.3.5
  executed-amount fix without any Twin-specific special-casing.
- Decision recorded: strategy ranking, gating, reserve limits, and payback
  bypass logic are **not** changed by this research pass. The only actions
  taken are (a) this documentation entry, and (b) the follow-up 9.3.5
  observability/consistency fixes recorded separately below.

### 2026-07-15 - Clone Ramp: narrow, bounded Clone Larvae auto-cast (9.3.0)

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `29c6da6` (9.2.0), clean working tree at start.
- Requested by the user as an explicit, deliberate exception to the
  documented "no Clone Larvae auto-cast by default" hard safety default (see
  `AGENTS.md`/`AI.md`), scoped narrowly to Clone Larvae only; every other
  ability (House of Mirrors, rush abilities, Swarmwarp, Ascension, Mutagen)
  stays advisor-only, and `autoCastAbilities`/`autoAscend`/
  `energySupportBrokerAllowAutoCast` all remain `false`.
- Manual live verification (required before implementation): imported a
  player-reported live save (`docs/test-data/clone-ramp/live-user-save.txt`)
  into a real, disposable headless-Chrome `swarmsim.com` session (no
  synthetic scenario staging) and directly exercised the real ability
  commands. Confirmed the documented mechanic exactly:
  - `bank()` = current `larva + cocoon`, recomputed live on every call - not
    a stored "just cloned" debt.
  - `cap()` is driven by `larva`/`cocoon` velocity and stays effectively
    fixed while those velocities don't change.
  - Casting adds `min(bank, cap)` directly onto `larva` (cocoons untouched by
    the cast itself); Energy cost was a fixed `12000` across repeated casts
    in the same session.
  - Converting the newly produced `larva` into `cocoon` (bounded to exactly
    that amount) preserves the total bank (`larva+cocoon` is conserved), it
    only shields the new larva from ordinary Meat/army spending.
  - Because output = current bank while `bank < cap`, one cast+bank cycle
    roughly doubles the bank, so very few cycles reach `cap`; once
    `bank >= cap`, every further cast only ever yields `cap` (no benefit from
    ramping further).
  - Found and fixed an adjacent bug this verification surfaced: the legacy
    Clone Buffer Planner's auto-detected `POST_CLONE_LOCK` mode
    (`resolveCloneBufferMode`) treated any positive `bank()` as "just
    cloned, must lock" - true almost always, since `bank()` is a live total,
    not a debt signal - so it drained the ramp's protected pre-existing
    larva into cocoons behind its back in the same cycle. Reproduced with a
    controlled before/after smoke test, then fixed narrowly: the
    auto-detected heuristic no longer fires when `config.autoCastCloneLarvae`
    is on (Clone Ramp now owns that protection correctly and exactly); an
    explicit manual `cloneBufferMode: "post-clone-lock"` override is
    unaffected. No existing check/scenario asserts on `cloneBufferMode`/
    `POST_CLONE_LOCK` (confirmed by repo-wide grep), so this is a safe,
    scoped correction, not a behavior change for anyone with the new flag
    off.
- Implementation (`dev-src/runtime-sections/runtime-main.js`, rebuilt into
  `src/SwarmSim-Strategy-Autobuyer.user.js`):
  - New config default `autoCastCloneLarvae: true` (also set in
    `PRESETS.smart`, coerced in `normalizeConfig`), with a settings-panel
    checkbox and inline documentation of the narrow-exception invariant.
  - `runCloneRampPlanner`/`executeCloneRampGuardAction`: a fully independent
    execution path (never routed through the M6 six-domain
    coordinator/unified purchase evaluator, which keeps `ENERGY_ABILITIES`
    advisor-only by design - `M6-ABILITY-AUTHORITY` invariant untouched).
    Reports a structured phase (`IDLE`, `PREPARE_BANK`, `CAST_TO_GROW_BANK`,
    `FINAL_CAST`, `POST_CLONE_RELEASE`) computed fresh from real game state
    every cycle. Hard gates before any real command: `autoCastCloneLarvae`
    on; ability visible and `isBuyable()`; enough Energy for the real cost
    (`getCostForResource`); post-cast Energy stays at/above the existing
    Nexus/Energy reserve (`postNexusEnergyReserveSeconds`); advisor-only/
    safe-autobuy mode gates real execution exactly like every other planner.
    Casts via the same `buyUpgradeAmount(..., newDecimal(1), ...)` path used
    everywhere else (never a repeated/batched `Cast N`). Banks the cast's
    *own* real observed output (`larvaAfterCast - larvaBeforeCast`, bounded
    to at most current larva) into cocoons via `buyUnitAmount` with that
    exact amount - never `buyMax`. A `CLONE_RAMP_FULL_CAP_THRESHOLD_PERCENT`
    (99.9%) gate marks the next cast as the bounded full-cap cast; a
    `cloneRampReleasedAtCap` latch (cleared once bank falls back below the
    threshold) stops the ramp from re-casting every cycle once at cap,
    handing the action budget back to normal Meat progression.
  - Wired into `smartRunOnce()` right after the Energy step and before the
    legacy Clone Buffer Planner, gated by the same `canDoMoreMainActions()`
    budget as every other main-lane action (default `smartMaxActionsPerRun`
    unchanged).
  - `buildStrategyInspector`/Strategy Inspector rows/Council: added
    `cloneRamp*` fields and a new "Clone Ramp" Council advisor card so
    Council, Advisor log, and export/API observability show the same
    bank/cap/phase/reason as the executed action (no separate contradicting
    text).
- New live-Chrome acceptance check
  (`scripts/check-book00-clone-ramp-acceptance.js`,
  `check:book00:clone-ramp`, added to `npm run verify`): imports the same
  reported save into a disposable session and, from real game state only
  (never bot self-reports alone), proves over 6 real `runOnce()` cycles:
  1. Clone Ramp is the sole selected lane for the single bounded action slot
     ahead of any other lane (Meat/"Hive Network" included) when its gates
     pass.
  2. Each executed cycle performs exactly one real cast: Energy strictly
     decreases by a fixed real cost (`12000` in this save, identical across
     cycles within 1% tolerance).
  3. The cast's own output is banked into cocoons with an exact bounded
     amount (cocoon delta matches the reported banked amount within 2%);
     pre-existing larva is preserved (not devoured by an unbounded buy).
  4. Real bank-percent-of-cap strictly increases across consecutive growth
     cycles (observed `24.8% -> 49.6% -> 99.1%`).
  5. Exactly one `FINAL_CAST` cycle occurs across all 6 cycles (observed at
     cycle 4, bank `198%` of cap going in, cast output exactly the cap
     amount).
  6. After that cast, every subsequent cycle holds (`cloneRampCastExecuted
     === "no"`, `"Clone Ramp"` absent from the selected lane), proving the
     action budget returns to normal progression instead of re-casting
     forever at a flat, no-longer-growing output.
  7. House of Mirrors' real count never changes across any cycle, and
     `autoCastAbilities`/`energySupportBrokerAllowAutoCast`/`autoAscend`
     stay `false` throughout - no other ability leaks execution.
- Mutation control (performed locally against a disposable scratch copy of
  the built userscript, not committed, per the established M3/M6/live-
  purchase-acceptance methodology): replaced the real
  `buyUpgradeAmount(commands, cloneAbility, newDecimal(1), "Clone Ramp")`
  cast line with a no-op (`didCast = false`) in a throwaway copy of
  `src/SwarmSim-Strategy-Autobuyer.user.js` (the tracked file itself was
  never touched) and re-ran the acceptance check against that copy only:
  failed immediately and correctly at the very first assertion ("expected
  the single selected lane to be Clone Ramp... got Meat") - because a failed
  cast makes `runCloneRampPlanner` correctly report no action taken, so the
  action budget falls through to the legacy Meat buyer instead, which the
  check catches. Reverted by discarding the scratch copy (`git status`
  confirmed no tracked file was ever modified during this step).
- Commands and exit codes: `node -c dev-src/runtime-sections/runtime-main.js`
  -> `0`; `node scripts/build-canonical-userscript.js --write` -> rebuilt;
  `node -c src/SwarmSim-Strategy-Autobuyer.user.js` -> `0`;
  `node scripts/check-book00-clone-ramp-acceptance.js` -> `0` ("BOOK00 CLONE
  RAMP ACCEPTANCE PASSED", 4 executed cast cycles, 1 final-cast cycle,
  first real ability Energy cost `12000`, reproduced on a second standalone
  run); `npm run verify` -> every check up to and including the new
  `check:book00:clone-ramp` and the final `validate-repo-guardrails.js`
  passed (confirmed both inside and outside the full chain). One unrelated,
  pre-existing failure was found in the chain:
  `check:book00:territory-saturation` fails with "expected extreme state to
  classify as economically-saturated, got territoryEconomicState=not-
  evaluated" against live `swarmsim.com` state. Verified via a disposable
  git worktree at the exact pre-Clone-Ramp baseline commit (`29c6da6`, this
  package's `9.2.0`, no Clone Ramp changes present) that the identical
  failure reproduces there too, so it is not caused by this change; most
  likely live production game-state drift since that check was written. Out
  of scope for this narrow package per the narrow-change rule; left
  untouched and unfixed, flagged here for whoever picks it up next.
- Files changed: `dev-src/runtime-sections/runtime-main.js` (+ canonical
  rebuild `src/SwarmSim-Strategy-Autobuyer.user.js`),
  `scripts/check-book00-clone-ramp-acceptance.js` (new),
  `docs/test-data/clone-ramp/live-user-save.txt` (new, the reproduction
  save), `package.json` (new `check:book00:clone-ramp` script, appended to
  `verify`), `AGENTS.md`/`AI.md` (documented the narrow exception in Hard
  safety defaults), this handoff entry.
- Product capability changed: Smart Mode may now auto-cast Clone Larvae
  through the bounded Clone Ramp planner. No other ability gained execution
  authority; M6's `ENERGY_ABILITIES` domain remains advisor-only and
  unmodified; `m6DecisionOwnsMainCycle` stays `false`.
- Safety: `autoCastAbilities`, `autoAscend`, and
  `energySupportBrokerAllowAutoCast` remain `false` (verified per-cycle in
  the acceptance check); Nexus/Energy reserve protection is a hard gate
  before every cast; at most one real ability cast per `runOnce()` cycle;
  cocoon banking is exactly bounded, never `buyMax`.
- Remaining blocker: none for this package. The Clone Buffer Planner's other
  modes (`BUILDUP`/`MATURE`) and its percent-display formatting were not
  otherwise touched; a deeper rework of that planner (beyond the one
  auto-detection heuristic fixed here) remains a separate, future concern if
  further contradictions surface.
- Exact next action: none selected yet; awaiting next task from the user.

### 2026-07-14 - F7 closed: DEFAULT_CONFIG.unitStrategy now matches the Smart preset ("balanced")

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `90cd81dfece557bc314a38a6226f0bcc4b95ed5b` (9.1.0).
- Scope: audit finding F7 only (`unitStrategy` inconsistency between
  `DEFAULT_CONFIG` and `PRESETS.smart`). `DEFAULT_CONFIG.unitStrategy`
  changed from `"expensive-first"` to `"balanced"`; `PRESETS.smart.unitStrategy`
  was already `"balanced"` and is unchanged.
- Why this mattered beyond cosmetics: `config = loadConfig()` on a brand-new
  install (no saved localStorage) resolves to `DEFAULT_CONFIG` directly —
  `applyPreset("smart")`/`resetToRecommendedSettings()` are only invoked when
  the player explicitly clicks a preset button, not automatically on first
  load. Since `DEFAULT_CONFIG.preset`/`smartMode` already default to Smart
  mode, a fresh install was running Smart mode with `unitStrategy:
  "expensive-first"` — a value that diverges from what the Smart preset
  itself declares. `balanced` is now the intentional, documented Smart
  default from the very first run, not just after a preset is (re-)applied.
- Preserved exactly, per scope: ranking/scoring logic (`unitStrategy`'s three
  branches at the `config.unitStrategy === ...` checks are untouched);
  `"expensive-first"` remains a fully selectable manual choice (still used
  by the `safe`/`progression`/`unitsOnly` presets and the UI dropdown); any
  saved user config is unaffected, since `loadConfig()`'s
  `{ ...DEFAULT_CONFIG, ...saved }` merge already lets a saved
  `unitStrategy` (explicit or inherited from a prior session) win over this
  default.
- Commands and exit codes: `npm run build` -> `0`; `npm run verify` -> `0`
  (full chain, all prior checks including `check:book00:m8:false-wait` and
  `check:live-purchase-acceptance` unaffected).
- Files changed: `dev-src/runtime-sections/runtime-main.js` (+ canonical
  rebuild `src/SwarmSim-Strategy-Autobuyer.user.js`), this handoff entry.
- Safety: no hard-default, threshold, scoring, or lane-order change.
- Remaining blocker: none. This closes F7 as scoped; the `unitsOnly`/`safe`/
  `progression` presets' own `"expensive-first"` choices were left as-is
  (not part of F7, which only flagged the Smart-preset/DEFAULT_CONFIG
  mismatch).
- Exact next action: none selected; awaiting next task.

### 2026-07-14 - F3 closed: stall-breaker gate reads structured blockerCategories instead of regex-over-text

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `129ed68cab524d783e503d2fc3755ddc5367894b` (9.1.0). Preceded by an
  SA1 9.0.0-vs-9.1.0 comparison run (0 winner/decision differences across the
  7-scenario matrix; 9.1.0 scoring kept unchanged, no code touched for that
  step).
- Scope: audit finding F3 only. Replaced the two decision-affecting
  regex-over-text checks that gate the M8 stall breaker
  (`isMeatStallBreakerPatternReady`) with structured `blockerCategories`
  reads:
  - `countConsecutiveReserveAbilityBlockedMainHolds` and
    `countConsecutiveEtaGroundedReserveAbilityBlockedMainHolds` previously
    re-parsed the rendered `blockedBySummary` string
    (`.includes("reserve") && .includes("ability disabled")`). They now call
    a new `runHasLaneCandidateBlockerCategory(run, category)` helper that
    reads `run.laneCandidates[].blockerCategories` directly (already present
    on every run-history entry; no new fields needed).
  - `laneCandidateHasEtaStallSignal`'s text fallback (used only when
    `raw.etaImprovementSeconds`/`etaBeforeSeconds` are both absent) previously
    regex-tested `reason`/`blockers` text for `/eta|payback|reserve|not
    meaningful|below minimum/`. That exact condition is now classified once,
    at candidate-creation time, into a new `eta-stall-signal` category inside
    `classifyCandidateBlockers`; the fallback is now a pure
    `blockerCategories.includes("eta-stall-signal")` check.
  - `blockedBySummary`/`summarizeBlockerLabels` and the diagnostics-only
    `saveWindowRuns`/`classifyCoordinatorBudgetReason` regexes (UI/Inspector
    text only, confirmed not read back into any decision) were left
    unchanged, per scope.
- Added a narrow, additive test hook,
  `window.kbcSwarmBot.stallBreakerDiagnostics` (mirrors the existing
  `purchaseEvaluator` test-hook pattern), exposing the two count functions
  directly so a check can drive them without a full staged game cycle.
- New regression check
  `scripts/check-book00-f3-structured-stall-breaker.js`
  (`check:book00:f3:structured-stall-breaker`, added to `verify`): builds
  synthetic run histories with identical `blockerCategories` but (a) the
  original-style reason wording, (b) a harmless rewording that would not
  match the old text regex, and (c) a deliberately stale/misleading
  `blockedBySummary` string. Asserts all three produce the same hold count
  (3) for both the reserve+ability-disabled gate and the ETA-grounded gate —
  proving the decision no longer depends on reason/blocker wording.
- No scoring, lane order, threshold, or safety-default change. No general
  refactor; only the two decision-affecting text dependencies identified in
  F3 were touched (the `unlock` regex inside `evaluatePurchaseCandidate`
  scoring, and the UI/diagnostics-only save-window/coordinator-reason
  regexes, were explicitly left alone).
- Commands and exit codes: `npm run build` -> `0`;
  `node scripts/check-book00-f3-structured-stall-breaker.js` -> `0`;
  `node scripts/check-book00-m8-false-wait.js` -> `0`, identical result
  before and after (`blocker cycles=5, eta-grounded-by-cycle3=3,
  stall-breaker-cycle=3`), confirming behavior preservation on the one
  existing scenario that actually exercises this gate; `npm run verify` ->
  `0` (full chain, including the live purchase acceptance check from the
  prior handoff entry, unaffected).
- Files changed: `dev-src/runtime-sections/runtime-main.js` (+ canonical
  rebuild `src/SwarmSim-Strategy-Autobuyer.user.js`),
  `scripts/check-book00-f3-structured-stall-breaker.js` (new), `package.json`
  (new script, appended to `verify`), this handoff entry.
- Milestone checklist items completed: closes audit finding F3 (stall-breaker
  portion; save-window UI/diagnostics regexes were confirmed non-decision and
  intentionally left as-is).
- Remaining blocker: none. The `unlock`-regex component of
  `evaluatePurchaseCandidate`'s scoring (F2/F9, a separate concern) remains
  untouched, as scoped.
- Exact next action: none selected; awaiting next task.

### 2026-07-14 - Live purchase acceptance check implemented and wired into verify

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `703d892fcca5a5c64acf0a6337f88af8d05267aa` (9.1.0), clean working
  tree at start.
- Scope: implemented
  [BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md](BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md)
  exactly (test-harness-only; no `dev-src/`/`src/` runtime, scoring, or
  safety-default changes).
- Verified root cause (F4, restated and confirmed from source): nothing in
  `verify` exercised a real `runOnce()` cycle to prove an actual purchase.
  `check-unified-purchase-evaluator.js`/`check-book00-m2/m6/m7*.js` feed
  synthetic candidates directly into evaluator APIs; `check-book00-m8-false-wait.js`
  asserts a HOLD pattern by design (reserve multiplier 10000 makes a purchase
  impossible); `check-book00-m9-resource-scoped-locks.js` asserts lane BUY
  eligibility, not an executed purchase. This exact gap let
  `m6DecisionOwnsMainCycle = true` (commit `5639699`) ship as 6.0.0-8.1.0 with
  a fully green `verify` while the bot could not buy anything in live
  Autobuyer mode; the bug was only found by a player-supplied savestate and
  fixed in `35090b9` (9.0.0).
- Harness gap discovered during implementation (not in the original audit):
  the existing testbed's `unitCounts` staging permanently overrides a unit's
  `count()` with a synthetic `staged + rate*elapsed` formula. This formula
  never reflects real cost deduction from a real `buy()` call, so no existing
  scenario's `resourceBankBefore/After` can prove "resource delta consistent
  with cost" for a staged resource — production-only drift is all that ever
  shows. Fixed narrowly and additively in `strategy-audit-testbed-core.js`:
  added an opt-in `realResourceSeeds` scenario field that calls the game
  unit's own real `_setCount()` once during staging and then leaves `count()`
  untouched, so real production AND real `buy()` cost deduction both become
  observable from game state afterward. This is purely additive (new optional
  field, existing scenarios that don't set it are byte-identical in
  behavior); verified via the full `npm run verify` run below that no
  existing check's assertions changed.
- Also added (additive, non-breaking): `captureStateDigest` now accepts an
  optional list of extra unit keys to include in the resource digest (a
  scenario's new `trackedUnitKeys` field), and each cycle row now also
  exposes `laneCoordinatorSelectedActions` (the same array the M9 check's
  sibling scenarios already populate via `markSelectedLane`), giving the new
  check a named lane/candidate/amount to cross-check against real game state
  instead of inferring it.
- Implemented scenarios (`scripts/strategy-audit-testbed-core.js`):
  - `book00-live-purchase-legacy` (Scenario A): Meat lane isolated by
    disabling `meatGoalPlanner` and `larvaEnginePriority`, which empties
    `buildUnifiedPurchaseProposals` entirely (no Engine/Meat/Territory/Energy
    proposal), so M6 `executionAuthority` is structurally `false` all cycle.
    Real-seeds ample meat/larva; the only thing that can still buy is the
    `!m6DecisionOwnsMainCycle`-gated legacy `collectSmartUnitCandidates` /
    `buySmartUnits` generic smart-unit buyer, which is independent of
    `meatGoalPlanner`. `smartMaxActionsPerRun: 1` bounds the cycle to one
    action.
  - `book00-live-purchase-m6` (Scenario B): reuses the already-accepted
    Milestone 2 `book00-m2-coordinator` state verbatim (proven to make M6 and
    the M2 unified evaluator agree on Territory/army-seed with real
    `etaImprovementSeconds`), with one substantive change: `armyUnitCounts` is
    emptied. Discovered while investigating why a real-seeded `stinger`
    unit's count never changed after a reported "successful, matched" buy:
    the M2 scenario's `armyUnitCounts` (e.g. `"Stinger V"`) creates a
    fabricated, in-memory-only placeholder object with its own fake
    `__kbcIncrement` counter, and `commands.buyUnit` special-cases these
    placeholders and never touches real game state — so the original M2
    acceptance state's Territory buy was always executing against a fake
    object, not a real unit. Emptying `armyUnitCounts` forces the Territory
    army-seed candidate to resolve to a real game unit (`swarmling` in this
    staged state) so a genuine, observable count delta exists; `stinger` is
    moved from the synthetic `unitCounts` formula to real-count seeding
    (`_setCount`) purely so it stops competing as a fake option and instead
    shows up as an honest, unchanged negative control alongside `spider`/
    `mosquito`. Real resource-pool seeding (meat/larva) was also attempted for
    this scenario but produced an unexplained small net resource increase
    instead of a cost-consistent decrease (likely an interaction between the
    still-synthetic `swarmling` unit's cost-curve read and the real resource
    pool); reverted to the proven synthetic ample-resource staging for this
    scenario rather than chase that further, since the executed unit's own
    real count delta (independent of that pool) is already rigorous, exact
    proof. `smartMaxActionsPerRun: 1` bounds the cycle to the single
    M6-authorized action.
- `scripts/check-live-purchase-acceptance.js` (new): runs both scenarios via
  `runMode("live", ...)` (real Chrome against swarmsim.com, same mechanism as
  the M8/M9 checks) and asserts, from real game state only (never bot logs or
  eligibility flags):
  - Scenario A: `coordinatorExecutionAuthority === "false"` and
    `coordinatorExecuted === "no"` (proves the purchase is legacy-only, not
    M6); a named `laneCoordinatorSelectedActions[0]` on the Meat lane; the
    named candidate's real count strictly increased and matches the recorded
    bought amount within 1%; meat and larva both strictly decreased by an
    amount proportional to the purchase (real cost deduction); `mainActions
    >= 1`; no ability/ascension/mutagen lane shows `BUY`.
  - Scenario B: `coordinatorExecutionAuthority === "true"`,
    `coordinatorExecuted === "yes"`, `coordinatorMatchedExecution === "yes"`,
    and `coordinatorSelectedFingerprint === coordinatorExecutedFingerprint`;
    the executed unit's real count strictly increased and matches
    `coordinatorSelectedAmount` within 1%; `mainActions === 1` exactly
    (proves the legacy path did not also spend an execution key the same
    cycle); no ability/ascension/mutagen lane shows `BUY`.
- Concrete count/resource deltas observed (representative run; small
  fractional drift between runs is expected real production over the ~1-3s
  cycle wall-clock, well inside the check's tolerances):
  - Scenario A: candidate `drone`, count `0 -> 446` (delta 446, matches the
    recorded bought amount); `meat` decreased by ~4364-4373; `larva`
    decreased by ~445.8; `mainActions = 1`;
    `coordinatorExecutionAuthority = false`.
  - Scenario B: executed unit `swarmling`, count `220 -> 223` (delta 3,
    matches `coordinatorSelectedAmount = 3` exactly); `mainActions = 1`;
    fingerprint `Territory|territory|swarmling|swarmling|unit|base|House of
    Mirrors prep|3` (selected == executed).
- Mutation control (work order section 8), performed locally, not committed:
  1. Set `m6DecisionOwnsMainCycle = true` in
     `dev-src/runtime-sections/runtime-main.js`; `npm run build` -> exit `0`;
     `node scripts/check-live-purchase-acceptance.js` -> exit `1`, failing at
     "Scenario A: expected at least one legacy-path selected lane action
     (laneCoordinatorSelectedActions)" — i.e. no purchase happened, exactly
     reproducing the historical bug this check exists to catch.
  2. Reverted via `git checkout -- dev-src/runtime-sections/runtime-main.js
     src/SwarmSim-Strategy-Autobuyer.user.js`; `npm run build` -> exit `0`
     ("already up to date", confirming an exact revert);
     `node scripts/check-live-purchase-acceptance.js` -> exit `0`, green
     again with the same deltas as above.
- Commands and exit codes (final, on the clean reverted tree): `npm run
  verify` -> `0` (full chain, including `check:live-purchase-acceptance` and
  the pre-existing `check:book00:m8:false-wait` /
  `check:book00:m9:resource-locks`); `git diff --check` -> `0` (no output).
- Files changed: `scripts/strategy-audit-testbed-core.js` (real-seed staging
  mechanism, `trackedUnitKeys`/`captureStateDigest` extension,
  `laneCoordinatorSelectedActions` row field, two new scenarios),
  `scripts/check-live-purchase-acceptance.js` (new), `package.json` (new
  `check:live-purchase-acceptance` script, appended to `verify`),
  `docs/strategy/BOOK00_CURRENT_STATUS.md` (this entry). No `dev-src/`,
  `src/`, existing check assertions, or `AGENTS.md` safety sections touched;
  `git diff --stat` against the recorded baseline confirms only these files.
- Product capability changed: none (test-harness-only, per the work order's
  forbidden-changes list); no runtime, scoring, comparability, gate,
  threshold, lane-order, or hard-safety-default change.
- Safety: `autoCastAbilities`/`autoAscend` remain `false` throughout both
  scenarios (enforced by the existing harness's `stageCanaryState`, verified
  by the check's advisor-only-leak assertion); no Laboratory involvement; no
  new execution key.
- What this still does not prove (work order section 10, restated): that
  purchase decisions are strategically optimal; that the 9.1.0
  comparability/scoring shift is correct (needs the separate SA1 comparison);
  that advisor mode and autobuy mode produce identical decisions; behavior
  across the full mid/late-game state space. Additionally, specific to this
  implementation: Scenario B's shared ample-resource pool (meat/larva)
  remains synthetically staged rather than real-cost-deducted, so this check
  proves real cost deduction rigorously for Scenario A and proves an exact,
  matched, real unit-count delta for Scenario B, but does not independently
  prove Scenario B's resource-side cost arithmetic from a before/after
  decrease the way Scenario A does; and this check depends on
  swarmsim.com availability like every other live-Chrome check in `verify`.
- Milestone checklist items completed: closes the open work package selected
  in the prior audit handoff entry below.
- Remaining blocker: none for this package. The SA1 comparison (audit finding
  F2) and any `m6DecisionOwnsMainCycle` reconsideration remain open, separate
  work.
- Exact next action: run the SA1 9.0.0-vs-9.1.0 comparison described in
  `REPOSITORY_AUDIT_REVIEW_2026-07-14.md` section 10 item 5 before any
  scoring/comparability change.

### 2026-07-14 - Read-only repository audit recorded; live purchase acceptance selected as next work package

- Agent: Claude (Fable 5)
- Worktree/branch: primary workspace, `main`
- Scope: full read-only architecture/strategy/harness/AI-governance audit of
  the repository at `2eef0248a2d3ce8a01265ccbc537b2b97ff01c69` (9.1.0). No
  runtime, test, scoring, or safety-default changes were made during the
  audit or in this documentation package.
- Commands and exit codes during the audit:
  `node scripts/build-canonical-userscript.js --check` -> `0`;
  `npm run verify` -> `0` (full chain, including the live-Chrome
  `check:book00:m8:false-wait` and `check:book00:m9:resource-locks`).
- Full audit report (timestamped evidence for the audited commit, not
  permanent normative truth):
  [REPOSITORY_AUDIT_REVIEW_2026-07-14.md](REPOSITORY_AUDIT_REVIEW_2026-07-14.md).
- Key verified findings (details and file/line evidence in the report):
  three coexisting ranking systems with the fixed legacy lane order as the
  practical arbiter (F1); the 9.1.0 `projectedMilestoneProgressDelta` fix
  also shifted the executing evaluator's economicScore/confidence and
  triple-counts completion for Engine, live-unverified (F2); decision gates
  regex-parse free-text reasons (F3); no check in `verify` proves a real
  purchase happens through `runOnce()` in autobuy mode — the gap that let the
  6.0.0-8.1.0 "bot buys nothing" regression pass formal verification (F4);
  the in-runtime deterministic harness does not run the production cycle
  (F5); game-model documentation drift (F6).
- Product capability changed: none (documentation only).
- Safety: no hard-default or authority-boundary change; nothing in the audit
  package touches runtime files.
- Next open work package (selected):
  [BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md](BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md)
  — a verify-integrated acceptance check proving real autobuy purchases via
  count deltas, with mutation control against the historical
  `m6DecisionOwnsMainCycle` bug.
- Hard constraints recorded: no scoring/comparability change before the SA1
  9.0.0-vs-9.1.0 evidence run (audit report section 10 item 5); no M6
  main-cycle ownership before the purchase acceptance check exists and
  passes.
- Remaining blocker: none for this package.
- Exact next action: implement
  `BOOK00_LIVE_PURCHASE_ACCEPTANCE_FOUNDATION.md`.

### 2026-07-14 - M6 comparability gap closed for Engine/Meat/Energy purchase domains

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Baseline: `c014158cea82696cbdb18506045e60126c676116` plus the M9/M8 fixes above
  (uncommitted at start of this package).
- Context: known blocker noted in the M6 hotfix handoff below —
  `buildUnifiedPurchaseProposals` only populated `raw.etaImprovementSeconds`
  for the Territory proposal (and the pre-Nexus Lepidoptera ROI branch of
  Energy). Engine (Hatchery/Expansion), Meat (goal-planner action unit), and
  the Nexus-buyable/post-Nexus-Lepidoptera Energy branches never populated any
  M6-comparable metric, so `adaptPurchaseDomainOutcome` always returned
  `comparability.status = "UNRANKED"` for those three domains and they could
  never win or gain execution authority under the M6 six-domain coordinator,
  regardless of how strong the candidate was.
- Root cause: `sixDomainComparableValue` accepts either
  `outcome.milestoneEtaImprovementSeconds` (ETA basis) or
  `outcome.projectedMilestoneProgressDelta` (progress-delta basis, already a
  reserved M7 field used by the Ascension/Mutagen adapter), but
  `evaluatePurchaseCandidate`'s `sharedOutcome` never read or exposed
  `raw.projectedMilestoneProgressDelta`, and the three domains' proposal
  builders never set it (or an ETA improvement).
- Fix (per M7 rules: no generic weighted score, no fabricated zero, real
  grounded metric only):
  - `evaluatePurchaseCandidate`: added `projectedMilestoneProgressDelta` to
    `sharedOutcome` (sourced from `raw.projectedMilestoneProgressDelta`,
    `null` when absent) and to `evidenceFields`/`components` so confidence
    reflects the added evidence honestly.
  - Engine (Hatchery/Expansion) and Energy's Nexus-buyable branch: these are
    discrete one-time unlocks. When buyable, set
    `raw.projectedMilestoneProgressDelta = 100` — buying now completes the
    milestone this cycle (0% -> 100% owned) vs. waiting, which leaves it
    undone. Not set when not buyable (blocked candidates don't need ranking).
  - Meat goal-planner action unit: same completion-event basis — when the
    safety/reserve/payback guard passes (`safe === true`, decision BUY), set
    `projectedMilestoneProgressDelta = 100` alongside the existing
    payback/reserve `guard.raw` fields.
  - Energy's post-Nexus Lepidoptera branch: reused the already-computed,
    already-displayed `plan.boostGain` (Council's "Energy production gain")
    as the progress-delta value when `plan.ok`, rather than inventing a new
    number.
  - ETA-basis metrics are checked first in `sixDomainComparableValue`, so
    Territory and the Energy ROI branch (which already had real
    `etaImprovementSeconds`) are unaffected and keep their existing basis.
- Commands and exit codes: `npm run build` -> `0`;
  `node --check src/SwarmSim-Strategy-Autobuyer.user.js` -> `0`;
  `npm run check:book00:m6:six-domain` -> `0`;
  `npm run check:book00:m7:calibrated-outcomes` -> `0`;
  `npm run verify` -> `0` (full chain, including
  `check:book00:m8:false-wait` at `blocker cycles=5,
  eta-grounded-by-cycle3=3, stall-breaker-cycle=3` and
  `check:book00:m9:resource-locks`).
- Product capability changed: Engine, Meat, and Energy purchase proposals can
  now become `comparability.status = "COMPARABLE"` in the M6 six-domain
  coordinator (previously always `UNRANKED`), so M6 can honestly rank and, for
  bounded-reversible lanes, grant execution authority to whichever domain
  actually has the best evidence — not just Territory by default.
- Safety: no hard-default or authority-boundary change; abilities/ascension
  remain advisor-only; `m6DecisionOwnsMainCycle` stays `false` (legacy
  per-lane execution remains the acting purchaser; M6 can still claim
  execution for any lane it wins, guarded by `coordinatorExecutedKey` as
  before).
- Known follow-up (not fixed here, out of scope for a narrow fix): M6's
  cross-domain ranking (`evaluateSixDomainStrategicCoordinator`'s sort)
  compares `.value` numerically across domains without normalizing units —
  Territory/Energy-ROI report raw ETA-improvement-seconds while
  Engine/Meat/Energy-Nexus now report a 0-100 progress-delta scale. Both are
  "higher is better" reductions so the sort direction is correct, but the
  magnitudes are not unit-harmonized across domains. This is a pre-existing
  M6 design characteristic, not introduced by this fix, and a full
  cross-domain unit-harmonization is a larger, separate task.
- Milestone checklist items completed: closes the comparability-gap follow-up
  flagged in the "2026-07-14 - Critical fix: bot bought nothing in live play"
  and "2026-07-14 - M8 false-wait scenario re-tuned" handoff entries below.
- Remaining blocker: none for this fix. The cross-domain unit-harmonization
  noted above remains open if a future milestone wants strictly
  apples-to-apples ranking across all six domains.
- Exact next action: none selected yet; awaiting next milestone/task from the
  user (Milestone 10 - Council timeline and decision replay, or Milestone 11 -
  opt-in execution, are the next planned candidates).

### 2026-07-14 - Milestone 9 closed: resource-scoped save locks (guard already correct, added acceptance check)

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Scope: `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`.
- Finding: `shouldAvoidProtectedCost(item, protectedResources)` already checks
  whether a specific candidate's cost uses one of the currently protected
  resources, not whether ANY resource is protected. Combined with the
  `m6DecisionOwnsMainCycle` fix (every legacy lane evaluates every cycle),
  this means an active Expansion save window already only blocks
  Territory-costing candidates; Meat/Engine/Energy/Upgrade candidates are
  unaffected unless they themselves spend the protected resource. No global
  HOLD lock existed to fix.
- Verified via a new scenario, `book00-m9-resource-scoped-locks` (in
  `scripts/strategy-audit-testbed-core.js`): Expansion ETA (300s) inside its
  600s save window with an ample, safe Meat-chain buy available. Result:
  Territory lane = `HOLD` with `protected-resource` blocker category; Meat,
  Engine, and Upgrade lanes remained `BUY`-eligible in the same cycle.
- Added `scripts/check-book00-m9-resource-scoped-locks.js` asserting exactly
  that (Territory HOLD + protected-resource blocker, at least one
  non-Territory lane BUY, no advisor-only/ability/ascension execution leak).
  Wired into `package.json` as `check:book00:m9:resource-locks` and added to
  the `verify` chain.
- Commands and exit codes: `node scripts/check-book00-m9-resource-scoped-locks.js`
  -> `0`; `npm run verify` -> `0` (fully green, including the new check).
- Product capability changed: none (no runtime/userscript files touched);
  this closes M9 by adding proof of already-correct behavior, not new
  behavior.
- Safety: unaffected; `autoCastAbilities`/`autoAscend` remain default `false`;
  advisor-only domains remain non-executable (checked explicitly).
- Milestone checklist items completed: M9 contract (resource-scoped lock,
  Expansion/Territory case, authority/safety, diagnostics) verified and
  closed per `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`
  section 8 stop condition.
- Remaining blocker: none for M9. M6's comparability gap for
  Engine/Meat/Energy domains (still open, noted in the M8 handoff below) is
  unrelated.
- Exact next action: none selected yet; awaiting next milestone/task from
  the user.

### 2026-07-14 - M8 false-wait scenario re-tuned against the fixed legacy execution path

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Context: follow-up to the `m6DecisionOwnsMainCycle` fix below.
  `check:book00:m8:false-wait` failed with "expected ETA-grounded
  reserve+ability-disabled hold streak by cycle 3" once legacy execution was
  restored.
- Root cause: the scenario's synthetic state (`book00-m8-false-wait` in
  `scripts/strategy-audit-testbed-core.js`) had a genuinely buyable
  Hatchery/Expansion and, after that was isolated, a genuinely buyable
  Territory army-seed and meat-chain unit. With `m6DecisionOwnsMainCycle=true`
  none of these paths ever ran (even in advisor-only replay), so the scenario
  looked like a stable repeated-HOLD state purely by accident of the bug, not
  by design. With the fix, every legacy lane now evaluates for real (advisor
  mode still logs "WOULD BUY" and counts as a taken action), which broke the
  test's repeated-HOLD assumption.
- Fix: re-tuned the scenario (not the test's assertions) to isolate the Meat
  lane as intended:
  - Disabled `larvaEnginePriority`, `prioritizeProductionUpgrades`,
    `territoryPrepPlanner`, `expansionArmySeedPlanner`,
    `territoryArmySeedWhenEmpty`, `territoryRoiMode`, and set
    `focusTab: "meat"` so Engine/Territory/Upgrade lanes can no longer
    produce a main action, leaving Meat as the only evaluated lane.
  - Adjusted `unitCounts` (larva, meat, drone, queen, nest, greaterqueen) so
    the meat-chain goal planner resolves to a genuinely buyable but
    meat-chain-internal conversion step (queen -> nest -> greater queen)
    instead of "not buyable yet" or a base-resource (larva/meat) purchase
    that bypasses the meat-chain reserve/payback guard entirely.
  - Raised `meatChainReserveMultiplier` to `10000` for this scenario only, so
    the reserve guard deterministically fails and the resulting `HOLD` lane
    candidate carries a genuine `reserve`/`payback`-worded reason (needed for
    `etaGroundedReserveAbilityHoldRuns` to count it), rather than relying on
    exact real-game cost-curve numerics.
  - Verified via a throwaway debug harness (reusing
    `strategy-audit-testbed-core.js`'s existing `runMode`/live-scenario
    plumbing, not a new test system) that all 5 cycles now produce a
    genuine main-action HOLD with `hardBlockers` including `reserve` and
    `ability disabled`, `etaGroundedReserveAbilityHoldRuns` reaching `2` by
    cycle 3, and `stallBreakerActive` flipping `true` at cycle 3.
- Commands and exit codes: `node scripts/check-book00-m8-false-wait.js` -> `0`
  (`blocker cycles=5, eta-grounded-by-cycle3=3, stall-breaker-cycle=3`);
  `npm run verify` -> `0` (fully green).
- Product capability changed: none; this is a test-harness-only change
  (`scripts/strategy-audit-testbed-core.js`). No runtime/userscript files
  touched in this pass.
- Safety: none affected; scenario-only config overrides are scoped to this
  one deterministic test scenario and do not touch `AI.md`/`DEFAULT_CONFIG`
  production defaults.
- Milestone checklist items completed: closes the last open M8/8.1.0 hotfix
  follow-up (the M8 test re-tune noted below).
- Remaining blocker: M6's comparability gap for Engine/Meat/Energy domains
  (missing `etaImprovementSeconds`/commonValue in
  `buildUnifiedPurchaseProposals`) is still open and unrelated to this fix;
  it should be addressed before M6 is relied on as the primary purchase
  authority again.
- Exact next action: start Milestone 9 (resource-scoped save locks) from
  `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`.

### 2026-07-14 - Critical fix: bot bought nothing in live play (m6DecisionOwnsMainCycle)

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Reported by: player-supplied live savestate where Autobuyer mode never
  bought anything despite Hatchery showing "immediately buyable" in the
  Council decision card; Coordinator showed "Refused/fallback",
  Execution "Not executed", strongest blocker "reserve, ability disabled".
- Root cause: `dev-src/runtime-sections/runtime-main.js` had
  `const m6DecisionOwnsMainCycle = true;` hardcoded in `smartRunOnce`. This
  disabled every legacy execution path (Larva engine, Energy, Clone buffer,
  Unlock planner/Meat, Smart upgrades, Smart units), leaving purchases
  entirely dependent on the M6 six-domain coordinator's execution-authority
  gate. That gate requires a comparable milestone-eta metric
  (`etaImprovementSeconds` or an equivalent commonValue), but only the
  Territory proposal in `buildUnifiedPurchaseProposals` ever populates it;
  Engine, Meat, and Energy proposals never do, so those domains are
  permanently `UNRANKED` and can never receive execution authority. Net
  effect: the bot could observe/advise but never actually buy anything in
  Autobuyer mode, regardless of preset or settings.
- Secondary finding: the M8 8.1.0 stall-breaker acceptance
  (`check:book00:m8:false-wait`) was inadvertently validated against this
  same broken state. With `m6DecisionOwnsMainCycle=true`, `buySmartUnits`
  (which contains the actual meat-fallback/stall-breaker purchase logic)
  was never called; the test only observed a diagnostic
  `stallBreakerActive` flag driven by the artificial always-HOLD run
  history, not a real fallback purchase. The M8 closure record should be
  treated as unverified for real fallback-purchase behavior until this is
  re-tested.
- Fix: set `m6DecisionOwnsMainCycle = false` in
  `dev-src/runtime-sections/runtime-main.js`, restoring legacy per-lane
  execution as the acting purchaser (guarded by `coordinatorExecutedKey`
  checks so a lane M6 did win isn't double-bought same cycle). Ran
  `npm run build` to rebuild the canonical
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
- Commands and exit codes: `npm run build` -> `0`; `npm run verify` -> `1`
  (fails only at `check:book00:m8:false-wait`; all other checks in the
  chain passed, including `check:book00:m6:six-domain` and
  `check:book00:m7:calibrated-outcomes`).
- Product capability changed: Autobuyer mode can once again execute
  Hatchery/Expansion, Energy/Nexus, meat-chain unlock, Clone buffer, and
  generic Smart upgrade/unit purchases in live play. M6's Council UI and
  advisory output are unaffected; M6 still claims execution for any lane it
  can legitimately win under its own comparability rules.
- Safety: no hard-default or authority-boundary changes; ability/ascension
  auto-cast remain off; this only restores previously-shipped (M2-M5)
  purchase logic that had been silently dead code since M6 was wired in.
- Milestone checklist items completed: none formally; this is a hotfix on
  top of the accepted 8.1.0 baseline, not new M9 scope.
- Remaining blocker: `check:book00:m8:false-wait` needs its deterministic
  scenario re-tuned to assert on real fallback-purchase behavior (via
  `buySmartUnits` actually running) rather than the diagnostic
  `stallBreakerActive` flag alone. M6's comparability gap for
  Engine/Meat/Energy domains (missing `etaImprovementSeconds`/commonValue)
  is also still open and should be addressed before M6 is relied on as the
  primary purchase authority again.
- Exact next action: re-tune `scripts/check-book00-m8-false-wait.js` and
  its scenario against the now-functional legacy execution path, get
  `npm run verify` fully green, then proceed to Milestone 9.

### 2026-07-14 - AI.md 8.1.0 hard-defaults documentation sync

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`
- Product capability changed: none; documentation-only correction.
- Change: `AI.md`'s hard-defaults reference block still listed the
  pre-8.1.0 numeric values (`smartUnitBuyPercent: 0.25`,
  `meatChainReserveMultiplier: 2`, `meatChainMaxPaybackSeconds: 1800`); these
  are updated to the accepted 8.1.0 tuned values (`0.35`, `1.25`, `3600`) per
  `docs/release-notes/SwarmSim-Strategy-Autobuyer-8.1.0-release-notes.md`, so
  the reference block no longer contradicts the accepted 8.1.0 defaults.
- Commands and exit codes: `npm run verify` -> `0` (same M8 focused result:
  `blocker cycles=5, eta-grounded-by-cycle3=3, stall-breaker-cycle=3`).
- Generated evidence paths: none (documentation-only change; no runtime
  behavior touched).
- Milestone checklist items completed: closes the last open M8/8.1.0 follow-up
  noted in the prior handoff entry.
- Remaining blocker: none. Milestone 8 (including 8.1.0) is fully closed with
  no outstanding follow-ups.
- Exact next action: start Milestone 9 (resource-scoped save locks) from
  `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`.

### 2026-07-14 - M8/8.1.0 formal closure (exact-SHA verification)

- Agent: Claude (Sonnet 5)
- Worktree/branch: primary workspace, `main`; isolated verification worktree
  `../SwarmSim-verify-c014158` (detached at the implementation SHA)
- Product capability changed: none beyond the already-authored 8.1.0 Smart
  default tuning and M8 stall-breaker visibility; this package commits,
  pushes, and formally verifies that already-completed work.
- Implementation SHA: `c014158cea82696cbdb18506045e60126c676116`
- Implementation tree SHA: `ab2554626960fabfb699a73584efd421502f1af0`
- Verification worktree HEAD/tree: matched the implementation SHA/tree exactly
- `origin/main` observed during verification: `c014158cea82696cbdb18506045e60126c676116`
  (equal to the implementation SHA)
- Commands and exit codes (identical in primary workspace and verification
  worktree):
  - `node --check src/SwarmSim-Strategy-Autobuyer.user.js` -> `0`
  - `node scripts/validate-repo-guardrails.js` -> `0`
  - `npm run build:check` -> `0`
  - `npm run verify` -> `0` (build check, `check:0.12.3:laboratory`,
    `check:8.1.0:versions`, `check:ui-shell`, `check:ui2:fixtures`,
    `check:ui3:assets`, `check:laboratory:phase2a`,
    `check:purchase-evaluator`, `check:book00:m2:coordinator` through
    `check:book00:m8:false-wait`, guardrails)
  - `git diff --check` -> `0`
- Focused M8 result (both runs): `blocker cycles=5,
  eta-grounded-by-cycle3=3, stall-breaker-cycle=3`
- Evidence files: none generated; every command in the suite was a pure check
  against this repo's configuration, so this status-board entry is the
  provenance record.
- Safety: hard irreversible defaults (`autoCastAbilities`, `autoAscend`,
  Nexus/Energy protection, no Clone Larvae/House of Mirrors/Nightbug/Bat
  auto-cast) unchanged. Smart-mode economic thresholds
  (`smartUnitBuyPercent`, `meatChainReserveMultiplier`,
  `meatChainMaxPaybackSeconds`, meat-fallback knobs, save-window seconds) were
  intentionally tuned for 8.1.0 as documented in the release notes and
  `docs/SWARMSIM_GAME_MODEL.md`; `AI.md`'s supplementary hard-defaults list has
  been refreshed to the accepted 8.1.0 numeric values (see the 2026-07-14
  documentation-sync handoff entry below).
- Excluded from the commit: `docs/test-data/*` generated run artifacts
  (disposable per repository policy) and a stray untracked
  `tmp-user-save.txt` scratch file at repo root, unreferenced by any script.
- Final sync gate: `HEAD` equals `origin/main` at
  `c014158cea82696cbdb18506045e60126c676116`; primary working tree is clean of
  tracked changes.
- Milestone checklist items completed: Milestone 8 formal closure (all
  checklist items above).
- Remaining blocker: none for M8. `AI.md` hard-defaults numeric drift noted
  above is a follow-up documentation task.
- Exact next action: start Milestone 9 (resource-scoped save locks) from
  `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`.

### 2026-07-14 - M8 strict closure sync (cycle-3 stall-breaker visibility)

- Agent: Copilot (GPT-5.3-Codex)
- Worktree/branch: primary workspace, `main`
- Product capability changed: M8 stall-breaker activation is now surfaced in
  Inspector as soon as the ETA-grounded blocker pattern is active, even when
  the same cycle still denies execution through existing safety/execution
  gates.
- Player-visible result: repeated `reserve` + `ability disabled` HOLD windows
  now report stall-breaker activation by hold cycle 3 in focused replay.
- Runtime changes:
  - `dev-src/runtime-sections/runtime-main.js`
  - `src/SwarmSim-Strategy-Autobuyer.user.js` (canonical rebuild)
- Verification contract:
  - `scripts/check-book00-m8-false-wait.js` now requires visible
    stall-breaker activation no later than cycle 3.
- Commands and exit codes:
  - `npm run build` -> `0`
  - `npm run check:book00:m8:false-wait` -> `0`
  - `npm run verify` -> `0`
  - `git diff --check` -> `0`
- Focused result: `blocker cycles=5`, `eta-grounded-by-cycle3=3`,
  `stall-breaker-cycle=3`.
- Safety: hard defaults unchanged; advisor-only Ability/Ascension/Mutagen
  authority remains non-executable.
- Exact next action: run exact-SHA implementation/evidence separation per
  `docs/process/GIT_VERIFICATION_PROTOCOL.md` when formal acceptance artifacts
  are requested.

### 2026-07-14 - M8 ETA-grounded blocker slice and focused verification

- Agent: Copilot (GPT-5.3-Codex)
- Worktree/branch: primary workspace, `main`
- Product capability changed: accelerated false-wait gating now requires
  repeated ETA-grounded HOLD evidence in addition to repeated
  `reserve` + `ability disabled` blocker identity.
- Player-visible result: Inspector/audit diagnostics now expose
  ETA-grounded hold streak counts for the M8 blocker slice.
- Runtime changes:
  - `dev-src/runtime-sections/runtime-main.js`
  - `src/SwarmSim-Strategy-Autobuyer.user.js` (canonical rebuild)
- Tooling/verification changes:
  - `scripts/strategy-audit-testbed-core.js` (M8 focused scenario + cycle diagnostics)
  - `scripts/check-book00-m8-false-wait.js` (focused Chrome replay gate)
  - `package.json` (`check:book00:m8:false-wait` + full verify chain)
- Commands and exit codes:
  - `npm run build` -> `0`
  - `npm run check:book00:m8:false-wait` -> `0`
  - `node scripts/validate-repo-guardrails.js` -> `0`
  - `npm run verify` -> `0`
  - `git diff --check` -> `0`
- Generated evidence paths:
  - `docs/test-data/strategy-audit-0/book00-m8-false-wait/live/*`
- Safety: hard defaults unchanged; advisor-only Ability/Ascension/Mutagen
  execution authority remains unchanged.
- Remaining blocker: focused replay now confirms ETA-grounded blocker streak by
  cycle 3, but this deterministic replay does not yet reproduce a concrete
  meat fallback execution cycle (`stall-breaker-cycle=not-triggered-in-focused-replay`).
- Exact next action: refine the M8 focused state so a legal blocked top Meat
  candidate and lower bounded fallback candidate both appear in the same
  repeated blocker window, then re-run the focused Chrome replay and keep
  fallback activation at hold cycle 3 or earlier.

### 2026-07-14 - Pre-M8 wait-lock hotfix

- Agent: Copilot (GPT-5.3-Codex)
- Worktree/branch: primary workspace, `main`
- Baseline: runtime `7.0.0` with M7 calibrated outcomes and preserved Council UI3/fixed-window behavior.
- Product capability changed: Meat stall-breaker can now activate earlier when repeated main HOLD cycles are consistently caused by the blocker pattern `reserve` + `ability disabled`; accelerated fallback activation threshold is capped at `2` (still bounded by existing safety gates).
- Player-visible result: fewer false `Wait` loops in Smart mode when advisor-only ability opportunities exist but no executable lane buys pass under the standard hold-run threshold.
- Safety: hard defaults unchanged; no auto-cast, no auto-ascend, no new execution keys, and reserve/protected-resource guards remain enforced.
- Runtime changes:
  - `src/SwarmSim-Strategy-Autobuyer.user.js`
  - `dev-src/runtime-sections/runtime-main.js`
- Tooling changes:
  - `scripts/strategy-audit-testbed-core.js` (supports `--browser-channel` / `--channel`)
  - `scripts/run-sa1-breakpoint-matrix.js` (propagates browser-channel in shared and isolated matrix runs)
  - `package.json` (`strategy:audit:live:chrome`, `strategy:audit:matrix:sa1:chrome`, `strategy:audit:matrix:sa1:single:chrome`)
- Commands and exit codes:
  - `npm run build` -> `0`
  - `node scripts/validate-repo-guardrails.js` -> `0`
  - `npm run check:book00:m7:calibrated-outcomes` -> `0`
  - `node scripts/strategy-audit-testbed-live.js --browser-channel chrome --scenario canary --cycles 1 --headed false --keep-open false --leave-open-on-failure false` -> `0`
  - `git diff --check` -> `0`
- Generated evidence paths: none.
- Remaining blocker: M8 milestone ETA models are still not implemented; this hotfix only reduces pre-M8 false waits.
- Exact next action: replay the reported live state in Google Chrome and verify that fallback activation appears no later than hold cycle 3 (given decision-time history lag and accelerated threshold cap 2) when blocker history remains `reserve, ability disabled`, then proceed with the scoped M8 meat ETA slice.

### 2026-07-13 - Milestone 6 closure and Milestone 7 foundation

- Agent: Codex
- Worktree/branch: `codex/m7-calibrated-outcomes-foundation`
- Baseline: current `origin/main` at fixed Council window commit
  `04bb94678ba9ac29d03e2b2c00760ffb40510e55`, retaining Council UI3 commit
  `40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5`.
- M6 closure: implementation `9da1b2312cc603c29f9d3add2270499fdbc1b269`,
  tree `c94a2e8e0b8487715a4b69b7bc7fe8960bc9a089`, evidence
  `60297dfbd8b686affd701258db40e94fb8ce3c53`.
- Product capability changed: none; this package closes stale M6 status and
  defines the implementation-ready M7 calibration slice.
- Player-visible result: none until M7 is implemented as `7.0.0`.
- Authored foundation paths:
  - `docs/strategy/BOOK00_M7_CALIBRATED_SHARED_OUTCOMES_FOUNDATION.md`
  - `docs/test-data/7.0.0-book00-m7-calibrated-outcomes/m7-calibration-contract-manifest.json`
  - `docs/prompts/implement-book00-m7-calibrated-shared-outcomes.md`
- Safety: no runtime, strategy, authority, threshold, or hard-default change.
- UI preservation: M7 explicitly retains Council UI3, fixed `1180 x 700`
  desktop layout, movable/no-resize behavior, responsive sizing, and layout key
  `kbcSwarmBotCouncilPanelLayout_v2`.
- Generated evidence paths: none; manifest and prompt are authored contract
  data, not execution evidence.
- Pre-commit checks: `npm run build`, `npm run check:ui-shell`,
  `npm run check:ui2:fixtures`, `npm run check:ui3:assets`, `npm run verify`,
  `git diff --check`, and `node scripts/validate-repo-guardrails.js` exited `0`.
- Exact next action: run the M7 Copilot work order from a clean dedicated
  branch based on current `origin/main`.

### 2026-07-13 — Milestone 6 foundation and Copilot handoff

- Agent: Codex
- Worktree/branch: primary workspace, `main`
- Baseline: integrated M5 evidence commit
  `af6a41b9534b6ff682a2903d938fa17686a3a9d2`.
- Product capability changed: none; this is the implementation-ready M6 shared
  identity, domain outcome, comparability, effect-ledger, authority, execution,
  observability, coverage, acceptance, version, and Git/evidence package.
- Player-visible result: none until the M6 work order is implemented as
  `6.0.0`.
- Authored foundation paths:
  - `docs/strategy/BOOK00_M6_SIX_DOMAIN_COORDINATOR_FOUNDATION.md`
  - `docs/test-data/6.0.0-book00-m6-six-domain/m6-domain-contract-manifest.json`
  - `docs/prompts/implement-book00-m6-six-domain-coordinator.md`
- Generated evidence paths: none; the M6 manifest is authored contract data,
  not execution evidence.
- Safety: no runtime change, no new execution key, and no authority change.
- Milestone checklist items completed: implementation prerequisites and the
  twelve-group focused acceptance contract are defined.
- Remaining blocker: M6 runtime implementation, `6.0.0` release surfaces,
  focused acceptance, and exact-SHA evidence.
- Exact next action: create `codex/m6-six-domain-coordinator` from the clean
  foundation commit and execute
  `docs/prompts/implement-book00-m6-six-domain-coordinator.md`.

### 2026-07-13 — Milestone 5 implementation foundation and Copilot handoff

- Agent: Codex
- Worktree/branch: isolated `codex/m5-ascension-mutagen-advisor`
- Baseline: verified M4 evidence commit
  `b9040d5943e621e6f41c6d247794e6866859ff64`.
- Product capability changed: none; this is the implementation-ready M5 source,
  contract, acceptance, safety, version, and Git/evidence package.
- Source verification: SwarmSim commit
  `06b4f404aa324a0b454348508cfa63d5c0f1ff54`; Ascension/reset semantics,
  Mutagen production/unlock costs, and mutation effect functions/constants are
  captured in a machine-readable manifest.
- Player-visible result: none until Copilot implements the work order.
- Generated evidence paths: none; the formula manifest is authored foundation,
  not execution evidence.
- Milestone checklist items completed: implementation prerequisites and focused
  acceptance matrix defined.
- Remaining blocker: runtime implementation and exact-SHA M5 acceptance.
- Exact next action: execute
  `docs/prompts/implement-book00-m5-ascension-mutagen-advisor.md` in the isolated
  M5 worktree.

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
  `npm run check:book00:m3:energy:execution`,
  `npm run check:book00:m2:coordinator`, and `git diff --check` all exited `0`;
  no retained evidence was generated.
- Focused acceptance: supported Lepidoptera and protected Nexus winners pass;
  a blocked Nexus gate and Clone Larvae candidate are denied; M2 exact Territory
  execution remains matched. The disposable production-parity scenario executes
  `Energy: Lepidoptera x5` through canonical `unit:moth`, reports
  `matchedExecution=yes`, verifies reset, and reports no state leakage.
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

### 2026-07-13 — Milestone 5 implementation started on stacked M5 branch

- Agent: Copilot
- Worktree/branch: isolated `codex/m5-ascension-mutagen-advisor`
- Base commit verified present: `b9040d5943e621e6f41c6d247794e6866859ff64`
- Product capability in progress: advisor-only M5 Ascension and Mutagen
  comparison with immutable snapshot branches, recovery uncertainty handling,
  and direct Hatchery-versus-KEEP_UNALLOCATED mutagen analysis.
- Player-visible result: pending final verification and evidence commit.
- Scope guard: no Ascension execution authority, no Mutagen spending authority,
  and M4 safety defaults preserved.
- Exact next action: complete implementation, run focused acceptance and full
  verification on exact implementation SHA, then push separate evidence.
