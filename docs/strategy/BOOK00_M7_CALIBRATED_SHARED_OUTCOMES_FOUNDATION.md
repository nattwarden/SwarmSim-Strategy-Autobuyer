# BOOK-00 Milestone 7 - Calibrated Shared Outcomes Foundation

Status: implementation-ready handoff contract; this document adds no runtime
behavior.

Target release: `7.0.0`

Baseline:

- accepted M6 implementation:
  `9da1b2312cc603c29f9d3add2270499fdbc1b269`;
- accepted M6 evidence:
  `60297dfbd8b686affd701258db40e94fb8ce3c53`;
- current runtime version: `6.0.0`;
- Council UI3 baseline:
  `40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5`;
- fixed Council window baseline:
  `04bb94678ba9ac29d03e2b2c00760ffb40510e55`;
- intended implementation branch:
  `codex/m7-calibrated-shared-outcomes`;
- authored contract manifest:
  `docs/test-data/7.0.0-book00-m7-calibrated-outcomes/m7-calibration-contract-manifest.json`.

## 1. Product outcome

M7 makes the first advisor-only domain honestly comparable with the four
purchase domains by deriving a shared milestone result from the same immutable
snapshot, explicit WAIT baseline, and selected horizon.

The initial live vertical slice is Energy ability timing for supported
Laboratory-backed actions. The player sees whether a supported ability is:

- globally comparable for the active milestone and horizon;
- better or worse than WAIT and the best reversible purchase;
- blocked, unsupported, or missing a specific conversion;
- advisor-only even when it wins;
- backed by source-verified/runtime-derived inputs or only an estimate.

Ascension/Mutagen joins the M7 calibration contract but does not become
rankable merely because M5 exposes `breakEvenSeconds`. It remains visible and
unranked until both `CONTINUE_RUN` and `ASCEND_NOW` can produce the same named
milestone metric at the same next-run horizon from verified recovery inputs.

Player-facing release sentence:

> The bot now uses calibrated, WAIT-relative milestone outcomes when comparing
> supported Energy abilities with normal progression, while unsupported or
> weakly evidenced future-run choices remain explicitly unranked.

## 2. Problem M7 closes

M6 correctly coordinates six domains and refuses incompatible local scores.
However, its advisor adapters can currently accept a supplied ETA-like value
without proving that it was derived for the active milestone, baseline, and
horizon. The Ascension adapter can also transform `breakEvenSeconds` into
`horizonSeconds - breakEvenSeconds`; that quantity is horizon surplus, not by
itself proof of milestone ETA improvement.

M7 replaces those shortcuts with a versioned calibration contract. A value is
globally rankable only when the action and baseline:

1. come from one decision identity;
2. name the same milestone and metric;
3. use the same horizon and unit;
4. expose raw before/after or action/baseline values;
5. declare formula provenance and uncertainty;
6. pass non-mutation, double-count, and hard-safety checks.

No conversion is inferred from recommendation labels, local scores, scenario
names, or expected winners.

## 3. Initial vertical slice

### Included

- explicit WAIT-versus-action calibration for supported Energy abilities;
- Clone Larvae, House of Mirrors, Larva Rush, Meat Rush, and Territory Rush
  only when their Laboratory/runtime inputs are valid for the active milestone;
- milestone ETA seconds as the preferred common basis;
- same-unit milestone progress delta only when ETA cannot be derived and both
  alternatives share the identical named metric;
- uncertainty ranges and formula status;
- M6 winner, alternative, authority, Council, Inspector, export, and API
  integration;
- an Ascension calibration placeholder that refuses false comparability and
  identifies the exact missing recovery inputs.

### Excluded

- Swarmwarp;
- ability auto-cast;
- auto-Ascension or Mutagen spending/allocation;
- invented multi-run simulation;
- conversion of raw larvae, meat, territory, army, Energy, or Mutagen gains to
  a common score without a named milestone model;
- new execution keys or wider purchase authority;
- Council artwork redesign.

## 4. Calibration contract

Schema: `strategic-outcome-calibration.v1`.

Required fields:

```json
{
  "schemaVersion": "strategic-outcome-calibration.v1",
  "calibrationId": "M7-...",
  "snapshotId": "M7-...",
  "snapshotHash": "sha256:...",
  "decisionCycleId": "cycle-...",
  "sourceDomainId": "ENERGY_ABILITIES",
  "sourceSchemaVersion": "energy-ability-timing-advisor.v1",
  "actionId": "CLONE_LARVAE",
  "baselineActionId": "WAIT",
  "activeMilestone": "next Expansion",
  "metricId": "expansion-eta",
  "metricUnit": "seconds",
  "horizonId": "medium",
  "horizonSeconds": 1800,
  "actionValue": null,
  "baselineValue": null,
  "delta": null,
  "direction": "LOWER_IS_BETTER",
  "comparabilityStatus": "COMPARABLE",
  "formulaStatus": "runtime-derived",
  "confidence": "medium",
  "uncertainty": {
    "low": null,
    "high": null,
    "reason": "none"
  },
  "missingInputs": [],
  "warnings": [],
  "provenance": []
}
```

