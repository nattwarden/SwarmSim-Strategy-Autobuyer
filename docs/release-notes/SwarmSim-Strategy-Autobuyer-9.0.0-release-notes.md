# SwarmSim Strategy Autobuyer 9.0.0

## Critical fix

- Fixed a regression where the Autobuyer could observe and advise but never
  actually buy anything in live play (Autobuyer mode). `m6DecisionOwnsMainCycle`
  was hardcoded `true`, which disabled every proven legacy purchase path
  (Larva engine, Energy, Clone buffer, Meat unlock planner, Smart upgrades,
  Smart units), leaving purchases entirely dependent on the M6 six-domain
  coordinator's execution-authority gate — a gate that only Territory
  proposals could ever satisfy. Legacy per-lane execution is restored as the
  acting purchaser; M6 still claims execution for any lane it can legitimately
  win under its own comparability rules.

## Milestone 9

Milestone 9 (resource-scoped save locks) is closed.

### Player-visible behavior

- An active save window (for example Territory protected for Expansion) now
  demonstrably blocks only the protected resource. Meat, Larva, Energy, and
  Upgrade purchases that do not spend the protected resource continue to
  execute in the same cycle instead of the bot going globally quiet.

### Safety and authority

- No new runtime behavior was required: the existing protected-resource guard
  was already scoped to the specific resource a candidate spends, not a
  global switch. This release adds a focused acceptance check
  (`check:book00:m9:resource-locks`) that proves the contract holds.
- Hard irreversible defaults remain unchanged. Ability, Ascension, and
  Mutagen remain advisor-only and non-executable. Auto-cast and auto-ascend
  remain off by default.

### Verification

- Added focused checker: `check:book00:m9:resource-locks`
- Verify chain now checks `check:book00:m9:resource-locks`
- Version-surface checker renamed to `check:9.0.0:versions`
