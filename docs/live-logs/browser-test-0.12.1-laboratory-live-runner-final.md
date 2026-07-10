# SwarmSim Strategy Autobuyer 0.12.1 Laboratory Live Runner

- Verdict: `0.12.1 LABORATORY LIVE RUNNER VERIFIED`
- Commit: `021591bce42797ce3e71be07e0564c6bc20e1f06`
- Userscript hash: `sha256:f8097906a90b1776f705be5bfa5667bccf2b31bca91606bc6b7f438da92ad645`

## Gate Matrix
- dev off / live off: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live off: capture LABORATORY_LIVE_MODE_DISABLED, run LABORATORY_LIVE_MODE_DISABLED, capture+run LABORATORY_LIVE_MODE_DISABLED
- dev off / live on: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live on: capture ok, run ok, capture+run ok

## Empty State
- Snapshot hash: `sha256:44fa445f945d56c3fb423221de8a8cbde06f5053103391e9bc53306f0012a394`
- Validity: `valid-with-warnings`
- Runs: `4`

## Fixture State
- Stable snapshot hash: `true`
- Stable experiment hash: `true`
- Changed input different hash: `true`
- Runs: `6`
- Clone legal: `true`
- HoM legal: `true`
- WAIT legal: `true`

## Regression
- Normal order: 14 scenarios / 16 cycles / 38 invariants / 0 failures / 0 setup errors / 0 runtime errors
- Reverse order: 14 scenarios / 16 cycles / 38 invariants / 0 failures / 0 setup errors / 0 runtime errors

## Copy Summary
```text
Script version: 0.12.1
Capture mode: live-read-only
Phase: unknown
Milestone: unknown
Energy: 1000001
Reserve: 15
Snapshot validity: valid-with-warnings
Clone Larvae legal/status: illegal / unknown
House of Mirrors legal/status: illegal / unknown
60s: 
300s: 
Observations: 
Safety warnings: 
Formula warnings: 
Live-state verification: {}
Snapshot hash: sha256:48d1d6cfbe00aa6a79f742e75e41f003abed537eb4125688315f20ebde935e4e
Experiment hash: 
```

