# Modularization Plan (Phase 1 start)

Status: Started 2026-07-09

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
2. Phase 2: adapter extraction of one lane at a time behind stable context interfaces.
3. Phase 3: overseer selects lane proposals via shared contract.
4. Phase 4: build/bundle flow for canonical userscript, preserving behavior.

Validation required after each phase:

- `node scripts/validate-repo-guardrails.js`
