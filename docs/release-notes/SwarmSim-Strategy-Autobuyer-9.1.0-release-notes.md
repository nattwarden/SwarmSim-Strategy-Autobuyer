# SwarmSim Strategy Autobuyer 9.1.0

## M6 comparability gap closed for Engine/Meat/Energy purchase domains

`buildUnifiedPurchaseProposals` only populated `raw.etaImprovementSeconds` for
the Territory proposal (and the pre-Nexus Lepidoptera-ROI branch of Energy).
Engine (Hatchery/Expansion), Meat (goal-planner action unit), and the
Nexus-buyable/post-Nexus-Lepidoptera Energy branches never populated any
M6-comparable metric, so `adaptPurchaseDomainOutcome` always returned
`comparability.status = "UNRANKED"` for those three domains — they could
never win or gain execution authority under the M6 six-domain coordinator,
regardless of how strong the candidate actually was.

### Fix

Per M7 rules (no generic weighted score, no fabricated zero, real grounded
metric only):

- `evaluatePurchaseCandidate` now extracts `raw.projectedMilestoneProgressDelta`
  and exposes it on `sharedOutcome` (already a reserved M7 field, previously
  only used by the Ascension/Mutagen adapter).
- Engine (Hatchery/Expansion) and Energy's Nexus-buyable branch: these are
  discrete, one-time unlocks. When buyable, `projectedMilestoneProgressDelta`
  is set to `100` — buying now completes the milestone this cycle (0% -> 100%
  owned) versus waiting, which leaves it undone.
- Meat goal-planner action unit: same completion-event basis — when the
  safety/reserve/payback guard passes, `projectedMilestoneProgressDelta` is
  set to `100`.
- Energy's post-Nexus Lepidoptera branch: reuses the already-computed,
  already-displayed `plan.boostGain` (Council's "Energy production gain") as
  the progress-delta value, rather than inventing a new number.
- ETA-basis metrics are checked first in `sixDomainComparableValue`, so
  Territory and the Energy ROI branch (which already had real
  `etaImprovementSeconds`) are unaffected and keep their existing basis.

### Player-visible behavior

Engine, Meat, and Energy purchase proposals can now become
`comparability.status = "COMPARABLE"` in the M6 six-domain coordinator
(previously always `UNRANKED`), so M6 can honestly rank and, for
bounded-reversible lanes, grant execution authority to whichever domain
actually has the best evidence — not just Territory by default.

### Safety and authority

No hard-default or authority-boundary change. Ability/Ascension remain
advisor-only. `m6DecisionOwnsMainCycle` stays `false`: legacy per-lane
execution remains the acting purchaser, and M6 can still claim execution for
any lane it wins, guarded by `coordinatorExecutedKey` as before.

### Known follow-up (out of scope for this release)

M6's cross-domain ranking (`evaluateSixDomainStrategicCoordinator`'s sort)
compares `.value` numerically across domains without normalizing units —
Territory/Energy-ROI report raw ETA-improvement-seconds while
Engine/Meat/Energy-Nexus now report a 0-100 progress-delta scale. Both are
"higher is better" reductions so the sort direction is correct, but the
magnitudes are not unit-harmonized across domains. This is a pre-existing M6
design characteristic, not introduced by this release, and full cross-domain
unit-harmonization is a larger, separate task.

### Verification

- `npm run build` -> `0`
- `node --check src/SwarmSim-Strategy-Autobuyer.user.js` -> `0`
- `npm run check:book00:m6:six-domain` -> `0`
- `npm run check:book00:m7:calibrated-outcomes` -> `0`
- Full `npm run verify` -> `0`
- Version-surface checker renamed to `check:9.1.0:versions`
