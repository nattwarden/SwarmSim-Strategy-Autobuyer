# Council UI Data Map

## Purpose

This is the audited traceability map between the Council UI and canonical
runtime truth. The audit was performed against the configured runtime assembly
source `dev-src/runtime-sections/runtime-main.js` on 2026-07-13.

Availability vocabulary:

- **AVAILABLE** — the canonical runtime already exposes a suitable value
- **PARTIAL** — related data exists, but normalization or identity is missing
- **DERIVABLE** — can be calculated in a presentation adapter without strategy
- **GAP** — requires new observability or state capture
- **DESIGN** — presentation state; must not enter planner logic

## Audited runtime surfaces

| Runtime surface | Existing contract | UI consequence |
|-----------------|-------------------|----------------|
| `buildStrategyInspector(...)` | one rich snapshot per Smart run | primary input for Council state |
| `buildUnifiedPurchaseEvaluator(...)` | evaluated candidates and `whole-economy-outcome.v2` | raw payback, ETA, reserve, confidence |
| `wholeEconomyExecutionDecisionState` | `whole-economy-execution-decision.v1` | authority, revalidation, fallback, result |
| `summarizeDecisionLanes(...)` | best candidate for each named lane | council-card summaries |
| `recordAdvisor(...)` / `advisorLog` | locale time, decision, title, reason | useful legacy input; insufficient Chronicle identity |
| `recordPurchase(...)` / `purchaseLog` | locale time, type, name, amount | useful legacy input; insufficient causal identity |
| `recordRunHistoryEntry(...)` / `runHistory` | ISO timestamp and planner snapshot subset | historical trend input, not an event stream |
| `compactConfigSummary()` | mode and safety configuration subset | mode and protection display |
| `getScenarioStateSnapshot(...)` | resources and production rates | proves rates are readable, but only captured for scenarios |

## Primary decision surface

| Visible information | Exact canonical source | Availability | UI1 mapping rule |
|---------------------|------------------------|--------------|------------------|
| recommendation | `strategyInspector.wholeEconomyBest*` | AVAILABLE | map separately from execution |
| executable selection | `strategyInspector.coordinatorSelected*` | AVAILABLE | use only with coordinator authority state |
| action amount | `coordinatorSelectedAmount`; evaluator `winner.amount` | AVAILABLE | keep source string; do not coerce large Decimal text |
| phase | `strategyInspector.phase` | AVAILABLE | presentation label; stable phase id is still missing |
| strategic goal | `strategyInspector.goal` | AVAILABLE | display text; stable goal id is PARTIAL |
| reason | `wholeEconomyBestReason` / `coordinatorSelectedReason` | AVAILABLE | choose according to recommendation vs execution context |
| target | `wholeEconomyBestTarget` | AVAILABLE | use `null` when runtime says `none` |
| payback | `purchaseEvaluator.winner.sharedOutcome.paybackSeconds` | AVAILABLE | raw seconds plus separately formatted text |
| reserve after | evaluator winner `sharedOutcome.reserveAfter` | AVAILABLE | raw numeric value where emitted; include unit/resource |
| reserve required | evaluator winner `sharedOutcome.reserveRequired` | AVAILABLE | never invent when `null` |
| readiness/ETA | evaluator winner `sharedOutcome.etaSeconds` | AVAILABLE | raw seconds; presentation adapter formats duration |
| authority | `coordinatorExecutionAuthority`, gates, confidence | AVAILABLE | normalize string booleans at adapter boundary |
| revalidation | `coordinatorRevalidationStatus` | AVAILABLE | show before an attempted execution result |
| fallback | `coordinatorFallbackPlanner` and reason | AVAILABLE | show only when coordinator authority is false |
| execution result | `coordinatorExecuted`, result, label, matched execution | AVAILABLE | separate attempt/completed/failed states |
| strongest blocker | hard guard, `blockedBySummary`, gate failures | DERIVABLE | deterministic precedence defined in state contract |
| decision correlation id | no current field | GAP | required before causal Chronicle implementation |

## Council and lane summaries

