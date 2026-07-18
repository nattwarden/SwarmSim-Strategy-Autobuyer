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
