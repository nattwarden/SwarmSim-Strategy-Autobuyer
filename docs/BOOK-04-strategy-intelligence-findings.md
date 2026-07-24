# Book 04 - Strategy Intelligence Findings

> Living document
>
> This book records findings from Strategy Audit scenarios and the broader
> Strategy Intelligence phase.
>
> It grows as SA0 and later audit series produce results.
>
> Current runtime inspected for the decision crosswalk:
>
> - SwarmSim Strategy Autobuyer `9.4.0`
> - historical findings below retain their original version scope
>
> Current testbed:
>
> - Testbed runners introduced on branch `feature/strategy-audit-testbed-runners`
>   (pending merge review)
> - Canary: `TESTBED-CANARY-001` — infrastructure contract, not strategy verdict
>
> Strategy Audit 0 is completed. Strategy Audit 1 is now underway.

---

## Purpose

This book collects:

- behavioral observations from individual SA0–SA9 scenarios
- pattern findings across multiple scenarios
- defect classifications
- strategy decisions and rationale
- known limitations and inconclusive results

It does **not** collect raw runner JSON or Markdown artifacts. Raw runs are
temporary; this book is the retained source of truth.
- testbed infrastructure decisions (those go in `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`)
- game mechanics facts (those go in BOOK-01)
- energy or Laboratory findings (those go in BOOK-02)

---

## Defect classification guide

Every SA scenario finding must be classified as one of:

| Class | Meaning |
|-------|---------|
| `expected behavior` | Planner did what it should. Finding is informational. |
| `strategy defect` | Planner chose a clearly worse action than a documented better one. |
| `observability defect` | Planner decision is unclear or missing from Council/Inspector output. |
| `testbed defect` | The scenario, state, or harness produced misleading or untestable conditions. |
| `harness limitation` | The testbed cannot currently distinguish two behaviors. |
| `inconclusive` | Insufficient data to classify. |

Only a confirmed `strategy defect` may justify a narrow production change.

A pattern of `strategy defect` or `observability defect` findings may justify
a future Strategy Intelligence work package.

---

## Strategy Audit 0 — Early-Game Behavioral Baseline

Scenarios: SA0-01 through SA0-06.

Scope: early-game planner behavior from clean start through first Expansion.

**Status: Completed (2026-07-12).**

Prerequisite: testbed runner review approved and merged.

### SA0-01 — Clean Start Baseline

- Status: expected behavior
- Purpose: verify planner holds meat correctly before first Hatchery
- Expected outcome: HOLD with Hatchery as closest rejected, ETA coherent
- Findings: The clean-start baseline held meat and surfaced Hatchery as the closest rejected alternative with a coherent ETA.

### SA0-02 — First Producer Purchase

- Status: expected behavior
- Purpose: verify that a normal early producer buy becomes the selected step when legal
- Findings: The planner selected the producer buy as the best legal alternative instead of over-holding.

### SA0-03 — Parent Conversion vs Refill

- Status: expected behavior
- Purpose: verify parent-step conversion and follow-through into refill across cycles
- Findings: The harness replayed the parent-step-to-refill transition across cycles, and the cycle report stayed aligned with the replayed transition.

### SA0-04 — Hatchery Save Window

- Status: expected behavior
- Purpose: compare a state just outside the Hatchery save window with a state inside it
- Findings: The visible run showed the expected contrast. The outside-window state selected a concrete buy, then the inside-window state held meat and reported Hatchery as protected with a concrete ETA.

### SA0-05 — Expansion Relevance

- Status: expected behavior
- Purpose: verify Territory lane produces a real candidate and explain why the winner was selected
- Findings: Territory lane now surfaces a real candidate (Stinger V), but it is rejected on ROI threshold (ETA improvement below configured minimum), while Hatchery remains the selected Engine buy.

### SA0-06 — Meaningless Small-Buy Detection

- Status: expected behavior
- Purpose: detect legal but practically meaningless small buys
- Findings: Territory lane evaluated a legal small buy candidate (Stinger V) and rejected it as non-meaningful because Expansion ETA gain was 0s, below the configured 2m minimum.

---

## Cross-scenario patterns

- Clean-start behavior is now distinguishable from save-window behavior in the visible testbed.
- Hatchery protection is context-sensitive: it is not a blanket hold in every early-game state, but it does become a hard save-window gate when the ETA enters the protected band.
- Parent-step and refill behavior can be replayed through the harness without mutating the live save, which makes the transition easier to observe and compare.
- SA0-05 confirms lane visibility and candidate generation: the remaining boundary is ROI/minimum-improvement tuning, not lane starvation.
- SA0-06 confirms the planner distinguishes legal action availability from meaningful goal advancement.

Next step: Strategy Audit 1 (mid-game multi-lane decision quality).

---

