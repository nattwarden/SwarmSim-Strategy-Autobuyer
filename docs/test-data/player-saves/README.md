# Player-reported live saves

New player-reported SwarmSim saves are added here as separate,
provenance-documented fixtures. Never overwrite an existing pinned save in
place (see `docs/test-data/clone-ramp/README.md` for the original pinned
fixture and that rule).

## live-user-save-2026-07-18.txt

Fixture identity:

- SHA-256: `97701a5bbef86c48ba73ee4006d69670370347788058b696ddcfcad77ef50805`
- format prefix: `MS4xLjE3|`
- source class: player-reported live save, provided 2026-07-18
- lineage: a later state of the same player run as the pinned
  `docs/test-data/clone-ramp/live-user-save.txt` (same format prefix and
  header; clear monotonic progression of the same economy)

Import verified 2026-07-18 against the production `https://www.swarmsim.com/`
via `game.importSave` in a disposable headless-Chrome session (same method as
`scripts/check-default-user-save.js`), with this observed post-import
snapshot:

- meat: `3.2467044076288414179e+179`
- larva: `6.0938415569096483239e+26`
- territory: `4.1263190878773047163e+142`
- energy: `100107.43942878645344`
- nexus: `5`
- drone: `7.6077814583185599712e+157`
- moth: `9000`
- mutagen: `0`

A first paste of this save arrived corrupted in chat transport (the game's
own decoder rejected it); this tracked copy is the re-sent string that
imports cleanly. No verifier consumes this fixture yet; the default-save
import check and SA1 anchor still use the original pinned clone-ramp save.
Adopting this newer save for any check requires its own work order and
evidence run.

## manual-play-early-pre-ascension-2026-07-18.txt

Fixture identity:

- SHA-256: `15d8b98302f833d4d8d2dc596def6fdb421d21e7fc2b955ba4462e58a01f22ff`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: late early game, post-Twin Drones, Territory, Swarmlings,
  Stingers, and multiple Hatchery/Expansion steps; before first Ascension

This is a reproducible branch point for comparing legal player choices from
one shared state. It is not an active verifier fixture and must not replace a
pinned fixture or be imported into a player's normal save. Any adoption into a
test or production-strategy claim requires a dedicated work order, clean
import verification, and separate evidence.

## manual-play-first-nest-threshold-2026-07-18.txt

Fixture identity:

- SHA-256: `a86d8524e351fd3034ff4fe89e10644713a40f87a69e00ca55b19bf5d5076cbd`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: first Nest is buildable; 1,000 Queens, Faster Queens I,
  Twin Drones II, and Territory are already unlocked

This fixture is the branch point for the first-Nest sacrifice/rebuild choice.
It is not an active verifier fixture and must not replace a pinned fixture or
be imported into a player's normal save. Any adoption into a test or
production-strategy claim requires a dedicated work order, clean import
verification, and separate evidence.

## manual-play-expansion-10-territory-loop-2026-07-18.txt

Fixture identity:

- SHA-256: `f26e2e33eea8446eafb6d1ea62f337829c6034c6874f39dd490c9eef5aaa18ae`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: seven Hatcheries, ten Expansions, 100 Stingers, and the
  first measured Stinger-to-Expansion Territory bridge; before first Ascension

This fixture is a later early-game branch point for comparing the next
Territory, meat, and sacrifice-reserve decisions. Native import applies the
game's offline-production catch-up, so it is not an exact frozen economic
branch without elapsed-time control. It is not an active verifier fixture and
must not replace a pinned fixture or be imported into a player's normal save.

## manual-play-expansion-12-stinger-bridge-2026-07-18.txt

Fixture identity:

- SHA-256: `94aa77e5c39ca4aea527b06c89a1091959dd1bd5d854c793d48f9c334d41f329`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: eight Hatcheries, twelve Expansions, 600 Stingers, and
  the validated bounded Stinger-to-Expansion bridge; before first Ascension

