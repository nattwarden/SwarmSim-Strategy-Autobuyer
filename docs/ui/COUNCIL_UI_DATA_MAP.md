# Council UI Data Map

## Purpose

This is the preliminary traceability map between the Council mockup and runtime
truth. It is a UI1 work surface, not a claim that every field already exists.

Status vocabulary:

- **AVAILABLE?** — likely present; must be confirmed against canonical source
- **DERIVED** — presentation calculation requiring a documented formula
- **GAP** — no trusted source identified yet
- **DESIGN** — UI state or label, not strategy data

## Primary decision surface

| Visible information | Preliminary source | Status | Contract requirement |
|---------------------|--------------------|--------|----------------------|
| current action and quantity | whole-economy winner / active action unit | AVAILABLE? | stable action id, name, amount, unit |
| strategic reason | coordinator or planner reason | AVAILABLE? | structured reason plus display summary |
| current phase | strategy inspector phase | AVAILABLE? | stable phase id and label |
| strategic goal | configured/derived goal | AVAILABLE? | goal id, target, progress |
| payback estimate | candidate economics | AVAILABLE? | value, unit, validity, source action |
| reserve after action | post-purchase state estimate | DERIVED | formula and safety threshold |
| authority result | coordinator execution authority | AVAILABLE? | allowed/refused and reason |
| fallback planner | coordinator fallback identity | AVAILABLE? | planner id and selection reason |
| execution result | purchase/execution result | AVAILABLE? | attempted/completed/failed, timestamp |
| strongest blocker | lane/coordinator blocker | AVAILABLE? | typed blocker and severity |

## Council and lane summaries

| Visible information | Preliminary source | Status | Contract requirement |
|---------------------|--------------------|--------|----------------------|
| energy and Nexus protection | energy support / Nexus guard state | AVAILABLE? | protected, readiness, blocker |
| larvae and engine growth | larva lane / clone buffer state | AVAILABLE? | production, target, buffer mode |
| meat-chain action | meat lane active action | AVAILABLE? | current unit, next unit, progress |
| territory and expansion | territory/army lane | AVAILABLE? | readiness, next expansion, protection |
| twin and upgrade timing | threshold/upgrade candidates | AVAILABLE? | candidate, threshold, hold reason |
| long-term coordination | phase, goal, rebuild state | AVAILABLE? | summary and next transition condition |
| lane production rates | live game state | AVAILABLE? | exact value and formatted value |
| lane progress bars | target/current relationship | DERIVED | numerator, denominator, meaning |

## Chronicle events

| Event family | Existing input candidate | Status | Required event payload |
|--------------|--------------------------|--------|------------------------|
| recommendation | advisor decision/log | AVAILABLE? | decision id, action, reason, timestamp |
| hold | rejected or deferred candidate | AVAILABLE? | candidate, reason, release condition |
| warning | safety or timing state | AVAILABLE? | type, severity, affected domain |
| authority decision | coordinator result | AVAILABLE? | decision id, allow/refuse, reason |
| fallback | fallback planner selection | AVAILABLE? | decision id, planner, reason |
| purchase attempt | execution path | AVAILABLE? | decision id, action, requested amount |
| purchase completed | purchase log/result | AVAILABLE? | decision id, actual amount, resulting state |
| purchase failed | execution result | AVAILABLE? | decision id, error class, retry posture |
| info | state transition | GAP | typed transition and source |

## UI-only state

These values belong to the presentation contract and must not leak into planner
logic:

- active surface: Council, Compact, Chronicle, or Matrix
- Chronicle filter and expansion state
- selected council domain
- details expanded/collapsed
- loading, stale, disconnected, and render-error state
- reduced-motion and visual-density preferences

## Data freshness rules to define in UI1

Each live field needs:

- source cycle or timestamp
- current/stale/unavailable classification
- decision identity when it describes an action
- formatting rule and raw value where precision matters
- explicit behavior when fields from different cycles disagree

## Audit outcome format

For each row, UI1 should replace the preliminary source with the exact object
and field identity, confirm its lifecycle, and cite the relevant source or test.
Any missing value becomes a recorded GAP; it must not be synthesized silently.
