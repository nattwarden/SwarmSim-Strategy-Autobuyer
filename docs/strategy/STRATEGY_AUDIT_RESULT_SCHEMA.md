# Strategy Audit Result Schema

This document defines the minimum required output schema for Strategy Audit
captures.

## Required metadata

- auditId
- stateId
- stateRevision
- scriptVersion
- repositoryCommit
- scenarioHash
- initialStateHash
- cycleNumber
- capturedAt

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
- bestRejectedAlternative
- rejectionReasons
- laneProposals

## Progress data

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

## Per-cycle assessment

Each captured cycle must include one classification label:

- GOOD
- QUESTIONABLE
- BAD
- INCONCLUSIVE

Each cycle must also include a short human-readable justification.

## Guiding principle

Audit interpretation must not only ask whether production increased.

It must also ask:

- Did the active goal move closer?
- Were protected resources consumed?
- Was a more important goal delayed?
- Was there a better legal alternative?
- Did the planner repeat behavior without relevant progress?
- Did Council, Inspector, and executed action remain consistent?
