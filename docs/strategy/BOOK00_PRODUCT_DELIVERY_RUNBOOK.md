# BOOK-00 Product Delivery Runbook

Status: Active execution plan for turning the BOOK-00 vision into noticeable
product improvements without allowing research or test work to become the
product.

Strategic authority: `docs/BOOK-00-vision-goals-and-dreams.md`

Live milestone and handoff status:
`docs/strategy/BOOK00_CURRENT_STATUS.md`

## Purpose

Move SwarmSim Strategy Autobuyer quickly from capable local planners toward an
explainable whole-economy decision engine.

Every product milestone must make the script observably smarter for a player.
Tests, evidence, refactoring, and documentation exist to support that product
change. They are not substitutes for it.

## Delivery doctrine

### Product capability is the unit of progress

A milestone is complete only when the running script gains a new or improved
capability that a player can observe in its recommendation, explanation, or
safe reversible behavior.

Examples of real progress:

- comparing Meat and Hatchery by projected milestone impact;
- showing why Expansion beats a Meat purchase over the selected horizon;
- changing the first reversible purchase when the new economic comparison has
  sufficient evidence;
- advising when an Energy ability is worth using or saving;
- advising whether continuing the run or ascending is better.

Examples that are not independently product progress:

- adding another runner;
- increasing scenario count;
- generating a larger evidence directory;
- tuning a score without a documented player-visible behavior change;
- refactoring a module without enabling the next capability;
- repeatedly testing the same unresolved hypothesis without a decision rule.

### Vertical slices before complete frameworks

Implement one end-to-end strategic comparison first, then extend the same
contract to additional domains. Do not wait for a perfect simulator of the
entire game before delivering the first useful comparison.

Each vertical slice should include:

1. a real domain action;
2. a projected whole-economy outcome;
3. a comparison against at least one meaningful alternative;
4. a player-visible explanation;
5. proportionate automated protection;
6. a clear decision about whether it remains advisory or may execute.

### Safety is a gate, not the optimization objective

Hard safety defaults remain unchanged unless the user explicitly changes them.
After unsafe actions are removed, the system should optimize decisively among
the allowed alternatives.

## Anti-stagnation rules

These rules are mandatory for every work order under this runbook.

1. **Every work order names the player-visible product delta.** If it cannot,
   the task must be attached to the next product slice rather than becoming an
   open-ended infrastructure project.
2. **Research is timeboxed to one bounded question.** End with implement,
   reject, or explicitly defer. Do not answer research with another unbounded
   research phase.
3. **Start with the smallest representative acceptance set.** Add more cases
   only when they protect a known invariant, boundary, or reproduced defect.
4. **A passing large sweep is not required before shadow-mode delivery.** It is
   required only where the capability's stated risk and acceptance contract
   justify it.
5. **Do not tune weights indefinitely.** If lanes cannot be compared honestly,
   improve the shared outcome model instead of adding another priority bonus.
6. **Unrelated findings go to a backlog.** They block the active slice only if
   they violate safety, determinism, non-mutation, build parity, or the slice's
   acceptance claim.
7. **One implementation, one focused validation cycle, one correction cycle.**
   A third failed correction requires reclassification of the design or scope,
   not more blind patching.
8. **Do not retain routine raw matrices in Git.** Retain contracts, minimal
   fixtures, distilled findings, and formal acceptance evidence.
9. **Do not widen the slice while implementing it.** New domains and attractive
   side ideas become later milestones.
10. **Ship the smallest honest capability.** Advisory or shadow behavior is a
    valid product increment when the user can see and use the new intelligence.

## Definition of Done for a product slice

All boxes must be checked.

- [ ] The running script has a new or materially improved strategic capability.
- [ ] The player can see the capability in Council, Inspector, Laboratory, or
      safe reversible execution.
- [ ] The selected action is compared with at least one meaningful alternative.
- [ ] The explanation names the milestone, horizon, important cost, and why the
      winner won or why confidence is insufficient.
- [ ] Hard safety defaults remain intact.
- [ ] The implementation uses the canonical runtime/build path.
- [ ] Focused tests protect the new product claim and its hard boundaries.
- [ ] At least one production-parity acceptance state exercises the slice when
      browser parity is relevant.
- [ ] No test expectation was rewritten merely to force a pass.
- [ ] The change is documented as `CURRENT`; unfinished extensions remain
      `TARGET` or `DREAM`.
- [ ] Implementation and formal evidence follow the Git verification protocol.
- [ ] The final player-visible change can be described in one short sentence.

If the final sentence is only "more tests now pass," the slice is not done.

## Test budget and test tiers

### Tier 1 - Fast product checks

Run during implementation. These should finish quickly and directly exercise
the changed contract or pure economic model.

Use for:

- source-derived formulas;
- Decimal and boundary behavior;
- hard blockers;
- deterministic outcome comparison;
- proposal/result schema;
- the focused regression for the active capability.

### Tier 2 - Focused strategy acceptance

Run after the capability works end to end.

Default initial budget:

- three to twelve representative states;
- boundary below/at/above where relevant;
- at least one competing legal alternative;
- multi-cycle behavior only when the claim depends on follow-through.

Expand this set only for a reproduced failure or a missing material state
class. Do not multiply scenarios merely to create volume.

### Tier 3 - Production parity and formal verification

Run once the implementation is complete and immutable.

Use:

- a small production-parity acceptance subset;
- exact implementation SHA;
- complete repository-required verification;
- separate generated evidence commit where formal acceptance is claimed.

Large property sweeps and broad matrices are supporting research tools. Run
them on demand, in CI, or to investigate a concrete risk. They do not replace
Tier 2 product acceptance and should not delay a safe shadow-mode capability
without a stated reason.

### Adaptive breakpoint tests

Prefer adaptive coarse-to-fine search over fixed large sweeps when the question
is where strategy behavior changes.

An adaptive test must:

1. declare the strategic question, dimensions, ranges, seed, and maximum case
   budget before execution;
2. run a small coarse sample;
3. detect whether winner, legality, blocker, confidence, or score ordering
   changes across an interval;
4. refine only informative intervals;
5. reproduce an important breakpoint or defect;
6. stop when the question is answered, no new information is being gained, or
   the declared budget is exhausted.

Valid terminal statuses include:

- `BREAKPOINT_FOUND`
- `NO_BREAKPOINT_IN_RANGE`
- `POTENTIAL_STRATEGY_DEFECT`
- `INSUFFICIENT_MODEL_EVIDENCE`
- `SAFETY_INVARIANT_FAILED`
- `HARNESS_FAILURE`
- `BUDGET_EXHAUSTED`

The test must never alter planner output, expected winner, or acceptance rules
to obtain a passing result. A clearly worse planner decision is a finding to
reproduce and reduce, not a signal to move the staged state until the planner
looks correct.

Browser recovery is bounded. A page or context may be reopened a declared
small number of times using the same seed and case plan. Repeated infrastructure
failure terminates as `HARNESS_FAILURE`; it does not silently skip the case.

Fixed large sweeps remain optional stress tools. They are not prerequisites for
the supported product acceptance path when an adaptive test can answer the same
question with fewer, more informative cases.

## Work package contract for Codex and Copilot

Every work package must state:

```text
Product capability:
Player-visible change:
Domains included:
Domains explicitly excluded:
Current milestone and horizons:
Advisor, shadow, or execution authority:
Hard safety boundaries:
Focused acceptance states:
Files expected to change:
Evidence generators and allowlisted paths:
Stop condition:
```

No agent starts implementation from a prompt that lacks these fields.

## Agent coordination rules

1. Codex and Copilot must not edit the same working tree concurrently.
2. Each implementation owner uses a dedicated branch/worktree.
3. One agent owns implementation; the other reviews the immutable commit or a
   clean diff.
4. The reviewer does not silently rewrite the implementation. Actionable
   findings return to the owner as one bounded correction list.
