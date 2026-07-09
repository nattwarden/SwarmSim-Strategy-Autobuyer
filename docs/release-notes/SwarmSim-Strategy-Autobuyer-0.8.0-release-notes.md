# SwarmSim Strategy Autobuyer 0.8.0 — release notes

Date: 2026-07-09

## Summary

0.8.0 introduces three conservative planners on top of 0.7.9:

- Unlock Planner
- Clone Buffer Planner
- Ability Prep Planner (advisor-only)

The release focuses on target-path progression and Clone Larvae safety without changing risky defaults.

## Key additions

- Unlock-aware parent-step buying with strict reserve/protected-resource gates.
- Clone buffer mode handling: BUILDUP, POST_CLONE_LOCK, MATURE.
- Global larvae-spending protection using clone buffer spendable larvae.
- Ability prep diagnostics for Clone Larvae and House of Mirrors.
- New Strategy Inspector/export fields for all three planners.

## Safety

Still preserved:

- no default ability auto-cast
- no default auto-ascend
- no default Nightbug/Bat auto-buy
- no Smart meat-chain buyMax behavior

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
node --check releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.user.js
```

0.8.0 release `.txt` and `.user.js` are byte-identical.
