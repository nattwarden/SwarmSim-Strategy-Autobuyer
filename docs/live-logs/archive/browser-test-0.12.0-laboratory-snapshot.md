# Browser Test 0.12.0 Laboratory Snapshot

- Implementation commit: `366617602f1e25087378d630490cb96df8b25f71`
- Branch: `feature/0.12.0-laboratory-snapshot-foundation`
- Browser mode: `local-playwright-chromium-clean-profile`
- Script version: `0.12.0`
- Page URL: https://www.swarmsim.com/#/
- Verdict: `0.12.0 LABORATORY PHASE 1A REQUIRES PATCH`

## Gate Matrix

| Scenario harness | Laboratory | Result | Message |
|---|---|---|---|
| off | off | denied | Laboratory API is not exposed when the development gate is off. |
| on | off | denied | Laboratory API is not exposed when the development gate is off. |
| off | on | denied | Scenario harness is disabled. Enable explicitly with localStorage key kbcSwarmBotScenarioHarnessEnabled_v1=true. |
| on | on | allowed |  |

## Hashes

- Snapshot A: `sha256:c0391abfd124f1bb394404a2b5bb5072c00e43933d839f8f821d99d43031ef96`
- Snapshot B: `sha256:c0391abfd124f1bb394404a2b5bb5072c00e43933d839f8f821d99d43031ef96`
- Snapshot C: `sha256:1aed0f99b7feff5be15a9b1e90b79fc22404d71997528848130450d1dacdec70`
- A/B deterministic hash pass: PASS
- A/B payloads equal excluding capturedAt: PASS
- Changed input changes hash: PASS

## Schema And Provenance

- Root schema fields: PASS
- Provenance pinned: PASS
- Source repository: https://github.com/swarmsim/swarm
- Source commit: `06b4f404aa324a0b454348508cfa63d5c0f1ff54`
- Large values as strings: PASS

## Clone Larvae

- Ability id: `clonelarvae`
- Available: true
- Unavailable reason: null
- Energy cost: `12000`
- Combined bank: `900720048930888312350`
- Combined velocity: `123456.789`
- Cap seconds: `100000`
- Ability power: `1`
- Runtime preview output: `null`

## House Of Mirrors

- Ability id: `clonearmy`
- Available: true
- Energy cost: `2500`
- Affected unit ids exact: PASS
- Affected territory/sec: `26759423381502672470`
- Unaffected territory/sec: `0`
- Sum equals total territory/sec: PASS
- Runtime preview after: `null`

## Meat And Expansion

- Meat coefficient count: 2
- Meat maxDegree: 1
- Meat t=0: `1000000`
- Runtime meat/sec: `1000000`
- Meat t=0 matches runtime: PASS
- Expansion remaining: `0`
- Expansion expected remaining: `0`
- Expansion ETA: `3600`
- Expansion computed ETA: `0`
- Expansion ETA comparison: `runtime-differs-or-scenario-overridden`

## Non-Mutation

- Resources unchanged: PASS
- Run history unchanged: PASS

## Regression

- Scenarios: 14
- Cycles: 16
- Invariants: 38
- Failed invariants: 6
- Setup errors: 0
- Runtime errors: 0
- H3: PASS
- H4: PASS
- H5: PASS
- R2: FAIL
- R3: FAIL
- R8: FAIL

## Regression Failures

- r2-role: energySupportLepidopteraRole expected `background`, actual `wait`
- r3-role: energySupportLepidopteraRole expected `primary`, actual `wait`
- r3-best-use: energySupportBestUse expected `lepidoptera`, actual `wait`
- r3-advisor: momentumPrimaryAdvisor expected `Beetle Magus`, actual `Flesh Smith`
- r3-speaker: activeCouncilSpeaker expected `Beetle Magus`, actual `Flesh Smith`
- r8-c1-parent-step: parentStepDecision expected `BUY`, actual `HOLD`

## Safety Defaults

- autoCastAbilities: false
- autoAscend: false
- energySupportBrokerAllowAutoCast: false

## Warnings

- Runtime Git SHA is unavailable in Tampermonkey; source.currentCommit is null by design.
- Clone Larvae direct runtime preview is not used with scenario overrides; source-verified Laboratory inputs are captured instead.
- House of Mirrors direct runtime territory/sec preview is unavailable; source-verified affected-unit inputs are captured instead.
