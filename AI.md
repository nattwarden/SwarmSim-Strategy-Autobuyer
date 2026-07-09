# AI.md — SwarmSim Strategy Autobuyer

Version: 2026-07-09-script-0.8.5-indexed
Status: Project source map for ChatGPT/Codex/AI agents.

## Syfte

Den här filen beskriver vilka filer som hör till SwarmSim-projektet och hur en AI-assistent, Codex eller kodagent ska använda dem.

Målet är att undvika att agenten gissar, bygger mot fel version eller blandar ihop faktisk script-source, spelmodell/strategisk sanning, externa referenser och äldre backupmaterial.

## Primär läsordning

1. `AI.md`
2. `docs/SWARMSIM_GAME_MODEL-2026-07-09-github-first.txt`
3. `src/SwarmSim-Strategy-Autobuyer.user.js`
4. Relevanta referenser vid behov:
   - `reference/REFERENCE_SwarmSim_ichbinsisyphos_2015.txt`
   - `reference/REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt`
   - `reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt`

Från och med 0.8.0 är `src/SwarmSim-Strategy-Autobuyer.user.js` den enda kanoniska scriptsourcen.

## Source-of-truth hierarchy

### 1. Strategisk sanning

`docs/SWARMSIM_GAME_MODEL-2026-07-09-github-first.txt`

Detta styr önskat beteende för Smart Mode, Advisor, Energy/Nexus, Meat-chain, reserve/payback, Cascade/Twin-riktning och target-aware upgrade/twin support.

### 2. Faktisk kodbas

`src/SwarmSim-Strategy-Autobuyer.user.js`

Aktuell Tampermonkey-source (kanonisk och enda körbara scriptsource).

### 3. Dokumentation och releasehistorik

- Dokumentation finns i `.md`-filer.
- `releases/` innehåller dokumentation (README/release notes), inte scriptkopior.
- Versionerad releasehistorik hanteras via Git commits/tags.

Policy från 0.8.0 och framåt:

- Ingen `.txt` script-mirror.
- Ingen duplicerad `.user.js` i `releases/`.
- Installationskälla för Tampermonkey är alltid `src/SwarmSim-Strategy-Autobuyer.user.js` vid rätt tag/commit.

Tekniska fakta:

- Script: SwarmSim Strategy Autobuyer
- Version: 0.8.5
- Körs på `swarmsim.com`, `www.swarmsim.com`, `swarmsim.github.io`
- Exponerar botten som `window.kbcSwarmBot`
- Använder Angular-services: `game`, `commands`, `$rootScope`

## Viktiga implementerade delar

0.8-serien innehåller:

- Smart Mode
- Advisor-logg
- Purchase-logg
- Strategy Bar
- separata Advisor- och Purchase-fönster
- AI-vänlig Markdown/JSON-export
- Strategy Inspector med `whyWaiting`
- Larva Engine Priority
- Production Upgrade-prioritet
- Energy Strategy
- Nexus target
- Lepidoptera ROI
- Nightbug/Bat HOLD-advisor i default Smart Mode
- Clone Larvae cocoon prep, side-task only
- Territory ROI med minimum-improvement guard
- Meat Goal Planner med lookahead
- Meat-chain reserve/payback guard
- Twin Prep med recovery-buffer
- Meat fallback queue
- Stall breaker diagnostics
- 0.7.7 active meat-action fallback floor
- 0.7.8 active action payback bypass fix
- 0.7.9 target-aware upgrade/twin support planner
- 0.8.0 unlock planner
- 0.8.0 clone buffer planner
- 0.8.0 ability prep planner (advisor-only)
- 0.8.1 clone buffer target-source hotfix
- 0.8.1 unlock candidate hotfix
- 0.8.2 clone buffer post-clone release-threshold hotfix
- 0.8.3 parent-step conversion hotfix
- 0.8.4 twin unlock threshold planner hotfix
- 0.8.5 twin unlock cost resource detection hotfix

## Nytt i 0.8.0

