# 9.4.0 clean-room metric-basis integrity verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `19822e1e0eb2fe364d6393d9bfb0f19d1f8bd66c`
- implementation tree: `4c86f1f21fa71dde2b41f5cc6bcba7b2a81edff9`
- evidence base SHA: `19822e1e0eb2fe364d6393d9bfb0f19d1f8bd66c`
- remote branch at verification start:
  `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `19822e1e0eb2fe364d6393d9bfb0f19d1f8bd66c`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean, status count `0`

## Environment

- Node.js: `v24.14.0`
- npm: `11.9.0`
- operating system: Windows
- Playwright: `1.61.1`
- live game URL used by browser acceptance:
  `https://www.swarmsim.com/`

## Command classification and results

Setup, not a product check:

- `npm ci` - exit `0`; installed locked dependencies in the detached
  worktree, with `0` reported vulnerabilities.

Predeclared generator:

- `npm run build` - exit `0`; the only allowlisted generated implementation
  path was `src/SwarmSim-Strategy-Autobuyer.user.js`. The command reported
  that the canonical userscript was already up to date and changed no file.

Pure checks:

- `git rev-parse HEAD` - exit `0`, exact implementation SHA confirmed.
- `git rev-parse 'HEAD^{tree}'` - exit `0`, exact tree confirmed.
- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `npm run verify` - exit `0`; the complete configured suite passed.
- `node scripts/check-9.4.0-metric-basis-integrity.js
  --mutate-basis-gate` - exit `1`, expected. The in-memory mutation removed
  the selected metric-contract gate; Engine completion points then beat
  Territory ETA seconds and incorrectly received M6 execution authority, so
  the verifier rejected the mutant.
- `node scripts/check-9.4.0-m2-no-double-count.js
  --mutate-exclusivity-gate` - exit `1`, expected. The in-memory mutation
  removed progress-metric exclusivity, and the verifier immediately rejected
  the completion row because it no longer isolated the one declared progress
  delta.
- `node scripts/check-9.4.0-target-alignment.js --mutate-target-gate` - exit
  `1`, expected. The in-memory mutation again let off-target Meat become
  comparable and receive M6 execution authority.
- final `git diff --check` - exit `0`.
- final `git status --porcelain=v1 --untracked-files=no` - exit `0`, status
  count `0`.

`npm run verify` used existing self-cleaning strategy-audit output paths. No
persistent runtime, fixture, verifier, package, configuration, or generated
testbed file remained. This Markdown file is the only verification evidence
committed after the implementation SHA.

## Focused results

The cycle now selects one complete comparison contract consisting of exact
metric id, unit, and basis. Every M6 outcome must match all three fields after
already passing the active-target gate. Missing or mismatched contracts become
observable as `MISSING` or `MISMATCH`, are changed to `UNRANKED`, and cannot
grant execution authority.

The primary competing case used active target `Expansion` and selected
`expansion-eta` / `seconds` / `milestone-eta-seconds`:

1. Engine's `expansion-completion` / `percent` / progress-delta row remained
   honest source evidence but became `MISMATCH` / `UNRANKED` in M6.
2. Territory's `expansion-eta` / `seconds` / ETA row was `MATCHED` /
   `COMPARABLE`, won M6, and retained bounded reversible authority.
3. Completion-only input produced no M6 winner or authority.
4. ETA-only input retained the expected real M6 authority.
5. A snapshot missing the selected comparison contract failed closed with no
   winner or authority.

The M2 scoring audit also passed. A completion row declaring
`same-unit-milestone-progress-delta` scored the explicit milestone delta once;
ETA proximity, generic progress, and unlock-text bonus were each `0` for that
row. Payback and reserve remain independent economic signals. A normal ETA row
retained its legitimate ETA, progress, and unlock observations.

Production-path acceptance remained green:

- the completion-only Expansion regression received no M6 authority, while
  the proven legacy Engine path still executed the real upgrade;
- live legacy Energy execution bought Lepidoptera from `0` to `5`, with one
  main action, reset verified, and no state leakage;
- live M6 Scenario B selected the production Territory/Expansion contract and
  executed real `swarmling x3` with matching selected amount, count delta, and
  fingerprint;
- the ordinary live legacy path still bought a real Meat unit with M6
  authority false.

## Preserved invariants and scope

The complete suite passed canonical assembly, repository guardrails,
Laboratory, Council UI, M2 through M9, live purchase acceptance, structured
stall breaking, Territory saturation, Clone Ramp, Twin Prep,
House-of-Mirrors readiness, shared-target identity, authorization identity,
stale authorization, the four-value amount contract, missing-metric handling,
target alignment, metric-basis integrity, and M2 double-count isolation.

This slice changes no bounded amount, authorization identity, stale gate,
purchase command, action budget, protected-resource threshold, ability or
Ascension authority, or hard safety default. It adds no new common-value
conversion. Safe outcomes outside the selected target and metric contract
continue through their proven legacy paths because
`m6DecisionOwnsMainCycle` remains `false`.

## Forensic verdict

The latest correction is valid for R5: M6 no longer compares target-aligned
values with different metric identities, units, or bases, and M2 no longer
counts a declared completion delta again as ETA proximity, generic progress,
and unlock text. All three adjacent gates have mutation controls that reproduce
their former authority shortcuts when removed.

Global execution ownership remains `NO_GO`. This slice does not provide honest
same-contract proposals for all executable legacy actions, complete WAIT
coverage, one validated common-value conversion across heterogeneous domains,
or ownership of critical upgrades, Clone paths, generic Smart purchases, and
post-Nexus Energy. The rejected plan generator remains out of scope and is not
rehabilitated by this result.
