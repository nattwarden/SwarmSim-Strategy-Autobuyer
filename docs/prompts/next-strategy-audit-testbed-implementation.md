# Work Order: Implement Strategy Audit Testbed Runners (Post-Feasibility)

This work order starts after feasibility decision completion in:

- `docs/strategy/STRATEGY_AUDIT_TESTBED_FEASIBILITY_REPORT.md`

Do not run full Strategy Audit 0 yet.

## Start from Git truth

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Stop if working tree is dirty or `HEAD != origin/main`.

## Mandatory reading order

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `docs/strategy/README.md`
5. `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
6. `docs/strategy/STRATEGY_AUDIT_TESTBED_FEASIBILITY_REPORT.md`
7. `docs/strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
8. `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
9. `docs/prompts/next-strategy-audit-0-early-game.md`
10. existing Playwright/scenario/laboratory scripts and `scripts/probe-strategy-audit-testbed-feasibility.js`

## Selected environment contract

Implement runners on:

- production `https://www.swarmsim.com`
- direct injection of exact canonical `src/SwarmSim-Strategy-Autobuyer.user.js`
- disposable browser contexts/profiles

Keep persistent-profile/Tampermonkey mode out of canonical automation.

## Required new command contracts

Implement and document:

- `strategy:audit:fast`
  - headless bulk states
  - deterministic JSON+Markdown
- `strategy:audit:watch`
  - headed visible Chromium
  - pause/continue/next/stop controls
  - screenshot per cycle
  - Playwright trace
  - leave-open on failure option
- `strategy:audit:live`
  - small production-parity acceptance subset

Command names may be npm scripts that call dedicated runner files.

## Hard boundary

The runner may construct state but must never manufacture planner answer.

Forbidden:

- writing BUY/HOLD into planner state
- forcing lane winner
- replacing coordinator ranking
- rewriting Council/Inspector/export after planner run
- forcing execution outcome

## Required implementation outputs

1. Runner script(s) under `scripts/`.
2. Schema-complete output writer matching `STRATEGY_AUDIT_RESULT_SCHEMA.md`.
3. State mutation manifest + hash capture.
4. Pre/post/reset hash and leakage detection capture.
5. Watch overlay (read-only) that does not influence ranking.
6. Findings documented in the feasibility report; raw probe artifacts are temporary.

## Non-negotiable safeguards

- no changes to strategy ranking
- no changes to hard safety defaults
- no version bump
- no Laboratory formula changes unless strictly required by runner plumbing and approved

## Validation

Run and report:

```bash
node scripts/validate-repo-guardrails.js
npm run build
npm run verify
git diff --check
```

If `npm run verify` generates unrelated evidence outputs, restore unrelated generated changes before commit.

## Stop condition

Stop after runner implementation + testbed evidence proving contracts.

Do not execute full Strategy Audit 0 matrix in this work order.
