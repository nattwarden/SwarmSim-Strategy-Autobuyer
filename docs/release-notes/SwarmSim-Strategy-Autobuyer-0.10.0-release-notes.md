# SwarmSim Strategy Autobuyer 0.10.0 - Expansion-aware Army Seed Planner + Council Clarity

Date: 2026-07-10

## Summary

0.10.0 builds on the approved local 0.9.0 baseline.

This release adds a conservative Expansion-aware Army Seed planner that buys
bounded territory-producing army chunks only when the estimated next Expansion
ETA improves meaningfully. The release also improves Council clarity with a
highlighted active speaker bubble and more advisor-like language.

## What changed

### Expansion-aware Army Seed Planner

The Territory lane now evaluates army seed buys using Expansion impact, not only
legacy territory ROI phrasing.

New bounded planner settings:

- `expansionArmySeedPlanner: true`
- `expansionArmySeedMaxChunkPercent: 10`
- `expansionArmySeedMinEtaImprovementSeconds: 120`
- `expansionArmySeedMinEtaImprovementRatio: 0.05`
- `expansionArmySeedDoNotSpendInsideSaveWindow: true`

Behavior:

- Runs only when Expansion is relevant (post-Nexus or clear Expansion context).
- Holds territory spending inside Expansion save-window.
- Scans buyable territory-producing army units.
- Uses bounded chunks, never blind buyMax.
- Buys only when estimated Expansion ETA gain is meaningful.
- Reports concrete hold reasons when no candidate passes.

### Territory / Army observability

New fields were added and exported for Army Seed diagnostics:

- `expansionArmySeedCandidate`
- `expansionArmySeedDecision`
- `expansionArmySeedUnit`
- `expansionArmySeedAmount`
- `expansionArmySeedReason`
- `expansionArmySeedEtaBefore`
- `expansionArmySeedEtaAfter`
- `expansionArmySeedEtaGainSeconds`
- `expansionArmySeedEtaGainPercent`
- `expansionArmySeedTerritoryPerSecondBefore`
- `expansionArmySeedTerritoryPerSecondAfter`
- `expansionArmySeedBlockedBy`
- `expansionArmySeedInsideSaveWindow`
- `expansionArmySeedBestRejectedUnit`
- `expansionArmySeedBestRejectedReason`

Existing territory fields remain intact.

### Council clarity and active speaker

The Swarm Council now emphasizes advisor readability:

- clearer spoken advice per advisor
- short plain-English why text
- technical detail stays in expandable details
- active speaker bubble reflects current winning lane/action
- winning advisor card is visibly highlighted

New inspector/export state:

- `activeCouncilSpeaker`
- `councilWinningLane`
- `councilWinningCandidate`
- `councilFocusBubble`

### Companion wording clarity

UI wording now separates meanings more clearly:

- `Companion` for secondary lane actions
- `side-task` wording for side-task counts and clone-prep context

### House of Mirrors advisor clarity

Ability-prep language now distinguishes mirror requirements from general
territory army state:

- if territory army exists but HoM-preferred top units are missing, text now
  says so explicitly
- no House of Mirrors auto-cast was added

## Hard safety defaults preserved

Still preserved:

- `autoCastAbilities: false`
- `autoAscend: false`
- `saveEnergyForNexus: true`
- `energyPlanner: true`
- `cloneBufferPlanner: true`
- `cloneBufferProtectLarvae: true`
- no default House of Mirrors casts
- no default Clone Larvae casts
- no default Nightbug/Bat buys
- no blind buyMax in Smart mode

## What did not change

- Parent Step -> Parent Refill logic
- anti-pingpong refill allowance
- active action unit payback bypass
- Twin Prep meaningful gate and thresholds
- Post-Nexus Lepidoptera stop-threshold behavior
- ability casting behavior (still advisor-only by default)
- auto-ascend behavior
- Nightbug/Bat storage planner behavior
