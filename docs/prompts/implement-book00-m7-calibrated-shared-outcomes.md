# Copilot work order - BOOK-00 M7 calibrated shared outcomes

Implement Milestone 7 as version `7.0.0` on a dedicated branch/worktree based
on the current clean `origin/main`.

Do not merge or push to `main`. Push only the authorized M7 branch and report
the immutable implementation/evidence provenance.

## 1. Required reading

Read completely, in repository order:

1. `AGENTS.md`
2. `AI.md`
3. `docs/strategy/BOOK00_CURRENT_STATUS.md`
4. `docs/BOOK-00-vision-goals-and-dreams.md`
5. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`
6. `docs/SWARMSIM_GAME_MODEL.md`
7. `scripts/canonical-build.config.json`
8. `docs/process/GIT_VERIFICATION_PROTOCOL.md`
9. `docs/strategy/BOOK00_M7_CALIBRATED_SHARED_OUTCOMES_FOUNDATION.md`
10. `docs/test-data/7.0.0-book00-m7-calibrated-outcomes/m7-calibration-contract-manifest.json`
11. `docs/strategy/BOOK00_M6_SIX_DOMAIN_COORDINATOR_FOUNDATION.md`
12. `docs/strategy/BOOK00_M5_ASCENSION_MUTAGEN_FOUNDATION.md`
13. `docs/release-notes/SwarmSim-Strategy-Autobuyer-6.0.0-release-notes.md`
14. `docs/test-data/6.0.0-book00-m6-six-domain/verification-9da1b23.md`
15. `dev-src/runtime-sections/runtime-main.js`
16. `src/SwarmSim-Strategy-Autobuyer.user.js`
17. focused M2-M6, Laboratory, UI, and version checkers
18. `package.json`

Search by symbol rather than historical line number. Inspect at minimum:

```text
captureSixDomainDecisionSnapshot
adaptAbilityDomainOutcome
adaptAscensionDomainOutcome
evaluateSixDomainStrategicCoordinator
buildSixDomainExecutionPlan
applySixDomainExecutionRevalidation
evaluateEnergyAbilityTimingSnapshot
captureAscensionMutagenSnapshot
evaluateAscensionMutagenSnapshot
laboratoryActionRunForExperiment
buildStrategyInspector
buildCouncilViewModel
councilArtStyle
COUNCIL_LAYOUT_STORAGE_KEY
window.kbcSwarmBot.strategicCoordinator
```

## 2. Git baseline gate

Before edits:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git merge-base --is-ancestor 40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5 origin/main
git merge-base --is-ancestor 04bb94678ba9ac29d03e2b2c00760ffb40510e55 origin/main
```

Start from current `origin/main`. Council UI3 and the fixed Council window are
already integrated. Do not duplicate those commits.

Required UI baseline:

- fixed desktop size `1180 x 700`;
- `resize: none`;
- movable panel;
- bounded responsive size on smaller viewports;
- layout key `kbcSwarmBotCouncilPanelLayout_v2`;
- all Council UI3 resources and fallbacks.

Stop if the branch is not based on both required UI commits.

## 3. Work package contract

```text
Product capability:
Derive a calibrated WAIT-relative shared milestone result for at least one real
supported Energy ability and let M6 use it in global recommendation.

Player-visible change:
Council/Inspector explain the ability action, WAIT baseline, milestone metric,
horizon, raw values, delta, provenance, uncertainty, and advisor-only authority.

Domains included:
Energy abilities as the first live calibration slice; Ascension/Mutagen as a
strict calibration placeholder; all six M6 domains remain visible.

Domains explicitly excluded:
Swarmwarp, invented multi-run simulation, new mutation models, new execution
keys, ability casts, Ascension, Mutagen spending, and Council artwork redesign.

Current milestone and horizons:
M7 / 7.0.0. Use the same explicit milestone and selected horizon for action,
WAIT, purchase alternatives, and global comparison.

Authority:
Advisor-only for Energy abilities and Ascension/Mutagen. Existing exact bounded
purchase authority only for current Meat/Engine/Territory/Energy-production.

Hard safety boundaries:
Every AGENTS.md default, Nexus/Energy protection, no Nightbug/Bat auto-buy, no
ability auto-cast, no auto-Ascension, no Mutagen spend, Laboratory read-only.

Focused acceptance states:
The twelve groups in the M7 foundation and manifest, including one real
production-parity ability calibration.

Files expected to change:
Runtime/build output, focused/version checkers, package versions/scripts,
README/history/status/release notes, and separate formal evidence only.

Evidence generator:
Only the final authored exact-SHA provenance report.

Evidence allowlist:
docs/test-data/7.0.0-book00-m7-calibrated-outcomes/verification-<short-sha>.md

Stop condition:
One real ability conversion is honest and globally usable without authority
leak; false Ascension conversion is removed/refused; UI3 and all regressions
pass; implementation and evidence are separately pushed.
```

