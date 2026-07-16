# 9.4.0 clean-room proposal and authorization identity verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `cf7d0cfc88759e14069c569f12a1830fe02d53c9`
- implementation tree: `5a6f0ac5e51904db76e802e1f26f136fa517f2be`
- runtime implementation parent: `21111d15d3e833673a8d6c6d7201ed20d402ae18`
- branch at verification start: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start: `cf7d0cfc88759e14069c569f12a1830fe02d53c9`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean

## Environment and game build

- captured at: `2026-07-16T09:08:34.942Z`
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
- `npm run check:9.4.0:canonical-authorization-identity` - exit `0`.
- `npm run strategy:audit:default-save:check` - exit `0`.
- `KBC_MUTATE_CANONICAL_ID_AMOUNT=1 npm run check:9.4.0:canonical-authorization-identity`
  - exit `1`, expected;
  - mutated canonical ID became `territory::stinger::unit::v::5` and failed.
- `KBC_MUTATE_AUTHORIZATION_CONTEXT=1 npm run check:9.4.0:canonical-authorization-identity`
  - exit `1`, expected;
  - mutated authorization ID collapsed to the canonical ID and failed.
- `git diff --check` - exit `0`.

Predeclared evidence generators:

- `npm run build` - exit `0`; allowlist was the canonical userscript and no
  file changed because it was already current.
- `npm run verify` - exit `0`; allowlist was the existing self-cleaned
  strategy-audit testbed output paths and no persistent file remained.

## Discarded attempts

No acceptance claim uses either discarded run:

1. The first detached run at parent SHA `21111d1...` showed that the canonical
   mutation needle was LF-specific and therefore did not mutate a CRLF
   checkout. The runtime/full suite passed, but the mutation failure was not
   the intended assertion. The verifier was fixed to normalize only its
   in-memory source input, committed as `cf7d0cf...`, and a new worktree was
   created.
2. The first full run at `cf7d0cf...` reached Twin Prep and received external
   `net::ERR_NETWORK_CHANGED` while opening swarmsim.com. The worktree stayed
   clean and a subsequent complete sequence was restarted from the beginning.

## Focused contract result

- canonical proposal ID: `territory::stinger::unit::v`
- changing requested amount `5 -> 6`: canonical ID unchanged
- changing display candidate/target text: canonical ID unchanged
- changing execution variant `v -> base`: canonical ID changed
- authorization ID:
  `territory%3A%3Astinger%3A%3Aunit%3A%3Av@@cycle-41@@snapshot-41@@Expansion`
- changing an amount-only observation: authorization ID unchanged
- changing decision cycle, snapshot or active target: authorization ID changed
- M2 decision, M6 bounded candidate and M6 execution-decision observability
  carried the expected IDs
- existing plan identity status remained `matched`
- existing pre-revalidation eligibility remained `true`
- authorization enforcement remained explicitly `observability-only`

## Preserved invariants and scope

The configured suite passed canonical assembly, guardrails, M2, M3, M4, M5,
M6, M7, M8, M9, live purchase, F3, Territory saturation, Clone Ramp, Twin
Prep, 9.3.5 amount/House-of-Mirrors readiness and the prior shared-target
identity check.

This slice adds a stable action-type identity derived only from execution key,
internal execution ID, execution kind and variant. It separately adds a
decision authorization identity derived from canonical proposal ID, decision
cycle, snapshot and active target. Both appear in proposals, M2/M6 plan data,
Inspector, Council state and the public diagnostic API. Existing fingerprints,
candidate matching, revalidation, amount selection, execution functions,
safety thresholds and legacy execution ownership are unchanged. The
authorization is not yet a gate; stale-authorization enforcement and the
four-value amount contract remain separate later slices.
