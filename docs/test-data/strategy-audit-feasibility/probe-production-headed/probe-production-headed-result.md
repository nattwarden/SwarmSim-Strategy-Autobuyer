# Strategy Audit Feasibility Probe: Production + Headed + Direct Injection

- Probe ID: FEAS-PROD-HEADED-001
- Started: 2026-07-10T12:50:40.665Z
- Completed: 2026-07-10T12:50:43.697Z
- Target URL: https://www.swarmsim.com/#/tab/territory
- Browser mode: headed
- Userscript: src/SwarmSim-Strategy-Autobuyer.user.js
- Userscript SHA256: sha256:1c1104d5f30ba2eef1e510aa926f27271386a1fa28b50dcfb2a08a2e9aa789e0

## Outcome
- Open visible game: YES
- Inject canonical userscript: YES
- Access game services: YES
- Stage harmless state: YES
- Run planner cycle: YES
- Show Council/Inspector data: YES
- Screenshot captured: YES
- Trace captured: YES
- Pause/leave-open support: YES
- Reset/no normal-profile mutation: YES

## Planner Snapshot
- Active council speaker: Flesh Smith
- Council winning lane: Meat
- Decision: ADVISE BUY
- Main decision: BUY
- Best allowed action: drone × 1
- Best rejected action: Army seed

## Artifacts
- Screenshot: docs/test-data/strategy-audit-feasibility/probe-production-headed/probe-production-headed.png
- Trace: docs/test-data/strategy-audit-feasibility/probe-production-headed/probe-production-headed-trace.zip
- JSON: docs/test-data/strategy-audit-feasibility/probe-production-headed/probe-production-headed-result.json
- Markdown: docs/test-data/strategy-audit-feasibility/probe-production-headed/probe-production-headed-result.md

## Notes
- The probe uses scenarioHarness overrides to construct the question state only.
- It does not force lane winners, BUY/HOLD output, or action execution.
- The overlay is read-only and independent from planner ranking.