## 4. Implement the calibration contract

Implement `strategic-outcome-calibration.v1` exactly as defined in the M7
foundation and manifest.

Prefer a pure evaluator plus a read-only live adapter. Suggested boundaries:

```text
buildStrategicOutcomeCalibration(input)
validateStrategicCalibrationIdentity(action, baseline, context)
calibrateAbilityOutcome(actionRun, waitRun, context)
calibrateAscensionOutcome(continueBranch, ascendBranch, context)
adaptCalibratedAbilityDomainOutcome(calibration, advisor, sharedContext)
adaptCalibratedAscensionDomainOutcome(calibration, advisor, sharedContext)
```

Names may follow local style, but these concerns must remain separate:

- capture/input normalization;
- identity and formula validation;
- metric delta calculation;
- M6 domain adaptation;
- safety/authority;
- observability.

The evaluator accepts plain cloned data, performs no game command, and does not
mutate inputs, config, session storage, or live state.

## 5. Ability vertical slice

Use an explicit WAIT result as baseline. An ability is globally comparable only
when action and WAIT share:

```text
snapshotId / snapshotHash / decisionCycleId
activeMilestone / activeTarget
metricId / metricUnit / direction
horizonId / horizonSeconds
formulaSetId / sourceRevision
```

For lower-is-better ETA:

```text
delta = baselineEtaSeconds - actionEtaSeconds
```

For higher-is-better identical-unit progress:

```text
delta = actionProgress - baselineProgress
```

Retain raw values. Preserve zero and negative deltas. Missing is `null`, never
zero.

Use only source-verified or runtime-derived formula status for rankability.
Estimated, incomplete, mismatched, and unsupported results remain visible but
unranked.

Supported action ids remain:

```text
CLONE_LARVAE
HOUSE_OF_MIRRORS
LARVA_RUSH
MEAT_RUSH
TERRITORY_RUSH
```

This list does not mean every action is comparable in every state. It means a
validated adapter may compare it when the active milestone metric exists.
Swarmwarp remains unsupported.

At least one production-parity state must prove a real shared conversion. If
the current runtime cannot provide one without guessed formulas, stop with
`INSUFFICIENT_MODEL_EVIDENCE`; do not weaken acceptance or ship a synthetic-only
claim.

## 6. Ascension correction and placeholder

Do not treat `breakEvenSeconds` as milestone ETA improvement. Remove/refuse the
standalone conversion:

```text
max(0, horizonSeconds - breakEvenSeconds)
```

Break-even remains useful recovery context. Ascension is globally comparable
only when both `CONTINUE_RUN` and `ASCEND_NOW` expose the same named milestone
value at the same next-run horizon, unit, and verified recovery revision.

The pure checker may exercise a fully supplied identical-unit fixture. The live
adapter must remain `UNRANKED` when those inputs are unavailable. Never invent
a future-run value from a recommendation label or community threshold.

## 7. Ranking, effects, and safety

M6 ranking continues to use real shared outcome fields. Do not add a M7 local
score.

- Hard safety precedes ranking.
- Calibration failure cannot become a score penalty.
- Duplicate included causal effects invalidate rankability.
- An advisor-only winner never executes and never falls through to a purchase.
- Existing purchase execution still requires exact identity, bounded amount,
  fingerprint, cycle, and immediate revalidation.