This fixture preserves the later early-game branch after the second measured
Territory gate. Native import applies the game's offline-production catch-up,
so it is not an exact frozen economic branch without elapsed-time control. It
is not an active verifier fixture and must not replace a pinned fixture or be
imported into a player's normal save.

## manual-play-twin-queens-ii-2026-07-18.txt

Fixture identity:

- SHA-256: `9c2c7e61a9b24834b092b5089eab7f1f593b2aadc2cf15761ababdb2651b789f`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: Hatchery 9, Expansion 14, 16 remaining Nests, and Twin
  Queens II (`x4` manual Queen hatching); before first Ascension

This fixture records the concrete Twin Queens II tradeoff after a reserve-safe
Queen-to-Nest ramp. Native import applies the game's offline-production
catch-up, so it is not an exact frozen economic branch without elapsed-time
control. It is not an active verifier fixture and must not replace a pinned
fixture or be imported into a player's normal save.

## manual-play-active-chain-pre-ascension-2026-07-18.txt

Fixture identity:

- SHA-256: `c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: the active meat chain (Faster Nests I, Faster Queens II,
  Faster Drones III), Twin Drones V, Twin Queens II, Accomplished Ancestry II,
  Hatchery 10, Expansion 16, and Culicimorph; before first Ascension

This fixture is the preferred current late-early-game branch for testing
active bottleneck choices. Native import applies the game's offline-production
catch-up, so it is not an exact frozen economic branch without elapsed-time
control. It is not an active verifier fixture and must not replace a pinned
fixture or be imported into a player's normal save.

## manual-play-twin-queen-iii-nest-1200-2026-07-18.txt

Fixture identity:

- SHA-256: `14ed159605a9f902f79c200005113b94060f5417969d8c87b6e17c9c2af78298`
- format prefix: `MS4xLjE3|`
- source class: manually played, script-free browser session captured on
  2026-07-18
- progression scope: pre-Ascension active-chain state with Hatchery 11,
  Expansion 17, Twin Queens III (`x8` manual Queen hatching), and 1,200
  Nests; Twin Queens IV is unlocked but intentionally unbought because its
  1,000-Nest cost would consume the entire just-unlocked Nest stock.

This fixture is the branch point for evaluating the reserve-safe ramp to Twin
Queens IV against direct Nest growth and the Greater Queen target. Native
import applies the game's offline-production catch-up, so it is not an exact
frozen economic branch without elapsed-time control. It is not an active
verifier fixture and must not replace a pinned fixture or be imported into a
player's normal save.

## manual-play-first-nexus-baseline-2026-07-21.txt

Fixture identity:

- SHA-256: `3f5138065ceaf84c83a28d5965a5b4e53113dea32686553ab00bdba6f321bd90`
- format prefix: `MS4xLjE3|`
- source class: **not script-free.** Derived from
  `manual-play-twin-nests-v-baseline-2026-07-18.txt` re-imported into the in-app
  browser, then advanced by a single engine-driven `nexus1` purchase
  (`game._upgrades.byName.nexus1.buy()`) to capture the first Energy/Nexus
  state. Lineage is otherwise the same player run.
- progression scope: first Nexus built — 1 Nexus, energy ~2,001 (from the
  `+2,000` `nexus1` build burst), 10,000 Greater Queens with Faster Greater
  Queens I, Hatchery 18, Expansion 31; `nexus2` visible, `premutagen`/`mutagen`
  still locked (pre-Ascension).

This is the pinned branch point for energy-phase and first-Ascension tactic
tests documented in BOOK-07 (the ascend-cost-decay finding). The meat bank is
offline-catch-up inflated by native import, which is precisely why `nexus1` is
affordable here even though the live run never banked past the 333.33B Nexus
gate; treat any timing/ETA read from it as a test artifact and compare only
action deltas and rates. Round-trip import restores 10,000 Greater Queens and
1 Nexus cleanly on production `v1.1.17`. It is not an active verifier fixture
and must not replace a pinned fixture or be imported into a player's normal
save.
