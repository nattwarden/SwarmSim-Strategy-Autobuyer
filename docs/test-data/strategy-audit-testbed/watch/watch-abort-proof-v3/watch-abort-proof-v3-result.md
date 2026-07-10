# Strategy Audit Testbed - WATCH Result

- Run ID: watch-abort-proof-v3
- Started: 2026-07-10T13:37:28.597Z
- Completed: 2026-07-10T13:37:34.431Z
- URL: https://www.swarmsim.com/#/tab/territory
- Userscript: src/SwarmSim-Strategy-Autobuyer.user.js
- Userscript SHA256: sha256:1c1104d5f30ba2eef1e510aa926f27271386a1fa28b50dcfb2a08a2e9aa789e0
- Verdict: PARTIAL
- Partial result: yes

## Cycle Summary
- cycle 1: decision=BUY, action=drone × 3, lane=Meat, assessment=BAD

## Control Test
- Pause blocked ms: 4790
- Next single-step behavior: pass
- Continue resumed auto cycles: fail
- Stop wrote partial: pass

## Artifacts
- JSON: docs/test-data/strategy-audit-testbed/watch/watch-abort-proof-v3/watch-abort-proof-v3-result.json
- Markdown: docs/test-data/strategy-audit-testbed/watch/watch-abort-proof-v3/watch-abort-proof-v3-result.md
- Screenshots: docs/test-data/strategy-audit-testbed/watch/watch-abort-proof-v3/cycle-01.png
- Trace: docs/test-data/strategy-audit-testbed/watch/watch-abort-proof-v3/trace.zip
- Video: none

## Notes
- Canary validates infrastructure contract only.
- No Strategy Audit 0 scenario matrix is executed.
- Planner output is observed from runOnce and never injected.