## Strategy Audit 1 — Mid-Game Multi-Lane Decision Quality

Scenarios: SA1-01 through SA1-03.

### SA1 breakpoint matrix runner

SA1 ranking-breakpoint scenarios also have an official one-command batch flow:

```bash
npm run strategy:audit:matrix:sa1
npm run strategy:audit:matrix:sa1:single
npm run strategy:audit:matrix:sa1:isolated
```

The full command runs the seven current breakpoint scenarios twice; the smoke
command runs them once. These fast paths reuse one Chrome window, context, and
page for sequential runs; the isolated variant retains process-per-run confirmation.
This preserves the important testbed capability of feeding many tests through
local execution without treating every scenario as a separate AI prompt.
Per-run JSON and Markdown output is temporary; failed reset, detected leakage,
or any failed scenario makes the matrix command fail. Findings are distilled
into this book and raw run files are not retained.

The runner belongs to Strategy Audit: it probes ranking, gating, execution,
reset, and leakage behavior across staged states. Laboratory remains the
separate read-only counterfactual system. A future Laboratory batch layer may
reuse the same orchestration pattern, but these SA1 commands do not run or
replace Laboratory verifiers.

Scope: mid-game winner quality across competing legal lanes.

**Status: In progress.**

### SA1-01 — Multi-lane legal conflict

- Status: expected behavior
- Purpose: verify winner rationale when Meat, Energy, Territory, and Ability lanes all present concrete alternatives
- Findings:
	- Winner stayed stable across 5 cycles (`Meat BUY drone × 255`) with no lane churn.
	- Territory lane surfaced a concrete candidate (`Stinger V`) but was rejected as below minimum-improvement threshold.
	- Energy lane remained a high-score protected hold (`Nexus save`), indicating reserve policy stayed active while Meat still won execution.
	- Repeated live runs remained stable (same selected lane/action and best rejected alternative), increasing confidence that this is a robust mid-game pattern rather than one-run noise.
	- Earlier top-level `QUESTIONABLE` assessment text was a testbed observability defect and is now fixed for non-canary scenarios.
- Evidence: findings distilled in this book; raw run output is not retained.

### SA1-02 — Territory pressure vs rebuild pressure

- Status: expected behavior
- Purpose: verify that Territory pressure can be represented honestly without forcing Territory to win over Meat rebuild pressure
- Findings:
	- Winner stayed stable across cycles (`Meat BUY drone × 318`) with explicit multi-lane alternatives present.
	- Baseline thresholds: Territory lane candidate (`Stinger V`) was HOLD/rejected by minimum-improvement gate.
	- Threshold experiment (audit-only config overrides): Territory became a legal BUY candidate, but winner still remained Meat.
	- This isolates the next optimization target: winner hierarchy/scoring under mid-game rebuild pressure, not only threshold gating.
	- Energy lane remained a protected hold for Nexus (`Nexus save`) while Meat still won execution, indicating reserve policy and winner selection were coherent together.
	- After assessment fix, top-level verdict reporting is now scenario-appropriate (`GOOD` when cycle observability checks pass).
- Evidence: findings distilled in this book; raw run output is not retained.

### SA1-03 — Energy reserve arbitration

- Status: expected behavior
- Purpose: verify winner coherence when Nexus reserve pressure is elevated while Meat and Territory remain active
- Findings:
	- Winner stayed stable across 5 cycles (`Meat BUY drone × 382`) while Energy remained an explicit protected hold (`Nexus save`).
	- Territory lane remained visible with concrete candidate (`Stinger V`) but did not overtake Meat under default mid-game thresholds.
	- Reserve blockers and winner rationale remained internally consistent (no contradiction between Energy protection and selected action).
- Evidence: findings distilled in this book; raw run output is not retained.

SA1 interim conclusion:

- Across SA1-01/SA1-02/SA1-03, winner selection is stable and explainable, but Territory remains under-selected.
- SA1-02 threshold experiment shows gating is not the only limiter (Territory can become legal BUY and still lose), so next optimization target is ranking/priority calibration.
- SA1-02 high-yield sensitivity reinforces this: even with stronger synthetic territory impact (`territory ROI: +750/sec`), winner remained Meat in this mid-game context.
- SA1-02 ordering-isolation initially produced a legal Territory BUY alternative without execution. This was traced to an audit harness limitation for synthetic Army units (candidate surfaced but synthetic buy was not applied).
- After harness fix, SA1-02 ordering-isolation selects and executes Territory (`selectedLane=Territory`, `selectedDecision=BUY`), so the earlier no-selection signal is reclassified as testbed artifact, not runtime planner behavior.

### SA1 v2 — Narrow Territory-breakpoint sweep (audit-only)

