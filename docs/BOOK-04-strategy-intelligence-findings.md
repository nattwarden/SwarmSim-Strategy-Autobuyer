# Book 04 - Strategy Intelligence Findings

> Living document
>
> This book records findings from Strategy Audit scenarios and the broader
> Strategy Intelligence phase.
>
> It grows as SA0 and later audit series produce results.
>
> Current verified runtime:
>
> - SwarmSim Strategy Autobuyer `0.12.3`
> - `0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED`
>
> Current testbed:
>
> - Testbed runners introduced on branch `feature/strategy-audit-testbed-runners`
>   (pending merge review)
> - Canary: `TESTBED-CANARY-001` — infrastructure contract, not strategy verdict
>
> Strategy Audit 0 is completed. Strategy Audit 1 is now underway.

---

## Purpose

This book collects:

- behavioral observations from individual SA0–SA9 scenarios
- pattern findings across multiple scenarios
- defect classifications
- strategy decisions and rationale
- known limitations and inconclusive results

It does **not** collect raw runner JSON or Markdown artifacts. Raw runs are
temporary; this book is the retained source of truth.
- testbed infrastructure decisions (those go in `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`)
- game mechanics facts (those go in BOOK-01)
- energy or Laboratory findings (those go in BOOK-02)

---

## Defect classification guide

Every SA scenario finding must be classified as one of:

| Class | Meaning |
|-------|---------|
| `expected behavior` | Planner did what it should. Finding is informational. |
| `strategy defect` | Planner chose a clearly worse action than a documented better one. |
| `observability defect` | Planner decision is unclear or missing from Council/Inspector output. |
| `testbed defect` | The scenario, state, or harness produced misleading or untestable conditions. |
| `harness limitation` | The testbed cannot currently distinguish two behaviors. |
| `inconclusive` | Insufficient data to classify. |

Only a confirmed `strategy defect` may justify a narrow 0.12.4 fix.

A pattern of `strategy defect` or `observability defect` findings may justify a 0.13.0 Strategy Intelligence milestone.

---

## Strategy Audit 0 — Early-Game Behavioral Baseline

Scenarios: SA0-01 through SA0-06.

Scope: early-game planner behavior from clean start through first Expansion.

**Status: Completed (2026-07-12).**

Prerequisite: testbed runner review approved and merged.

### SA0-01 — Clean Start Baseline

- Status: expected behavior
- Purpose: verify planner holds meat correctly before first Hatchery
- Expected outcome: HOLD with Hatchery as closest rejected, ETA coherent
- Findings: The clean-start baseline held meat and surfaced Hatchery as the closest rejected alternative with a coherent ETA.

### SA0-02 — First Producer Purchase

- Status: expected behavior
- Purpose: verify that a normal early producer buy becomes the selected step when legal
- Findings: The planner selected the producer buy as the best legal alternative instead of over-holding.

### SA0-03 — Parent Conversion vs Refill

- Status: expected behavior
- Purpose: verify parent-step conversion and follow-through into refill across cycles
- Findings: The harness replayed the parent-step-to-refill transition across cycles, and the cycle report stayed aligned with the replayed transition.

### SA0-04 — Hatchery Save Window

- Status: expected behavior
- Purpose: compare a state just outside the Hatchery save window with a state inside it
- Findings: The visible run showed the expected contrast. The outside-window state selected a concrete buy, then the inside-window state held meat and reported Hatchery as protected with a concrete ETA.

### SA0-05 — Expansion Relevance

- Status: expected behavior
- Purpose: verify Territory lane produces a real candidate and explain why the winner was selected
- Findings: Territory lane now surfaces a real candidate (Stinger V), but it is rejected on ROI threshold (ETA improvement below configured minimum), while Hatchery remains the selected Engine buy.

### SA0-06 — Meaningless Small-Buy Detection

- Status: expected behavior
- Purpose: detect legal but practically meaningless small buys
- Findings: Territory lane evaluated a legal small buy candidate (Stinger V) and rejected it as non-meaningful because Expansion ETA gain was 0s, below the configured 2m minimum.

---

## Cross-scenario patterns

- Clean-start behavior is now distinguishable from save-window behavior in the visible testbed.
- Hatchery protection is context-sensitive: it is not a blanket hold in every early-game state, but it does become a hard save-window gate when the ETA enters the protected band.
- Parent-step and refill behavior can be replayed through the harness without mutating the live save, which makes the transition easier to observe and compare.
- SA0-05 confirms lane visibility and candidate generation: the remaining boundary is ROI/minimum-improvement tuning, not lane starvation.
- SA0-06 confirms the planner distinguishes legal action availability from meaningful goal advancement.

Next step: Strategy Audit 1 (mid-game multi-lane decision quality).

---

## Strategy Audit 1 — Mid-Game Multi-Lane Decision Quality

Scenarios: SA1-01 through SA1-03.

### SA1 breakpoint matrix runner

SA1 ranking-breakpoint scenarios also have an official one-command batch flow:

```bash
npm run strategy:audit:matrix:sa1
npm run strategy:audit:matrix:sa1:single
npm run strategy:audit:matrix:sa1:isolated
```

The full command runs the seven current breakpoint scenarios twice; the smoke
command runs them once. These fast paths reuse one Chrome window, context, and
page for sequential runs; the isolated variant retains process-per-run confirmation.
This preserves the important testbed capability of feeding many tests through
local execution without treating every scenario as a separate AI prompt.
Per-run JSON and Markdown output is temporary; failed reset, detected leakage,
or any failed scenario makes the matrix command fail. Findings are distilled
into this book and raw run files are not retained.

