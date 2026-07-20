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

## Repository health hardening track (RH)

Source: `REPOSITORY_AUDIT_REVIEW_2026-07-19.md` (findings R1-R9, audited at
`fcfe1432e47e7aec8bfef7ac47a874138d91d057`, 9.4.0).

This is a bounded maintenance track under the same infrastructure exception as
Milestone 0: it is not product capability, so it is capped at the six work
packages below and must not expand into a general platform rewrite. Runtime
strategy, safety defaults, and player-visible behavior must be byte-identical
throughout except where a package explicitly says otherwise (none do).

Track owner (project lead): the coordinating agent that produced the audit.
Parallel execution rules: the agent coordination rules of this runbook apply
unchanged - one agent per work package, one dedicated branch/worktree per
package, no two packages that touch the same files may run concurrently.

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

Read `BOOK00_CURRENT_STATUS.md` for the active work package. As of 2026-07-19
that is the Repository health hardening track (RH) above: Wave 1 packages
RH-1, RH-2, and RH-3 may start in parallel, one agent and one worktree per
package, without widening authority or changing hard safety defaults.
