# Copilot work order - BOOK-00 M11 opt-in execution for abilities and ascension

Implement Milestone 11 as version `11.0.0` on a dedicated branch/worktree based
on the accepted `10.0.x` baseline.

Do not merge or push to `main` from this work order. Push only the authorized
M11 branch and report immutable implementation/evidence provenance.

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
9. `docs/strategy/BOOK00_M11_OPT_IN_EXECUTION_ABILITIES_ASCENSION_FOUNDATION.md`
10. `docs/test-data/11.0.0-book00-m11-opt-in-execution-abilities-ascension/m11-opt-in-execution-contract-manifest.json`
11. `dev-src/runtime-sections/runtime-main.js`
12. `src/SwarmSim-Strategy-Autobuyer.user.js`
13. focused ability/ascension checkers and strategy diagnostics exports
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

- add explicit opt-in execution for supported abilities;
- add explicit opt-in execution for eligible ascension decisions.

Player-visible result:

- when enabled, allowed casts/ascensions execute automatically;
- when denied, reasons are explicit and auditable.

Hard boundaries:

- keep `autoCastAbilities` default OFF;
- keep `autoAscend` default OFF;
- no unsupported execution paths;
- no new execution keys;
- preserve hard safety guards.

## 4. Implementation requirements

1. Add opt-in execution mode checks before any cast/ascend execution.
2. Require comparability/confidence/blocker/cooldown gates.
3. Preserve advisor-only behavior when opt-in disabled.
4. Emit explicit allow/deny diagnostics and reconsider triggers.
5. Keep purchase and other domain authority boundaries unchanged.

## 5. Focused acceptance (minimum)

Run focused states proving:

1. opt-in disabled keeps advisor-only behavior;
2. supported ability execution can run when gates pass;
3. ability execution is denied with explicit reason when gates fail;
4. ascension execution can run when gates pass;
5. ascension execution is denied with explicit reason when gates fail;
6. defaults remain OFF after migration/update paths.

## 6. Verification

At minimum:

```bash
npm run build
npm run verify
git diff --check
```

Add and run M11-focused checker(s) before formal completion.

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
- explicit default OFF confirmation;
- explicit allow/deny gate behavior summary.
