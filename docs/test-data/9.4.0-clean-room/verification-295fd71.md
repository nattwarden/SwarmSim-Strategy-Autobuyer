# 9.4.0 clean-room advisor-winner fallback verification

Verification date: 2026-07-16

## Immutable implementation identity

- implementation SHA: `295fd71aa9b910105ab45090e86a2f265c2b748e`
- implementation tree: `098fe68d92f9cd13ec1f63706a1f9ccf0c208ca8`
- evidence base SHA: `295fd71aa9b910105ab45090e86a2f265c2b748e`
- remote branch: `origin/codex/9.4.0-clean-room`
- remote branch SHA at verification start:
  `295fd71aa9b910105ab45090e86a2f265c2b748e`
- verification worktree: detached exact-SHA checkout
  `C:/Users/info/OneDrive/Dokument/SwarmSim-9.4.0-clean-room-verify-295fd71`
- working tree before and after verification: clean, status count `0`

## Environment

- Node.js: `v24.14.0`
- npm: `11.9.0`
- operating system: Windows
- live game URL used by browser acceptance: `https://www.swarmsim.com/`

## Command classification and results

Setup, not a product check:

- `npm ci --ignore-scripts` - exit `0`; installed the locked dependencies with
  `0` reported vulnerabilities.

Predeclared generator:

- `npm run build` - exit `0`; the only allowlisted generated implementation
  path was `src/SwarmSim-Strategy-Autobuyer.user.js`. It was already current
  and no file changed.

Pure checks:

- exact `HEAD`, tree and remote-branch identity checks - exit `0`.
- `node scripts/validate-repo-guardrails.js` - exit `0`.
- `GIT_COMMIT=295fd71aa9b910105ab45090e86a2f265c2b748e npm run verify`
  - exit `0`; the complete configured suite passed in `123.5s`.
- `npm run strategy:audit:default-save:check` - exit `0`; the pinned player
  save imported successfully.
- `git diff --check` - exit `0`.
- `node scripts/check-9.4.0-same-contract-product-pair.js
  --mutate-harness-affordability` - exit `1`, expected. The in-memory mutant
  restored the live `maxCostMet()` shortcut and the verifier rejected the
  resulting `68,015,773`-unit Territory amount instead of the staged exact
  amount `1`.
- `node scripts/check-live-purchase-acceptance.js
  --mutate-m6-cycle-ownership` - exit `1`, expected. The in-memory mutant set
  `m6DecisionOwnsMainCycle=true`; Scenario A then lost its legacy selected
  action and the verifier rejected it.
- final `git status --porcelain=v1` and identity checks - exit `0`, status
  count `0`; `HEAD` and the remote branch still matched the implementation.

Both mutation controls are self-cleaning. No runtime, fixture, verifier,
package, configuration, testbed, JSON, Markdown or other generated artifact
remained in the exact-SHA worktree. This file is the only verification
evidence authored after the implementation commit.

## Focused results

The same-contract product scenario now stages all affordability inputs at the
scenario boundary. When an explicit scenario resource overlay is active, the
Territory amount helper no longer consults the imported player's hidden live
bank through `unit.maxCostMet()`. It checks one real unit cost against every
explicitly staged resource and returns the conservative exact amount `1`, or
fails closed with `0`.

The deterministic engine ETA override also sets the corresponding buyable
flag from the same ETA. The selected active target and the scenario's buyable
state can therefore no longer disagree.

On the fixed production-formula state:

1. Territory `swarmling x1` and House of Mirrors both match Expansion ETA,
   seconds, milestone-ETA basis, and `medium` / `1800` seconds;
2. the Territory ETA improvement is `6.386474672955218e+22` seconds;
3. the House of Mirrors calibrated delta is
   `2.846589421229203e+24` seconds, so the advisor-only action honestly wins;
4. the winner remains `ADVISOR_ONLY`, has no execution key, and grants no M6
   execution authority;
5. because `m6DecisionOwnsMainCycle` remains `false`, the ordinary reversible
   legacy path is not suppressed.

Live purchase acceptance independently proves both sides of that ownership
boundary. Scenario A bought a real legacy `drone` while M6 authority was
false. Scenario B executed the exact M6-authorized `swarmling x3` purchase
with one main action and matching fingerprint.

## Discarded non-acceptance observations

An earlier exact-SHA attempt against superseded implementation `782ef062` was
discarded. Its ownership mutation failed as intended but used `process.exit`,
which terminated before the `finally` cleanup and left untracked strategy-
audit artifacts. Commit `295fd71` changes that failure path to
`process.exitCode`, and this verification proves cleanup completes.

A focused live-purchase run made before the final implementation commit had a
single transient Scenario B browser result with M6 authority `false`; an
immediate retry passed. That precommit run is not acceptance evidence. The
detached exact-SHA full suite subsequently passed both real live scenarios.

## Remaining legacy-owned coverage inventory

The main Smart cycle still deliberately retains these legacy-owned paths when
M6 has not executed an exact bounded winner:

- engine guard and larva-engine progression;
- critical production upgrades;
- Energy guard and ordinary post-Nexus Energy progression;
- Clone Ramp, Clone Buffer and zero-budget hard-lock recovery;
- unlock planner;
- generic Smart upgrades and Smart units;
- final Clone preparation.

The inventory is an ownership declaration, not proof of equivalent M6
proposal coverage. WAIT and UNCERTAIN still do not prove that every safe
normal legacy action was considered.

## Preserved invariants and verdict

No live product strategy, safety threshold, protected-resource rule, action
budget, auto-cast default, ability authority, Ascension authority or purchase
command was widened. The runtime change is active only inside the explicit
scenario harness. The canonical userscript remains generated from the
configured runtime source.

Phase 3 slice 5 is valid. The previously claimed advisor-winner scenario was
not trustworthy because its overlay could borrow hidden affordability from
the imported live save. That laboratory shortcut is closed, detected by an
independent mutation, and the real advisor-only winner now coexists with a
working reversible legacy fallback.

Global execution ownership remains `NO_GO`. This proof establishes fallback
preservation for one honest same-contract state; it does not establish full
proposal coverage or WAIT completeness.
