# Prompt: 0.8.8 — Multi-Lane Coordinator / Territory Starvation Fix

Du ska bygga nästa version av SwarmSim Strategy Autobuyer:

```text
SwarmSim Strategy Autobuyer 0.8.8 — Multi-Lane Coordinator / Territory Starvation Fix
```

Svara på svenska i rapporter. Koden ska följa befintlig kodstil.

## Repo

```text
nattwarden/SwarmSim-Strategy-Autobuyer
```

## Source of truth

```text
src/SwarmSim-Strategy-Autobuyer.user.js
```

## Läs först

1. `AI.md`
2. `docs/SWARMSIM_GAME_MODEL.md`
3. `src/SwarmSim-Strategy-Autobuyer.user.js`
4. Relevanta live logs vid behov

## Repo-regler

- GitHub är source of truth för kod.
- Enda executable script ska ligga i `src/SwarmSim-Strategy-Autobuyer.user.js`.
- Skapa inte `.txt` script mirrors.
- Skapa inte release `.user.js` copies.
- Ändra inte `AGENTS.md` om det inte uttryckligen behövs.
- Inga safe defaults får göras aggressiva.
- `autoCastAbilities` ska fortsatt vara `false`.
- `autoAscend` ska fortsatt vara `false`.
- Smart Mode får inte börja buyMax:a meat-chain eller army.
- House of Mirrors får inte auto-castas.
- Clone Larvae får inte auto-castas.

## Nuvarande baseline

0.8.7 efter PR #9.

0.8.7 fungerar för:

- Hatchery save-window.
- Hatchery-köp när Hatchery är nära.
- Meat-chain återupptag efter Hatchery.
- Twin Neural Clusters opportunity-cost bypass.
- Twin threshold prep mot 10K Hive Networks.
- Parent-step conversion mot lesser hive mind.
- Clone Buffer hard lock release efter recovery.

## Ny verifierad lucka

Efter Hatchery fortsätter botten köpa meat-chain korrekt, men army/territory står still.

Live-logg visade:

- Main-buy runs: 20
- Hold runs: 0
- Botten köper Hive Network / Neural Cluster mot lesser hive mind.
- Decision lanes:
  - `Territory: OBSERVE none — no lane-specific candidate this run`
- Ability prep:
  - `HOLD House of Mirrors — army prep missing; top fighting units Culicimorph V, Arachnomorph V, Stinger V are empty`
- Screenshot visar att fighting-units är köpbara men flera top fighting units är 0:
  - Culicimorph V = 0
  - Arachnomorph V = 0
  - Stinger V = 0
- Expansion är relevant men inte nära:
  - ca 6% ready, ETA ca 5h 12m.
- Hatchery är inte nära:
  - ca 0%, ETA ca 3h 16m.

Tolkning:

Detta är inte en meat-bugg. Det är en lane coordination/starvation-bugg. Meat-lanen har alltid en safe main action och svälter därför territory/army-lanen.

## Mål

Bygg en Multi-Lane Coordinator som låter flera försiktiga planners existera samtidigt:

1. Meat lane
   - Fortsätt med lesser hive mind, twin threshold, parent-step, unlock.
   - Får fortfarande vara hög prioritet.

2. Larva/Engine lane
   - Fortsätt skydda Hatchery/Expansion save-window.
   - Fortsätt skydda Clone Buffer.
   - Ska kunna säga om army/territory-köp är tillåtet eller blockerat.

3. Army/Territory lane
   - Ska kunna hitta fighting-unit candidates även när meat-lanen också har en main action.
   - Ska inte vara beroende av att generic unit candidate-flow vinner över meat.
   - Ska kunna köpa små safe chunks när:
     - Expansion är relevant,
     - Hatchery/Expansion inte är i save-window,
     - Clone Buffer inte är hard lock,
     - protectedResources inte bryts,
     - territory ROI är positiv eller army prep är tom,
     - köpet är litet och safe.

4. Energy/Ability lane
   - Ska fortsätta hålla auto-cast av.
   - Ska kunna berätta att House of Mirrors saknar army.
   - Ska inte kasta House of Mirrors.
   - Ska dela “army prep missing units” till Army/Territory lane.

## Viktig design

Inför inte fyra separata bottar som köper självständigt.

Inför planner proposals + central coordinator/arbiter.

Rekommenderad proposal shape:

```js
{
  lane: "Meat" | "Engine" | "Territory" | "Energy" | "Clone" | "Ability",
  decision: "BUY" | "HOLD" | "OBSERVE" | "SIDE",
  candidate,
  unit,
  amount,
  score,
  priority,
  urgency,
  reason,
  blockers,
  costs,
  protectedResourcesUsed,
  canRunAsSideAction
}
```

