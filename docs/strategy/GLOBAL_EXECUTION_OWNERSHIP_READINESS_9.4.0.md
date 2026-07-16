# 9.4.0 global execution-ownership readiness audit

Audit date: 2026-07-16

Audited branch: `codex/9.4.0-clean-room`

Initial audited HEAD: `523b3894dcc4374aafac171285aadea2eca6881f`

Slice 1 implementation: `21aa76ab03f5b75b2da32ecdc2db7aa7ee4d6b6a`

Slice 1 evidence: `b91fbf939c54de93be0c203c7ea3ca981babe815`

Slice 2 implementation: `e9926c57c0bc7b21bb4fb9be6a20c33ed4c9d6e5`

Slice 2 evidence: `02d0db9b0d71d3e7a6d0fb84d964c638a285e2da`

Slice 3 implementation: `19822e1e0eb2fe364d6393d9bfb0f19d1f8bd66c`

Slice 3 evidence: `6ec3c9a6cb855eafa4c5d118faf6538fe3898091`

Status: read-only architecture audit with verified slice-1, slice-2 and
slice-3 closures. This
document records why global execution ownership is not ready and selects the
next evidence-gathering direction. It does not authorize an ownership change.

## Decision

```text
NO_GO_GLOBAL_EXECUTION_OWNERSHIP
```

M6 must not become the sole owner of the main action cycle yet. Its safety
identity, stale-authorization and amount boundaries are now sound, but its
shared-outcome inputs and runtime coverage are not sufficient to replace the
legacy planners.

## Evidence examined

- `docs/BOOK-00-vision-goals-and-dreams.md`
- `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`
- `docs/SWARMSIM_GAME_MODEL.md`
- `dev-src/runtime-sections/runtime-main.js`
- `scripts/check-book00-m6-six-domain-coordinator.js`
- `scripts/check-live-purchase-acceptance.js`
- tracked player save
  `docs/test-data/clone-ramp/live-user-save.txt`, SHA-256
  `58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec`
- deterministic player-save replay at `2026-07-14T23:12:11.000Z`
- a controlled four-purchase, missing-shared-metric diagnostic evaluated
  through the public purchase and strategic-coordinator APIs

## Domain readiness matrix

| Domain | Current authority | Shared metric readiness | Exact execution coverage | Legacy coverage still outside M6 | Ownership verdict |
| --- | --- | --- | --- | --- | --- |
| Meat | Bounded reversible | Safe action-unit completion has an honest local progress contract, but it does not supply the selected final-target ETA contract. | Exact selected unit is supported. | Unlock planning, parent/refill, Twin preparation and generic Smart units still have separate behavior. | NO-GO |
| Larva/Engine | Bounded reversible | Hatchery/Expansion completion has an honest progress contract and is correctly unranked when the cycle selects target ETA seconds. | Exact selected Hatchery/Expansion upgrade is supported. | Critical production upgrades and other Smart upgrades run separately. | NO-GO |
| Army/Territory | Bounded reversible | Territory proposals can carry real ETA improvement, but the domain may be unsupported when no proposal is emitted. | Exact selected fighting unit is supported. | Territory diagnostics, seeding and saturation behavior do not always produce an executable M6 proposal. | NO-GO |
| Energy production | Bounded reversible | Pre-Nexus ETA, Nexus completion and post-Nexus production gain remain distinct contracts; only an exact selected match may rank. | Accepted Nexus or bounded Lepidoptera only. | The legacy Energy guard remains responsible for ordinary supported progression. | NO-GO |
| Energy abilities | Advisor only | Usually UNRANKED unless a validated non-WAIT ETA conversion exists. | Intentionally none. | Ability preparation and the narrow Clone Ramp exception remain separate. | KEEP ADVISOR-ONLY |
| Ascension/Mutagen | Advisor only | UNRANKED without validated continue-versus-ascend recovery values. | Intentionally none. | Existing safety/default behavior must remain separate. | KEEP ADVISOR-ONLY |

## Finding R1: missing metrics became false zeroes - closed in slice 1

`sixDomainComparableValue()` correctly checks
`milestoneEtaImprovementSeconds` for a finite value, but its fallback applies
`Number()` directly to `etaImprovementSeconds`. JavaScript converts `null` to
`0`. A missing outcome therefore becomes:

```text
comparability.status = COMPARABLE
comparability.basis = milestone-eta-seconds
milestoneEtaImprovementSeconds = 0
```

instead of remaining `UNRANKED`.

The deterministic player-save replay reproduced this false-zero state for
blocked Meat, Larva/Engine and Energy outcomes. The active goal was Lesser
Hive Mind and no allowed comparable action existed, so M6 returned
`UNCERTAIN`; however, the affected domains still falsely advertised comparable
zero-valued evidence.

A controlled diagnostic made all four purchase domains safe while leaving the
shared metric absent. Result:

| Surface | Winner |
| --- | --- |
| M2 unified evaluator | `Meat: Drone` |
| M6 strategic coordinator | `Army/Territory: Stinger V` |

