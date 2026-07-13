# Copilot Work Order — Implement BOOK-00 M5 Ascension and Mutagen Advisor

Implement the complete Milestone 5 product slice. Continue until implementation,
focused acceptance, full verification, pushed implementation provenance, and a
separate pushed evidence commit are complete on the authorized M5 branch.

Do not implement UI redesign work owned by another agent. Do not merge or push
to `main` unless the user explicitly authorizes it and the integration tree is
clean.

## 1. Start from Git truth

Intended worktree and branch:

```text
C:\Users\info\OneDrive\Dokument\SwarmSim-m5-ascension-advisor
codex/m5-ascension-mutagen-advisor
```

The branch must contain verified M4 evidence baseline
`b9040d5943e621e6f41c6d247794e6866859ff64`.

Run:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git log -6 --oneline --decorate
```

Stop for unrelated dirt. Preserve unrelated work. The M5 branch is intentionally
stacked on verified M4 because M4 is not yet in `origin/main`; do not reset it to
`origin/main`, discard M4, rewrite history, or force-push.

## 2. Mandatory reading order

Read completely before editing:

1. `AGENTS.md`
2. `AI.md`
3. `docs/strategy/BOOK00_CURRENT_STATUS.md`
4. `docs/BOOK-00-vision-goals-and-dreams.md`
5. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`, especially M5
6. `docs/SWARMSIM_GAME_MODEL.md`
7. `scripts/canonical-build.config.json`
8. `docs/process/GIT_VERIFICATION_PROTOCOL.md`
9. `docs/strategy/BOOK00_M5_ASCENSION_MUTAGEN_FOUNDATION.md`
10. `docs/test-data/5.0.0-book00-m5-ascension-mutagen/m5-source-formula-manifest.json`
11. `docs/strategy/SWARMSIM_LABORATORY_PHASE_1.md`
12. `docs/release-notes/SwarmSim-Strategy-Autobuyer-4.0.0-release-notes.md`
13. M4 advisor/runtime helpers in `dev-src/runtime-sections/runtime-main.js`
14. relevant verifier scripts and `package.json`

Pinned formula authority is `https://github.com/swarmsim/swarm` at commit
`06b4f404aa324a0b454348508cfa63d5c0f1ff54`. Use it for parity checks only;
do not copy external source into this repository.

## 3. Product objective

Release M5 as `5.0.0`. Add an advisor-only domain that:

- compares `CONTINUE_RUN` and `ASCEND_NOW` from one immutable snapshot;
- reports cost, legality, Energy ETA/cap block, current-run opportunity,
  inactive Mutagen gained, recovery/break-even, next-run horizon, confidence,
  uncertainty, and reconsideration condition;
- includes `KEEP_UNALLOCATED` as the productive Mutagen baseline;
- supports direct Hatchery Mutation allocation analysis when inputs resolve;
- shows exact source-verified effect deltas for other mutations but keeps them
  unranked until their cross-domain models are supported;
- never ascends and never spends Mutagen.

Player-facing sentence:

> The bot now explains whether the current run is still worth continuing, what
> Ascension would gain and reset, and how supported Mutagen choices affect the
> next run without performing either irreversible action.

## 4. Non-negotiable mechanics

Use the manifest as the constants contract:

- executable Ascension penalty is `1.12 ^ ascensionCount`; ignore the stale
  adjacent source comment claiming 20%;
- exact cost is
  `ceil(penalty*5000000 / 2^(spentEnergy/(50000*ascendCostMultiplier)))`;
- runtime `game.ascendCost()` and related methods are primary, with formula
  parity validation;
- inactive `premutagen` becomes active `mutagen` on Ascension;
- each unallocated active Mutagen produces `0.1 larva/second`;
- allocating one Mutagen removes that production before mutation benefit;
- next mutation unlock cost is `15625 ^ alreadyUnlockedMutationCount`;
- an unlock spends that geometric cost and grants mutation level 1; later levels
  cost one Mutagen each, so total Mutagen spent and resulting level are not the
  same quantity for a locked mutation;
