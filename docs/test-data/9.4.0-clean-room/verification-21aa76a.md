# 9.4.0 clean-room missing-metric verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `21aa76ab03f5b75b2da32ecdc2db7aa7ee4d6b6a`
- implementation tree: `cdc0cff55f3212476ccab1d03438077e78296f84`
- branch at verification start: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `21aa76ab03f5b75b2da32ecdc2db7aa7ee4d6b6a`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean, status count `0`

## Environment and game build

- captured at: `2026-07-16T10:19:54.079Z`
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
- `KBC_MUTATE_MISSING_METRIC_ZERO=1 npm run check:9.4.0:missing-metric-unranked`
  - exit `1`, expected;
  - the mutation restored the unsafe `Number(null) === 0` fallback and the
    verifier rejected it because missing metrics became ranked.
- `git diff --check` - exit `0`.
- final `git status --porcelain=v1` - exit `0`, status count `0`.

Predeclared generators and allowlists:

- `npm run build` - exit `0`; the only allowed generated implementation path
  was `src/SwarmSim-Strategy-Autobuyer.user.js`, and no file changed because
  canonical assembly was already current.
- `npm run verify` may use existing self-cleaned strategy-audit testbed output
  paths; no persistent file remained.
- this Markdown file is the only generated verification evidence committed
  after the implementation SHA.

## Focused result

The six-domain coordinator now accepts an ETA improvement only when the source
field is an actual finite metric. Missing values represented by `null`,
`undefined`, or an empty string remain `UNRANKED`; they cannot fabricate an M6
winner or execution authority. An explicit numeric zero remains a valid
comparable result, and an explicit positive Territory ETA improvement remains
comparable and eligible for the existing bounded reversible purchase path.

The focused verifier independently proved three controls:

1. Four safe purchase proposals with missing metrics retained the M2 control
   winner but produced no M6 winner, recommendation `UNCERTAIN`, and no
   execution authority.
2. An explicit numeric Territory value of `0` remained `COMPARABLE` and
   preserved existing authority semantics.
3. An explicit Territory value of `120` seconds remained `COMPARABLE` and
   preserved existing authority semantics.

The pinned player-save replay still selected the active shared target `lesser
hive mind`, returned no M6 execution authority, and left all tracked live unit
counts unchanged.

## Preserved invariants and scope

The complete configured suite passed canonical assembly, guardrails,
Laboratory, UI, M2 through M9, live purchase acceptance, F3, Territory
saturation, Clone Ramp, Twin Prep, House-of-Mirrors readiness, shared-target
identity, authorization identity, stale authorization, and the four-value
amount contract.

This slice changes no proposal construction, ranking weight, tie-break rule,
amount, authorization identity, stale gate, action budget, execution key,
safety threshold, advisor default, or legacy execution ownership. It does not
grant global execution ownership and does not make `WAIT` or `UNCERTAIN` own a
whole cycle. Global execution ownership therefore remains `NO_GO` pending
real shared-outcome coverage and explicit ownership of the remaining legacy
paths.
