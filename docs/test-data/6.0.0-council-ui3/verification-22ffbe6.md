# Council UI3 compact parchment verification

- Verification date: 2026-07-14
- Implementation commit: `22ffbe6da9c0c27e00386f0cba04cc637d21394e`
- Implementation tree: `2265b60c9968913fdb984a175adfbbffc7c3dba9`
- Branch: `codex/ui3-compact-parchment-fix`
- Verification worktree: detached at the exact implementation commit
- Node: `v24.14.0`
- npm: `11.9.0`

## Scope

The compact Council decision surface now keeps dynamic decision text inside
the parchment's upper and lower text-safe region below 700 px. The UI2 fixture
checker measures both insets across all three state fixtures and all four
viewport/zoom cases. Canonical runtime source and userscript build output are
synchronized.

No strategy behavior, authority, threshold, hard safety default, asset, fixed
desktop dimension, draggable behavior, Matrix Diagnostics surface, or
Tampermonkey resource binding changed.

## Exact-SHA verification

No evidence generator ran during the suite and no tracked file changed in the
detached worktree. `npm run build` reported that canonical output was already
up to date.

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run build` | 0 | Canonical userscript already up to date |
| `node scripts/validate-repo-guardrails.js` | 0 | Repository guardrails passed |
| `npm run check:ui-shell` | 0 | Council source and fixed-layout surfaces passed |
| `npm run check:ui2:fixtures` | 0 | Three states by four viewport/zoom cases passed, including compact text-safe insets |
| `npm run check:ui3:assets` | 0 | 13 assets, 492872 bytes, resource/fallback checks passed |
| `npm run verify` | 0 | Full repository suite passed, including M2-M6 and all UI checks |
| `git diff --check` | 0 | No whitespace errors |
| `git status --porcelain=v1` | 0 | Exact-SHA verification worktree remained clean |

## Visual finding and correction

The deterministic 690 px render showed the decision eyebrow and title entering
the parchment's upper ornament. Compact vertical padding was increased, and a
new regression assertion requires at least 34 px above the decision eyebrow
and 28 px below the execution strip. A follow-up 690 px render showed the title
clearly inside the parchment writing area.

## Remaining UI milestone gate

Installed-userscript smoke with real Tampermonkey resources is still required
for Council/Matrix switching, resource-load fallback, live text contrast, and
Advisor/Autobuyer state review. This evidence does not claim that UI3's full
live visual acceptance is complete.
