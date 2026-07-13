# Council UI Current Status

Updated: 2026-07-13

## Current state

- **Visual north star:** selected and stored
- **Completed documentation milestones:** UI0 and UI1 authored locally
- **Active delivery milestone:** UI2 — functional chamber shell
- **Runtime implementation:** not started in this UI track
- **Strategy behavior:** intentionally unchanged

The clean Council Chamber image is the canonical composition reference. It is
not yet approved as an optimized runtime asset.

## What UI0 established

- BOOK-06 owns durable UI and experience intent
- the UI runbook owns milestone gates and checklists
- this file owns current state and the exact next action
- the data map owns traceability from visible information to runtime truth
- Council Chamber, Council Chronicle, Compact Council, and Matrix Diagnostics
  are distinct surfaces over shared canonical state

## UI1 audit result

The runtime already exposes phase, goal, whole-economy recommendations,
candidate economics, coordinator authority, fallback, execution result, lane
decisions, and the major domain-specific planner states.

The real gaps are presentation observability rather than strategy:

- no monotonic cycle or decision id
- live banks and production rates are readable but not part of inspector state
- legacy advisor and purchase logs have locale time but no causal identity
- phase, goal, and protected resources are partly formatted strings

UI1 therefore defines a pure adapter contract and a future emitted-event
contract without requesting changes to planner choices or safety gates.

## UI1 delivered artifacts

- [x] Canonical runtime source audit and exact source mapping
- [x] `council-ui-state.v1`
- [x] `council-timeline-event.v1`
- [x] Autobuyer success, Advisor hold, and stale-data state fixtures
- [x] Causal purchase chain and hold timeline fixtures
- [x] Explicit null/availability and freshness rules
- [x] Confirmation that the visual goal needs observability, not new strategy

## Active milestone: UI2

UI2 proves the information hierarchy as a functional semantic HTML/CSS shell
using deterministic fixtures before production graphics are integrated.

## Exact next action

Choose the narrowest runtime UI boundary for a pure `buildCouncilUiState(...)`
adapter and render the `autobuyer-completed-purchase`, `advisor-hold`, and
`stale-unavailable` fixtures into a plain Council shell. Do not integrate the
large reference image or change planner behavior in the first UI2 slice.

## Known decisions

- the reference art is a stable layer; live information remains HTML/CSS
- the central parchment owns the current whole-economy decision
- the Chronicle uses emitted structured events, not reconstructed text logs
- compact and expert views remain available
- UI milestones use `UI#` names and do not replace BOOK-00 M3/M4 milestones

## Open decisions for later milestones

- exact desktop breakpoint and minimum supported viewport
- whether the full chamber opens as panel, overlay, or dedicated page surface
- Tampermonkey asset loading and caching method
- final production crop, WebP/PNG variants, and asset budget
- final Swedish/English localization policy

## Validation snapshot

UI0 is committed at `3b434a3`. The UI1 documentation and fixtures passed the
following pure checks on 2026-07-13:

- JSON parsing and fixture invariants: 3 states, 7 lanes per state, 5 unique events
- `node scripts/validate-repo-guardrails.js`
- `npm run build` (canonical userscript already up to date)
- `npm run verify`
- `git diff --check`

UI1 changes no runtime behavior and generates no evidence files. Git history is
the source of truth for the commit containing this status.
