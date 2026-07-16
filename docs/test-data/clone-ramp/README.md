# Pinned live user save

`live-user-save.txt` is a player-reported SwarmSim save captured for the
bounded Clone Ramp work and first tracked in commit
`47bc9401c8a8d8ae7b71b4c7040604e3ad1bf187`.

Fixture identity:

- SHA-256: `58933a235c0a442e8f6bfcafd5f01a9f97fa2a61a410507692f5d19437a9f5ec`
- format prefix: `MS4xLjE3|`
- source class: player-reported live save

The same bytes had previously been referenced locally as
`docs/test-data/strategy-audit-0/default-user-save/save.txt`, but that path was
never tracked and made clean-checkout verification fail. The repository now
uses this single tracked copy for:

- Clone Ramp acceptance;
- Territory saturation real-save cases;
- the default-save import sanity check and SA1 anchor.

Verifier code checks the SHA-256 before importing the save. Do not overwrite
this fixture in place when a different game state is needed; add a new
provenance-documented fixture instead.
