# Council UI Product Delivery Runbook

## Mission

Deliver the BOOK-06 experience through small, verifiable vertical slices. The
UI track is named `UI0`, `UI1`, and so on to avoid confusing it with BOOK-00
strategy milestones such as M3 and M4.

## Delivery rules

Every slice must:

- use canonical runtime data or state explicitly that data is unavailable
- keep strategy behavior and safety defaults unchanged
- work in both Advisor and Autobuyer contexts where applicable
- add presentation tests or deterministic render fixtures when implementation begins
- preserve Matrix Diagnostics as an expert fallback
- document any new UI-facing state or event contract before consuming it

## Milestones

### UI0 — Lock the north star and process

Goal: establish one visual target and one delivery system.

- [x] Accept the clean Council Chamber scene as the visual north star
- [x] Record the reference image, dimensions, and hash
- [x] Create BOOK-06 as the durable UI/experience vision
- [x] Separate current status, runbook, and data mapping
- [x] Define Council, Chronicle, Compact, and Matrix surfaces
- [x] Commit the documentation package without unrelated implementation files

Exit gate: a future agent can identify the target, boundaries, active milestone,
and exact next action without relying on chat history.

### UI1 — Define the presentation contracts

Goal: make every visible value traceable before layout implementation.

- [x] Audit current runtime fields against `COUNCIL_UI_DATA_MAP.md`
- [x] Define a versioned `CouncilUiState` contract
- [x] Define a versioned `CouncilTimelineEvent` contract
- [x] Specify unavailable, stale, loading, and error states
- [x] Specify display formatting without losing source precision
- [x] Add deterministic state fixtures for major phases and safety states
- [x] Confirm no UI field requires new strategy behavior

Exit gate: the chamber and timeline can be rendered entirely from documented,
deterministic fixture data.

### UI2 — Build the functional chamber shell

Goal: prove hierarchy and interaction before production art integration.

- [x] Add Council Chamber as a selectable UI surface
- [x] Build responsive chamber, parchment, status, lane, and timeline regions
- [x] Render the current runtime recommendation and execution state
- [x] Render all three UI1 fixtures through a deterministic shell test
- [x] Render all four lane cards and global safety state
- [x] Implement tabs, modes, keyboard focus, and reduced-motion behavior
- [x] Add Matrix Diagnostics navigation
- [x] Verify deterministic layout at agreed viewport and zoom cases
- [ ] Complete installed-userscript switching and real-resource live smoke

Exit gate: a plain but complete HTML/CSS shell communicates the full decision
without requiring the reference image.

### UI3 — Integrate production graphics

Goal: reach the Council Chamber art direction without sacrificing clarity.

- [x] Decide Tampermonkey asset delivery method
- [x] Derive optimized production assets from approved sources
- [ ] Record source, generation prompt where available, hash, and license status
- [x] Separate background, parchment, ornament, icons, and optional effects
- [x] Add responsive crops or fallbacks
- [x] Lock the desktop Council window to the production-art aspect and disable manual resizing
- [ ] Validate contrast and text-safe regions over real runtime states
- [x] Establish asset-size and load-time budgets

Exit gate: production art passes visual, performance, provenance, and fallback
acceptance.

### UI4 — Deliver the Council Chronicle

Goal: make recent reasoning and execution causally understandable.

- [ ] Emit unified timeline events at decision time
- [ ] Show recommendation → authority → fallback → execution chains
- [ ] Add All, Decisions, Purchases, and Warnings filters
- [ ] Represent holds, failures, refusals, and stale data honestly
- [ ] Bound retained history and rendering cost
- [ ] Add deterministic ordering and duplicate-event tests

Exit gate: a user can explain why the last action happened or did not happen by
reading the Chronicle alone.

### UI5 — Compact Council and Matrix coexistence

Goal: support normal play and expert diagnosis without duplicating logic.

- [ ] Build Compact Council from the same `CouncilUiState`
- [ ] Keep essential safety and execution state visible
- [ ] Retain raw expert details in Matrix Diagnostics
- [ ] Preserve filters and mode when switching surfaces where appropriate
- [ ] Verify all surfaces report the same canonical decision identity

Exit gate: compact, full, and expert views differ in density, not truth.

### UI6 — Product acceptance

Goal: make the new UI safe to become the default experience.

- [ ] Complete browser, viewport, zoom, and reduced-motion matrix
- [ ] Complete keyboard and semantic accessibility review
- [ ] Measure asset load and steady-state rendering cost
- [ ] Run live-state checks in Advisor and Autobuyer modes
- [ ] Confirm Matrix rollback path
- [ ] Capture approved visual baselines
- [ ] Update user documentation and release notes

Exit gate: the Council UI is understandable, responsive, truthful, performant,
and reversible in live use.

## Vertical-slice order inside a milestone

For each surface, implement in this order:

1. state contract or fixture
2. semantic HTML
3. readable layout
4. interaction and error states
5. artwork and motion
6. visual and behavioral verification

## Completion language

A checked documentation item means the artifact exists. It does not constitute
formal version acceptance. Code milestones use the repository's Git verification
protocol and must record the exact implementation and evidence SHAs.
