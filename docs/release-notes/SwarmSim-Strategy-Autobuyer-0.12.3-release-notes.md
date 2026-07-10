# SwarmSim Strategy Autobuyer 0.12.3 Release Notes

## Summary

0.12.3 is a narrow Laboratory patch that fixes live House of Mirrors effective-count capture and removes the verifier blind spot that previously rewrote army data after capture.

## What changed

- Added a shared HoM affected-unit count resolver that prioritizes authoritative clonearmy effect targets and exports runtime identity/count diagnostics.
- Rebuilt Laboratory army affected capture to preserve canonical eleven HoM base ids while exposing unresolved/ambiguous count states as null instead of silent verified zeros.
- Added per-row parity diagnostics between effect target and independent canonical runtime lookup.
- Normalized ability state for Clone Larvae and House of Mirrors so blocked runs propagate explicit INSUFFICIENT_ENERGY code/text and legal runs clear stale unavailable reasons.
- Added a dedicated 0.12.3 verifier command and evidence paths that require acceptance from unmodified captureLiveSnapshot output.
- Added exported effective-count diagnostics fixture data under docs/test-data/0.12.3-laboratory.

## What did not change

- Normal strategy behavior remains unchanged.
- Council behavior and planner ranking remain unchanged.
- Safety thresholds and reserve math remain unchanged.
- Laboratory remains development-gated, live-gated, manually triggered, read-only, and simulation-only.
- Ability auto-cast defaults remain disabled.
- Ascension auto mode remains disabled.
