# Council UI State Contract v1

Contract id: `council-ui-state.v1`

## Purpose

`CouncilUiState` is a read-only presentation snapshot. Full Council, Compact
Council, and Matrix summaries consume the same state. The adapter may read
canonical runtime values and calculate presentation-only fields, but it may not
make purchases, change configuration, or alter planner state.

## Top-level shape

```js
{
  schemaVersion: "council-ui-state.v1",
  generatedAt: "ISO-8601",
  source: SourceState,
  bot: BotState,
  strategy: StrategyState,
  decision: DecisionState,
  lanes: LaneState[],
  safety: SafetyState,
  availability: AvailabilityState
}
```

## SourceState

| Field | Type | Rule |
|-------|------|------|
| `scriptVersion` | string | copied from `SCRIPT_VERSION` |
| `strategyTimestamp` | ISO string or null | copied from inspector timestamp |
| `cycleId` | string or null | null until a monotonic runtime identity exists |
| `sourceKind` | `live-browser` or `scenario` | follows canonical source tag |
| `freshness` | `fresh`, `stale`, `loading`, `unavailable`, `error` | UI classification only |
| `ageMs` | non-negative number or null | generatedAt minus strategyTimestamp |
| `staleAfterMs` | positive number | presentation policy derived from run interval |

No fields from different non-null `cycleId` values may be combined.

## BotState

```js
{
  enabled: boolean,
  mode: "advisor" | "autobuyer",
  statusText: string,
  runEverySeconds: number | null
}
```

Mode normalization:

- `advisor` when `advisorOnly === true` or `autoBuySafeDecisions !== true`
- `autobuyer` only when `advisorOnly !== true` and
  `autoBuySafeDecisions === true`

## StrategyState

```js
{
  phase: { id: string | null, label: string },
  goal: { id: string | null, label: string },
  wholeEconomyWinner: { domain: string | null, actionText: string | null },
  activeSpeaker: string | null,
  protectedResources: string[] | null
}
```

Current phase, goal, and protected-resource sources are partly formatted text.
Their ids/typed array remain null until canonical typed values are emitted.

## DecisionState

```js
{
  decisionId: string | null,
  disposition: "recommend" | "execute" | "hold" | "observe" | "unavailable",
  recommendation: ActionState | null,
  selection: ActionState | null,
  reason: string | null,
  target: string | null,
  economics: EconomicsState,
  authority: AuthorityState,
  execution: ExecutionState,
  blocker: BlockerState | null
}
```

`recommendation` comes from the whole-economy winner. `selection` comes from
the coordinator execution decision. They must not be collapsed merely because
their labels look similar.

### ActionState

```js
{
  domain: string | null,
  lane: string | null,
  candidate: string,
  amount: string | null,
  executionKey: string | null,
  executionId: string | null,
  executionKind: string | null,
  executionVariant: string | null,
  fingerprint: string | null
}
```

Amounts remain strings because SwarmSim values may exceed safe JavaScript
integer precision.

### EconomicsState

Each metric uses this wrapper:

```js
{
  raw: number | string | null,
  display: string,
  unit: string | null,
  availability: "available" | "formatted-only" | "not-applicable" | "unavailable"
}
```

Required economics keys are `payback`, `eta`, `etaImprovement`, `reserveAfter`,
`reserveRequired`, and `reserveRecovery`. The UI renders `—` plus a useful
tooltip when unavailable; it never substitutes zero.

### AuthorityState

```js
{
  allowed: boolean,
  source: string | null,
  confidence: "high" | "medium" | "low" | "unknown",
  gatesPassed: string[],
  gatesFailed: string[],
  revalidation: "passed" | "failed" | "not-run" | "unknown",
  fallbackPlanner: string | null,
  fallbackReason: string | null
}
```

### ExecutionState

```js
{
  status: "not-attempted" | "attempted" | "completed" | "failed" | "unknown",
  matchedSelection: boolean | null,
  resultText: string | null,
  executedFingerprint: string | null
}
```

`completed` requires canonical evidence that execution occurred. A BUY
recommendation or authority alone is never displayed as a completed purchase.

### Blocker precedence

Choose the first non-empty source in this order:

1. coordinator gates failed
2. overseer hard guard
3. candidate blocker list
4. `blockedBySummary`
5. wait reason

Keep the original text and classify the UI severity separately.

## LaneState

One entry is emitted for `engine`, `energy`, `meat`, `territory`, `clone`,
`ability`, and `twin` even when unavailable.

```js
{
  id: string,
  label: string,
  decision: "buy" | "side" | "hold" | "observe" | "unavailable",
  candidate: string | null,
  reason: string | null,
  blockers: string[],
  current: MetricState,
  rate: MetricState,
  target: MetricState,
  progressPercent: number | null,
  nextMilestone: string | null
}
```

`progressPercent` is null unless the adapter has a domain-defined numerator and
denominator. It is not a decorative confidence score.

## SafetyState

The first version exposes, without changing:

- `autoCastAbilities`
- `autoAscend`
- `energySupportBrokerAllowAutoCast`
- Nexus/Energy protection state when available
- active protected resources
- strongest blocker severity

Hard safety defaults remain owned by runtime configuration and strategy.

## AvailabilityState

```js
{
  missing: string[],
  formattedOnly: string[],
  errors: Array<{ field: string, message: string }>
}
```

An adapter failure must degrade the affected field, not fabricate a value or
prevent Matrix Diagnostics from remaining usable.

## Determinism rules

- equal canonical input and equal `generatedAt` produce equal state
- mapping functions do not read wall-clock time except through `generatedAt`
- mapping functions do not mutate runtime objects
- display formatting is separate from raw values
- unknown enum input maps to `unavailable` or `unknown`, never to success

Example states live in `fixtures/council-ui-states.v1.json`.
