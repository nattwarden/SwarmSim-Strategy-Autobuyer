# Repository Health Audit Review Note (Fable)

Status: timestamped read-only audit evidence for one exact commit; this document
adds no runtime behavior and is NOT automatically current runtime truth for any
later commit.
Date: 2026-07-19
Auditor: Claude (Fable 5), read-only repository-health audit (dead code, build,
CI, verification platform, documentation weight)
Audited commit: `fcfe1432e47e7aec8bfef7ac47a874138d91d057`
(`codex/9.4.0-clean-room`, equal to post-9.4.0-release state)
Runtime version at audited commit: `9.4.0`
Working tree: clean at audit time

Scope difference from `REPOSITORY_AUDIT_REVIEW_2026-07-14.md`: that audit
(F1-F7) examined strategy/decision-layer correctness at 9.1.0. This audit
examines repository health - dead code, build/CI integrity, verification
platform hermeticity, and artifact weight - at 9.4.0. Findings are numbered
R1-R9 to avoid collision with F1-F7.

Method note: dead-code detection used word-boundary occurrence counting over
`dev-src/runtime-sections/runtime-main.js` plus a cross-check that no
`scripts/*.js` verifier references the candidate names. Purely textual; a
function invoked only through dynamically computed property names would be a
false positive, but none of the flagged names shows such a pattern.

Evidence confidence labels:

- `VERIFIED` — read directly in code/config/scan output at the audited SHA.
- `LIKELY` — strongly supported by code reading, but not observed in a live run.

## Executive summary

- The live runtime is healthy: only 12 of 620 top-level functions (~358 of
  26 224 lines, ~1.4%) are dead, and all 120 `DEFAULT_CONFIG` keys are read
  somewhere. Build parity between `src/` and `dev-src/` is exact (R1).
- The GitHub Actions workflow cannot pass as written: it runs `npm run verify`
  without `npm ci` or Playwright browser installation (R2).
- The verify chain is non-hermetic and slow: ~30 verifier scripts each launch
  a fresh headless Chromium and navigate to the live `https://www.swarmsim.com/`
  site, so third-party availability gates formal verification (R3).
- `scripts/` carries ~24 retired or unreferenced files from the per-version
  check pattern that `AGENTS.md` explicitly retired; `package.json` carries
  ~110 script entries, ~25 of them for retired checks (R4).
- The `dev-src/` modularization scaffolding (guards/, overseer/, contracts/,
  adapter files) is not wired into the build and is imported by nothing; the
  build assembles from `runtime-main.js` alone (R5).
- Remediation is planned as the bounded "Repository health hardening" track in
  `BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` (work packages RH-1 .. RH-6).

## R1 - Dead code in the runtime (small, enumerable) - VERIFIED

12 of 620 top-level functions in `dev-src/runtime-sections/runtime-main.js`
have no reference beyond their own definition, in the runtime or in any
verifier script (~358 lines total):

| Function | Lines | Location (at this SHA) |
|---|---|---|
| `strategyInspectorRowsHtml` | 279 | ~3898 (orphaned older inspector renderer) |
| `addItemLaneCandidate` | 20 | ~2043 |
| `laboratoryValidateActionDefinition` | 20 | ~11088 |
| `unitCountByNameLike` | 12 | ~15908 |
| `getTerritoryPrepBuyNum` | 10 | ~16668 |
| `getNextNexusEnergyCost` | 5 | ~13537 |
| `isStrategicActionUnit`, `canBypassPaybackForStrategicAction`, `strategicActionPaybackBypassReason` | 3 each | ~18043-18051 |
| `pickSmartUnitCandidate` | 3 | ~17450 |
| `scenarioCountOverride`, `scenarioHarnessNoOp` | small | scenario harness |

Counter-evidence of overall health: every one of the 120 `DEFAULT_CONFIG` keys
is read at least once, and `src/SwarmSim-Strategy-Autobuyer.user.js` is
byte-identical to metadata + `runtime-main.js` (diff-verified).

## R2 - CI workflow cannot pass as written - VERIFIED (config), LIKELY (failure mode)

`.github/workflows/verify.yml` checks out, sets up Node 20, and runs
`npm run verify` directly - no `npm ci`, no `npx playwright install`. Many
verify-chain scripts `require("playwright")` at module top level (e.g.
`check-book00-m6-six-domain-coordinator.js` line 3), so the chain should fail
with `MODULE_NOT_FOUND` in Actions. Even with the dependency installed,
Chromium browsers are not provisioned.