- missing data is not zero and Decimal precision is mandatory;
- legacy fixed allocation/Ascension thresholds are forbidden.

Implement generic source-verified `logStat`, `asympStat`, and `expStat` helpers
once and parity-test them. Do not duplicate formula implementations.

## 5. Hard safety boundaries

Preserve:

```text
autoAscend default = false
autoCastAbilities default = false
energySupportBrokerAllowAutoCast default = false
advisor executionAuthority = false
Mutagen allocation executionAuthority = false
no commands.ascend call from the advisor
no mutation buy/allocation call from the advisor
no Nightbug/Bat auto-buy
Nexus and Energy protection unchanged
Laboratory gated, read-only, simulation-only
```

Do not delete the existing legacy opt-in `tryAutoAscend` path unless separately
requested. M5 must not invoke, broaden, enable, or change its defaults.

## 6. Required architecture

Separate a pure evaluator from a read-only live adapter. Suggested functions:

```text
captureAscensionMutagenSnapshot(game, strategyContext)
evaluateAscensionMutagenSnapshot(snapshot)
buildAscensionContinueBranch(snapshot)
buildAscensionNowBranch(snapshot)
buildMutagenPlan(snapshot)
evaluateSourceVerifiedMutationEffect(effect, level)
```

The pure evaluator accepts plain data, deep-clones/freezes it, never reads live
state, never mutates input, and returns serializable plain data. The live adapter
reads only and never calls commands or changes game/session/config state.

Use schemas `ascension-mutagen-snapshot.v1` and
`ascension-mutagen-advisor.v1`. Every branch/candidate must share snapshot id,
active milestone, active target, and horizon.

## 7. Recommendation semantics

Top-level recommendation is `CONTINUE_RUN`, `ASCEND_NOW`, or `UNCERTAIN`.
`recommendedActionId` is `CONTINUE_RUN` or `ASCEND_NOW`; uncertainty safely
maps to `CONTINUE_RUN`.

`ASCEND_NOW` can win only when all foundation gates pass: legal now, complete
reset inputs, positive verified benefit, explicit recovery evidence, break-even
inside the horizon, better than the best continue opportunity, confidence at
least medium, and no mismatch/non-mutation failure.

Without recovery evidence return `UNCERTAIN`, null break-even, and a concrete
reconsideration condition. Never insert a fixed recovery time. Keep formula
confidence distinct from strategic confidence.

## 8. Mutagen scope

Always include `KEEP_UNALLOCATED`. Initially rank only it and
`HATCHERY_MUTATION` when unlocked and direct larva inputs resolve.

Hatchery comparison must show effect before/after, incremental hatchery
larvae/second, lost unallocated-Mutagen larvae/second, net larvae over the
horizon, and the proposed analysis amount plus its basis.

All other effects remain visible with exact deltas and one explicit status:

```text
effect-visible-unranked-cross-domain
effect-visible-unranked-ability-model
effect-visible-unranked-stochastic-future-mutagen
effect-visible-unranked-energy-and-ascension-coupling
effect-visible-unranked-territory-model
effect-visible-unranked-meat-chain-model
unsupported-unranked-swarmwarp
```

Never present a sensitivity probe as an exact allocation directive.

## 9. Recovery evidence

Implement the evidence tiers in the foundation document. Live state may return
`UNCERTAIN` when honest recovery evidence is unavailable. Focused tests must
still prove an `ASCEND_NOW` winner using explicit synthetic
`observed-run-milestone` evidence. That fixture provides observation data, not a
forced answer.

Do not build persistent multi-run telemetry unless strictly necessary. Prefer
honest existing observations or unavailable break-even.

## 10. Observability and API

Add the structured result and flat foundation fields to Strategy Inspector,
JSON export, Markdown export, and the existing explanation surface where it
does not conflict with parallel UI work. If UI files overlap, preserve the data
contract and document UI integration instead of editing UI-owned files.