Allowed `comparabilityStatus` values:

```text
COMPARABLE
UNRANKED
UNSUPPORTED
INVALID
```

Allowed `formulaStatus` values:

```text
source-verified
runtime-derived
estimated
incomplete
mismatch
unsupported
```

`estimated`, `incomplete`, `mismatch`, and `unsupported` cannot gain global
rank or execution authority in M7.

## 5. Metric rules

### 5.1 ETA basis

For `LOWER_IS_BETTER` ETA metrics:

```text
milestoneEtaImprovementSeconds = baselineEtaSeconds - actionEtaSeconds
```

For `HIGHER_IS_BETTER` progress metrics:

```text
projectedMilestoneProgressDelta = actionProgress - baselineProgress
```

The raw action and baseline values must remain observable. The delta may be
zero or negative; missing values remain `null` and never become zero.

### 5.2 Alignment gates

The conversion is rankable only when these values match exactly between action
and baseline:

- snapshot and decision-cycle identity;
- active milestone and target;
- metric id and unit;
- horizon id and seconds;
- formula set/revision;
- source-state revision.

Any mismatch returns `INVALID` or `UNRANKED` with authority false.

### 5.3 Ability calibration

Use Laboratory/action projection results only when:

- WAIT and the ability action were evaluated from the same read-only snapshot;
- both result rows are valid;
- the active milestone has an explicit metric adapter;
- formula status is `source-verified` or `runtime-derived`;
- the action result does not reuse the same causal benefit twice;
- hard Energy/Nexus, availability, and supported-action gates remain separate.

The first accepted adapters may use already exposed Laboratory metrics such as
Expansion ETA or an identical resource-threshold progress metric. Do not add a
generic weighted resource score.

### 5.4 Ascension calibration

`breakEvenSeconds` remains recovery context, not a shared ranking value.

Ascension becomes `COMPARABLE` only when the runtime can expose both:

```text
continueRunMilestoneValue at nextRunHorizon
ascendNowMilestoneValue at the same nextRunHorizon
```

with the same metric id/unit and verified recovery assumptions. Until then the
adapter emits `UNRANKED`, retains break-even/recovery diagnostics, and names
the missing inputs. `horizonSeconds - breakEvenSeconds` is forbidden as a
standalone ETA improvement conversion.

## 6. Authority and safety

M7 changes recommendation intelligence, not irreversible authority.

- Energy abilities remain `ADVISOR_ONLY` and never cast.
- Ascension and Mutagen remain `ADVISOR_ONLY` and never execute.
- An advisor winner cannot fall through to a lower-ranked purchase in the same
  decision cycle.
- Existing Meat, Engine, Territory, and Energy-production purchases retain the
  exact M2/M3/M6 identity and immediate revalidation requirements.
- No new execution key is allowed.
- Hard safety is evaluated before calibration/ranking and never converted into
  a numeric penalty.
- All AGENTS.md defaults remain unchanged.

## 7. Council UI3 preservation

Commits `40c258a7cf19d9660b2c13caf3b5d9b4e0e74da5` and
`04bb94678ba9ac29d03e2b2c00760ffb40510e55` are required ancestors. Council UI3
and the fixed Council window must remain in `7.0.0`.

Preserve:

- Tampermonkey `@resource` metadata and `GM_getResourceURL`;
- Council Chamber background, ornate desktop frame, parchment, four lane
  shields, and six advisor shields;
- responsive frame-free fallback below 1100 px;
- Matrix Diagnostics switching;
- CSS fallback when resources fail;
- `assets/council/runtime/manifest.v1.json` and the current 13 WebP assets;
- fixed `1180 x 700` normal desktop dimensions, movable behavior,
  `resize: none`, responsive bounds, and layout key
  `kbcSwarmBotCouncilPanelLayout_v2`;
- `scripts/build-council-runtime-assets.js`;
- `scripts/check-council-runtime-assets.js`;
- `build:ui-assets`, `check:ui3:assets`, and the UI3 step in `npm run verify`.

M7 may bind calibration status and evidence text into existing dynamic Council
regions. It must not replace or redesign the artwork.

## 8. Observability

Expose at minimum:

