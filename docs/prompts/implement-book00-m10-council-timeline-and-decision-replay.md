# Copilot work order - BOOK-00 M10 Council timeline and decision replay

Implement Milestone 10 as version `10.0.0` on a dedicated branch/worktree based
on the accepted `9.0.x` baseline.

Do not merge or push to `main` from this work order. Push only the authorized
M10 branch and report immutable implementation/evidence provenance.

## 1. Required reading

Read completely, in repository order:

1. `AGENTS.md`
2. `AI.md` (orientation only)
3. `docs/strategy/BOOK00_CURRENT_STATUS.md`
4. `docs/BOOK-00-vision-goals-and-dreams.md`
5. `docs/strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md`
6. `docs/SWARMSIM_GAME_MODEL.md`
7. `scripts/canonical-build.config.json`
8. `docs/process/GIT_VERIFICATION_PROTOCOL.md`
9. `docs/strategy/BOOK00_M10_COUNCIL_TIMELINE_AND_DECISION_REPLAY_FOUNDATION.md`
10. `docs/test-data/10.0.0-book00-m10-council-timeline-and-decision-replay/m10-council-timeline-contract-manifest.json`
11. `dev-src/runtime-sections/runtime-main.js`
12. `src/SwarmSim-Strategy-Autobuyer.user.js`
13. Council UI/runtime asset checks and strategy diagnostics exports
14. `package.json`

Search by symbol, not historical line numbers.

## 2. Baseline gate

Before edits:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git log -8 --oneline --decorate
```

Stop if baseline SHA is unclear or worktree scope cannot be isolated safely.

## 3. Work package contract

Product capability:

- add timeline visibility for recent decisions;
- add simple replay compare between adjacent cycles.

Player-visible result:

- players can inspect what changed and why the bot waited/bought over time;
- Council timeline agrees with Inspector/diagnostics for the same cycles.

Hard boundaries:

- no ability auto-cast by default;
- no auto-ascend by default;
- no new execution keys;
- no strategy ranking redesign.

## 4. Implementation requirements

1. Add timeline row model with required fields.
2. Render timeline in Council without breaking existing UI3 shell/layout.
3. Add replay compare summary for two adjacent cycles.
4. Reuse canonical cycle/inspector data as source-of-truth.
5. Preserve runtime asset/fallback and fixed-window contracts.

## 5. Focused acceptance (minimum)

Run focused states proving:

1. timeline renders recent cycle list;
2. timeline rows match Inspector export fields;
3. replay compare identifies changed blockers/decision;
4. advisor-only recommendations are clearly distinct from executable buys.

## 6. Verification

At minimum:

```bash
npm run build
npm run check:ui-shell
npm run check:ui2:fixtures
npm run check:ui3:assets
npm run verify
git diff --check
```

Add and run an M10-focused checker before formal completion.

## 7. Evidence protocol

Follow `docs/process/GIT_VERIFICATION_PROTOCOL.md` exactly:

1. commit and push implementation first;
2. record implementation SHA/tree;
3. re-sync to exact SHA;
4. run declared checks/evidence generators;
5. commit only allowlisted evidence separately;
6. report only after clean/expected state.

## 8. Output requirements

Final handoff must report:

- implementation SHA;
- evidence SHA;
- commands and exit codes;
- evidence paths;
- timeline/replay fields delivered;
- explicit statement that timeline source matches inspector/diagnostics.
