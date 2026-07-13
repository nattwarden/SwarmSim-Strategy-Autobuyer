# SwarmSim Strategy Autobuyer 7.0.0

## Version policy

Milestone-aligned major versioning continues with BOOK-00 Milestone 7 at `7.0.0`.

## What changed

- Added M7 calibrated shared outcomes using `strategic-outcome-calibration.v1`.
- Energy abilities now adapt through a WAIT-relative calibration path with
  explicit identity, metric, horizon, formula status, raw values, and delta.
- Ascension/Mutagen adapter now uses strict calibration gating and no longer
  converts `breakEvenSeconds` into milestone ETA improvement.
- Added calibrated observability fields to Strategy Inspector, JSON export,
  Markdown export, Council UI state, and read-only API surfaces.
- Added public read-only calibration API under
  `window.kbcSwarmBot.strategicCoordinator.calibration`.
- Added focused M7 acceptance checker and `7.0.0` version-surface checker.

## Safety and scope

- Energy abilities remain advisor-only; no cast execution authority was added.
- Ascension and Mutagen remain advisor-only; no execution authority was added.
- Existing bounded purchase execution keys remain unchanged (`meat`, `engine`,
  `territory`, `energy`) with immediate revalidation requirements.
- Hard safety defaults remain unchanged, including no auto-cast, no auto-
  Ascension, no Nightbug/Bat auto-buy, and Nexus/Energy protections.
- Council UI3 and fixed layout behavior remain preserved (`1180 x 700`,
  `resize: none`, movable, responsive fallback, layout key v2).