- Status: expected behavior
- Purpose: run a targeted coarse->fine sweep to find the first reproducible and natural Territory-over-Meat breakpoint without changing production strategy or safety defaults.
- Method:
	- representative seeds from corrected sweep150: `sa1-sweep-090` (last Meat), `sa1-sweep-091` (Energy), `sa1-sweep-106` (Clone Prep), `sa1-sweep-019` (nearest Territory margin)
	- two independent dimensions: synthetic Territory effect (`syntheticArmyTerritoryPerUnit`) and Meat profitability (`meatChainReserveMultiplier`, `meatChainMaxPaybackSeconds`)
	- fine pass only if coarse pass showed first Territory winner flip
- Findings:
	- coarse states: `18`
	- fine states: `0` (no coarse flip observed)
	- Territory wins: `0`
	- reproducible Territory wins (>=2): `0`
	- guardrails held for all states (`resetVerified=true`, `stateLeakageDetected=false`)
	- nearest state still strongly Meat-favored (`winnerScore=8110`, `territoryScore=365.1214`, margin `7744.8786`)
- Classification: expected behavior (no breakpoint found in this narrow v2 pass)
- Evidence: findings distilled in this book; raw run output is not retained.

---

## Open decision questions for current Strategy Intelligence

### Decision correctness contract

A test is decisive only when it can answer whether the script chose the best
allowed action for the current phase target. Every decision test must therefore
record:

1. a named phase target and evaluation horizon;
2. one immutable starting state;
3. every materially legal candidate, including `HOLD`;
4. the complete action package, including sacrifices and reconstruction;
5. hard constraints and reserves left after the package;
6. the primary outcome, normally time to the phase gate;
7. secondary rate, unlock, Energy, Crystal, active-larva, and cocoon effects;
8. the runtime-selected action and reason from the same state.

Price, unit tier, immediate rate gain, and “the button was buyable” are proxy
signals, not verdicts. Promote a finding only when the same-state
counterfactual is reproduced or when a deterministic model and a live result
agree. Random events must be fixed, sampled separately, or reported as
uncertainty.

### Canonical strategy-testing protocol

This is the repository-wide protocol for testing strategic choices. It applies
to manual browser research, Laboratory counterfactuals, Strategy Audit
scenarios, and comparisons against the production runtime.

#### Objective: choose the first click of the best current route

The optimization question is:

> From the exact current state, which allowed next click begins the route with
> the shortest expected time to the current phase target?

The phase target must be explicit: next Nexus, Nexus 5, next Expansion when it
is the active larva bridge, first Ascension, or the next post-Ascension target.
“More Meat”, “more Army”, and “more larvae” are intermediate effects unless
one of them is itself the named gate.

The winning candidate can be:

- a direct purchase;
- an upgrade;
- a deliberate hold;
- the first click in a bounded multi-click package such as
  build -> sacrifice -> unlock -> rebuild;
- an advisor-only ability recommendation;
- an all-in investment.

Score the complete bounded package, but execute only its next click and
re-evaluate the whole state immediately afterward. A package is not continuing
authorization: a new unlock, price, random award, resource rate, or competing
candidate may invalidate it after any click.

#### Balance is a diagnostic, not a quota

The script must not force equal spending across Meat, Territory, Larvae, and
Energy. Equal distribution has no strategic value by itself. It must instead
rescan every relevant lane because the lanes feed one another and the best
bottleneck changes over time.

A lane is relevant when at least one of these is true:

- it directly funds the named phase gate;
- it supplies the resource currently blocking a better candidate;
- its next unlock changes the feasible candidate set;
- its bounded investment materially improves the gate ETA;
- it restores a producer sacrificed by the best package;
- it prevents a hard resource, Clone, Nexus, or Ascension constraint from
  invalidating the route.

A same-lane streak is therefore not automatically wrong. It is a warning to
re-run the full candidate scan. Continue the streak only while that lane keeps
winning against every materially legal cross-lane alternative. Never switch
lanes merely to look balanced, and never remain in a lane because earlier
clicks have already invested there.

#### When an all-in action is valid

An all-in or near-zero-reserve action is strategically valid only when all of
the following are demonstrated from the same starting state:

1. its complete package beats HOLD and every material cross-lane alternative
   on the named target and horizon;
2. it preserves hard safety rules and any resource that cannot be recovered;
3. a sacrificed production link is either irrelevant for the horizon or has a
   measured reconstruction path;
4. the advantage remains after including reconstruction time and opportunity
   cost;
5. the result is not dependent on an unlabelled injected resource, random
   reward, stale price, or optimistic offline assumption;
6. the script will rescan after the click instead of blindly completing an
   obsolete all-in sequence.

If these conditions hold, “diversification” is not a reason to reject the
action. If they do not hold, an all-in choice is an unmeasured gamble.

#### Required candidate scan

At each tested decision point, enumerate the candidates that are both visible
and causally relevant:

