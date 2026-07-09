# SwarmSim Strategy Autobuyer

Conservative Tampermonkey smart advisor/autobuyer for Swarm Simulator.

Current baseline: **0.8.3 — Parent Step Conversion Fix**.

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
docs/
  SWARMSIM_GAME_MODEL-2026-07-09-github-first.txt
  release-notes/
  prompts/
  live-logs/
reference/                                  # strategy/source references used by AI agents
AI.md                                       # source map and AI-agent instructions
```

## Canonical Script Source

From 0.8.0 onward, the only executable Tampermonkey/javascript source is:

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

Release folders are documentation-only. Release history is tracked through Git commits/tags.

## Safety defaults

The baseline keeps conservative Smart Mode defaults:

- no ability auto-cast by default
- no Clone Larvae auto-cast by default
- no House of Mirrors auto-cast by default
- no auto-ascend
- no Nightbug/Bat auto-buy
- no aggressive `buyMaxUnit` in Smart Mode meat-chain planning

## Validation

For script syntax checks:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

## Next planned work

See:

```text
docs/prompts/next-0.8.0-unlock-clone-buffer-ability-prep.md
```