- No new execution key or command path is allowed.

## 8. Council UI3 and fixed layout preservation

Preserve functionality from both:

```text
40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5
04bb94678ba9ac29d03e2b2c00760ffb40510e55
```

Do not recreate or duplicate their commits. Do not rewrite Council artwork.
Bind new dynamic calibration text only into existing content regions.

The canonical `7.0.0` userscript must retain:

- Tampermonkey resources and `GM_getResourceURL`;
- 13 WebP runtime assets within the 600000-byte budget;
- Chamber, frame, parchment, four lane shields, six advisor shields;
- CSS asset fallback;
- Matrix Diagnostics;
- fixed `1180 x 700` normal desktop dimensions;
- `resize: none` and movable behavior;
- responsive limits below 1100 px;
- `kbcSwarmBotCouncilPanelLayout_v2`.

## 9. Observability and API

Expose every minimum flat field listed in the foundation through Council,
Strategy Inspector, JSON export, Markdown export, and diagnostic API.

The player must be able to distinguish:

```text
COMPARABLE + ADVISOR_ONLY
UNRANKED + missing conversion
UNSUPPORTED
INVALID identity/formula
BLOCKED hard safety
```

The API is read-only and has no command method.

## 10. Focused acceptance and versioning

Create:

```text
scripts/check-book00-m7-calibrated-shared-outcomes.js
npm script: check:book00:m7:calibrated-outcomes
scripts/check-7.0.0-version-surfaces.js
npm script: check:7.0.0:versions
docs/release-notes/SwarmSim-Strategy-Autobuyer-7.0.0-release-notes.md
```

Cover all manifest acceptance groups. Tests provide inputs, never expected
winners. Do not modify expectations after observing output.

Update all normal version surfaces to `7.0.0`, including userscript metadata,
runtime constants, scenario/export literals, package files, README, history,
status, release notes, version checker, and `npm run verify`.

Build canonical output from `dev-src`:

```bash
npm run build
```

Do not make a standalone direct edit that leaves `runtime-main.js` and `src/`
out of sync.

## 11. Intermediate validation

Run at minimum:

```bash
npm run build
npm run check:book00:m7:calibrated-outcomes
npm run check:ui-shell
npm run check:ui2:fixtures
npm run check:ui3:assets
npm run verify
node scripts/validate-repo-guardrails.js
git diff --check
```

Also run every changed-subsystem and version checker. Inspect `npm run verify`
before classifying it; do not assume it is read-only.

## 12. Commit, exact-SHA verification, and evidence

Follow `docs/process/GIT_VERIFICATION_PROTOCOL.md` exactly:

1. finish authored runtime, tests, version, package, and docs;
2. stage only intended M7 files;
3. commit and push the implementation to the authorized M7 branch;
4. record full implementation SHA and tree SHA;
5. verify that exact immutable SHA in an isolated worktree;
6. classify every command and predeclare evidence allowlists;
7. stop on unexpected source/configuration drift;
8. after the full suite passes, create only
   `docs/test-data/7.0.0-book00-m7-calibrated-outcomes/verification-<short-sha>.md`;
9. commit and push evidence separately;
10. report branch completion only when the branch is clean and synchronized.

Do not merge or push to `main`.

## 13. Final report

Report:

- branch;
- implementation SHA and tree SHA;
- evidence SHA;
- exact commands and exit codes;
- evidence path;
- production-parity ability state and calibrated metric;
- what became rankable and what remains unranked;
- confirmation that abilities/Ascension/Mutagen remain non-executable;
- confirmation that UI3 commit `40c258a` remains present;
- confirmation that fixed-layout commit `04bb946` remains present;
- confirmation of 1180 x 700, `resize: none`, layout key v2, responsive fallback,
  asset count/bytes, and Matrix Diagnostics;
- final remote synchronization and working-tree status.

Do not claim completion if the only positive ability comparison is synthetic,
if break-even surplus is still presented as milestone ETA, if UI behavior is
lost, or if implementation and evidence are mixed.
