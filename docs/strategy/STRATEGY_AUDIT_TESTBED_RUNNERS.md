# Strategy Audit Testbed Runners

This document defines the permanent Strategy Audit testbed command contracts.

## Commands

- `npm run strategy:audit:fast`
- `npm run strategy:audit:watch`
- `npm run strategy:audit:live`

All commands use:

- production URL: `https://www.swarmsim.com/`
- Playwright Chromium
- direct canonical injection from `src/SwarmSim-Strategy-Autobuyer.user.js`
- disposable browser context/profile
- userscript SHA-256 capture in result output
- normal 0.12.3 planner run through `kbcSwarmBot.runOnce()`

Canonical automation does not use Tampermonkey or persistent player profiles.

## Shared runner architecture

Shared core implementation:

- `scripts/strategy-audit-testbed-core.js`

Mode wrappers:

- `scripts/strategy-audit-testbed-fast.js`
- `scripts/strategy-audit-testbed-watch.js`
- `scripts/strategy-audit-testbed-live.js`

The shared core owns:

- browser launch/context setup
- game hydration checks
- userscript injection
- userscript hash capture
- canary state construction
- mutation manifest and hash
- planner cycle execution
- Council/Inspector output capture
- screenshot, trace, and optional video capture
- result serialization (JSON + Markdown)
- reset and leakage verification
- cleanup and failure-safe partial writes

## Canary scenario

The infrastructure canary is:

- `TESTBED-CANARY-001`

Purpose:

- verify testbed contract and reproducible runner behavior
- validate state staging, cycle execution, and reset/leakage proof
- avoid embedding a predefined strategy answer

Boundary:

- this is not Strategy Audit 0 state matrix execution
- SA0-01..SA0-06 are intentionally not executed by these commands

## CLI flags

Shared flags accepted by all modes:

- `--run-id <id>`: explicit output run id
- `--cycles <n>`: number of controlled planner cycles (default `2`)
- `--trace <true|false>`: enable Playwright trace
- `--video <true|false>`: enable Playwright video
- `--slow-mo <ms>`: Playwright slow motion
- `--keep-open <true|false>`: keep watch browser open briefly
- `--leave-open-on-failure <true|false>`: keep watch page available on errors

Mode-specific behavior:

### fast

- headless
- runs canary twice by default for determinism comparison
- writes schema-complete JSON and Markdown
- writes determinism summary JSON
- non-zero on hard runner failures; optional strict deterministic failure with `--strict-determinism true`

### watch

- headed Chromium with visible read-only overlay
- overlay displays:
  - scenario id/title
  - userscript SHA
  - current cycle/total
  - initial state summary
  - mutation manifest summary
  - active goal
  - selected lane/action
  - best legal and rejected alternatives
  - hard blockers
  - goal metric before/after
  - reset/leakage status
- controls:
  - `Pause`: blocks next cycle execution
  - `Next`: executes exactly one cycle then pauses again
  - `Continue`: resumes automatic cycle progression
  - `Stop`: controlled stop with partial result write
- captures screenshot per cycle
- supports trace and optional video

### live

- production-parity canary subset only
- direct canonical injection
- disposable context only
- hydration and userscript-surface verification
- no full Strategy Audit 0 execution
- non-destructive planner capture path

## Artifact locations

Runner output is temporary and is not committed. Books retain the conclusions;
screenshots, traces, videos, and raw JSON/Markdown are disposable run artifacts.

## Result schema and null policy

Runner output aligns with `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`.

If a schema field is not measurable in canary runs, the field is set to `null` and explained in `nullFieldReasons`.

No field is silently omitted.

## Agent extension guide

To add future state definitions:

1. Add a new scenario state object in `scripts/strategy-audit-testbed-core.js`.
2. Keep all state mutations inside the state-staging function before cycle execution.
3. Record every mutation in `stateMutationManifest`.
4. Do not inject planner outputs, winner lanes, or Council/Inspector edits.
5. Keep reset and leakage verification mandatory.
6. Keep outputs schema-complete with explicit null reasons where needed.

Only state-staging helpers may manipulate game state.

The testbed must never write planner decisions or ranking outputs.
