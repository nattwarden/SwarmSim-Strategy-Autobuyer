# Strategy Audit 0 - Early-Game Behavioral Baseline

## Purpose

Measure how 0.12.3 actually behaves in controlled early-game states, without waiting for real-time progression and without changing normal strategy logic.

## Blocking prerequisite

Do not implement or run Strategy Audit 0 until `STRATEGY_AUDIT_TESTBED_DECISION.md` has been completed by the feasibility work order and a canonical environment has been selected.

## Audit principles

- Use the selected testbed and existing scenario/fixture mechanisms where suitable.
- Every state must be reproducible and define an explicit initial state.
- Do not mutate Sofie's normal player save.
- The isolated audit game instance may be freely staged and mutated.
- Staging may control game state, but never planner output.
- No manually forced BUY/HOLD outcome.
- Run normal 0.12.3 planner behavior against each state.
- Capture selected decisions and rejected alternatives.
- Run multiple cycles when follow-through is part of the question.
- Do not add new scoring logic inside the audit.

> The audit may construct the question, but it must not manufacture the answer.

## State-construction authority

The audit agent may use Angular/game service mutation, constructed saves, snapshots, test-only adapters, scenario overrides, or deterministic time advancement. It may set resources, units, upgrades, visibility, progression, army, Nexus, Hatchery, Expansion, and abilities as required.

All mutations must be serialized in a state mutation manifest and included in the scenario/state hashes.

## Reset and leakage proof

Each scenario must start from a known reset state and record:

- reset method;
- pre-reset hash;
- initial-state hash;
- post-scenario hash;
- reset verification;
- leakage detection.

Successive cycles inside one scenario may share state only when that transition is explicit and captured.

## Visible audit requirement

Every Audit 0 state must be runnable in the selected headed/watch environment so Sofie can inspect the actual UI, Council, Inspector, action, and transition. Bulk headless execution may additionally be used for repeatability.

## Initial state matrix

### SA0-01 Clean Start Baseline

Run: 3 planner cycles.

Goals:

- observe the first interpreted goal;
- confirm locked future lanes are not active blockers;
- confirm first available progression is understandable;
- verify visible progress across cycles.

### SA0-02 First Producer Purchase

Stage an early state where a normal lower producer purchase is legal.

Goals:

- confirm purchase advances a concrete goal;
- confirm planner does not wait without a clear reason;
- inspect reserve/rebuild explanation.

### SA0-03 Parent Conversion vs Refill

Stage a state where Parent Step is legal, refill may be needed immediately, and several cycles expose follow-through.

Goals:

- detect stale repeated Parent Step signals;
- verify transition to refill or the next goal;
- measure per-cycle goal progress.

### SA0-04 Hatchery Save Window

Stage two nearby states:

- A: Hatchery just outside save window;
- B: Hatchery inside save window.

Goals:

- observe whether normal buys are allowed in A;
- observe whether correct resources are protected in B;
- require concrete ETA or remaining cost in HOLD text.

### SA0-05 Expansion Relevance

Stage a state where Expansion is relevant, fighting units are visible, a bounded Army/Territory purchase is legal, and Meat also has a legal purchase.

Goals:

- verify Territory lane produces a real candidate;
- detect lane starvation;
- explain why the coordinator selected the winner.

The audit must not assume Army/Territory should win.

### SA0-06 Meaningless Small-Buy Detection

Stage a state where a very small purchase is legal but provides negligible goal progress.

Goals:

- detect formally legal but practically meaningless actions;
- determine whether the system distinguishes action occurrence from meaningful goal advancement.

## Minimum per-cycle evidence

- state and mutation hashes;
- active phase, goal, and target;
- all lane proposals available to the audit surface;
- selected action and reason;
- best legal and rejected alternatives;
- pre/post resources and production;
- pre/post goal metric or ETA where available;
- Council/Inspector/export/execution consistency;
- screenshot and trace reference in watch mode;
- GOOD, QUESTIONABLE, BAD, or INCONCLUSIVE assessment with explanation.

## Scope boundary

Audit 0 does not include:

- House of Mirrors casting;
- Clone Larvae casting;
- Lepidoptera strategy optimization;
- Nexus 5 strategy;
- Ascension;
- Nightbug or Bat;
- full 30-minute simulation;
- new strategy modes.

These belong to later audits.
