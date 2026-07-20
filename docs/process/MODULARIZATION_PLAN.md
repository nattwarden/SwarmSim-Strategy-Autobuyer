# Modularization Plan (retired scaffolding; approach on hold)

Status: On hold as of 2026-07-19. The per-lane `dev-src/` scaffolding this plan
introduced (`guards/`, `overseer/`, `contracts/`, `adapter-*.js`) was never
wired into the build or imported by any code, so it was deleted as dead code
(RH-5, audit finding R5). The runtime remains one source file,
`dev-src/runtime-sections/runtime-main.js`, assembled into the single
userscript. This document is kept only as a design reference for any *future*
extraction: the build already supports multiple source `parts` in
`scripts/canonical-build.config.json`, so a real split would add a build part,
not re-create standalone skeleton modules. The historical phase notes below
describe that abandoned skeleton, not current structure.

Original status line: Started 2026-07-09, Phase 4 done (practical split active)

Goal:

- Keep Tampermonkey runtime stable with one executable userscript in src.
- Improve maintainability by defining lane guard module boundaries for future extraction.
- Preserve a methodical optimizer architecture where lanes can act decisively
  when evidence supports action, while hard safety defaults still block
  high-risk or irreversible automation by default.

Constraints:

- `src/SwarmSim-Strategy-Autobuyer.user.js` remains the only executable script.
- No duplicate `.user.js` files.
- No byte-identical full script copies outside src.
- Hard safety defaults must remain explicit and preserved.
- Do not confuse hard safety defaults with passive play. Normal reversible
  progression should be optimized logically inside the selected user mode.

Proposed lane/module boundaries:

- `dev-src/guards/meat-guard.js`
- `dev-src/guards/larva-guard.js`
- `dev-src/guards/territory-guard.js`
- `dev-src/guards/energy-guard.js`
- `dev-src/guards/clone-guard.js`
- `dev-src/overseer/index.js`
- `dev-src/contracts/lane-proposal.js`

Migration phases:

1. Phase 1 (done): scaffold contracts and module entry points; no runtime wiring.
2. Phase 2 (done): territory/army lane execution extracted behind a runtime adapter boundary in the canonical userscript.
3. Phase 3 (done): territory/army proposal generation plus meat, engine, energy and clone execution routed through dedicated runtime adapter boundaries.
4. Phase 4 (done): config-driven build/check assembly is active with full runtime sourced from `dev-src/runtime-sections/runtime-main.js` and emitted to canonical userscript.

Validation required after each phase:

- `node scripts/validate-repo-guardrails.js`
