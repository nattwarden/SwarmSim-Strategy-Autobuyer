# BOOK-00 Milestone 10 - Council Timeline and Decision Replay Foundation

Status: implementation-ready handoff contract; this document adds no runtime
behavior by itself.

Target release: `10.0.0`

Baseline:

- accepted M9 implementation/evidence SHAs must be recorded before M10 starts;
- Council UI3 and fixed-window behavior remain required baseline functionality;
- hard safety defaults remain unchanged.

## 1. Product outcome

M10 adds first-class timeline observability so players can inspect why the bot
waited, held, bought, or recommended an advisor action across recent cycles.

Player-facing release sentence:

> The Council now shows a decision timeline with cycle-by-cycle reasons,
> blockers, and key metric changes.

## 2. Problem M10 closes

Current snapshots can explain the latest state, but not the short historical
sequence that produced repeated waits/holds or sudden decision changes.

This makes verification and player trust harder than necessary.

## 3. Scope

### Included

- timeline data model for recent cycles;
- Council timeline UI section and replay comparison view;
- cycle-level fields for decision type, lane, candidate, blockers, and key
  before/after metrics;
- focused UI and consistency checks.

### Excluded

- ability auto-cast execution;
- auto-ascend execution;
- new execution keys;
- strategy ranking redesign.

## 4. Contract rules

### 4.1 Timeline row minimum schema

Each timeline row must include:

- `timestamp`;
- `cycleNumber`;
- `decisionType` (`WAIT|HOLD|BUY|PLAN|SIDE`);
- `selectedLane`;
- `selectedCandidate`;
- `reason`;
- `hardBlockers`;
- `protectedResources`;
- `authorityState`.

### 4.2 Replay comparison

A two-cycle compare mode must show at minimum:

- what changed in decision/lane/candidate;
- blocker changes;
- key metric deltas (when available).

### 4.3 Consistency

Timeline content must reflect the same canonical cycle data used by Inspector
export and strategy diagnostics. No synthetic text-only timeline source.

## 5. Observability requirements

Council/Inspector alignment must preserve:

- selected decision and lane identity;
- blocker identity and ordering;
- protected-resource identity;
- authority visibility (advisor-only vs executable).

## 6. Focused acceptance

Minimum focused groups:

1. `timeline-renders-recent-cycles`
2. `timeline-vs-inspector-field-consistency`
3. `timeline-replay-diff-shows-change`
4. `advisor-only-vs-execution-marking`
5. `timeline-under-repeated-hold-patterns`

## 7. Verification gates

Required command set:

```bash
npm run build
npm run check:ui-shell
npm run check:ui2:fixtures
npm run check:ui3:assets
npm run verify
git diff --check
```

M10-specific focused UI checker should be added and included in verify when
implementation begins.

## 8. Stop condition

M10 is complete when:

- timeline and replay are visible and stable in Council;
- timeline rows match Inspector/cycle diagnostics for the same runs;
- focused UI checks and full verification pass;
- implementation and evidence are committed separately per protocol.