0.8.0 bygger vidare på 0.7.9 och adresserar nästa lucka i post-Nexus-läget: scriptet behöver kunna väga unlock-värde, clone-buffer-skydd och ability-prep utan att bli aggressivt.

```text
twin upgrades are handled by goal planner / chain prep, not generic safe-upgrade buying
```

0.8.0 lägger därför till:

- Unlock Planner för target-path parent-steps med konservativ payback-bypass endast när unlock-värde är konkret och reserve är trygg.
- Clone Buffer Planner med lägena BUILDUP, POST_CLONE_LOCK och MATURE.
- Ability Prep Planner i advisor-läge (PLAN/HOLD), utan default auto-cast.
- Globala larvae-spending guards som respekterar `cloneBufferSpendableLarvae`.

0.8.1 är en hotfix ovanpå 0.8.0. Den ändrar inte strategin, men rättar två felaktiga planner-beslut:

- Clone Buffer POST_CLONE_LOCK använder faktisk Clone Larvae-bank/debt när den finns, i stället för att falla tillbaka till full cap.
- Unlock Planner använder aktuell action-enhet som kandidat och rapporterar bottleneck-resursen korrekt.

0.8.2 är en hotfix ovanpå 0.8.1. Den ändrar inte strategin och ändrar inte säkra defaults, men rättar post-clone tail-chasing i Clone Buffer Planner:

- POST_CLONE_LOCK har nu tydlig completion-condition (percent/debt-ratio/absolut liten skuld).
- Hard lock släpps när återhämtning är effektivt klar i stället för att hårdlåsa vid avrundat 100%.
- POST_CLONE_LOCK använder snapshotad actual clone bank/debt target-källa för att undvika rörlig måljakt varje tick.
- Inspector/export visar nu recovery complete, completion threshold, target source och hard lock status.

0.8.3 är en hotfix ovanpå 0.8.2. Den ändrar inte strategin och ändrar inte säkra defaults, men rättar endless action-unit filler i unlock-läget:

- Unlock Planner kan nu välja direkt target-path parent step (t.ex. Neural Cluster över Hive Neuron) när parent-steget är buyable och reserv är trygg.
- Parent-step payback bypass är konservativ och begränsad till direkt parent-step conversion med tydlig reserve-tröskel.
- Parent-step conversion körs före generell action-unit filler och fallback i samma run.
- Inspector/export visar parent-step candidate/decision/reason/target/action/cost/reserve/bypass/supports-action.

0.8.4 är en hotfix ovanpå 0.8.3. Den ändrar inte säkra defaults och breddar inte strategin, men lägger till en smal Twin Unlock Threshold Planner:

- Plannern kan förbereda en konkret twin-tröskel (t.ex. Twin Neural Clusters vid 1000 Hive Networks) med konservativ payback-bypass när reserve är trygg.
- Plannern kräver target-path-relevans för twin-upgrade och kostnadsresurs.
- När twinnen blir buyable krävs post-upgrade rebuild-buffer, annars HOLD med tydlig reason.
- Same-run guard hindrar omedelbar lower filler efter twin-threshold prep eller twin-köp.
- Inspector/export visar twin unlock candidate/decision/reason/target/upgrade/cost/current/required/missing/prep/reserve/bypass/rebuild.

0.8.5 är en hotfix ovanpå 0.8.4. Den ändrar inte säkra defaults och breddar inte strategin, men rättar kostnadsdetektering i Twin Unlock Threshold Planner:

- Twin unlock planner läser nu uppgraderingskostnadens resurs/amount robustare för twin-upgrades där kostresursen inte är active action unit.
- För Twin Neural Clusters detekteras tröskeln korrekt som Hive Network 1000, med current/missing från faktisk Hive Network-count.
- Reason-texter skiljer nu på: "could not read twin upgrade cost resource", "invalid twin upgrade threshold amount" och "twin cost resource <name> not on target path <path>".

Exempel för live-scenariot:

```text
Target: Lesser Hive Mind
Active action: Hive Neuron
Relevant support: Twin Neuroprophets, because Hive Neuron uses Neuroprophets
```

