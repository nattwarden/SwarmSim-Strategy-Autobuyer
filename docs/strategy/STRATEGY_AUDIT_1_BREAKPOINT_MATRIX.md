# Strategy Audit 1 Breakpoint Matrix

## Purpose

This matrix defines the ranking-breakpoint test sequence for SA1 mid-game winner selection.

Goal: find the smallest reproducible change where Territory can beat Meat in the SA1-02 state family, without changing production defaults.

## Baseline reference

- Baseline state: `sa1-02`
- Existing sensitivity references:
  - `sa1-02-exp-yield`
  - `sa1-02-exp-no-meat-planner`

## Matrix scenarios

1. `sa1-04-rank-bp-y80`
- Change: `syntheticArmyTerritoryPerUnit = 80`
- Expectation: Meat may still win, but Territory score margin should improve.

2. `sa1-05-rank-bp-y120`
- Change: `syntheticArmyTerritoryPerUnit = 120`
- Expectation: identify whether pure territory-impact increase can flip winner with Meat planner still enabled.

3. `sa1-06-rank-bp-y120-meat-tight`
- Changes:
  - `syntheticArmyTerritoryPerUnit = 120`
  - `meatChainReserveMultiplier = 3`
  - `meatChainMaxPaybackSeconds = 900`
- Expectation: detect first reproducible winner flip threshold when Meat guard strictness is increased.

4. `sa1-07-rank-bp-y160`
- Change: `syntheticArmyTerritoryPerUnit = 160`
- Expectation: verify whether extreme territory impact alone can flip winner.

5. `sa1-08-rank-bp-y160-meat-tight`
- Changes:
  - `syntheticArmyTerritoryPerUnit = 160`
  - `meatChainReserveMultiplier = 4`
  - `meatChainMaxPaybackSeconds = 600`
- Expectation: stronger Meat guard strictness may expose the first stable Territory win.

6. `sa1-09-rank-bp-y160-meat-tight-fallback-tight`
- Changes:
  - same as step 5
  - `meatFallbackMaxRankDrop = 2`
  - `meatFallbackChunkPercent = 5`
- Expectation: test if Meat fallback behavior is preserving Meat wins.

7. `sa1-10-rank-bp-y160-meat-tight-fallback-off`
- Changes:
  - same as step 5
  - `meatFallbackEnabled = false`
- Expectation: terminal isolation check for fallback influence.

All scenarios are audit-only and must not be copied into production defaults.

## Run order

Run each scenario for 5 cycles in this exact order:

1. `sa1-04-rank-bp-y80`
2. `sa1-05-rank-bp-y120`
3. `sa1-06-rank-bp-y120-meat-tight`
4. `sa1-07-rank-bp-y160`
5. `sa1-08-rank-bp-y160-meat-tight`
6. `sa1-09-rank-bp-y160-meat-tight-fallback-tight`
7. `sa1-10-rank-bp-y160-meat-tight-fallback-off`

Command template:

```powershell
npm run strategy:audit:live -- --scenario <scenario-id> --cycles 5
```

One-command matrix execution (all scenarios):

```powershell
npm run strategy:audit:matrix:sa1
```

One-command smoke (single run per scenario):

```powershell
npm run strategy:audit:matrix:sa1:single
```

One-command generated 150-unique-state sweep (single run/state):

```powershell
npm run strategy:audit:matrix:sa1:sweep150
```

One-command targeted SA1 v2 coarse->fine breakpoint sweep:

```powershell
npm run strategy:audit:matrix:sa1:v2
```

One-command targeted SA1 v2 wide sweep (larger jumps + higher unlock tiers):

```powershell
npm run strategy:audit:matrix:sa1:v2:wide
```

Generated sweep scenarios use `sa1-sweep-001` .. `sa1-sweep-150` and vary:

- synthetic territory yield,
- Meat reserve multiplier,
- Meat max payback seconds.

