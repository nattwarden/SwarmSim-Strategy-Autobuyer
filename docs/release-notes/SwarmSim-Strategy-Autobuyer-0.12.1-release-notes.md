# SwarmSim Strategy Autobuyer 0.12.1 Release Notes

## Summary

0.12.1 adds the Laboratory live, read-only capture path alongside the existing Phase 1 deterministic snapshot and experiment flow.

## What changed

- Added a separate live Laboratory gate: `kbcSwarmBotLaboratoryLiveEnabled_v1`.
- Added read-only live snapshot capture with a before/after non-mutation proof.
- Added live snapshot exports in JSON and Markdown.
- Added a compact dev-panel live control block for capture and download.
- Added browser verification for live capture evidence.

## What did not change

- Normal autobuyer behavior remains unchanged.
- The existing deterministic Phase 1 Laboratory flow remains gated and intact.
- Safety defaults were not relaxed.
