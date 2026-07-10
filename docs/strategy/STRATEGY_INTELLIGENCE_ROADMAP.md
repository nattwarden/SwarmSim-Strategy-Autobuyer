# Strategy Intelligence Roadmap

## Stable provenance

- Current verified runtime: `0.12.3`
- Runtime implementation commit: `c819c7d7adc8ab0280e06d25466f6697fb915409`
- Mature-save acceptance evidence commit: `636cfb4b061ce9a0c72d273812a977ede0114c27`
- Strategy Intelligence planning introduced: `3ec61fe48754fcdba5bfd17fcd0e4ef577e6cbf6`
- Current repository HEAD: resolve dynamically with `git rev-parse HEAD`; do not pin mutable HEAD here.

Current strategy behavior remains based on the existing multi-lane, post-Nexus, Council, Army Seed, and Energy Support architecture. The 0.12.x Laboratory work verified evidence capture and did not redesign normal strategy behavior.

Laboratory is currently strongest as a controlled comparison system for:

- `WAIT`
- `CLONE_LARVAE`
- `HOUSE_OF_MIRRORS`

It is not yet a general strategic scorer for normal purchases and competing planner lanes.

## Product north star

SwarmSim Strategy Autobuyer should become a methodical player that:

- understands the current position and active goal;
- compares the most relevant legal next steps;
- performs justified reversible progression;
- explains why the selected action beat the alternatives;
- reports expected progress over explicit horizons;
- preserves hard safety rules;
- states when the decision should be reconsidered.

Council and planner surfaces should eventually expose:

- chosen action;
- active goal and target;
- best legal alternatives;
- best rejected alternative;
- why the winner won;
- expected progress;
- hard and soft blockers;
- reconsideration trigger.

## Required phase order

### 0.12.3

Verified technical foundation.

### Strategy Audit testbed feasibility and decision

Select a stable test environment before implementing the audit runner. Compare production, pinned-local, persistent-extension, and VS Code browser approaches. Visible execution is a product requirement.

See:

- `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
- `docs/prompts/next-strategy-audit-testbed-feasibility.md`

### Strategy Audit 0

Early-game behavioral baseline from staged, reproducible states.

### Strategy Audit 1

Mid-game multi-lane decision quality.

### 0.12.4

Only if an audit identifies one narrow, concrete strategy or observability defect.

### Possible 0.13.0

Counterfactual Strategy Advisor / Strategy Intelligence foundation.

## 0.13.0 direction (exploratory)

Potential capabilities:

- compare the chosen buy with relevant legal alternatives;
- show impact over 1 and 5 minutes, later 30 minutes where justified;
- distinguish raw production from direct goal progress;
- compare Meat, Engine, Territory, Energy, and Ability guidance;
- preserve hard blockers;
- keep auto-cast and auto-ascend disabled by default;
- avoid optimizing only for immediate production.

## User modes (direction only)

- Advisor Mode
- Methodical Optimizer
- High-Tempo Optimizer

These modes are not part of the testbed or Audit 0 implementation.
