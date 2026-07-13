# SwarmSim Strategy Autobuyer 4.0.0

## Version policy

Starting with this release, the major version follows the active BOOK-00 milestone.
Milestone 4 begins at `4.0.0`; compatible feature and fix releases within M4 use
the minor and patch positions. The completed Milestone 3 history and its verified
`0.14.1` evidence remain unchanged rather than being relabeled retroactively.

## What changed

- Added an advisor-only Energy ability timing contract that compares casting with
  an explicit WAIT/save alternative from one immutable snapshot and milestone.
- Initial supported scope is Clone Larvae, House of Mirrors, Larva Rush, Meat
  Rush, and Territory Rush. Swarmwarp remains excluded until its formula is
  source-verified.
- Every recommendation reports projected gain, Energy reserve impact, measured
  delay to another aligned supported ability, confidence, passive-only
  post-action policy, and the condition that should trigger reconsideration.
- Added Inspector, export, and public diagnostic API surfaces for the timing
  recommendation plus focused deterministic acceptance coverage.

## Safety and scope

- The advisor has `executionAuthority: false`; it cannot cast an ability.
- Ability auto-cast and Energy Support Broker auto-cast defaults remain disabled.
- No downstream purchases or follow-up casts are invented in projections.
- Nexus and Energy protection, Nightbug/Bat exclusions, auto-Ascension, and the
  gated read-only Laboratory contract are unchanged.
