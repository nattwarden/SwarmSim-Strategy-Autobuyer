# Strategy Audit Testbed Decision

Status: **decision pending feasibility study**

This document defines the decision that must be completed before Strategy Audit 0 is implemented or executed.

## Why a separate testbed decision is required

Strategy Audit must measure real 0.12.3 planner behavior without waiting for natural real-time progression. The environment must let an agent construct exact game states, run normal planner cycles, reset reliably, and show Sofie what is happening in a visible browser.

The environment must not become another hidden simulator that silently diverges from SwarmSim production.

## Non-negotiable state-construction authority

The audit agent may freely stage and mutate an **isolated test instance** of SwarmSim.

Allowed mechanisms include:

- direct mutation through Angular/game services;
- import of constructed or edited saves;
- scenario-harness overrides;
- test-only state adapters;
- restoration from serialized snapshots;
- deterministic time advancement where valid;
- explicit unit, resource, upgrade, and progression mutation;
- multiple planner cycles from identical or successive staged states.

The agent may set, among other fields:

- meat, larvae, cocoons, territory, and energy;
- resource production rates;
- unit counts and effective tier counts;
- unit and upgrade visibility;
- upgrade ownership;
- Nexus count;
- Expansion level;
- Hatchery state;
- army counts;
- ability availability;
- planner-relevant unlock and progression flags.

The audit does not need to wait in real time for a state to arise naturally.

## Hard boundary: construct the question, never manufacture the answer

> The audit may construct the question, but it must not manufacture the answer.

The test system must not:

- write BUY/HOLD directly into planner state;
- force a lane to win;
- replace coordinator ranking with fixture output;
- rewrite Council, Inspector, or exports after the planner runs;
- use output overrides to create an expected answer;
- mark a scenario successful merely because a hard-coded decision was injected.

Normal 0.12.3 planner behavior must consume the staged state and produce the result.

## State manifest, hashes, reset, and leakage proof

Every scenario must record:

- state setup method;
- complete state mutation manifest;
- mutation manifest hash;
- pre-reset state hash;
- initial state hash;
- post-scenario state hash;
- reset method;
- reset verification;
- state leakage result.

State from one scenario must not affect another scenario unless the scenario explicitly models successive cycles and records the transition.

Do not mutate Sofie's normal player save. All destructive state construction belongs in a disposable test profile, local game copy, constructed save, or isolated browser context.

## Required execution modes

The selected architecture should support three modes.

### `strategy:audit:fast`

- headless deterministic bulk scenarios;
- reproducible JSON and Markdown evidence;
- rapid regression use;
- no requirement for human pacing.

### `strategy:audit:watch`

- headed Chromium visible to Sofie;
- step-by-step scenario and cycle execution;
- Council, Strategy Inspector, and actual game UI visible;
- pause and manual progression controls;
- screenshots, trace, and optional video.

### `strategy:audit:live`

- small production-parity acceptance set;
- real `swarmsim.com` runtime;
- exact canonical userscript build;
- disposable or explicitly isolated save/profile;
- no broad destructive scenario matrix.

These command names are planned contracts. They are not implemented by this document.

## Candidate environment A: production page with direct injection

```text
https://www.swarmsim.com/
Playwright Chromium
isolated browser context/profile
canonical userscript through addInitScript or addScriptTag
```

Advantages:

- fastest path from existing repository browser verification;
- high production runtime parity;
- direct SHA-controlled userscript injection;
- immediate headed proof-of-concept potential.

Risks:

- network dependence;
- production game can change;
- game build is harder to pin;
- broad state mutation must be proven safe and resettable.

## Candidate environment B: pinned local SwarmSim installation

```text
pinned official SwarmSim source commit
local web server
Playwright
canonical userscript injection
isolated disposable state
```

The feasibility study must investigate the already referenced source-authority commit:

```text
06b4f404aa324a0b454348508cfa63d5c0f1ff54
```

Advantages:

- game-version pinning;
- offline reproducibility;
- unrestricted disposable state manipulation;
- predictable reset;
- stable bulk-test foundation.

Risks:

- old Angular/CoffeeScript build compatibility;
- Windows and current Node/toolchain issues;
- local runtime may differ from production deployment;
- maintenance cost.

## Candidate environment C: persistent Chromium with Tampermonkey

```text
Playwright launchPersistentContext
isolated browser profile
Tampermonkey or equivalent userscript extension
```

Advantages:

- resembles normal installation and player use;
- useful for final installation acceptance.

Risks:

- stale userscript risk;
- harder userscript SHA proof;
- extension setup complexity;
- more persistent state leakage;
- larger debugging surface.

This is not the preferred default for automated audit unless evidence shows a clear advantage.

## Candidate environment D: VS Code integrated browser/browser agent

Evaluate whether it provides:

- complete SwarmSim runtime;
- reliable localStorage/save state;
- exact userscript injection;
- reproducible multiple scenarios;
- clean reset;
- visible use for Sofie;
- screenshots, video, and trace;
- browser left open on failure;
- adequate debugging controls.

Do not choose it only because it is convenient for the agent.

## Decision matrix

The feasibility study must score or substantively compare:

- game-version pinning;
- production runtime parity;
- userscript source and SHA pinning;
- state mutation capability;
- save import/export;
- clean reset and leakage protection;
- determinism;
- headless support;
- headed support;
- Sofie can follow live;
- screenshots;
- video;
- Playwright trace;
- Pause/Next/Continue/Stop controls;
- leave-open-on-failure behavior;
- network dependence;
- offline reproducibility;
- debugging ergonomics;
- maintenance burden;
- stale Tampermonkey risk;
- risk of testing a different game build than production.

## Preliminary architecture to test, not a final decision

### Immediate visible proof of concept

```text
production swarmsim.com
+ separate headed Playwright Chromium
+ direct injection of src/SwarmSim-Strategy-Autobuyer.user.js
+ isolated disposable context/profile
```

This is the fastest likely route because the repository already uses production SwarmSim with direct Playwright injection in headless verification.

### Long-term canonical automated candidate

```text
pinned local SwarmSim build
+ Playwright
+ direct canonical userscript injection
+ disposable state per scenario
```

Select this only if the local build proves stable, maintainable, and sufficiently production-compatible.

### Production acceptance

```text
real swarmsim.com
+ exact same canonical userscript content
+ small parity scenario set
```

### Normal player acceptance

```text
Tampermonkey in Sofie's normal browser
```

## Visible audit product requirement

Sofie must be able to follow the agent's tests in a separate browser window beside VS Code.

The future `strategy:audit:watch` mode should:

- open headed Chromium;
- show real SwarmSim UI;
- show SwarmBot, Council, and Strategy Inspector;
- identify scenario and cycle;
- show initial-state summary and mutation manifest;
- show selected action and lane;
- show legal and rejected alternatives;
- show blockers;
- show goal metric before and after;
- pause between cycles;
- provide Next, Continue, Pause, and Stop;
- capture a screenshot per cycle;
- create Playwright trace;
- optionally record video;
- leave the browser open on failure;
- emit machine-readable evidence at the same time.

The visible overlay may read and present state. It must not alter planner ranking or output.

## Required final feasibility decision

The feasibility report must explicitly name:

- selected canonical automated environment;
- selected visible environment;
- selected production-parity environment;
- fallback environment;
- rejected alternatives and reasons;
- local SwarmSim build verdict;
- direct production-injection verdict;
- recommended implementation sequence.
