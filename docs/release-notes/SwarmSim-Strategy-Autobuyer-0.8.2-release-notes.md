# SwarmSim Strategy Autobuyer 0.8.2 — release notes

Date: 2026-07-09

## Summary

0.8.2 is a conservative hotfix on top of 0.8.1.

It does not add a new strategy and it does not make Smart Mode more aggressive.
Safe defaults are unchanged.

This hotfix addresses a POST_CLONE_LOCK tail-chasing issue where clone buffer could remain hard-locked even when recovery looked complete in logs.

## What changed

### Clone Buffer POST_CLONE_LOCK completion condition

POST_CLONE_LOCK now has an explicit completion check via:

- percent threshold: recovered if clone buffer percent is effectively complete
- relative debt threshold: recovered if debt/target is tiny
- small absolute fallback threshold: recovered if remaining debt is below a small recent chunk bound

When recovery is effectively complete, hard lock is released:

- no forced zero spendable larvae
- no forced cocoon-only behavior for every new larva
- normal meat-chain/unlock/larva-engine progression can continue

### Snapshot target source during post-clone lock

POST_CLONE_LOCK now uses a snapshot-style target source for actual clone bank/debt in lock mode, so the post-clone target does not drift every tick with newly generated larvae.

Target source is exported as:

- `actual clone bank/debt snapshot`

### Export and inspector fields

Added/updated observability fields:

- `cloneBufferRecoveryComplete`
- `cloneBufferCompletionThreshold`
- `cloneBufferTargetSource`
- `cloneBufferHardLockActive`

## Safety

Still preserved:

- no default ability auto-cast
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default auto-ascend
- no default Nightbug/Bat auto-buy
- no Smart meat-chain buyMax behavior

## Validation

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

Canonical install source remains `src/SwarmSim-Strategy-Autobuyer.user.js`.
Release folders remain documentation-only.
