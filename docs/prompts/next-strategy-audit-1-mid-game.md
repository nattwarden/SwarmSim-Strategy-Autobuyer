# Work Order: Implement and Run Strategy Audit 1 (Mid-Game Multi-Lane Quality)

## Scope and objective

Strategy Audit 1 evaluates mid-game decision quality across competing lanes.

Primary goals:

- verify lane comparison quality when multiple legal actions are available;
- verify winner rationale against best rejected alternatives;
- detect starvation, churn, and weak follow-through across cycles;
- distinguish legal action from meaningful progress.

Audit 1 is measurement, not strategy redesign.

## Mandatory reading order

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `docs/strategy/README.md`
5. `docs/strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
6. `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
7. `docs/BOOK-04-strategy-intelligence-findings.md`
8. `docs/BOOK-05-community-strategy-claims.md`
9. `docs/prompts/next-strategy-audit-0-early-game.md`
10. `scripts/strategy-audit-testbed-core.js` and runner entry scripts

## Hard execution rules

1. Use the selected visible testbed runner contracts.
2. Stage state, but never force planner output.
3. Do not force lane winner, BUY/HOLD decision, or executed action.
4. Capture complete per-cycle schema evidence.
5. Preserve safety defaults and runtime behavior.
6. Keep source changes narrow and auditable.
7. Update source-of-truth books after each accepted SA1 scenario.

## Required output per accepted SA1 scenario

- temporary artifact JSON during execution; findings distilled into BOOK-04;
- scenario status and findings in `BOOK-04`;
- claim impact (if any) in `BOOK-05`;
- release/history note only when cross-scenario significance is established.

## Initial SA1 focus suggestions

- multi-lane conflict where Engine, Meat, and Territory each present legal candidates;
- tie-break quality and rationale stability over 3-5 cycles;
- detect candidate churn where target/source changes every cycle without progress;
- validate blocker category coherence against selected winner.

## Defect classification

Classify each finding as one of:

- `expected behavior`
- `strategy defect`
- `observability defect`
- `testbed defect`
- `harness limitation`
- `inconclusive`

Only confirmed `strategy defect` findings may justify a narrow 0.12.4 patch.

## Stop condition

Stop after:

- at least one reproducible SA1 scenario is executed with complete evidence;
- books are updated to source-of-truth quality;
- validation commands pass.