## R3 - Verify chain is non-hermetic and serial - VERIFIED

- 32 scripts call `chromium.launch(...)`; ~30 navigate to the live
  `https://www.swarmsim.com/` before injecting the userscript via
  `addScriptTag`. Formal verification therefore depends on a third-party
  site being up and unchanged.
- The harness pattern (launch → goto → addScriptTag → waitForFunction) is
  copy-pasted per script; each check pays a full browser launch and live page
  load, and `npm run verify` chains ~40 sequential `npm run` invocations.
- The game is open source and a base commit is already pinned in the runtime
  (`LABORATORY_BASE_GAME_SOURCE_COMMIT` = `swarmsim/swarm@06b4f404...`), so a
  locally served pinned build is feasible without weakening parity claims.

## R4 - Script and package.json sprawl - VERIFIED

- 92 files in `scripts/`; 5 are referenced by nothing (package.json, other
  scripts, CI): `check-4.0.0-version-surfaces.js`,
  `check-5.0.0-version-surfaces.js`, `check-8.0.0-version-surfaces.js`,
  `verify-0.12.0-laboratory-browser.js`, `verify-0.12.1-laboratory-live.js`.
- 14 per-version `check-X.Y.Z-version-surfaces.js` files exist although
  `AGENTS.md` retired the pattern in favor of `check-version-surfaces.js`;
  10 are still wired as npm scripts.
- 5 near-identical `run-0.11.x-deterministic-scenarios.js` runners plus their
  per-version check scripts remain wired.
- `package.json` holds ~110 script entries; roughly a quarter serve retired
  versioned checks, which buries the ~15 entries an agent actually needs.

## R5 - Modularization scaffolding is dead in practice - VERIFIED

`dev-src/guards/*.js` (5 files), `dev-src/overseer/index.js`,
`dev-src/contracts/lane-proposal.js`, and the three
`dev-src/runtime-sections/adapter-*.js` files (~295 lines total) are imported
by nothing and are not in `scripts/canonical-build.config.json` (whose `parts`
array contains only metadata + `runtime-main.js`). The build system already
supports multiple file parts, so the scaffolding's promise is implementable -
but as shipped it misrepresents the architecture.

## R6 - Monolith internal structure - VERIFIED

`runtime-main.js` is one 26 224-line IIFE. Largest top-level functions:
`createPanel` 1 821 lines, `runUnlockPlanner` 1 203, `bindPanel` 726,
`smartRunOnce` 664, `buildStrategyInspector` 591. Rough subsystem line shares:
UI panels/shell ~3 250, Council ~1 630, Laboratory ~2 660, scenario harness
~960, six-domain/whole-economy ~940. The natural first build-`parts` split is
the UI layer, matching `docs/process/MODULARIZATION_PLAN.md`.

## R7 - Formatting-coupled source assertions - VERIFIED

Multiple verifiers assert exact source substrings (e.g.
`'captureSixDomainDecisionSnapshot(game, strategyContext = {})'`), and the
guardrail requires a literal `scriptVersion: "<version>"` string. Deliberate
as tamper-evidence, but it makes pure formatting refactors break verify with
no behavior change. Any refactor work package must budget for updating these
assertions in the same narrow change (already acknowledged in `AGENTS.md`).

## R8 - Repository weight - VERIFIED

`docs/test-data/` is ~38 MB across 678 files, of which
`docs/test-data/strategy-audit-1/` is ~37 MB; pack size ~40 MB. Evidence-in-Git
is repository policy, but old sweep matrices dominate clone cost and violate
the runbook's own rule 8 ("do not retain routine raw matrices in Git").
Retention decision belongs to the user (RH-6).

## R9 - Stale runbook pointer - VERIFIED

The runbook's "Immediate next action" still instructed executing the active M8
replay, although M8 closed on 2026-07-14. Corrected in the same maintenance
pass that recorded this audit (pointer now defers to `BOOK00_CURRENT_STATUS.md`).

## Remediation

The full remediation plan, work-package contracts, parallelization waves, and
stop conditions live in the "Repository health hardening track (RH)" section of
`BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`. This note is evidence, not a plan.