| Candidate family | Minimum candidates to inspect |
|---|---|
| Engine | Hatchery, Expansion, Achievement-based larva multiplier, HOLD |
| Meat | Faster, Twin, next producer tier, refill/rebuild, bounded current action unit, HOLD |
| Territory | every visible Army family under the same bounded resource rule, relevant Twin, Army seed, HOLD |
| Larvae/Clone | direct spend, cocoon protection, Clone now, Clone later, named post-Clone use, HOLD |
| Energy | Nexus, Lepidoptera, Bat/Nightbug when allowed, each relevant ability, Crystal bridge, Ascension reserve, HOLD |
| Phase/reset | finish current gate, prepare the following gate, Ascend now/later, post-reset recovery, HOLD |

Do not retain a dominated candidate merely to make the table symmetrical.
Record why it was screened out: unaffordable, safety-blocked, no target path,
negligible material gain, or strictly worse than another candidate.

#### Test types and what each can prove

| Test type | Purpose | May prove | May not prove alone |
|---|---|---|---|
| Mechanics check | Cost, effect, visibility, cap, rounding, cooldown | What a button does | That clicking it is optimal |
| One-click branch | Compare immediate legal choices from one save | Local winner for the stated horizon | A long sequence or universal threshold |
| Package branch | Compare sacrifice/unlock/rebuild sequences | Best first click of that bounded route | Correctness after the package state changes unexpectedly |
| Phase benchmark | Compare complete routes to Nexus/Ascension | End-to-end route quality for the tested seed | Exact behavior in every intermediate state |
| Stochastic sample | Measure premutagen/Crystal/random outcomes | Distribution estimate with sample size | A deterministic schedule from a small sample |
| Strategy Audit | Observe the actual runtime selection and execution | What the script does in staged states | That the selected action is optimal without a counterfactual |
| Laboratory | Compare read-only candidate outcomes | Counterfactual ranking under its model | Live timing or production mutation |

#### Repeatable branch workflow

1. **Name the target and horizon.** Use an active-click horizon, a fixed idle
   interval, or a complete phase gate; never mix them silently.
2. **Freeze the starting state.** Export/save it, record game/script version,
   SHA-256 when retained, rates, banks, upgrades, unlocks, cooldowns, and
   random-state limitations.
3. **Capture the runtime verdict.** Record selected action, reason, best
   allowed and rejected alternatives, protected resources, and action budget.
4. **Enumerate all material candidates.** Include HOLD and all relevant lanes;
   apply one common reserve rule when comparing unit batches.
5. **Run isolated branches.** Restore the exact start before every branch.
   Change only the candidate action or declared policy being tested.
6. **Measure the full consequence.** Record immediate deltas, reconstruction,
   resource rates, unlocks, and actual/predicted time to the named target.
7. **Repeat.** Deterministic branches must reproduce. Stochastic branches must
   report sample count and uncertainty rather than collapse into one verdict.
8. **Compare with the script.** Classify agreement, strategy defect,
   observability defect, harness limitation, or inconclusive evidence.
9. **Promote narrowly.** A winning branch becomes a conditional rule scoped to
   its state features. It does not become a global threshold until boundary
   sweeps reproduce the crossover.

#### Required decision record

Every retained test conclusion must be reconstructable from this record:

| Field | Required content |
|---|---|
| Identity | Test ID, date, game version, script version, seed/save hash |
| Objective | Phase target, horizon, primary success metric |
| State | All relevant banks, rates, units, upgrades, cooldowns, caps, unlocks |
| Candidates | Exact click/package, bounded amount, costs, rejected reason, HOLD |
| Constraints | Nexus/Energy reserve, active larvae, cocoons, reconstruction floor, irreversible risks |
| Runtime | Script-selected lane/action/reason and action budget |
| Outcome | Immediate delta, reconstruction state, target ETA/time, next bottleneck |
| Verdict | Winner, margin, repeat count, evidence grade, scope |
| Consequence | No rule yet, advisor rule, scenario requirement, or proposed narrow runtime change |

The primary comparison is target completion time. When a complete ETA is not
observable, use the closest causal metric—such as percentage of the exact gate
funded or a measured rate change—and mark the verdict provisional. Never
combine unrelated lane scores without documenting the conversion to the common
target metric.

#### Anti-lock and anti-bias checks

Before accepting any result, ask:

- Did every relevant lane receive a candidate, or was one absent because its
  planner never proposed it?
- Did the fixed runtime order spend a shared resource before a later lane was
  evaluated?
- Did the test compare equal bounded resource exposure rather than `buyMax`
  for one lane and a small batch for another?
- Did a reserve rule protect an actually useful future action, or merely leave
  resources idle?
