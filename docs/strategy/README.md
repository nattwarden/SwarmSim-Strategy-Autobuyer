# Strategy Documentation Index

This directory defines the Strategy Intelligence phase after the verified 0.12.3 technical baseline.

## Read in this order

1. [Strategy Intelligence Roadmap](STRATEGY_INTELLIGENCE_ROADMAP.md)
2. [Strategy Audit Testbed Decision](STRATEGY_AUDIT_TESTBED_DECISION.md)
3. [Strategy Audit 0 - Early-Game Behavioral Baseline](STRATEGY_AUDIT_0_EARLY_GAME.md)
4. [Strategy Audit Result Schema](STRATEGY_AUDIT_RESULT_SCHEMA.md)
5. [Testbed Feasibility Work Order](../prompts/next-strategy-audit-testbed-feasibility.md)
6. [Strategy Audit 0 Work Order](../prompts/next-strategy-audit-0-early-game.md)

## Document roles

- `docs/SWARMSIM_GAME_MODEL.md` is the active strategy and safety contract.
- `STRATEGY_INTELLIGENCE_ROADMAP.md` defines product direction and sequencing.
- `STRATEGY_AUDIT_TESTBED_DECISION.md` defines the test-environment decision that must be completed before Audit 0.
- `STRATEGY_AUDIT_0_EARLY_GAME.md` defines the first behavioral state matrix.
- `STRATEGY_AUDIT_RESULT_SCHEMA.md` defines machine-readable and human-readable evidence.
- `docs/prompts/*.md` are executable work orders for Copilot/Codex agents.

## Current sequence

```text
0.12.3 verified foundation
-> testbed feasibility and environment decision
-> Strategy Audit 0
-> Strategy Audit 1
-> narrow 0.12.4 only if evidence identifies a concrete defect
-> possible 0.13.0 Strategy Intelligence foundation
```

Do not begin Strategy Audit 0 until the testbed feasibility work order has selected and documented the canonical automated, visible, and production-parity environments.
