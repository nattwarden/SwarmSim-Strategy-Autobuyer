# Work Order: Implement and Run Strategy Audit 0 (Early Game)

You are implementing and executing Strategy Audit 0 for SwarmSim Strategy
Autobuyer.

## Mandatory reading

Read in this order before coding:

1. `AI.md`
2. `AGENTS.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `docs/strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
5. `docs/strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
6. `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
7. current scenario-harness documentation and related scripts

## Required execution rules

1. Inventory first: identify which audit states are already expressible with
   existing harness/fixture mechanics and list them before adding code.
2. Reuse existing state and scenario mechanisms whenever possible.
3. Do not change normal strategy behavior.
4. Add new audit fixtures and/or an audit runner only when existing harness
   capabilities are insufficient.
5. Execute each state reproducibly.
6. Export required outputs:
   - JSON audit results
   - Markdown summary
   - per-cycle decision trace
   - state hashes
   - planner/Council/Inspector consistency fields
7. Stop after evidence and analysis.
8. Do not automatically build 0.12.4.
9. Classify every observed issue as one of:
   - strategy defect
   - observability defect
   - harness limitation
   - expected behavior
   - unresolved

## Explicit boundaries

- This audit is for measurement, not strategy redesign.
- Do not force expected decisions in fixtures.
- Do not modify runtime safety defaults.
- Do not broaden scope beyond Audit 0 early-game states unless explicitly
  approved.
