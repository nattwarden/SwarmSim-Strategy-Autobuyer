# 0.11.2 Deterministic Scenario Summary

- Run at: 2026-07-10T01:51:13.228Z
- Source: deterministic-scenario
- Script version: 0.11.2
- Invariants: 16 pass / 11 fail / 27 total

## H1 - All preferred HoM units missing
- Source: deterministic-scenario
- Cycle 1: PASS

## H2 - Preferred units become present between eval cycles
- Source: deterministic-scenario
- Cycle 1: FAIL
	- h2-no-missing-reason: expected notIncludes mirror-preferred units missing, got mirror-preferred units missing: Culicimorph V, Arachnomorph V, Stinger V
- Cycle 2: PASS

## H3 - Only one preferred HoM unit missing
- Source: deterministic-scenario
- Cycle 1: PASS

## H4 - Readiness passed but payoff not meaningful
- Source: deterministic-scenario
- Cycle 1: FAIL
	- h4-hold: expected HOLD, got ADVISE

## H5 - Clear HoM payoff opportunity
- Source: counterfactual-projection
- Cycle 1: FAIL
	- h5-best-use: expected house-of-mirrors, got clone-larvae
	- h5-speaker: expected General Mandible, got Larva Steward

## H6 - HoM visible but no meaningful territory army
- Source: deterministic-scenario
- Cycle 1: FAIL
	- h6-army-gate: expected includes no territory army exists, got mirror-preferred units missing: Culicimorph V, Arachnomorph V, Stinger V

## R1 - Expansion save-window priority
- Source: deterministic-scenario
- Cycle 1: PASS

## R2 - Lepidoptera background role
- Source: counterfactual-projection
- Cycle 1: FAIL
	- r2-role: expected background, got hold

## R3 - Lepidoptera primary role
- Source: counterfactual-projection
- Cycle 1: FAIL
	- r3-role: expected primary, got hold
	- r3-advisor: expected Beetle Magus, got Larva Steward

## R4 - Clone Larvae safe but below threshold
- Source: deterministic-scenario
- Cycle 1: FAIL
	- r4-clone-hold: expected HOLD, got empty
	- r4-threshold: expected includes benefit below meaningful threshold, got empty

## R5 - Clone Larvae meaningful
- Source: counterfactual-projection
- Cycle 1: FAIL
	- r5-clone-ready: expected ADVISE/READY, got empty

## R6 - Twin prep under meaningful gate
- Source: counterfactual-projection
- Cycle 1: PASS

## R7 - Twin prep over meaningful gate
- Source: counterfactual-projection
- Cycle 1: PASS

## R8 - Parent Step then Parent Refill over two cycles
- Source: deterministic-scenario
- Cycle 1: PASS
- Cycle 2: PASS

