# SwarmSim Strategy Autobuyer - ChatGPT Repo Context

Purpose: Give any external AI chat enough stable context to reason about this
repository safely, without relying on old uploads or stale copies.

## What This Repo Is

This project contains a Tampermonkey userscript for Swarm Simulator.
It is a conservative smart advisor/autobuyer with strict safety defaults.

## Canonical Source Of Truth

Only one executable userscript source is valid:

- `src/SwarmSim-Strategy-Autobuyer.user.js`

Active strategy/game model:

- `docs/SWARMSIM_GAME_MODEL.md`

Repo/process guardrails:

- `AGENTS.md`
- `AI.md`

Development scaffolding (non-executable):

- `dev-src/`

## Required Read Order For Any AI

Before proposing code changes, read in this order:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `src/SwarmSim-Strategy-Autobuyer.user.js`
5. Relevant file in `docs/prompts/`
6. Relevant files in `docs/release-notes/` and `docs/live-logs/`

Use `reference/` only for sanity checks, not as active truth.

## Hard Rules

- Do not treat old uploaded scripts as source of truth.
- Do not create `.txt` mirrors of the userscript.
- Do not create duplicate `.user.js` copies outside `src/`.
- Do not invent or broaden automation unless explicitly requested.
- Keep fixes narrow and scoped to the named issue.
- Preserve conservative defaults unless explicitly requested otherwise.

## Safety Baseline (Must Stay Conservative)

- No auto-cast abilities by default.
- No Clone Larvae auto-cast by default.
- No House of Mirrors auto-cast by default.
- No auto-ascend by default.
- No Nightbug/Bat auto-buy by default.
- Keep Nexus/energy protection enabled.
- Avoid aggressive buyMax behavior by default.

## How To Work In This Repo

- Implement behavior in `src/SwarmSim-Strategy-Autobuyer.user.js` unless an
  explicit migration task says otherwise.
- `dev-src/` is scaffold space for modularization, not runtime truth.
- If changing behavior, keep observability/debug output aligned with behavior.
- Avoid unrelated refactors during hotfixes.

## Validation Before Claiming Done

Run:

```bash
node scripts/validate-repo-guardrails.js
```

This checks syntax, safe defaults, and duplicate-script guardrails.

## What To Tell ChatGPT In One Sentence

"Treat `src/SwarmSim-Strategy-Autobuyer.user.js` and
`docs/SWARMSIM_GAME_MODEL.md` as canonical truth, follow `AGENTS.md`/`AI.md`
guardrails, keep changes narrow, and preserve conservative automation defaults
unless explicitly asked to change them."
