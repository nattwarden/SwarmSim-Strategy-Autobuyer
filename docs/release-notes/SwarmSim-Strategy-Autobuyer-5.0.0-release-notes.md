# SwarmSim Strategy Autobuyer 5.0.0

## Version policy

Milestone-aligned major versioning continues from M4. This release starts
Milestone 5 at `5.0.0` without relabeling historical evidence.

## What changed

- Added an advisor-only Ascension and Mutagen advisor that compares
  `CONTINUE_RUN` and `ASCEND_NOW` from one immutable snapshot.
- Added source-verified Ascension and Mutagen formula surfaces:
  - Ascension penalty base `1.12`
  - Ascension cost parity fields from runtime methods
  - Unlock-cost progression `15625^n`
  - Generic source-verified mutation helper formulas (`logStat`, `asympStat`,
    `expStat`)
- Added recovery-aware recommendation semantics:
  - `ASCEND_NOW` requires legal state, positive benefit, recovery evidence,
    break-even inside horizon, and sufficient confidence
  - missing honest recovery evidence returns `UNCERTAIN` with a concrete
    reconsider condition
- Added a Mutagen plan contract that always includes `KEEP_UNALLOCATED` and
  directly compares Hatchery Mutation only when direct larva inputs resolve.
- Added visibility for all other mutation effects with explicit unranked status
  until their cross-domain value models are supported.
- Added inspector/export/API observability fields for the M5 advisor and a
  diagnostic-only API at `window.kbcSwarmBot.ascensionMutagenAdvisor`.

## Safety and scope

- Advisor remains `executionAuthority: false`.
- No Ascension command is invoked from the advisor.
- No Mutagen spending or allocation command is invoked from the advisor.
- `autoAscend`, `autoCastAbilities`, and
  `energySupportBrokerAllowAutoCast` defaults remain unchanged.
- Nightbug/Bat auto-buy remains unchanged.
- Nexus and Energy protection remain unchanged.
- Laboratory remains gated, read-only, simulation-only.
