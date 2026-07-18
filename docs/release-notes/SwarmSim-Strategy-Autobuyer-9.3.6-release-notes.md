# SwarmSim Strategy Autobuyer 9.3.6 — release notes

Date: 2026-07-19

## Summary

9.3.6 is an **internal observability and accountability** build. There is **no
player-visible strategy or behavior change**: the bot plays exactly as 9.3.5,
with the same purchases, reserves, and hard-safety defaults. This release exists
to mark the completed main-cycle path-boundary work and the recorded ownership
verdict, so the running build is traceable.

## What changed

- **Path-boundary observability across all ten retained legacy main-cycle
  paths** (Phase-3 slices 8–16). Every real purchase the bot makes now carries a
  canonical, cycle-bound, fail-closed, real-count-delta-confirmed proposal record
  in the internal coverage ledger — Clone Ramp, Clone Buffer (+ hard-lock
  recovery), the meat unlock/parent-step/twin planner, and the Clone Prep
  side-task were the final four bounded in this line of work. This is internal
  accountability only; it does not change what is bought or when.

## What did NOT change

- No strategy, scoring, reserve, buy-amount, or hard-safety default was changed.
- `autoCastAbilities = false`, `autoAscend = false`, and the single narrow
  `autoCastCloneLarvae = true` exception are unchanged.
- `m6DecisionOwnsMainCycle` remains `false`. The legacy planners still own and
  execute the main action cycle.

## Ownership verdict recorded

The investigation into whether M6 (the whole-economy coordinator) should own the
main cycle concluded with **`NO_GO_GLOBAL_EXECUTION_OWNERSHIP` upheld**. The
measured meat-dominance problem is mitigated by the earlier F3/F7/
territory-saturation fixes, and lifting the flag would suppress the working
legacy paths and reproduce the historical no-buy behavior. The full reasoning
and the three conditions that would ever reopen the decision are recorded in
`docs/strategy/GLOBAL_EXECUTION_OWNERSHIP_READINESS_9.4.0.md` ("Final ownership
verdict").

## Player-facing sentence

> No player-visible change: 9.3.6 adds internal, verifiable accountability for
> every purchase the bot already makes, and records that whole-economy execution
> ownership is intentionally not enabled yet.

## Verification

`npm run verify` passes at this version (26 acceptance/parity checks plus the
repo guardrail); `check:version:surfaces` confirms package.json,
package-lock.json, the userscript `@version` header, and the runtime
`AUTOBUYER_VERSION` are all `9.3.6`.
