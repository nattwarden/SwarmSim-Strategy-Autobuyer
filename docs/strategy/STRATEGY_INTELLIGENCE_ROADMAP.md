# Strategy Intelligence Roadmap

## Stable provenance

- Current verified runtime: `0.12.4`
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

Laboratory Phase 1 is one experiment family, not the intended final boundary.
Future families may examine purchase timing, producer-versus-upgrade payback,
reserve sensitivity, Expansion tradeoffs, and strategy breakpoints while
preserving read-only simulation and explicit formula provenance.

The SA1 breakpoint matrix establishes the repository's official one-command
batch pattern for many staged Strategy Audit scenarios. It remains separate
from Laboratory verification: SA1 stress-tests strategy decisions, while
Laboratory verifiers protect snapshot, formula, determinism, gating, and
non-mutation contracts. A future Laboratory batch runner can reuse the
orchestration pattern to run many snapshots locally and return aggregated
evidence for analysis; SA1 does not replace or currently implement that layer.

Research should remain proportionate to the project: ask one concrete gameplay
question, run the smallest useful Laboratory or Strategy Audit batch, inspect
the artifacts, and reproduce only the findings worth pursuing. Prefer the fast
single-window matrix; reserve process-isolated runs for confirmation. Add new
process or experiment machinery only when a real recurring need justifies it.

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

### 0.12.4

Verified technical foundation.

### Strategy Audit testbed feasibility and decision

Select a stable test environment before implementing the audit runner. Compare production, pinned-local, persistent-extension, and VS Code browser approaches. Visible execution is a product requirement.

See:

- `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
- `docs/prompts/next-strategy-audit-testbed-feasibility.md`

### Strategy Audit 0

Early-game behavioral baseline from staged, reproducible states.

Completed 2026-07-12 (SA0-01 through SA0-06).

### Strategy Audit 1

Mid-game multi-lane decision quality.

Current SA1 evidence trend (2026-07-12):

- Territory can be surfaced and made legal BUY in controlled audit scenarios.
- Meat still tends to win in tested mid-game rebuild states, even under relaxed Territory gates and higher synthetic Territory yield.
- Ordering-isolation no-selection behavior was traced to a testbed synthetic-unit execution artifact and corrected in the audit harness.

Immediate SA1 focus:

- isolate ranking breakpoints with audit-only score/priority sensitivity;
- continue ranking/priority breakpoint mapping with audit-only sensitivity variants;
- propose one narrow production fix only after reproducible breakpoint evidence.

Official batch commands:

```bash
npm run strategy:audit:matrix:sa1
npm run strategy:audit:matrix:sa1:single
npm run strategy:audit:matrix:sa1:isolated
```

The first runs every current breakpoint scenario twice; the smoke command runs
each once. Both reuse one Chrome window, context, and page for sequential runs.
The isolated command starts a new process and Chrome instance per run for
confirmation. Per-run JSON and Markdown artifacts are written under
Strategy Audit findings are distilled into BOOK-04; raw run output is temporary
and is not retained in the repository.

See:

- `docs/strategy/STRATEGY_AUDIT_1_MID_GAME.md`
- `docs/strategy/STRATEGY_AUDIT_1_BREAKPOINT_MATRIX.md`
- `docs/prompts/next-strategy-audit-1-mid-game.md`

### 0.12.5

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
