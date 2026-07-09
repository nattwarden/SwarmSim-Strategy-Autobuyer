# History Summary

This file replaces old root-level `AI-...-indexed.md` snapshots and the
duplicated `releases/` folder.

Active instructions remain:

```text
AGENTS.md
AI.md
docs/SWARMSIM_GAME_MODEL.md
```

Detailed release notes remain in:

```text
docs/release-notes/
```

## Version notes

- 0.7.9: Target-aware Upgrade / Twin Planner.
- 0.8.0: Unlock Planner, Clone Buffer Planner, Ability Prep Planner
  advisor-only.
- 0.8.1: follow-up planner hardening documented in release notes.
- 0.8.2: follow-up planner hardening documented in release notes.
- 0.8.3: follow-up planner hardening documented in release notes.
- 0.8.4: follow-up planner hardening documented in release notes.
- 0.8.5: follow-up planner hardening documented in release notes.
- 0.8.7: Twin Threshold Reachability Fix plus Twin Upgrade Opportunity Cost
  Bypass on top of the 0.8.5 main baseline.
- 0.8.8: Multi-Lane Coordinator / Territory Starvation Fix baseline.
- 0.8.9: Methodical Lane Follow-through / Visible Progress Fix.
- 0.8.10: Territory Scanner + Guard Bar / Overseer UI.
- 0.8.11: Twin Prep Priority / Parent-Step Throughput Fix.
- 0.8.12: Parent-Step Refill / Action Budget Fix.
- 0.8.13: Twin Prep Meaningful Gate Regression Fix.

## Documentation posture note

2026-07-09: active agent/docs language was reframed from “conservative bot” to
“methodical optimizer/advisor with hard safety defaults”. The change is a
mental-model and documentation shift, not a gameplay logic change. Hard safety
boundaries remain separate from ordinary progression optimization.

## Cleanup decision

Removed from the working tree:

- old root-level `AI-...-indexed.md` snapshots
- duplicated `releases/` release-note copies
- old release `.user.js` and `.txt` script mirrors
- stale bootstrap validation checksum files
- stale bootstrap `git-push-commands.md`

Reason:

- `AI.md` and `AGENTS.md` are the active agent entrypoints.
- `docs/release-notes/` already holds detailed release history.
- executable source must exist only at
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
