# 9.4.0 clean-room stale-authorization verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `7ce5e72166cc0ed2698ce0ca6f0c2f3cb0d74d61`
- implementation tree: `89bde2dbf3ddd23b9ff52dbbcb4f758cf363257f`
- branch at verification start: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `7ce5e72166cc0ed2698ce0ca6f0c2f3cb0d74d61`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean

## Environment and game build

- captured at: `2026-07-16T09:25:04.291Z`
- Node.js: `v24.14.0`
- operating system: `Windows_NT 10.0.26200 x64`
- Playwright: `1.61.1`
- Chrome: `150.0.7871.116`
- game URL: `https://www.swarmsim.com/#/`
- AngularJS: `1.6.1`
- game script: `scripts/scripts.09dd8c8b.js`, 528156 bytes,
  SHA-256 `aff1b67cb4bbeefa42c5ab47c905943c315bf7e0de4a7af0ede254260c9e6ffa`
- vendor script: `scripts/vendor.b62c7e53.js`, 1726528 bytes,
  SHA-256 `f932b5e04761f61edbf346430650f0021db35bf5846f7906a7e7baea7ffa11cb`

## Command classification and results

Setup, not a product check:

- `npm ci` - exit `0`; installed the locked dependencies in the detached
  worktree.

Pure checks:

- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `npm run verify` - exit `0`; the complete configured suite passed.
- `KBC_MUTATE_STALE_AUTHORIZATION=1 npm run check:9.4.0:stale-authorization`
  - exit `1`, expected;
  - disabling the stale gate let a changed decision cycle retain execution
    authority, and the verifier rejected it.
- `git diff --check` - exit `0`.
- final `git status --porcelain=v1` - exit `0`, empty output.

Predeclared evidence generators:

- `npm run build` - exit `0`; allowlist was the canonical userscript and no
  file changed because it was already current.
- `npm run verify` may use existing self-cleaned strategy-audit testbed output
  paths; no persistent file remained.

## Focused contract result

- authorization enforcement is `pre-purchase-stale-gate`.
- an exact canonical proposal, decision cycle, snapshot and active target
  retained execution authority after the existing purchase revalidation.
- changing the decision cycle failed with `STALE_AUTHORIZATION`.
- changing the snapshot failed with `STALE_AUTHORIZATION`.
- changing the active target failed with `STALE_AUTHORIZATION`.
- omitting the fresh authorization context failed with
  `STALE_AUTHORIZATION`.
- changing the proposal execution variant changed the canonical proposal ID
  and failed with `STALE_AUTHORIZATION`.
- every failed case exposed the original and revalidated authorization IDs and
  retained no execution authority.
- the mutation control proved the new gate, rather than an unrelated identity
  or safety check, caused the stale-cycle rejection.

## Preserved invariants and scope

The configured suite passed canonical assembly, guardrails, M2, M3, M4, M5,
M6, M7, M8, M9, live purchase, F3, Territory saturation, Clone Ramp, Twin
Prep, 9.3.5 amount/House-of-Mirrors readiness, shared-target identity and
canonical/authorization identity.

This slice changes only M6's existing pre-purchase revalidation boundary. It
requires a fresh canonical proposal, decision cycle, snapshot and active target
to reproduce the authorization minted for the plan. Missing or changed context
removes execution authority before purchase. Existing proposal ranking,
fingerprints, selected/requested/revalidated/executed amount semantics,
purchase functions, action budgets, safety thresholds, advisor defaults and
legacy execution ownership are unchanged. No global execution owner was added.
The four-value amount contract remains the next separate slice.
