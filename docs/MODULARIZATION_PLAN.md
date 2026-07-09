# Modularization Plan (Phase 1 start)

Status: Started 2026-07-09, Phase 4 done (practical split active)

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
