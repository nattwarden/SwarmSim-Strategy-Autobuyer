# SwarmSim Strategy Autobuyer 0.8.1 — release notes

Date: 2026-07-09

## Summary

0.8.1 is a conservative hotfix on top of 0.8.0.

It does not add a new strategy and it does not change the safe defaults. It fixes two planner decision bugs observed in live logs:

- Clone Buffer POST_CLONE_LOCK now resolves against the actual Clone Larvae bank/debt when available, instead of acting like full cap is the target.
- Unlock Planner now evaluates the current action step as the candidate, instead of the final target step, so the candidate/reason fields match the active unlock decision.

## What changed

### Clone Buffer hotfix

The clone buffer planner now distinguishes between:

- actual clone bank/debt on POST_CLONE_LOCK,
- bounded fallback when the bank is not available,
- regular cap reference for BUILDUP and MATURE.

This keeps the planner conservative while preventing the post-clone target from inflating to full cap.

Additional observability fields were added for the Strategy Inspector and exports:

- `cloneBufferCap`
- `cloneBufferBank`
- `cloneBufferTargetSource`
- `cloneBufferRecoveryEta`
- `cloneBufferHardLockActive`

### Unlock Planner hotfix

The unlock planner now reports the active action unit as the candidate when it is the true unlock step on the meat-goal path.

This corrects the candidate/target split in the planner diagnostics and preserves the existing conservative reserve and protected-resource guards.

## Safety

Still preserved:

- no default ability auto-cast
- no default auto-ascend
- no default Nightbug/Bat auto-buy
- no Smart meat-chain buyMax behavior

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source is `src/SwarmSim-Strategy-Autobuyer.user.js` at the tagged commit.
Release history is tracked via Git commits/tags.