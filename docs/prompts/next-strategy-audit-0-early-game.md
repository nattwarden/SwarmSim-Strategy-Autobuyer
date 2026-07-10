# Work Order: Implement and Run Strategy Audit 0 (Early Game)

## Blocking prerequisite

Do not implement or run Strategy Audit 0 until the feasibility work order has completed `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md` and selected the canonical automated, visible, and production-parity environments.

## Mandatory reading

Read in this order:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `docs/strategy/README.md`
5. `docs/strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
6. `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
7. `docs/strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
8. `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
9. completed feasibility report and selected-environment work order
10. current scenario-harness and browser-runner documentation/scripts.

## State authority

You may freely stage and mutate the isolated audit game instance through game services, constructed saves, snapshots, test adapters, scenario overrides, and deterministic time advancement.

You may set resources, production, units, upgrades, visibility, Nexus, Hatchery, Expansion, army, abilities, and progression flags.

Do not mutate Sofie's normal player save.

> The audit may construct the question, but it must not manufacture the answer.

Do not force planner decisions, lane winners, Council/Inspector output, or executed action.

## Required execution rules

1. Inventory which states are expressible using the selected environment.
2. Reuse existing mechanics where they preserve real planner behavior.
3. Add audit-only state adapters when needed.
4. Serialize and hash every mutation manifest.
5. Prove reset and state-leakage protection.
6. Execute each state reproducibly.
7. Run both fast/headless and watch/headed forms where supported.
8. Export JSON, Markdown, per-cycle trace, hashes, consistency fields, screenshots, and trace references.
9. Do not change normal strategy behavior during measurement.
10. Stop after evidence and analysis.
11. Do not automatically build 0.12.4.

## Issue classification

Classify every finding as:

- strategy defect;
- observability defect;
- harness/testbed limitation;
- expected behavior;
- unresolved.

## Explicit boundaries

- Audit 0 is measurement, not strategy redesign.
- Do not add scoring solely to make tests pass.
- Do not broaden beyond the documented early-game states without approval.
- Preserve runtime safety defaults.
