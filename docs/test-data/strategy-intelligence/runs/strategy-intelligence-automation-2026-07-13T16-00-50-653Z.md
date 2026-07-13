# Strategy Intelligence Automation Run

Generated: 2026-07-13T16:00:50.652Z
Target version: 0.13.0
All passed: false
Failed step: sa1-v2

## Steps
- build-check | PURE CHECK | exit=0 | durationMs=644
  command: npm run build:check
- version-surfaces | PURE CHECK | exit=0 | durationMs=518
  command: npm run check:0.13.0:versions
- lab-phase2a | PURE CHECK | exit=0 | durationMs=4819
  command: npm run check:laboratory:phase2a
- purchase-evaluator | PURE CHECK | exit=0 | durationMs=1732
  command: npm run check:purchase-evaluator
- sa1-single | EVIDENCE GENERATOR | exit=0 | durationMs=18917
  command: npm run strategy:audit:matrix:sa1:single
- sa1-v2 | EVIDENCE GENERATOR | exit=1 | durationMs=336611
  command: npm run strategy:audit:matrix:sa1:v2

## Coverage Gaps
- engine-save-window
- clone-hard-lock

## Failing Cases
- 1