All four M6 purchase outcomes were marked `COMPARABLE` with value `0`.
Confidence tied, so the domain-id tie-break selected Army/Territory. This is
not an economic comparison and must not authorize global ownership.

Slice 1 closed this shortcut without widening authority. Exact-SHA verification
proved that `null`, `undefined` and empty ETA evidence remain `UNRANKED`, four
safe missing-metric purchases produce no M6 winner or authority, explicit
numeric zero remains comparable, and a real positive Territory value remains
unchanged. A mutation restoring the direct `Number()` fallback fails the
focused verifier. See
`docs/test-data/9.4.0-clean-room/verification-21aa76a.md`.

## Finding R2: sole ownership would still suppress required paths

`m6DecisionOwnsMainCycle` remains correctly fixed to `false`. Setting it to
`true` suppresses the following existing paths regardless of whether M6 has a
safe executable winner:

- Larva Engine guard;
- critical production upgrades;
- Energy guard;
- Clone Ramp;
- Clone Buffer recovery and purchases;
- Meat unlock planner;
- Smart upgrades;
- Smart units;
- final Clone Prep side task.

The no-authority branch records that M6 refused execution, but it does not
provide a runner-up or a complete replacement for those paths. The existing
live-purchase mutation history already showed that sole ownership can leave
the bot buying nothing.

## Finding R3: WAIT is not yet an ownership decision

M6 currently uses `WAIT` when an advisor-only outcome wins and `UNCERTAIN`
when no comparable allowed outcome exists. Neither state proves that every
safe normal purchase represented by the legacy paths should be suppressed.
Until all reversible domains and required normal purchase classes share the
same milestone/horizon contract, M6 WAIT is advice—not authority over the
whole action cycle.

## Finding R4: metric target was not bound to the active target - closed in slice 2

The purchase adapter copies the decision's `activeTarget` into every domain
outcome but never proves that the row's metric describes that target. The
proposal field `target` is also overloaded: it may name a final planner goal,
an action purpose, or the metric itself.

A read-only replay of the pinned player save without the identity verifier's
buyability overrides produced:

| Domain | Proposal target | Metric | Decision active target |
| --- | --- | --- | --- |
| Engine | `Expansion` | local completion delta `100` | `Expansion` |
| Meat | `lesser hive mind` | absent while blocked | `Expansion` |
| Energy | `Post-Nexus energy growth` | absent while blocked | `Expansion` |
| Territory | no proposal | absent | `Expansion` |

Only Engine was aligned, so the replay supplied no real competing action pair
for the same target and horizon. A controlled diagnostic then gave a Meat row
for `lesser hive mind` a larger ETA value than an Engine row for `Expansion`;
M6 selected Meat even though the decision's active target was `Expansion`.

An uncommitted `metricTarget` fail-closed prototype correctly rejected that
diagnostic, but it also exposed three existing acceptance shortcuts:

- M6 and M7 synthetic rows use different action targets while claiming one
  common comparison;
- live-purchase Scenario B has active goal `construct nexus`, labels the
  Territory proposal `House of Mirrors prep`, and supplies an Expansion-ETA
  value;
- M3 requires post-Nexus Lepidoptera to receive M6 authority even though the
  product target selector never chooses `Post-Nexus energy growth` as the
  active target.

The prototype was discarded before commit. No test was retuned and the clean
branch retained all accepted M2/M3/M6/M7/live-purchase behavior.

Slice 2 implemented the approved one-active-target model without widening
ownership. Every supported purchase proposal now supplies an explicit
`metricTarget`; M6 records proposal, metric and active targets and ranks a
numeric outcome only when metric target and active target match exactly.
Missing or mismatched identities remain `UNRANKED`.

The formerly misleading acceptance states were corrected at their ownership
boundary instead of being forced green: the old M2 cross-target state is now
a negative no-authority regression; post-Nexus Lepidoptera remains a verified
bounded legacy Energy action; M6/M7 synthetic inputs explicitly declare their
shared target; and live Scenario B reaches a real Territory/Expansion focus
through production selectors rather than an active-target override. Exact-SHA
verification and a mutation that removes the gate are recorded in
`docs/test-data/9.4.0-clean-room/verification-e9926c5.md`.

## Finding R5: progress-delta bases were not globally commensurable - closed in slice 3

Commit `be16d243bc5829a53c747693a94e3918386694d6` (9.1.0) introduced the
current progress-delta shortcuts. The runtime directly sorts:

- Engine and buyable Nexus completion as `100`;
- any safe Meat action-unit chunk as `100`, although it completes only that
  local purchase step and not necessarily the final Meat target;
- post-Nexus Lepidoptera `boostGain`, a percentage-like production gain;
- Territory and pre-Nexus Energy ROI as raw ETA-improvement seconds.

