# dev-src

Configured build source for the SwarmSim Tampermonkey script.

- `dev-src/runtime-sections/runtime-main.js` is the runtime source of truth.
  `scripts/build-canonical-userscript.js` assembles it (plus the metadata
  header) into the single executable userscript
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
- `src/SwarmSim-Strategy-Autobuyer.user.js` remains the only executable
  userscript. Do not create duplicate or byte-identical `.user.js` copies.

History: an earlier per-lane `dev-src/` skeleton (`guards/`, `overseer/`,
`contracts/`, `adapter-*.js`) was scaffolding for a planned modular refactor.
It was never wired into the build or imported by anything, so it was removed
on 2026-07-19 (RH-5, audit finding R5). If lane extraction is revisited, the
build already supports multiple source `parts` in
`scripts/canonical-build.config.json`; see
`docs/process/MODULARIZATION_PLAN.md`.