5. The handoff always includes branch, full SHA, tree status, commands run,
   generated paths, and remaining uncertainties.
6. Formal verification starts only after the implementation commit exists.
7. Generated evidence is not mixed into the implementation commit.
8. Do not merge large cleanup, historical artifact deletion, and product logic
   in the same change.

Recommended default division:

- implementation owner: builds the vertical product slice and focused tests;
- reviewer: checks BOOK-00 alignment, economic honesty, safety, scope, and
  acceptance coverage;
- verification owner: runs the exact-SHA protocol after review corrections are
  complete.

The roles may swap between milestones.

## Product delivery sequence

### Milestone 0 - Stabilize the launchpad

This is the only infrastructure-first exception. It is capped at one bounded
work package and must not expand into a general test-platform rewrite.

Goal:

- establish one clean Git source of truth for 0.13.0 plus BOOK-00;
- separate Copilot's automation implementation from generated artifacts;
- make the current automated command complete successfully or reduce it to an
  honest supported subset;
- correct stale version and architecture statements that would mislead the
  next implementation owner.

Completion checklist:

- [ ] BOOK-00 and this runbook are committed separately from generated evidence.
- [ ] Main, feature work, and current implementation provenance are explicit.
- [ ] Automation does not claim coverage from scenario names alone.
- [ ] Failed/partial audit results cannot be summarized as passing coverage.
- [ ] Runtime behavior and safety defaults are unchanged.

Stop condition: the next product slice can start from a clean, reproducible
baseline. Do not add new test dimensions after this condition is met.

### Milestone 1 - Whole-economy comparison preview

Product capability:

Compare one Meat action, one Larva-engine action, and one Army/Territory action
using a shared projected-outcome contract.

Player-visible change:

Council or Inspector shows:

- active milestone;
- comparison horizon;
- projected outcome for the winner;
- best alternative;
- why the winner is better;
- confidence or missing evidence.

Authority: shadow/advisor only. Existing 0.13.0 execution remains authoritative.

Completion checklist:

- [ ] Versioned economic outcome contract exists.
- [ ] Three domains emit the contract from one pre-execution snapshot.
- [ ] At least one common metric is real and source-/runtime-derived, not a
      renamed lane score.
- [ ] Inspector exposes disagreement with the current runtime decision.
- [ ] Focused acceptance includes each domain winning at least one honest state
      or explicitly explains why no such state is yet supported.

Player-facing release sentence:

> The bot now previews why Meat, Larva, or Territory is the best investment for
> the current milestone instead of showing only unrelated lane scores.

### Milestone 2 - Coordinator v2 for reversible progression

Product capability:

Allow the shared comparison to select the first reversible action among Meat,
Larva, and Army/Territory when evidence is sufficient.

Player-visible change:

The bot makes a noticeably different first purchase in states where the shared
economic outcome shows that the old local ordering was worse, and explains the
change.

Authority: bounded execution for safe reversible actions only.

Completion checklist:

- [ ] `executionAuthority`, confidence, and actual execution behavior agree.
- [ ] Low-confidence comparison remains advisory and cannot execute.
- [ ] Selected action is revalidated by its lane guard immediately before buy.
- [ ] Selected and executed actions match.
- [ ] Sequential fallback cannot silently override the first-action verdict.
- [ ] At least one reproduced v0.13.0 weakness is materially improved.

Player-facing release sentence:

> The bot now chooses its first Meat, Larva, or Territory purchase from their
> projected whole-economy value, while uncertain decisions remain advisory.

### Milestone 3 - Energy production joins the economy

Product capability:

Compare Nexus/Lepidoptera or another supported Energy-production investment
against Meat, Larva, and Territory using the same outcome contract.

Player-visible change:

The bot explains whether producing more Energy now is worth delaying another
investment and shows the relevant Nexus or ability timing effect.

Completion checklist:

- [ ] Energy reserve and recovery are shared outcome fields.
- [ ] Nexus protection remains a hard gate.
- [ ] Cap waste and delayed ability opportunity are visible where supported.
- [ ] Energy can honestly win, lose, or remain uncertain in focused states.
- [ ] Reversible Energy production may execute only after shadow acceptance.

Player-facing release sentence:

> The bot now compares Energy production with the rest of the economy instead
> of treating the Energy lane as a separate fixed priority.

### Milestone 4 - Energy ability timing advisor

Product capability:

Advise whether to cast or save supported Energy abilities from the same
snapshot and milestone model.

Initial scope:

- Clone Larvae;
- House of Mirrors;
- source-verified Rush abilities;
- Wait/save as an explicit alternative.

Swarmwarp enters only after its whole-production-graph formula is source-derived
and verified.

Player-visible change:

The player sees "cast now" or "save" with projected gain, Energy opportunity
cost, milestone impact, horizon, and confidence.

Authority: advisor only. Ability auto-cast remains off by default.

Completion checklist:

- [ ] Ability and Wait branches start from the same immutable snapshot.
- [ ] The advisor compares Energy spending with the best supported non-cast
      alternative.
- [ ] Post-action policy is explicit; unsupported downstream spending is not
      invented.
- [ ] The recommendation states when it should be reconsidered.

Player-facing release sentence:

> The bot now tells the player when an Energy ability is worth using and when
> saving the Energy is strategically better.

### Milestone 5 - Ascension and Mutagen advisor

Product capability:

Compare continuing the current run with ascending now, then advise on supported
Mutagen allocation effects.

Player-visible change:

The player sees an Ascension recommendation with current-run opportunity cost,
estimated recovery/break-even, next-run benefit, supported Mutagen plan, and
uncertainty.

Authority: advisor only. Auto-ascend remains off by default.

Completion checklist:

- [ ] `CONTINUE_RUN` and `ASCEND_NOW` are explicit counterfactual branches.
- [ ] Break-even and next-run horizon are visible.
- [ ] Mutagen recommendations use verified effects, not legacy fixed numbers.
- [ ] Unsupported mutations remain unranked and clearly marked.
- [ ] Multi-run uncertainty is explicit.

Player-facing release sentence:

> The bot now advises whether the current run is still worth continuing and how
> supported Mutagen investments change the next run.

### Milestone 6 - Six-domain strategic coordinator

Implementation foundation:

- `docs/strategy/BOOK00_M6_SIX_DOMAIN_COORDINATOR_FOUNDATION.md`
- `docs/test-data/6.0.0-book00-m6-six-domain/m6-domain-contract-manifest.json`
- `docs/prompts/implement-book00-m6-six-domain-coordinator.md`

Product capability:

All six BOOK-00 domains participate in one explainable strategic decision loop.

Player-visible change:

The player sees the active milestone, best allowed action, most important
alternatives, projected outcomes, blockers, confidence, and reconsideration
trigger in one coherent view.

Completion checklist:

- [x] All six domains use the versioned shared outcome contract.
- [x] Hard safety is independent from economic ranking.
- [x] Advisor-only domains cannot gain execution authority accidentally.
- [x] Reversible execution uses bounded, revalidated actions.
- [x] Cross-domain effects are represented without double counting.
- [x] Decision and execution remain consistent across cycles.
- [x] The automated coverage map reports actual mechanics and invariants, not
      inferred scenario labels.

Player-facing release sentence:

> The bot now coordinates Meat, Larva, Territory, Energy, abilities, and
> Ascension as one economy and explains the best next strategic move.

Formal closure:

- implementation: `9da1b2312cc603c29f9d3add2270499fdbc1b269`;
- evidence: `60297dfbd8b686affd701258db40e94fb8ce3c53`.

### Milestone 7 - Calibrated shared outcomes

Implementation foundation:

- `docs/strategy/BOOK00_M7_CALIBRATED_SHARED_OUTCOMES_FOUNDATION.md`
- `docs/test-data/7.0.0-book00-m7-calibrated-outcomes/m7-calibration-contract-manifest.json`
- `docs/prompts/implement-book00-m7-calibrated-shared-outcomes.md`

