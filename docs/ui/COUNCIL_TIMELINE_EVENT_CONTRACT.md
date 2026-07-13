# Council Timeline Event Contract v1

Contract id: `council-timeline-event.v1`

## Purpose

The Council Chronicle is an append-only sequence of typed events. Events are
created when the underlying decision or result occurs. They are not reconstructed
afterward by joining advisor, purchase, and run-history text.

## Event shape

```js
{
  schemaVersion: "council-timeline-event.v1",
  eventId: string,
  decisionId: string | null,
  timestamp: "ISO-8601",
  sequence: number,
  type: EventType,
  severity: "info" | "success" | "warning" | "error",
  mode: "advisor" | "autobuyer",
  domain: string | null,
  lane: string | null,
  action: ActionRef | null,
  summary: string,
  detail: string | null,
  reason: { code: string | null, text: string | null },
  economics: object | null,
  result: object | null,
  source: { kind: string, cycleId: string | null }
}
```

## EventType

- `recommendation`
- `hold`
- `warning`
- `authority-allowed`
- `authority-refused`
- `fallback-selected`
- `purchase-attempted`
- `purchase-completed`
- `purchase-failed`
- `state-transition`
- `info`

## Identity and ordering

- `eventId` is globally unique within retained Chronicle history.
- All events caused by one planner decision share `decisionId`.
- `sequence` is monotonic and breaks equal-timestamp ties.
- A purchase-completed event must reference the decision that authorized or
  selected it.
- Events without a decision relationship use `decisionId: null`.

Until runtime supplies these identities, legacy log rows cannot be promoted to
fully trusted Chronicle events.

## ActionRef

```js
{
  candidate: string,
  amount: string | null,
  executionId: string | null,
  executionKind: string | null,
  executionVariant: string | null,
  fingerprint: string | null
}
```

## Required chains

Autobuyer success:

```text
recommendation → authority-allowed → purchase-attempted → purchase-completed
```

Coordinator refusal with legacy fallback:

```text
recommendation → authority-refused → fallback-selected → optional purchase chain
```

Advisor-only recommendation:

```text
recommendation → authority-refused(reason=advisor-only)
```

Hold:

```text
hold → optional state-transition when its release condition changes
```

## Filter mapping

| Chronicle filter | Included types |
|------------------|----------------|
| All | every event |
| Decisions | recommendation, hold, authority-allowed, authority-refused, fallback-selected |
| Purchases | purchase-attempted, purchase-completed, purchase-failed |
| Warnings | warning plus events with warning/error severity |

## Retention and deduplication

- Retention count is a UI/runtime policy, not part of decision logic.
- Repeated holds may be coalesced visually only when type, reason code, action,
  lane, and decision disposition match.
- Source events remain immutable; visual coalescing does not rewrite history.
- Failed and completed purchases are never coalesced together.

## Legacy compatibility

`advisorLog`, `purchaseLog`, and `runHistory` continue to support Matrix
Diagnostics and exports. During migration they may produce explicitly marked
`legacy-info` presentation rows, but those rows must not pretend to have a
decision correlation that the source lacks.

Example chains live in `fixtures/council-timeline-events.v1.json`.
