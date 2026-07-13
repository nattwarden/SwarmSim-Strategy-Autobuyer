# SwarmSim Strategy Autobuyer 0.13.0

## What changed

- Added a Unified Purchase Evaluator that compares Engine, Energy, Meat, and
  Territory proposals from the same pre-execution snapshot.
- The highest-ranked allowed proposal can execute as the first reversible
  purchase of the cycle through the existing lane-specific guards.
- Added Laboratory Phase 2A simulation actions for waiting and Larva, Meat,
  and Territory Rush projections using formulas derived from the pinned game
  source.
- Added an advisor-only Energy Opportunity Report covering projected resource
  gain, reserve recovery, Clone Larvae and House of Mirrors delay, cap waste,
  and Expansion timing.
- Added Inspector and public diagnostic surfaces for proposal ranking and
  selection reasons.

## Safety and scope

- Ability auto-cast, Ascension, Clone Larvae, House of Mirrors, Nightbug, and
  Bat defaults are unchanged.
- Nexus and Energy protection remain enabled.
- Laboratory remains manually triggered, read-only, simulation-only, and
  protected by live-state non-mutation checks.
- This release does not add blind buyMax behavior or automate irreversible
  actions.

## Verification

The release is gated by canonical build parity, repository guardrails, the
existing Laboratory live verifier, version-surface checks, source-math checks,
Unified Purchase Evaluator checks, and whitespace validation. Formal evidence
is recorded separately against the exact implementation commit.
