# Work Order: Strategy Audit Testbed Feasibility and Environment Decision

You are selecting the canonical test environment for Strategy Audit.

Do not run the full Strategy Audit 0 matrix and do not change normal strategy behavior.

## Start from Git truth

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Stop if the working tree is dirty or HEAD differs from `origin/main`.

## Mandatory reading

Read in this order:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `docs/strategy/README.md`
5. `docs/strategy/STRATEGY_INTELLIGENCE_ROADMAP.md`
6. `docs/strategy/STRATEGY_AUDIT_TESTBED_DECISION.md`
7. `docs/strategy/STRATEGY_AUDIT_0_EARLY_GAME.md`
8. `docs/strategy/STRATEGY_AUDIT_RESULT_SCHEMA.md`
9. `docs/prompts/next-strategy-audit-0-early-game.md`
10. existing Playwright, browser-verifier, scenario-harness, and Laboratory documentation/scripts.

## Authority

You have full authority to manipulate disposable test instances of SwarmSim to prove feasibility. You may create temporary local clones, constructed saves, temporary adapters, browser profiles, scripts, and proof-of-concept files outside the repository.

You may install local dependencies required for proof of concept.

Do not mutate Sofie's normal player save.

> The testbed may construct the question, but it must not manufacture the planner answer.

Do not force planner BUY/HOLD output, lane winners, Council text, Inspector text, or action execution.

## Required inventory

Before writing permanent code, inventory:

- current Playwright dependencies and scripts;
- direct userscript injection paths;
- current production URL browser verification;
- scenario-harness state override capabilities;
- Angular/game runtime access;
- save import/export options;
- screenshot, trace, video, and headed execution support;
- current reset/leakage guarantees.

## Required feasibility experiments

### A. Production + headed Playwright + direct canonical injection

Prove or disprove that a separate visible Chromium window can:

- load `swarmsim.com`;
- inject exact `src/SwarmSim-Strategy-Autobuyer.user.js` content;
- report userscript SHA;
- enable required development gates;
- access game services;
- stage at least one harmless disposable early-game state;
- run one normal planner cycle;
- show Council/Inspector;
- capture screenshot and Playwright trace;
- pause or leave the browser open for Sofie;
- reset without affecting a normal player profile.

This is a feasibility probe, not SA0 execution.

### B. Pinned local SwarmSim build

Use a temporary directory outside this repository.

Investigate the official source and especially commit:

```text
06b4f404aa324a0b454348508cfa63d5c0f1ff54
```

Determine:

- whether it can be obtained and built;
- required Node/toolchain versions;
- whether Windows/VS Code operation is stable;
- how to serve it locally;
- whether runtime services match production sufficiently;
- whether the canonical userscript loads;
- whether state mutation and reset are easier and reliable;
- whether it is maintainable as the canonical bulk-test source.

Do not vendor the SwarmSim source or build artifacts into this repository.

### C. Persistent Chromium + Tampermonkey

Assess, with a minimal probe only if useful:

- extension loading requirements;
- profile isolation;
- userscript SHA verification;
- stale script risk;
- suitability for automated audit versus final installation acceptance.

### D. VS Code integrated browser/browser agent

Assess whether it provides the required runtime, state isolation, exact injection, automation, visible following, screenshots, video/trace, pause controls, and reset guarantees.

Do not select it for convenience alone.

## Visible proof-of-concept requirement

At least one feasibility experiment must open a headed browser that Sofie can watch.

A minimal temporary overlay may show:

- testbed/probe id;
- initial state summary;
- mutation manifest;
- current cycle;
- selected action;
- best visible alternative;
- Pause/Continue/Close controls.

The overlay is read-only and must not influence planner results.

## Decision matrix and report

Produce a report comparing all four candidates against every criterion in `STRATEGY_AUDIT_TESTBED_DECISION.md`.

The report must explicitly select:

- canonical automated environment;
- visible watch environment;
- production-parity environment;
- fallback environment;
- rejected alternatives and reasons;
- local build verdict;
- immediate watch-prototype verdict;
- implementation sequence.

## Permanent repository changes allowed

Keep permanent changes narrow and separated from temporary experiments.

Allowed outputs for this task:

- a feasibility report under `docs/strategy/`;
- evidence under a clearly named testbed-feasibility folder;
- a follow-up implementation work order under `docs/prompts/`;
- a minimal non-strategy testbed probe only if required to prove the recommendation;
- package scripts only if the probe is retained and fully documented.

Do not modify:

- normal strategy decisions;
- safety defaults;
- production planner ranking;
- release version;
- Laboratory formulas;
- existing acceptance evidence.

## Validation

Run all existing guardrails, build checks, and verification. Restore unrelated generated changes.

Document every command, environment version, failure, workaround, and artifact path.

## Stop condition

Stop after the environment decision, feasibility evidence, and implementation plan.

Do not implement or run the complete SA0 state matrix. Do not automatically create 0.12.4.