Coordinator/arbiter ska:

1. Samla proposals.
2. Respektera hard blockers först:
   - protected resources,
   - Hatchery/Expansion save-window,
   - Clone Buffer hard lock,
   - energy protected for Nexus.
3. Välja upp till `smartMaxActionsPerRun`.
4. Inte låta samma lane dominera för evigt om andra lanes har safe/starved proposals.
5. Införa anti-starvation:
   - Tracka runsSinceLaneAction för åtminstone Meat, Territory, Engine, Clone.
   - Om Territory/Army har haft safe candidates men inte fått action på t.ex. 10–20 runs, ge den en liten safe action om den inte bryter guards.
6. Main/side:
   - Engine/Nexus/hard critical kan vara main.
   - Meat kan vara main.
   - Army/Territory kan vara main eller side om safe.
   - Clone Prep förblir side.
   - Ability prep är advisor/observe, inte cast.

## Konkreta implementationkrav

### A. Lägg till Territory / Army Prep Planner

- Separat från `collectSmartUnitCandidates` så den alltid kan scanna fighting units.
- Den ska kunna läsa top fighting units som saknas från Ability Prep / House of Mirrors state, eller själv hitta territory units.
- Den ska prioritera köpbara top fighting units som är 0 om de ger territory eller behövs för HoM prep.
- Den ska välja små chunks, baserat på `smartUnitBuyPercent` eller ny konservativ config:

```js
territoryPrepPlanner: true,
territoryPrepChunkPercent: 5,
territoryStarvationRunThreshold: 12,
territoryArmySeedWhenEmpty: true,
```

- Den får aldrig buyMax:a.

### B. Bevara Territory ROI

- Använd befintlig `scoreTerritoryCandidate` där möjligt.
- Om `scoreTerritoryCandidate` returnerar `null` för köpbar fighting-unit, logga varför.
- Om ROI är under minimum, håll.
- Om army är helt tom och HoM prep saknas, tillåt bara mycket liten safe “army seed” om Hatchery/Expansion inte är nära.

### C. Lägg till lane starvation diagnostics

Strategy Inspector ska visa:

- Lane coordinator decision.
- Lane actions selected this run.
- Territory starvation count.
- Last territory action age.
- Territory prep candidate.
- Territory prep decision.
- Territory prep reason.
- Territory prep unit.
- Territory prep amount.
- Expansion ETA before/after om möjligt.
- Army prep missing units.
- Why territory did not buy:
  - no visible fighting units,
  - no buyable fighting units,
  - `eachProduction().territory` missing/zero,
  - ROI below minimum,
  - protected resource,
  - Hatchery save-window,
  - Expansion save-window,
  - clone buffer hard lock,
  - not selected by coordinator.

### D. Fixa top-level Reason

Nu kan Strategy Inspector visa:

```text
Decision: BUY
Main: BUY
Reason: HOLD House of Mirrors...
```

Det är fel observability.

När `Decision: BUY` ska top-level `Reason` vara reason från action som faktiskt kördes. Ability HOLD får ligga kvar i Ability lane, men inte som top-level BUY reason.

### E. Säkerhetsregler

Verifiera efter kodändring:

- `autoCastAbilities` är false.
- `autoAscend` är false.
- House of Mirrors castas inte.
- Clone Larvae castas inte.
- Nightbug/Bat defaults ändras inte.
- Meat-chain använder inte buyMax.
- Army/Territory använder små chunks.
- Hatchery/Expansion save-window kan blockera army/territory.
- Clone Buffer hard lock kan blockera army/territory.
- Meat-chain 0.8.7-beteenden fortsätter fungera.

### F. Versionering

- Uppdatera `@version` till `0.8.8`.
- Uppdatera `scriptVersion`/paneltitel om sådana finns.
- Se till att inga aktiva UI-versionsträngar fortfarande säger `0.8.7`.

### G. Validering

Kör:

```bash
node --check src/SwarmSim-Strategy-Autobuyer.user.js
```

## Förväntad live-logg efter fix

- Meat fortsätter köpa target-path units.
- Territory lane visar inte längre `OBSERVE none` utan förklaring.
- Om army är tom och safe, ibland:

```text
BUY/SIDE Army Prep: Stinger V / Arachnomorph V / Culicimorph V
```

- Om army inte köps, loggen säger exakt varför.
- Top-level Reason matchar faktisk BUY-action.