- Did an immediate rate increase delay a more valuable unlock?
- Did a temporary production loss get measured through reconstruction?
- Did passive production during Energy accumulation change the remaining gate?
- Did the result depend on active clicking, idle time, or offline time, and was
  that horizon declared?
- Would the same choice still win just below and just above the observed
  threshold?

Failure of any check makes the result incomplete, not automatically wrong.

### Laboratory disposition and development direction

**Decision: keep and extend Laboratory into the single orchestration surface
for every decision-data test in this book. Do not scrap it and do not rewrite
it into one broad duplicate game simulator.**

Laboratory already owns the hardest trustworthy test primitives:

- immutable same-state snapshots and deterministic hashes;
- isolated, read-only counterfactual branches;
- live-state non-mutation proof;
- Decimal-safe source/runtime formula validation;
- explicit legal-versus-safe action status;
- WAIT baselines, fixed horizons, exports, and reproducible fixtures;
- current support for Clone Larvae, House of Mirrors, and resource Rushes.

Those capabilities make it the correct independent counterfactual oracle. Its
current limitation is scope, not architectural invalidity. Phase 1/2A applies
one Energy action at `t=0`, then projects passive development for 60/300
seconds. It does not spend Rush output, purchase Engine/Meat/Army candidates,
execute multi-click reconstruction, replan after a click, simulate a complete
phase, or produce a common target-based winner. The Laboratory target is to
close all of those gaps and make every DT-01 through DT-22 test expressible,
runnable, and reportable through one Laboratory experiment contract.

“Laboratory can test it” does not require one calculation engine. Laboratory
is the test orchestrator and may route a branch to:

- the fast source-verified projection engine for known deterministic formulas;
- a disposable sandbox game instance restored from the same cloned save and
  executing real bounded game commands;
- an explicit multi-step policy/sequence runner that re-evaluates after every
  step;
- a controlled elapsed-time/offline runner;
- a repeated stochastic sampler for random awards and premutagen;
- a live-calibration pass when the game exposes no independently verified
  formula.

All backends must emit the same decision record, target metric, provenance,
state-leakage proof, and runtime-comparison fields. The real player save remains
read-only even when a disposable sandbox branch mutates its private clone.

#### The three-surface evidence model

Use the testing surfaces together rather than asking any one of them to prove
everything:

| Surface | Responsibility | Required independence |
|---|---|---|
| Laboratory | “What would each allowed candidate do from this immutable state?” | Must not select winners with the same production ranking code being tested. |
| Strategy Audit | “What did the real script propose, select, block, and execute?” | Must retain actual planner order, guards, amounts, and reasons. |
| Live/manual branch | “Do the formulas, timing, UI effects, random events, and reconstruction match the game?” | Must distinguish natural timing from injected/disposable mechanics branches. |

A production rule is strong when Laboratory ranks a candidate independently,
Strategy Audit shows the script chooses it, and a live branch confirms the
predicted consequence. Disagreement identifies whether the defect is formula,
candidate coverage, ranking, execution, observability, or harness behavior.

#### Complete-coverage Laboratory roadmap

Preserve Phase 1/2A schemas and behavior as historical verified contracts.
Extend through new versioned experiment types:

1. **L1 — decision snapshot and candidate manifest.**
   Capture the named phase target, horizon, runtime verdict, action budget,
   every lane proposal, rejected reason, exact bounded amount, costs, reserves,
   unlock dependencies, and the complete Army roster. This closes missing
   candidate coverage without changing any action.
2. **L2 — isolated branch backend.**
   Restore the exact snapshot/save into a disposable sandbox branch for every
   candidate, verify the restored fingerprint, execute only exact bounded
   commands, and destroy the branch afterward. This backend is the escape hatch
   for mechanics that cannot be projected honestly without duplicating the
   game. The live source save must be fingerprint-identical before and after.
3. **L3 — one-click tournament.**
   Add Engine, bounded unit, bounded upgrade, ability, Crystal, reset, and HOLD
   interventions. Prefer source-verified projections when complete and use L2
   sandbox execution otherwise. Calculate the common target outcome in an
   independent Laboratory adapter. First targets: DT-02, DT-03, DT-09,
   DT-10, DT-11, DT-13, DT-16, and DT-17.
4. **L4 — explicit package experiments.**
   Add a small versioned sequence schema for named
   build -> sacrifice -> unlock -> rebuild packages. Every step has an exact
   amount and stop condition; branch state is re-evaluated between steps.
   First targets: DT-07, DT-08, DT-12, DT-15, and DT-18. Do not add an
   unrestricted scripting language.
5. **L5 — target, horizon, offline, and stochastic evaluator.**
   Compare branches on one declared phase metric: gate completion time,
   percentage of exact gate funded, or a clearly labelled provisional causal
   metric. Support active-click, fixed-idle, and phase-completion horizons
   without silently mixing them. Add explicit elapsed-time replay and repeated
   random-event sampling with seed/RNG provenance where available.
