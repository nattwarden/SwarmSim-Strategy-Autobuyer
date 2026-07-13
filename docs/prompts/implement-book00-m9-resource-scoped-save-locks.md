# Copilot work order - BOOK-00 M9 resource-scoped save locks

Implement Milestone 9 as version `9.0.0` on a dedicated branch/worktree based
on the accepted `8.1.x` baseline.

Do not merge or push to `main` from this work order. Push only the authorized
M9 branch and report immutable implementation/evidence provenance.

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
9. `docs/strategy/BOOK00_M9_RESOURCE_SCOPED_SAVE_LOCKS_FOUNDATION.md`
10. `docs/test-data/9.0.0-book00-m9-resource-scoped-save-locks/m9-resource-lock-contract-manifest.json`
11. `dev-src/runtime-sections/runtime-main.js`
12. `src/SwarmSim-Strategy-Autobuyer.user.js`
13. focused M8 checkers and relevant strategy-audit scripts
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

Stop if baseline SHA is unclear or working tree contains unrelated edits that
cannot be isolated safely.

## 3. Work package contract

Product capability:

- save-window lock protects only the required resource;
- coordinator continues safe non-conflicting actions from other resources.

Player-visible result:

- fewer global HOLD loops when only Territory is protected for Expansion;
- Inspector/Council clearly show protected resource and reasoned execution path.

Hard boundaries:

- no default auto-cast;
- no default auto-ascend;
- no new execution keys;
- no widening irreversible authority.

## 4. Implementation requirements

1. Apply resource-scoped lock semantics in coordinator flow.
2. Preserve existing reserve/payback/protected-resource checks.
3. Ensure Expansion save-window blocks Territory spend only.
4. Allow non-Territory safe actions to proceed when available.
5. Keep advisor-only domains non-executable.
6. Improve blocker observability fields where needed.

## 5. Focused acceptance (minimum)

Run focused replay states that prove:

1. Territory remains blocked during Expansion save-window.
2. At least one safe non-Territory action can execute in the same pattern.
3. If no non-Territory action is safe, HOLD remains explicit and honest.
4. Authority boundaries remain unchanged.

## 6. Verification

At minimum:

```bash
npm run build
npm run check:book00:m8:false-wait
npm run verify
git diff --check
```

Add and run an M9-focused checker before formal completion.

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
- preserved safety boundaries;
- explicit statement that lock is resource-scoped, not global.
