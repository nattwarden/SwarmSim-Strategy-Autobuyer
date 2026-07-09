# docs

Project documentation, prompts, release notes, game model notes, and live logs.

## Active files

```text
SWARMSIM_GAME_MODEL.md                    # canonical active game model
HISTORY.md                                # summarized historical cleanup/version context
PR_CHECKLIST.md                           # PR checklist for AI-assisted changes
prompts/next-0.8.8-multi-lane-coordinator-territory-starvation.md
live-logs/2026-07-09-clean-start-game-observation.md
live-logs/2026-07-09-clicked-mechanics-progression.md
```

## Project posture

The active strategy direction is methodical optimization.

The bot is not cautious by identity. It should be logical, evidence-based, and
transparent. It should optimize normal progression when the math and selected
user mode support action.

Hard safety defaults remain in place for high-risk or irreversible automation,
such as ability auto-casts, Clone Larvae, House of Mirrors, auto-ascend,
Nightbug/Bat defaults, and blind buyMax behavior. These defaults are guardrails,
not an instruction to play timidly.

Future user-facing modes should distinguish:

- Advisor Mode: tips and explanations for manual play.
- Methodical Optimizer: default Smart behavior with rebuild/payback-aware buys.
- High-Tempo Optimizer: future explicit mode for pushing progression harder
  while preserving hard blockers and observability.

## Structure

```text
release-notes/
prompts/
live-logs/
```

## Source-of-truth note

Use `docs/SWARMSIM_GAME_MODEL.md` as the only active game model.

Older dated game model files and indexed AI snapshots are historical context
only. They should not be used as current strategy truth.

The current live/mechanics logs above are the active empirical context for
clean-start behavior, sacrifice/rebuild mechanics, Faster/Twin distinctions,
Hatchery/Expansion coupling, and military empower/suffix behavior.

## Verification annotation status

The following files include 2026-07-09 verification notes that mark claims as
`CONFIRMED`, `PARTIALLY CONFIRMED`, `HEURISTIC`, or `OPEN`:

```text
SWARMSIM_GAME_MODEL.md
live-logs/2026-07-09-clean-start-game-observation.md
live-logs/2026-07-09-clicked-mechanics-progression.md
../reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt
```

These notes should guide the next script review. Confirmed notes can be used as
strong evidence. Heuristic/Open notes should not drive automation without more
live-log or math validation.
