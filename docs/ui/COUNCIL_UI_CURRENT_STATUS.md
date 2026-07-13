# Council UI Current Status

Updated: 2026-07-13

## Current state

- **Visual north star:** selected and stored
- **Completed milestones:** UI0 and UI1
- **Active delivery milestone:** UI3 — production-art integration in progress
- **Runtime implementation:** functional UI2 shell with UI3 art hooks locally
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

## UI2 implementation result

The configured runtime source now contains:

- a read-only `buildCouncilUiState(...)` presentation adapter
- live meat, larvae, territory, and Energy bank/rate capture
- separate recommendation, coordinator selection, authority, and execution state
- Council Chamber and Matrix Diagnostics surface buttons
- semantic status rail, central decision surface, four primary lane cards, and
  a legacy Chronicle preview that explicitly does not claim causal event links
- freshness, unavailable-value, safety, keyboard-focus, responsive, and
  reduced-motion presentation states
- public read-only `getCouncilUiState()` diagnostics

The reference chamber and production artwork are intentionally absent from the
runtime. UI2 proves information hierarchy before UI3 graphics integration.

### UI2 remaining acceptance

- [x] deterministic shell render of all three UI1 state fixtures
- [ ] live visual smoke at desktop width, below 1100 px, and below 700 px
- [ ] browser zoom smoke at 100%, 125%, and 150%
- [ ] confirm Council ↔ Matrix switching in the installed userscript

## Exact next action

Publish the generated runtime assets, install the rebuilt canonical userscript,
and complete the combined UI2/UI3 visual smoke matrix. Capture overflow,
unreadable parchment text, failed resource loading, or Council/Matrix switching
failures before accepting UI3.

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

## UI3 asset intake note

The first two generated ornate-frame candidates received on 2026-07-13 were
rejected before repository intake. Both were 1672 × 941 `Format24bppRgb`, had
no alpha channel, and contained a baked checkerboard.

The user-corrected Photoshop version is accepted as the UI3 source candidate at
`assets/council/council-ornate-frame-source-v1.png`. It is 1672 × 941
`Format32bppArgb`; the exterior and center have alpha `0`, and a sampled frame
pixel has alpha `255`. UI3 will derive any optimized or resized runtime variant
from this unchanged source.

Ten user-named and user-cut shield images are also accepted under
`assets/council/`: six Council advisor shields and four economic-lane shields.
Their semantic mapping, dimensions, and SHA-256 hashes are recorded in the
asset README. All have real alpha transparency. The visible magenta edge fringe
is explicitly accepted by the user and must not block UI3 integration.

The standalone blank parchment is accepted at
`assets/council/council-parchment-source-v1.png`. It is a 1774 x 887 32-bit
ARGB PNG with transparent exterior pixels and an opaque central writing area.
It completes the required source-art set for the first UI3 integration pass;
all live decision content remains HTML rather than raster text.

The first UI3 runtime pass derives 13 WebP assets totaling 492,872 bytes and
delivers them through cached Tampermonkey `@resource` entries. The Council shell
uses the chamber and ornate frame, the decision surface uses the parchment, the
four lane cards use their domain shields, and the detailed advisor cards use
their six named shields. Every layer retains a semantic HTML/CSS fallback.

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

The UI2 implementation preserves planner behavior and hard safety defaults. Its
source-level acceptance requires `npm run check:ui-shell`, the full repository
suite, canonical build parity, and `git diff --check`; live visual acceptance
remains the unchecked UI2 gate above.

Pre-commit source validation on 2026-07-13 passed:

- `npm run build`
- `npm run verify`
- `node --check dev-src/runtime-sections/runtime-main.js`
- `node --check src/SwarmSim-Strategy-Autobuyer.user.js`
- `git diff --check`

The follow-up `check:ui2:fixtures` renders all three state fixtures through the
production Council CSS at four effective layout widths: desktop 100%, desktop
125%, desktop 150%, and compact below 700 px. It verifies semantic regions,
four primary lanes, decision metrics, Council/Matrix controls, breakpoint
columns, and horizontal-overflow bounds without writing screenshots or evidence.