Expose a diagnostic-only API:

```js
window.kbcSwarmBot.ascensionMutagenAdvisor = {
  schemaVersion,
  evaluate(snapshot),
  getCurrent(),
  formulaManifest()
}
```

No execution method is allowed.

## 11. Version `5.0.0`

Update runtime/userscript metadata, `package.json`, root `package-lock.json`,
README, history, current status, new `5.0.0` release notes, and a new
`scripts/check-5.0.0-version-surfaces.js`. `npm run verify` must call the new
checker. Do not relabel historical M3/M4 evidence.

## 12. Focused acceptance

Create:

```text
scripts/check-book00-m5-ascension-mutagen-advisor.js
npm script: check:book00:m5:ascension-mutagen
```

Cover all fourteen foundation scenarios. At minimum assert same immutable
snapshot/milestone/horizon, input non-mutation, illegal/cap-blocked/continue/
ascend/uncertain states, `1.12` parity, unlock costs `1`, `15625`, `244140625`,
Hatchery allocation honest win/loss, lost `0.1 larva/s` per allocated Mutagen,
unsupported mutations unranked, no authority, live observability fields, and
green M2–M4 regression.

Fixtures model inputs, not expected recommendations. Never rewrite expectations
after observing results.

## 13. Expected scope

Expected authored files:

```text
dev-src/runtime-sections/runtime-main.js
src/SwarmSim-Strategy-Autobuyer.user.js (canonical build output)
scripts/check-book00-m5-ascension-mutagen-advisor.js
scripts/check-5.0.0-version-surfaces.js
package.json
package-lock.json
README.md
docs/process/HISTORY.md
docs/strategy/BOOK00_CURRENT_STATUS.md
docs/release-notes/SwarmSim-Strategy-Autobuyer-5.0.0-release-notes.md
```

Update the foundation/manifest/prompt only for a source-backed correction. Do
not edit unrelated UI contracts/artwork, strategy thresholds, defaults,
Laboratory formulas, or historical evidence.

## 14. Build and intermediate validation

Use `apply_patch`. Build only through the configured pipeline:

```bash
npm run build
node scripts/validate-repo-guardrails.js
npm run check:book00:m5:ascension-mutagen
npm run verify
git diff --check
```

The isolated worktree may reuse ignored Playwright dependencies from the primary
worktree through `NODE_PATH`. Do not change dependencies merely to expose an
already installed runtime.

## 15. Git and exact-SHA evidence

Follow `docs/process/GIT_VERIFICATION_PROTOCOL.md` exactly:

1. Finish implementation/verifier/version/docs.
2. Run intermediate checks.
3. Commit and push one scoped implementation commit to the M5 branch.
4. Record full implementation and tree SHA.
5. Re-synchronize to that exact clean SHA.
6. Classify checks/generators before execution.
7. Run the full suite and stop on unexpected changes.
8. Write only
   `docs/test-data/5.0.0-book00-m5-ascension-mutagen/verification-<short-sha>.md`.
9. Commit only evidence separately and push.

Evidence must contain SHAs, commands/exit codes, paths, synchronization/clean
status, player change, narrow scope, safety, and exclusions. Do not claim main
integration unless it occurred and `HEAD == origin/main` clean.

## 16. Stop conditions

Stop rather than guess if formula parity fails, runtime Ascension methods
disagree, recovery evidence is absent but logic wants `ASCEND_NOW`, ranking
depends on Swarmwarp/unsupported conversion, another workstream overlaps a
required file, verification changes source/config, or final Git identity cannot
be reconstructed.

## 17. Definition of done

M5 is complete on the authorized branch only when the `5.0.0` script exposes an
advisor-only result, both branches share one immutable snapshot, exact mechanics
and recovery estimates are separated, Hatchery versus unallocated Mutagen is
honestly comparable, unsupported mutations remain visible/unranked, no
irreversible authority exists, focused/full checks pass on exact SHA, evidence
is separately pushed, and the M5 worktree is clean and synchronized.