6. **L6 — batch, crossover, and coverage runner.**
   Run the same experiment across named saves and just-below/at/just-above
   boundaries. Report winner margin, repeats, uncertainty, candidate coverage,
   formula status, and state leakage. Maintain a machine-readable map from
   every DT ID to its Laboratory adapter, backend, fixture, verifier, and
   coverage status. Feed retained conclusions into BOOK-04, not raw per-run
   artifact trees.

L1 is the correct first implementation slice. It exposes missing candidates
and circular rankings before additional simulation formulas are written. L2
then provides a general same-save execution primitive, and L3 should begin with
Hatchery versus Expansion because both mechanics and the common larva target
are comparatively bounded. Meat reconstruction and full phase routing belong
in L4 because they require multi-step state transitions.

#### Complete-coverage acceptance gate

Laboratory development is not complete merely because it supports more action
types. It reaches the required target only when:

1. every DT-01 through DT-22 row has a runnable Laboratory experiment or a
   Laboratory-owned sampled/calibration protocol;
2. every visible materially relevant candidate is represented, explicitly
   blocked, or explicitly marked `UNMODELED`;
3. `UNMODELED` entries fail the complete-coverage gate until an adapter or
   honest sampled protocol exists;
4. every branch restores the same state fingerprint and proves zero leakage to
   the player save and sibling branches;
5. active, passive, offline, package, threshold, and stochastic horizons are
   separately representable;
6. Laboratory outcome ranking remains independent from the production ranking
   being evaluated;
7. the report directly compares Laboratory’s winner with the runtime-selected
   next click and identifies the disagreement layer;
8. boundary matrices can reproduce the crossover where the winning lane or
   action changes.

This makes Laboratory comprehensive as a testing system without requiring
every uncertainty to be converted into a guessed deterministic formula.

The full implementation sequence, versioned contracts, LD-00 through LD-17
test-data catalog, DT coverage map, per-slice verification, and Claude handoff
live in `strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` under
`Laboratory Complete Decision Coverage program (LC)`. The selected first slice
is mirrored in `strategy/BOOK00_CURRENT_STATUS.md`.

#### Laboratory hard boundaries to retain

Laboratory remains development-only, explicitly gated, manually triggered,
read-only, and simulation-only. It must never:

- mutate the real save or normal run history;
- auto-apply a recommendation to production;
- silently guess a missing formula;
- use the production winner score as its independent oracle;
- hide a candidate because the production planner failed to propose it;
- claim natural timing from an injected resource branch;
- collapse different phase targets or horizons into one unexplained score;
- grow into a complete parallel Swarm Simulator implementation.

If a candidate cannot yet be tested honestly, Laboratory should still
capture and label it `UNMODELED` with the missing formula/state fields. Missing
coverage is evidence; silently omitting the lane recreates the lock-in problem
the Laboratory is meant to expose. `UNMODELED` is an acceptable intermediate
status, not an acceptable final coverage result.

#### What remains outside Laboratory

Natural premutagen frequency, Crystal award randomness, offline reconciliation,
first-Ascension reset effects, UI visibility across real ascension tiers, and
wall-clock active-play ergonomics require live or sampled evidence. Laboratory
must own and orchestrate those sampling protocols, retain their provenance, and
make the resulting data available to its branch comparisons; it must not invent
the distributions.

Coverage labels used below:

- **D:** deterministic verifier covers the guard or transition.
- **SA:** Strategy Audit covers the selection in staged states.
- **L:** exact live observation exists in BOOK-07.
- **M:** mechanic/source or modified-branch evidence only.
- **None:** no retained decisive evidence.

### Canonical open decision-test matrix (2026-07-23)

This matrix is the canonical open-test backlog. BOOK-07 owns the live facts;
this book owns the comparison against current runtime behavior.

