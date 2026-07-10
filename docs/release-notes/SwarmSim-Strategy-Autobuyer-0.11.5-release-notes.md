# SwarmSim Strategy Autobuyer 0.11.5 - Parent Transition Signal Finalization + Version Export Fix

Date: 2026-07-10

## Summary

0.11.5 is a narrow finalization/report patch.

Fixed issues from formal 0.11.4 verification:

1. R8 cycle 2 could report both `parentStepDecision=BUY` and `actionUnitRefillDecision=BUY`.
2. Normal export and scenario report could surface missing/null version values.

No strategy rewrite was made.

## What changed

### 1) Parent Step vs Parent Refill finalization

When Parent Refill becomes the selected active BUY step, Parent Step is now finalized to a neutral public status:

- `parentStepDecision` is forced to `OBSERVE` (not `BUY`),
- reason text explains Parent Step was already completed and Parent Refill is active,
- internal planner evaluation still happens, but public final state exposes only one active BUY step.

This finalization is applied in runtime state before export/report mapping, so runtime/export/Council/scenario-report stay aligned.

### 2) Active planner action clarity in refill cycles

When refill is BUY, export/scenario cycle fields now report active planner action as Parent Refill.

This prevents cycle-2 ambiguity and keeps best-step output aligned with the refill branch.

### 3) Canonical runtime version propagation

Introduced one canonical runtime version source:

- `AUTOBUYER_VERSION`
- `SCRIPT_VERSION` derives from `AUTOBUYER_VERSION`
- `SCENARIO_REPORT_VERSION` derives from `AUTOBUYER_VERSION`

Version surfaces updated to 0.11.5:

- userscript metadata `@version`
- browser badge source
- normal export `scriptVersion`
- scenario report `scriptVersion`
- scenario report `autobuyerVersion`
- runtime API version fields

### 4) New targeted checks

Added:

- `scripts/check-0.11.5-parent-transition-finalization.js`
- `scripts/check-0.11.5-version-surfaces.js`

These cover Parent Step/Refill finalization invariants and version-surface null-safety.

## Safety defaults

Unchanged:

- `autoCastAbilities=false`
- `autoAscend=false`
- `energySupportBrokerAllowAutoCast=false`
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no blind/aggressive buyMax fallback
