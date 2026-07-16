# 9.4.0 clean-room shared target identity verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `bba78650d706f9fdade2fff57214117b255d3f8d`
- implementation tree: `48493cd9c282327ca7e079f3ad1fbb60c5e48afd`
- branch at verification start: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start: `bba78650d706f9fdade2fff57214117b255d3f8d`
- verification worktree: detached exact-SHA checkout
- working tree before verification: clean
- working tree after verification: clean

## Environment and game build

- captured at: `2026-07-16T08:48:13.098Z`
- Node.js: `v24.14.0`
- operating system: `Windows_NT 10.0.26200 x64`
- Playwright: `1.61.1`
- Chrome: `150.0.7871.116`
- game URL: `https://www.swarmsim.com/#/`
- AngularJS: `1.6.1`
- game script: `scripts/scripts.09dd8c8b.js`, 528156 bytes,
  SHA-256 `aff1b67cb4bbeefa42c5ab47c905943c315bf7e0de4a7af0ede254260c9e6ffa`
- vendor script: `scripts/vendor.b62c7e53.js`, 1726528 bytes,
  SHA-256 `f932b5e04761f61edbf346430650f0021db35bf5846f7906a7e7baea7ffa11cb`
- focused fixture: `docs/test-data/clone-ramp/live-user-save.txt`,
  SHA-256 `58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec`
- focused fixture clock: `2026-07-14T23:12:11.000Z`

## Command classification and results

Setup, not a product check:

- `npm ci` - exit `0`; installed Playwright `1.61.1` in the detached worktree.

Pure checks:

- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `npm run check:9.4.0:shared-target-identity` - exit `0`.
- `npm run strategy:audit:default-save:check` - exit `0`.
- `KBC_MUTATE_SHARED_TARGET_IDENTITY=1 npm run check:9.4.0:shared-target-identity`
  - exit `1`, expected mutation-control failure;
  - failure was `activeTarget=balanced` instead of `lesser hive mind`.
- `git diff --check` - exit `0`.

Predeclared evidence generators:

- `npm run build` - exit `0`; allowlist was the canonical userscript, and no
  file changed because the build was already current.
- `npm run verify` - exit `0`; allowlist was the existing self-cleaned
  strategy-audit testbed output paths, and no persistent file remained.

An earlier attempted formal run was discarded before assessment because
`npm ci` had accidentally run in the parent worktree, leaving Playwright
unavailable in the detached worktree. It made no tracked changes and supplies
no acceptance evidence. The complete sequence above was restarted from a
clean status after dependencies were installed in the correct worktree.

## Focused identity result

The pinned player save was evaluated in advisor-only mode after only the
unrelated, currently affordable Expansion and Hatchery branches were staged as
non-buyable. The staging did not inject a planner target or expected winner.
The normal meat-goal planner resolved:

- Inspector goal / active milestone:
  `Meat-chain target: lesser hive mind; current action: hive neuron.`
- shared active target: `lesser hive mind`
- domain count: exactly six
- shared domain contexts: all six used the same active milestone and target
- M6 execution authority: `false`
- tracked unit counts: unchanged

The in-memory mutation control replaced both shared-target bindings with the
old `smartFocus` fallback. It reproduced `activeTarget=balanced` and made the
focused check fail, demonstrating that the assertion detects the rejected
identity path rather than merely accepting the fixture.

## Preserved invariants

The configured full suite passed, including:

- canonical assembly and repository guardrails;
- M2 bounded coordinator (`Territory / Stinger V`, exact amount `9`);
- M3 Energy execution (`Lepidoptera`, exact amount `5`);
- M4, M5, M6 and M7 advisor/coordinator contracts;
- M8 false-wait transition and M9 resource-scoped locks;
- live legacy and M6-authorized purchases with real game-state deltas;
- F3 structured stall-breaker;
- Territory saturation;
- Clone Ramp;
- Twin Prep meaningful gate;
- 9.3.5 executed-amount and House of Mirrors readiness.

## Scope conclusion

The implementation resolves milestone and active target from one current
strategy identity and feeds that identity to both the pre-execution M6 cycle
and the later Inspector/Council reconstruction. It does not change proposal
ranking, candidate authorization, amount selection, safety thresholds,
ability defaults, Laboratory gates, or execution ownership. In particular,
`m6DecisionOwnsMainCycle` remains `false`; legacy execution ownership is
intentionally preserved for later clean-room safety-contract slices.
