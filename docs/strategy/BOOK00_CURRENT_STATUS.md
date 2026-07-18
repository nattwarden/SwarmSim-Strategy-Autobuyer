# BOOK-00 Current Execution Status

Status: Active handoff board. Update this file at every completed work package,
blocked handoff, milestone transition, and accepted verification result.

Last reviewed: 2026-07-18

## 9.4.0 clean-room recovery (2026-07-16)

The rejected `feature/9.4.0-global-execution-ownership` series remains research
material only. Product reconstruction now runs on
`codex/9.4.0-clean-room`, created from exact main baseline
`da1fcede6419b8124b11004c7562819b67180330`.

The reconstruction proceeds in formally verified slices. Each slice's full
narrative, commands, exit codes and mutation controls live in its exact-SHA
evidence file under `docs/test-data/9.4.0-clean-room/`; the architectural
findings, per-slice contracts and readiness gates live in
[GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md](GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md).

Completed slices (implementation SHA / evidence SHA / evidence file):

- Phase 1 - reproducible clean baseline: exact-SHA worktree reproduces the
  untouched baseline with a clean tree.
  `68b77d0a5bd45c005c28a956b5ca15d731bf69d0` /
  `f31e962c14125f9fda8f4d5b8c83716259ba0630` / `verification-68b77d0.md`.
- Phase 2 slice 1 - shared target/decision identity:
  `getCurrentStrategyIdentity()` resolves milestone and active target from
  one planner branch for both M6 snapshot and Inspector/Council.
  `bba78650d706f9fdade2fff57214117b255d3f8d` /
  `18adc8a3c92fa5c391efeab3fb3998e4b9f26608` / `verification-bba7865.md`.
- Phase 2 slice 2 - canonical proposal identity versus decision authorization
  identity: `canonicalProposalId` excludes amount/display text;
  `authorizationId` binds action to cycle/snapshot/target
  (observability-only). Runtime
  `21111d15d3e833673a8d6c6d7201ed20d402ae18`, exact verified
  `cf7d0cfc88759e14069c569f12a1830fe02d53c9` /
  `8820aa9b90f32c4cbea893f4660f1d048e472a51` / `verification-cf7d0cf.md`.
- Phase 2 slice 3 - stale authorization: M6 must reproduce the fresh
  authorization for its plan or fail closed as `STALE_AUTHORIZATION`.
  `7ce5e72166cc0ed2698ce0ca6f0c2f3cb0d74d61` /
  `01a9214e27d08762c2e57fa2b635bd60d5b28ff3` / `verification-7ce5e72.md`.
- Phase 2 slice 4 - four-value amount contract: authorized, command,
  confirmed and observed amounts stay separate exact Decimal strings with no
  production clamp; mismatch fails closed as `AMOUNT_CONTRACT_VIOLATION`.
  `46961aed6c9e3d728fd1587df16dc6e83cd54824` /
  `05a67972160fd4b37796f2c60d46b264b1e94a5a` / `verification-46961ae.md`.
- Phase 3 slice 1 - reject false-zero shared metrics: `null`/`undefined`/
  empty ETA evidence stays `UNRANKED`; explicit zero stays comparable.
  `21aa76ab03f5b75b2da32ecdc2db7aa7ee4d6b6a` /
  `b91fbf939c54de93be0c203c7ea3ca981babe815` / `verification-21aa76a.md`.
- Phase 3 slice 2 - active-target metric alignment: every metric declares
  `metricTarget` and ranks only on an exact active-target match.
  `e9926c57c0bc7b21bb4fb9be6a20c33ed4c9d6e5` /
  `02d0db9b0d71d3e7a6d0fb84d964c638a285e2da` / `verification-e9926c5.md`.
- Phase 3 slice 3 - metric-basis integrity: one exact metric id/unit/basis
  contract per cycle; declared completion deltas count once in M2.
  `19822e1e0eb2fe364d6393d9bfb0f19d1f8bd66c` /
  `6ec3c9a6cb855eafa4c5d118faf6538fe3898091` / `verification-19822e1.md`.
