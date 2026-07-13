# Council UI Current Status

Updated: 2026-07-13

## Current state

- **Visual north star:** selected and stored
- **Documentation milestone:** UI0 authored locally
- **Active delivery milestone:** UI1 — presentation contracts
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

## Active milestone: UI1

UI1 must define the data and event contracts before the visual shell is wired
to the live bot.

### UI1 checklist

- [ ] Verify every preliminary data-map row against canonical source
- [ ] Mark each field available, derived, missing, or presentation-only
- [ ] Specify `CouncilUiState` version 1
- [ ] Specify `CouncilTimelineEvent` version 1
- [ ] Create deterministic example states
- [ ] Identify true data gaps separately from UI wishes

## Exact next action

Inspect the configured runtime source and canonical userscript for the fields
listed in `COUNCIL_UI_DATA_MAP.md`. Record exact source identities and freshness
rules. Do not change planner behavior during that audit.

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

## Working-tree note

This status describes the authored UI documentation package. Formal completion
still requires an isolated commit and the repository's applicable verification.
