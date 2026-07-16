# 9.4.0 clean-room Phase 1 exact-SHA verification

## Identity

- Purpose: reproduce the accepted 9.3.5 baseline before any 9.4.0 runtime work.
- Clean-room base: `da1fcede6419b8124b11004c7562819b67180330`.
- Implementation SHA: `68b77d0a5bd45c005c28a956b5ca15d731bf69d0`.
- Implementation tree: `da46c284e5bcd4e0bbb822a518527a777875f074`.
- Remote branch at verification: `origin/codex/9.4.0-clean-room` at the implementation SHA.
- Verification checkout: detached exact-SHA worktree.
- Verification date: 2026-07-16.
- Final tracked and untracked status count: `0`.

## Environment and game identity

- OS: Windows `10.0.26200`, x64.
- Node.js: `v24.14.0`.
- Playwright: `1.61.1`.
- Chrome: `150.0.7871.116`.
- Live game URL: `https://www.swarmsim.com/#/`.
- Save format version reported by the game: started/saved `1.1.17`.
- Angular: `1.6.1`.
- Game script: `scripts/scripts.09dd8c8b.js`, 528156 bytes,
  SHA-256 `aff1b67cb4bbeefa42c5ab47c905943c315bf7e0de4a7af0ede254260c9e6ffa`.
- Vendor script: `scripts/vendor.b62c7e53.js`, 1726528 bytes,
  SHA-256 `f932b5e04761f61edbf346430650f0021db35bf5846f7906a7e7baea7ffa11cb`.
- Game fingerprint captured at `2026-07-16T07:56:38.137Z`.

## Fixture provenance

- Fixture: `docs/test-data/clone-ramp/live-user-save.txt`.
- Source: player-reported live save, first tracked in
  `47bc9401c8a8d8ae7b71b4c7040604e3ad1bf187`.
- SHA-256: `58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec`.
- The verifier checks this hash before import.
- No duplicate save was added.

## Command record

| Command | Classification | Allowlist / expected write | Exit | Final result | Worktree after command |
|---|---|---|---:|---|---|
| `npm ci --prefer-offline --no-audit --no-fund` | dependency installation | ignored `node_modules/` only | 0 | 2 packages installed | no Git change |
| `git rev-parse HEAD`, `git rev-parse HEAD^{tree}`, `git status` | PURE CHECK | none | 0 | exact SHA/tree and clean checkout | clean |
| `node scripts/validate-repo-guardrails.js` | PURE CHECK | none | 0 | guardrails passed | clean |
| `npm run build` | EVIDENCE GENERATOR | `src/SwarmSim-Strategy-Autobuyer.user.js` | 0 | canonical already up to date | clean; no generated diff |
| `npm run verify` | EVIDENCE GENERATOR WITH SELF-CLEANUP | ephemeral `docs/test-data/strategy-audit-0/book00-*`; persistent output must be none | 0 | complete configured suite passed | clean; no persistent output |
| `npm run strategy:audit:default-save:check` | PURE CHECK | none | 0 | tracked save imported successfully | clean |
| `git diff --check` | PURE CHECK | none | 0 | passed | clean |
| live game fingerprint probe | PURE CHECK | none | 0 | environment and upstream script hashes captured | clean |

## Required invariant summary

- Canonical build and repository guardrails: pass.
- M2: Territory / Stinger V / amount 9 selected, revalidated, matched and bought.
- M3 execution: Energy / Lepidoptera / amount 5 selected, matched and bought.
- M6 and M7 focused coordinator contracts: pass.
- M8: blocker cycles 5, ETA-grounded streak by cycle 3, stall breaker cycle 3.
- M9: Territory HOLD with Engine, Meat and Upgrade still BUY-eligible.
- Live purchase: legacy and M6-authorized real purchases both produced observed count/resource deltas.
- Territory saturation: extreme, classifier boundary and moderate BUY cases pass.
- Clone Ramp: pass; narrow Clone Larvae-only exception preserved.
- Twin Prep meaningful gate and mutation controls: pass.
- 9.3.5 executed-amount and House of Mirrors readiness: pass.

## Scope

The implementation changes only fixture selection/provenance and cleanup of
ephemeral verifier outputs. It does not change the canonical runtime, strategy,
safety thresholds, version surfaces or product defaults. No generated evidence
other than this allowlisted report is part of the evidence commit.
