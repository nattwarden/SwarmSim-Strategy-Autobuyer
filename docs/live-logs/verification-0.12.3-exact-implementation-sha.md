# Exact SHA Verification Provenance (0.12.3)

- Implementation SHA: c819c7d7adc8ab0280e06d25466f6697fb915409
- Implementation tree SHA: 31cd04d0be2ffe79801be62f48ad2debc4b95a86
- Verification worktree: C:/Users/info/OneDrive/Dokument/SwarmSim-verify-c819c7d
- Verification HEAD: c819c7d7adc8ab0280e06d25466f6697fb915409
- origin/main observed during verification: 9233ab1910227ff72a97c2a77ae1f29ec84ce0e6
- Evidence base SHA: c819c7d7adc8ab0280e06d25466f6697fb915409
- Node: v24.14.0
- npm: 11.9.0

## Command log

1. npm install
   - classification: PURE CHECK
   - exit code: 0
2. node scripts/validate-repo-guardrails.js
   - classification: PURE CHECK
   - exit code: 0
3. npm run build
   - classification: PURE CHECK
   - exit code: 0
4. npm run verify
   - classification: EVIDENCE GENERATOR
   - exit code: 0
5. npm run verify:0.12.0:laboratory:phase1
   - classification: EVIDENCE GENERATOR
   - exit code: 0
6. npm run verify:0.12.3:laboratory:effective-count
   - classification: EVIDENCE GENERATOR
   - exit code: 0
7. node .tmp-live-capture-0.12.3.js
   - classification: EVIDENCE GENERATOR
   - exit code: 0
8. git diff --check
   - classification: PURE CHECK
   - exit code: 0

## Evidence allowlist

- docs/live-logs/browser-test-0.12.0-laboratory-phase1.json
- docs/live-logs/browser-test-0.12.0-laboratory-phase1.md
- docs/test-data/0.12.0-laboratory/example-result.json
- docs/test-data/0.12.0-laboratory/example-result.csv
- docs/test-data/0.12.0-laboratory/example-result.md
- docs/live-logs/browser-test-0.12.3-laboratory-effective-count.json
- docs/live-logs/browser-test-0.12.3-laboratory-effective-count.md
- docs/test-data/0.12.3-laboratory/example-live-result.json
- docs/test-data/0.12.3-laboratory/example-live-result.csv
- docs/test-data/0.12.3-laboratory/example-live-result.md
- docs/test-data/0.12.3-laboratory/example-copy-summary.txt
- docs/test-data/0.12.3-laboratory/effective-count-diagnostics.json
- docs/live-logs/live-real-save-0.12.3-effective-count.json
- docs/live-logs/live-real-save-0.12.3-effective-count.md
