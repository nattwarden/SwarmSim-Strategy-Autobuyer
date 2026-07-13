# Strategy Audit 1 - Mid-Game Multi-Lane Decision Quality

## Purpose

Measure mid-game decision quality when multiple lanes present legal actions at the same time.

Audit 1 answers:

- does the coordinator pick the best lane with coherent rationale;
- are best rejected alternatives credible and stable;
- does follow-through produce meaningful progress over multiple cycles;
- are blocker categories consistent with winner/loser explanations.

## Audit principles

- Use selected testbed runner contracts and visible execution support.
- Stage state freely, but do not force planner output or lane winner.
- Capture all per-cycle evidence required by `STRATEGY_AUDIT_RESULT_SCHEMA.md`.
- Keep changes narrow and preserve safety defaults.

## Initial state matrix

### SA1-01 Multi-lane legal conflict

Stage a state where Engine, Meat, and Territory each have legal candidates.

Goals:

- verify winner rationale is coherent against strongest rejected alternatives;
- verify blocker category semantics are internally consistent;
- verify selected action produces visible transition over 3-5 cycles.

### SA1-02 Territory pressure vs rebuild pressure

Stage a state where Territory ROI and Meat rebuild pressure disagree.

Goals:

- verify territory candidate quality is represented honestly;
- verify meat-chain reserve explanation remains coherent;
- detect starvation/churn across cycles.

### SA1-03 Energy reserve arbitration in active multi-lane state

Stage a state where Energy, Territory, and Meat all have legal pressure while Nexus reserve is close.

Goals:

- verify reserve blockers are consistent across alternatives;
- verify winner selection does not contradict stated reserve policy;
- verify no hidden auto-cast assumptions appear.

## Minimum evidence requirements

- state and mutation hashes;
- selected lane/action/reason;
- legal and rejected alternatives with scores/blockers;
- best rejected alternative quality;
- cycle-to-cycle progress signal;
- consistency checks (Council/Inspector/export/execution);
- explicit assessment label with justification.

## Scope boundary

Audit 1 does not redesign strategy behavior. It measures existing behavior quality in mid-game multi-lane conflicts.