- Phase 3 slice 4 - honest same-contract product comparison: horizon id and
  seconds join the contract; first real bounded-Territory versus
  advisor-only House of Mirrors pair on one exact Expansion ETA contract.
  `9717d09c702a9757dc6009fcd3bfa98abe3a7cc6` /
  `d8fc2d51bcf57d8cee425a76957b6009886ed205` / `verification-9717d09.md`.
- Phase 3 slice 5 - advisor-only winner fallback and coverage inventory: an
  advisor-only winner never suppresses the reversible legacy fallback;
  scenario affordability can no longer borrow the imported live bank.
  `295fd71aa9b910105ab45090e86a2f265c2b748e` /
  `bfe304dcfbe3433d15fbf6412b9ec9f02cc5301d` / `verification-295fd71.md`.
- Phase 3 slice 6 - proposal-coverage ledger and WAIT preconditions: ten
  source-grounded `smartRunOnce` callsites bind to
  `main-cycle-coverage-ledger.v1`; WAIT stays advisor-only until complete
  coverage plus same-cycle evidence exist.
  `230499b57f4b24f3f22b3b9ba37249cbc888d958` /
  `67ceee6ba23f889744a30988aecad8876dcfc66e` / `verification-230499b.md`.
- Phase 3 slice 7 - same-cycle legacy applicability evidence: all ten paths
  record snapshot/cycle-bound dispositions from the real cycle;
  `SKIPPED_GLOBAL_M6_OWNERSHIP` can never prove its own prerequisite.
  `495513c660909cce9390af2a923256d8ecf52c23` /
  `04bdc78de4447d274dd2408f08e85520dac3cf98` / `verification-495513c.md`.
- Phase 3 slice 8 - critical production-upgrade path boundary
  (`critical-upgrade-path-boundary.v1`): exact proposal identity,
  cycle-bound authorization, fail-closed amount `1` and full outcome
  accounting on `handleCriticalProductionUpgrades`.
  `e47c308e3d4398f5d5e431f1715ecfce00e78810` /
  `18137fbbf466ec135ebe9098387f6f44b941949c` / `verification-e47c308.md`.
- Phase 3 slice 9 - generic Smart-upgrade path boundary
  (`smart-upgrade-path-boundary.v1`): the buy-max command is bounded by the
  exact authorized percent and confirmed by the real upgrade-count delta;
  the target-aware delegation is an explicit accounted branch.
  `84fa70e4a3f4e7c2c8d8dfaebb1e84349428fb4b` /
  `acc5ba58bd6447255d89496d3da6b1b99162c9b0` / `verification-84fa70e.md`.
- Phase 3 slice 10 - generic Smart-unit path boundary
  (`smart-unit-path-boundary.v1`): the ranked queue's own buy is bounded by
  an exact per-candidate amount; ascension pause, meat-guard planner,
  territory guards and chain prep are explicit accounted branches. One
  transient live failure was discarded per protocol and is recorded in the
  evidence. `9a2e2c8e5b4743d4d9048c55131dc14994d758f0` /
  `f3e3b01b6c11d8c60857dfc4cf6a9c10002e8120` / `verification-9a2e2c8.md`.
- Phase 3 slice 11 - Larva Engine guard path boundary
  (`larva-engine-guard-path-boundary.v1`): existing Expansion/Hatchery buys
  carry exact proposal identity, cycle-bound authorization, fail-closed amount
  `1`, and explicit execute/block/not-applicable accounting.
  `c0101cc1055fac8f82b81202771c3f1e3cee29e7` /
  `901822eec3e250608076d5afd0a7c09249ac5237` / `verification-c0101cc.md`.
- Phase 3 slice 12 - Energy guard path boundary
  (`energy-guard-path-boundary.v1`): Nexus and both existing Lepidoptera
  purchases carry exact identity, cycle-bound authorization and real-delta
  amount confirmation. `d550fb5b7199f78047b7ac809b197a7eedd31683` /
  `4452a29` / `verification-d550fb5.md`.
