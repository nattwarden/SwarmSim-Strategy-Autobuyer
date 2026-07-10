# SwarmSim Strategy Autobuyer 0.12.1 Laboratory Live Runner

- Verdict: `0.12.1 LABORATORY LIVE RUNNER VERIFIED`
- Commit: `unknown`
- Userscript hash: `sha256:75c4d7d58f6c32ab3a9db352a649b4411d1be8d6cce1bafdc607219635f47b60`

## Gate Matrix
- dev off / live off: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live off: capture LABORATORY_LIVE_MODE_DISABLED, run LABORATORY_LIVE_MODE_DISABLED, capture+run LABORATORY_LIVE_MODE_DISABLED
- dev off / live on: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live on: capture ok, run ok, capture+run ok

## Empty State
- Snapshot hash: `sha256:99b96d08165cacc0948787b347d20d7bdd94d2b1e78d6bf622273e1852038c40`
- Validity: `valid-with-warnings`
- Runs: `6`

## Fixture State
- Verified positive HoM units before capture: `4`
- Stable snapshot hash: `true`
- Stable experiment hash: `true`
- Changed input different hash: `true`
- Runs: `6`
- Clone legal: `true`
- HoM legal: `true`
- WAIT legal: `true`
- HoM affected territory/sec before: `232508714464.99997`
- HoM territory/sec after: `465017428930.99994`
- HoM delta vs WAIT at 60s: `232508714465.00003`

## Exports
- JSON runs: `6`
- CSV rows: `6`
- Markdown has 60s: `true`
- Markdown has 300s: `true`
- Markdown has summary: `true`
- Markdown live-state true: `true`
- Regression not export source: `true`

## Regression
- Normal order: 14 scenarios / 16 cycles / 38 invariants / 0 failures / 0 setup errors / 0 runtime errors
- Reverse order: 14 scenarios / 16 cycles / 38 invariants / 0 failures / 0 setup errors / 0 runtime errors

## Copy Summary
```text
Script version: 0.12.1
Capture mode: live-read-only
Phase: unknown
Milestone: unknown
Energy: 1000000
Reserve: 0
Snapshot validity: valid-with-warnings
Clone Larvae legal/status: legal / ok
House of Mirrors legal/status: legal / ok
60s: WAIT:ok | CLONE_LARVAE:ok | HOUSE_OF_MIRRORS:ok
300s: WAIT:ok | CLONE_LARVAE:ok | HOUSE_OF_MIRRORS:ok
Observations: Meat/sec is unchanged because Phase 1 does not spend added larvae.
House of Mirrors leads for territory production at 300 seconds.
House of Mirrors shortens Expansion ETA compared with WAIT.
Non-mutation proof: {
  "structuralBeforeHash": "sha256:a39a58d7afc4d7c33ccae5f01c2cdf20bf0a989b4d0eec415558111472f1d798",
  "structuralAfterHash": "sha256:a39a58d7afc4d7c33ccae5f01c2cdf20bf0a989b4d0eec415558111472f1d798",
  "structuralUnchanged": true,
  "elapsedSeconds": "0.017",
  "resourceDrift": {
    "energy": {
      "before": "1000000",
      "perSecond": "0",
      "elapsedSeconds": "0.017",
      "expectedAfter": "1000000",
      "actualAfter": "1000000",
      "drift": "0",
      "tolerance": "1e-12",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed-with-energy-cap"
    },
    "larva": {
      "before": "1e+400",
      "perSecond": "1",
      "elapsedSeconds": "0.017",
      "expectedAfter": "1e+400",
      "actualAfter": "1e+400",
      "drift": "0",
      "tolerance": "1e+382",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    },
    "cocoon": {
      "before": "1e-400",
      "perSecond": "0",
      "elapsedSeconds": "0.017",
      "expectedAfter": "1e-400",
      "actualAfter": "1e-400",
      "drift": "0",
      "tolerance": "1e-18",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    },
    "territory": {
      "before": "930039857.86",
      "perSecond": "232508714465",
      "elapsedSeconds": "0.017",
      "expectedAfter": "4882688003.765",
      "actualAfter": "4882688003.765",
      "drift": "0",
      "tolerance": "11625435723.25",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    },
    "meat": {
      "before": "1.23456789012345678901234567890123456789e+39",
      "perSecond": "0",
      "elapsedSeconds": "0.017",
      "expectedAfter": "1.234567890123456789e+39",
      "actualAfter": "1.23456789012345678901234567890123456789e+39",
      "drift": "12345678901234567890",
      "tolerance": "1.234567890123456789e+21",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    }
  },
  "resourceDriftWithinExpectedRange": true,
  "warnings": [],
  "unchanged": true
}
Snapshot hash: sha256:1fda6b8bfef92d2affb46587f1960d058bd2e197d66e95bd2f39c377ed987bfa
Experiment hash: sha256:630b74cc7500f4af5fda9c8baf2cc67dad76788d4162eb3beec5c862caa3d21c
```

