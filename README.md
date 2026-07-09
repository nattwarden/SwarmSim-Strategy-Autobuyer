# SwarmSim Strategy Autobuyer

Conservative Tampermonkey smart advisor/autobuyer for Swarm Simulator.

Current baseline: **0.8.7 — Twin Upgrade Opportunity Cost Bypass**.

Next planned work: **0.8.8 — Multi-Lane Coordinator / Territory Starvation Fix**.

## Repository layout

```text
src/
  SwarmSim-Strategy-Autobuyer.user.js       # current installable Tampermonkey source
releases/
  0.7.9/                                    # archived release documentation
  0.8.0/                                    # archived release documentation
  0.8.1/                                    # archived release documentation
  0.8.2/                                    # archived release documentation
  0.8.3/                                    # archived release documentation
  0.8.4/                                    # archived release documentation
  0.8.5/                                    # archived release documentation
  0.8.7/                                    # archived release documentation
docs/
  SWARMSIM_GAME_MODEL.md                    # canonical active game model
  release-notes/
  prompts/
  live-logs/
reference/                                  # strategy/source references used by AI agents
AI.md                                       # source map and AI-agent instructions
```

## Canonical script source

From 0.8.0 onward, the only executable Tampermonkey/javascript source is:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

Release folders are documentation-only. Release history is tracked through Git commits/tags.

## Canonical game model

Use only this active model for current strategy work:

```text
docs/SWARMSIM_GAME_MODEL.md
```

Older dated game model files were transitional snapshots and should not be used as active truth.

## Safety defaults

The baseline keeps conservative Smart Mode defaults:

- no ability auto-cast by default
- no Clone Larvae auto-cast by default
- no House of Mirrors auto-cast by default
- no auto-ascend
- no Nightbug/Bat auto-buy
- no aggressive `buyMaxUnit` in Smart Mode meat-chain or army planning
- twin unlock rebuild buffer still enforced by default, with narrow opportunity-cost bypass only when lost production is negligible versus current child-resource bank

## Validation

For script syntax checks:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

## Next planned work

See:

```text
docs/prompts/next-0.8.8-multi-lane-coordinator-territory-starvation.md
```
