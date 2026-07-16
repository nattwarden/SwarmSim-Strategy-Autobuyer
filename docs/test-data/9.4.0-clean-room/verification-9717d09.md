# 9.4.0 clean-room honest same-contract product comparison verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `9717d09c702a9757dc6009fcd3bfa98abe3a7cc6`
- implementation tree: `43143ca1530d318859bd24cbcf8f2bdeb7cd6b1b`
- evidence base SHA: `9717d09c702a9757dc6009fcd3bfa98abe3a7cc6`
- remote branch at verification start:
  `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `9717d09c702a9757dc6009fcd3bfa98abe3a7cc6`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/OneDrive/Dokument/SwarmSim-9.4.0-clean-room-verify-9717d09`
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

- `npm ci --ignore-scripts` - exit `0`; installed locked dependencies in the
  detached worktree, with `0` reported vulnerabilities.

Predeclared generator:

- `npm run build` - exit `0`; the only allowlisted generated implementation
  path was `src/SwarmSim-Strategy-Autobuyer.user.js`. The command reported
  that the canonical userscript was already up to date and changed no file.

Pure checks:

- `git rev-parse HEAD` - exit `0`, exact implementation SHA confirmed.
- `git show -s --format=%T HEAD` - exit `0`, exact tree confirmed.
- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `npm run verify` - exit `0`; the complete configured suite passed.
- `npm run strategy:audit:default-save:check` - exit `0`; the tracked pinned
  player save imported successfully.
- `git diff --check` - exit `0`.
- `node scripts/check-9.4.0-same-contract-product-pair.js
  --mutate-horizon-gate` - exit `1`, expected. The in-memory mutation removed
  only the exact horizon-id and horizon-seconds comparisons. A 300-second
  House of Mirrors result then beat the aligned 1800-second Territory result,
  so the verifier rejected the mutant.
- final `git status --porcelain=v1` - exit `0`, status count `0`.

`npm run verify` used existing self-cleaning strategy-audit output paths. No
persistent runtime, fixture, verifier, package, configuration, or generated
testbed file remained. This Markdown file is the only verification evidence
committed after the implementation SHA.

## Focused results

The M6 comparison contract now includes exact `horizonId` and
`horizonSeconds` in addition to metric id, unit, and basis. A result is
rankable only when all five fields are complete and exactly equal. A mismatch
is observable, becomes `UNRANKED`, and cannot grant execution authority.

The fixed synthetic negative control selected:

- target `Expansion`;
- metric `expansion-eta`;
- unit `seconds`;
- basis `milestone-eta-seconds`;
- horizon `medium` / `1800` seconds.

The aligned Territory purchase remained `MATCHED` / `COMPARABLE`. The
otherwise stronger House of Mirrors branch honestly retained its own
`ability-short` / `300`-second provenance and became `MISMATCH` / `UNRANKED`.
After the in-memory horizon-gate mutation, that same mismatched branch became
rankable and won, proving that the new check detects the shortcut it closes.

The production-formula acceptance used the repository's SHA-256-pinned player
save in a disposable browser context. Real runtime units were seeded through
the game's `_setCount` boundary; the exact V-tier aliases had to resolve to
existing runtime objects. No fabricated army unit or placeholder purchase was
accepted as product evidence.

On that production state, both candidates matched the exact same contract:

1. the bounded reversible Territory `swarmling` purchase was `MATCHED` /
   `COMPARABLE` at `medium` / `1800` seconds;
2. source-verified House of Mirrors was `ADVISOR_ONLY`, `MATCHED` /
   `COMPARABLE`, and used the same direct territory-bank/rate Expansion ETA
   baseline as WAIT and the Territory scorer;
3. mixed `source-verified` action provenance and `runtime-derived` WAIT
   provenance conservatively resolved to the weaker `runtime-derived` status
   instead of the false `mismatch` status;
4. Territory won this state and retained bounded execution authority;
5. House of Mirrors received no execution key or ability-cast authority.

The deterministic scenario harness also clears its prior proposal, whole-
economy decision, six-domain result, and execution-plan state before each
cycle and rebuilds the current production proposal snapshot. The acceptance
therefore cannot borrow a proposal or coordinator result from the page's
preceding live cycle.

## Preserved invariants and scope

The complete suite passed canonical assembly, repository guardrails,
Laboratory, Council UI, M2 through M9, live purchase acceptance, structured
stall breaking, Territory saturation, Clone Ramp, Twin Prep,
House-of-Mirrors readiness, shared-target identity, authorization identity,
stale authorization, the four-value amount contract, missing-metric handling,
target alignment, metric-basis integrity, M2 double-count isolation, and the
new same-contract product-pair acceptance.

Production-path acceptance remained green:

- live legacy Energy execution still bought Lepidoptera from `0` to `5` with
  no M6 authority;
- live M6 Scenario B still executed real `swarmling x3` with one main action,
  matching selected amount, count delta, and fingerprint;
- the ordinary legacy path still bought a real Meat unit while M6 authority
  was false.

This slice changes no bounded amount, canonical proposal identity,
authorization identity, stale gate, purchase command, action budget,
protected-resource threshold, auto-cast default, Ascension authority, or hard
safety default. It adds no synthetic common-value conversion. The standalone
M4 advisor keeps its existing 300-second horizon; only its M6 capture uses the
selected M6 horizon. `m6DecisionOwnsMainCycle` remains `false`.

## Forensic verdict

Phase 3 slice 4 is valid. The former comparison contract was incomplete
because it omitted horizon identity, and ability calibration overwrote branch
horizon provenance with the caller's context. Both shortcuts are closed and
covered by a mutation that reproduces the wrong winner when removed.

The review also found and closed three adjacent truthfulness gaps required for
the real product pair: stale Laboratory proposal/M6 state, inconsistent WAIT
versus House of Mirrors ETA baselines, and false rejection of mixed but
individually rankable formula provenance.

Global execution ownership remains `NO_GO`. One honest Territory-versus-
ability pair is evidence that the comparison boundary can work; it is not
complete proposal coverage, a globally validated heterogeneous conversion,
or proof that WAIT may own a whole cycle. Critical upgrades, Clone paths,
generic Smart purchases, post-Nexus Energy, and reversible fallback under an
advisor-only winner remain outside sole M6 ownership.