Those values have different meanings and units. Before slice 3,
`evaluateSixDomainStrategicCoordinator` compared them numerically. The same
9.1.0 field also changed M2 scoring:
Engine/Nexus completion can receive ETA proximity, unlock bonus and progress
delta for the same event. This matches the earlier F2 finding in
`REPOSITORY_AUDIT_REVIEW_2026-07-14.md`; it is not evidence that a shared plan
model has been proven.

Slice 3 closes both shortcuts without inventing a conversion. Each cycle now
selects one exact metric id, unit and basis contract; source outcomes must
already be target-aligned and must match all three fields or become
`UNRANKED`. Completion/progress evidence remains available on its honest local
basis but cannot compete against the production default ETA-seconds contract.
M2 also treats an explicit milestone-progress-delta row as exclusive for the
progress/proximity/unlock signals, while retaining separate payback and reserve
evidence. Exact-SHA verification plus independent basis, double-count and
target mutation controls are recorded in
`docs/test-data/9.4.0-clean-room/verification-19822e1.md`.

## Readiness gates

| Gate | Status | Reason |
| --- | --- | --- |
| Missing metrics remain unranked | PASS | Slice 1 verifies `null`, `undefined` and empty ETA as unranked while preserving explicit numeric zero. |
| Metric target matches the active target | PASS | Slice 2 requires explicit identity and fails closed on missing or mismatched targets; mutation removal is detected. |
| Comparable candidates use one metric id, unit and basis | PASS | Slice 3 selects an exact cycle contract and fails closed on missing or mismatched metric id, unit, or basis. |
| Four reversible domains share the active milestone metric | FAIL | Territory is the only established real ETA source; other live outcomes frequently lack it. |
| Advisor-only winner cannot suppress reversible fallback | PASS today | Legacy ownership remains active; this would fail if sole ownership were toggled on. |
| Exact candidate authorization and stale revalidation | PASS | Phase 2 clean-room contracts cover identity, stale context and amount. |
| Exact supported purchase can execute | PASS, limited scope | M2/M3/live acceptance cover supported Meat/Engine/Territory/Energy examples. |
| M6 covers critical upgrades, Clone paths and all normal Smart purchases | FAIL | Multiple legacy paths have no equivalent M6 proposal/adapter. |
| WAIT proves no safe normal purchase exists | FAIL | WAIT/UNCERTAIN do not evaluate complete legacy coverage. |
| Sole-owner live acceptance | FAIL by prior mutation | Reintroducing sole ownership previously produced no-buy behavior. |

## Completed slice 1

Phase 3 slice 1 is deliberately narrow:

> Preserve missing shared metrics as `UNRANKED`; never coerce `null`,
> `undefined` or empty ETA evidence to zero.

Acceptance must prove:

1. explicit numeric zero remains a valid comparable value;
2. `null`, `undefined` and empty ETA evidence remain unranked;
3. four safe missing-metric purchases produce no M6 winner or execution
   authority;
4. existing real comparable Territory selection remains unchanged;
5. M2, M3, M6 and live-purchase behavior remain green;
6. a mutation restoring null-to-zero conversion fails the focused verifier.

Player-visible delta: Council and Inspector stop presenting missing evidence
as a real zero-value comparison or an arbitrary strategic winner.

## Completed slice 2

Phase 3 slice 2 implements the selected migration model:

> One active target per cycle; only outcomes explicitly measured against that
> target may be ranked by M6. Unaligned safe actions remain legacy-owned.

Acceptance proves off-target high values cannot beat an aligned outcome or
receive authority, aligned bounded execution remains available, post-Nexus
Energy continues safely through legacy execution, and live M6 authority is
grounded in a real production-selected target.

## Completed slice 3

Phase 3 slice 3 implements the next fail-closed boundary:

> One selected metric id, unit and basis per cycle; only exact matches may be
> ranked, and one declared completion delta may contribute only once to M2's
> progress/proximity/unlock signals.

Acceptance proves a same-target completion percentage cannot beat ETA seconds,
missing cycle contracts grant no authority, honest ETA authority remains
available, and three adjacent mutations reproduce and are rejected for the
old basis, double-count, and target shortcuts.

## Work after slice 3

After the false-zero correction, add one honest shared-outcome product slice
at a time, starting from the active player milestone rather than toggling
ownership:

1. select one real competing action pair for the same target, horizon and
   validated unit;
2. retain legacy execution until coverage and WAIT gates are complete;
3. repeat exact-SHA verification after each product slice.

The old plan generator remains out of scope.

## Selected slice-2 decision

The user selected the incremental architecture:

1. one active target per cycle;
2. only exactly aligned metrics rankable;
3. M6 remains a partial bounded executor;
4. post-Nexus Energy and other unaligned classes remain explicitly
   legacy-owned until a later target priority is defined.

Slices 2 and 3 implement the identity and comparison-contract boundaries of
that decision. They intentionally do not decide when
`Post-Nexus energy growth` should outrank the Meat goal. The next blocker is
one honest same-target, same-horizon, same-unit competing product pair, not a
new synthetic conversion or global ownership.