Product capability:

Derive a real WAIT-relative shared milestone result for at least one supported
Energy ability and let the six-domain coordinator compare it with normal
progression without widening execution authority.

Player-visible change:

Council and Inspector show the ability action, WAIT baseline, named milestone,
horizon, raw values, calibrated delta, provenance, uncertainty, missing inputs,
and advisor-only authority.

Completion checklist:

- [ ] Action and WAIT use one immutable identity, milestone, metric, unit,
      horizon, formula set, and source revision.
- [ ] At least one production-parity supported Energy ability yields a real
      common milestone result.
- [ ] Zero, negative, and missing deltas retain their honest meanings.
- [ ] Formula mismatch/incomplete states remain unranked.
- [ ] Break-even-only Ascension remains unranked; horizon surplus is not
      mislabeled as milestone ETA improvement.
- [ ] Advisor winners remain non-executable and cannot fall through.
- [ ] Existing bounded purchase identity/revalidation remains unchanged.
- [ ] Council UI3 commit `40c258a` and fixed-layout commit `04bb946` remain
      present, including `1180 x 700`, `resize: none`, movable/responsive
      behavior, and layout key v2.
- [ ] Focused, UI, full exact-SHA, and separate evidence gates pass.

Player-facing release sentence:

> The bot now uses calibrated, WAIT-relative milestone outcomes when comparing
> supported Energy abilities with normal progression, while unsupported or
> weakly evidenced future-run choices remain explicitly unranked.

### Milestone 8 - ETA-grounded false-wait reduction

Product capability:

Reduce repeated false `Wait` loops by applying a narrow, source-grounded ETA
fallback policy for executable normal progression when advisor-only winners are
blocked by authority.

Player-visible change:

In repeated HOLD patterns (`reserve` + `ability disabled`), Smart mode
activates bounded fallback progression earlier instead of looping on `Wait`.

Completion checklist:

- [ ] Reproduced blocker pattern in Google Chrome via Playwright with
   production-parity state.
- [ ] Fallback activation appears by hold cycle 3 or earlier under the
   accelerated cap 2, without violating reserve/protected-resource gates.
- [ ] Ability/Ascension/Mutagen authority remains advisor-only and
   non-executable.
- [ ] Focused Strategy Audit and full verification suite pass.
- [ ] Exact-SHA implementation and separate evidence protocol is followed.

Recommended run: **GPT-5.3-Codex (medium reasoning)** for bounded runtime,
verification, and handoff synchronization.

Escalate when: repeated Chrome replays disagree on blocker identity,
ETA-comparability requires new cross-domain model formulas, or safety/execution
boundaries become ambiguous.

### Milestone 9 - Resource-scoped save locks

Product capability:

When a save-window protects one resource (for example Territory for Expansion),
the coordinator keeps that resource locked while still allowing safe
non-conflicting buys from other resources.

Player-visible change:

The bot no longer enters global HOLD just because Territory is protected for
Expansion; Meat/Larva/Energy progression can continue when those actions do not
spend protected Territory.

Completion checklist:

- [ ] Expansion save-window protects Territory spend only, not unrelated
   resources.
- [ ] Repeated HOLD loops caused by protected Territory can still execute safe
   non-Territory actions when available.
- [ ] Council and Inspector show which resource is protected and why other
   domains remained executable or not.
- [ ] Focused Chrome Playwright scenarios and full verification pass.
- [ ] Exact-SHA implementation and separate evidence protocol is followed.

Recommended run: **GPT-5.3-Codex (medium reasoning)** for bounded coordinator
logic and blocker observability.

Escalate when: resource-protection semantics conflict across lanes or protected
resource identity becomes ambiguous in replay evidence.

### Milestone 10 - Council timeline and decision replay

Product capability:

Add a first-class timeline in Council that shows per-cycle decisions, blockers,
and key metric deltas so players can inspect why the bot waited, bought, or
recommended an advisor action.

Player-visible change:

Council exposes a chronological decision trace (WAIT/HOLD/BUY/PLAN and lane
context) with filterable blockers and compact ETA/progression before/after
signals.

Completion checklist:

- [ ] Timeline shows recent cycle decisions with lane, candidate, reason,
   blockers, and action type.
- [ ] Timeline distinguishes advisor-only recommendations from executable buys.
- [ ] At least one replay view compares two adjacent cycles and highlights what
   changed.
- [ ] Focused UI checks plus full verification pass.
- [ ] Exact-SHA implementation and separate evidence protocol is followed.

Recommended run: **GPT-5.3-Codex (medium reasoning)** for UI data shaping,
rendering, and consistency checks.

Escalate when: timeline payload volume harms performance or cycle-level source
identity cannot be preserved across UI and inspector surfaces.

### Milestone 11 - Opt-in execution for abilities and ascension

Product capability:

Add explicit opt-in execution modes for supported Energy ability auto-cast and
Ascension auto-execution when confidence and safety gates are satisfied.

Player-visible change:

When the player enables the mode, the bot can execute supported ability casts
and eligible ascensions automatically with clear reasons, thresholds, and
reconsideration triggers.

Completion checklist:

- [ ] Auto-cast remains default OFF and can only run when explicitly enabled.
- [ ] Auto-ascend remains default OFF and can only run when explicitly enabled.
- [ ] Cast/ascend decisions require explicit confidence, blocker, and
   cooldown/reconsideration gates.
- [ ] Council and Inspector show why execution was allowed, delayed, or denied.
- [ ] Focused Chrome Playwright scenarios and full verification pass.
- [ ] Exact-SHA implementation and separate evidence protocol is followed.

Recommended run: **GPT-5.3-Codex (medium reasoning)** for bounded execution
gates, observability, and test coverage.

Escalate when: supported cast/ascend candidates cannot be compared on a shared
milestone basis, default-safety boundaries conflict with proposed behavior, or
execution introduces irreversible-risk ambiguity.

## Laboratory Complete Decision Coverage program (LC) - ACTIVE

Selected by the user on 2026-07-23. This program supersedes “live observation
only” as the immediate direction. It turns the existing Laboratory foundation
into the common test orchestrator for every open decision-data question without
changing normal strategy or hard safety defaults.

### Product capability

From one exact SwarmSim state, a developer can ask “which next click starts the
fastest allowed route to this phase target?” Laboratory enumerates every
material candidate, restores the same state for isolated branches, executes or
projects each branch through the declared horizon, compares the outcomes on one
target metric, and reports whether the production runtime selected the same
first click.

Player-visible change during this program is intentionally limited to
development-only Laboratory/Council evidence. Normal automation remains
unchanged until a separately authorized, independently verified strategy
change consumes a reproduced finding.

Recommended run: **GPT-5.6 Sol (high reasoning)** for LC-1 through LC-4,
where schema, isolation, formula provenance, and independent-oracle design
matter. LC-5 through LC-8 may use the same model; downgrade to
**GPT-5.6 Terra (medium reasoning)** only for mechanical fixture registration
or report formatting after the contracts are frozen.

Escalate when: a formula cannot be sourced or captured, disposable branches
cannot prove isolation, a proposed metric is not causally aligned with the
named target, production and Laboratory ranking logic become circular, or a
slice would widen execution authority or change hard safety defaults.

### Program boundaries

Included:

- DT-01 through DT-22 coverage from BOOK-04;
- same-state deterministic and sandbox counterfactuals;
- active, passive, offline, threshold, sequence, and stochastic horizons;
- complete candidate manifests across Engine, Meat, Territory, Larvae/Clone,
  Energy, and reset domains;
- Laboratory-versus-runtime verdict comparison;
- minimal reusable fixtures and retained distilled findings.

Excluded:

