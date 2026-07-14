# BOOK-00 Live Purchase Acceptance Foundation

Title: Verify-integrated acceptance check for real autobuy purchases

Status: implementation-ready handoff contract; this document adds no runtime
behavior by itself. It is self-contained: no access to any prior AI
conversation is required to implement it.

Baseline:

- audited/accepted baseline: `2eef0248a2d3ce8a01265ccbc537b2b97ff01c69`
  (`9.1.0`); record the exact current SHA before implementation starts;
- hard safety defaults unchanged from `AGENTS.md`;
- background evidence: `docs/strategy/REPOSITORY_AUDIT_REVIEW_2026-07-14.md`
  (findings F4 and F8).

## 1. Background and verified test gap

Nothing in the `npm run verify` chain proves that the Autobuyer actually
purchases anything through the real production cycle:

- `scripts/check-unified-purchase-evaluator.js` and
  `scripts/check-book00-m2/m6/m7*.js` feed synthetic candidate rows directly
  into the evaluator/coordinator APIs. They prove coordinator logic given
  inputs, not that live proposal builders produce executable candidates.
- `scripts/check-book00-m8-false-wait.js` asserts a repeated-HOLD pattern and
  the `stallBreakerActive` flag; its scenario makes a purchase impossible by
  design (reserve multiplier 10000; the stall breaker bypasses payback only,
  never reserve).
- `scripts/check-book00-m9-resource-scoped-locks.js` asserts BUY eligibility
  of non-Territory lanes, not an executed purchase.

## 2. Historical consequence

`const m6DecisionOwnsMainCycle = true;` was hardcoded in `smartRunOnce` when
the M6 coordinator shipped (commit `5639699`, 6.0.0). This disabled every
legacy purchase path while the M6 authority gate could never pass for
Engine/Meat/Energy (permanently UNRANKED domains), so the bot could not buy
anything in live Autobuyer mode. The full verify suite stayed green through
`6.0.0`, `7.0.0`, `8.0.0` and `8.1.0` — four formally closed, exact-SHA
verified releases. The bug was found by a player-supplied savestate and fixed
in commit `35090b9` (9.0.0). See the `BOOK00_CURRENT_STATUS.md` handoff log
entries dated 2026-07-14.

This work order exists so that this class of regression can never again pass
formal verification.

## 3. Exact goal

Add a focused acceptance check, wired into the `verify` chain, that proves:

> A real `runOnce()` cycle, in autobuy mode, on a product-like staged state,
> results in at least one actual purchase, evidenced by unit/upgrade count
> deltas in game state — not by planner decisions, eligibility, flags, or
> reason text.

## 4. Forbidden changes

- No changes to `dev-src/runtime-sections/runtime-main.js` or
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
- No changes to scoring, ranking, comparability, gates, thresholds, or lane
  order.
- No changes to hard safety defaults (`AGENTS.md` list).
- No changes to assertions or expected values of any existing check.
- No forcing or injecting of planner output in the scenario (testbed
  principle: planner output is observed, never injected).
- No staging of unrealistic config values whose purpose is to force a buy;
  the staged state must be product-like. (Scenario-scoped config overrides
  that isolate lanes are allowed, as in existing scenarios, but the purchase
  itself must pass the normal production guards.)

## 5. Files in scope / protected files

Likely touched:

- `scripts/strategy-audit-testbed-core.js` — two new scenario definitions
  (reuse the existing scenario/config-override/reset plumbing).
- `scripts/check-live-purchase-acceptance.js` — new check script (model it on
  `scripts/check-book00-m9-resource-scoped-locks.js`, which already uses
  `runMode("live", ...)`).
- `package.json` — new script entry (suggested:
  `check:live-purchase-acceptance`) appended to the `verify` chain.
- `docs/strategy/BOOK00_CURRENT_STATUS.md` — handoff entry on completion.

Must NOT be touched: everything under `dev-src/`, `src/`, existing
`scripts/check-*.js` assertions, `scripts/validate-repo-guardrails.js`,
`AGENTS.md` safety sections.

## 6. Mandatory scenarios

### Scenario A: legacy purchase path

