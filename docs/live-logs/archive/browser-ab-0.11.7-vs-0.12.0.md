# Browser A/B 0.11.7 vs 0.12.0

- A commit: `1ee631901cd04a1d97ddb0bcee5efa2499481ecc`
- A userscript hash: `sha256:8a028f012fecd5126d624e933b0684e05ab18ecb40ec6ac9d2c9134958c6cce0`
- B commit: `366617602f1e25087378d630490cb96df8b25f71`
- B userscript hash: `sha256:c15700944bb1b7bcc0849e228c3cfbea14a4caebd39a5069deddeb18cc46770b`
- Shared Playwright: `1.61.1`
- Shared Chromium: `149.0.7827.55`
- Shared viewport: `1365x900`
- Shared locale/timezone: `en-US` / `UTC`
- Classification: `CLEAN-PROFILE BASELINE REPRODUCIBILITY FAILURE`

## Results

- A failed invariants: 6
- B failed invariants: 6
- First differing field: none

## Root Cause

The same six failures reproduce with the same actual values in the frozen 0.11.7 runtime and the 0.12.0 Laboratory implementation when both run in the same clean Playwright profile. The Laboratory implementation is not the cause; the previous 0.11.7 browser evidence is not reproducible in this clean verifier.

## Recommended Narrow Fix

Make the deterministic scenario setup self-contained for a clean browser profile, especially Energy/Lepidoptera unlock state for R2/R3 and forced meat-plan runtime availability for R8. Do not change Laboratory snapshot logic.

## Failure Signatures

```json
{
  "a": [
    {
      "id": "r2-role",
      "field": "energySupportLepidopteraRole",
      "actual": "wait"
    },
    {
      "id": "r3-role",
      "field": "energySupportLepidopteraRole",
      "actual": "wait"
    },
    {
      "id": "r3-best-use",
      "field": "energySupportBestUse",
      "actual": "wait"
    },
    {
      "id": "r3-advisor",
      "field": "momentumPrimaryAdvisor",
      "actual": "Flesh Smith"
    },
    {
      "id": "r3-speaker",
      "field": "activeCouncilSpeaker",
      "actual": "Flesh Smith"
    },
    {
      "id": "r8-c1-parent-step",
      "field": "parentStepDecision",
      "actual": "HOLD"
    }
  ],
  "b": [
    {
      "id": "r2-role",
      "field": "energySupportLepidopteraRole",
      "actual": "wait"
    },
    {
      "id": "r3-role",
      "field": "energySupportLepidopteraRole",
      "actual": "wait"
    },
    {
      "id": "r3-best-use",
      "field": "energySupportBestUse",
      "actual": "wait"
    },
    {
      "id": "r3-advisor",
      "field": "momentumPrimaryAdvisor",
      "actual": "Flesh Smith"
    },
    {
      "id": "r3-speaker",
      "field": "activeCouncilSpeaker",
      "actual": "Flesh Smith"
    },
    {
      "id": "r8-c1-parent-step",
      "field": "parentStepDecision",
      "actual": "HOLD"
    }
  ]
}
```

## Differing Comparable Fields

- none