Förväntat 0.7.9-beteende:

- `BUY twin neuroprophets` om target-aware recovery/reserve är trygg.
- `HOLD twin neuroprophets` med exakt reserve/recovery/protected-resource reason om inte trygg.
- Inte generisk `handled by goal planner` som enda reason för den target-relevanta twinnen.

## Export / observability i 0.8.0

Strategy Inspector och export visar fortfarande 0.7.9-fälten och nu även:

- `unlockPlannerCandidate`
- `unlockPlannerDecision`
- `unlockPlannerReason`
- `unlockPlannerTarget`
- `unlockPlannerUnlocks`
- `unlockPlannerCostResource`
- `unlockPlannerReserveRatio`
- `unlockPlannerPaybackBypassed`
- `parentStepCandidate`
- `parentStepDecision`
- `parentStepReason`
- `parentStepTarget`
- `parentStepActionUnit`
- `parentStepCostResource`
- `parentStepReserveRatio`
- `parentStepPaybackBypassed`
- `parentStepSupportsActionUnit`
- `cloneBufferMode`
- `cloneBufferTarget`
- `cloneBufferCurrent`
- `cloneBufferPercent`
- `cloneBufferDebt`
- `cloneBufferSpendableLarvae`
- `cloneBufferLarvaeProtected`
- `cloneBufferReason`
- `abilityPrepCandidate`
- `abilityPrepDecision`
- `abilityPrepReason`
- `abilityPrepType`
- `abilityPrepEnergyAvailable`
- `abilityPrepRequiresArmyPrep`
- `abilityPrepRequiresCloneBuffer`
- `houseOfMirrorsArmyValue`
- `houseOfMirrorsMissingUnits`

0.7.8-fälten för active action payback bypass finns kvar:

- `meatActionUnitPaybackBypassTriggered`
- `meatActionUnitPaybackBypassReason`
- `meatActionUnitReserveRatio`
- `meatActionUnitPaybackSeconds`
- `meatActionUnitName`

## Safety defaults

Dessa ska inte ändras utan explicit uppgift:

```js
autoCastAbilities: false
autoAscend: false
saveEnergyForNexus: true
nexusTarget: 5
energyPlanner: true
blockLepidopteraBeforeNexus: 4
fastNexus5MothSoftTarget: 572
territoryMinEtaImprovementSeconds: 2
territoryMinEtaImprovementRatio: 0.001
smartUnitBuyPercent: 0.25
meatChainReserveMultiplier: 2
meatChainMaxPaybackSeconds: 1800
meatActionUnitPaybackBypass: true
meatActionUnitMinReserveRatio: 5
meatFallbackDoNotDropBelowActionUnit: true
```

Får inte införas som default automation:

- Nightbug auto-buy
- Bat auto-buy
- ability auto-cast
- Clone Larvae auto-cast
- auto-ascend
- aggressivt buyMax i Smart Mode
- lower filler-köp under active action unit

## Referensfiler

`reference/REFERENCE_SwarmSim_ichbinsisyphos_2015.txt` används för Energy/Nexus/Ascension-matte.

`reference/REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt` används som praktisk community-guide för twinning, passive ratio, two-tap och cascade-idén.

`reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt` används som heuristik och errata. Den varnar för att högre meat-chain-units kan vara traps och att scriptet inte ska köpa högst synliga unit blint. Den stöder också att twin-prep behöver recovery-buffer och inte bara buyable-check.

## Arbetsregler

- Läs AI.md, game model och aktuell script-source först.
- Bygg aldrig från äldre source om inte användaren uttryckligen ber om jämförelse.
- Skilj på strategiskt mål och praktiskt köp.
- Bevara Nexus-skydd, Hatchery/Expansion-skydd, reserve/payback, twin recovery, no ability auto-cast och no auto-ascend.
- Smart Mode ska köpa exakta chunks, inte buyMax.
- Riskabla idéer ska först synas i Advisor/export.
- 0.8.0 är en planner-fix, inte en aggressiv strategi-release.
