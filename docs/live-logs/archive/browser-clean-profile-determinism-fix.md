# Browser Clean Profile Determinism Fix

- Verdict: `0.12.0 LABORATORY PHASE 1A VERIFIED`
- Classification: `CLEAN-PROFILE DETERMINISM FIX VERIFIED`
- Baseline commit: `1ee631901cd04a1d97ddb0bcee5efa2499481ecc`
- Implementation commit: `366617602f1e25087378d630490cb96df8b25f71`
- Scenario definitions commit: `8b4c65fd6d76b402a5d8ef05c917bbf198c23f66`
- Scenario definitions hash: `sha256:2a8824a9e23c495cb0ba819000f913eedabded0762858164e284eae57bbe5a4f`

## Gates

- Expected totals: 14 scenarios, 16 cycles, 38 invariants, 0 failures/setup/runtime errors
- All runs pass totals: PASS
- A normal hashes identical: PASS
- B normal hashes identical: PASS
- Reverse order pass: PASS
- Deterministic random order pass: PASS
- Final Laboratory snapshot: `0.12.0 LABORATORY PHASE 1A VERIFIED`

## Runs

| Label | Commit | Order | Verdict | Hash | Hydration | Failures |
|---|---|---:|---|---|---:|---:|
| a-normal-1 | `1ee6319` | normal | PASS | `sha256:25229c6c9293a014cd56e3513278ba57da05f5e6c25ec8c66ed27bbdbf9eff40` | PASS (261 ms) | 0 |
| a-normal-2 | `1ee6319` | normal | PASS | `sha256:25229c6c9293a014cd56e3513278ba57da05f5e6c25ec8c66ed27bbdbf9eff40` | PASS (264 ms) | 0 |
| a-normal-3 | `1ee6319` | normal | PASS | `sha256:25229c6c9293a014cd56e3513278ba57da05f5e6c25ec8c66ed27bbdbf9eff40` | PASS (272 ms) | 0 |
| a-reverse | `1ee6319` | reverse | PASS | `sha256:c2bae64328b9cdcfd049722375669aa3ad45117b0ba0e9fe3fd172297f6af07e` | PASS (259 ms) | 0 |
| a-random | `1ee6319` | random | PASS | `sha256:93bdb73bd5372cce435e5198b2a65cf037c7a8b18453a37414af1cf4e1923736` | PASS (273 ms) | 0 |
| b-normal-1 | `3666176` | normal | PASS | `sha256:d5b707196d06dba882b81ea6f73d8ab912401aaf58b42fc6fa172ac4a5782286` | PASS (262 ms) | 0 |
| b-normal-2 | `3666176` | normal | PASS | `sha256:d5b707196d06dba882b81ea6f73d8ab912401aaf58b42fc6fa172ac4a5782286` | PASS (274 ms) | 0 |
| b-normal-3 | `3666176` | normal | PASS | `sha256:d5b707196d06dba882b81ea6f73d8ab912401aaf58b42fc6fa172ac4a5782286` | PASS (258 ms) | 0 |
| b-reverse | `3666176` | reverse | PASS | `sha256:0174cdf430ce07bd20c59971a87cc1395f420ac7997bdc77baa1a5f0dfd86cde` | PASS (270 ms) | 0 |
| b-random | `3666176` | random | PASS | `sha256:a9a3653e9f4a76e72c7852252436b53aef18670efc7f420bf69bbc8150239f09` | PASS (268 ms) | 0 |

## Fixed Scope

- R2 clean-profile resource/unit hydration for role selection
- R3 clean-profile Lepidoptera and advisor role reproducibility
- R8 parent-step to parent-refill transition preconditions
- runtime hydration gate before scenario execution
- scenario order and repeatability checks

## Final Snapshot

- Snapshot A hash: `sha256:c0391abfd124f1bb394404a2b5bb5072c00e43933d839f8f821d99d43031ef96`
- Snapshot B hash: `sha256:c0391abfd124f1bb394404a2b5bb5072c00e43933d839f8f821d99d43031ef96`
- Snapshot C hash: `sha256:1aed0f99b7feff5be15a9b1e90b79fc22404d71997528848130450d1dacdec70`
- Regression scenarios/cycles/invariants: 14/16/38
- Regression failed invariants: 0