| Visible information | Exact canonical source | Availability | UI1 mapping rule |
|---------------------|------------------------|--------------|------------------|
| active speaker | `activeCouncilSpeaker` | AVAILABLE | optional presentation enhancement |
| winning lane/candidate | `councilWinningLane`, `councilWinningCandidate` | AVAILABLE | describes selected legacy/coordinator lane action |
| per-lane decision | `strategyInspector.lanes[]` | AVAILABLE | normalize `BUY`, `HOLD`, `SIDE`, `OBSERVE` |
| per-lane best candidate | `laneBestByName` / `lanes[].candidate` | AVAILABLE | retain blockers and observations |
| protected resources | `protectedResources` | PARTIAL | currently formatted text, not a typed resource array |
| Energy/Nexus state | whole-economy Energy fields, `nexus`, energy support fields | AVAILABLE | group without changing Energy authority |
| larvae/clone buffer | `cloneBuffer*` fields | AVAILABLE | source contains formatted values and explicit lock state |
| meat-chain action | `meatActionUnit*`, parent/refill/unlock fields | AVAILABLE | distinguish target, action unit, parent step, refill |
| territory/expansion | `territoryPrep*`, `expansionArmySeed*` | AVAILABLE | retain save-window and blocker fields |
| twin timing | `twinUnlock*` | AVAILABLE | progress can derive from current/required if raw-compatible |
| production rates | `getVelocity(game, resource)` | PARTIAL | readable live; not in `strategyInspector` or UI contract |
| current resource banks | `getCurrentResource(game, resource)` | PARTIAL | readable live; not in `strategyInspector` or UI contract |
| lane progress percent | candidate raw progress or domain-specific fields | DERIVABLE | only show when numerator and denominator have defined meaning |

## Bot and freshness state

| Visible information | Exact canonical source | Availability | UI1 mapping rule |
|---------------------|------------------------|--------------|------------------|
| enabled/running | `config.enabled`, `lastStatus` | AVAILABLE | enabled is not proof that a fresh run succeeded |
| Advisor/Autobuyer | `config.advisorOnly`, `config.autoBuySafeDecisions` | AVAILABLE | normalize to one explicit mode enum |
| script version | `SCRIPT_VERSION` / export `scriptVersion` | AVAILABLE | include in source metadata |
| strategy timestamp | `strategyInspector.timestamp` | AVAILABLE | ISO source timestamp |
| source cycle id | no current monotonic cycle identity | GAP | needed to reject mixed-cycle state |
| stale threshold | `config.runEverySeconds` can inform threshold | DERIVABLE | UI policy, never a planner gate |
| loading/disconnected/error | no unified state | GAP | adapter must catch and classify data access failures |

## Chronicle audit

| Event family | Existing source | Availability | Gap before Chronicle |
|--------------|-----------------|--------------|----------------------|
| recommendation/hold | `advisorLog` | PARTIAL | locale-only time; no event or decision id |
| authority decision | inspector coordinator fields | PARTIAL | snapshot only; not appended as an event |
| fallback | inspector fallback fields | PARTIAL | snapshot only; no correlation id |
| purchase completed | `purchaseLog` | PARTIAL | no ISO timestamp or originating decision id |
| purchase failed | coordinator execution result | PARTIAL | latest snapshot only |
| safety warning | blockers/live diagnostics | PARTIAL | no typed emitted event |
| state transition | `runHistory` | PARTIAL | retains runs, not typed domain transitions |

The three current histories cannot be merged reliably after the fact. UI4 must
emit `CouncilTimelineEvent` records at the point where each decision or result
occurs. Legacy logs remain available for Matrix Diagnostics.

## Presentation-only state

The following is **DESIGN** state:

- active Council, Compact, Chronicle, or Matrix surface
- Chronicle filter, scroll, and expansion state
- selected council domain
- collapsed technical details
- reduced-motion and visual-density preferences
- loading skeleton and last-render error

## Audit conclusion

The mockup does not require new strategy behavior. It does require:

1. a pure adapter from current runtime snapshots to `council-ui-state.v1`
2. live resource/rate capture in that adapter
3. a monotonic cycle/decision identity
4. event emission conforming to `council-timeline-event.v1`

Until those adapters exist, unavailable raw values remain `null` with an
explicit availability reason. Display strings must never be parsed back into
strategy numbers.