| ID | Decision state the script can encounter | Current runtime path/policy | Existing evidence | Decisive test and pass criterion | Priority |
|---|---|---|---|---|---|
| DT-01 | A new phase gate appears: next Nexus, Nexus 5, first Ascension, or post-Ascension recovery. | Goal inference is distributed across Engine, Energy, Ability, Ascension, and legacy Smart paths; there is no single production owner for phase target. | L/M | Replay representative saves at every phase boundary. The declared target must remain stable until completed or invalidated, and every selected action must reduce its predicted completion time. | P0 |
| DT-02 | Hatchery and Expansion are both buyable or both near-buyable. | `handleLarvaEnginePriority()` orders Expansion before Hatchery; save windows are 600s Territory and 180s Meat. | D/L | From one seed, branch to Hatchery, Expansion, and HOLD. Compare percentage larva gain and time to the next phase gate, including the resource rebuild. Fixed ordering passes only when it matches the branch winner. | P0 |
| DT-03 | A candidate crosses a save-window boundary. | Engine protects Meat at `<=180s` to Hatchery and Territory at `<=600s` to Expansion. | D | Test 179/180/181s and 599/600/601s with competing Meat/Army actions. A hold passes only if it beats the candidate over the named horizon; verify exact-boundary behavior and reason text. | P1 |
| DT-04 | Meat, Territory, Energy, Engine, Clone, and upgrades all have legal actions. | The main cycle still runs ordered legacy paths; `m6DecisionOwnsMainCycle=false`. M6 provides comparison/observability but does not universally own execution. | SA | Build natural and staged conflict states. Compare the runtime winner with same-state counterfactual outcomes. Current SA1 Meat dominance is not accepted as optimal until a natural Territory/Engine/Clone crossover can win when it should. | P0 |
| DT-05 | Several actions are useful in the same five-second cycle. | `smartMaxActionsPerRun=4`; path order and earlier spending can change later applicability. | D | Compare one-, two-, and four-action cycles with fresh re-evaluation after each action. Pass when the ordered package beats any permutation that is legal from the same state and no stale proposal consumes a slot. | P1 |
| DT-06 | Larvae can fund Engine, Meat-chain construction, Army, Twin, or cocoon preparation. | Protected-resource, Clone Buffer, Engine, Meat, and Army gates act in separate planners. | D/L | Sweep larva banks around each simultaneous cost. The winner must minimize phase-gate ETA while preserving the exact reconstruction/cocoon requirement; verify that no lane sees spendable larvae the previous lane already committed. | P0 |
| DT-07 | Faster, Twin, parent-tier unlock, and refill all compete in one Meat-chain tier. | `runUnlockPlanner()`, critical upgrades, `buySmartUpgrades()`, parent-step logic, and fallback apply different gates. | D/L | From one late-chain seed, execute each full build-sacrifice-rebuild package and HOLD. Compare restored downstream production, larvae spent, and time to the next named tier/Engine gate. Immediate post-sacrifice balance cannot decide the test. | P0 |
| DT-08 | Sacrificing a producer is recoverable actively but damaging passively. | Default Meat reserve is `1.25×`; special unlock/parent/Twin and action-unit bypasses use different reserve rules. | L | Run `0×`, `1.25×`, `1.5×`, and `2×` from the same state under active, 5-minute idle, 1-hour idle, and offline horizons. Pass when policy selects the reserve with the shortest target ETA for the declared horizon. | P0 |
| DT-09 | Direct low-tier filler is legal while passive production or a higher action unit dominates it. | Smart units, Meat fallback, and action-unit guards may still surface lower purchases after holds. | D/L | Test direct Drone/Queen/lower-filler batches against HOLD and the next parent package. Reject purchases whose target ETA gain is below a calibrated material threshold or which delay the active action unit. | P1 |
| DT-10 | Several Army families are visible with different Meat/larva constraints. | `buySmartUnits()` and Territory ROI logic rank current candidates; starvation/seed planners can create Army actions. | D/SA/L | Sweep every visible family with one common bounded-reserve rule and compute marginal whole-Army Territory/s plus Expansion ETA. A natural state must demonstrate the expected winner and at least one Territory-over-Meat crossover. | P0 |
| DT-11 | Army is empty/weak or Territory has lost repeatedly while Expansion matters. | Territory seed/prep planners activate after configured relevance and starvation conditions (`12` runs; bounded seed thresholds). | D | Vary zero Army, weak Army, Expansion distance, and Meat/larva reserves. Seed only when its full cost shortens Expansion ETA by the configured meaningful amount and beats Meat/Engine alternatives. | P1 |
| DT-12 | Energy can buy House of Mirrors, while Army can be seeded first. | House auto-cast is opt-in; readiness evaluates Army, Energy reserve, Expansion payoff, and target alignment. | D/L | From one seed compare Mirror now, best bounded Army seed then Mirror, Rush/Swarmwarp, and HOLD. Use Energy spent per completed Expansion and future gate ETA. Calibrate the minimum material pre-Mirror seed fraction. | P0 |
| DT-13 | Before Nexus 5, Energy can fund Nexus, Lepidoptera, or an ability. | `handleEnergyStrategy()` normally buys/saves Nexus; Lepidoptera has pre-Nexus blocks and soft targets. Abilities remain advisor-only except narrow opt-ins. | D/L | Branch each Nexus tier with several moth counts and Energy banks. The winner is the route with minimum wall-clock time to Nexus 5, including Energy-rate payback and lost tactical casts. | P0 |
| DT-14 | After Nexus 5, Energy can fund Clone, Mirror, Rush/Swarmwarp, producers, or Ascension reserve. | Decisions are split among Energy, Clone Ramp, House opt-in, advisors, and Ascension protection. | D/L/M | At exact `1.6k/2k/2.5k/12k` boundaries and near Ascension, compare every legal action plus HOLD against the named gate. Pass only when spend does not lengthen the higher-priority Ascension path more than the gate it completes is worth. | P0 |
| DT-15 | Clone bank approaches cap or Clone output competes with normal larva spending. | Clone Ramp auto-casts one bounded cast at cap by default; continuous-at-cap is opt-in; Clone Buffer protects larvae/cocoons. | D/L | Replay at 99.8/99.9/100% cap, with and without a funded post-cast use. Compare one-shot, continuous, delayed cast, and no cocoon conversion. Measure time to the named Twin/Engine gate and verify pre-existing larvae remain untouched. | P0 |
| DT-16 | Crystals can bridge an ability now or be retained through Ascension. | No general automatic Crystal-spend policy; Nexus/Energy protection observes held Energy, while live play is manual. | L | Compare exact conversion, full conversion, and HOLD before Expansion and Ascension. Include cooldown-dependent award probability, permanent max-Energy gain, and time to Nexus 5 after reset. | P1 |
| DT-17 | Bat, Lepidoptera, or Nightbug is buyable. | Default blocks Nightbug/Bat auto-buy; Lepidoptera uses ROI/soft-target logic. | D/L | Natural-run branch across short Expansion, medium Nexus, and first-Ascension horizons. Pass when producer payback plus ability scaling beats the best immediate cast or reserve; explicitly test cap-limited and non-cap-limited states. | P1 |
| DT-18 | Real premutagen appears and Ascension becomes legal. | `tryAutoAscend()` exists but `autoAscend=false`; Ascension advisor is default. | D/M | Preserve the first natural branch. Compare ascend now, Energy spend to lower cost, one last Expansion/Hatchery, and HOLD. Measure reset payoff and time back to Nexus 5; never use injected premutagen as timing evidence. | P0 |
| DT-19 | The first reset exposes mutagen acquisition and spending choices. | Mutagen remains advisor-only and is covered structurally, not by a natural first-reset outcome. | D/None | Record first natural mutagen source, amount, available upgrades, retained crystals, and post-reset rates. Branch the first affordable choices and measure time to the next phase gate. | P1 |
| DT-20 | A random Hatchery/Expansion award, Achievement threshold, unlock, or ascension tier changes candidate visibility. | Planners read the live model each cycle, but the strategic value of stochastic awards and visibility transitions is not calibrated. | L/M | Use deterministic fixtures for visibility boundaries and repeated natural samples for probabilities. The script must replan on the fresh state and must not encode a schedule from a small negative sample. | P1 |
| DT-21 | The game resumes after a long offline interval with large banks and changed bottlenecks. | Runtime evaluates current state but has no explicit active-versus-offline decision horizon. | L/None | Replay the same seed after several elapsed-time horizons. Compare immediate package ordering, reserve choice, and first ten actions. Pass when the plan responds to current banks rather than repeating the active-play sequence blindly. | P2 |
| DT-22 | Twin rounding, buy-max, Decimal magnitude, or a disappearing button changes the executed amount. | Execution uses bounded amount paths and multiple acceptance/boundary verifiers; blind aggressive `buyMax` is forbidden by default. | D | Sweep Twin multipliers, exact targets, maximums, huge Decimal values, and stale visibility. Proposal, accepted amount, actual delta, and reported amount must agree without overspend or no-op success. | P1 |

