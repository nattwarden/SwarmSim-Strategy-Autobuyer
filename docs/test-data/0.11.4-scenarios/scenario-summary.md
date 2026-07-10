# 0.11.4 Deterministic Scenario Summary

- Run at: 2026-07-10T02:35:54.065Z
- Source tag: deterministic-scenario
- Script version: 0.11.4
- Scenario report version: 0.11.4
- Autobuyer version in report: null
- Invariants total: 37
- Invariants pass: 36
- Invariants fail: 1

## Version/Commit verification

- Commit: 11ea0ed
- Commit message: 0.11.4: fix R8 parent-step to refill transition semantics
- Userscript metadata: 0.11.4
- Browser badge text: SwarmBot v0.11.4
- Export scriptVersion: null (missing)
- Scenario report autobuyerVersion: null (missing)

## Harness gating

Flag OFF:

- Harness run denied with explicit key error.
- Normal export has no scenarioId.
- Normal export has no deterministic source tag.
- No scenario test controls visible.
- No simulated actions in normal runHistory.

Flag ON:

- Harness runnable.
- UI stays release-like.
- Safety defaults unchanged (`autoCastAbilities=false`, `autoAscend=false`, `energySupportBrokerAllowAutoCast=false`).

## Scenario results

- H1 PASS
- H2 PASS
- H3 PASS
- H4 PASS
- H5 PASS
- H6 PASS
- R1 PASS
- R2 PASS
- R3 PASS
- R4 PASS
- R5 PASS
- R6 PASS
- R7 PASS
- R8 FAIL

## Primary acceptance test: R8

Cycle 1 (PASS):

- `parentStepDecision=BUY`
- `parentStepTargetUnit=hive network`
- `parentStepParentUnit=neural cluster`
- `actionUnitRefillDecision=OBSERVE`
- `remainingActions=1`
- action unit count `16.7Sx`
- parent unit count `14.9Qa`
- affordability: action `yes`, parent `yes`
- reserve: `parentStepReserveRatio=1.85x`
- active planner action: `Territory: giant arachnomorph`
- `plannerEvaluationRevision=1`
- `harnessCycleRevision=1`

Between-cycle transition (PASS):

- `betweenCycleApplied=yes`
- `plannerTransitionMarker=r8-parent-step-completed`
- `parentStepCompletedForRefill=yes`
- observed override effect: `remainingActions 1 -> 2`
- transition state seen by cycle 2:
	- `betweenCycleApplied=yes`
	- `plannerTransitionMarker=r8-parent-step-completed`
	- `parentStepCompletedForRefill=yes`
	- `transitionSeenByCycle=yes`

Cycle 2 (PARTIAL):

- `transitionSeenByCycle=yes` (PASS)
- revision bump to `plannerEvaluationRevision=2` and `harnessCycleRevision=2` (PASS)
- refill action: `actionUnitRefillDecision=BUY` (PASS)
- refill reason includes `after parent-step` (PASS)
- target and parent units still correct (`hive network`, `neural cluster`) (PASS)
- FAIL: `parentStepDecision` remains `BUY` (expected not to repeat Parent Step)

R8 blocker condition hit:

- repeat Parent Step signal in cycle 2 (`parentStepDecision=BUY`).

## Production-path authenticity assessment

- Scenario definitions do not set direct decision fields such as `parentStepDecision` or `actionUnitRefillDecision`.
- Transition replay appears to hydrate input transition state (`plannerTransitionMarker`, `parentStepCompletedForRefill`, `remainingActions`) rather than writing invariant outcomes directly.
- No hard evidence found of harness directly fabricating cycle-2 BUY decision.
- Remaining issue appears in planner/report behavior where parent-step signal is not suppressed in cycle 2.

## Regression batch details

- H2 cycle-specific semantics: PASS.
- H4 low HoM payoff -> HOLD: PASS.
- H5 strong HoM wins arbitration: PASS.
- H6 no relevant army gate: PASS.
- R1 Expansion save-window: PASS.
- R2 Lepidoptera background: PASS.
- R3 Lepidoptera primary + Beetle Magus: PASS.
- R4 Clone safe under threshold: PASS.
- R5 Clone meaningful: PASS.
- R6 Twin Prep under gate: PASS.
- R7 Twin Prep over gate: PASS.

## UI/export consistency

Checked scenarios: H4, H5, R3, R5, R8 cycle 2.

- active speaker matches `momentumPrimaryAdvisor`: PASS
- Do this now matches `momentumBestStep`: PASS
- Why matches `momentumBestStepReason`: FAIL (text tracks concrete action rationale but diverges from summarized reason label)
- HoM active gate matches HoM reason: PASS
- candidate ranking present and aligned with best use: PASS
- clone decision/reason populated: PASS
- Parent Step/Refill fields populated: PASS
- no `undefined`: PASS
- no `NaN`: PASS
- no empty Council cards observed: PASS

## State restoration

After batch:

1. scenario context cleared
2. config restored
3. scenario flag disabled
4. page reloaded
5. normal 0.11.4 reinjected

Leak checks:

- no `scenarioId`
- no deterministic source tag
- no synthetic markers
- no transition marker leaks
- no `parentStepCompletedForRefill` leaks
- no simulated actions in real runHistory
- live state remains normal

State restoration result: PASS

## Safety sweep

Totals for this pass:

- Clone Larvae auto-casts: 0
- House of Mirrors auto-casts: 0
- autoAscend events: 0
- Nightbug BUY: 0
- Bat BUY: 0
- buyMax signals: 0
- unexpected aggressive fallbacks: 0
- simulated actions in real runHistory: 0

Relevant flags after restoration:

- `autoCastAbilities=false`
- `autoAscend=false`
- `energySupportBrokerAllowAutoCast=false`

## Formal verdict

0.11.4 REQUIRES 0.11.5

Reasons:

1. R8 cycle 2 still repeats parent-step signal (`parentStepDecision=BUY`) while transition expects Parent Refill mode without repeated Parent Step indicator.
2. Version/export completeness requirement is not met because `export scriptVersion` is missing and `scenario report autobuyerVersion` is null.

## Minimal fixscope for 0.11.5

1. Production layer:
- In cycle-2 refill state, suppress or clear repeated parent-step decision field when refill branch is active.
- Keep `actionUnitRefillDecision=BUY` and refill reason unchanged.

2. Report mapping layer:
- Ensure report/export always populate `scriptVersion` and `autobuyerVersion` with `0.11.4+` value.

3. Assertion layer (optional hardening):
- Keep `r8-c2-parent-step-not-repeat` as strict guard to prevent regression.