The runner belongs to Strategy Audit: it probes ranking, gating, execution,
reset, and leakage behavior across staged states. Laboratory remains the
separate read-only counterfactual system. A future Laboratory batch layer may
reuse the same orchestration pattern, but these SA1 commands do not run or
replace Laboratory verifiers.

Scope: mid-game winner quality across competing legal lanes.

**Status: In progress.**

### SA1-01 — Multi-lane legal conflict

- Status: expected behavior
- Purpose: verify winner rationale when Meat, Energy, Territory, and Ability lanes all present concrete alternatives
- Findings:
	- Winner stayed stable across 5 cycles (`Meat BUY drone × 255`) with no lane churn.
	- Territory lane surfaced a concrete candidate (`Stinger V`) but was rejected as below minimum-improvement threshold.
	- Energy lane remained a high-score protected hold (`Nexus save`), indicating reserve policy stayed active while Meat still won execution.
	- Repeated live runs remained stable (same selected lane/action and best rejected alternative), increasing confidence that this is a robust mid-game pattern rather than one-run noise.
	- Earlier top-level `QUESTIONABLE` assessment text was a testbed observability defect and is now fixed for non-canary scenarios.
- Evidence: findings distilled in this book; raw run output is not retained.

### SA1-02 — Territory pressure vs rebuild pressure

- Status: expected behavior
- Purpose: verify that Territory pressure can be represented honestly without forcing Territory to win over Meat rebuild pressure
- Findings:
	- Winner stayed stable across cycles (`Meat BUY drone × 318`) with explicit multi-lane alternatives present.
	- Baseline thresholds: Territory lane candidate (`Stinger V`) was HOLD/rejected by minimum-improvement gate.
	- Threshold experiment (audit-only config overrides): Territory became a legal BUY candidate, but winner still remained Meat.
	- This isolates the next optimization target: winner hierarchy/scoring under mid-game rebuild pressure, not only threshold gating.
	- Energy lane remained a protected hold for Nexus (`Nexus save`) while Meat still won execution, indicating reserve policy and winner selection were coherent together.
	- After assessment fix, top-level verdict reporting is now scenario-appropriate (`GOOD` when cycle observability checks pass).
- Evidence: findings distilled in this book; raw run output is not retained.

### SA1-03 — Energy reserve arbitration

- Status: expected behavior
- Purpose: verify winner coherence when Nexus reserve pressure is elevated while Meat and Territory remain active
- Findings:
	- Winner stayed stable across 5 cycles (`Meat BUY drone × 382`) while Energy remained an explicit protected hold (`Nexus save`).
	- Territory lane remained visible with concrete candidate (`Stinger V`) but did not overtake Meat under default mid-game thresholds.
	- Reserve blockers and winner rationale remained internally consistent (no contradiction between Energy protection and selected action).
- Evidence: findings distilled in this book; raw run output is not retained.

SA1 interim conclusion:

- Across SA1-01/SA1-02/SA1-03, winner selection is stable and explainable, but Territory remains under-selected.
- SA1-02 threshold experiment shows gating is not the only limiter (Territory can become legal BUY and still lose), so next optimization target is ranking/priority calibration.
- SA1-02 high-yield sensitivity reinforces this: even with stronger synthetic territory impact (`territory ROI: +750/sec`), winner remained Meat in this mid-game context.
- SA1-02 ordering-isolation initially produced a legal Territory BUY alternative without execution. This was traced to an audit harness limitation for synthetic Army units (candidate surfaced but synthetic buy was not applied).
- After harness fix, SA1-02 ordering-isolation selects and executes Territory (`selectedLane=Territory`, `selectedDecision=BUY`), so the earlier no-selection signal is reclassified as testbed artifact, not runtime planner behavior.

### SA1 v2 — Narrow Territory-breakpoint sweep (audit-only)

- Status: expected behavior
- Purpose: run a targeted coarse->fine sweep to find the first reproducible and natural Territory-over-Meat breakpoint without changing production strategy or safety defaults.
- Method:
	- representative seeds from corrected sweep150: `sa1-sweep-090` (last Meat), `sa1-sweep-091` (Energy), `sa1-sweep-106` (Clone Prep), `sa1-sweep-019` (nearest Territory margin)
	- two independent dimensions: synthetic Territory effect (`syntheticArmyTerritoryPerUnit`) and Meat profitability (`meatChainReserveMultiplier`, `meatChainMaxPaybackSeconds`)
	- fine pass only if coarse pass showed first Territory winner flip
- Findings:
	- coarse states: `18`
	- fine states: `0` (no coarse flip observed)
	- Territory wins: `0`
	- reproducible Territory wins (>=2): `0`
	- guardrails held for all states (`resetVerified=true`, `stateLeakageDetected=false`)
	- nearest state still strongly Meat-favored (`winnerScore=8110`, `territoryScore=365.1214`, margin `7744.8786`)
- Classification: expected behavior (no breakpoint found in this narrow v2 pass)
- Evidence: findings distilled in this book; raw run output is not retained.

---

## Open questions for Strategy Intelligence 0.13.0

*(Populated as findings accumulate.)*

---

## Related books

- Base mechanics: `BOOK-01-base-mechanics-and-claims.md`
- Energy and Laboratory: `BOOK-02-energy-house-of-mirrors-and-lab.md`
- Verification history: `BOOK-03-verification-history-and-artifacts.md`

## Related strategy documents

- Roadmap: `strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
- SA0 definition: `strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
- Result schema: `strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
- Testbed decision: `strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
