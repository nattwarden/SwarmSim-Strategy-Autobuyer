# SwarmSim Strategy Autobuyer — Repo Guard

## Role

This is not a gameplay strategy agent.
It is a repository/process guard for AI coding agents.

Its job is to:
- start from the correct source of truth
- preserve repo structure
- keep hotfixes narrow
- protect safe defaults
- validate before PR
- avoid duplicate artifacts

## Canonical source

The only executable Tampermonkey script source is:

src/SwarmSim-Strategy-Autobuyer.user.js

Release folders are documentation-only.
Release history is tracked through Git commits/tags.

Do not create:
- .txt script mirrors
- duplicate .user.js files in releases/
- byte-identical script copies outside src/

## Required reading order

Before code changes, read:

1. AI.md
2. docs/SWARMSIM_GAME_MODEL-2026-07-09-github-first.txt
3. src/SwarmSim-Strategy-Autobuyer.user.js
4. relevant docs/release-notes/
5. relevant docs/live-logs/
6. reference/ only when needed

## Safe defaults that must not change unless explicitly requested

- autoCastAbilities must default false
- autoAscend must default false
- no Clone Larvae auto-cast by default
- no House of Mirrors auto-cast by default
- no Nightbug/Bat auto-buy by default
- Nexus/energy protection must remain enabled
- Smart planners must not use aggressive buyMax behavior by default

## Hotfix rules

For hotfixes:
- branch from current origin/main
- fix only the named issue
- do not add new strategy
- do not widen automation
- avoid unrelated refactors
- update version markers only when requested
- update docs/release notes only when relevant
- keep PR diff small
- after squash merge, do not keep working on the old feature branch

## Branch/PR hygiene

Before starting:

git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b feature/<short-descriptive-name>

If a PR branch was squash-merged:
- checkout main
- pull main
- delete the old feature branch locally
- do not press Sync Changes on the old feature branch

## Validation

Always run:

node --check src/SwarmSim-Strategy-Autobuyer.user.js

PR body should include:
- what changed
- why it is narrow
- safety preserved
- validation run
- files changed
- what was intentionally not changed

## Live-log caution

When changing behavior from live logs, check:
- script version
- decision/main/side
- best allowed main/side
- best rejected strategic
- active action unit
- unlock candidate/reason
- clone buffer mode/current/target/percent/debt/spendable/hard lock/source
- ability prep reason
- purchase log
- config summary

Known bug patterns:
- clone buffer shows 100% recovered but hard lock remains active
- BUILDUP makes spendable larvae 0
- unlock candidate uses final target instead of current action unit
- target/source moves every tick and causes endless chasing
- config and lane reasons disagree
- lower filler is bought under active meat action unit
- PR branch includes already-merged commits after squash merge

## Core principle

When in doubt:
make the smallest safe fix,
preserve defaults,
improve observability,
and do not invent new strategy.