```text
strategicCalibrationSchemaVersion
strategicCalibrationId
strategicCalibrationStatus
strategicCalibrationDomain
strategicCalibrationAction
strategicCalibrationBaselineAction
strategicCalibrationMilestone
strategicCalibrationMetric
strategicCalibrationUnit
strategicCalibrationHorizon
strategicCalibrationActionValue
strategicCalibrationBaselineValue
strategicCalibrationDelta
strategicCalibrationFormulaStatus
strategicCalibrationConfidence
strategicCalibrationMissingInputs
strategicCalibrationWarnings
```

Council and Inspector must distinguish:

- comparable and advisor-only;
- unranked because conversion is missing;
- unsupported action;
- invalid identity/formula mismatch;
- blocked by hard safety.

The public API remains diagnostic and command-free. Suggested addition:

```js
window.kbcSwarmBot.strategicCoordinator.calibration = {
  schemaVersion,
  evaluate(input),
  getCurrent(),
  manifest()
}
```

## 9. Focused acceptance

Create `scripts/check-book00-m7-calibrated-shared-outcomes.js` and npm command
`check:book00:m7:calibrated-outcomes`.

Initial grouped states:

1. same-snapshot WAIT/action Expansion ETA calibration;
2. supported ability wins globally on positive same-milestone ETA delta but
   remains advisor-only with no purchase fallback;
3. supported ability loses honestly to a reversible purchase;
4. zero and negative ability deltas remain valid values and rank correctly;
5. missing action/baseline metric remains null and unranked;
6. milestone, horizon, unit, formula revision, or cycle mismatch invalidates
   calibration;
7. formula mismatch/incomplete state remains unranked;
8. Swarmwarp remains unsupported;
9. break-even-only Ascension remains unranked and never uses horizon surplus as
   ETA improvement;
10. a fully supplied identical-unit Ascension fixture can be compared by the
    pure contract but remains advisor-only; no fabricated live model is added;
11. duplicate causal effects remove rankability;
12. Council, Inspector, exports, API, UI3, safe defaults, Laboratory
    non-mutation, and M2-M6 regressions remain green.

Fixtures provide state and formula observations, never expected winners.

At least one production-parity acceptance state must exercise a real supported
ability conversion. If no current live state provides a valid shared metric,
the implementation must stop and report `INSUFFICIENT_MODEL_EVIDENCE` rather
than shipping synthetic-only comparability as a player capability.

## 10. Expected implementation scope

```text
dev-src/runtime-sections/runtime-main.js
src/SwarmSim-Strategy-Autobuyer.user.js
scripts/check-book00-m7-calibrated-shared-outcomes.js
scripts/check-7.0.0-version-surfaces.js
package.json
package-lock.json
README.md
docs/process/HISTORY.md
docs/strategy/BOOK00_CURRENT_STATUS.md
docs/release-notes/SwarmSim-Strategy-Autobuyer-7.0.0-release-notes.md
docs/test-data/7.0.0-book00-m7-calibrated-outcomes/verification-<short-sha>.md
```

The canonical userscript must be rebuilt from
`dev-src/runtime-sections/runtime-main.js`. Do not directly patch `src/` and
leave the configured assembly source behind.

## 11. Version and verification

M7 releases as `7.0.0`. Update all normal version surfaces while preserving
UI3 metadata and runtime resource bindings.

Minimum intermediate checks:

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

Formal acceptance follows `docs/process/GIT_VERIFICATION_PROTOCOL.md`: push an
immutable implementation commit, verify its exact SHA in an isolated worktree,
then commit only the predeclared provenance record separately.

Evidence allowlist:

```text
docs/test-data/7.0.0-book00-m7-calibrated-outcomes/verification-<short-sha>.md
```

## 12. Stop conditions

Stop rather than guess when:

- a local score is needed for cross-domain rank;
- action and WAIT do not share identity, milestone, metric, and horizon;
- a missing metric would need to become zero;
- break-even surplus would be mislabeled as ETA improvement;
- formula status is incomplete or mismatched;
- only synthetic fixtures support the claimed live capability;
- an advisor action could execute or fall through;
- UI3 resources, metadata, responsive fallback, or checks disappear;
- canonical build parity or hard safety changes;
- verification writes outside the declared evidence allowlist.

## 13. Definition of done

M7 is complete only when `7.0.0` derives at least one real supported
WAIT-relative Energy-ability outcome for the active milestone and horizon,
uses it in the six-domain recommendation without widening authority, refuses
false Ascension comparability, exposes provenance and uncertainty, preserves
Council UI3, passes focused and full exact-SHA verification, and records
separate pushed evidence.
