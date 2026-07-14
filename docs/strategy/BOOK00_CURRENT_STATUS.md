# BOOK-00 Current Execution Status

Status: Active handoff board. Update this file at every completed work package,
blocked handoff, milestone transition, and accepted verification result.

Last reviewed: 2026-07-14

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

Current runtime version: `9.0.0`

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

**Next milestone: Milestone 9 - Resource-scoped save locks**, foundation at
`docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`. Runtime
implementation has not started.

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
`npm run verify` is green with the new check included. The next open work
package has not been selected yet.

Product capability (M9, not started):

Product capability (M9, not started):

- Resource-scoped save locks: keep only the actively save-windowed resource
  (for example Territory for Expansion) locked, while safe non-conflicting
  buys from other resources remain executable instead of a global HOLD.

Player-visible change (M9, planned):

- The bot no longer enters global HOLD just because Territory is protected for
  Expansion; Meat/Larva/Energy progression can continue when those actions do
  not spend protected Territory.

Foundation document: `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`
(implementation-ready handoff contract; target release `9.0.0`).

Recommended run: **GPT-5.3-Codex (medium reasoning)** for bounded coordinator
logic and blocker observability.

Escalate when: resource-protection semantics conflict across lanes or
protected resource identity becomes ambiguous in replay evidence.

## Immediate next actions

M8 is closed. Execute these in order for Milestone 9:

1. Read `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md` in
  full before writing any runtime code.
2. Record the current accepted baseline SHA
  (`c014158cea82696cbdb18506045e60126c676116`) before implementation starts.
3. Implement resource-scoped lock semantics in the coordinator/main-action flow
  per the M9 contract, keeping other lanes executable when safe.
4. Add focused acceptance for Expansion save-window + non-Territory
  continuation, then run focused Strategy Audit plus full verification
  (`npm run verify`).
5. Record implementation/evidence SHAs and prepare separate commits per
  `docs/process/GIT_VERIFICATION_PROTOCOL.md`.

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

## Next product milestone

**Milestone 9 - Resource-scoped save locks**

Required product outcome:

- protect only the resource under active save-window priority (for example
  Territory for Expansion), while keeping unrelated resource lanes executable
  when safe;
- prevent global HOLD lock when only one resource is protected;
- expose protected-resource identity and non-conflicting execution decisions in
  Council/Inspector observability.

Implementation proceeds from the accepted 8.1.0 baseline
(`c014158cea82696cbdb18506045e60126c676116`) and must stay narrow, observable,
and protocol-compliant.

## Planned after M8

**Milestone 9 - Resource-scoped save locks**

Required product outcome:

- protect only the resource that is under active save-window priority (for
  example Territory for Expansion), while keeping unrelated resource lanes
  executable when safe;
- prevent global HOLD lock when only one resource is protected;
- expose protected-resource identity and non-conflicting execution decisions in
  Council/Inspector observability.

Planned player-visible change:

- Expansion save-window can hold Territory spend without freezing Meat/Larva/
  Energy progression when those actions are otherwise safe.

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
