# 9.4.0 clean-room four-value amount-contract verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `46961aed6c9e3d728fd1587df16dc6e83cd54824`
- implementation tree: `8b410d9de72df77f5b0bda7f4f6fcf6104ee3d87`
- branch at verification start: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `46961aed6c9e3d728fd1587df16dc6e83cd54824`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean, status count `0`

## Environment and game build

- captured at: `2026-07-16T09:42:36.623Z`
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
- `KBC_MUTATE_AMOUNT_CONTRACT_EQUALITY=1 npm run check:9.4.0:four-value-amount-contract`
  - exit `1`, expected;
  - the mutated contract accepted command amount `100` under authorization
    for `50`, and the verifier rejected it.
- `KBC_MUTATE_AMOUNT_CONFIRMATION=1 npm run check:9.4.0:four-value-amount-contract`
  - exit `1`, expected;
  - the mutated confirmation path reported observed count delta `52` as the
    purchased amount instead of the authorized command amount `50`, and the
    verifier rejected it.
- `git diff --check` - exit `0`.
- final `git status --porcelain=v1` - exit `0`, status count `0`.

Predeclared evidence generators:

- `npm run build` - exit `0`; allowlist was the canonical userscript and no
  file changed because it was already current.
- `npm run verify` may use existing self-cleaned strategy-audit testbed output
  paths; no persistent file remained.

## Focused contract result

The runtime now keeps four exact Decimal-string observations separate:

- `authorizedRequestedAmount`: the fresh revalidated bounded amount allowed
  at the purchase boundary;
- `commandRequestedAmount`: the amount actually passed to the game command;
- `confirmedPurchasedAmount`: the strongest amount the available evidence can
  confirm;
- `observedTotalCountDelta`: raw `count()` after-minus-before evidence, which
  can include passive unit production.

The production path currently applies no clamp. Authorized and command amounts
must therefore be identical or the command is refused with
`AMOUNT_CONTRACT_VIOLATION`. For a discrete upgrade, a successful positive
count delta confirms the purchased amount. For a producing unit, the command
amount is confirmed only when command success is corroborated by strict cost
resource consumption. Otherwise the honest confirmed amount is `0` with
`unconfirmed-no-cost-consumption`; the raw positive count delta remains visible
and is not relabeled as a purchase.

The live M6 acceptance scenario proved that the integrated path exposes a
satisfied contract with equal selected, authorized and command amounts, a
positive observed count delta, an explicit confirmation basis, one action and
the same selected/executed fingerprint.

## Discarded preliminary findings

No discarded run contributes to the exact-SHA acceptance claim. Before the
implementation commit, focused regression checks found and corrected two
integration assumptions:

1. Using `confirmedPurchasedAmount` in the legacy execution fingerprint made a
   synthetic M2 purchase look mismatched when the harness exposed no cost
   consumption. Fingerprint matching now uses the actual command amount after
   the equality contract has passed; confirmation remains separate evidence.
2. Requiring every live unit purchase to have a nonzero confirmed amount would
   fabricate certainty when the adapter cannot observe a strict cost decrease.
   Live acceptance instead requires an explicit honest confirmation basis and
   permits `0` when purchase quantity is unconfirmed.

## Preserved invariants and scope

The configured suite passed canonical assembly, guardrails, M2, M3, M4, M5,
M6, M7, M8, M9, live purchase, F3, Territory saturation, Clone Ramp, Twin
Prep, 9.3.5 amount/House-of-Mirrors readiness, shared-target identity,
canonical/authorization identity and stale authorization.

This slice does not alter proposal ranking, amount calculation, revalidation
eligibility, action budgets, supported execution keys, safety thresholds,
advisor defaults or legacy execution ownership. It adds a fail-closed equality
contract at the existing bounded purchase boundary and honest observability for
the command and its evidence. No clamp policy, new strategy, global execution
owner or plan generator was introduced.