- production strategy changes during Laboratory construction;
- new ability or Ascension execution authority;
- default changes;
- a second executable userscript;
- a full reimplementation of Swarm Simulator;
- raw per-run evidence retention;
- a free-form package scripting language;
- hidden synthetic resources presented as natural timing.

### Target architecture

Laboratory is one orchestration surface with several bounded backends:

```text
decision snapshot
    -> candidate manifest (all lanes + HOLD + UNMODELED)
        -> branch specification
            -> pure projection backend
            -> disposable cloned-save backend
            -> bounded sequence backend
            -> elapsed/offline backend
            -> stochastic sampler
        -> common target/horizon evaluator
        -> Laboratory winner vs runtime-selected click
        -> coverage/provenance/non-mutation report
```

The runtime remains assembled from the single
`dev-src/runtime-sections/runtime-main.js`. Do not recreate the removed
per-lane `dev-src/` scaffolding. Browser/test orchestration helpers may be
small modules under `scripts/lib/` when they have multiple consumers.

### Versioned data contracts

Add contracts instead of changing Phase 1/2A meanings:

1. `swarmsim-lab.decision-snapshot.v1`
   - source/save/scenario identity and deterministic hash;
   - active phase target and horizon;
   - resource banks, rates, caps, cooldowns, unlocks, upgrades, Twins;
   - complete visible Army roster including zero-count families;
   - runtime-selected action, alternatives, reasons, blockers, action budget;
   - formula provenance and uncertain fields.
2. `swarmsim-lab.candidate-manifest.v1`
   - stable candidate identity and DT IDs;
   - lane, action type, exact bounded amount and amount basis;
   - costs, reserves, dependencies, target path;
   - legal/safe/modeled status;
   - screened-out or `UNMODELED` reason.
3. `swarmsim-lab.branch-spec.v1`
   - immutable start hash;
   - backend;
   - one action or bounded exact step sequence;
   - horizon mode and stop condition;
   - random/time policy;
   - expected mutation scope inside the disposable branch.
4. `swarmsim-lab.branch-result.v1`
   - restored and final fingerprints;
   - per-step accepted/command/confirmed/observed amounts;
   - immediate and reconstructed state;
   - target metric before/after and completion time;
   - next bottleneck, warnings, uncertainty, state leakage.
5. `swarmsim-lab.decision-result.v1`
   - all candidates including HOLD;
   - Laboratory winner, margin, confidence, and evidence grade;
   - runtime winner and agreement classification;
   - missing coverage and formula status.
6. `swarmsim-lab.coverage.v1`
   - DT ID -> adapter -> backend -> fixture/sample -> verifier -> status;
   - `COVERED`, `PARTIAL`, `UNMODELED`, or `LIVE_CALIBRATION_REQUIRED`.

Every precise game quantity remains a Decimal string. Every schema is
deterministically canonicalized and versioned. Timestamps, browser IDs, and
other volatile fields are excluded from hashes explicitly, never implicitly.

### Required test-data catalog

Reuse existing immutable saves whenever their provenance fits. Generated
boundary states should be compact scenario definitions, not copied save files.
Only natural states that cannot be reconstructed honestly should add a new
versioned save.

| Data ID | State family | Existing source or acquisition | Primary DT coverage |
|---|---|---|---|
| LD-00 | Clean start and first legal producer | Deterministic generated scenario; no retained save needed. LC-1 fixture: `docs/test-data/laboratory-lc1/decision-snapshot-fixture.json` | DT-01, DT-03, DT-20 |
| LD-01 | Early Engine/Territory conflict | `manual-play-early-pre-ascension-2026-07-18.txt` plus frozen-time derived boundaries | DT-02, DT-03, DT-04, DT-10, DT-11 |
| LD-02 | First Nest sacrifice | `manual-play-first-nest-threshold-2026-07-18.txt` | DT-07, DT-08, DT-09 |
| LD-03 | Expansion bridge | Existing Expansion 10 and Expansion 12 saves | DT-02, DT-10, DT-11, DT-20 |
| LD-04 | Twin Queen reserve boundaries | Existing Twin Queens II and Twin Queen III/Nest 1200 saves | DT-07, DT-08, DT-22 |
| LD-05 | Late-early multi-lane economy | `manual-play-active-chain-pre-ascension-2026-07-18.txt` (sha256 `c53f5394…a860b95c`); **verified in LC-1** read-only decision capture, evidence `0ca579a`, source-state and run-history non-mutation proven | DT-04 through DT-10 |
| LD-06 | Greater Queen/Twin Nest/Faster chain | Existing Twin Nests V and larva-buffer saves; the tracked Faster-GQ file is quarantined (`undefined`, not a save), so reacquire it under a new immutable path or derive an explicitly labelled replacement from a valid ancestor | DT-06 through DT-09, DT-15 |
| LD-07 | Nexus 1 Energy entry | `manual-play-first-nexus-baseline-2026-07-21.txt`; timing metrics remain restricted by its inflated Meat bank | DT-01, DT-13, DT-17 |
| LD-08 | Nexus 2, 3, and 4 boundaries | **Missing:** derive three exact scenarios from one registered lineage with only documented Nexus/Energy boundary inputs | DT-01, DT-13, DT-20 |
| LD-09 | Balanced natural Nexus 5 | `manual-play-natural-nexus5-2026-07-24.txt` (sha256 `3419b784…60cbec7f`); non-injected natural Nexus 5, non-oversupplied (territory `5.2e31` vs LD-10 `4.1e142`), premutagen `8888` at the ~72k first-Ascension gate. Provenance in `docs/test-data/player-saves/README.md` | DT-01, DT-04, DT-06, DT-10, DT-12 through DT-18 |
| LD-10 | Mature/high-magnitude control | Existing `live-user-save-2026-07-18.txt` and pinned clone-ramp fixture; not a balanced timing benchmark | DT-15, DT-17, DT-22 |
| LD-11 | Energy threshold matrix | Derived from LD-09 at exact below/at/above `1.6k`, `2k`, `2.5k`, and `12k`; explicitly artificial Energy boundaries | DT-12 through DT-17 |
| LD-12 | Full Army/Mirror crossover | **Missing retained branch:** natural Nexus-5 state before a material Mirror/Army choice, with complete roster and Twins | DT-10, DT-11, DT-12 |
| LD-13 | First real premutagen | **Missing natural save:** capture immediately when the first premutagen appears, before spending or Ascension | DT-18, DT-20 |
| LD-14 | First post-Ascension recovery | `derived-first-ascension-from-ld09-2026-07-24.txt` (sha256 `516067dc…`), **derived** from LD-09 by one real `game.ascend()` (nexus 0, mutagen 8888), pre-reset lineage retained; must not be merged with natural/injected. Provenance in `docs/test-data/player-saves/README.md`. Full return-to-Nexus-5 needs bot-replay (follow-up) | DT-01, DT-19, DT-20 |
| LD-15 | Offline/elapsed horizons | Derived frozen-time scenarios from LD-01, LD-05, LD-09, and LD-14 at 5m, 1h, 1d, and a long-return horizon | DT-08, DT-21 |
| LD-16 | Decimal, Twin, exact-target, and stale-button edges | Generated synthetic boundary fixtures with source-verified costs and real command acceptance | DT-05, DT-22 |
| LD-17 | Random award cohorts | Repeated disposable Hatchery/Expansion branches with recorded RNG/time provenance where available | DT-16, DT-18, DT-20 |

Before any save enters a verifier, its README entry must include SHA-256, game
format/build, source class, capture time, lineage, natural/derived/injected
fields, offline-reconciliation behavior, valid metrics, invalid metrics, and
the exact DT consumers. Never overwrite an existing save.

### DT coverage map

