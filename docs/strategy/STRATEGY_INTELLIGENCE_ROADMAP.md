# Strategy Intelligence Roadmap

## Current status

Current verified runtime: 0.12.3
Current repository baseline: 132abd6be782f2d6f5bcc99c3e239ff741a6fdbb
Current strategy status: unchanged from pre-Laboratory baseline
Laboratory status: live effective-count capture verified

Laboratory is currently strongest as a controlled evidence and comparison
system for a narrow ability subset. Its primary comparison set so far is:

- WAIT
- CLONE_LARVAE
- HOUSE_OF_MIRRORS

Laboratory is not yet a general strategic scorer for all normal purchase and
multi-lane progression decisions.

## Product north star

Over time, Council and planning systems should be able to show:

- Chosen action
- Active goal
- Best legal alternatives
- Why the winner won
- Expected progress over defined horizons
- Hard blockers
- When the decision should be reconsidered

## Proposed roadmap

- 0.12.3
  - Verified technical foundation
- Strategy Audit 0
  - Early-game behavioral baseline from staged deterministic states
- Strategy Audit 1
  - Mid-game multi-lane decision quality
- 0.12.4
  - Only if an audit identifies one narrow concrete strategy defect
- 0.13.0
  - Counterfactual Strategy Advisor / Strategy Intelligence foundation

## 0.13.0 direction (exploratory, not committed implementation)

This is a possible larger future phase, not an already approved implementation
plan for the current task.

Potential capabilities:

- Compare the chosen buy against the most relevant legal alternatives.
- Show estimated impact over 1 and 5 minutes, and potentially later over 30
  minutes where justified.
- Distinguish short-term production gains from direct goal progression.
- Compare guidance across Meat, Engine, Territory, Energy, and Ability lanes.
- Keep auto-cast disabled by default.
- Keep auto-ascend disabled by default.
- Preserve hard safety blockers.
- Avoid optimizing only for immediate raw production.

## User modes (direction only)

Planned direction remains:

- Advisor Mode
- Methodical Optimizer
- High-Tempo Optimizer

These are documented as strategy direction only in this docs phase. They are
not implemented in this task.