- Phase 3 slice 13 - Clone Ramp guard path boundary
  (`clone-ramp-guard-path-boundary.v1`): the narrow, user-authorized Clone
  Larvae auto-cast exception now emits a boundary for each real command - the
  single amount-`1` cast (confirmed by `real-upgrade-count-delta`) and, on a
  growth cast, the exact cocoon bank (confirmed by `real-unit-count-delta`) -
  each with canonical identity, cycle-bound authorization and a fail-closed
  identity/amount check. Live boundary proof against the pinned Clone Ramp
  save reports `PROVEN` with a two-proposal `EXECUTED` boundary. Strategy,
  cast/bank amounts, reserve/visibility gates, release-at-cap behavior and the
  `autoCastCloneLarvae` exception boundary are unchanged; M6 coverage stays
  `NONE`. `23fdf2a52ec58bcd3b230cbec9b2ab81bcf52aac` /
  `83a46c3` / `verification-23fdf2a.md`.
- Phase 3 slice 14 - Clone Buffer guard path boundary
  (`clone-buffer-guard-path-boundary.v1`): both retained ledger rows -
  `CLONE_BUFFER` and its budget-exempt `CLONE_BUFFER_HARD_LOCK_RECOVERY`
  branch, which share `executeCloneGuardAction`/`runCloneBufferPlanner` - emit
  a boundary for the one real command, the hard-lock cocoon recovery buy, with
  canonical identity, cycle-bound authorization (per-row `pathId` threaded
  through both callsites) and a fail-closed identity/amount check bounding the
  command to the authorized amount. Because the recovery amount is a
  large-magnitude unit count whose delta carries `Decimal` precision noise,
  `EXECUTED` confirmation is a real positive `real-unit-count-delta`, not
  exact-string equality. Live boundary proof reports `PROVEN` `EXECUTED` for
  both rows (within budget, and at zero remaining budget). Mode/target
  resolution, protection ratios, the recovery buy amount and the budget-exempt
  recovery behavior are unchanged; M6 coverage stays `NONE`.
  `e2569dec0fcf2dd81d79e7a33f98aea216c3f1ad` /
  `c5e2c97` / `verification-e2569de.md`.
- Phase 3 slice 15 - Meat unlock planner path boundary
  (`meat-unlock-planner-path-boundary.v1`): the legacy meat
  unlock/parent-step/twin planner (`runUnlockPlanner`) issues at most one
  bounded command per cycle, so its body is wrapped to attach the boundary at a
  single exit with at most one proposal. All four real buy sites - the two
  twin-unlock threshold upgrades, the twin-prep unit buy and the
  unlock/parent-step unit buy - carry canonical identity, cycle-bound
  authorization and a fail-closed identity/amount check. Amount-`1` twin
  upgrades confirm exactly via `real-upgrade-count-delta`; the large-magnitude
  unit buys confirm via a real positive `real-unit-count-delta`. Live boundary
  proof reports `PROVEN` `EXECUTED` for a real parent-step unit buy. Resolution,
  reserve/payback/rebuild guards and buy amounts are unchanged; M6 coverage
  stays `PARTIAL`. `6ce6b3df986e766b08edea31b578c9fafb2b69f9` /
  `17ca41d` / `verification-6ce6b3d.md`.
- Phase 3 slice 16 - Final Clone Prep path boundary
  (`final-clone-prep-path-boundary.v1`): the Clone Prep cocoon side-task
  (`manageCloneCocoons`) issues one real command, the bounded cocoon side-buy,
  wrapped so the boundary attaches at a single exit with at most one proposal;
  canonical identity, cycle-bound authorization, fail-closed identity/amount
  check and a real positive `real-unit-count-delta` confirmation. Live boundary
  proof reports `PROVEN` `EXECUTED`. Cooldown, target/chunk sizing and the
  side-buy amount are unchanged; M6 coverage stays `NONE`.
  `5e3145c7db826e08ac72458b9c384f1343b372a9` /
  `20413a9` / `verification-5e3145c.md`.

