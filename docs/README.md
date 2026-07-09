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
