# Council UI3 frame readability verification

- Verification date: 2026-07-14
- Implementation commit: `2f131251e55e0a03821d81b198de705243c6afc5`
- Implementation tree: `bb7988b4402ddb72a70b3ca83070d5054f2d4bbd`
- Branch: `codex/ui3-compact-parchment-fix`
- Verification worktree: detached at the exact implementation commit
- `origin/main` observed during verification: `5513682e60ed67d7e80a128cd98e5965ed058d17`
- Node: `v24.14.0`
- npm: `11.9.0`

## Scope

The Council's desktop ornate frame is now rendered beneath all live Council
content and overscans its transparent art bleed within the clipped shell. This
removes the visible black outer gutter while preserving the artwork and keeps
the frame from hiding status, decision, Chronicle, lane, tab, or control text.

The UI2 fixture checker now requires the desktop frame to remain behind
readable content and to exceed the shell width by the required overscan. The
canonical userscript was rebuilt from the configured runtime source.

No strategy behavior, authority, hard safety default, fixed Council dimensions,
drag behavior, resize policy, Matrix Diagnostics surface, asset manifest, or
Tampermonkey resource binding changed.

## Exact-SHA verification

All commands below were pure checks. No evidence generator ran and the detached
verification worktree remained clean.

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run build` | 0 | Canonical userscript already up to date |
| `node scripts/validate-repo-guardrails.js` | 0 | Repository guardrails passed |
| `npm run check:ui-shell` | 0 | Council source and fixed-layout surfaces passed |
| `npm run check:ui2:fixtures` | 0 | Three states by four viewport/zoom cases passed, including frame layering and overscan |
| `npm run check:ui3:assets` | 0 | 13 assets, 492872 bytes, resource/fallback checks passed |
| `npm run verify` | 0 | Full repository suite passed, including M2-M6 and all UI checks |
| `git diff --check` | 0 | No whitespace errors |
| `git status --porcelain=v1 --untracked-files=no` | 0 | Exact-SHA verification worktree remained clean |

## Visual review

A deterministic desktop fixture render was reviewed after the change. The frame
reaches the Council boundary without the prior black perimeter and decision and
supporting text remain visually unobscured.