Standing verdict after slice 16: all ten retained legacy paths now carry a
proven path boundary (each real main-cycle command is a canonical, cycle-bound,
fail-closed, real-delta-confirmed proposal). This is a bounding/observability
milestone only - it does NOT change execution ownership: complete M6 execution
paths remain `0` of `10`, the WAIT precondition remains `FAIL` with
`ADVISOR_ONLY` authority, whole-cycle ownership eligibility remains `false`,
and `m6DecisionOwnsMainCycle` stays `false`.

Current work package: none selected. The path-boundary sweep of all ten
retained legacy paths is complete. There is no further boundary slice to take;
the next direction must be chosen deliberately (e.g. begin converting a bounded
path toward complete M6 coverage, or a separate product capability) and is not
implied by this sweep. Do not grant M6 whole-cycle ownership without the live
purchase acceptance gate passing against that change first.

`NO_GO_GLOBAL_EXECUTION_OWNERSHIP` remains active. Post-Nexus Energy and other
unaligned safe actions remain legacy-owned; `m6DecisionOwnsMainCycle` stays
`false`. The rejected feature branch remains research material only and must
not be used as a base.

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
  2026-07-15 entry in the distilled handoff index below for the verified live-mechanic evidence,
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

1. `AGENTS.md` (the sole AI steering authority)
2. this file
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
2026-07-14 "Milestone 9 closed" entry in the distilled handoff index below for the closure record.

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
re-tuned (2026-07-14, see the distilled handoff index below) to isolate the Meat lane and produce a
genuine reserve/payback-guarded HOLD pattern, and `npm run verify` is fully
green again.

Milestone 9 (resource-scoped save locks) is closed as of 2026-07-14 (see
the distilled handoff index below): the guard-level implementation (`shouldAvoidProtectedCost`)
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
is implemented as of 2026-07-14 (see the distilled handoff index below): `check:live-purchase-acceptance`
is wired into `npm run verify` and proves, via real Chrome `runOnce()` cycles and
count/resource deltas read from game state, that both the legacy purchase path and
the M6-authorized purchase path actually buy something. Mutation control confirmed
the check fails when `m6DecisionOwnsMainCycle` is reintroduced as `true`.

Since that audit, the following were closed narrowly, in order, each with a
separate entry in the distilled handoff index below: the SA1 9.0.0-vs-9.1.0 comparison (F2 evidence;
0 winner/decision differences, 9.1.0 scoring kept as-is), F3 (structured
`blockerCategories` replace regex-over-text in the stall-breaker decision
gate), and F7 (`DEFAULT_CONFIG.unitStrategy` now matches the Smart preset).

No work package is currently in flight. The next direction is live
observation of the accepted baseline rather than a new coded milestone; see
"Immediate next actions" below.

## Immediate next actions

M8, M9, the live purchase acceptance check, the SA1 9.0.0-vs-9.1.0
comparison (F2 evidence), F3, and F7 are all closed as of 2026-07-14 (see
entries in the distilled handoff index below for each). The audited baseline was
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

At most three recent distilled handoffs are retained here; older entries are
distilled into the index below and their full text lives in Git history of
this file. Durable facts belong in the owning documents, not in this log.

### 2026-07-18 - Clean-room slices 8-10 closed by Claude (Fable 5)

- Worktree/branch: `C:/Users/info/Documents/SwarmSim-9.4.0-clean-room`,
  `codex/9.4.0-clean-room` (the repository tree moved from OneDrive to
  `C:/Users/info/Documents/`; the worktree link was repaired with
  `git worktree repair`).
- Result: path boundaries with exact proposal identity, cycle-bound
  authorization, fail-closed command bounds and full outcome accounting on
  the critical-upgrade, Smart-upgrade and Smart-unit paths. See the
  completed-slices ledger above for SHAs and evidence files.
