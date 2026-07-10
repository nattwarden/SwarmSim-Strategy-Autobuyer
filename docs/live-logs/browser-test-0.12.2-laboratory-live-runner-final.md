# SwarmSim Strategy Autobuyer 0.12.2 Laboratory Live Runner

- Verdict: `0.12.2 LABORATORY LIVE RUNNER VERIFIED`
- Commit: `unknown`
- Userscript hash: `sha256:c5395a90900478cb1f0f014538a130d672d5dfe2831ff2deba7040d198bacc66`

## Gate Matrix
- dev off / live off: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live off: capture LABORATORY_LIVE_MODE_DISABLED, run LABORATORY_LIVE_MODE_DISABLED, capture+run LABORATORY_LIVE_MODE_DISABLED
- dev off / live on: capture LABORATORY_DISABLED, run LABORATORY_DISABLED, capture+run LABORATORY_DISABLED
- dev on / live on: capture ok, run ok, capture+run ok

## Empty State
- Snapshot hash: `sha256:a5d597e1779c1337e18616ca22ce722b5493464aaeea23aa326eeb62e312b1a9`
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
Script version: 0.12.2
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
Observations: WAIT is valid at both horizons.
Meat/sec is unchanged because Phase 1 does not spend added larvae.
House of Mirrors leads for territory production at 300 seconds.
House of Mirrors shortens Expansion ETA compared with WAIT.
The snapshot is valid with formula provenance warnings.
Non-mutation proof: {
  "structuralBeforeHash": "sha256:a39a58d7afc4d7c33ccae5f01c2cdf20bf0a989b4d0eec415558111472f1d798",
  "structuralAfterHash": "sha256:a39a58d7afc4d7c33ccae5f01c2cdf20bf0a989b4d0eec415558111472f1d798",
  "structuralUnchanged": true,
  "elapsedSeconds": "0.019",
  "resourceDrift": {
    "energy": {
      "before": "1000000",
      "perSecond": "0",
      "elapsedSeconds": "0.019",
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
      "elapsedSeconds": "0.019",
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
      "elapsedSeconds": "0.019",
      "expectedAfter": "1e-400",
      "actualAfter": "1e-400",
      "drift": "0",
      "tolerance": "1e-18",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    },
    "territory": {
      "before": "1162548572.325",
      "perSecond": "232508714465",
      "elapsedSeconds": "0.019",
      "expectedAfter": "5580214147.16",
      "actualAfter": "5580214147.16",
      "drift": "0",
      "tolerance": "11625435723.25",
      "withinExpectedRange": true,
      "normalizationMethod": "passive-rate-plus-elapsed"
    },
    "meat": {
      "before": "1.23456789012345678901234567890123456789e+39",
      "perSecond": "0",
      "elapsedSeconds": "0.019",
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
Snapshot hash: sha256:640b846419e950ce37fea3d95f5272ae9a88bb779ba8fede467b1b66bc5e49d1
Experiment hash: sha256:8147d03f9270c4c7514f2ffe011bfe03e805e55164b44586a77578d815102c76
```