Real `runOnce()` in autobuy mode (`advisorOnly=false`,
`autoBuySafeDecisions=true`) on a staged product-like state where the legacy
lane order performs a safe purchase (for example a buyable Hatchery or a safe
meat-chain unit with ample reserve).

Required evidence, all captured from game state and the post-cycle inspector:

- unit or upgrade count delta > 0 for the expected target (count before vs
  after, read from the game, not from bot logs);
- resource delta consistent with the purchase cost within tolerance
  (production during the cycle makes exact equality wrong; use a bounded
  tolerance);
- expected lane and candidate identity
  (`laneCoordinatorState.selectedLaneActions` / inspector fields match the
  purchased item);
- inspector/export state observed AFTER the executed action reflects the
  purchase (`coordinatorDecision === "BUY"`, run history entry has
  `mainActions >= 1`);
- no advisor-only action executed (no ability/ascension/mutagen execution;
  `autoCastAbilities` and `autoAscend` remain false throughout).

### Scenario B: M6-authorized purchase path

Real `runOnce()` on a staged state where the M6 six-domain winner and the M2
unified-evaluator winner agree, all execution gates pass, same-cycle
revalidation passes, and M6 receives actual execution authority
(`executionAuthority === true` with `matchedExecution === "yes"`).

Note: the simplest known such state is a buyable Territory army-seed
candidate with a real, meaningful Expansion ETA improvement (Territory
populates `etaImprovementSeconds` natively), but any state that honestly
produces agreement is acceptable.

Required evidence:

- the exactly authorized candidate is purchased: executed fingerprint equals
  the selected fingerprint
  (`wholeEconomyExecutionDecisionState.matchedExecution === "yes"`);
- count delta > 0 for that exact unit/upgrade;
- resource delta consistent with cost within tolerance;
- no double execution through the legacy lane in the same cycle: the
  purchased execution key is skipped by the legacy path
  (`coordinatorExecutedKey` semantics), and total purchases of the target in
  the cycle equal the single bounded amount — verify via count delta, not
  logs; staging `smartMaxActionsPerRun: 1` for this scenario is an acceptable
  way to isolate this, since it is a user-reachable setting;
- inspector/export match the executed candidate (Council decision card,
  execution decision fields).

## 7. Verification requirements

- `node scripts/check-live-purchase-acceptance.js` exits 0 on the current
  baseline.
- `npm run verify` exits 0 with the new check included in the chain.
- Reset/leakage discipline: the scenarios must pass the testbed's existing
  reset verification and state-leakage detection, like every other live
  scenario.

## 8. Mutation control (the check must be able to fail)

Before final acceptance, demonstrate — locally, without committing — that the
check FAILS when the historical bug is reintroduced:

1. Temporarily set `m6DecisionOwnsMainCycle = true` in
   `dev-src/runtime-sections/runtime-main.js`, run `npm run build`, run the
   new check. Required result: Scenario A fails (no purchase happens).
2. Revert the mutation (`git checkout` the two runtime files), rebuild, rerun.
   Required result: green.

Record both results (commands + exit codes) in the handoff entry. This
mutation test is the check's reason to exist; a check that stays green under
the historical bug must not be accepted.

## 9. Definition of done

- Both scenarios implemented and green in the `verify` chain at an exact,
  recorded implementation SHA.
- Mutation control performed and documented (section 8).
- Purchase evidence is count-delta based in both scenarios; no assertion
  relies on flags, eligibility, or reason text as purchase proof.
- No runtime, scoring, safety-default, or existing-test change (verify with
  `git diff --stat` against the recorded baseline: only the files listed in
  section 5 may appear).
- `BOOK00_CURRENT_STATUS.md` handoff entry written per
  `docs/process/GIT_VERIFICATION_PROTOCOL.md`.

## 10. What this check still does not prove

- That purchase decisions are strategically optimal (only that purchasing
  works at all through both execution paths).
- That the 9.1.0 comparability/scoring shift is correct (that requires the
  SA1 comparison run described in the audit review note, section 10 item 5).
- That advisor mode and autobuy mode produce identical decisions.
- Behavior across the full mid/late-game state space (SA1 matrix remains the
  instrument for that).
- Rollback risk of the check itself: none for runtime (additive test-only
  change); `verify` gains one more live-Chrome dependency on
  swarmsim.com availability.
