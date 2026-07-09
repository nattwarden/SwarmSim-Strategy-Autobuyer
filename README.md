# SwarmSim Strategy Autobuyer

Conservative Tampermonkey smart advisor/autobuyer for Swarm Simulator.

Current script version in `src/`: **0.8.8**.

Last live-verified baseline: **0.8.7 - Twin Upgrade Opportunity Cost Bypass**.

Current focus: **0.8.8 - Multi-Lane Coordinator / Territory Starvation Fix**.

## Repository layout

```text
src/
  SwarmSim-Strategy-Autobuyer.user.js       # current installable Tampermonkey source
dev-src/
  guards/                                   # modular lane guard scaffolds (non-executable)
  overseer/                                 # modular coordinator scaffold (non-executable)
  contracts/                                # shared proposal contract scaffold
docs/
  SWARMSIM_GAME_MODEL.md                    # canonical active game model
  HISTORY.md                                # summarized historical cleanup/version context
  MODULARIZATION_PLAN.md                    # phased lane/overseer modularization plan
  PR_CHECKLIST.md                           # PR body checklist
  release-notes/
  prompts/
  live-logs/
reference/                                  # strategy/source references for sanity checks
scripts/
  validate-repo-guardrails.js               # syntax, defaults, and artifact validation
AGENTS.md                                   # repo/process guard for AI agents
AI.md                                       # source map and AI-agent instructions
```

## Canonical script source

From 0.8.0 onward, the only executable Tampermonkey/javascript source is:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

Do not create `.txt` script mirrors, duplicate release `.user.js` files,
`releases/` script copies, or byte-identical script copies outside `src/`.

`dev-src/` is intentionally non-executable scaffold code for the ongoing
modularization effort. Runtime remains in `src/SwarmSim-Strategy-Autobuyer.user.js`
until explicit migration steps are completed.

## Canonical game model

Use only this active model for current strategy work:

```text
docs/SWARMSIM_GAME_MODEL.md
```

Older dated game model files were transitional snapshots and should not be used
as active truth.

## Safety defaults

The baseline keeps conservative Smart Mode defaults:

- no ability auto-cast by default
- no Clone Larvae auto-cast by default
- no House of Mirrors auto-cast by default
- no auto-ascend
- no Nightbug/Bat auto-buy
- no aggressive `buyMax` behavior in Smart Mode meat-chain or army planning
- Nexus/energy protection remains enabled

## Validation

Run the full repo guardrail check before PR:

```bash
node scripts/validate-repo-guardrails.js
```

This includes:

- `node --check src/SwarmSim-Strategy-Autobuyer.user.js`
- safe-default checks
- duplicate script artifact checks

## Current 0.8.8 work

See:

```text
docs/prompts/next-0.8.8-multi-lane-coordinator-territory-starvation.md
```
