# Modularization Plan (Phase 1 start)

Status: Started 2026-07-09, Phase 4 bootstrap in progress

Goal:

- Keep Tampermonkey runtime stable with one executable userscript in src.
- Improve maintainability by defining lane guard module boundaries for future extraction.

Constraints:

- `src/SwarmSim-Strategy-Autobuyer.user.js` remains the only executable script.
- No duplicate `.user.js` files.
- No byte-identical full script copies outside src.
- Safe defaults must remain conservative.

Proposed lane/module boundaries:

- `dev-src/guards/meat-guard.js`
- `dev-src/guards/larva-guard.js`
- `dev-src/guards/territory-guard.js`
- `dev-src/guards/energy-guard.js`
- `dev-src/overseer/index.js`
- `dev-src/contracts/lane-proposal.js`

Migration phases:

1. Phase 1 (done): scaffold contracts and module entry points; no runtime wiring.
2. Phase 2 (done): territory/army lane execution extracted behind a runtime adapter boundary in the canonical userscript.
3. Phase 3 (in progress): territory/army proposal generation plus meat, engine, energy and clone execution routed through dedicated runtime adapter boundaries.
4. Phase 4 (started): build/check entrypoint added for canonical userscript with behavior-preserving bootstrap pipeline.

Validation required after each phase:

- `node scripts/validate-repo-guardrails.js`