- A new player-reported live save was pinned as
  `docs/test-data/player-saves/live-user-save-2026-07-18.txt` (SHA-256 in
  its README; import verified; not yet consumed by any verifier). A first
  chat-pasted copy arrived corrupted and was discarded.
- Exact next action: implement Phase 3 slice 12 (see Current work package).

### 2026-07-15 - DEL B research findings (read-only, unique caveats)

- The meat-chain payback formula in `getMeatChainPurchaseAnalysis`
  (runtime-main.js) is the only source of truth for payback gating: it is an
  estimate from the live `eachProduction()` snapshot at decision time, not a
  measured recovery. No cost-resource crossing exists in the guard.
- The previously quoted "1086 seconds" Parent-Step payback figure is a
  60-second-local approximation, not a verified measurement; no replacement
  formula has been proven superior.
- Live acceptance runs get byte-identical starting state by capturing and
  restoring Playwright `storageState` after a known-good load (see
  `docs/test-data/strategy-audit-1/**/live/`).
- Twin upgrades are bought through two call sites (goal-planner twin-prep
  and the unlock-planner threshold path); both call the same
  `buyUpgradeAmount(..., newDecimal(1), ...)` primitive.

### 2026-07-15 - Clone Ramp 9.3.0 (bounded Clone Larvae auto-cast)

- The narrow, user-authorized exception and its exact invariants are
  documented in `AGENTS.md` (Hard safety defaults); acceptance lives in
  `scripts/check-book00-clone-ramp-acceptance.js` with the pinned save in
  `docs/test-data/clone-ramp/`.
- Adjacent pre-existing bug fixed: the legacy Clone Buffer Planner's
  auto-detected `POST_CLONE_LOCK` treated any positive `bank()` (a live
  larva+cocoon total, not a debt signal) as "just cloned" and drained
  protected larva; the heuristic no longer fires when
  `autoCastCloneLarvae` is on. An explicit manual
  `cloneBufferMode: "post-clone-lock"` override is unaffected.
- A pre-existing `check:book00:territory-saturation` failure against live
  state was verified to reproduce at the pre-Clone-Ramp baseline (`29c6da6`)
  and was left unfixed per the narrow-change rule (later resolved on main).

### Distilled handoff index (full text in Git history)

- 2026-07-14: F7 closed (`DEFAULT_CONFIG.unitStrategy` -> `"balanced"`,
  matching the Smart preset); F3 closed (stall-breaker gate reads structured
  `blockerCategories`, regression check `check:book00:f3`); the live
  purchase acceptance check was implemented with `realResourceSeeds` real
  staging and the synthetic `armyUnitCounts` placeholder discovery
  (documented in the scenario notes in
  `scripts/strategy-audit-testbed-core.js`); the read-only repository audit
  was recorded in `REPOSITORY_AUDIT_REVIEW_2026-07-14.md` (F1-F7); the M6
  comparability gap for Engine/Meat/Energy was closed via
  `projectedMilestoneProgressDelta`; M9 closed
  (`check:book00:m9:resource-locks` proves resource-scoped locks); the M8
  false-wait scenario was re-tuned against the fixed legacy path; the
  critical `m6DecisionOwnsMainCycle=true` no-buy bug was found via a player
  save and fixed to `false`; `AI.md` hard-defaults were synced to 8.1.0;
  M8/8.1.0 was formally closed at
  `c014158cea82696cbdb18506045e60126c676116`.
- 2026-07-13: M8 stall-breaker slices (Copilot), pre-M8 wait-lock hotfix,
  M6 closure + M7 foundation, M6/M5 foundations, M3 bounded Energy
  execution and shadow comparison, 0.14.x releases, M2 exact-execution fix
  and acceptance, Strategy Intelligence preliminary infrastructure, board
  creation. Formal closures and SHAs live in the Milestone snapshot above,
  `docs/process/HISTORY.md` and `docs/release-notes/`.
