# Strategy Audit Testbed Feasibility Report

Status: completed decision
Date: 2026-07-10
Scope: `docs/prompts/next-strategy-audit-testbed-feasibility.md`

## Executive decision

- Canonical automated environment:
  - Production SwarmSim (`https://www.swarmsim.com`) + Playwright headless + direct canonical userscript injection.
- Visible watch environment:
  - Production SwarmSim + separate headed Playwright Chromium + direct canonical userscript injection + disposable browser context.
- Production-parity environment:
  - Same as above (production URL + direct canonical injection in isolated context).
- Fallback environment:
  - VS Code integrated browser for manual visual sanity checks only (not canonical automation).

## Explicit verdicts required by decision contract

- local SwarmSim build verdict:
  - Rejected as canonical bulk-test environment on current Windows/toolchain baseline.
  - Reason: pinned source commit `06b4f404aa324a0b454348508cfa63d5c0f1ff54` did not complete full `swarmsim-coffee` build under available Node/Yarn/Ruby stack.
- headed production-injection verdict:
  - Verified feasible and selected as watch/prototype baseline.
  - Findings are recorded in this report; raw probe output is not retained.
- immediate watch-prototype verdict:
  - Pass.
  - A visible headed Chromium run opened the game, injected canonical userscript, staged harmless state, ran normal planner cycle, surfaced Council/Inspector, captured screenshot + trace, and preserved profile isolation.

## Evidence inventory

The feasibility decision and its implications are recorded in this report;
raw probe files are disposable and are not retained.

## Required inventory summary

### Existing Playwright dependencies and scripts

- Repository dependency: `playwright` in `package.json`.
- Existing browser verification scripts:
  - `scripts/verify-0.12.0-laboratory-browser.js`
  - `scripts/verify-0.12.0-laboratory-phase1.js`
  - `scripts/verify-0.12.1-laboratory-live.js`
  - `scripts/verify-0.12.1-laboratory-live-runner.js`
  - `scripts/verify-0.12.3-laboratory-effective-count.js`
- Existing direct injection path already proven in verifiers:
  - `page.addScriptTag({ content: readUserscript() })` against production URL.

### Scenario-harness and runtime access

- Available runtime API surfaces in canonical userscript:
  - `window.kbcSwarmBot.runOnce`
  - `window.kbcSwarmBot.getStrategyInspector`
  - `window.kbcSwarmBot.getRunHistory`
  - `window.kbcSwarmBot.scenarioHarness.*`
  - `window.kbcSwarmBot.laboratory.*`
- Angular/game service runtime access confirmed in production feasibility probe.

### Save/state/reset and leakage controls

- Disposable Playwright context per scenario/probe is available and reliable.
- Persistent-profile probe confirms leakage risk if using persistent contexts without strict cleanup.
- Fresh context after probe showed no `kbcSwarmBot*` keys in localStorage.

### Artifacts and observability support

- Headed execution: supported.
- Screenshot: supported.
- Playwright trace: supported.
- Video: available in Playwright if enabled in future runner.
- Leave-open behavior: available via watch script mode (`--keep-open`).

## Decision matrix (A/B/C/D)

### Candidate A: production + direct injection (selected)

- Production parity: high.
- Userscript SHA pinning: strong (local canonical file hash in run output).
- State mutation capability: sufficient (runtime services + harness + controlled overrides).
- Reset/isolation: strong when using disposable contexts.
- Headless and headed support: yes.
- Visual following for Sofie: yes.
- Network dependency: yes.
- Maintenance burden: low (uses existing verifier pattern).
- Decision: selected for canonical automation now.

### Candidate B: pinned local SwarmSim commit (rejected for now)

- Pinning quality: high in principle.
- Build stability on current Windows/toolchain: failed in feasibility run.
- Runtime parity risk: medium (local build divergence possible).
- Maintenance burden: high due to legacy toolchain requirements.
- Decision: rejected as canonical now; may be revisited only with dedicated toolchain containerization.

### Candidate C: persistent Chromium + Tampermonkey (rejected for automation)

- Installation realism: high.
- Stale script/profile leakage risk: high.
- SHA proof difficulty: higher than direct injection.
- Debug and reproducibility overhead: high.
- Decision: keep for final installation acceptance only, not canonical automation.

### Candidate D: VS Code integrated browser/browser agent (fallback only)

- Runtime availability: acceptable for quick visual checks.
- Exact canonical userscript injection and SHA governance: weak by default.
- Trace/video/automation controls compared to Playwright runner: limited.
- Decision: fallback/manual sanity channel only.

## Hard-boundary compliance

Feasibility probe obeyed:

- "construct the question, not the answer"
- no forced BUY/HOLD planner output
- no lane winner override
- no post-run Council/Inspector rewrite
- no forced action execution
- no strategy/ranking/safety-default changes

## Recommended implementation sequence

1. Lock this environment decision and keep probe script as baseline harness.
2. Implement `strategy:audit:fast` runner on production URL with disposable contexts and manifest/hash capture.
3. Implement `strategy:audit:watch` runner on headed Chromium with pause/continue controls and per-cycle screenshot/trace.
4. Implement schema-complete result emitter per `STRATEGY_AUDIT_RESULT_SCHEMA.md`.
5. Add reset/leakage verifier around every state/cycle boundary.
6. Add minimal production-parity acceptance subset (`strategy:audit:live`).
7. Start Strategy Audit 0 state matrix only after steps 1-6 are stable.

## Out of scope confirmations

- No Strategy Audit 0 full matrix execution was run.
- No strategy/planner ranking logic changed.
- No safety default changed.
- No version bump performed.
