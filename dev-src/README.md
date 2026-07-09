# dev-src

Development-only modular skeleton for future refactoring of the SwarmSim Tampermonkey script.

Important:

- `src/SwarmSim-Strategy-Autobuyer.user.js` remains the only executable userscript.
- Files in `dev-src/` are non-executable planning scaffolds for lane/guard boundaries.
- Do not copy the whole userscript into `dev-src/`; that would violate repo guardrails.

Current phase

- Phase 1 (this commit): contracts + guard/overseer shape only, no runtime wiring.
- Later phases: move one lane at a time behind adapter boundaries, then bundle back to the canonical userscript.
