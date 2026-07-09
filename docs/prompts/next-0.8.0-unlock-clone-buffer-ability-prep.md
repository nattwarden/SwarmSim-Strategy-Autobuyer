# Prompt: SwarmBot 0.8.0 — Unlock / Clone Buffer / Ability Prep Planner

Du ska fortsätta utveckla vårt Tampermonkey-script för Swarm Simulator:
**SwarmSim Strategy Autobuyer 0.8.0 — Unlock / Clone Buffer / Ability Prep Planner**.

Detta är INTE en aggressiv strategi-release. Målet är att fixa nästa strategiska lucka efter 0.7.9.

## Bakgrund

0.7.9 lade till Target-aware Upgrade / Twin Planner, så scriptet kan nu utvärdera target-relevanta production/twin-upgrades. Men live-analysen visar att botten fortfarande är för enkelspårig:

- Phase: Post-Nexus energy growth
- Nexus: 5/5
- Goal: Meat-chain target: Lesser Hive Mind
- Active action: Hive Neuron
- Scriptet fortsätter köpa Hive Neuron
- Spelaren kan nu köpa Neural Clusters
- Neural Cluster-köp kan unlocka Twin Hive Neurons
- Hive Network-köp kan senare unlocka Twin Neural Clusters
- Vanlig payback/reserve-logik ser Neural Cluster som dålig, men missar unlock/cascade-värdet

Dessutom har energy/ability-läget blivit relevant:

- Energy är nära 60k
- Clone Larvae är tillgänglig
- House of Mirrors är tillgänglig
- House of Mirrors dubblar armén, men är dålig om top-tier fighting units är 0
- Clone Larvae är stark, men clonade larver får inte råka spenderas på vanliga köp innan cocoon-buffer är säkrad

## Läs först

Aktuell kodbas är 0.7.9. Bygg inte från äldre scriptversioner.

Läs i denna ordning:

1. `AI.md`
2. `docs/SWARMSIM_GAME_MODEL-2026-07-08-reference-integrated.txt`
3. `src/SwarmSim-Strategy-Autobuyer.user.js`
4. `releases/0.7.9/SwarmSim-Strategy-Autobuyer-0.7.9-release-notes.md`
5. `docs/live-logs/2026-07-09-0.7.9-live-log.md`
6. Vid behov:
   - `reference/REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt`
   - `reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt`
   - `reference/REFERENCE_SwarmSim_ichbinsisyphos_2015.txt`

## Huvudmål

Bygg 0.8.0 som en snäv men tydlig planner-release med tre nya delar:

1. Unlock Planner
2. Clone Buffer Planner
3. Ability Prep Planner

Detta ska fortfarande vara konservativt. Inga abilities ska auto-castas default om inte config uttryckligen tillåter det.

## 1. Unlock Planner

Lägg till en target-aware Unlock Planner som kan identifiera:

- nästa parent unit på target path
- vilken upgrade/twin som unlockas av att nå parent unit-count
- om ett annars payback-blockerat köp har unlock value
- om unlock-kedjan leder mot active target
- om köpet är tryggt nog att göra utan att krascha active action-reserven

Unlock Planner får inte ignorera reserve. Den får däremot kunna bypassa eller mildra payback om unlock value är tydlig och reserve är extremt trygg.

Exempel:

```text
BUY neural cluster
Reason: target unlock step for lesser hive mind; converts excess hive neurons to neural clusters; unlocks Twin Hive Neurons; reserve after buy 42x >= required 5x; payback bypassed for unlock value
```

```text
HOLD neural cluster
Reason: unlock candidate blocked; would unlock Twin Hive Neurons but hive neuron reserve after buy 1.6x < required 5x
```

Inspector/export-fält:

- `unlockPlannerCandidate`
- `unlockPlannerDecision`
- `unlockPlannerReason`
- `unlockPlannerTarget`
- `unlockPlannerUnlocks`
- `unlockPlannerCostResource`
- `unlockPlannerReserveRatio`
- `unlockPlannerPaybackBypassed`

## 2. Clone Buffer Planner

Clone Larvae är starkt, men clonade larver får inte råka spenderas på vanliga köp innan cocoon-buffer är säkrad.

Samtidigt får inte scriptet låsa alla larver till 100% cocoon-buffer för tidigt, eftersom det kan stoppa all progression när larvproduktionen är låg.

Bygg en Clone Buffer Planner med tre lägen:

