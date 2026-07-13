# Strategy Audit Testbed Review Note

Status: resolved after config-only reset fingerprint fix
Date: 2026-07-12

## Decision

The reset/leakage proof now compares the staged config snapshot against the restored config snapshot.
Volatile live resource counts are intentionally excluded from the leakage fingerprint because the canary runs against a live production page and those values can drift during execution.

## Root cause

The current implementation marks `stateLeakageDetected` from `restoreStatus.ok` only.
That means a restore can succeed while the runner still fails to prove that the staged state returned to a normalized pre-reset baseline.

The digest used for the hash comparison also includes volatile runtime bookkeeping such as run history length and inspector timestamp, so a naive hash compare would be noisy unless those fields are normalized out first.

## Exact file scope

- `scripts/strategy-audit-testbed-core.js`

## Contract update

- reset/leakage proof is now demonstrated through a stable config-only fingerprint
- hard-failure semantics for leakage remain enabled
- live resource drift no longer creates false leakage failures

## Required fix

The implemented fix keeps the fingerprint narrow and stable:

- config fields staged by the canary are fingerprinted before and after restore
- live resource counts remain visible in the result output, but they are not part of leakage detection
- mismatches still throw a hard failure and stop the scenario

## Tests that must pass after the fix

- `npm run strategy:audit:fast`
- `npm run strategy:audit:watch -- --auto-control-test true --keep-open false --leave-open-on-failure true --trace false --screenshots false`
- `npm run strategy:audit:watch -- --auto-control-test true --abort-via-stop true --keep-open false --leave-open-on-failure true --trace false --screenshots false`
- `npm run strategy:audit:live`
- `node scripts/validate-repo-guardrails.js`
- `npm run build`
- `npm run verify`
- `git diff --check`

## Forbidden changes

- no strategy/ranking changes
- no safety-default changes
- no userscript version bump
- no planner answer injection
- no weakening of the hard-failure rule for leakage

## Commit and report requirement

- keep the implementation change narrow and single-purpose
- commit the fix separately from any evidence refresh
- record the exact implementation SHA used for validation
- leakage proof was revalidated on the final SHA with fast, watch, live, guardrails, build, verify, and diff checks