| Decision group | Laboratory package | Required data | Required backend |
|---|---|---|---|
| DT-01 phase target | LC-3, LC-7 | LD-00, LD-07--LD-09, LD-13--LD-14 | projection + sandbox + sequence |
| DT-02--DT-03 Engine/save windows | LC-3 | LD-01, LD-03, LD-09 | projection confirmed by sandbox |
| DT-04--DT-06 global arbitration/action budget/larvae | LC-4 | LD-05, LD-06, LD-09 | sandbox + fresh re-evaluation |
| DT-07--DT-09 Meat packages/reserve/filler | LC-5 | LD-02, LD-04--LD-06 | bounded sequence |
| DT-10--DT-12 Army/seed/Mirror | LC-4, LC-6 | LD-01, LD-03, LD-09, LD-12 | projection + sandbox |
| DT-13--DT-17 Energy/Clone/Crystals/producers | LC-6 | LD-07--LD-11, LD-13 | projection + sandbox + sequence |
| DT-18--DT-20 Ascension/Mutagen/random transitions | LC-7 | LD-13, LD-14, LD-17 | sandbox + stochastic sampler |
| DT-21 offline return | LC-7 | LD-15 | elapsed/offline backend |
| DT-22 amount/precision/stale UI | LC-2, LC-4 | LD-04, LD-10, LD-16 | sandbox command acceptance |

### Work-package sequence

Each package is a separate implementation commit followed by exact-SHA
verification and a separate evidence commit when evidence is generated. Do not
combine adjacent packages merely because the code is nearby.

#### LC-0 - Contract and data qualification

Status: documentation plan complete; data qualification remains part of LC-1.

Outcome: one agreed next-click protocol, DT matrix, Laboratory architecture,
test-data catalog, retention rule, and coverage target.

Stop condition: BOOK-04, Laboratory contract, status, and this runbook agree.
No runtime code is changed.

#### LC-1 - Decision snapshot and candidate manifest

Status: **ACCEPTED (2026-07-24)**. Implementation SHA
`0f473fbd07bc3ad66b9a9e532a346d0a6fd227fa`; evidence SHA
`0ca579ac758afdab2e9fad0aca14f1b868269a70` on `codex/9.4.0-clean-room`. Full
`npm run verify` passed exit 0 against the implementation SHA. See the status
board for the full acceptance record.

Outcome: one read-only capture exposes the target, horizon, runtime verdict,
all lane candidates/rejections, exact amounts, constraints, roster, and gaps.

Focused data: LD-00 plus one existing real save from LD-05. Both are now
verified: LD-00 as the deterministic fixture (stable hash `3be3eb65…`) and
LD-05 as the hash-pinned retained real save, each captured read-only with
source-state and run-history non-mutation.

Focused verification:

- deterministic hash/deep-freeze;
- complete reached-path ledger;
- zero-count Army visibility;
- `UNMODELED` retention;
- source-save/run-history non-mutation;
- Phase 1/2A compatibility.

Declared generated evidence (only after the implementation commit and an exact
SHA re-synchronization):

- `docs/live-logs/browser-test-lc1-decision-snapshot.json`;
- `docs/live-logs/browser-test-lc1-decision-snapshot.md`;
- `docs/test-data/laboratory-lc1/example-decision-snapshot.json`.

Stop condition: capture only. No candidate execution or winner score.

#### LC-2 - Disposable cloned-save branch backend

Status: **backend ACCEPTED via exact-SHA evidence (2026-07-24)**. Implementation
SHA `d6fea4007b4eaa99c5bd1a699e19b12909ea25cc`; evidence SHA `c0be999` on
`codex/9.4.0-clean-room`; full `npm run verify` passed exit 0 against the
implementation SHA. The `runDisposableBranchExperiment` backend (schema
`swarmsim-lab.branch-result.v1`) proves deterministic raw-state restore identity,
a bounded-command four-value amount contract, sandbox mutation, illegal-command
rejection, and source non-mutation over the LD-05 real save and an LD-00
clean-start source. Per the LC-2 implementation caution below, hermetic timing
is **not** claimed on the live site (raw pre-reification state is used); LD-04
and LD-16 boundary data plus fully hermetic timing (RH-4 Outcome 2) remain a
bounded follow-up. See `SWARMSIM_LABORATORY_PHASE_1.md` and the status board.

Outcome: Laboratory can restore the exact same save into sibling sandbox
branches, execute one exact bounded game command, collect before/after state,
and destroy the branch without touching the source.

Focused data: LD-00, LD-04, and LD-16.

Focused verification:

- identical restored fingerprint for every sibling;
- accepted/command/confirmed/observed amount equality;
- expected branch-only mutation;
- source and sibling non-mutation;
- failure on stale button, illegal action, or restore drift;
- controlled timestamp/offline reconciliation.

Stop condition: one-action sandbox execution only. No sequences or ranking.

Implementation caution: prefer the pinned/local game build for hermetic runs.
If RH-4 Outcome 2 is still unavailable, retain an explicit live-site dependency
and do not claim fully hermetic timing.

#### LC-3 - Engine one-click tournament and target evaluator

Status: **ACCEPTED via exact-SHA evidence (2026-07-24)**. Implementation SHA
`12db48a7436b9ae9139def142f4ac02dabfc1183`; evidence SHA `228c253` on
`codex/9.4.0-clean-room`; full `npm run verify` passed exit 0 against the
implementation SHA. `runEngineTournament` (schema
`swarmsim-lab.engine-tournament.v1`) ranks Engine/HOLD candidates by Laboratory's
own larva-rate metric (never the production score) and compares the independent
winner against the observed production Engine choice (LD-01: Laboratory picks
BUY_HATCHERY, fixed order picks BUY_EXPANSION). Instantaneous larva-rate is the
first metric; the time-to-gate horizon projection, the 180s/600s save-window
matrix, and a guaranteed winner-change boundary need LD-08/LD-09 and remain a
bounded follow-up. See `SWARMSIM_LABORATORY_PHASE_1.md` and the status board.

Outcome: Hatchery, Expansion, achievement-based larva upgrade, and HOLD share
one next-target metric and produce an independent winner.

Focused data: LD-01, LD-03, LD-08, and LD-09.

Focused verification:

- below/at/above 180s and 600s save windows;
- both Engine actions buyable and near-buyable;
- percentage larva gain and complete target ETA;
- fixed-order runtime decision compared with Laboratory winner;
- boundary where Hatchery/Expansion winner changes.

Stop condition: Engine/HOLD only; do not add Meat or Army scoring.

#### LC-4 - Cross-lane bounded one-click tournament

