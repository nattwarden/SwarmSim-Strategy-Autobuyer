# SwarmSim Strategy Autobuyer 0.14.0

## What changed

- Added a Whole-Economy Shadow Preview that compares the best current Meat,
  Larva/Engine, and Army/Territory opportunity from one pre-execution snapshot.
- Council and Inspector now show the whole-economy winner, why alternatives
  wait, resource conflicts, opportunity cost, confidence, and likely switch
  conditions.
- Added bounded coordinator execution for supported reversible purchases. The
  selected action is revalidated immediately before execution and must retain
  the same canonical lane, action identity, target, variant, and bounded amount.
- Added truthful execution reporting: advice, authority, executed action,
  fingerprint match, refusal, and sequential-planner fallback are separate
  observable states.
- Fixed exact Engine and suffix-tier Territory resolution in the real
  `smartRunOnce` path. Focused acceptance now demonstrates a state where legacy
  ordering would buy Hatchery while the coordinator instead buys the stronger
  whole-economy Territory opportunity.

## Safety and scope

- Coordinator authority is limited to supported Meat, Larva/Engine, and
  Army/Territory purchases that pass existing safety gates.
- Low-confidence, blocked, unknown, changed, or failed-revalidation candidates
  remain advisory and fall back to the existing planners without pretending a
  coordinator purchase occurred.
- Ability auto-cast, Ascension, Clone Larvae, House of Mirrors, Nightbug, and
  Bat defaults are unchanged.
- Nexus and Energy protection remain enabled. Energy production, Energy
  abilities, Ascension, and Mutagen are not added to coordinator execution in
  this release.
- Laboratory remains manually triggered, read-only, and simulation-only.

## Verification

The release is gated by canonical build parity, 0.14.0 version-surface checks,
repository guardrails, Laboratory checks, Unified Purchase Evaluator contract
checks, and the focused Book00 Milestone 2 real-`smartRunOnce` acceptance.
Formal release evidence, if published, is recorded separately against the exact
implementation commit.
