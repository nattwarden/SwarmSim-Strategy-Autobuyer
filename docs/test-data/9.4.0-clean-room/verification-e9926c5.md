# 9.4.0 clean-room target-alignment verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `e9926c57c0bc7b21bb4fb9be6a20c33ed4c9d6e5`
- implementation tree: `31007bc08859bd9f708c71904095077a5897b24f`
- remote branch at verification start:
  `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `e9926c57c0bc7b21bb4fb9be6a20c33ed4c9d6e5`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean, status count `0`

## Environment

- Node.js: `v24.14.0`
- npm: `11.9.0`
- operating system: `Windows 10.0.26200 x64`
- Playwright: `1.61.1`
- live game URL used by browser acceptance:
  `https://www.swarmsim.com/`

## Command classification and results

Setup, not a product check:

- `npm ci` - exit `0`; installed locked dependencies in the detached
  worktree.

Predeclared generator:

- `npm run build` - exit `0`; the only allowed generated implementation path
  was `src/SwarmSim-Strategy-Autobuyer.user.js`. The command reported that
  the canonical userscript was already up to date and changed no file.

Pure checks:

- `git rev-parse HEAD` - exit `0`, exact implementation SHA confirmed.
- `git rev-parse 'HEAD^{tree}'` - exit `0`, exact tree confirmed.
- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `git diff --check` - exit `0` before and after the full suite.
- `npm run verify` - exit `0`; the complete configured suite passed.
- `node scripts/check-9.4.0-target-alignment.js --mutate-target-gate` - exit
  `1`, expected. The in-memory mutation removed the target-alignment gate;
  off-target Meat then became `COMPARABLE`, beat the aligned Engine proposal,
  and received M6 execution authority, so the verifier rejected the mutant.
- final `git status --porcelain=v1` - exit `0`, status count `0`.

`npm run verify` used existing self-cleaning strategy-audit output paths. No
persistent runtime, fixture, verifier, package, configuration, or generated
testbed file remained. This Markdown file is the only generated verification
evidence committed after the implementation SHA.

## Focused results

The runtime now carries an explicit `metricTarget` from each supported
purchase proposal into `whole-economy-outcome.v2`. The M6 purchase adapter
records proposal target, metric target, active target, and alignment status.
A numeric shared value is rankable only when the metric target exactly matches
the cycle's active target; missing or mismatched identities fail closed as
`UNRANKED`.

The focused verifier proved three controls from one immutable snapshot shape:

1. With active target `Expansion`, a larger Meat ETA value for `Lesser Hive
   Mind` remained the M2 winner but was `MISMATCH`/`UNRANKED` in M6; aligned
   Engine `Expansion` won M6 and retained bounded authority.
2. The off-target Meat proposal by itself produced no M6 winner and no
   execution authority.
3. The aligned Engine proposal by itself remained `COMPARABLE` and retained
   execution authority.

The corrected production acceptance cases also passed:

- the former M2 cross-target state had active Nexus goal and concrete Engine,
  Meat, and Territory BUY alternatives, but no aligned M6 winner or authority;
- the separate aligned `sa1-02` control still executed the exact Expansion
  upgrade with a matching canonical identity;
- post-Nexus Lepidoptera received no off-target M6 authority, while the
  isolated legacy Energy path made exactly one bounded main action and changed
  real Moth count from `0` to `5` with reset verified and no state leakage;
- live M6 Scenario B selected the real production Territory/Expansion focus,
  executed `swarmling` with selected amount `3`, observed count delta `3`, and
  matched the selected fingerprint. No active-target field was overridden.

## Preserved invariants and scope

The complete configured suite passed canonical assembly, repository
guardrails, Laboratory, Council UI, M2 through M9, live purchase acceptance,
structured stall breaking, Territory saturation, Clone Ramp, Twin Prep,
House-of-Mirrors readiness, shared-target identity, authorization identity,
stale authorization, the four-value amount contract, missing-metric handling,
and target alignment.

This slice changes no ranking weights, tie-break rules, bounded amounts,
authorization identity, stale gate, action budget, execution key, protected
resource threshold, ability or Ascension authority, or hard safety default.
It does not select post-Nexus Energy as a new active target. Unaligned safe
actions continue through their existing legacy paths because
`m6DecisionOwnsMainCycle` remains `false`.

## Forensic verdict

The target-alignment correction is valid and the acceptance suite detects its
removal. It closes the laboratory shortcut in which an outcome borrowed the
global active target while its metric actually described another target.

Global execution ownership remains `NO_GO`. This slice deliberately does not
solve the separate basis problem: ETA seconds, local completion deltas, and
post-Nexus Energy production-gain percentages are still not one validated
common unit. M6 also still lacks complete proposal and ownership coverage for
critical upgrades, Clone paths, generic Smart purchases, and other legacy
actions. Those gates must be closed in later narrow slices before WAIT or M6
can own the entire main cycle.
