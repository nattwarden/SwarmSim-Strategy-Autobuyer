# SwarmSim Strategy Autobuyer 0.12.4 Release Notes

## Summary

0.12.4 is a narrow testbed and documentation release that fixes Strategy Audit synthetic Army execution and consolidates SA1 findings. No production strategy ranking or safety defaults changed.

## What changed

- Fixed Strategy Audit harness execution for synthetic Army units by intercepting synthetic `commands.buyUnit` calls and applying staged count increments.
- Resolved SA1 ordering-isolation false no-selection signal (`selectedLane=none`) as a harness artifact.
- Added post-fix SA1 evidence showing Territory execution when Meat goal planner is disabled in the audit scenario.
- Updated Strategy Intelligence source-of-truth documents (BOOK-04, BOOK-05, HISTORY, and roadmap) to reflect corrected interpretation.
- Bumped runtime/package version surfaces to `0.12.4`.

## What did not change

- Normal production strategy behavior remains unchanged.
- Lane ranking logic remains unchanged.
- Council behavior remains unchanged.
- Hard safety defaults remain unchanged:
  - `autoCastAbilities` default is still `false`
  - `autoAscend` default is still `false`
  - `energySupportBrokerAllowAutoCast` default is still `false`
  - no default Clone Larvae auto-cast
  - no default House of Mirrors auto-cast

## Evidence

- SA1 ordering-isolation post-fix result:
  - Findings are retained in BOOK-04; raw audit output is temporary.
- Updated findings and claims:
  - `docs/BOOK-04-strategy-intelligence-findings.md`
  - `docs/BOOK-05-community-strategy-claims.md`
  - `docs/process/HISTORY.md`
