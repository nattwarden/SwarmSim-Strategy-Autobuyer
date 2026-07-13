# Strategy Documentation Index

This directory defines the Strategy Intelligence phase after the verified 0.12.3 technical baseline.

## Read in this order

1. [BOOK-00 Current Execution Status](BOOK00_CURRENT_STATUS.md)
2. [BOOK-00 Product Delivery Runbook](BOOK00_PRODUCT_DELIVERY_RUNBOOK.md)
3. [Strategy Intelligence Roadmap](STRATEGY_INTELLIGENCE_ROADMAP.md)
4. [Strategy Audit Testbed Decision](STRATEGY_AUDIT_TESTBED_DECISION.md)
5. [Strategy Audit Testbed Feasibility Report](STRATEGY_AUDIT_TESTBED_FEASIBILITY_REPORT.md)
6. [Strategy Audit Testbed Runners](STRATEGY_AUDIT_TESTBED_RUNNERS.md)
7. [Strategy Audit 0 - Early-Game Behavioral Baseline](STRATEGY_AUDIT_0_EARLY_GAME.md)
8. [Strategy Audit 1 - Mid-Game Multi-Lane Decision Quality](STRATEGY_AUDIT_1_MID_GAME.md)
9. [Strategy Audit Result Schema](STRATEGY_AUDIT_RESULT_SCHEMA.md)
10. [Testbed Implementation Work Order](../prompts/next-strategy-audit-testbed-implementation.md)
11. [Strategy Audit 0 Work Order](../prompts/next-strategy-audit-0-early-game.md)
12. [Strategy Audit 1 Work Order](../prompts/next-strategy-audit-1-mid-game.md)

## Document roles

- `docs/SWARMSIM_GAME_MODEL.md` is the active strategy and safety contract.
- `BOOK00_CURRENT_STATUS.md` is the live milestone, checklist, blocker, and handoff board.
- `BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` turns BOOK-00 into product milestones and anti-stagnation delivery rules.
- `STRATEGY_INTELLIGENCE_ROADMAP.md` defines product direction and sequencing.
- `STRATEGY_AUDIT_TESTBED_DECISION.md` defines the test-environment decision that must be completed before Audit 0.
- `STRATEGY_AUDIT_TESTBED_FEASIBILITY_REPORT.md` records the selected canonical/watch/parity environment and rejected alternatives.
- `STRATEGY_AUDIT_TESTBED_RUNNERS.md` defines the permanent runner command contracts and artifact paths.
- `STRATEGY_AUDIT_0_EARLY_GAME.md` defines the first behavioral state matrix.
- `STRATEGY_AUDIT_1_MID_GAME.md` defines the mid-game multi-lane state matrix.
- `STRATEGY_AUDIT_RESULT_SCHEMA.md` defines machine-readable and human-readable evidence.
- `docs/prompts/*.md` are executable work orders for Copilot/Codex agents.

## Current sequence

```text
0.13.0 verified Unified Purchase Evaluator foundation
-> stabilize the launchpad once
-> whole-economy comparison preview
-> bounded reversible Coordinator v2
-> Energy production integration
-> Energy ability timing advisor
-> Ascension and Mutagen advisor
-> six-domain strategic coordinator
```

Strategy Audit supports these product milestones. Additional audit volume is
not itself a milestone.