### What is already covered versus what is still missing

The repository has strong deterministic coverage for safety, bounded execution,
resource locks, same-cycle applicability, lane observability, Clone Ramp, and
several staged transitions. SA0 confirms coherent early-game behavior. SA1
confirms stable multi-lane reporting and exposes a strong Meat ranking bias.

The missing evidence is primarily **decision quality**, not button mechanics:

- no complete phase-target benchmark from clean start to Nexus 5;
- no same-save reserve-policy comparison;
- no natural Territory-over-Meat crossover accepted by the production ranking;
- no complete late Meat package tournament;
- no natural Energy-allocation benchmark from Nexus 5 to first Ascension;
- no natural first-Ascension and post-reset result.

Those gaps should be closed before changing production thresholds. A
deterministic verifier proves that a guard behaves as written; it does not prove
that the configured guard is strategically optimal.

---

## Related books

- Base mechanics: `BOOK-01-base-mechanics-and-claims.md`
- Energy and Laboratory: `BOOK-02-energy-house-of-mirrors-and-lab.md`
- Verification history: `BOOK-03-verification-history-and-artifacts.md`
- Real-time play evidence: `BOOK-07-realtime-play-data-and-reproducible-saves.md`

## Related strategy documents

- Roadmap: `strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
- SA0 definition: `strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
- Result schema: `strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
- Testbed decision: `strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
