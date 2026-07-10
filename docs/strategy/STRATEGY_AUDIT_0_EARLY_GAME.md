# Strategy Audit 0 - Early-Game Behavioral Baseline

## Purpose

Measure how 0.12.3 actually behaves in controlled early-game states, without
waiting for real time and without changing strategy logic.

## Audit principles

- Use the deterministic scenario harness or existing fixture mechanisms.
- Every state must be reproducible.
- Every state must define explicit initial state.
- No live-save mutation.
- No manually forced BUY or HOLD outcomes.
- Staging may control game state, but not expected planner decision.
- Run normal 0.12.3 planner behavior against each staged state.
- Capture both selected decision and rejected alternatives.
- Run multiple planner cycles when follow-through behavior is part of the
  question.
- Do not add new scoring logic inside the audit itself.

## Initial state matrix

### SA0-01 Clean Start Baseline

Goals:

- Observe first interpreted goal.
- Confirm locked future lanes are not presented as active blockers.
- Confirm first available progression is understandable.

Run:

- 3 planner cycles.

Measure:

- active phase
- active goal
- selected lane
- selected action
- blocker text
- available alternatives
- whether each cycle makes visible progress

### SA0-02 First Producer Purchase

Stage an early state where a normal lower producer purchase is legal.

Goals:

- Confirm purchase is used for concrete progression.
- Confirm planner does not wait without clear reason.
- Confirm reserve and rebuild explanation quality.

### SA0-03 Parent Conversion vs Refill

Stage a state where:

- Parent Step is legal.
- Refill may be needed immediately after.
- Multiple cycles can show follow-through.

Goals:

- Verify planner does not repeat stale Parent Step signal.
- Verify correct transition to refill or next goal.
- Measure real per-cycle goal progress.

### SA0-04 Hatchery Save Window

Stage two nearby states:

- A: Hatchery just outside save window.
- B: Hatchery inside save window.

Goals:

- Observe whether normal buys are allowed in A.
- Observe whether correct resources are protected in B.
- Confirm HOLD text shows concrete ETA or remaining cost.

### SA0-05 Expansion Relevance

Stage an early state where:

- Expansion is relevant.
- Fighting units are visible.
- A bounded Army or Territory purchase can be legal.
- Meat also has a legal purchase.

Goals:

- Observe whether Territory lane produces a real candidate.
- Observe whether it is starved by Meat.
- Observe why coordinator picks the winner.

Note: This state observes current behavior even when Army or Territory loses.
The audit must not assume in advance that Army must win.

### SA0-06 Meaningless Small-Buy Detection

Stage a state where a very small buy is legal but provides negligible goal
progress.

Goals:

- Detect formally legal but practically meaningless buys.
- Document whether current logic distinguishes action occurrence from meaningful
  goal advancement.

## Scope boundary

Audit 0 does not include:

- House of Mirrors casting
- Clone Larvae casting
- Lepidoptera strategy optimization
- Nexus 5 strategy
- Ascension
- Nightbug or Bat
- Full 30-minute simulation
- New strategy modes

These can be included in later audits.
