# Book 00 M6 six-domain coordinator verification

- Verification date: 2026-07-13
- Implementation commit: `9da1b2312cc603c29f9d3add2270499fdbc1b269`
- Implementation tree: `c94a2e8e0b8487715a4b69b7bc7fe8960bc9a089`
- Verified branch before integration: `codex/m6-integration-fix`
- Verification worktree: detached at the exact implementation commit
- Node: `v24.14.0`
- npm: `11.9.0`

## Scope

The implementation adds the M6 six-domain strategic coordinator, its public and UI observability surfaces, the canonical 6.0.0 userscript build, focused acceptance coverage, version checks, and release documentation. The integration fix preserves canonical purchase execution identity when M6 combines evaluated economic rows with their original proposals, preventing a valid bounded reversible winner from being rejected during exact-identity validation.

Hard safety defaults remain unchanged: ability auto-cast, Ascension automation, and Energy support broker auto-cast default to disabled; Nightbug/Bat auto-buy remains disabled; Nexus and Energy protections remain enabled; Laboratory remains gated, manual, read-only, and simulation-only. Advisor-only domains retain no execution path.

## Exact-SHA verification

No evidence generator ran during the suite and no generated-path allowlist was required. `npm run build` was classified as the canonical assembly command; it reported that the userscript was already current and produced no tracked change. All other commands below were pure checks.

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run build` | 0 | Canonical userscript already up to date |
| `node scripts/validate-repo-guardrails.js` | 0 | Repository guardrails passed |
| `npm run check:6.0.0:versions` | 0 | All 6.0.0 version surfaces passed |
| `npm run check:book00:m6:six-domain` | 0 | Focused M6 acceptance passed |
| `npm run verify` | 0 | Full repository verification passed, including M2, M3, M4, M5, M6, UI, Laboratory, purchase evaluator, build, version, and guardrail checks |
| `git diff --check` | 0 | No whitespace errors |
| `git status --porcelain=v1` | 0 | No tracked or untracked drift |

After the exact-SHA suite passed with a clean detached worktree, `main` was fast-forwarded and pushed to the implementation commit. At that point `HEAD` and `origin/main` both resolved to `9da1b2312cc603c29f9d3add2270499fdbc1b269` with a clean working tree. This evidence record is authored afterward and is committed separately from the implementation.

## Intentionally unchanged

- No force-push or history rewrite was performed.
- No duplicate executable userscript or release-note tree was created.
- No ability cast, Ascension, mutagen allocation, Nightbug/Bat purchase, or Laboratory execution authority was added.
- No unrelated strategy threshold or aggressive buy-max behavior was introduced.