### A. Early buildup

När cocoons/Clone Larvae nyligen blivit relevant och larvproduktionen är låg:

- använd partial larvae protection
- prioritera cocoon-köp som side-task
- tillåt fortfarande köp som ökar larvproduktion eller tydligt unlockar target/cascade
- lås inte 100% av larverna om det stoppar progression

### B. Post-clone lock

Efter att Clone Larvae faktiskt castats:

- skydda clonade larver hårt
- köp cocoons först
- vanliga larvköp ska blockeras tills buffer recovery är klar
- detta gäller även meat-chain och territory-köp

### C. Mature buffer

När larvproduktion och cocoon-buffer är rimliga:

```text
spendableLarvae = larvae - cloneBufferDebt
```

Vanliga köp får bara använda larver över buffer-debt.

Inspector/export-fält:

- `cloneBufferMode`
- `cloneBufferTarget`
- `cloneBufferCurrent`
- `cloneBufferPercent`
- `cloneBufferDebt`
- `cloneBufferSpendableLarvae`
- `cloneBufferLarvaeProtected`
- `cloneBufferReason`

Viktigt:

Clone Buffer Planner får inte auto-casta Clone Larvae default. Den ska skydda/preppa och logga.

## 3. Ability Prep Planner

Bygg en advisor-only Ability Prep Planner som utvärderar Clone Larvae och House of Mirrors.

### Clone Larvae

Utvärdera:

- energy tillgänglig
- clone cap
- current larvae + cocoons
- cocoon buffer status
- om cast skulle vara vettigt
- om post-clone buffer lock kan hantera larverna

Default: PLAN/HOLD, inte CAST.

### House of Mirrors

House of Mirrors speglar armén och kan vara starkt, men bara om armén har något att spegla.

Lägg till army prep-check:

- kontrollera top-tier fighting units
- om relevanta units är 0 eller mycket låga, håll ability
- rekommendera army prep först
- köp inte fighting units aggressivt med buyMax
- om army prep köps ska det ske med safe chunks och inte äta protected clone-buffer-larver

Inspector/export-fält:

- `abilityPrepCandidate`
- `abilityPrepDecision`
- `abilityPrepReason`
- `abilityPrepType`
- `abilityPrepEnergyAvailable`
- `abilityPrepRequiresArmyPrep`
- `abilityPrepRequiresCloneBuffer`
- `houseOfMirrorsArmyValue`
- `houseOfMirrorsMissingUnits`

## Ranking och safety

Prioritet ungefär:

1. Engine/Hatchery/Expansion om buyable eller i stark save-window
2. Clone post-cast buffer recovery om aktiv
3. Unlock Planner om unlock value är tydlig och reserve är trygg
4. Target-aware upgrade/twin
5. Vanlig meat goal planner
6. Territory ROI
7. Clone Prep side-task
8. Ability Prep advisor-only

Måste bevaras:

- `autoCastAbilities: false`
- `autoAscend: false`
- Clone Larvae auto-castas inte default
- House of Mirrors auto-castas inte default
- Nightbug/Bat auto-buy finns inte
- Smart Mode använder inte `buyMaxUnit` för meat-chain
- active action payback bypass från 0.7.8 finns kvar
- fallback floor under active action unit finns kvar
- target-aware upgrade/twin planner från 0.7.9 finns kvar
- normal larv-spending respekterar `cloneBufferSpendableLarvae`
- post-clone lock skyddar clonade larver till cocoon-buffer
- early buildup låser inte all progression när larvproduktion är låg

## Version och filer

Uppdatera:

- `@version 0.8.0`
- `scriptVersion: "0.8.0"`
- paneltitel `SwarmBot v0.8.0`
- inga kvarvarande `SwarmBot v0.7.9`

Skapa:

- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.user.js`
- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.txt`
- `releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-release-notes.md`
- `docs/release-notes/SwarmSim-Strategy-Autobuyer-0.8.0-release-notes.md`
- `AI-2026-07-09-script-0.8.0-indexed.md`
- uppdaterad `AI.md`

Uppdatera även:

- `src/SwarmSim-Strategy-Autobuyer.user.js`

## Validation

Kör:

```bash
node --check releases/0.8.0/SwarmSim-Strategy-Autobuyer-0.8.0-unlock-clone-buffer-ability-prep.user.js
```

Gör statiska kontroller enligt safety-listan ovan.
