# Strategy Audit Result Schema

This document defines the minimum required output for Strategy Audit captures.

## Audit metadata

- auditId
- stateId
- stateRevision
- scriptVersion
- repositoryCommit
- scenarioHash
- initialStateHash
- cycleNumber
- capturedAt

## Environment provenance

- gameSourceKind
- gameSourceUrl
- gameSourceCommit
- gameBuildVersion
- browserKind
- browserVersion
- browserMode
- userscriptPath
- userscriptBlobSha
- userscriptContentSha256
- injectionMode
- profileKind
- networkMode

## State construction and isolation

- stateSetupMethod
- stateMutationManifest
- stateMutationManifestHash
- preResetStateHash
- initialStateHash
- postScenarioStateHash
- resetMethod
- resetVerified
- stateLeakageDetected

The mutation manifest must describe the question presented to the planner. It must not contain injected planner output.

## Planner data

- activePhase
- activeGoal
- activeTarget
- selectedLane
- selectedDecision
- selectedAction
- selectedUnit
- selectedAmount
- selectedReason
- hardBlockers
- softBlockers
- actionBudget

## Alternatives data

- legalAlternatives
- rejectedAlternatives
- bestLegalAlternative
- bestRejectedAlternative
- rejectionReasons
- laneProposals

## Progress data

- goalMetricName
- goalMetricBefore
- goalMetricAfter
- goalMetricDelta
- resourceBankBefore
- resourceBankAfter
- productionBefore
- productionAfter
- targetEtaBefore
- targetEtaAfter
- meaningfulProgress

## Consistency data

- councilMatchesPlanner
- inspectorMatchesPlanner
- exportMatchesPlanner
- selectedActionActuallyExecuted
- stateTransitionMatchesReport

## Visual artifacts

- headed
- screenshotPaths
- videoPath
- tracePath
- browserLeftOpenOnFailure

## Per-cycle assessment

Each cycle must include one label:

- GOOD
- QUESTIONABLE
- BAD
- INCONCLUSIVE

Each label requires a short human-readable justification.

## Interpretation questions

- Did the active goal move closer?
- Were protected resources consumed?
- Was a more important goal delayed?
- Was there a better legal alternative?
- Did behavior repeat without relevant progress?
- Did Council, Inspector, exports, and execution agree?
- Was the state construction reproducible?
- Was reset verified and free of leakage?
- Can Sofie inspect the same cycle visually when needed?
