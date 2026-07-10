# Browser Verification Agent Prompt

Use this when running browser-based verification for SwarmSim Strategy Autobuyer.

## Purpose

Run deterministic/live browser checks and capture any newly discovered game facts
in a concise, version-scoped, reproducible way.

## Required run protocol

1. Run Version Gate first (FAIL FAST).
2. Confirm active script version and scenario data version.
2. Run the requested harness/live verification path.
3. Record pass/fail outputs and failed invariants exactly.
4. If any new factual game claim is discovered, append a compact fact block in
   `docs/live-logs/` during the same update.

## Version Gate (hard)

All four version fields must match the target version:

1. userscript metadata `@version`
2. browser badge version
3. runtime export `scriptVersion`
4. scenario report `autobuyerVersion`

If any field mismatches or is null, stop and mark verification FAIL.

## Hard rules

- Do not treat speculation as fact.
- Do not overwrite prior evidence blocks; append dated updates.
- Do not create duplicate claim files when an existing claim log already exists.
- Keep facts concise and evidence-linked.
- Scenario reports must contain non-empty cycles for every executed scenario.
- Multi-cycle acceptance scenarios must include cycle transition trace:
   `betweenCycleApplied`, `plannerTransitionMarker`,
   `parentStepCompletedForRefill`, `transitionSeenByCycle`, and before/after
   `remainingActions`.
- Do not edit expectations after execution to force pass.
- If any hard gate fails, final verdict must be `REQUIRES NEXT PATCH`.

## Fact block template

```md
## Fact: <short claim>
- Status: CONFIRMED | PARTIAL | REJECTED
- Scope: <script/scenario/version/window>
- Evidence: <payload fields, scenario id/cycle, or direct observation>
- Why this is factual: <1 sentence>
- Implication: <1 sentence, optional>
```

## Delivery minimum

- Verification commands/actions performed
- Version surfaces observed
- Scenario totals and failure list
- Safety snapshot
- New facts added (or explicit "no new facts")
