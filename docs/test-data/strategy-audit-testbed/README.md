# Strategy Audit Testbed Artifacts

This folder stores permanent runner outputs for:

- `npm run strategy:audit:fast`
- `npm run strategy:audit:watch`
- `npm run strategy:audit:live`

## Subfolders

- `canary/`: fast/headless infrastructure canary outputs
- `watch/`: headed watch-mode outputs and cycle screenshots
- `live/`: production-parity canary outputs

## Artifact classes

Canonical acceptance evidence:

- selected JSON/Markdown run outputs explicitly referenced in release/process reports

Debug-only artifacts:

- extra traces/screenshots from local debugging runs

Regenerable outputs:

- canary JSON/Markdown outputs that can be recreated by rerunning commands

Optional artifacts:

- `trace.zip`
- video capture files (when enabled)
- per-cycle screenshots (watch mode)

To avoid unnecessary binary growth, default fast runs do not emit screenshots or video.

Feasibility outputs remain in the separate folder:

- `docs/test-data/strategy-audit-feasibility/`