They are also stratified over 10 distinct state profiles (resource bank shape,
passive production profile, army density, and engine ETA pressure) so adjacent
scenario ids are not just tiny tick shifts of one base state.

Fully isolated confirmation (new Node process and Chrome instance per run):

```powershell
npm run strategy:audit:matrix:sa1:isolated
```

These commands are the official SA1 batch entry points. The full command runs
all seven scenarios twice by default; the smoke command runs every scenario
once. Both reuse one Chrome window, browser context, and page for sequential
runs. Reset failure, detected state leakage, or any failed run makes
the matrix exit non-zero. The isolated confirmation command preserves the
original process-per-run behavior for stronger final confirmation.

Each child run writes timestamped JSON and Markdown results below
`docs/test-data/strategy-audit-1/<scenario-id>/live/`. The runner streams every run to
the terminal; it does not currently create a separate matrix-summary artifact.

## Architecture boundary

The SA1 matrix and Laboratory are complementary, separate flows:

- Strategy Audit runs the real strategy against many staged breakpoint states
  to expose ranking, gating, execution, reset, and state-leakage behavior.
- Laboratory captures one state and compares isolated counterfactual actions
  using read-only deterministic projection and non-mutation checks.
- Laboratory version checks and guardrails verify its schemas, formulas,
  gating, and safety contract. The SA1 matrix does not replace those verifiers.

The one-command orchestration pattern is intentionally reusable. A future
Laboratory batch runner may apply Laboratory experiment families to many
snapshots and aggregate their evidence without requiring one AI interaction per
simulation. That batch layer is a planned integration point, not a capability
implemented by this SA1 runner.

## Evidence fields to compare

For each run, record:

- `selectedLane`
- `selectedDecision`
- `selectedAction`
- `actionBudget`
- `bestLegalAlternative`
- `legalAlternatives` (especially Territory candidate score)
- `rejectedAlternatives` (Meat blockers, if any)
- `resetVerified`
- `stateLeakageDetected`

## Acceptance conditions

1. Breakpoint found:
- at least one matrix scenario repeatedly selects Territory as winner,
- while `resetVerified=true` and `stateLeakageDetected=false`.

2. No breakpoint in this matrix:
- Meat remains winner in all three scenarios,
- despite increasing territory impact and tighter Meat guards.

3. Production patch gate:
- no production ranking patch is allowed until breakpoint evidence is reproducible across at least 2 repeated runs of the same scenario.

## Reporting target

After each matrix run, update:

- `docs/BOOK-04-strategy-intelligence-findings.md`
- `docs/BOOK-05-community-strategy-claims.md`
- `docs/process/HISTORY.md`

Use evidence links under `docs/test-data/strategy-audit-1/`.

## SA1 v2 narrow sweep status

Most recent targeted run:

- `docs/test-data/strategy-audit-1/sa1-v2-breakpoint/2026-07-13T04-47-57-757Z/sa1-v2-summary.md`

Method:

- representative seeds from corrected sweep150:
  - last Meat regime: `sa1-sweep-090`
  - Energy regime: `sa1-sweep-091`
  - Clone Prep regime: `sa1-sweep-106`
  - nearest Territory margin: `sa1-sweep-019`
- coarse ladder over two independent dimensions:
  - `syntheticArmyTerritoryPerUnit`
  - Meat profitability (`meatChainReserveMultiplier`, `meatChainMaxPaybackSeconds`)
- fine search only triggers if coarse shows first Territory winner flip.

Result:

- coarse states: `18`
- fine states: `0` (no coarse flip found)
- Territory wins: `0`
- reproducible Territory wins (>=2): `0`
- guardrails: `resetVerified=true` and `stateLeakageDetected=false` for all v2 states.

Nearest Territory case remained strongly Meat-favored:

- scenario: `sa1-v2-meat-s090-y380-r6-p450`
- winner score: `8110`
- Territory score: `365.1214`
- score margin (winner - Territory): `7744.8786`

Conclusion for this v2 pass: no natural Territory-over-Meat breakpoint observed yet.