Status: **ACCEPTED via exact-SHA evidence (2026-07-24)**. Implementation SHA
`bfb29df081a9a5861840e8b7dd484f6595263221`; evidence SHA `9b57aeb` on
`codex/9.4.0-clean-room`; full `npm run verify` passed exit 0 against the
implementation SHA. `runCrossLaneTournament` (schema
`swarmsim-lab.cross-lane-tournament.v1`) enumerates candidates from the
production lane-candidate surface (no lane omission; declined candidates still
evaluated), resolves each via a display-name index, runs each in an isolated
disposable branch (identical raw-state restore => shared larvae not
double-spent), and ranks by Laboratory's own larva-rate metric with production
ordering recorded separately (LD-05: 27 enumerated, 24 executed, winner
Engine:Expansion matches production's first BUY; also verified on LD-09). The
shared larva-rate metric under-credits non-larva lanes, so the Territory-over-Meat
crossover is honestly left open; the one/two/four-action budget matrix and that
crossover need LD-12 and remain a bounded follow-up. See
`SWARMSIM_LABORATORY_PHASE_1.md` and the status board.

Outcome: all current reversible one-click candidates across Meat, Territory,
Larvae, Engine, and Energy production can be compared without lane omission.

Focused data: LD-05, LD-06, LD-09, LD-12, and LD-16.

Focused verification:

- every visible Army family uses one common bounded-resource rule;
- shared larvae cannot be double-spent across candidates;
- one-, two-, and four-action budgets re-evaluate after each click;
- natural Territory-over-Meat crossover is found or honestly remains open;
- production ordering bias is separated from Laboratory outcome ranking.

Stop condition: one-click interventions only. Sacrifice/rebuild sequences wait
for LC-5.

#### LC-5 - Package and reserve-policy runner

Status: **ACCEPTED, upgraded to v2 horizons via exact-SHA evidence (2026-07-24)**.
v2 implementation SHA `3a1dda4e7ae24b28ded25309a55d88422c404c92`; evidence SHA
`41bcf69`; full `npm run verify` exit 0. `runPackageTournament` executes a bounded declarative step
schema (build -> sacrifice -> unlock -> rebuild) and HOLD in isolated branches,
stops and records on step invalidation (no loops), and ranks by Laboratory's own
larva-at-horizon metric. Key finding: `game.skipTime` is a no-op on the live site,
but `game.tick(now + seconds)` + `game.reify()` advances the clock exactly, so the
horizon dimension is live again via the reusable `laboratory.advanceHorizon`
primitive (schema bumped to `swarmsim-lab.package-tournament.v2`). LD-02 over
`[0,300,3600]s`: Engine Hatchery+Expansion wins on larva at 1h (4.86e6 vs HOLD
4.85e6) while level at the active horizon; an invalid package stops at
target-unresolved. The 0x/1.25x/1.5x/2x reserve-policy matrix, a cap-aware metric,
and the LD-15 offline set remain bounded follow-ups; RH-4 Outcome 2 is no longer
required to unblock horizons. See `SWARMSIM_LABORATORY_PHASE_1.md` and the status
board.

Outcome: exact build -> sacrifice -> unlock -> rebuild packages and HOLD can be
compared under active and passive reserve horizons.

Focused data: LD-02, LD-04--LD-06, and LD-15.

Focused verification:

- Faster versus Twin versus parent unlock versus refill;
- `0x`, `1.25x`, `1.5x`, and `2x` reserve policies;
- active, 5-minute, 1-hour, and offline horizons;
- reconstruction time and downstream production included;
- branch stops/replans when an intermediate state invalidates the package.

Stop condition: a bounded declarative step schema only; no general-purpose
scripts or loops.

#### LC-6 - Energy, abilities, Clone, and Crystal allocation

Status: **ACCEPTED via exact-SHA evidence (2026-07-24)**. Implementation SHA
`1e42009dd3121c5dd587c42a07f2b05fe45521d1`; evidence SHA `c1ef16b` on
`codex/9.4.0-clean-room`; full `npm run verify` passed exit 0 against the
implementation SHA. `runEnergyTournament` (schema
`swarmsim-lab.energy-tournament.v1`) is verified on the hash-pinned LD-09 Nexus-5
and LD-07 pre-Nexus-5 saves. It casts/buys each energy-domain
candidate (construct Nexus, Rushes, Clone Larvae, House of Mirrors, Swarm Warp,
Lepidoptera) and HOLD in isolated disposable branches, records energy spend
(matching documented ability costs: Rush 1600, HoM 2500, Swarm Warp 2000, Clone
Larvae 12000), and ranks by Laboratory's own larva-at-horizon metric. It proves
**advisor-only actions remain non-executable in production**: the production
auto-cast authority is captured before/after and shown unchanged. The
1.6k/2k/2.5k/12k threshold matrix, Clone cap levels, Mirror-now-vs-seed, Crystal
states, and full pre/post-Nexus-5 split need LD-08/LD-11/LD-12/LD-13 and remain a
bounded follow-up. See `SWARMSIM_LABORATORY_PHASE_1.md` and the status board.

Outcome: Nexus, Lepidoptera, Bat/Nightbug when allowed, Clone, House of Mirrors,
Rushes, Swarmwarp, Crystal conversion, Ascension reserve, and HOLD can compete
at their exact thresholds.

Focused data: LD-07--LD-13.

Focused verification:

- below/at/above `1.6k`, `2k`, `2.5k`, and `12k`;
- Clone 99.8/99.9/100% cap and named post-Clone uses;
- Mirror now versus seed then Mirror;
- Crystal exact/full/hold and cooldown-ready/not-ready;
- pre-Nexus-5 and post-Nexus-5 horizons remain separate;
- advisor-only actions remain non-executable in production.

Stop condition: Laboratory recommendations only; no widening of auto-cast
defaults or normal authority.

#### LC-7 - Phase, Ascension, stochastic, and offline experiments

Status: **ACCEPTED via exact-SHA evidence (2026-07-24) - final LC slice; LC-1..LC-7
complete.** Implementation SHA `e4e0adbe78ce39c8a51e2342a03adf4b6529bf58`; evidence
SHA `3aa800b` on `codex/9.4.0-clean-room`; full `npm run verify` passed exit 0
against the implementation SHA. `runOfflineHorizonExperiment` (schema
`swarmsim-lab.offline-horizon.v1`) is verified on the hash-pinned LD-09 natural
Nexus-5 save. A first-Ascension execution follow-up
(`runAscensionExperiment`, schema `swarmsim-lab.ascension-experiment.v1`,
`check:laboratory:ascension`) is also implemented: it executes `game.ascend()` in
a disposable sandbox (premutagen 8888 -> mutagen 8888, nexus 5 -> 0), measures
post-reset recovery, keeps autoAscend false, and proves source non-mutation.
ACCEPTED via exact-SHA evidence: implementation SHA
`b954e712d5091cabe3efc20e9f321561632d4e3d`, evidence SHA `dc9a929`, full verify
exit 0. Ascend-later growth, full return-to-Nexus-5 time, and a cross-reset
mutagen-value metric need LD-13/LD-14. It projects the save across 5m/1h/1d/long-return offline horizons
with the tick+reify primitive, repeats over samples to report an uncertainty band
(sample count, min/max, spread), tags natural/injected provenance without
synthesizing natural timing or merging provenances, and proves no production
Ascension/auto-cast (autoAscend/autoCastAbilities stay false). LD-09 offline larva
grows monotonically over a week (5m 7.65e10 -> 1w 4.51e11). First-Ascension
branches, post-reset recovery, the Nexus 1->5 seed benchmark, and genuine game-RNG
cohorts need Ascension execution support and LD-08/LD-13/LD-14/LD-17 and remain
bounded follow-ups. See `SWARMSIM_LABORATORY_PHASE_1.md` and the status board.

Outcome: Laboratory can orchestrate complete phase benchmarks, sampled random
events, first Ascension, post-reset recovery, and elapsed-time returns.

Focused data: LD-08--LD-09 and LD-13--LD-17.

Focused verification:

- Nexus 1 -> 5 benchmark from named seeds;
- first real premutagen retained and never synthesized for natural timing;
- Ascend now/later and one-last-gate branches;
- first post-reset return-to-Nexus-5 time;
- sample count, RNG/time provenance, confidence interval/uncertainty;
- 5m/1h/1d/long-return offline horizons;
- natural and injected results cannot be merged.

Stop condition: no production auto-Ascend/Mutagen authority.

#### LC-8 - Coverage, boundary matrix, and calibration gate

Outcome: one command reports complete DT coverage, runs selected boundary
matrices, compares Laboratory and runtime winners, and identifies the exact
disagreement layer.

Focused data: all qualified LD fixtures; raw routine outputs remain untracked.

Focused verification:

- every DT ID is `COVERED` or the command fails;
- no `UNMODELED` candidate survives the complete-coverage gate;
- `resetVerified=true` and `stateLeakageDetected=false`;
- deterministic cases reproduce;
- stochastic cases meet declared sample minimums;
- at least one cross-lane and one within-lane winner crossover reproduce;
- report distinguishes formula, coverage, ranking, ordering, guard,
  execution, observability, and harness defects.

Stop condition: findings are distilled into BOOK-04/BOOK-07, raw matrices are
deleted or left untracked, and no production threshold changes are bundled.

### Program verification and evidence

Every LC implementation slice follows
`docs/process/GIT_VERIFICATION_PROTOCOL.md`:

1. implementation commit and push;
2. exact implementation/tree SHA capture;
3. clean exact-SHA verification;
4. predeclared pure checks versus evidence generators;
5. only allowlisted generated paths may become dirty;
6. separate evidence commit and push;
7. final `HEAD == origin/main` and clean tree.

Minimum focused checks grow cumulatively:

- LC-1: existing Phase 1/2A plus decision-snapshot check;
- LC-2: branch isolation/non-mutation/amount acceptance;
- LC-3: Engine tournament and save-window boundaries;
- LC-4: candidate completeness and cross-lane tournament;
- LC-5: sequence/reconstruction/reserve matrix;
- LC-6: Energy threshold/ability opportunity matrix;
- LC-7: phase/offline/stochastic contracts;
- LC-8: full DT coverage and selected reproduced boundary suite.

The complete repository-required build/verify/guardrail suite remains mandatory
for every implementation slice. Expectations may not be rewritten after a run
to force a pass.

### Program completion gate

LC closes only when:

1. all DT-01 through DT-22 tests are runnable through Laboratory;
2. required natural and derived datasets are registered and import-verified;
3. every backend proves isolation and source-save non-mutation;
4. Laboratory ranking is target-aligned and independent;
5. runtime comparison identifies why disagreements occur;
6. full exact-SHA verification and separate evidence are accepted;
7. BOOK-04 contains the distilled decision findings and BOOK-07 contains the
   durable live/calibration facts;
8. no raw test-output tree or parallel planning document remains.

LC completion does not mean the production strategy is automatically changed.
Each resulting strategy change still requires its own narrow authorized work
package.

## Repository health hardening track (RH) - CLOSED 2026-07-19

Source: `REPOSITORY_AUDIT_REVIEW_2026-07-19.md` (findings R1-R9, audited at
`fcfe1432e47e7aec8bfef7ac47a874138d91d057`, 9.4.0). Bounded maintenance track,
no strategy/safety/player-visible change. All six packages landed on
`codex/9.4.0-clean-room`; `npm run verify` green (exit 0) at each merge.

Distilled results (full contracts kept below as historical reference; per-commit
detail in Git):

- **RH-1 (CI, R2)** - `verify.yml` now runs `npm ci` +
  `npx playwright install chromium --with-deps` before `npm run verify`. Real
  Actions confirmation lands on the next PR/main push.
- **RH-2 (script sprawl, R4)** - deleted 32 retired/unreferenced scripts and 27
  `package.json` entries; kept `check-0.14.1-version-surfaces` (still used by the
  strategy-intelligence automation) and `check-version-surfaces.js`.
- **RH-3 (dead runtime code, R1)** - removed 10 zero-reference functions (~736
  lines incl. rebuilt userscript); 2 audit candidates correctly retained as live
  named function expressions.
- **RH-4 (verify hermeticity, R3 partial)** - `scripts/lib/` shared browser
  harness: one Chromium `launchServer` per signature, 24 checks `connect` to it,
  `verify:chain` byte-identical, safe per-script fallback. **Open follow-up:**
  Outcome 2 (serve pinned `swarmsim/swarm@06b4f404` locally for fully offline
  verify) was NOT delivered - checks still hit live swarmsim.com.
- **RH-5 (dead scaffolding, R5)** - deleted the unwired `dev-src/` skeleton
  (~295 lines), de-referenced docs; delete-only, userscript byte-identical.
- **RH-6 (evidence weight, R8)** - pruned 614 routine SA1 artifacts (~35 MB) per
  the user PRUNE decision; retention README left; conclusions already distilled.

Incidental correction (RH-6): the status board's claim that live acceptance runs
restore Playwright `storageState` from `strategy-audit-1/**/live/` is stale - no
such fixtures or code exist.

The only remaining open item is RH-4 Outcome 2 (hermetic local game server);
unscheduled, pick up only if live-site flakiness becomes a real problem.

The detailed package contracts below are retained as historical reference only.

### Parallelization waves

- **Wave 1 (parallel):** RH-1, RH-2, RH-3. Disjoint file sets
  (workflow file / scripts+package.json / runtime-main.js+built userscript).
  Merge order after completion: RH-1, then RH-2, then RH-3 (rebase each on the
  previous merge; conflicts are expected to be zero).
- **Wave 2 (after RH-2 lands):** RH-4. Touches many `scripts/*.js` files, so
  it must not overlap RH-2's deletions.
- **Wave 3 (after RH-3 lands):** RH-5. Touches `runtime-main.js` and the build
  config, so it must not overlap RH-3.
- **User decision required before start:** RH-6.

Model note: RH-1, RH-2, RH-3, and RH-5 are mechanical (RH-5 is now delete-only
per the 2026-07-19 user decision - no extraction); a cheaper model (Sonnet, or
Haiku for RH-1) is sufficient. RH-4 (shared harness) needs normal engineering
judgment (Sonnet or stronger).

### RH-1 - Make CI verify actually runnable (R2)

```text
Product capability: none (infrastructure exception).
Player-visible change: none.
Domains included: .github/workflows/verify.yml only.
Domains explicitly excluded: verify-chain content, scripts, runtime.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: no runtime or verifier source changes.
Focused acceptance states: a green Actions run on a PR branch, or a
  documented red run whose failure is a real check failure (not
  MODULE_NOT_FOUND / missing browser).
Files expected to change: .github/workflows/verify.yml.
Evidence generators and allowlisted paths: none.
Stop condition: workflow installs dependencies (npm ci) and Chromium
  (npx playwright install chromium --with-deps) before npm run verify;
  do not restructure the verify chain itself (that is RH-4).
```

Known caveat to record in the PR: until RH-4, CI remains dependent on the
live `swarmsim.com` site and may be flaky for that reason alone.

### RH-2 - Retire dead scripts and package.json entries (R4)

```text
Product capability: none (infrastructure exception).
Player-visible change: none.
Domains included: scripts/ deletions, package.json script entries.
Domains explicitly excluded: any script referenced by the verify chain, the
  runtime, the build pipeline, or AGENTS.md-required validation.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: npm run build, npm run verify, and
  node scripts/validate-repo-guardrails.js must pass unchanged after removal.
Focused acceptance states: verify green before and after; a grep proving no
  reference to any deleted filename remains in package.json, scripts/,
  .github/, AGENTS.md, or docs/ outside historical release notes.
Files expected to change: deletions of the 5 unreferenced scripts, the 14
  retired check-X.Y.Z-version-surfaces.js files, the 5
  run-0.11.x-deterministic-scenarios.js runners plus their per-version
  check-0.11.x-*.js companions if and only if nothing else references them;
  removal of the corresponding package.json entries.
Evidence generators and allowlisted paths: none.
Stop condition: every deleted file is provably unreferenced; anything with a
  surviving reference is left in place and listed in the handoff instead.
```

Git history is the archive; no `scripts/archive/` tree may be created.

### RH-3 - Remove dead runtime functions (R1)

```text
Product capability: none (infrastructure exception).
Player-visible change: none (byte-identical behavior).
Domains included: the 12 functions listed in
  REPOSITORY_AUDIT_REVIEW_2026-07-19.md R1, in
  dev-src/runtime-sections/runtime-main.js, plus the rebuilt userscript.
Domains explicitly excluded: any other runtime change, any refactor, any
  formatting churn around the deletions.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: DEFAULT_CONFIG untouched; all hard safety defaults
  untouched; no verifier expectation may be edited to force a pass.
Focused acceptance states: re-run the audit's occurrence scan to prove each
  deleted name has zero remaining references; npm run build && npm run verify
  green; version surfaces unchanged (no version bump for a pure deletion
  unless the user requests a release).
Files expected to change: dev-src/runtime-sections/runtime-main.js,
  src/SwarmSim-Strategy-Autobuyer.user.js (rebuilt).
Evidence generators and allowlisted paths: none.
Stop condition: exactly the 12 audited functions removed; if any turns out to
  be referenced after all (dynamic dispatch), leave it and record why.
```

### RH-4 - Shared hermetic verifier harness (R3, R7 partially)

```text
Product capability: none (infrastructure exception).
Player-visible change: none.
Domains included: a shared scripts/lib/ harness (launch once, reuse one
  Chromium instance/page across checks), and a locally served pinned game
  build (swarmsim/swarm @ 06b4f404aa324a0b454348508cfa63d5c0f1ff54, the
  commit already pinned in the runtime) replacing live-site navigation in
  verify-chain checks.
Domains explicitly excluded: check semantics (every assertion keeps its exact
  meaning), the strategy-audit live runners (strategy:audit:live stays live
  by design), safety defaults.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: no check may be weakened or deleted to make the
  harness work; a check that cannot run against the pinned build stays on
  the live site and is listed in the handoff.
Focused acceptance states: npm run verify green offline (network disabled)
  except for explicitly listed live-only checks; total verify wall-clock time
  recorded before and after.
Files expected to change: scripts/lib/* (new), verify-chain scripts'
  harness boilerplate, package.json verify entry, possibly a small
  serve-pinned-game helper script.
Evidence generators and allowlisted paths: none beyond the timing note in
  the handoff.
Stop condition: one harness, one browser launch per verify run for the
  migrated checks, live-site dependency removed from the default chain;
  do not begin parallelizing checks or rewriting them as a test framework.
```

This package is the largest; it may be split per the milestone split rule if
the harness and the pinned-game serving prove to be two independently
verifiable outcomes.

### RH-5 - Delete the dead dev-src scaffolding (R5)

User decision (2026-07-19): junk removal only. Do NOT extract any section
out of runtime-main.js and do NOT add a new build part. The single assembled
userscript must remain the only thing Tampermonkey needs, exactly as today.
This narrows RH-5 to the delete-only path; the extraction option is dropped.

```text
Product capability: none (infrastructure exception).
Player-visible change: none (byte-identical built userscript required).
Domains included: delete the unwired scaffolding that is imported by nothing
  and is not in scripts/canonical-build.config.json - dev-src/guards/ (5
  files), dev-src/overseer/, dev-src/contracts/, and the three
  dev-src/runtime-sections/adapter-*.js files; then update any now-stale
  references in docs/process/MODULARIZATION_PLAN.md and AGENTS.md so the docs
  stop describing scaffolding that no longer exists.
Domains explicitly excluded: ANY extraction or restructuring of
  runtime-main.js; adding or changing build parts; touching
  canonical-build.config.json's parts array; any behavior change; touching
  lane strategy. The build model stays: metadata + runtime-main.js -> one
  userscript.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: before deleting each dev-src file, prove it is
  imported/referenced by nothing that survives (grep its path across
  scripts/, package.json, canonical-build.config.json, AGENTS.md, and active
  docs; references from historical release notes / MODULARIZATION_PLAN prose
  do not block deletion but must be de-referenced in the same change). If any
  file turns out to be wired in, keep it and report. The assembled
  src/SwarmSim-Strategy-Autobuyer.user.js MUST be byte-identical before and
  after (a pure dev-src deletion cannot change it at all).
Focused acceptance states: npm run build:check green (proves the userscript
  Tampermonkey loads is unchanged and still valid); npm run verify green;
  node scripts/validate-repo-guardrails.js green; a grep proving no deleted
  dev-src path survives in scripts/, package.json, the build config, or
  active docs.
Files expected to change: deletions under dev-src/ (guards/, overseer/,
  contracts/, adapter-*.js); docs/process/MODULARIZATION_PLAN.md and AGENTS.md
  reference cleanup only. NOT runtime-main.js, NOT the userscript, NOT the
  build config parts.
Evidence generators and allowlisted paths: none.
Stop condition: the dead, unwired dev-src scaffolding is gone and the docs no
  longer claim it exists; the build still produces the identical single
  Tampermonkey userscript. No extraction performed.
```

### RH-6 - Prune routine evidence matrices (R8) - user decided: PRUNE (2026-07-19)

The user explicitly authorized pruning on 2026-07-19. This package enforces
anti-stagnation rule 8 retroactively on `docs/test-data/strategy-audit-1/`.

```text
Product capability: none (infrastructure exception).
Player-visible change: none.
Domains included: deletions inside docs/test-data/strategy-audit-1/ only.
Domains explicitly excluded: every other docs/test-data/ path (pinned saves,
  clone-ramp, 9.4.0-clean-room verification evidence, versioned scenario
  fixtures); history rewriting of any kind.
Current milestone and horizons: n/a (maintenance).
Advisor, shadow, or execution authority: n/a.
Hard safety boundaries: KEEP any file that is (a) referenced by path from any
  script in scripts/ (note: strategy-audit live runners restore Playwright
  storageState from docs/test-data/strategy-audit-1/**/live/), (b) referenced
  from AGENTS.md, the status board, a foundation doc, a verification evidence
  file, or a release note, or (c) a README/schema/manifest that documents the
  retained set. DELETE only routine raw per-case sweep outputs (matrix
  JSON/CSV/Markdown run artifacts) with no such reference. When in doubt,
  keep and list in the handoff. Git history is the archive; no archive tree,
  no history rewrite, no force push.
Focused acceptance states: a reference scan (grep of every deleted path over
  scripts/, docs/, AGENTS.md, package.json) proving zero surviving
  references; npm run verify green after deletion; the SA1 runners
  (strategy:audit:matrix:sa1:single) still start correctly against retained
  storageState fixtures.
Files expected to change: deletions under docs/test-data/strategy-audit-1/;
  one short retention note (what was kept and why) appended to
  docs/test-data/strategy-audit-1/README.md or created if absent.
Evidence generators and allowlisted paths: none.
Stop condition: only unreferenced routine matrices are gone, the retained
  set is documented, and repository growth from routine sweeps is stopped
  going forward (future sweeps write to untracked paths or are pruned at
  closure per rule 8). Pack-size does not shrink retroactively without
  history rewriting, which stays forbidden - the win is forward-looking.
```

May run in parallel with any other RH package (its file set is disjoint from
RH-1..RH-5).

### Track exit review

The track is closed when RH-1 through RH-5 are merged (RH-6 may close as
"user chose keep"), `npm run verify` is green locally and in CI, and a
one-paragraph result per package is distilled into this section, replacing
the package detail above.

## Milestone exit review

At the end of every milestone, answer only these questions:

1. What can the running script do now that it could not do before?
2. What will the player visibly notice?
3. Which BOOK-00 strategic question became better answered?
4. Which domains and risks were intentionally excluded?
5. What focused evidence protects the claim?
6. Is the next best step another product capability or genuinely necessary
   foundation work?

If question 1 or 2 has no concrete answer, do not declare the milestone done.

## Immediate next action

Read `BOOK00_CURRENT_STATUS.md` for the active work package. The Repository
health hardening track closed on 2026-07-19. As of 2026-07-23 the selected
work package is **LC-1 decision snapshot and candidate manifest** in the active
Laboratory Complete Decision Coverage program above.

Before editing runtime code, map the exact current proposal/result objects from
every reached main-cycle path into the proposed
`swarmsim-lab.decision-snapshot.v1` and
`swarmsim-lab.candidate-manifest.v1` fields. Stop and report any lane that
cannot expose stable identity, exact amount, costs, blockers, target path, or
formula provenance without changing its production decision.

Recommended run: **GPT-5.6 Sol (high reasoning)** because LC-1 fixes the
architecture and evidence contract consumed by every later Laboratory slice.

Escalate when: candidate capture would require production behavior changes,
the proposed schema cannot represent `UNMODELED`/missing candidates honestly,
or Laboratory capture cannot prove player-save and run-history non-mutation.
