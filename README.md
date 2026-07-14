# SwarmSim Strategy Autobuyer

Methodical Tampermonkey smart advisor/autobuyer for Swarm Simulator.

Current script version in `src/`: **8.1.0**.

The product vision, active game model, and distilled strategy knowledge live in
`docs/BOOK-00-vision-goals-and-dreams.md`, `docs/SWARMSIM_GAME_MODEL.md`, and
`docs/BOOK-01` through `docs/BOOK-06`, plus the current M7 contract and
verification docs. The running script now implements `8.1.0`.

## Repository layout

```text
src/
  SwarmSim-Strategy-Autobuyer.user.js       # current installable Tampermonkey source
dev-src/
  guards/                                   # modular lane guard scaffolds (non-executable)
  runtime-sections/                         # build sources for canonical runtime (runtime-main.js)
  overseer/                                 # modular coordinator scaffold (non-executable)
  contracts/                                # shared proposal contract scaffold
docs/
  BOOK-00-vision-goals-and-dreams.md       # strategic product north star
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
  build-canonical-userscript.js             # phase-4 build entrypoint (canonical userscript)
  canonical-build.config.json               # configured assembly parts for canonical userscript
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

## Build And Verify

Phase 4 bootstrap introduces a deterministic build/check entrypoint for the
canonical userscript without changing runtime behavior.

Commands:

```bash
npm run build:check
npm run build
npm run sync:from-canonical
npm run hotfix:canonical
npm run verify
```

`npm run verify` runs the active Laboratory, version, purchase-evaluator, and
guardrail checks.

## Strategy Audit SA1 matrix

The repository has official one-command entry points for the SA1 mid-game
breakpoint matrix:

```bash
npm run strategy:audit:matrix:sa1
npm run strategy:audit:matrix:sa1:single
npm run strategy:audit:matrix:sa1:isolated
```

The full command runs all configured SA1 breakpoint scenarios twice. The smoke
command runs every scenario once. These fast paths reuse one Chrome window,
browser context, and page for sequential runs. They fail on any run, reset
failure, or state leakage. The `:isolated` command preserves a new
Node process and Chrome instance per run for stronger final confirmation. All
variants write timestamped JSON and Markdown artifacts temporarily. Strategy
Audit findings are distilled into
`docs/BOOK-04-strategy-intelligence-findings.md`; raw run output is not
retained in the repository.

This Strategy Audit flow stress-tests strategy decisions across staged states.
It is separate from Laboratory's read-only counterfactual simulation and its
version checks and guardrails; it does not replace Laboratory verification. The
batch orchestration is a suitable pattern for a future Laboratory batch runner,
but that integration is not implemented by these commands.

## Dev Workflow (Fast + Safe)

Normal work:

1. Edit `dev-src/runtime-sections/runtime-main.js`
2. Run `npm run build`
3. Run `npm run verify`

Emergency hotfix directly in canonical script:

1. Edit `src/SwarmSim-Strategy-Autobuyer.user.js`
2. Run `npm run hotfix:canonical`

Equivalent explicit steps:

1. `npm run sync:from-canonical` to sync runtime back to `dev-src/`
2. `npm run build`
3. `npm run verify`

This keeps guardrails strict while still allowing fast app development when needed.

## Knowledge workflow

Start with `docs/strategy/BOOK00_CURRENT_STATUS.md`, then read the relevant Book
before opening verifier payloads or starting a new run.
Keep only the active verifier fixture and current claim-level evidence in Git;
distill new conclusions into the Books.
