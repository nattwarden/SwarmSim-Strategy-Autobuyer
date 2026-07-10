# SwarmSim Strategy Autobuyer - Timeless ChatGPT Repo Context

Purpose: give any new AI chat enough stable context to enter the project safely without freezing a version, commit, or temporary task into this file.

This file is orientation only. It is never the source of truth for the current version, latest commit, active bug, current verdict, or next work item. Those facts must always be read from Git.

## Core rule: Git is the truth

Always determine the current state from the repository itself.

Do not trust:

- version numbers remembered from a previous chat
- old pasted reports without verification
- uploaded script copies
- stale release notes taken out of context
- line numbers from an earlier commit
- this file for current status

Before reasoning about current work:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
git log -10 --oneline
git rev-parse HEAD
git rev-parse origin/main
```

Then verify the active state from the files and commits currently on `main`.

## What this repository is

This project contains a Tampermonkey userscript for Swarm Simulator.

The project is a methodical, evidence-based advisor/autobuyer with explicit safety boundaries and strong observability. It should optimize ordinary reversible progression when the math and selected user mode support action. Safety defaults are not a mandate for passivity.

## Canonical sources

Read these as the stable source map:

- Repo/process guard: `AGENTS.md`
- AI orientation and work rules: `AI.md`
- Active game/strategy model: `docs/SWARMSIM_GAME_MODEL.md`
- Executable userscript: `src/SwarmSim-Strategy-Autobuyer.user.js`
- Runtime assembly source: `dev-src/runtime-sections/runtime-main.js`
- Build assembly configuration: `scripts/canonical-build.config.json`
- Laboratory contract: `docs/laboratory/SWARMSIM_LABORATORY_PHASE_1.md`
- Release history: Git commits, tags, `docs/HISTORY.md`, and `docs/release-notes/`
- Empirical evidence: `docs/live-logs/` and versioned files under `docs/test-data/`
- Active implementation handoffs: relevant files in `docs/prompts/`

`src/SwarmSim-Strategy-Autobuyer.user.js` is the only executable userscript. Runtime work may be authored in the configured assembly source and then regenerated into `src/`; inspect the build configuration before editing so the real source is changed rather than only a generated artifact.

## Required reading order for a new AI chat

Before proposing or changing code, read:

1. `AGENTS.md`
2. `AI.md`
3. `docs/SWARMSIM_GAME_MODEL.md`
4. `scripts/canonical-build.config.json`
5. `docs/laboratory/SWARMSIM_LABORATORY_PHASE_1.md` when Laboratory work is relevant
6. the latest relevant handoff/work order in `docs/prompts/`
7. the latest relevant release notes and live evidence
8. `dev-src/runtime-sections/runtime-main.js`
9. `src/SwarmSim-Strategy-Autobuyer.user.js`
10. relevant verifier scripts and `package.json`

Search by function, constant, schema, and test name. Do not rely on old line numbers.

## How to determine the current task

The current task is not stored in this timeless context file.

Resolve it from, in order:

1. the user's latest instruction
2. the latest report the user supplies
3. the current Git history on `main`
4. the relevant work order in `docs/prompts/`
5. current release notes, evidence, and open verification gaps

If the user supplies a Copilot/Codex report, treat it as a claim to audit, not as proof. Verify commits, diffs, files, tests, evidence, `main`, and working-tree status before accepting its verdict.

## Stable project posture

Use these meanings:

- Advisor Mode: explain opportunities, risks, and timing for manual play.
- Methodical Optimizer: default Smart behavior; goal-driven, rebuild/payback aware, and willing to act when evidence supports it.
- Higher-tempo modes: explicit future/user-selected behavior only, still observable and still bounded by hard safety rules.

Do not interpret “optimize harder” as permission to enable irreversible or high-risk automation.

## Hard safety defaults

These must remain off by default unless the user explicitly authorizes a change:

```text
autoCastAbilities = false
autoAscend = false
energySupportBrokerAllowAutoCast = false
```

Also preserve these stable boundaries unless explicitly changed:

- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat auto-buy
- Nexus/Energy protection remains enabled
- no blind aggressive buyMax behavior in default Smart mode
- Laboratory remains manually triggered, gated, read-only, and simulation-only

## Narrow-change rule

For every patch:

- fix only the named issue
- do not add unrelated strategy
- do not widen automation
- do not change safety thresholds unless explicitly requested
- avoid unrelated refactors
- keep observability aligned with behavior
- keep scenario/test fixtures honest
- never rewrite expectations merely to force a pass
- preserve Decimal precision
- preserve deterministic hashes and non-mutation guarantees where applicable

## Repository hygiene

Do not create:

- `.txt` mirrors of the userscript
- duplicate executable `.user.js` files
- duplicate release trees
- byte-identical userscript copies outside `src/`

Do not force-push or rewrite history.

Use the repository workflow currently authorized by the user and documented in `AGENTS.md`. When the user explicitly directs work on `main`, keep commits small, scoped, and normally pushed.

## Validation discipline

Never claim completion from one narrow check alone.

Start with the commands required by `AGENTS.md`, `AI.md`, `package.json`, and the active work order. Typical validation includes:

```bash
node scripts/validate-repo-guardrails.js
npm run build
npm run verify
git diff --check
```

Then run every versioned verifier relevant to the changed subsystem.

For formal acceptance, verify:

- version surfaces are aligned
- generated userscript matches runtime source
- required browser fixtures pass
- deterministic regression passes in required orders
- evidence is committed
- safety defaults remain unchanged
- no cast, buy, save, or unintended mutation occurred
- `HEAD` matches `origin/main`
- working tree is clean

## Evidence hierarchy

Prefer evidence in this order:

1. current runtime behavior from a read-only live capture
2. deterministic browser/scenario verification
3. source-verified game formulas and pinned provenance
4. committed JSON/CSV/Markdown evidence
5. release notes and summaries
6. agent reports

A report is not stronger than the underlying committed evidence.

## Handoff rule between chats

A new chat should receive:

- this timeless context file
- the user's latest Copilot/Codex report
- a task-specific opening prompt telling the new chat what to verify first

The opening prompt may contain current versions and SHAs. This timeless file should not.

## One-sentence orientation

Treat Git `main` as the only current truth; read `AGENTS.md`, `AI.md`, the active game model, build configuration, relevant prompt/evidence, and current runtime source; audit reports before accepting them; keep fixes narrow; preserve safety defaults; and optimize methodically rather than passively.
