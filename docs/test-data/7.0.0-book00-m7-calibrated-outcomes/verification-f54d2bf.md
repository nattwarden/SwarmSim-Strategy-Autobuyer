# 7.0.0 M7 + UI compact integration verification

- Implementation SHA: `f54d2bf33fb08e613f3141ab761e93f052889e26`
- Implementation tree: `b0a271c298d8663d50b34a6d81eceb180a08a320`
- Verification: detached exact-SHA worktree, clean before and after checks.
- Passed: `npm run build`, `npm run verify`, `node scripts/validate-repo-guardrails.js`, and `git diff --check` (all exit 0).
- UI compact parchment fix source: `22ffbe6da9c0c27e00386f0cba04cc637d21394e`.
- UI3 artwork and fixed 1180 x 700 layout remain in the canonical userscript; UI shell, UI2 fixture, and UI3 asset checks passed (13 assets, 492872 bytes).
- M7 ranks abilities only with a shared named milestone ETA; raw resource gains remain advisor-visible but unranked. Hard safety defaults and advisor-only authority remain unchanged.
- Outstanding manual check: installed Tampermonkey UI3 smoke.
