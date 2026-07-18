# BOOK-00 Unified single-window UI — foundation & handoff

Status: DESIGN + PROVEN POC, ready for a fresh agent to implement. This is a
**UI-only** product milestone: merge the bot's floating panels and the game into
one integrated, single-theme window. No strategy/behavior/safety change.
Runtime baseline: 9.3.6 (`ed7e008`, pushed). `NO_GO`, `m6DecisionOwnsMainCycle
= false`, and all hard-safety defaults stay untouched.

Author date: 2026-07-19

## 1. The problem and the user's vision

Today the bot injects **four floating `position: fixed` overlays** on top of
swarmsim.com; they cover/hide the game. The user wants instead **one integrated
window, one theme** — the game and the bot UI hosted in a single cohesive layout,
not separate draggable panels.

User's design direction (verbatim intent, captured 2026-07-19):
- Everything generated in the **same window**, one shared theme. It currently
  "still feels like different windows" — chiefly because of **many scrollbars**
  (one per panel). Killing that separate-window feel is the core goal.
- **Anchor the layout to the Swarm Council's required width** — the Council is
  the wide, governing element; size the game and the rest around it.
- **Compact the game's top menu**, especially the right-side items: `More...`
  should become narrower or move — e.g. a **gear/cog icon** instead of a text
  dropdown.
- May also need to **restyle the game's own menu layout** to fit the design.

## 2. What is already PROVEN (live POC, 2026-07-19)

A throwaway headed-Chrome POC injected a custom shell over the running 9.3.6
build and re-parented both the game and the bot panels into it. Result:
`{ movedGame: true, movedPanels: [Council, settings, purchase-log],
gameAlive: true }` — **the game still ticks/plays after being moved.** So the
single-window approach is technically feasible; the core risk (breaking the
AngularJS game by re-parenting) is retired.

Proven approach (rebuild this in the userscript):
1. Create a flex shell `<div id="kbc-appshell">` (fixed, inset:0) with a left
   `#kbc-game-region` (flex:1) and a right `#kbc-bot-region`.
2. Move the game into the left region: `gameRegion.appendChild(document
   .querySelector("body > .container"))`. Override `.container` to
   `position:static; width:100%; max-width:none; margin:0`.
3. Move the bot panels into the right region (Council first, then settings, then
   purchase log). Un-fix them: `position:static; width:100%; height:auto;
   resize:none`.
4. Apply a dark theme to the game region so it matches the bot aesthetic.

## 3. Key DOM / code facts for the implementer

Game DOM (swarmsim, AngularJS):
- `<body ng-app="swarmApp" class="theme-none">` — Angular is on `body`; moving
  its children is safe. **`theme-none` means swarmsim has a native theme system
  (`theme-*` variants)** — lean on it for "same theme" instead of fully custom.
- Game root to re-parent: `body > .container` → `.viewwrap` → `[ng-view]`.
- Top nav: `.navbar.navbar-default[ng-controller="HeaderCtrl"]`, brand
  `.navbar-brand.page-title`. Resource tabs + `More...` + `Buy all` / `Buy
  cheapest` render in the `.viewwrap` header area. `More...` is the target for
  the gear-icon idea.

Bot UI (in `dev-src/runtime-sections/runtime-main.js`, CSS block
`#kbc-swarmbot-style` ~line 23171; all `position: fixed`):
- `.kbc-strategy-bar` — **The Swarm Council**, native `COUNCIL_FIXED_WIDTH =
  1180` (1180×700, `resize:none`). Its internal layout is designed for ~1180px;
  narrowing it without horizontal scroll needs **internal reflow work on the
  Council's own markup/CSS**, not just an outer width override. This is the main
  layout constraint — hence "anchor to the Council's width."
- `#kbc-swarmbot-panel` — settings panel; shows the version (`SwarmBot vX.Y.Z`).
- `#kbc-swarmbot-purchase-panel` — the "Senaste köp" purchase log.
- `#kbc-swarmbot-advisor-panel` — a secondary advisor view. In the POC it was
  left floating and overlapped the game — **it must be captured too** (integrate
  or drop it).

## 4. Open design points to resolve with the user (next session)

1. **One scroll surface.** Flatten the panels (remove per-panel borders,
   shadows, backgrounds, and individual `overflow:auto`) so the right side is a
   single cohesive column with at most one scrollbar. This is the highest-impact
   fix for the "separate windows" feel.
2. **Council width.** Decide the anchor width. Either (a) give the Council its
   comfortable width and let the game take the remainder, or (b) reflow the
   Council's internals to a narrower column. (b) is more work but yields a better
   fit on normal screens.
3. **Top-menu compaction.** `More...` → gear icon; shrink/move right-side nav
   items so the game fits a narrower left region.
4. **Theme.** Prefer swarmsim's native `theme-*` over fully custom CSS where
   possible.

## 5. Constraints and definition of done

- **UI only.** Do not touch strategy, scoring, reserves, buy amounts, or hard
  safety. `m6DecisionOwnsMainCycle` stays `false`; `NO_GO` stays.
- **This redesigns the "protected" Council UI3 / fixed 1180×700 layout.** The
  readiness/runbook note "do not redesign Council UI3/fixed-layout" is
  **explicitly overridden by the user for this milestone** (authorization
  recorded here). The UI acceptance checks encode the old floating layout —
  `check:ui-shell`, `check:ui2:fixtures`, `check:ui3:assets` (and the UI3 layout
  key / `1180x700` assertions) **will break and must be reworked** as part of
  baking this in. That is expected, not a regression to force-pass.
- Player-visible milestone → its own version bump + release notes when it lands.
- Recommended sequence: (1) iterate the live headed prototype until the user
  approves the look (flatten to one scroll surface; Council-anchored width;
  compact menu / More→gear; capture the advisor panel); (2) bake the shell +
  re-parenting into the userscript UI init; (3) rework the UI checks; (4)
  version + release notes; (5) exact-SHA verify.
- The POC scripts lived in the session scratchpad and were intentionally not
  committed; rebuild from §2's approach.

## 6. Where we left off

POC proved feasibility and the game survives re-parenting. The user gave the §1
refinement feedback (anchor to Council width; compact top menu / More→gear; kill
the many-scrollbars/separate-window feel) and chose to iterate the live look
before formalizing. The immediate next step is the **flatten-to-one-scroll +
Council-anchored-width + compact-menu** prototype iteration, then bake-in.
