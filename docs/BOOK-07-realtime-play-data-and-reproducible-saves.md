# Book 07 - Real-Time Play Data and Reproducible Saves

Status: Current, manual-play evidence. This book owns distilled observations
from script-free, real-time Swarm Simulator play and the rules for retaining
reproducible starting states.

## Purpose and retention

This book answers: which observed game facts and player-choice tradeoffs have
been reproduced from real play, and which saved state may be used to compare
branches fairly?

- Put durable facts and explicit uncertainties here.
- Keep one save-state fixture only when it is a named, reusable branch point.
- Store that fixture under `docs/test-data/player-saves/` with a SHA-256 and
  provenance; never overwrite it.
- Do not keep an export after every early-game action. Replace the active
  research seed only by adding a later, materially richer state with its own
  reason for retention.
- A saved state is evidence, not a production-strategy directive. Importing it
  into a verifier or drawing a script change from it requires a separate work
  order and fresh verification.

## Live-finding protocol

This is the canonical list of what a manual-play finding must contain before
it may influence the strategy model. It keeps a useful distinction between a
player intuition, a one-off observation, and a reusable planner rule.
The repository-wide next-click objective, branch workflow, anti-lock checks,
and Laboratory/Strategy-Audit division of responsibility are canonical in
`BOOK-04-strategy-intelligence-findings.md` under
`Canonical strategy-testing protocol`.

| Field | Record | Why it matters |
|---|---|---|
| Question | One decision with a named target, e.g. “does a bounded Roach batch improve the ETA to Expansion 78 more than the same Meat held for Wasp?” | Prevents broad claims such as “Roach is good.” |
| Starting state | Game version, save/branch name, target gate, resource banks, relevant unit counts/twins/upgrades, army and energy rates. | Makes the result comparable and exposes state dependence. |
| Candidate actions | Exact bounded actions, including amount, cost and reserve left behind; include the hold/no-buy baseline when relevant. | Avoids comparing a precise action with a vague alternative. |
| Primary metric | The target-specific delta: normally gate ETA, or immediate `territory/s`, `larvae/s`, `meat/s`, Energy/s, or a concrete unlock. | Measures progress toward the current phase goal rather than price or unit tier. |
| Secondary effects | Energy spent, active larvae/cocoon reserve, meat reserve, future Mirror multiplier, and whether a resource can be rebuilt. | Captures opportunity cost and prevents a locally good action from breaking the next step. |
| Result | Before/after values and an explicit status: observed once, reproduced, state-dependent, or rejected. | Keeps hypotheses honest and lets later runs update them. |
| Planner consequence | One conditional rule with its scope, or “no rule yet.” | Stops a single live branch becoming a universal script instruction. |

### Minimum measurement set by decision type

- **Army batch before Mirrors:** for every visible unit, measure the bounded
  batch's `Δ territory/s`, Meat and larva cost, and the post-buy army rate.
  Compare `Δ territory/s / constrained cost` now; future Mirrors multiply
  every candidate equally, so they amplify a good current ratio but do not
  make a poor ratio good. Record the expected `2^n` multiplier only after
  naming the number of planned future Mirrors.
- **House of Mirrors:** record total army territory/s and Territory Rush output
  immediately before and after the cast, Energy cost, and the resulting
  Expansion ETA. Compare against the exact number of Rushes or Swarmwarps it
  displaces.
- **Hatchery versus Expansion:** record both costs and before/after larva/s;
  compare percentage gain and target-gate ETA, not just the raw rate delta.
- **Clone Larvae:** record cloneable larvae (active plus cocoons), cap, cast
  output, Energy cost, protected cocoon reserve, and the exact Twin/unit batch
  it enables. Do not call a Clone cast good merely because its output is large.
- **Ascension:** record real premutagen status, live Ascension cost, held
  Energy, reported Energy spent, and the reset payoff. Artificially injected
  test state may reveal UI only; it cannot establish a natural-drop rule.

**Promotion rule:** an observation becomes a production-strategy candidate
only after it is reproduced from a named starting state or supported by a
controlled counterfactual. Until then it stays an advisory, state-scoped note
in this book. The live measurement is the evidence; the script change requires
a separate Laboratory/Strategy-Audit validation.

### Consolidated evidence register (2026-07-23)

This register is the compact answer to “what do we already know?” The detailed
observations below remain the audit trail. The older rolling queues immediately
after this register are retained as campaign history and are no longer the
canonical open-test list.

Evidence grades:

- **Reproduced:** repeated naturally, controlled from the same state, or
  confirmed by both source mechanics and a matching live result.
- **Measured:** one exact live before/after result. It is usable as a scoped
  example, not a universal threshold.
- **Mechanic-only:** source/UI or an explicitly modified disposable branch
  establishes the effect, but not its natural timing or strategic value.
- **Open:** intuition or partial sampling without a decisive comparison.

| Domain | Consolidated finding | Grade | Scope and remaining limit |
|---|---|---|---|
| Phase objective | Before Nexus 5, the immediate phase gate is the next Nexus; after Nexus 5, the observed strategic gate becomes first Ascension. Meat, Territory, Larvae, and Energy are supporting lanes, not independent end goals. | Reproduced | The fastest complete route through every Nexus tier has not been branch-compared. |
| Larva engine | Hatcheries raise base larva production; Expansions multiply it and repeatedly produced material gains in the mature live branch. The better purchase is the larger percentage/ETA gain at the current cost, not a permanent preference. | Reproduced | Exact Hatchery-versus-Expansion crossover states still need controlled branches. |
| Achievements | Accomplished Ancestry converted Achievement Points into a direct percentage larva multiplier and beat the simultaneous Expansion in one measured state. | Measured | No general affordability/priority threshold exists yet. |
| Meat chain | Drones produce Meat; each higher producer exists to accelerate the unit below it. Direct Drone hatching becomes negligible once passive production dominates. | Reproduced | The point where direct purchases become negligible must be computed per state. |
| Faster upgrades | A doubling Faster upgrade can be immediately positive despite consuming producers. For passive play the isolated breakpoint is `owned > 2 × cost`; active reconstruction can make an otherwise negative sacrifice profitable. | Reproduced | Full-package payback versus Twin and tier unlock remains open at larger costs. |
| Twin upgrades | Twin affects manual construction, not passive output. It is valuable only when the larger manual batch can be funded and exercised; active reconstruction can justify temporarily consuming the producer tier. | Reproduced | Twin IX and later package boundaries are unmeasured. |
| Reserve policy | A static `1.5×` retained-cost rule worked in several early Meat-chain purchases. `0×` can also work in active play when the missing link is immediately reconstructable. | Reproduced | `0×/1.25×/1.5×/2×` have not been compared from the same state and horizon. |
| Army selection | Rank every visible family by the marginal Territory gain of its currently affordable bounded batch under both Meat and larva constraints. Unit price, tier, and raw per-unit output alone all produced bad rankings. | Reproduced | The material-fraction threshold that should trigger a purchase is not calibrated. |
| Mature Army | In the whole-roster sweep, Devourer was the only candidate near a one-percent total-Army increment; an executed all-in package gave only about two percent while exhausting Meat. Low-tier diversity was not valuable by itself. | Measured | Other phases may have different winners; this is not a universal Devourer rule. |
| House of Mirrors | A cast costs `2,500` Energy and doubles the entire live Army permanently. In the natural branch it reduced the Energy cost of the next Expansion bridge; several low-value seed batches were dominated by casting Mirror first. | Reproduced | The exact “seed first” threshold and late-Ascension reserve interaction remain open. |
| Rush/Swarmwarp | Resource Rushes and Swarmwarp are tactical bridge actions whose value is the named gate they complete. Recompute the remaining deficit at cast time because passive production accrues while Energy regenerates. | Reproduced | The script keeps these advisor-only; their opportunity cost needs controlled comparisons. |
| Clone/cocoons | Cocoons preserve cloneable larvae. Clone costs `12,000` Energy and grows strongly until its live bank/cap; it is useful when the output funds a named Twin, unit batch, or reconstruction. It is not always correct to wait for Clone. | Reproduced | One-shot-at-cap versus continuous casting and the protected active-larva floor need counterfactual tests. |
| Energy producers | Lepidoptera is a long-horizon Energy-rate investment; measured incremental payback was about 60 hours in one branch. Bats scale Rushes, Swarmwarp, and Clone cap, but not House of Mirrors, with diminishing marginal benefit. | Measured | Natural-run Bat/Lepidoptera/Nightbug allocation before first Ascension is unresolved. |
| Crystals | Conversion grants spendable Energy and permanently raises max Energy. A precise conversion can complete an immediate gate, while awards are cooldown-dependent and crystals survive Ascension. | Reproduced | The optimal pre-Ascension reserve versus immediate bridge spend is unresolved. |
| Ascension gate | First Ascension requires real premutagen plus enough held Energy for the falling live cost. An injected-premutagen branch exposed the UI near the `~72.1k` intersection; five natural Hatchery/Expansion events produced no drop. | Mechanic-only | Natural premutagen timing, first real reset payoff, and fastest return to Nexus 5 remain open. |
| Save manipulation | The export codec and an Energy-only disposable branch were reproduced. Imported Energy is clamped to the live cap. | Mechanic-only | Modified branches establish mechanics/counterfactual effects, never natural wall-clock timing. |
| Active/passive horizon | Active reconstruction changes sacrifice economics; passive play values retained producer stock more highly. The product target is active, bounded optimization, but idle/offline horizons remain a distinct policy input. | Reproduced | No explicit active-horizon parameter currently selects between those policies. |

### Canonical unresolved live campaign

The exhaustive decision-state matrix and runtime crosswalk live in
`BOOK-04-strategy-intelligence-findings.md`. The live browser campaign should
only collect evidence that closes one of those named gaps. Its highest-value
branches are:

1. compare Hatchery and Expansion from the same saved state using percentage
   larva gain and time to the next phase gate;
2. compare full Faster/Twin/tier-unlock/rebuild packages from one late
   Meat-chain state;
3. compare `0×`, `1.25×`, `1.5×`, and `2×` working reserves under explicit
   active and passive horizons;
4. locate a natural Territory-over-Meat crossover using every visible Army
   family and a common constrained purchase rule;
5. compare Clone, Mirror/Rush, Energy producers, Crystal conversion, and HOLD
   at the exact Energy thresholds where they compete;
6. retain the first natural premutagen branch, then measure the first Ascension
   and the return-to-Nexus-5 route.

Every branch must emit:
`state -> target -> candidates including HOLD -> selected spend -> immediate
delta -> reconstruction state -> target ETA -> next bottleneck`.

### Historical live-test queue (superseded)

1. **Mirror seed sweep (next):** from the post-Expansion-77 branch, inspect
   every visible army unit. Compare a common bounded batch (normally the
   smallest batch that is material but preserves the active larva working
   buffer) against holding the same resources. Rank by `Δ territory/s` per
   constrained Meat/larva cost, then test the best one before Mirror 5.
2. **Mirror threshold:** from the same branch, compare “best army seed then
   Mirror” with “Mirror immediately.” Measure Expansion-78 ETA and Energy
   remaining. This tests the user hypothesis that a broad army should be
   prepared before repeated doubling.
3. **Clone allocation:** once Clone is affordable again, compare holding its
   output, a named Twin upgrade plus matching hatch batch, and a territory
   batch. The winning action must shorten the named Expansion/Ascension path.
4. **Premutagen frequency:** keep recording only actual Hatchery/Expansion
   events, their level transitions, and whether a real premutagen appears.
   Do not infer a schedule until enough same-version observations support one.

### Historical campaign update (2026-07-23, superseded)

The earlier Mirror and army-seed checks have now been measured in the current
branch. The remaining campaign is ordered by dependency, so a test can use the
production state created by the prior one.

1. **Clone versus Expansion bridge (next):** record cloneable source/cap and
   compare the 12k-Energy Clone output to the active-larva requirement for
   `10T GQ -> 100M Hives -> Twin IX`. In parallel record the Energy/Crystal
   cost of the next Mirror/Rush/Expansion bridge. Metric: time to the named
   Twin while preserving an explicit active-larva reserve.
2. **Twin IX package boundary:** execute the smallest GQ/Hive/Twin/rebuild
   composite that reaches the 100M-Hive Twin gate. Record post-rebuild Nest/s,
   active larvae, and cocoon reserve to test the active-rebuild invariant.
3. **Faster GQ IV versus Twin IX:** once both are actionable, compare their
   full sacrifice-and-rebuild packages by restored Nest/s, larva spent, and
   time to the next tier; never compare labels or post-sacrifice balances.
4. **Energy ability allocation:** at each 1.6k/2k/2.5k/12k boundary compare
   Larva Rush, Swarmwarp, Territory Rush, House of Mirrors, and Clone only
   against the named immediate gate. Record Crystal spending separately.
5. **Army refresh threshold after Mirrors:** re-scan the whole roster only
   when a bounded batch can add a material fraction of total Army rate or
   unlock a relevant Twin; reject negligible gains even after future Mirrors.
6. **Crystal cooldown economics:** sample several Hatchery/Expansion events
   across the 30-minute award cooldown and record net crystals spent/earned per
   completed gate, including the permanent maximum-Energy gain from conversion.
7. **Premutagen and first natural Ascension:** record only real drops, then
   measure live Ascension cost, retained crystals, reset payoff, and the fast
   return to Nexus 5. Artificial Energy branches remain UI/mechanics evidence.

### Historical multi-lane live test suite (2026-07-23, superseded)

Run these tests as one coordinated suite from a saved/live state. A test may
advance normal reversible play, but every result must retain the input state,
the selected action, the resource spend, and the named output metric. Do not
rank an action by its listed price alone.

1. **Hive-chain velocity:** measure Faster Hives, Twin Hives, and Faster Hive
   Queens as full build--sacrifice--rebuild packages. Metrics: restored
   Greater-Queen floor, larva spent, and the changed passive rate. Live anchor:
   Faster Hives I cost `66` Hives and changed a `9,863`-Hive branch from
   `49,315` to `97,970` Greater Queens/s (`5 -> 10` per Hive/s). Its next
   cost was `43,956` Hives, so it is no longer an automatic follow-up.
2. **Hive Queen acceleration:** rebuild only to the `66`-Queen Faster Hive
   Queen I gate at the current Twin-Hive multiplier, buy the upgrade, then
   record Hives/s before and after and the reconstruction cost. This separates
   a passive producer multiplier from the manual-Hive multiplier.
3. **Greater-Queen package boundary:** compare the next Faster-GQ and
   Twin-GQ packages only after restoring the nominated GQ floor. Metrics:
   Nest/s restored, larva spent, and the amount of the next Hives/Twin gate
   that becomes funded; a temporary zero balance is not a score.
4. **Full Army ROI sweep:** inspect every visible family and calculate the
   bounded batch's added Territory/s as a fraction of the current whole-army
   rate, alongside Meat and larva spend. Test at least Goon, Devourer, Wasp,
   Chilopodomorph, Giant Arachnomorph, Roach, Locust, Culicimorph,
   Arachnomorph, Stinger, and Swarmling. Execute a batch only when it clears a
   material-fraction threshold or enables a funded Twin/Expansion; otherwise
   retain it as a rejected candidate.
5. **Energy threshold allocation:** at `1.6k`, `2k`, `2.5k`, and `12k`
   Energy, compare Rush, Swarmwarp, House of Mirrors, and Clone against the
   one immediate gate they can complete. Treat Crystal conversion as a separate
   bridge with a permanent max-Energy effect; do not convert merely to approach
   a threshold that it still fails to reach.
6. **Larva working reserve:** after every normal purchase above, measure how
   much active larvae must remain to rebuild the next selected chain action.
   Compare the `0x`, `1.5x`, and `2x` reserve policies only through recovered
   production/time-to-next-gate, not through the amount left idle.
7. **Expansion bridge:** once the next Territory gate is known, compare passive
   Army accumulation, a bounded seed batch, Mirror plus Territory Rush, and a
   Crystal bridge. Metric: Energy/Crystal spent per completed Expansion and
   resulting larva/s gain.

The suite's common output is a live decision record:
`state -> candidate -> spend -> immediate rate/gate delta -> reconstruction
state -> next bottleneck`. A production script should consume that record, not
an isolated "cheapest" or "most expensive" rule.

## Current reproducible seed

`manual-play-early-pre-ascension-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-early-pre-ascension-2026-07-18.txt`
- SHA-256: `15d8b98302f833d4d8d2dc596def6fdb421d21e7fc2b955ba4462e58a01f22ff`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: late early game — post-Twin Drones, Territory, Swarmlings, Stingers,
  four Hatchery purchases, and six Expansions; captured before first Ascension
- intended use: start multiple manual or disposable test branches from the
  same state to compare a concrete, bounded choice

`manual-play-first-nest-threshold-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-first-nest-threshold-2026-07-18.txt`
- SHA-256: `a86d8524e351fd3034ff4fe89e10644713a40f87a69e00ca55b19bf5d5076cbd`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: first Nest is buildable from 1,000 Queens; Faster Queens I and Twin
  Drones II are active
- intended use: compare building the first Nest now with a bounded delay or
  further Queen investment from one identical pre-sacrifice state

`manual-play-expansion-10-territory-loop-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-expansion-10-territory-loop-2026-07-18.txt`
- SHA-256: `f26e2e33eea8446eafb6d1ea62f337829c6034c6874f39dd490c9eef5aaa18ae`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: Expansion 10 has just been purchased after the observed 100-Stinger
  Territory bridge; seven Hatcheries and 100 Stingers are active
- intended use: compare the next Territory gate, Hatchery 8 at 3.00B meat,
  and alternative reserve policies from a later early-game state

`manual-play-expansion-12-stinger-bridge-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-expansion-12-stinger-bridge-2026-07-18.txt`
- SHA-256: `94aa77e5c39ca4aea527b06c89a1091959dd1bd5d854c793d48f9c334d41f329`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: twelve Expansions, eight Hatcheries, 600 Stingers, and the tested
  bounded Stinger bridge; captured immediately after Expansion 12
- intended use: measure later Territory gates and compare 1.5x/2x sacrifice
  reserves in a time-controlled disposable branch

`manual-play-twin-queens-ii-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-twin-queens-ii-2026-07-18.txt`
- SHA-256: `9c2c7e61a9b24834b092b5089eab7f1f593b2aadc2cf15761ababdb2651b789f`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: Hatchery 9, Expansion 14, 16 Nests, Twin Queens II (`x4` manual
  hatching), and the completed Queen-to-Nest reserve ramp
- intended use: compare the production/payback of Twin Queens II against the
  preserved-Nest alternative from a materially later early-game branch

`manual-play-active-chain-pre-ascension-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-active-chain-pre-ascension-2026-07-18.txt`
- SHA-256: `c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: Faster Nests I, Faster Queens II, Faster Drones III, Twin Drones V,
  Twin Queens II, Accomplished Ancestry II, Hatchery 10, Expansion 16, and
  Culicimorph Territory production; before first Ascension
- intended use: compare active bottleneck-solving choices from the first
  substantially developed pre-Ascension economy

`manual-play-faster-greater-queen-i-branch-baseline-2026-07-18`

- fixture: `docs/test-data/player-saves/manual-play-faster-greater-queen-i-branch-baseline-2026-07-18.txt`
- status: **QUARANTINED / NOT A SAVE** (repository audit 2026-07-23)
- current file SHA-256:
  `770c2d18aa4ec3159f46da461ef452972949942ff4f6a9771044485faa146398`
- current content: the literal string `undefined` plus newline (10 bytes)
- correction: the earlier documented SHA-256
  `d40d8f3d1af165d0d345aef394233bc1ee3050bfb626ee5ea393f6491b7f08a5`
  described the intended browser export, but that export is not present in the
  tracked fixture. Historical observations derived from the original branch
  remain state-scoped notes; this path must not be imported, verified, or used
  as a Laboratory seed.
- recovery requirement: obtain a valid original export with provenance or
  derive a new explicitly labelled state from a valid ancestor. Never replace
  this path silently; add a new immutable fixture and record lineage.

`manual-play-first-nexus-baseline-2026-07-21`

- fixture: `docs/test-data/player-saves/manual-play-first-nexus-baseline-2026-07-21.txt`
- SHA-256: `3f5138065ceaf84c83a28d5965a5b4e53113dea32686553ab00bdba6f321bd90`
- source: `manual-play-twin-nests-v-baseline-2026-07-18` re-imported into the
  in-app browser, then advanced by a single engine-driven `nexus1` purchase
  (not script-free); the meat bank is offline-catch-up inflated by the native
  import, so it crosses the 333.33B Nexus gate that the live run never banked
- scope: first entry into the Energy/Nexus layer — 1 Nexus, energy ~2,001
  (+2,000 build burst), 10,000 Greater Queens with Faster GQ I, Hatchery 18,
  Expansion 31; `nexus2` visible, `premutagen`/`mutagen` still pre-Ascension
- intended use: the reproducible branch point for energy-phase and
  first-Ascension tactic tests (Nexus-ladder climb, energy-spend efficiency,
  ability-versus-Nexus allocation); import immediately before each branch and
  compare action deltas and rates, never absolute banks
- verification: round-trip import restores 10,000 Greater Queens and 1 Nexus
  cleanly on production `v1.1.17`

## UI map for manual play

Observed on production Swarm Simulator `v1.1.17` on 2026-07-18. Labels that
contain resource amounts and quick-buy quantities are dynamic; use the route,
heading, and surrounding unit name rather than an old displayed number.

| Goal | Exact visible route | What to verify before acting |
|---|---|---|
| Change economy lane | Top resource tabs: Meat, Larvae, Territory. Each opens the currently selected unit in that lane. | The tab's dynamic resource total and target route may change while the game ticks. |
| Inspect or buy a unit | Open a unit link from the lane table, then use its unit page. The page has a unit heading, description, `hatching` area, amount field, quick-hatch buttons, upgrades, and the lane table. | Re-read the current quick-button label; it can change from `hatch 3` to another amount between observations. |
| Reach global tools | `More...` in the top tab row. The observed order is Buy all upgrades, Buy cheapest upgrade, Undo, Options, Achievements, Statistics, Patch Notes, Send Feedback, Report Problem, Show all units. | Expand `More...` first; do not assume a generic `Options` locator is currently visible. |
| Save a branch point | `More...` → `Options` → `Import/export saved data`. Click the export text, then `copy`. | The export field is a text input with a changing string; do not import or wipe saved data during an observation run. |
| Find release/UI context | Top navigation: `v1.1.17` opens Patch Notes; `More...` also contains Patch Notes. | Record the visible version with every durable UI or mechanics claim. |

### Interaction rules derived from the UI

- The game continues producing while menus and Options are open. A save string
  is therefore a point-in-time branch seed, not a frozen description of a
  later screenshot.
- Quick-hatch and upgrade controls are dynamic. Refresh the visible DOM after
  each buy and select the exact current label or node; never replay an earlier
  quantity blindly.
- `Buy all`, `Buy cheapest`, `Undo`, import, and wipe controls are global
  actions. Treat them as deliberate branch-management operations, not normal
  exploratory clicks.
- Native `Import saved data` applies the game's offline-production catch-up.
  A save imported during this run immediately showed a "Welcome back" award.
  This is intended game behavior: the export is a time-stamped resumption
  point, so the game can calculate production while the player was away.
  Therefore an imported production save is a reproducible *configuration*, but
  not an exact frozen economy branch unless the elapsed-time effect is also
  controlled in a disposable test environment.
- The product objective is not to manufacture offline time. It is to use
  continuous, bounded, observable play to choose productive actions whenever
  an attentive player could, reducing idle wait through better timing and
  bottleneck selection.

## Distilled observations from the first manual run

The following are direct observations from one manual run on 2026-07-18. They
are factual game observations, not yet universal planner rules.

| Observation | Evidence and interpretation | Status |
|---|---|---|
| Early drone threshold | At 19 drones, the run surfaced the first Hatchery and Queen paths. The first Hatchery cost 300 meat and raised larva production from 1 to 2 per second. | observed once |
| Faster Drones I | Spending 66 drones changed drone production from 1 to 2 meat per second. | observed once |
| Twin Drones I | Spending one Queen changed manual drone hatching to `x2`; Queen passive production stayed outside that multiplier. | observed once |
| Queen loop | A Queen cost 810 meat, 100 drones, and 1 larva, then produced 2 drones per second. Five Queens unlocked the Territory phase. | observed once |
| Territory loop | Swarmlings cost 750 meat and 1 larva each, produced 0.07 territory per second each, and fed Expansion. At 444 Swarmlings, the observed total was 31 territory per second. | observed once |
| Expansion stacking | Four Expansions showed a 46% multiplier and six showed 77%, consistent with compounding 10% steps rather than simple addition. Four base Hatchery steps plus the six Expansion multiplier displayed 8 larvae per second. | observed once |
| Stinger comparison | The first Stinger cost 337K meat for 3 territory per second. In this state, Swarmlings had substantially better territory-per-meat payback; this is an early-game comparison only. | observed once |
| Twin Swarmlings UI result | The displayed initial low cost was followed by a result of Twin Swarmlings level 2 and `x4` hatching. The exact purchase semantics need a branch replay before any recommendation. | inconclusive |
| Twin Stingers I | Spending the displayed first Twin Stinger cost changed manual Stinger hatching from `x1` to `x2`; the next exact quantity request of 100 produced 100 Stingers, so its normal pair semantics were observed. | observed once |
| Territory bottleneck test | At Expansion 9, the next Expansion cost 31,804 territory. With 444 Swarmlings (31 territory/s), adding 100 Stingers added about 300 territory/s and took the run from roughly 18.5k to the 31.8k gate within about 40 seconds. | observed once |
| Expansion 10 result | Spending the gate amount took Territory from about 49.7k to 20.0k and raised the Hatchery multiplier from `x2.35` to the next 10%-compounded step. The active loop is therefore measurable: cheap Territory production unlocks Expansion, which raises larva production. | observed once |
| Hatchery 8 result | Hatchery 8 cost 3.00B meat and raised larva production from 20 to 23/s (base Hatchery output 8 to 9 under the `x2.59` Expansion multiplier). The next Hatchery costs 30.0B meat. | observed once |
| Expansion 11 result | Expansion 11 cost 77,922 territory, reduced the observed Territory bank from 79.5k to 4.0k, and raised larva production from 23 to 25/s (`x2.85`). The next Expansion costs 190k territory. | observed once |
| Bounded 500-Stinger bridge | With Twin Stingers I active, an exact request for 500 Stingers cost 84.3M meat and 250 larvae, then raised the observed total Territory rate from 315 to 1,890/s (600 Stingers plus 444 Swarmlings). This reduced the remaining time to the 190k Expansion gate from roughly nine minutes to about 90 seconds while retaining more than 11k larvae. | observed once |
| Expansion 12 result | Expansion 12 cost 190k territory and raised larva production from 25 to 28/s. Twelve Expansions displayed a `x3.13` Hatchery multiplier; the next Expansion costs 467k territory. The same bounded Stinger bridge completed a second gate without consuming a material share of the larva bank. | observed once |
| Scaled 1,000-Stinger bridge | From 600 Stingers, an exact request for 1,000 cost 168M meat and 500 larvae with Twin Stingers I. It raised total Territory production from 1,890 to 5,040/s (1,600 Stingers plus the existing Swarmlings) while retaining over 16k larvae. At this state the spend was below 3% of either resource bank, so it satisfies both a 1.5x and a 2x retained-resource reserve by a wide margin. | observed once |
| Expansion 13 result | Expansion 13 cost 467k territory and raised larva production from 28 to 31/s (`x3.45`). The next Expansion costs 1.14M territory. With the scaled Stinger bridge that gate is only a few minutes away, whereas Hatchery 9 remains 30.0B meat away; investigate the meat chain before adding more Territory production. | observed once |
| 1.5x Nest reserve test | With 9,381 Queens and three Nests, building exactly three Nests cost 218k meat, 3,000 Queens, and 3 larvae. The post-spend Queen bank was 6,436 (more than 1.5x the sacrificed amount), while Nests rose 3 to 6 and passive Queen production doubled 9 to 18/s. This supports 1.5x as a viable lower reserve for this reversible, production-doubling sacrifice at this stage; it does not yet prove it is safe for every unit or gate. | observed once |
| Expansion 14 result | Expansion 14 cost 1.14M territory and raised larva production from 31 to 34/s (`x3.79`). The next Expansion costs 2.80M territory. | observed once |
| Queen-to-Nest active ramp | At 7,877 Queens and 29,044 larvae, hatching exactly 18,000 Queens cost 7.29M meat, 900k drones, and 9,000 larvae, leaving 20,306 larvae (over 2x the larva cost). Building ten Nests then cost 729k meat, 10,000 Queens, and 10 larvae, leaving 16,956 Queens (over 1.5x the Queen cost); Nests rose 10 to 20 and passive Queen production doubled 30 to 60/s. | observed once |
| Twin Queens II reserve gate | Twin Queens II becomes buyable at 10 Nests and costs 10 Nests. It was deliberately deferred at 20 Nests because purchasing it would leave 10, below the 1.5x/2x retained-Nest reserve. | observed once |
| Hatchery 9 result | Hatchery 9 cost 30.0B meat and raised larva production from 34 to 37/s (base Hatchery output 9 to 10 under the `x3.79` multiplier). The next Hatchery costs 300B meat. | observed once |
| Twin Queens II result | After building six Nests from 20 to 26, Twin Queens II consumed 10 Nests and left 16. Passive Queen production fell 78 to 48/s, while manual Queen hatching changed `x2` to `x4`. This is a measured tradeoff, not yet a universal recommendation; its payback must be compared against the preserved-Nest branch. | observed once |
| Accomplished Ancestry I | With 190 Achievement Points, Accomplished Ancestry I cost 5.00M meat and 500 territory. Larva production rose 37 to 45/s, matching the stated 1% per 10 Achievement Points (+19%). The next level costs 50.0B meat and 5.00M territory. Achievements remain a natural-progression signal, but an affordable Ancestry level is a direct larva multiplier worth evaluating immediately. | observed once |
| Expansion 15 result | Expansion 15 cost 2.80M territory and raised larva production from 45 to 49/s. The displayed Hatchery multiplier rose to `x4.97`, combining the 15-Expansion multiplier with Accomplished Ancestry I's +19%. The next Expansion costs 6.87M territory. | observed once |
| Faster Drones II | Spending 43,956 Drones changed per-Drone meat output from 2 to 4. The observed total Meat production rose from roughly 154M to 318M/s. | observed once |
| Faster Drones III | Spending 29.2M Drones while retaining about 56M (roughly 1.8x the cost) changed per-Drone output from 4 to 8. The observed total Meat production then rose to roughly 451M/s and continued growing with Drone population. | observed once |
| Twin Drones IV and V | Twin Drones IV cost 1,000 Queens and changed manual Drone hatching `x16` to `x32`; the prior Twin Drones III had changed it `x8` to `x16`. Neither upgrade affects passive Queen-to-Drone production. Both were affordable with a large Queen reserve. | observed once |
| Direct meat chain | Drones are the direct Meat producer. Nests increase passive Queens; Queens increase passive Drones; Faster Drones multiplies Meat per Drone. This chain must be compared against territory/larva candidates when Meat is the current gate. | observed once |
| Culicimorph comparison | Culicimorph produces 6,378 territory/s per unit for a displayed 68.3B meat and 1 larva. The first Twin-enabled hatch action produced four Culicimorphs and 25,515 territory/s, dramatically improving Territory output. The displayed per-unit cost did not transparently match the total batch deduction with Twin active, so exact batch-cost semantics remain unresolved; do not extrapolate its affordability from the per-unit line alone. | observed once |
| Accomplished Ancestry II | With the same 190 Achievement Points, level II cost 50.0B meat and 5.00M territory and raised larva production 49 to 59/s (`x4.97` to `x5.91`). It was chosen ahead of the simultaneously affordable Expansion 16 because its +19% multiplier was the larger direct larva gain per Territory spent. | observed once |
| Hatchery 10 and Expansion 16 | Hatchery 10 cost 300B meat, Expansion 16 cost 6.87M territory, and their combined result was 71 larva/s with a displayed `x6.50` multiplier. The next Hatchery costs 3.00T meat and the next Expansion costs 18.0M territory. | observed once |
| Faster Nests I breakpoint | Faster Nests I costs 66 Nests and doubles per-Nest Queen output 3 to 6. At 165 Nests, paying the cost leaves 99 (exactly 1.5x the cost) and raises passive Queen production 495 to 594/s; below 132 Nests the immediate output would fall. This validates a reserve-aware break-even test rather than buying it at unlock. | observed once |
| Faster Queens II | After hatching 16,000 Queens with `x4` Twin Queens and preserving more than 1.5x the 43,956-Queen cost, Faster Queens II changed Queen output 4 to 8 Drones/s. Observed total Drone production rose to roughly 750k/s. | observed once |
| Hatchery 11 and Expansion 17 | At 3.00T Meat, Hatchery 11 increased larva output from 71 to 78/s (`x6.50` bonus; 12 base). Expansion 17 then cost 18.0M Territory and changed the bonus `x6.50` to `x7.15`, producing 85 larva/s. Its next Territory cost is 41.2M. | observed once |
| Twin Queens III/IV and protected Nest bridge | Twin Queens III cost 100 Nests and changed manual Queen hatching `x4` to `x8`; the Queen panel again states that Nest production is unaffected. The run built Nests from 498 to 1,200 through bounded 100/200/102/200-unit actions. Twin Queens IV costs 1,000 Nests: it was deliberately not bought at 1,000, then bought at 2,500 so that 1,500 (exactly 1.5x its cost) remained. It changed manual Queen hatching `x8` to `x16`, with 10,000 Nests the next Twin threshold. | observed once |
| Culicimorph x8 batches | With Twin Culicimorphs III, one `Hatch 8` action raised the count 4→12 and Territory output 25,515→76,545/s; two further actions raised the count to 28, implying 178,584/s from Culicimorphs alone. The panel states 68.3B Meat and 1 larva per pre-twin unit. This was the active bridge that made Expansion 18 affordable while the Nest chain was still being built. | observed once |
| Expansion 18 | It cost 41.2M Territory and changed larva production 85→99/s, with displayed multiplier `x7.15`→`x8.27`. The following Hatchery 12 was then purchased at 30.0T Meat, producing 112 larva/s (13 base, `x8.68`). | observed once |
| First Greater Queen and Twin Nests I | The first Greater Queen did not merely require 10,000 Nests: buying it consumed all 10,000, leaving zero Nests and granting one Greater Queen producing 4 Nests/s. Twin Nests I then cost that one Greater Queen, removing its passive output but changing manual Nest construction to `x2`. With `=1000`, the live panel showed exactly 1,000 Nests for 36.4M Meat, 500K Queens, and 500 larvae. This makes rapid manual Nest recovery viable when Queen stock is high, but it is a deliberate exception to the per-unit reserve rule and must be modeled as such. | observed once |
| Territory-unit comparison at 2026-07-18 live state | The available army should not be ranked by raw output alone. Live per-unit panels showed: Swarmling `0.07 Territory/s` for 750 Meat and 1 larva (with `x8` Twin Swarmlings); Stinger `3/s` for 337M Meat and 1 larva (`x2`); Arachnomorph `141/s` for 151M Meat and 1 larva (`x8`); Culicimorph `6,378/s` for 68.3B Meat and 1 larva (`x8`); Locust `287,043/s` for 30.7T Meat and 1 larva (prepared to `x8`, but its first batch remains Meat-gated). Thus Swarmling is extremely Meat-efficient but poor in output per larva, Arachnomorph is a balanced middle option, Culicimorph is the high-output Territory bridge when Meat is abundant, and Locust is future high-output but currently unaffordable as a full batch. Stinger was dominated for this live resource mix. | observed once |
| Arachnomorph controlled batch and Expansion 19 | Twin Arachnomorphs were raised to `x8`; `=500` rounded to a 504-unit batch costing 9.56B Meat and 63 larvae, adding 71,064 Territory/s. Together with the earlier Culicimorph ramp this reached the 101M-Territory gate for Expansion 19, which raised larva production 112→126/s and displayed multiplier `x8.68`→`x9.70`. | observed once |
| Twin Locust/Swarmling preparation | Locust produces 287,043 Territory/s per unit for 30.7T Meat and 1 larva; its Twin upgrades were raised to `x8`. Crucially, the displayed cost is per pre-twin hatch action: the first `x8` batch cost 30.7T Meat and 1 larva, not eight times that amount, and produced 2.29635M Territory/s. Swarmling produces 0.07 Territory/s for 750 Meat and 1 larva; Twin Swarmlings were raised to `x8`. Swarmling is therefore exceptionally Meat-efficient but consumes vastly more larva per additional Territory/s than Arachnomorph or Culicimorph. | observed once |
| Reserve-safe second Greater Queen | After Twin Nests I, the Nest chain was rebuilt from 5,188 to 25,188 through five safe `=5000` actions; each costs 2.5M Queens and 2,500 larvae. The second Greater Queen was bought at 25,188 Nests, consuming 10,000 but leaving 15,188 (slightly more than the 1.5x 10,000-Nest reserve). This is the concrete safe form of the Greater Queen sacrifice, unlike the first exact-threshold experiment. | observed once |
| Active Greater Queen ramp and Twin Nests II | With Twin Nests I and roughly 50M stored Queens, an active loop of `=20000` Nests (10M Queens, 10K larvae at `x2`) then `Hatch 2` Greater Queens (20K Nests) moved the live state 1→3→5→7→9 Greater Queens. A final 10K-Nest bridge produced 10 Greater Queens. Twin Nests II then spent all 10 Greater Queens and changed manual Nest construction `x2`→`x4`. Despite returning to zero Greater Queens, the stored Queen bank immediately rebuilt 20,000 Nests for 5M Queens and 5K larvae. This validates a bounded active-play exception to a static 1.5x reserve rule: the relevant proof is fast, resource-backed reconstruction of the sacrificed link. | observed once |
| Hatchery 13 | Hatchery 13 cost 300T Meat and increased Larva production 126→135/s at a displayed `x9.70` bonus. The next Hatchery costs 3.00Qa Meat. | observed once |
| Expansion 20 after Locust bridge | One `x8` Locust batch carried Territory across the 247M gate quickly enough to buy Expansion 20. The purchase raised Larva production 135→154/s with displayed bonus `x9.70`→`x11.0`; the contemporaneous 260→280 Achievement Point increase also contributed to the displayed multiplier. The next Expansion costs 607M Territory. | observed once |
| Twin Nests II and active reconstruction | The 10-Greater-Queen offer was taken at zero Greater Queens, changing Twin Nests `x2`→`x4`. The immediate post-offer state retained about 5K Nests and ~30M Queens. A direct `=20000` Nest rebuild then cost 5M Queens and 5K larvae, producing 20,000 Nests. Subsequent `=20000` rebuild plus `Hatch 2` cycles rebuilt the Greater Queen count 0→2→4→6→8, and a 50K-Nest/`Hatch 5` cycle reached 13 then 18 Greater Queens. This is reproducible evidence that active Queen-bank reconstruction can dominate a static post-offer reserve rule in this stage. | observed once |
| Expansion 21 and second Locust batch | A second 8-Locust batch again cost 30.7T Meat plus 1 larva, raising Locust count 8→16. It helped reach the 607M Territory gate for Expansion 21. Expansion 21 raised larva production 154→169/s with displayed bonus `x11.0`→`x12.0`; next Expansion costs 1.48B Territory. | observed once |
| Faster Nests II live breakpoint | Faster Nests II costs 43,956 Nests. At about 52.5K Nests, spending the cost would leave roughly 8.5K. Even if it doubles per-Nest output, `2 × 8.5K` is below the original 52.5K passive output, so an isolated purchase is immediately negative. This confirms the immediate-output breakpoint `N > 2S` for a doubling Faster upgrade. | observed once |
| Faster Nests II active rebuild test | The same upgrade was then tested as a composite active action. It briefly left 22,378 Nests at 12 Queens/s each (268,536 Queens/s); rebuilding the exact 43,956-Nest sacrifice at `x4` cost 801M Meat, 10.9M Queens, and 10,989 larvae. The resulting state reached about 72,309 Nests and 867,708 Queens/s. Therefore the isolated `N > 2S` test is a necessary check for passive play, but is not sufficient for active play when a verified Queen/larva bank can restore the offered units immediately. | observed once |
| Expansion 22 and fourth Locust batch | Expansion 22 cost 1.48B Territory, raised Larva production 169→186/s, and changed the displayed Expansion bonus 640%→714%; the next costs 3.64B Territory. With 24 Locusts producing 6.88905M Territory/s, one further `x8` hatch cost 30.7T Meat plus one larva and raised Locust count 24→32 and their output to 9.18540M Territory/s. This is a measured time-to-next-Expansion investment, not a blanket preference for Locusts. | observed once |
| Greater Queen 5-pack and fifth Locust batch | At 18 Greater Queens, 78.6K Nests, and 136M Queens, `Hatch 5` Greater Queens consumed 50K Nests and yielded 23 Greater Queens, reducing Nest production to its new 92/s rate but leaving roughly 29K Nests. An immediate `=50000` Nest reconstruction at `x4` was affordable from the Queen bank. Separately, another 8-Locust batch cost 30.7T Meat plus one larva and raised the count 32→40, increasing Locust output 9.18540M→11.48171M Territory/s. | observed once |
| Faster Drones IV | At 553.308B Drones producing 8 Meat/s each (4.42647T Meat/s total), Faster Drones IV cost 19.4B Drones. The purchase left 541.731B Drones, doubled output to 16 Meat/s each, and raised total Meat production to 8.66770T/s. In contrast, Twin Drones V was available for 100K Queens but only increases manual Drone hatching `x32`→`x64`; with 541B existing Drones and 1.37731B passive Drones/s, its manual output is negligible in this live state and was deliberately not bought. | observed once |
| Hatchery 14, Expansion 23, and Locust 48 | Hatchery 14 cost 3.00Qa Meat and raised Larva production 186→200/s (15 base, `x13` multiplier). The next Hatchery costs 30.0Qa Meat. A subsequent Locust `x8` batch cost 30.7T Meat plus one larva; Expansion 23 then cost 3.64B Territory and raised Larva production 200→220/s, with the displayed Expansion bonus 714%→795%. The next Expansion costs 8.92B Territory. The Locust batch was selected as a short-ETA investment, and raised the count 40→48. | observed once |
| 28→48 Greater Queen active ramp | With roughly 99K then 104K Nests, the active loop hatched 9 Greater Queens (28→38) and rebuilt directly to 103K Nests for 1.82B Meat, 25.0M Queens, and 25K larvae at `x4`. A second 10-Greater-Queen offer moved 38→48 and temporarily left 5,883 Nests; a new 100K reconstruction remains affordable from the 335M Queen bank. This supports the earlier conclusion that, in early active play, the actionable safety metric is the ability to restore parent production immediately, not the post-offer unit count alone. | observed once |
| Continued Greater Queen ramp to 59 | From 48 Greater Queens and about 114K Nests, `Hatch 11` reached 59 Greater Queens and briefly left 6,076 Nests. A direct `=100000` Nest reconstruction was again affordable and restored the state to roughly 108K Nests. At this point the reconstruction is repeatable rather than an isolated recovery; the next meaningful branch comparison is at 100 Greater Queens, where Twin Nests III and the first Hive must be compared from one saved starting state. | observed once |
| Greater Queen 59→100 and correct Hive gate | A 17-GQ offer at 170K Nests moved the count 59→76 and left roughly 3K Nests; a `=200000` reconstruction cost 3.64B Meat, 50.0M Queens, and 50K larvae at `x4`, restoring about 207K Nests. A following 20-GQ offer and exact 3-GQ hatch reached 100. The Hive panel was then checked directly: the first Hive costs 590M Meat, **100K Greater Queens**, and one larva, and produces 5 GQ/s. Hive is therefore not a competing purchase at 100 GQ. | observed once |
| Twin Nests III and x8 reconstruction | Twin Nests III consumed all 100 Greater Queens and changed manual Nest construction `x4`→`x8`; its next threshold is 1,000 GQ. The retained ~197K Nests enabled an immediate 19-GQ restart, which left ~7K Nests. A `=200000` reconstruction under `x8` cost 1.82B Meat, 25.0M Queens, and 25K larvae, restoring about 208K Nests. Relative to `x4`, the same 200K rebuild halves the Queen, larva, and Meat cost, which materially strengthens the active reconstruction loop. | observed once |
| Faster Queens III and Roach comparison | Faster Queens III cost 29.2M Queens from a 915M Queen stock, doubled output 8→16 Drones/s per Queen, and raised total Drone production 7.32411B→14.50941B/s. Twin Queens V cost 10K Nests but only changes manual hatching, so it was skipped. Newly unlocked Roach produces 12.9169M Territory/s for 13.8Qa Meat plus one larva; at the live state it was inferior to an 8-Locust batch (2.29635M Territory/s for 30.7T Meat plus one larva) because Roach's extra Territory would delay the much larger Hatchery 15 Meat goal by minutes. | observed once |
| Expansion 24 and x8 GQ restart | Expansion 24 cost 8.92B Territory and raised Larva production 220→242/s (Expansion bonus 795%→884%); next Expansion costs 21.8B Territory. After the first post-Twin-Nests-III 20-GQ offer, the state was 39 GQ and ~17.5K Nests. A `=200000` x8 reconstruction cost 1.82B Meat, 25.0M Queens, and 25K larvae and restored roughly 220K Nests. | observed once |
| Hatchery 15 | Hatchery 15 cost 30.0Qa Meat and increased Larva production 242→258/s at the displayed `x16` multiplier. The next Hatchery costs 300Qa Meat. | observed once |
| Faster Greater Queens I active reconstruction | At 66 Greater Queens producing 264 Nests/s, Faster Greater Queens I consumed all 66 and doubled per-GQ output 4→8 Nests/s. A 400K-Nest bridge at `x8` was then built for 3.64B Meat, 50.0M Queens, and 50K larvae; 40 Greater Queens were hatched from it, leaving about 169K Nests. The rebuilt 40 GQ produce exactly 320 Nests/s, exceeding the 264 Nests/s before the offer. This validates Faster Greater Queens I as a positive active composite action in this resource state, but not as an isolated purchase. | observed once |
| Native import elapsed-time behavior | Re-importing the Faster Greater Queens I baseline correctly restored its 40 Greater Queens and Faster-GQ upgrade state, but resources had accumulated substantially since the original export (for example, Meat rose from about 9.22Qa at capture to 135Qa after delayed import). A direct re-export immediately after import was byte-identical to the original fixture (SHA-256 `d40d8f3d…1b7f08a5`). Therefore the native export retains a time reference and is not a time-frozen snapshot. Manual A/B branches must import immediately before each branch, record their actual start values, and compare bounded action deltas or short-horizon rates; exact frozen-resource replay would require separately authorized save-format research. | observed once |
| A/B: initial Roach versus Locust production | From consecutive imports of the same Faster-GQ baseline, the Roach branch bought Twin Roaches I (100 Meat and 1 larva) then one hatch action: 2 Roaches produced 25.8339M Territory/s for 13.8Qa Meat plus one additional larva. The Locust branch bought one existing-`x8` hatch: 56→64 Locusts and 16.0744M→18.3708M Territory/s, a gain of 2.29635M/s for 30.7T Meat and one larva. Roach therefore yields about 11.3× more Territory per larva, while Locust yields about 40× more Territory per Meat. At the current plentiful-larva, Meat-gated state, Locust is the preferred Territory action; Roach should be reconsidered only when larva becomes the binding resource or its later multipliers change the comparison. | observed once |
| Hatchery 16, Locust ramp, and Expansion 25 | Hatchery 16 cost 300Qa Meat and raised Larva production 258→274/s; next Hatchery costs 3.00Qi Meat. Four Locust hatch actions were consolidated as `=32`, costing 123T Meat and 4 larvae, raising Locust count 56→88 and Locust Territory production 16.0744M→25.2598M/s. Expansion 25 then cost 21.8B Territory, raised Larva production 274→301/s, and changed its bonus 884%→983%; the next Expansion costs 53.5B Territory. Twin Locust IV was explicitly rejected: its 125K-larva cost would only increase future manual Locust batch size and does not pay back before this next Territory goal. | observed once |
| Faster-GQ active ramp to 160 | With Faster Greater Queens I active and Twin Nests III (`x8`), successive 40-GQ offers raised the count 40→80→120→160. Each offer was followed by a `=400000` Nest rebuild costing 3.64B Meat, 50.0M Queens, and 50K larvae. At 160 GQ, production reached 1,280 Nests/s and the final rebuild restored about 630K Nests. This confirms that the fixed 400K reconstruction remains viable over several active cycles while Queen and larva banks are large. | observed once |

| Locust `=N` semantics, larger ramp | The unit input help and a live controlled action agree that `=N` means **buy exactly N additional units after twins**, while `@N` means buy up to a total of N. Entering `=2000` from 600 Locusts produced 2,600 Locusts, not 2,000. The 2,000-unit Locust action cost 7.68Qa Meat and 250 larvae and raised Territory production to 746.313M/s. This corrects any target-total interpretation of `=N` and makes Locust a fast Expansion bridge while Meat is plentiful. | observed once |
| Continued Faster-GQ reconstruction and Expansion 26 | From the 160-GQ state, additional active Greater-Queen offers reached 220, 280, then 380 GQ. The 600K-Nest reconstruction was affordable immediately after the 380-GQ offer: it restored the Nest stock from roughly 358K to 995K while retaining a large Queen bank. The restored 380 Faster GQ produce 3,040 Nests/s. The next Territory gate was then crossed and Expansion 26 was bought; the visible Territory bank fell from about 132B to 86.5B, establishing the next short-horizon recovery test from a high Locust rate rather than treating the spend as a passive-play failure. | observed once |
| Expansion 27, Faster Drones V, and adaptive GQ batches | The high Locust rate crossed the following Territory gate quickly enough to buy Expansion 27; Territory fell from 159B to 35.3B after the purchase. Faster Drones V was then selected over Twin Drones: it cost 12.9T Drones from a roughly 125T Drone stock and doubles real Meat output, whereas Twin Drones still affects only manual hatching. The active Greater-Queen path continued 480→580→630→680. Two 100-GQ rounds were followed by 600K-Nest rebuilds; when larvae fell to about 47K, the next step deliberately changed to a 50-GQ offer plus a 400K-Nest rebuild. It left 680 GQ, about 774K Nests, and ~59K larvae: a concrete example of batch sizing to the current larva bottleneck rather than blindly repeating the largest affordable cycle. | observed once |
| A/B: larva liquidity after a GQ offer | Saved baseline: `manual-play-larva-buffer-branch-baseline-2026-07-18.txt` (SHA-256 `69ca577c…cea69`). Both branches started at 680 Faster GQ. Branch A took 100 GQ then rebuilt 1.00M Nests, ending at 780 GQ, ~1.96M Nests, and ~38K larvae; it could hatch another 100 GQ, but could **not** follow with the smallest planned 400K-Nest rebuild because that costs 50K larvae. Branch B took the same initial 100 GQ then rebuilt only 400K Nests; it immediately completed a second 100-GQ + 400K-Nest composite action, reaching 880 GQ. The native import's elapsed-time accrual prevents an exact resource-total comparison, but the action-feasibility result is unambiguous: at this stage a larva reserve is not a fixed percentage, it is the larva cost of the next intended composite action. | observed once |
| Hatchery 17 and Expansion 28 | Once both gates were met, Hatchery 17 was bought for 3.00Qi Meat, then Expansion 28 was bought for 321B Territory. Immediately before their purchase, the UI reported Hatchery base production of 17 larvae/s and 478 larvae/s after existing multipliers; record their exact post-purchase rate in a later isolated measurement. These global larva upgrades were prioritized over another GQ round because they improve the recovery rate that constrained the buffer A/B test. | observed once |
| Twin Nests IV aggressive transition | With 880 GQ, 2.79M Nests, and 218K larvae, an exact `=120` GQ action reached the 1,000-GQ gate while retaining 1.65M Nests. Twin Nests IV then spent all 1,000 GQ and changed manual Nest construction `x8`→`x16`; it retained about 2.01M Nests. A deliberately aggressive restart hatched 200 GQ, leaving 15,888 Nests, then rebuilt 1.00M Nests. The rebuild consumed roughly 62.5K larvae — half the equivalent x8 cost — and restored 1.02M Nests. Two further 100-GQ + 1M-Nest cycles reached 400 GQ and about 1.17M Nests with 114K larvae. This is a reproducible early-game regime change: at x16, a 1M reconstruction is compatible with repeated active GQ compounding rather than an exceptional recovery action. | observed once |
| Territory-to-larva checkpoint after Expansion 28 | At 376B Territory, the next Expansion costs 788B and the game projected about 8:53 to reach it at the current Territory rate. The existing Expansion multiplier was 1,342%, and each additional Expansion adds 10% to Hatchery production. Thus the current Territory decision is an ETA problem: compare a Meat-and-larva-funded Territory unit's reduction of the 8:53 gate ETA against its delay to the current Meat/GQ plan, rather than treating Territory as a permanently lower priority. | observed once |
| Territory/GQ concurrent-action test | From the post-Twin-Nests-IV state, `=2000` Locusts were hatched at a cost of 7.68Qa Meat and 250 larvae. The Expansion-29 ETA fell to 3:40 at 63% of the 788B-Territory gate, compared with about 8:53 at the earlier 376B checkpoint. While that Territory investment accumulated, a 100-GQ offer plus `=1000000` Nest rebuild was also completed (400→500 GQ); it left 191K larvae and did not prevent the Expansion ETA from falling further to 3:04. At this resource mix the best action is therefore not a strict Territory-versus-Meat choice: buy the proven low-opportunity-cost Locust bridge, then use the remaining larva buffer for the independently valuable GQ/Nest composite action. Re-test when larvae or Meat becomes tight. | observed once |
| Expansion 29 and Giant Arachnomorph probe | At the higher army tier, the live unit costs were Locust 30.7T Meat + 1 larva per pre-twin hatch, Roach 13.8Qa Meat + 1 larva, and Giant Arachnomorph 6.22Qi Meat + 1 larva. One Giant Arachnomorph was bought from 8.70Qi Meat as a controlled probe; its Territory/s must be recorded in a follow-up before ranking it. The existing Locust bridge crossed the 788B Territory gate, and Expansion 29 was bought at 813B Territory, leaving 40.4B. Do not infer Giant Arachnomorph ROI from its price alone. | observed once |
| Post-Expansion-29 aggressive GQ ramp | With Twin Nests IV (`x16`) and a large larva bank, the active chain advanced 500→700→900→1,000 Greater Queens through `=200`, `=200`, then `=100` offers. Each completed round used a 1.00M-Nest reconstruction costing about 62.5K larvae; at 1,000 GQ, the next 1M reconstruction is prepared and affordable. This kept the GQ/Nest lane advancing while Territory recovered from 40.4B to 321B after Expansion 29. | observed once |
| Larger GQ composite batch | A larger x16 batch was tested rather than repeating a fixed 100–200 GQ cadence: construct `=2500000` Nests, hatch `=250` Greater Queens, then construct `=1000000` Nests. Starting from 1,000 GQ and about 1.28M Nests, the first construction consumed roughly 151K larvae; the GQ offer produced 1,250 GQ while leaving about 1.45M Nests; the final reconstruction was affordable and finished at 1,250 GQ, 2.55M Nests, and 131K larvae. Therefore batch size should be solved from the whole composite action's remaining larva/Nest capacity, not hard-coded to 100 or 200 GQ. | observed once |
| 300-GQ x16 composite | A subsequent larger composite (`=1000000` Nests → `=300` GQ → `=1000000` Nests) advanced 1,250→1,550 GQ. It completed with 3.41M Nests and 118K larvae. This confirms that, while the global Hatchery and Expansion gates remain out of reach, larger computed GQ composites can advance the chain faster without consuming the whole larva reserve. | observed once |
| 500- then 300-GQ larger steps | Once passive growth raised the state to 6.15M Nests and 254K larvae, a `=500000` Nest construction followed by `=500` GQ and a 1M-Nest rebuild advanced 1,550→2,050 GQ. A follow-up `=300` GQ offer reached 2,350 GQ; its 1M-Nest reconstruction is prepared and affordable. These larger steps preserve the same composite-action rule while materially reducing click cadence. | observed once |
| Territory priority at a larva bottleneck | With Expansion 30 at 1.93T Territory and 88% complete (ETA 2:01), a `=1000` Locust action cost 125 larvae and reduced the ETA to 1:22. The global gates then arrived together: Hatchery 18 was bought for 30Qi Meat, followed by Expansion 30 at 1.94T Territory. This validates the policy that, once Nest construction is larva-limited while Queens are abundant, a bounded Territory bridge that materially shortens the next Expansion can outrank more Nest purchases; stop the bridge before it blocks the global purchases themselves. | observed once |
| 1,000-GQ x16 composite | After Hatchery 18 and Expansion 30 raised the larva economy, the state reached 8.34M Nests and 466K larvae. A `=2000000` Nest construction followed by `=1000` GQ and a `=1000000` Nest rebuild advanced 2,350→3,350 GQ, finishing with 2.16M Nests and 305K larvae. At this stage a four-figure GQ batch is viable as a complete action, rather than a risk to the reconstruction buffer. | observed once |
| 800-GQ high-tempo composite | With 5.78M Nests and 401K larvae, a `=3000000` Nest construction enabled an `=800` GQ offer. The following 1M-Nest reconstruction was affordable, moving 3,350→4,150 GQ. A later 200-GQ offer reached 4,350 GQ with the next 1M reconstruction prepared. This confirms that high-tempo batch selection can scale with live stock rather than using a fixed upper limit; the hard requirement remains completing the planned reconstruction. | observed once |
| Giant Arachnomorph Territory bridge | A Giant Arachnomorph produces 581.263M Territory/s for 6.22Qi Meat + 1 larva. Twin Giant Arachnomorphs I costs only 100 Meat + 1 larva and changes manual hatching to `x2`. From the 4.73T Expansion-31 gate at 20% and ETA 28:39, Twin I plus an exact 4-Giant hatch reduced ETA to 13:21. Meat fell from roughly 28Qi to 16.4Qi, but the next Hatchery is 300Qi away, so this was a controlled use of surplus Meat to address the actual Territory bottleneck. A following 400-GQ + 1M-Nest composite advanced 4,350→4,750 GQ while retaining a 173K-larva buffer; Expansion ETA remained about 12:34. | observed once |
| Continued balanced run: additional Giants and 2K GQ bridge | A second exact four-Giant batch (with Twin I) moved Expansion-31 to 64% and ETA 4:07; this was the stopping point for further Giants because their marginal benefit was no longer sufficient to justify additional 6.22Qi spends. A 400-GQ + 1M-Nest composite then reached 4,750 GQ while retaining 173K larvae. As Nest stock later reached 20M, an exact 2,000-GQ offer plus an immediate 1M-Nest rebuild moved the live state to 6,810 GQ and restored about 1M Nests. Expansion-31 subsequently reached 73% with ETA 3:05. This demonstrates lane switching by measured ETA: fund Giants while Territory is far behind, then resume GQ compounding once the Territory ETA is compressed. | observed once |
| Full current army matrix | Current live per-unit production and per-hatch-action costs were measured for every visible Territory unit. Swarmling: `0.07/s`, 750 Meat + 1 larva, `x8`; Stinger: `3/s`, 337K Meat + 1 larva, `x2`; Arachnomorph: `141/s`, 151M Meat + 1 larva, `x8`; Culicimorph: `6,378/s`, 68.3B Meat + 1 larva, `x8`; Locust: `287,043/s`, 30.7T Meat + 1 larva, `x8`; Roach: `12.9169M/s`, 13.8Qa Meat + 1 larva, currently `x1`; Giant Arachnomorph: `581.263M/s`, 6.22Qi Meat + 1 larva, `x2`. Therefore Locust gives roughly 2.296M Territory/s per hatch action and remains the Meat-efficient bridge; Giant gives roughly 1.163B/s per action and is the larva/action-efficient Expansion accelerator when Meat is surplus; Roach is not currently selected because its no-Twin action is Meat-inefficient relative to Locust, despite better output per larva. The current zero-count units must remain candidates, but are not automatically purchases. | observed once |
| Twin Nests V branch at 10,000 Greater Queens | Saved the exact pre-upgrade state in `docs/test-data/player-saves/manual-play-twin-nests-v-baseline-2026-07-18.txt`. The control state had 10,000 Greater Queens and Faster Greater Queen I, producing 80,000 Nests/s. In the branch, Twin Nests V changed manual Nests from `x16` to `x32` but spent all 10,000 Greater Queens. Even after immediately constructing 10M Nests and hatching 2,000 Greater Queens, passive Nest production was only 16,000/s: 20% of the control. The baseline was then restored. | Live branch test, 2026-07-18 | Reject Twin Nests V at this threshold for active play. The larger manual multiplier does not repay the immediate fivefold collapse in Greater-Queen production; retest only with an explicit longer reconstruction/payback horizon. Native imports continue to accrue basic resources with time, so this comparison uses units, upgrades, and production rates rather than resource totals. |
| Hatchery 19 plus bounded Giant bridge | Raised Greater Queens from 10,000 to 17,001 through a 5,000 then 2,000 hatch sequence, rebuilding 10M Nests after the first action. Hatchery 19 was then bought as soon as 300Qi Meat was reached, increasing larva production from 782 to 824/s. With the following Hatchery far away (3.00S Meat), two Giant Arachnomorph batches raised the live count 9→13 and reduced Expansion-32 ETA from about 7:47 at 72% to 4:10 at 80%. | Live observation, 2026-07-18 | Once the next Hatchery is far away, a bounded Giant bridge is justified by measured Expansion-ETA improvement. Stop the bridge after the predeclared batch rather than treating available Meat as a reason to buy Army indefinitely. |
| Expansion 32 and extended Giant bridge | Expansion 32 raised larva production 824→906/s. Its successor costs 28.3T Territory while the next Hatchery costs 3.00S Meat, creating a long Territory-only window. With Meat around 200Qi, successive exact four-Giant batches moved Giant Arachnomorphs 13→17→21→25. Observed next-Expansion ETA fell approximately 50:07→39:08→31:38→25:50. The GQ lane also reached 26,173 GQ, but an attempted `=5000` hatch was Nest-limited and spent the available Nest stock; a controlled 10M-Nest rebuild restored it while retaining a Territory larva reserve. | Live observation, 2026-07-18 | In a long Territory-only window, Giant batches remain justified while each batch produces a material, measured ETA reduction. Exact hatch commands may be capped by the parent stock: treat their displayed maximum and the post-purchase parent balance as authoritative, then rebuild before repeating the chain. |
| Chilopodomorph unlock | The newly unlocked Chilopodomorph produces 26.1568B Territory/s per unit and costs 2.80Sx Meat plus 1 larva; it was not hatchable at 1.05Sx Meat. Twin Chilopodomorphs I cost only 100 Meat plus 1 larva and changes future manual hatching to x2; the upgrade was bought. Its next level costs 50,000 Meat and 50 larvae. In the same state, GQ compounding reached 36,173 GQ while retaining 130M Nests, and a final exact four-Giant batch advanced the army 25→29. | Live observation, 2026-07-18 | Add each newly unlocked Army unit to the current efficiency matrix before allocating its production cost. A near-free first Twin can be a reasonable future-hatching preparation, but should not be treated as evidence that the unit itself is currently affordable or the best bridge. |
| Hatchery 20, Expansion 33, and Faster GQ II gate | Hatchery 20 and Expansion 33 became simultaneously affordable and were bought in that order. Larva production increased 906→1,047/s. A controlled `=20000` Greater-Queen hatch moved the stock 36,174→56,174 while retaining about 293M Nests. Faster Greater Queens II then became visible: it doubles GQ output but costs 43,956 Greater Queens. At 56,174 GQ, buying it would leave only 12,218 GQ. | Live observation, 2026-07-18 | Do not buy Faster GQ II at the visibility threshold. Its immediate output is sharply negative at the observed stock; defer until the retained GQ count meets the production/payback rule, then test it as a dedicated branch. |
| First Hive transition | From 76,174 GQ and 553M Nests, `@100000` hatched the remaining GQ needed while retaining about 329M Nests. The first Hive then cost 590M Meat, 100,000 GQ, and 1 larva; it produces 5 GQ/s and unlocked Hive Queen. The active stock was reduced to 0 GQ (then began refilling passively from the Hive), but the Nest stock and lower chain remained intact. | Live observation, 2026-07-18 | The first Hive is a legitimate active-play tier transition once 100K GQ can be reached without consuming the supporting Nest chain. Treat later Hive purchases separately: their GQ sacrifice and their relation to Hive Queen must be measured rather than extrapolated from the first one. |
| Hive Queen gate and post-Hive rebuild | Hive Queen produces 6 Hives/s but its first hatch requires 53.1B Meat, 1,000 Hives, and 1 larva. After the first Hive, an exact 30,000-GQ hatch used 300M Nests and reached roughly 31.9K GQ; an exact 20M-Nest rebuild then restored Nest stock to 73M while retaining 2.58M larvae. | Live observation, 2026-07-18 | Hive Queen is a long-horizon target. Immediately after the first Hive, resume the GQ/Nest active loop in bounded batches; do not sacrifice the new Hive's only GQ production path for a premature attempt at the 1,000-Hive gate. |
| Army efficiency correction after Expansion 34 | Re-measured every visible Army unit. Per hatch action: Locust yields 2.296M Territory/s for 30.7T Meat + 1 larva; Giant Arachnomorph yields 1.162526B/s for 6.22Qi Meat + 1 larva; Chilopodomorph yields 52.3136B/s for 2.80Sx Meat + 1 larva. Thus Locust is overwhelmingly Meat-efficient, Giant is the middle ground for output per action, and Chilopodomorph is larva/action-efficient but currently Meat-inefficient. With 3.2M larvae and about 10Sx Meat, exact 800,000 Locusts and 200 Giants were hatched: Locust 5,600→805,600, Giant 33→233. Territory immediately accelerated from roughly 2T to 29T while preserving most larvae. | Live observation, 2026-07-18 | Do not rank Army units by their highest single-unit output. At larva surplus, buy Locust in large bounded batches for Meat ROI, add Giants only for action-efficient output, and reserve Chilopodomorph for a genuine larva-constrained regime. |
| Army-to-larva feedback loop | The Army ramp made Expansion 35 affordable before the next Hatchery. Expansion 35 increased larva production 1,292→1,487/s. With 4.3M larvae and 38Sx Meat, an exact 1,000,000-Locust batch consumed about 125K larvae, added roughly 287B Territory/s, and moved Locust 805.6K→1.8056M. | Live observation, 2026-07-18 | Strategy must score cross-lane feedback, not just direct Meat growth: Meat funds Army; Army shortens Expansion; Expansion increases larva production; larvae finance active Army and Nest/GQ rebuilding. A planner that ignores Army can miss the fastest path to more larvae and therefore to every manual progression lane. |

## Fixed unit unlock thresholds and a bot-testing caveat (game data, 2026-07-18)

Unit unlock gates are fixed regardless of Ascension (only percentages and
global output scale, not the thresholds themselves); a unit's own `requires`
condition can be read directly from the game data.

- **Nexus (`nexus1`)** unlocks at **current meat `>=` 333,333,333,333
  (333.33B)** — a single meat-bank requirement (game data:
  `nexus1.requires = { unittype: meat, val: 333333333333 }`). During manual
  play the standing meat bank never held above this before it was spent, so
  the Energy/Nexus layer stayed locked, exactly as observed. On a fresh game
  `nexus1.isVisible()` is `false`; it only turns `true` once the meat bank
  crosses the threshold.

Bot-testing caveat (this extends the native-import offline-catch-up note in
the save-format research below, and in the "Native import elapsed-time
behavior" row): the native `importSave` applies "Welcome back" offline
production, which can inflate a resource far past a *later* unit's unlock
threshold at import time. Observed 2026-07-18: a pre-Ascension save whose real
meat bank was ~1.58B imported with meat ~1.7e15, which crossed the 333.33B
Nexus gate and let the autobuyer buy a Nexus that the live player never had
available. Therefore any bot-behavior test against an imported save must
control the offline-time effect before concluding the bot mis-selected: a
purchase that only becomes possible after import-time catch-up is a test
artifact, not a live-play decision. (Secondary, still open: the autobuyer
gates the whole Energy phase on `nexus1.isVisible()` alone, so a genuine
pre-Ascension meat-bank spike past 333.33B would also trip it; hardening that
gate is tracked as a separate strategy question, not a game-data fact.)

## Energy ability map (game data + live casts, 2026-07-21)

Source: production Swarm Simulator `v1.1.17`. Ability cost/effect definitions
were read from the live game engine (`angular.injector().get("game")`); the
delta measurements are from single controlled casts on a mature save
(Ascension 11, 5 Nexus, ~422K energy) loaded in the in-app browser. Delta
*ratios* (e.g. "7200 x velocity") are internal to one tick and are therefore
robust to the native-import offline-catch-up inflation noted elsewhere in this
book; absolute banks are not.

### Energy economy

- All six abilities are repeatable upgrades with a fixed energy cost
  (`factor = 1`) and require the `nexus` unit to exist.
- Energy is produced only by Nexus units at `0.1/s` each (base), plus a
  one-time burst when each Nexus tier is built. At the observed 5-Nexus state
  the live regen was `1.9/s` (Ascension/`mutantnexus` scaling above the `0.5`
  base).
- **Energy has a hard cap.** Observed live: `energy = 421,946`, `cap = 427,633`
  (98.7% full). Above the cap all further Nexus production is wasted, so near
  the cap the correct play is to spend energy down. `mutantnexus` raises both
  Nexus energy production and the energy `capMult`.
- Nexus build tiers (one-time, add `+1` Nexus and an energy burst):
  `nexus1` 3.333e12 meat (+2000 e); `nexus2` 3.333e15 meat + 625 e (+4000 e);
  `nexus3` 3.333e18 meat + 2500 e + 3.333e6 larva (+6000 e); `nexus4` 3.333e21
  meat + 10,000 e + 3.333e7 larva (+8000 e); `nexus5` 3.333e24 meat + 36,000 e
  + 3.333e9 larva (+10,000 e). (`nexus1` becomes *visible* at meat >= 333.33B
  per the unlock-threshold section above; its *cost* is 3.333T meat.)

### Ability cost, effect, and measured value

| Ability (id) | Energy | Effect (engine definition) | Live cast result at observed state |
|---|---|---|---|
| Meat Rush (`meatrush`) | 1600 | +7200 s of meat velocity + flat 1e11 meat | -1600 e; +1.3717e194 meat = exactly `7200 x meatVel`; **+152% of the meat bank** |
| Larva Rush (`larvarush`) | 1600 | +2400 s of larva velocity + flat 1e5 larva | -1600 e; exactly `2400 x larvaVel`; only **+0.0093% of bank** (larva oversupplied) |
| Territory Rush (`territoryrush`) | 1600 | +7200 s of territory velocity + flat 1e9 territory | -1600 e; exactly `7200 x terrVel`; only **+1.2e-7% of bank** (territory oversupplied) |
| Swarm Warp (`swarmwarp`) | 2000 | `skipTime` 900 s + energy velocity -900 (denies energy gain during the warp) | -2000 e; territory exactly +900 s, meat +948 s (compounds downstream), **and producer counts advanced: drones +10.3%, queens +6.2%** |
| House of Mirrors (`clonearmy`) | 2500 | `compoundUnit x2` on every army unit (swarmling..goon, 11 units) | -2500 e; every army unit **x2 (+100%)** -> territory/s **x2 (+100%)** |
| Clone Larvae (`clonelarvae`) | 12000 | `compoundUnit` larva (val 2, cocoon cap 1e5), scaled by `power.clonelarvae` | -12000 e; +2.51e27 larva = **+16.7% of bank** (~4.33e6 s ~ 50 days of larva production; observed `power.clonelarvae = 43.27`) |

### Strategic reading

- A **Rush** adds `power x baseSeconds x current velocity` of one resource. Its
  value is therefore that amount **relative to how much of the resource you
  actually need**. The same 1600 energy delivered `+152%` of the meat bank but
  `+1.2e-7%` of the territory bank in one state. A rush is worth an energy cast
  only when its resource is the *current binding gate*; when the bank already
  dwarfs production it is wasted energy.
- **Swarm Warp is the only ability that advances producer populations**, so its
  gains compound (more drones/queens -> more future production) instead of being
  a one-time resource dump. It is the default broad-economy energy sink when no
  single resource sharply gates progress.
- **Territory Rush and Larva Rush are near-useless in a mature, oversupplied
  state.** Larva Rush still matters early, when larva gates manual unit
  purchases, Hatcheries, and Expansions.
- **House of Mirrors** is niche: it doubles territory/s only when the army *is*
  the territory engine and territory is the gate; it does nothing for empty army
  rows. It has **no** mutagen power hook, so its effect is always a flat `x2`.
- **Clone Larvae** is the premium larva wall-breaker at 12000 energy = 7.5 Meat
  Rushes; justify it against that alternative and only when larva is a genuine
  hard wall with an energy surplus.
- Mutagen upgrades scale these: `mutantrush` -> `power.{larva,meat,territory}rush`;
  `mutantswarmwarp` -> `power.swarmwarp`; `mutantclone` -> `power.clonelarvae`;
  `mutantnexus` -> Nexus energy production and energy `capMult`.

### Script implication (open question, not yet a verified rule)

Energy-phase logic should (a) respect the energy cap and spend before overflow,
(b) score each ability by its effect toward the **current** bottleneck resource
per unit of energy, (c) default to Swarm Warp for broad pushes, and (d) not cast
a rush for an oversupplied resource. This extends, and must be validated
against, the existing advisor-only Energy-abilities lane; it is recorded here as
a measured basis for that work, not as an accepted planner change.

## First-Ascension energy gate and ascend-cost decay (game data + live climb, 2026-07-21)

Source: production Swarm Simulator `v1.1.17`, engine read via
`angular.injector().get("game")`, driven from the pinned pre-Ascension baseline
`manual-play-first-nexus-baseline-2026-07-21` (see the reproducible-seed list).
As with the energy-ability map, the *formula* and *delta ratios* below are
internal to one tick and are robust to the native-import offline-catch-up
inflation; absolute banks and any wall-clock ETA are not.

### The gate is energy, and spending energy lowers the cost

The first Ascension is **not** gated by accumulating a visible `premutagen`
resource (the `premutagen`/`mutagen` UI only unlocks at `ascension >= 1`). It is
gated by the **energy bank** meeting a decaying `ascendCost`:

```
ascendCostPercent = min(1, energy / ascendCost)
ascendCost        = 5e6 * 1.12^(ascensions) / 2^(energySpent / (5e4 * mutagen.stat("ascendCost",1)))
```

- `ascendCost` starts at **5,000,000** energy on a fresh run (`ascensions = 0`,
  `mutagen` stat `= 1`, so the halving divisor is `50,000`).
- **Every energy unit spent — on Nexus tiers *and* on abilities — accrues to
  `ascendEnergySpent`**, and each `50,000` cumulative energy spent halves
  `ascendCost`. Verified live: after buying Nexus 2 and Nexus 3 (energy costs
  `625 + 2,500 = 3,125`), `ascendEnergySpent = 3,125` and `ascendCost` fell
  `5,000,000 -> 4,788,017`, matching `5e6 / 2^(3125/50000)` exactly.
- `ascend()` then converts `premutagen -> mutagen` and increments `ascension`.

So the route to the first Ascension is a loop, not a single purchase: raise the
energy **cap and regen** by building Nexus tiers, fill energy, **spend** it to
grind `ascendCost` down, and repeat until the (reduced) `ascendCost` is at or
below a full energy bank. Reaching `ascendCost ~ 427K` (the 5-Nexus cap noted in
the energy-ability map) requires spending on the order of `177,000` cumulative
energy (`log2(5e6 / 427K) ~ 3.55` halvings x `50,000`).

### Nexus-ladder climb from one bank (measured)

From the baseline (1 Nexus, energy ~2,064, meat and larva in large surplus), a
single burst-funded climb reaches **Nexus 3 and then stalls**:

| Tier | Energy before | Energy after | Net | Note |
|---|---|---|---|---|
| Nexus 2 | 2,064 | 5,439 | +3,375 | cost 625 e, burst +4,000 e |
| Nexus 3 | 5,439 | 8,939 | +3,500 | cost 2,500 e + 3.33M larva, burst +6,000 e |
| Nexus 4 | 8,939 | — | — | **wall**: costs 10,000 e; bank is 8,939 (short ~1,061) |

- The starting bank funds exactly Nexus 1 -> 3 because tiers 2-3 return more
  energy in their build burst than they cost; the bank actually *grows*
  (2,064 -> 8,939). **Nexus 4 is the first hard energy wall** (its 10,000-energy
  cost exceeds what the chain leaves).
- Nexus 3 unlocks **`nightbug`** (the first mutation unit; `requires nexus>=3`),
  raises the energy cap `10,000 -> 30,000`, and raises regen to `0.3/s`
  (base regen scales at `~0.1/s` per Nexus). `moth` needs Nexus 4, `bat` Nexus 5.
- `nightbug` is buyable at `10 energy + 1 larva` each but has no `premutagen`
  production rate; the mutation units feed the ascension layer through their
  engine `effect`, not a visible per-second premutagen velocity.

### Nexus-spend dominates ability casts for reaching Ascension (verified A/B, 2026-07-21)

Two branches were run from immediate re-imports of the pinned
`manual-play-first-nexus-baseline-2026-07-21` state, each spending the starting
energy differently and measuring the `ascendCost` decay and side effects:

| Measure | Branch A: cast `larvarush` | Branch B: buy Nexus 2 + 3 |
|---|---|---|
| Energy charged to `ascendEnergySpent` | 1,600 | 3,125 |
| `ascendCost` | 5,000,000 -> 4,890,318 (-109,682) | 5,000,000 -> 4,788,017 (-211,983) |
| Decay **per energy spent** | ~68.6 | ~67.8 |
| Energy bank after | 2,157 -> 557 (net -1,600) | 2,166 -> 9,041 (net **+6,875**) |
| Energy cap | 10,000 (unchanged) | 10,000 -> **30,000** |
| Regen | 0.1/s (unchanged) | 0.1 -> **0.3/s** |
| Side effect | +1.98M larva (oversupplied, wasted) | unlocked `nightbug`, reached Nexus 3 |

**Result: spending energy on the Nexus ladder strictly dominates casting
abilities when the goal is the first Ascension.** The `ascendCost` decay per
energy spent is effectively identical in both branches (~68), confirming the
halving depends only on cumulative `ascendEnergySpent`, not on what the energy
buys. But a Nexus purchase carries a compounding triple advantage an ability
cast lacks:

1. **Self-funding** — the build burst (`+10,000` across tiers 2-3) exceeds the
   `3,125` spent, so the energy bank *grows* (2,166 -> 9,041) while an ability
   cast drains it (2,157 -> 557).
2. **Higher ceiling** — the cap rises `10,000 -> 30,000`, so a larger qualifying
   bank can be held.
3. **Faster refill** — regen rises `0.1 -> 0.3/s` (`~0.1/s` per Nexus).

Therefore the verified tactic toward the first Ascension is: **spend all energy
on the Nexus ladder (2 -> 3 -> 4 -> 5) first; cast an ability only when a
resource it boosts is the genuine current bottleneck** (larva and territory are
not, in this mature economy). This is now an accepted basis for the
energy/ascension-phase planner lane, subject only to the standing rule that
absolute wall-clock ETAs from an offline-inflated import remain test artifacts.

## Clean Nexus-5 ability baseline and the first-Ascension outcome (game data + live, 2026-07-21)

Driven from the pinned first-Nexus baseline, fast-forwarding only the energy and
larva accumulation needed to build the Nexus ladder (a test-artifact shortcut of
regen time; the delta ratios measured below are tick-internal and unaffected).
This reaches **Nexus 5, ascension 0, all mutant powers = 1** — the clean,
unboosted counterpart to the mature-save energy-ability map above.

### The mutation units feed energy, not premutagen

`nightbug`, `moth`, and `bat` unlock at Nexus 3/4/5 and each cost only energy +
larva (`10 e + 1 larva`, `10 e + 1 larva`, `100 e + 1 larva`). Their engine
`effect` is an asymptotic stat on the **energy economy**, not on premutagen:

- `nightbug` -> energy `capMult` (asymptotic toward `x6`)
- `moth` -> `nexus` `prod` (raises Nexus energy production/regen, toward `x2`)
- `bat` -> energy `power` (toward `x1.6`)

(This corrects an earlier false lead: a raw string scan flagged these units as
"affecting premutagen" only because each `effect` object carries the whole
serialized game state, which contains every unit name. The extracted effect
targets are energy stats.)

### Clean ability performance at Nexus 5 (power = 1)

Each ability was measured from an immediate re-import of the same clean Nexus-5
state, so the casts are independent:

| Ability | Energy | Clean effect (power = 1) | % of bank in this economy |
|---|---|---|---|
| Meat Rush | 1,600 | `7,200 x meatVel` (flat 1e11 negligible) | +12.5% meat |
| Territory Rush | 1,600 | `7,200 x terrVel` (flat 1e9 negligible) | +3.1% territory |
| Larva Rush | 1,600 | `2,400 x larvaVel + 1e5` | +0.12% (oversupplied) |
| House of Mirrors | 2,500 | army **x2** -> territory/s **x2** (no power hook) | — |
| Swarm Warp | 2,000 | skip 900 s: drones +1.18%, queens +0.78%, +900 s territory/meat | — |
| Clone Larvae | 12,000 | **+100,000 s of larva velocity** (cocoon cap 1e5) | +4.70% larva |

Headline: **Clone Larvae collapses without the mutagen boost.** Clean it adds
exactly `100,000 s` (~27.8 h) of larva; on the mature save (`power.clonelarvae =
43.27`) the same cast delivered +16.7% of a far larger bank. Clean it is only
+4.70% for 12,000 energy (= 7.5 Meat Rushes), so **Clone Larvae is a
post-Ascension / mutagen-scaled ability, not a pre-Ascension tool.** Rush ratios
and the House-of-Mirrors `x2` are power-independent (identical clean vs boosted);
Swarm Warp's producer advance is smaller here (+1.18% vs +10.3% on the mature
save) because it tracks the economy's growth rate, not the fixed 900 s skip.

### The first Ascension grants zero mutagen (verified live)

The full `ascend()` logic: `mutagen += premutagen.count()`, `premutagen := 0`,
`ascension += 1`, then every non-`mutagen`-tab unit and upgrade resets to its
init value. Crucially, **`premutagen` has no producer, no cost, and no effecter
in the engine unit graph — even after `ascension = 1`** — so it is `0` at ascend
time and stays `0`.

A first ascension was therefore driven and executed live from the clean Nexus-5
state (energy spent to pull `ascendCost` down to `64,232`, then `energy 65,516`
crossed it):

| Before | After |
|---|---|
| ascension 0, mutagen 0, premutagen 0 | **ascension 1**, **mutagen 0**, premutagen 0 |
| — | premutagen now *visible* (layer unlocked) |
| — | economy reset (nexus 0, GQ 0, meat 35, energy 0) |
| next `ascendCost` = 5,000,000 | next `ascendCost` = **5,600,000** (`5e6 x 1.12^1`) |

So the first Ascension is **not** a mutagen harvest. Its function is to unlock
the mutation layer (make `premutagen` active) and reset the run with
`ascension = 1`, which raises the next `ascendCost` by the confirmed `1.12^n`
factor. This validates measuring the clean pre-Ascension state *before*
ascending: the ascension itself yields nothing.

### Open question: how is mutagen ever earned?

If `premutagen` is never produced, no ascension can grant mutagen — yet the
mature Ascension-11 save also showed `mutagen = 0` while holding maxed mutant
units (e.g. `mutantclone ~ 3e24`). That implies mutagen is either a transient
resource spent immediately on acquisition, or earned through a path outside the
unit production graph (the visible-but-unproduced `crystal`, or the
`mtxEnergy`/microtransaction hooks, are the leading suspects). This is left as a
question requiring dedicated save-format/engine research, not a guess.

## Active-play principles and open save-format research

- Idle progression is deliberately a repeating loop: act, allow production to
  accumulate over a growing wait, then spend the accumulated resources. Costs
  and natural wait length both rise later in a run.
- The optimizer's advantage should come from actively recognizing the next
  bottleneck and applying a bounded, evidence-backed action during those
  waits. It must not rely on modifying save times, save contents, or offline
  rewards.
- "Wait" is not an action recommendation. When no current target is directly
  affordable, the planner must search for a bounded action that shortens that
  target's ETA: direct producer output, parent production, a multiplier, an
  unlock, or the resource lane that gates it. If every candidate fails a
  reserve or payback rule, it must state that exact blocker instead of issuing
  an unqualified wait instruction.
- A more expensive unit is not automatically the better purchase. Compare the
  relevant output, the cost in every constrained resource, the next unlock it
  advances, reserve after spending, and the action's payback horizon. The
  Stinger-versus-Arachnomorph and Hatchery-versus-Expansion observations are
  concrete examples of this rule.
- Achievements add percentage larva production through Accomplished Ancestry.
  They normally arrive as a consequence of healthy progression and should be
  observed as an economy multiplier, not pursued through wasteful manual
  purchases unless a later, separately measured threshold has positive
  payback.
- Save-format question: the native import behavior is consistent with a
  persisted last-save/last-active timestamp. The exact encoded field and
  update semantics remain unverified. Any future format inspection is
  read-only research; it must not alter production saves or be used to create
  artificial elapsed time.

### Working hypotheses to test, not production rules

- Twin upgrades alter manual hatching only; they do not raise parent passive
  production. Their value therefore falls when the expected manually hatched
  amount over the decision horizon is small compared with passive growth. Test
  their cost/payback against direct producer and Faster candidates rather than
  assuming every available Twin is worth buying.
- A Faster upgrade that spends `S` units and doubles their output is
  immediately production-positive only when the pre-spend population `N` is
  greater than `2S`: `2(N-S) > N`. A 1.5x retained-resource policy
  (`N >= 2.5S`) gives a positive immediate margin, but Faster must still be
  tested for downstream resource cost and payback. It is not automatically
  good merely because it doubles output.
- Greater Queen is the next meat-chain tier, but its currently observed gate
  is 6.56M meat, 10,000 Nests, and 1 larva for 4 Nests/s. The current 99-Nest
  state is far below that threshold, so active steps should target the
  cheapest safe increase in Nest/Queen/Drone throughput or their multipliers.
- Larva is a likely recurring global bottleneck because it buys manual units
  and gates Hatcheries, Expansions, and higher units. Treat it as a leading
  hypothesis; compare its ETA against the live Meat and Territory gates rather
  than hard-coding it as the bottleneck in every state.
| Faster Queens I | Spending 66 Queens changed Queen output from 2 to 4 drones per second. At 316 Queens before the purchase, total Queen output rose from 632 to 1,000 drones per second after the sacrifice. | observed once |
| First Nest threshold | One Nest costs 72,900 meat, 1,000 Queens, and 1 larva, then produces 3 Queens per second. The game itself warns that the first Nest's Queen sacrifice takes a long time to rebuild. | observed once |
| Twin Queens I | Spending one Nest changed manual Queen hatching to `x2`; Nest passive production was explicitly unaffected. | observed once |
| Nest scaling | Building three Nests from 3,138 Queens left 138 Queens and produced 9 Queens per second. | observed once |
| Greater Queen gate | The first Greater Queen produces 4 Nests per second and requires 6.56M meat, 10,000 Nests, and 1 larva. | observed once |

## Next research question

## Live energy/Nexus checkpoint (2026-07-22)

- After Nexus 3 the live Energy lane showed `6,976 / 55,000` energy and passive generation of `0.3 energy/s`. The next Nexus purchase was explicitly priced at `10,000 energy`.
- The Energy `Crystal` page showed `crystal 0`, stated that crystals are no longer sold, and offered no conversion while the balance was zero. This is storage/conversion, not an energy-production route.
- The visible Rush abilities are sinks, not sources: Larva Rush, Meat Rush, and Territory Rush each cost `1,600 energy`; Swarmwarp costs `2,000 energy` and advances production time but does not produce energy. They were not cast during this checkpoint so the Nexus reserve remained intact.
- Nightbug 200 had already raised the energy cap by `83.33%`; it increased capacity, not the observed `0.3/s` regeneration rate. Current manual objective is therefore to preserve energy for Nexus 4/5 rather than spend it on Rush or further capacity purchases.
- The live Nexus 4 panel confirmed the complete gate: `3.33Sx meat + 10,000 energy + 33.3M larvae`; with 6,982 energy the UI showed 69% energy progress and an estimated `2:47:39` remaining for the energy gap. This makes Energy, not Meat or Larva, the immediate Nexus bottleneck in this checkpoint.
- A live test of `More... → Buy cheapest 2 upgrades` was not safe in this state: it reduced the visible banks from about `17.2No meat / 213Qa territory` to `14.3No / 177Qa`. The short-lived UI `Undo` did not restore those full cross-lane changes; re-importing the captured export string did restore the prior branch (`17.6No meat / 214Qa territory`, Nexus 3, crystal 0). Treat batch-buy as non-reversible for branch testing and prefer one visible action at a time.

Continuing the live branch, offline catch-up brought the account to Nexus 4 with `60.3No meat / 541M larvae / 188Qa territory / 13,039 energy`; Nexus 4 cost `2,000 energy` and unlocked Lepidoptera. Buying the visible `hatch 276` batch (10 energy + 1 larva each) reduced energy to about `8,289` and raised Lepidoptera to 276. A second visible `hatch 207` batch reduced energy to `6,240` and raised Lepidoptera to 484. The Nexus panel now shows the next gate as `36,000 energy`; no energy fabrication was used.
- The live Crystal panel states that crystals have no cap and persist through ascension. At Nexus 4, `crystal 500` exposed a real `convert 500` action; converting it changed the balance to `crystal 0` and increased energy from `4,783` to `5,289` (1:1). The game also displayed the player-facing hint: “Your next hatchery or expansion will award 500 crystals.” This makes larva/territory purchases a potential energy bridge, but the crystal award is conditional on reaching the next hatchery or expansion rather than universal.
- A follow-up live test at Nexus 4 bought exactly one visible Hatchery upgrade for `30.0No` Meat. The purchase raised larva production from about `5,109/s` to `5,279/s` and immediately awarded `500` crystals (`crystal 0`→`500`). The Crystal panel then started a roughly 30-minute cooldown and stated “After 29:xx, your next hatchery or expansion will award 500 crystals.” Thus the reward is attached to the completed hatchery/expansion event, with a timed gate before the next award; it is not granted by every purchase in rapid succession.

The current research question is the active-chain ordering: compare a direct
producer multiplier (Faster Drones), parent multiplier (Faster Queens/Nests),
Territory bridge, Expansion, and Accomplished Ancestry from one time-controlled
branch. Preserve the 1.5x/2x reserve test and record a recommendation only
after at least two identical-start branches agree on metric and horizon.

## Longer active-play pass (2026-07-22)

- Twin Nests VII was purchased for `1.00M` Greater Queens. The manual Nest
  batch changed from `x64` to `x128`; Greater Queens fell from about `1.70M`
  to `700K`, so passive Nest production temporarily fell to about `11.2M/s`.
- A visible Nest batch of `8.23B` consumed about `128M` larvae and produced
  `16.66B` Nests. The action also awarded the `Final Nesting Place` achievement
  (`+30` points), showing that achievements can arrive as a side effect of
  ordinary throughput purchases.
- Expansion 41→42→43→44 was bought one at a time. Larva production rose
  `5,761→6,337→7,381→8,119/s` (the UI multipliers were `185→204→238→261`).
  Each purchase spent Territory, but fast army regeneration rebuilt the bank;
  the next Expansion 44 cost `1.32Qi` Territory.
- Locust batches were the strongest observed Territory bridge in this pass:
  `1.80563M→3.09280B` raised output to `887.771T Territory/s`, then
  `3.09280B→4.40672B` raised it to `1.26492Qa/s`. The latter consumed about
  `41M` larvae and left `123M`, while Territory grew from about `5.08Qi` to
  `5.46Qi` during catch-up.
- Faster Drones 8→9 doubled per-drone meat output `256→512`; total Drone
  production rose `4.52969→7.75420` octillion meat/s after the population
  sacrifice. This is a direct example where a Faster upgrade was worth taking,
  but only because output remained strongly positive after spending.
- Two visible Roach batches raised the army `0→2.32406B→4.06755B` and output
  `30.0198→52.5404` quadrillion Territory/s. Each batch spent larvae, and the
  game awarded `Roach Coach` and `Roach Clips` (`+10` each). This reinforces
  that the army lane must be scanned across units instead of buying only the
  most expensive unit.
- Twin Greater Queens I was then bought for the single available Hive. Manual
  Greater Queen hatching changed from `x1` to `x2`; the Hive bank became zero,
  while passive Nest production remained essentially unchanged. Twin Greater
  Queens II requires `10` Hives, so this was an unlock/branch action rather
  than an immediate passive-production multiplier.

### Confirmed territory boundary

- From `67.4Qi` Territory, buying Expansion 44 through 47 in one visible
  `Buy 4` action reduced the bank to `35.8Qi` and raised larva production
  `8,119→11,887/s` (`×261→×383`). Expansion 48 then required `47.8Qi`
  Territory and was visibly unavailable. At this exact boundary, Territory is
  the direct current bottleneck; army output is the next lever that shortens
  its ETA.

- Buying `6,048` previously unowned Goons (at `255Oc` meat and `1` larva per
  hatch, with `×32` twins) moved the run past that boundary and enabled
  Expansion 48 and 49. Expansion 50 was then reached, after which the next
  Expansion was again visibly unavailable. This is direct evidence that a
  lower, affordable army unit can be the immediate Territory bridge; it must
  be compared alongside, rather than behind, the expensive army tiers.
- The bridge shifted the direct constraint to meat: at `120Oc` meat a Goon
  hatch costing `255Oc` was unavailable. A large Drone hatch restored the
  bank past `314Oc`, allowing one more `×32` Goon hatch; the Goon button then
  became unavailable again. The active loop is therefore measurable as
  `Drone production → meat bank → affordable army batch → Territory →
  Expansion`, with meat as the current purchase-blocking resource after the
  latest army action.
- A further active pass confirmed the loop rather than a one-off result:
  Drone batches rebuilt meat from `135Oc` to `276Oc`, a Goon batch converted
  that into Territory, and Expansions advanced `50→53` before the next
  Expansion was blocked by Territory again. The drone batches reduced the
  visible larva bank to about `0.68M`, yet a Drone hatch remained buyable; at
  this point larvae are a shrinking liquidity constraint, not the hard
  immediate blocker. The nested ordering is therefore: Territory gates the
  next Expansion, meat gates the army bridge, and larvae gate the size and
  tempo of the meat-rebuild batches.
- **Current army decision rule (live 1.1.17):** every visible Army unit was
  inspected before allocating the next batch. All shown rows currently hatch
  at `×32`, so the ranking must retain two separate scores: Territory per
  meat (Swarmling is strongest, then progressively lower tiers) and Territory
  per hatch action/larva (Goon is strongest, followed by Devourer and Wasp).
  In this run the larva bank is low while a `×160` Goon offer is buyable at
  `255Oc` meat per hatch action. Therefore Goon is the selected *current*
  Expansion accelerator: it converts one larva into the largest immediate
  Territory increase. Swarmling remains the correct long-horizon,
  meat-efficient filler once larva is plentiful again. Do not collapse these
  two rankings into a single `most expensive` or `highest output` heuristic.
- **Correction to the shorthand above:** the decision is not binary between
  Swarmling and Goon. The full visible ladder is Swarmling → Stinger →
  Arachnomorph → Culicimorph → Locust → Roach → Giant Arachnomorph →
  Chilopodomorph → Wasp → Devourer → Goon. Territory per meat falls at each
  step up that ladder, while Territory per larva/action rises. The correct
  planner must score every affordable row against the live meat bank, larva
  bank, and Expansion-ETA target; Goon was a current endpoint candidate, not
  a universal recommendation.
- **Status correction:** the two preceding rank summaries were inferred from
  displayed purchase costs plus historical per-unit observations; they are
  not a completed live efficiency calculation for the current save. Do not use
  them as a buy rule. The required next experiment is a same-save, one-action
  comparison for every affordable army row, recording exact pre/post meat,
  larvae, army count, territory/sec, and next-Expansion ETA. Only those
  measurements can establish the current best unit or a safe tier threshold.
- **Current live cycle checkpoint:** with `6.20M` larvae and `3.00No` meat,
  Expansion 53 was directly affordable while Hatchery 30 was not. Buying that
  Expansion raised production `21,411→23,552 larvae/s` and the multiplier
  `15,524%→17,087%`; the next Expansion was immediately Territory-blocked.
  This confirms the first action in this state is a completed Expansion, but
  does *not* establish which army unit should fund the following gate.
- **Goal-chain confirmation (current Nexus-4 save):** the Nexus panel states
  that Nexus 5 is the fifth and final Nexus, and that it unlocks all spells
  and abilities. Its visible requirement is `36,000` energy; the current bank
  is `7,399` energy. The only pre-Nexus-5 energy-side units visible are
  Lepidoptera (currently `+39.02%` energy generation, with diminishing returns
  toward `+100%`) and Nightbugs (energy-cap only); neither produces an
  immediate energy bank. The crystal bank is `1,000` and can be converted
  directly. Therefore the current unifying short-horizon target is Nexus 5,
  with Energy as its direct gate and timed Hatchery/Expansion crystal awards as
  the active cross-lane bridge. The post-Nexus-5/Ascension target must be
  measured separately rather than assumed.
- **Nexus-5 timing decision (current save):** an external mathematical
  reference for the unmutated 4-Nexus-to-5-Nexus case gives an optimum of about
  `572` Lepidoptera when the sole objective is the earliest Nexus 5. The live
  save already has `640`, so no additional Lepidoptera should be bought for
  that narrow objective; Nightbugs raise only cap and are likewise excluded.
  This is a reference-backed timing hypothesis, not a replacement for a
  current-version branch replay.
- The live bank held `1,000` crystals; converting them changed Energy to
  `8,496` and left zero crystals. A bounded `×320` Goon batch then made
  Expansion 54 buyable while the next crystal award still had `4:34` remaining.
  The correct timed action is to preserve that ready Expansion until the
  cooldown expires, then buy it to obtain the `500`-crystal/energy bridge.
- **Meat-chain comparison at Expansion 55:** direct Drone and Queen batches
  were negligible relative to their live stocks (`17.6Sp` Drones and `6.45Qi`
  Queens), while Faster Queens would consume `5.75Qi` of `6.45Qi` Queens and
  immediately reduce production. Nest/Faster-Nest steps were likewise either
  small relative to the `2.93T` Nest bank or unavailable. A controlled
  `2.30M` Greater Queen hatch changed the live bank `702.373K→3.16988M` and
  Nest production `11.2379M/s→50.7181M/s` (about `4.51×`). In this exact state
  Greater Queens are the selected Meat-chain investment: their cost is cheap
  relative to Meat/Nest banks and their parent-production increase is material.
  This improves Meat only through the Nest→Queen→Drone lag, so it is a
  compounding/preparation action, not an instant Territory or Nexus-energy
  action.
- **Greater-Queen unlock cycle (same live run):** with `3.17M` GQ, ten Hives
  cost `1.00M` GQ and unlocked Twin Greater Queens II; the upgrade consumed
  the Hives but changed manual GQ batches `×2→×4`. A GQ ramp to `167.566M`
  raised Nest output to `2.68105B/s`; Faster Greater Queens III then spent
  `29.2M` GQ, leaving `138.291M`, doubled each GQ from `16→32` Nests/s, and
  raised output to `4.42532B/s`. Building 100 Hives cost a further `10M` GQ
  and unlocked Twin Greater Queens III, changing manual batches `×4→×8`.
  This is the intended bounded unlock pattern: build only the prerequisite
  Hives, spend them on the Twin, then return to the parent/territory cycle.
  The next Faster GQ costs `19.4B` GQ, so it is not a near-term target.
- **Twin GQ IV threshold:** with `128.295M` GQ and `4.89M` larvae, a
  `×44.5M` GQ batch raised the bank to `175.612M`, enough to retain a useful
  GQ bank after the `100M` GQ prerequisite for 1,000 Hives. Those Hives were
  spent on Twin Greater Queens IV; the bank settled at `75.6442M` GQ and
  manual hatching changed `×8→×16`. This is a successful reserve-aware unlock
  test. The next Faster GQ (`19.4B`) and next Twin prerequisite are both too
  distant to chase immediately, so the cycle returns to Territory/Expansion
  and crystal timing.
- **Crystal/territory return:** Expansion 56 was purchased at a crystal-ready
  window and its 500 crystals converted immediately, moving Energy to
  `10,723 / 36,000`. Expansion 57 then required `62.1Sx` Territory, with a
  measured ETA `30:45` versus the fresh `29:25` crystal cooldown. A bounded
  `×2,400` Goon batch was used to bank Territory; the remaining interval was
  used for a bounded `×43.6M` GQ batch, raising GQ
  `75.6442M→122.694M` and Nest production `2.42061B/s→3.92622B/s` while
  preserving millions of larvae. This is the intended concurrent cycle:
  time the Expansion for crystals, bridge Territory toward the next one, and
  use the non-energy interval to strengthen a currently productive parent.
- **Mid-tier army correction (Expansion 57):** with the next Expansion at
  `62.1Sx` Territory, the Goon-only plan projected `29:15`, later than the
  crystal cooldown. The live Devourer row, previously zero, offered
  `×69,440` for the available Meat and `1` larva per pre-twin hatch. Buying it
  changed the Expansion ETA to `24:21`, safely before the `27:12` crystal
  window, and raised achievement points `450→460`; larva production rose to
  `42,767/s`. This directly confirms the current best territory bridge is not
  necessarily Goon: when Meat is the tight resource and larva is available,
  Devourer can be the efficient middle-tier ETA action. During the remaining
  interval, a bounded GQ batch raised GQ `122.694M→178.484M` and Nest output
  `3.92622B/s→5.71150B/s`.
- **Twin re-evaluation after GQ IV:** Twin Nests VIII became buyable for
  `10.0M` GQ, but it changes manual Nest construction only. At `5.7B` passive
  Nests/s and only tens of millions of larvae, the manual batches are too small
  to materially shorten the next Faster-Nest gate; defer it. Twin Queens XIII
  is likewise manual-only, and Faster Queens VII would spend `5.75Qi` of a
  roughly `6.8Qi` Queen bank, making post-spend drone output lower despite the
  multiplier. Therefore neither is a current buy. Twin GQ IV remains the last
  positive unlock; the next GQ Twin/Faster and Hive-Queen thresholds are too
  distant. Current Expansion 57 ETA is `19:40`, ahead of the `22:31` crystal
  cooldown, so the correct action is to preserve the ready Territory path and
  avoid filler spending.
- **Post-Expansion-56 GQ allocation:** with Expansion ETA `18:17` already
  ahead of the crystal cooldown `21:09`, a bounded `×101M` GQ batch was chosen
  over all-in spending. It raised GQ `178.484M→281.346M` and Nest output
  `5.71150B/s→9.00308B/s` while retaining roughly `19M` larvae for territory
  correction. Twin GQ V needs `10,000` Hives (a `1B` GQ prerequisite) and
  Faster GQ IV needs `19.4B` GQ, so neither is close enough to override the
  current Territory/crystal loop.
- **Nexus 5 fast-forward test (2026-07-23):** a user-authorized artificial
  save was imported through the game's own Options import field to move past
  the repeatedly tested early crystal loop. The Nexus 5 purchase is a
  three-resource gate: `36,000` Energy, `3.33Sp` Meat, and `3.33B` larvae.
  Energy alone is therefore not a valid readiness signal. After the purchase,
  the live UI confirmed `nexus 5`, exposed the Bat unit, and awarded `power
  overwhelming`; all spells and abilities are unlocked. The resulting
  reproducible test state deliberately holds `30,013` Energy. Its enormous
  Meat/Larva balances are test scaffolding only and must not be treated as
  natural-progression strategy evidence.

### Reproducing an authorized fast-forward test state

Use this only for a disposable research save, never to infer natural run
timings. The live production site exposes the import path in **More -> Options
-> Import/export saved data**; editing the text field triggers its import.

1. Copy the complete current export string to an external scratch location
   before changing anything. That exact string is the rollback point; do not
   commit it because it is player state rather than project evidence.
2. Split the string once on `|`. Its format is
   `base64(game-version)|base64("Cheater :(\\n\\n") + LZString-compressed JSON`.
   The codec is bundled in SwarmSim's `scripts/vendor.*.js`; the save/session
   implementation is in `scripts/scripts.*.js` (`_saves` and `_loads`).
3. Decode the JSON, modify only the intended `unittypes` balances, then encode
   the same structure again. For the Nexus 5 test, set enough Energy, Meat,
   and larvae to pass its three-resource gate; build Nexus 5 through the normal
   visible `buy 1` button; then re-import a copy with Energy set to the desired
   post-purchase test amount (here `30000`).
4. Paste the resulting complete string back into the Options field and confirm
   the green import-success state. Navigate to the target unit and verify the
   live badges, rather than trusting the decoded JSON alone.

The 2026-07-23 test ended at Nexus 5 / `30,013` Energy. The slight excess is
normal live energy generation between import and verification.

### Phase rule: Expansion is no longer crystal-timed after Nexus 5

Before Nexus 5, holding a ready Hatchery/Expansion for the next crystal award
can be rational because the fixed `500` crystals bridge the immediate Nexus
Energy gate. After Nexus 5 is built, do not deliberately hold a worthwhile
Expansion for that cooldown. Buy the Expansion when it advances territory,
larva capacity/production, or a concrete unlock; crystals are then a bonus,
not the scheduling target. Re-evaluate only if the available Expansion has no
near-term progression payoff or a later, explicitly chosen Energy objective
creates a stronger competing gate.

### Initial Ascension 1 research (post-Nexus 5)

The first-Ascension target is not simply an Energy bank target. With zero
Ascensions and no Mutagen modifier, the source-verified live formula is
`ascendCost = ceil(5,000,000 / 2^(energySpent / 50,000))`. Energy invested in
currently owned Energy units/upgrades contributes to `energySpent`, lowering
the later cash requirement. The objective is therefore to minimize the time to
the intersection `currentEnergy >= ascendCost(energySpent)`, while also
obtaining meaningful inactive `premutagen` before resetting.

- The purely mathematical minimum of generated Energy for that intersection
  occurs near an Ascension cost of `50,000 / ln(2)`, about `72.1k` Energy:
  roughly `305.8k` Energy must be invested and `72.1k` held, or about `378k`
  generated in total. This is a source-derived planning baseline, not yet a
  complete live-time optimum because production/cap purchases have different
  paybacks.
- Live Nexus-5 inspection: Lepidoptera costs Energy and raises Energy
  generation (at 640 live units: `+39.02%`, diminishing toward `+100%`), so it
  is a genuine candidate only when its production payback beats the current
  Ascension horizon. Nightbugs raise maximum Energy only (200 live units:
  `+83.33%`, diminishing toward `+500%`); buy them only when the cap blocks
  the required bank. Bats raise ability power only (cap `+60%`) and do not
  directly improve Energy generation, so they require a separately measured
  ability payoff and are not default Ascension spending.
- Controlled post-Nexus test: buying Expansion 57 immediately rather than
  waiting for its crystal cooldown raised Hatchery production `44,252/s` to
  `48,677/s` (the expected +10%). Forced Expansion 64 still showed
  `premutagen: 0` in the export state. Thus "every eighth level guarantees
  premutagen" is not a valid inferred rule; its actual seeded-output schedule
  must be read from the live next-output effect before treating an Expansion
  as an Ascension catalyst.

Working optimization loop: take every Expansion with a real larva/territory or
premutagen payoff; use Territory/Meat/Larva to keep those Expansion gates
moving; route Energy spending first to measured Lepidoptera payback, then to
Nightbug capacity only when required; retain the bank needed by the falling
Ascension cost. Ascend only after the live cost is legal and the expected reset
is justified by observed premutagen, not merely because Nexus 5 is complete.

### Calibrated Nexus 5 research save

The unlimited-resource Nexus 5 save is retained only for UI/gate discovery.
For ROI and bottleneck experiments, use the separate **calibrated Nexus 5**
state created on 2026-07-23. It starts from the captured real early-run save
and preserves its Meat chain, Army, Territory, Hatchery/Expansion levels,
Energy units, achievements, and upgrades. The only deliberate overlays are
`nexus: 5`, the matching `nexus5` upgrade, and approximately `30,000` Energy.
No huge Meat/Larva/Territory balance is injected. Its first live verification
showed roughly `14.9No` Meat, `65.4M` larvae, `62.2Sx` Territory, and `30,750`
Energy after normal offline production. Treat it as a calibrated comparison
baseline, not as proof that a natural run reaches Nexus 5 at that exact state.

### Calibrated Nexus 5 live findings: territory bridge and Energy engine (2026-07-23)

- **Devourer is the current territory bridge, not an all-in target.** In the
  calibrated state, Goon could buy only about `2,080` units while Devourer
  could buy about `944k` from the same live resource situation. A bounded
  `25%` Devourer purchase raised the owned count `78,560 -> 325,504` and its
  Territory output `4.16113Qi/s -> 17.2411Qi/s`, while retaining about 75% of
  the Meat bank. An earlier max-buy was explicitly undone through the visible
  Undo control: it was a useful comparison, not an endorsed policy. Current
  rule: compare every visible army unit by buyable output, then use the
  smallest batch that clears the next Expansion/territory bottleneck.
- **Lepidoptera is confirmed as the Energy-production engine.** A visible
  `25%` purchase changed Lepidoptera `640 -> 1,414`, Energy bonus
  `+39.02% -> +58.57%`, and spent `7,730` Energy. The live Nexus-5 baseline
  produced `0.792874 Energy/s` with an Energy cap of `94,166`. This spend both
  increases future ability cadence and counts as Energy spent toward lowering
  the first-Ascension cost. It should therefore be evaluated by production
  payback against the current Energy/Ascension horizon, rather than treated as
  a fixed reserve violation.
- **Abilities can bridge a concrete Expansion gate.** Exact live card values
  in this state: Territory Rush cost `1,600` Energy and granted `298.060Sx`
  Territory; Meat Rush cost `1,600` Energy and granted about `77.7No` Meat.
  After the confirmed Territory Rush, the live resource row showed `317Sx`
  Territory against Expansion 57's `152Sx` Territory cost, making the next
  Expansion immediately legal. The Expansion card also confirmed: each level
  raises Hatchery larva production by 10%, and the ready purchase awards
  `500` crystals. This is an observed manual-play bridge; it does not widen
  the userscript's default ability automation.
- **Energy allocation order for this phase:** take the exact tactical cast
  that converts into an immediate, persistent growth step (such as the
  Territory Rush -> Expansion 57 bridge); buy Lepidoptera when its incremental
  production pays back before the next Energy objective; buy Nightbugs only
  when the Energy cap prevents the needed bank; value Bats only when measured
  ability output makes their power bonus pay back. This keeps Energy from
  being spent only on short-lived resource grants while still avoiding passive
  waiting.

### Calibrated Nexus 5: active Expansion 60--62 round (2026-07-23)

- **Expansion is stronger than the then-available Hatchery.** At Hatchery 30
  and Expansion 58, one Hatchery cost `300No` Meat and changed larva output
  `53,545/s -> 55,272/s` (`+3.22%`); one Expansion cost `372Sx` Territory and
  changed it `55,272/s -> 60,800/s` (`+10%`). Expansion 59 repeated the
  observed `+10%` (`60,800/s -> 66,880/s`) for `913Sx` Territory. Therefore,
  when both are legal and territory is available, Expansion wins this
  calibrated early-Nexus-5 comparison; the expensive next Hatchery is not the
  default sink.
- **Army comparison must use the live purchasable batch, not unit price or
  current owned count.** With about `2.55Dc` Meat and `1.76B` larvae, a
  Devourer cost `567Sp` Meat per larva and produced `52.9676T` Territory/s
  per unit. The visible maximum was `144M` Devourers, or about `7.6Sx/s`.
  The live alternatives were weaker at the same resource cap: Goon was
  Meat-limited (`255Oc`/larva, about `0.75Sx/s` maximum); Wasp could consume
  the larva bank but reached only about `66Z/s`; Chilopodomorph reached about
  `1.48Sx/s`; Giant Arachnomorph, Roach, Locust, Culicimorph, Arachnomorph,
  Stinger, and Swarmling have lower per-unit Territory output than the fully
  affordable low-tier cap. Devourer was therefore the strongest *current*
  territory action, not a permanent ranking.
- **Bounded Devourer plus its Twin upgrade is an effective territory engine.**
  A first visible 25% batch raised Devourers `325,504 -> 36.5479M` and
  Territory production `17.2411Qi/s -> 1.93585Sx/s`, retaining roughly 75% of
  Meat. Twin Devourers 5 -> 6 cost `3.12Qa` Meat and `312M` larvae, changing
  future hatches `x32 -> x64`. A second bounded batch then reached `91.1013M`
  Devourers and `4.82542Sx/s`. This is the right place for a bounded
  reserve-aware batch because it directly shortens the next Expansion gate.
- **The Meat chain needs focused upgrades, not manual Drone purchases.**
  A 25% Greater-Queen batch (`281.346M -> 6.13197B`) raised Nest production
  `9.00308B/s -> 196.223B/s`. Twin Nests 7 -> 10 changed future Nest batches
  `x128 -> x1,024` while consuming about `1.11B` Greater Queens in total.
  Faster Nests 4 -> 5 spent `12.9T` Nests (about 3--4% of the live stock) and
  doubled Queen output `16.1126Qi/s -> 31.1100Qi/s`. Faster Queens 6 -> 7
  spent `5.75Qi` Queens (about 1.9%) and doubled Drone output
  `38.5011Sx/s -> 75.6273Sx/s`. Conversely Faster Drones required `1.70Oc`
  Drones while only `514Sp` existed, so it was correctly unavailable; manual
  Drone buying was not the next action.
- **Swarmwarp is a powerful manual active bridge once territory production is
  high.** At `4.82542Sx/s`, a visible `2,000`-Energy Swarmwarp gave exactly
  15 minutes of production and changed Territory `1.18Sp -> 5.61Sp`; a second
  changed it `3.45Sp -> 7.95Sp`. That funded Expansion 61 and 62, taking larva
  output `69,186/s -> 76,104/s -> 83,715/s`, while Energy remained `43.7k`.
  This is documented as a manual-play research finding only; it must not be
  treated as authorization to alter the userscript's default ability safety
  gates.

### Calibrated Nexus 5: Clone, Cocoon, and Mirrors ability study (2026-07-23)

- **Cocoons are the Clone Larvae buffer, not a separate competing goal.** The
  live Cocoon card explicitly states: “Clone Larvae clones cocoons as if they
  were normal larvae” and advises cocooning larvae intended for cloning. A
  controlled conversion of `629.147M` active larvae into cocoons changed the
  active bank `2.51B -> 1.88B` but left Clone's displayed source/output at
  about `2.518B` (active larvae plus cocoons). A later exact-target cocoon
  action set the protected bank to `3.15000B` cocoons while retaining `1.89B`
  active larvae. Practical rule: preserve the selected Clone seed in cocoons;
  retain only the active-larva working buffer needed by the next purchases.
- **Clone Larvae is an exponential ramp until its live cap, not always the
  first raw-larva cast.** The observed live cap was
  `83,715 larvae/s * 100,000 = 8.37153B`. A `12,000`-Energy cast doubled the
  current clone source `1.25461B -> 2.51270B`; a second doubled it again to
  `5.04138B`. At the initial source, Larva Rush (`201.016M` for `1,600`
  Energy) was marginally better per Energy than Clone; the crossover is about
  `1.51B` cloneable larvae. Above that seed, Clone has higher raw larvae per
  Energy and then compounds until the cap. Therefore the active rule is: build
  and cocoon a seed, use Clone when it is above the measured crossover and the
  resulting larvae have an immediate production/unlock use, then cocoon the
  cast increment to prevent accidental spending.
- **House of Mirrors is the strongest current permanent territory ability.**
  One `2,500`-Energy cast doubled the real army: Devourers
  `91.1013M -> 182.202M`; a second doubled them to `364.405M`. Its effect also
  doubled Territory Rush `34.9169Sx -> 69.8339Sx -> 139.667Sx` per cast. This
  makes Mirrors a multiplicative territory-engine purchase, not merely a
  one-shot resource grant. Relative to a `2,000`-Energy Swarmwarp that grants
  15 minutes of current production, a Mirrors cast reaches equivalent
  territory after roughly `18m45s` before accounting for its downstream
  compounding. Use Mirrors first whenever the territory/Expansion horizon is
  longer than that and the Energy reserve permits it; use Swarmwarp after it
  when a concrete Expansion is immediately reachable.
- **Observed active sequence:** two Mirrors casts, then one Swarmwarp, changed
  Territory `5.86Sp -> 23.3Sp` for `4,500` Energy and funded Expansion 63.
  That Expansion raised larva output `83,715/s -> 92,086/s` while the protected
  Clone bank remained intact. This is manual-play evidence only and does not
  change the userscript's default ability safety configuration.
- **Ability choices are dynamic; do not blindly wait for Clone.** Larva Rush
  rose with larva production from `201.016M` to `221.108M` per `1,600` Energy,
  while Clone's live cap rose from `8.37153B` to `9.20868B` as production rose
  from `83,715/s` to `92,086/s`. Energy below `12,000` is therefore not an
  automatic no-spend state: take a cheaper ability when it funds an immediate
  persistent step whose payoff exceeds the delayed Clone, then rebuild the
  protected cocoon seed. At `11.6k` Energy, a `2,000`-Energy Swarmwarp funded
  Expansion 64 (`94,964/s -> 104,461/s` larvae); that was the better local
  step than passive waiting, even though it temporarily delayed Clone.
- **Crystals are a precise bridge, not an automatic spend or a hoard-only
  resource.** Live Crystal conversion is `1 crystal -> 1 Energy`, and each
  conversion also permanently raises max Energy by that amount. We converted
  exactly `450` of `500` crystals to close the live gap from `11,574` to
  `12,040` Energy, retained `50` crystals, and immediately cast Clone. The
  cast raised the cloneable total to `10.5602B`; the live card then displayed
  its fixed cap-output `10.4461B`. Its new larva was cocooned to a protected
  `8.44000B` bank while leaving about `2.13B` active larvae. Rule: preserve
  crystals by default because they survive Ascension, but thaw the exact
  smallest amount when it completes a presently best, verified action; never
  thaw merely because crystals exist.
- **Faster upgrades that consume their own producer must be evaluated as an
  active package: sacrifice plus immediate rebuild.** After bounded
  Greater-Queen batches raised the stock `5.02B -> 13.72B -> 20.25B`, Nest
  output reached `648.1B/s`. Faster Greater Queens cost `19.4B` and exactly
  doubled each remaining Queen from `32 -> 64` Nests/s; the empty intermediate
  state was only `757.485M` Queens and `48.4790B/s`, so it is misleading to
  judge the upgrade at that point alone. The available active larvae then
  rebuilt `19.9B` Greater Queens immediately, reaching `20.7192B` Queens and
  `1.32603T` Nests/s -- more than double the pre-upgrade rate. The `8.44B`
  cocoon reserve stayed intact while active larvae fell to `8,315`. Active
  rule: buy Faster when the immediate rebuild batch restores enough producer
  count to beat the old rate and a protected clone seed remains; do not require
  the raw producer stock to clear the passive-only `2C` threshold.
- **Twin Greater Queens VI is an active unlock, not a passive Hive buff
  (live test, 2026-07-23).** From `19.72B` Greater Queens and `18.3B` active
  larvae, an exact `100,000`-Hive build cost `10.0B` Greater Queens, `59.0T`
  Meat, and `100K` larvae. The temporary Hive bank produced `500K` Greater
  Queens/s, but Twin Greater Queens VI immediately consumed all `100K` Hives.
  It changed manual Greater-Queen hatching `x32 -> x64`, raised the maximum
  live hatch batch `585.959B -> 1.17218T`, and did **not** affect Hive
  production (as the panel states). An exact `10.0B` GQ rebuild then cost only
  `156M` active larvae, `1.56T` Nests, and `1.02Qa` Meat; it restored the GQ
  bank to `19.7263B` and Nest output to `1.26248T/s`. The next Twin threshold
  is `1.00M` Hives. Active rule: buy this Twin only when the GQ sacrifice can
  be rebuilt immediately from an explicitly protected larva/Nest bank; score
  its value as doubled manual GQ throughput and access to the next tier, never
  as a multiplier to passive Hive output.
- **Twin Greater Queens VII repeats the active-rebuild pattern at the next
  scale (live test, 2026-07-23).** Starting from `19.7263B` GQ and `18.2B`
  active larvae, `@100B` GQ cost `8.22Qa` Meat, `12.5T` Nests, and `1.25B`
  larvae. Building `1.00M` Hives then cost `100B` GQ, `590T` Meat, and `1.00M`
  larvae. While that Hive bank existed it produced `5.00M` GQ/s; Twin VII
  consumed it, changed manual hatching `x64 -> x128`, and set the next gate to
  `10.0M` Hives. The short passive interval left `87.55M` GQ. An exact return
  to `100B` GQ cost `5.12Qa` Meat, `7.80T` Nests, and `780M` larvae, restoring
  `6.40000T` Nests/s with `16.2B` active larvae still available. This confirms
  the invariant across the tested 100K- and 1M-Hive thresholds: evaluate the
  full Hatch GQ -> spend Hives -> Twin -> rebuild GQ package and preserve the
  active-larva reserve; do not score the short-lived passive Hive income as
  the upgrade's payoff.
- **Parallel Territory and Twin GQ VIII test (live, 2026-07-23):** A later
  live state had `21.37B` active larvae, `8,669` Energy, `100B` GQ, and
  `7.74No` Territory. The seven-Mirror Army made each Territory Rush
  `9.64327No`; Mirror VII plus two Rushes cost `5,700` Energy and enabled
  Expansion 79 (`22.6No`), raising larva production `530.097k/s ->
  583.107k/s`. That action did not consume the active larva bank. The same
  run then used `@1T` GQ (`900B` new GQ: `7.03B` larvae), `@10M` Hives
  (`1.00T` GQ and `10M` larvae), and Twin GQ VIII. The Twin changed manual
  hatching `x128 -> x256`; the post-spend GQ bank was `298.4M`. Rebuilding to
  `1.00T` GQ cost `3.90B` larvae and restored `64.0000T` Nests/s, leaving
  `10.4B` active larvae. Result: in this resource-rich state Expansion 79
  and Twin VIII are *complementary*, not competing bottlenecks. Take the
  funded Territory/Energy bridge first when it consumes no required larva
  reserve, then execute the bounded GQ/Hive/Twin package. The next Twin gate
  is `100M` Hives; Faster GQ IV remains `12.9T` GQ and is still the distant
  target.
- **Clone and Twin GQ IX boundary (live, 2026-07-23):** An exact Crystal
  bridge converted the remaining `1,601` crystals, permanently raising maximum
  Energy `96,065 -> 97,666`. At `12,003` Energy, Clone Larvae produced
  `23.7352B` larvae and raised the active bank `15.2B -> 39.0B` while the
  protected `8.44B` cocoon reserve remained untouched. This makes the target
  `@10T` GQ individually affordable at Twin GQ VIII: the live preview costs
  `9.00T` additional GQ for `35.1B` larvae, `351T` Nests, and `230Qa` Meat.
  But it would leave only about `3.9B` active larvae before the `100M`-Hive
  spend, whereas rebuilding the same GQ stock after Twin IX at the expected
  next `x512` batch would require about `19.5B` more larvae. Therefore Clone
  is a necessary but insufficient funding source for the **full** Twin IX
  package in this state. Do not take Twin IX merely because its build-side
  cost is affordable; defer it until Clone/larva production can fund both the
  GQ build and a post-offer reconstruction to the chosen production floor.
  Faster GQ IV is even further beyond the same larva boundary. The active
  bottleneck returns to Territory/Hatchery/Clone growth, not Meat or Nests.
- **Hatchery 35 and first Hive Queen (live, 2026-07-23):** With the next
  Twin-IX package larva-gated and current Army batches immaterial against the
  `1.13Oc/s` Territory rate, Hatchery 35 was bought for `3.00UDc` Meat. It
  raised larvae `583.107k/s -> 599.767k/s`; the Crystal award remained on its
  30-minute cooldown. The next Meat tier was then inspected directly. One
  Hive Queen costs **1.00M Hives** (not 1,000), `53.1B` Meat, and one larva;
  one million Hives cost `100B` GQ, `590T` Meat, and `1.00M` larvae. From
  `1.00T` GQ, the run built the exact Hive gate and hatched the first Queen,
  leaving `900B` GQ and therefore retaining `57.6T` Nest/s of the prior
  `64T/s` rate. The Queen produces `6` Hives/s and unlocked Hive Empress.
  First Hive Empress costs `10.0M` Hive Queens and `4.78T` Meat, producing
  `7` Hive Queens/s. Consequence: first Hive Queen is a valid tier-unlock
  package at this GQ reserve; additional Queens require a separate payback
  test rather than a blind manual ramp, because their 1M-Hive input is costly
  and the Empress gate remains long-horizon.
- **Energy-only import simulation is capped by the live Energy maximum.** In a
  user-authorized waiting simulation, the export JSON was changed only at
  `unittypes.energy` (to `100,000`); the game imported it as `94,616 Energy
  (100%)`, its current maximum. The normal elapsed-production reconciliation
  still ran during import, so resource displays can advance naturally, but no
  unit, upgrade, territory, larva, or Meat balance was deliberately edited.
  For reproducible wait simulations, keep the pre-import export as the rollback
  point and treat the resulting cap, not the requested number, as the usable
  Energy bank.
- **Energy-boosted active-play branch (2026-07-23; strategy mechanics, not
  natural-run timing):** starting at the imported Energy cap of `94,616`, a
  controlled live branch advanced Expansion `64 -> 70`. Larva production rose
  from `115.486k/s -> 225.125k/s`. The branch is valid for relative action
  comparisons, but the Energy-rich starting position makes its wall-clock time
  invalid as natural progression evidence.
  - **House of Mirrors is a repeatable permanent multiplier in this state.**
    Each observed `2,500`-Energy cast doubled the live Army immediately: the
    first moved Devourers `498.617M -> 997.235M` and Territory production
    `26.4106Sx/s -> 52.8212Sx/s`; a second gave `1.99447B` Devourers and
    `105.642Sx/s`. No one-shot or cooldown block was observed when issuing
    further single casts. For an Expansion gate, use the smallest number of
    casts that makes a single Swarmwarp sufficient:
    `ceil(log2(territoryDeficit / (900 * currentArmyTerritoryRate)))`, clamped
    at zero. Then buy the Expansion; do not replace this with hundreds of
    Territory Rushes.
  - **House of Mirrors + Swarmwarp is the territory bridge.** Swarmwarp costs
    `2,000` Energy and grants exactly 15 minutes of current non-Energy
    production. After one Mirror at `52.8212Sx/s`, it supplied enough
    Territory for Expansion 65; at later gates the same minimum-Mirrors rule
    funded Expansions 66--70. This is a target-specific spend, not a reason to
    cast Mirrors indiscriminately.
  - **Lepidoptera is a long-horizon Energy investment.** Buying `2,066`
    Lepidoptera cost about `20.66k` Energy, changed its bonus
    `58.57% -> 77.68%`, and changed Nexus generation
    `0.792874 -> 0.888392 Energy/s` (+12.05%). Its incremental Energy-only
    payback is about 60 hours. Prefer it for the Ascension horizon rather than
    when an immediate Expansion or ability bridge is available. Nightbugs did
    not help this branch because existing max Energy already exceeded the
    needed tactical bank.
  - **Clone is the larva-to-twin bridge.** One `12,000`-Energy cast raised
    cloneable larvae+cocoons `8.61141B -> 17.2387B`; at later production it
    supplied `14.5631B` new larvae from a `14.5631B` source. It made Twin
    Devourers VII (`15.6B` larvae) and Twin Wasps VII (`15.6B` larvae)
    buyable while retaining the protected `8.44B` cocoon bank. Keep cocoons
    intact; spend active larvae only after naming the concrete Twin or unit
    batch they unlock.
  - **Twin upgrades are useful only with a funded manual batch behind them.**
    Twin Devourers VII changed `x64 -> x128` and doubled the affordable manual
    Devourer batch `608M -> 1.223B`. Twin Wasps VI cost only `312M` larvae and
    changed `x32 -> x64`, while VII changed `x64 -> x128`; the latter changed
    the live Wasp batch `305B -> 615B`. Take these when Meat and active larvae
    can immediately exercise the larger batch; otherwise defer them.
  - **Army selection must evaluate every current unit.** At `5.45Dc` Meat and
    `10.6B` active larvae, max Wasp added about `162.9Sx/s`, versus about
    `65.2Sx/s` from max Devourer. Wasp was therefore the best Meat-limited
    purchase; after Twin Wasps VII, a max Wasp purchase raised its live total
    `328.534Sx/s -> 1.05827Sp/s`. This result is state-dependent: recompute
    marginal territory per current affordable batch after each major spend.
  - **Meat Rush can be a precise Hatchery bridge.** At this branch point one
    cast cost `1,600` Energy and gave `16.8775Dc` Meat. Two casts, not the
    max button, were enough to cross Hatchery 33's `30Dc` cost; the Hatchery
    raised larva production `198.639k/s -> 204.659k/s` (+3.03%). That is
    weaker than a ready Expansion (+10%) but correct while territory is the
    distant gate and a small Meat deficit is the active blocker.
  - **Crystal observation:** an Expansion credit raised crystals `50 -> 550`
    (+500). Preserve them by default; the credit is a bonus in this post-Nexus
    phase rather than a reason to delay a profitable Expansion.
- **Bat ability-scaling test (2026-07-23; same energy-boosted branch):** Bats
  scale resource abilities and Swarmwarp, but not House of Mirrors. At zero
  Bats, Larva Rush was `540.400M`, Territory Rush `64.0972Oc`, Meat Rush
  `23.6610Dc`, and Swarmwarp `15:00`. Buying `236` Bats for `23,600` Energy
  gave `+11.46%`: Larva Rush `602.310M`, Territory Rush `71.4403Oc`, Meat
  Rush `26.4575Dc`, and Swarmwarp `16:43`. It also raised the Clone cap
  `22.5125B -> 25.0916B`, but did not increase the current Clone output because
  its `8.97B` source was below either cap. House's displayed army copy stayed
  byte-for-byte unchanged. A second `177` Bats (`413` total; `17,700` Energy)
  raised ability power only to about `+17.54%` (Larva Rush `635.171M`,
  Swarmwarp `17:37`): a `+6.08`-point marginal gain. Rule: prioritize the
  minimum House-of-Mirrors bridge for an Expansion first; buy Bats later only
  when many Rushes/Warps are planned or when the protected Clone source is
  actually cap-limited. Do not buy Bats merely to improve House of Mirrors.
- **First-Ascension gate and Energy calibration (2026-07-23; artificial UI
  branch):** Ascension has two independent requirements. First, at least one
  `premutagen` must exist; it is produced by the random Hatchery/Expansion
  effects, and without it the Mutagen/Ascension tab is hidden even at Nexus 5
  with sufficient Energy. Second, held Energy must meet the falling live
  Ascension cost. A source-derived optimum of about `72.1k` cost was verified
  against the live panel: a branch with `305.755k` reported Energy spent showed
  `72,135` Ascension cost and `73,692` held Energy, making the Ascend button
  legal. The test branch injected exactly one `premutagen` solely to reveal and
  inspect this UI; it was not ascended and must not be read as a natural drop.
  The current spend accounting includes historical Nexus Energy costs in
  addition to owned Bats, Lepidoptera, and Nightbugs. Therefore derive
  `energySpent` from the live Ascension panel (or the complete cost graph), not
  just from current Energy-unit counts. For an actual first Ascension: preserve
  a real premutagen, target the live approximately-`72k` cost/held-Energy
  intersection, and do not spend the bank below that gate on a late ability.
- **Real premutagen sampling (2026-07-23; natural Nexus-5 branch):** After
  restoring the non-injected save (no `premutagen`), four consecutive real
  Expansion purchases (`70 -> 74`) and one real Hatchery purchase (`33 -> 34`)
  produced no premutagen: the Mutagen tab stayed unavailable. The first two
  territory gates were bridged with one `1,600`-Energy Territory Rush each;
  the Hatchery's `300Dc` Meat gap was bridged by exactly seven `1,600`-Energy
  Meat Rush casts, then bought normally; four further Territory Rush casts
  bridged Expansion 74. This is a five-event negative sample,
  not a probability estimate or a deterministic-schedule claim. Planner
  consequence: retain a real premutagen once it appears, but do not delay a
  profitable Hatchery/Expansion merely because the immediately preceding
  purchases did not create one.
- **Natural-branch Mirror bridge (2026-07-23):** At Expansion 74 the live
  Territory Rush output was `75.3380Oc` for `1,600` Energy, while the next
  Expansion cost `628Oc` Territory. One `2,500`-Energy House of Mirrors cast
  doubled the army and immediately doubled that Rush to `150.676Oc`; four
  Rush casts then cleared the gate, rather than eight without the Mirror.
  Expansion 75 raised larva production `339.300k/s -> 373.230k/s`. This is a
  concrete long-horizon example of the Mirror-plus-Rush bridge: the permanent
  army multiplier both reduced the immediate bridge from `12,800` to `6,400`
  Energy and remains useful at later Territory gates.
- **Expansion 77 correction (2026-07-23; same natural branch):** Four total
  Mirrors produced `142Sp/s` passive Territory and made each Territory Rush
  worth `602.704Oc`. The initial projection incorrectly treated the next
  `3.77No` gate as needing an energy injection. In live play, passive
  production accumulated `459Oc` while Energy rose to `4,863`; three Rushes
  then brought Territory to `4.07No`, enough for Expansion 77. The purchase
  raised larva production `410.553k/s -> 451.608k/s` and left Energy near
  zero. Correct rule: calculate the *remaining* gate at action time and count
  passive Territory accumulated alongside Energy before adding another Mirror
  or simulating an Energy wait.
- **Mirror seed sweep, first measured candidates (2026-07-23; post-Expansion
  77 branch):** The branch started around `142Sp/s` total Army Territory with
  four Mirrors, about `148Dc` Meat and `15.9B` active larvae. A bounded Wasp
  batch of `511B` consumed about `4Dc` Meat and `4B` active larvae, while its
  output rose only `33.8646Sp/s -> 34.4672Sp/s` (`+0.6026Sp/s`, roughly
  `+0.4%` of total Army rate). It is therefore not a worthwhile pre-Mirror
  seed at this state despite being the largest absolute visible unit batch.
  Devourer's comparable `8.4B` batch would add only about `0.45Sp/s` and its
  visible maximum consumes `100%` of the Meat bank (though only about 2% of
  larvae), so it fails the bounded-reserve test before execution. Result:
  reject both as current Mirror seeds; the broad-army hypothesis remains open
  for units/batches with a materially better constrained rate gain. This is a
  state-scoped two-candidate measurement, not a ranking of all army units.
- **Twin Goons correction (2026-07-23; same branch):** Twin Goons V -> VI
  cost `3.12Qa` Meat and `312M` larvae, changed hatching `x32 -> x64`, and
  doubled the visible Meat-limited maximum batch `20.6966M -> 41.4997M`.
  Therefore Twin upgrades can improve a unit's effective Meat-limited batch;
  they are not merely larva-saving upgrades. The next level costs `15.6B`
  larvae and was deliberately not bought because it would consume essentially
  the whole active-larva bank. Correct rule: test each affordable Twin against
  the post-upgrade maximum batch and keep the active-larva working reserve;
  do not reject a Twin solely because the pre-upgrade batch was Meat-limited.
- **Mirror 5 versus low-tier seed batches (2026-07-23):** After the bounded
  Wasp and Twin-family checks, one `2,500`-Energy fifth Mirror doubled the
  live full army `142Sp/s -> 284Sp/s` and doubled every displayed unit family
  (for example Devourers `2.04T -> 4.08T`, Wasps `28.7T -> 57.5T`, Roaches
  `66.6T -> 133T`). This dwarfs the tested Wasp seed's `+0.6026Sp/s` gain.
  Current rule for this branch: take the affordable Mirror before further
  low-tier seed batches unless a candidate batch has a measured material
  fraction of the current total army rate or unlocks a funded Twin/batch.
- **Mirror 6 versus current Devourer spending (2026-07-23):** At `1.75No`
  Territory toward the `9.24No` Expansion-78 gate, the Army produced `284Sp/s`.
  Devourers alone supplied `216Sp/s`, but their `x128` hatch cost `567Sp` Meat
  per hatch and the displayed all-in `84.6B`-Devourer buy would consume the
  entire Meat bank for only roughly a two-percent Army-rate increase. A sixth
  `2,500`-Energy House of Mirrors instead doubled every family, including
  Devourers `4.08467T -> 8.16935T`, and the total rate `284Sp/s -> 569Sp/s`.
  It left `1,703` Energy, just short of Swarmwarp's `2,000` cost. In this
  state, take the permanent Mirror before a Meat-exhausting Devourer batch;
  then use the next Swarmwarp/Rush bridge rather than passively waiting for the
  Expansion gate.
- **Expansion-78 Crystal/Rush bridge (2026-07-23):** Immediately after Mirror
  VI, one `1,600`-Energy Territory Rush moved Territory `1.75No -> 6.59No`.
  With `151` Energy remaining, an exact `1,449`-Crystal conversion (from
  `2,050` crystals) raised Energy to `1,632` and permanently raised max Energy
  `94,616 -> 96,065`. The second Rush reached `11.4No`; Expansion 78 then
  spent `9.24No`, leaving `2.22No` and raising larva production
  `451.608k/s -> 496.769k/s`. The panel showed the next Crystal award only
  **after 29:59**, so this Expansion did not immediately return its advertised
  `500` crystals. Rule: a Crystal bridge may be justified when it immediately
  completes an Expansion with a material larva gain, but account for the live
  Crystal cooldown rather than assuming every Hatchery/Expansion refunds 500.

- **Twin Hives I--III active reconstruction (2026-07-23; live Nexus-5
  branch):** Hive Queens cost `1.00M` Hives, `53.1B` Meat, and one larva each,
  produce exactly `6` Hives/s each, and do not receive a production multiplier
  from Twin Hives. Starting with `1T` Greater Queens, the branch built and
  restored Hive Queens to a `900B` Greater-Queen floor after each hatch. Twin
  Hives I cost one Hive Queen and changed manual Hive construction `x1 -> x2`;
  Twin II cost ten and changed it `x2 -> x4`; Twin III cost one hundred and
  changed it `x4 -> x8`. Rebuilding the one hundred Queens at `x4` left
  `28.1B` active larvae and yielded `600` Hives/s before Twin III consumed the
  Queens. The next Twin costs `1,000` Hive Queens. At `x4`, an `@1,000,000`
  Hive target was observed around `145T` Meat, `24.6B` Greater Queens, and
  `246K` larvae (small changes are expected as the live Hive stock ticks).
  Planner rule: value Twin Hives as an active Hive-construction multiplier,
  not as a passive Hive-Queen multiplier; take a level only when the required
  Queens and selected Greater-Queen floor can be actively reconstructed within
  the larva working reserve. This confirms the same reconstruction pattern as
  lower Meat-chain Twins, but does not establish that the `1,000`-Queen tier is
  currently worthwhile.
- **Faster Hives I and Faster Hive Queens I (2026-07-23; same live
  branch):** Faster Hives I consumed `66` Hives and doubled the visible
  Greater-Queen output from `5 -> 10` per Hive/s, or `49,315 -> 97,970`
  GQ/s at the observed `9,863`-Hive state. Its next level requires `43,956`
  Hives. Separately, `66` Hive Queens at Twin Hives III (`x8`) produced
  `396` Hives/s. Faster Hive Queens I consumed those Queens and changed the
  per-Queen rate `6 -> 12` Hives/s; its next level requires `43,956` Hive
  Queens. The active branch moved from about `28.6B` to `25.5B` displayed
  larvae while building the 66-Queen package (this is a net live observation,
  not an exact spend because larvae accrued during the loop). Both first
  Faster levels are real rate doublers; neither next level is an automatic
  purchase. Planner rule: test the first affordable Faster level as a complete
  sacrifice/rebuild package, then apply the same reserve/payback gate to its
  sharply larger next tier.
- **Whole-army read-only sweep (2026-07-23; same live branch):** The live
  roster contained Goon, Devourer, Wasp, Chilopodomorph, Giant Arachnomorph,
  Roach, Locust, Culicimorph, Arachnomorph, Stinger, and Swarmling, with total
  Army production about `1.13950Oc/s`. At their displayed all-in limits,
  Devourer (`275.720B` units, `8%` active larvae) was the only candidate near
  a one-percent whole-army increment; Wasp and Goon were smaller, while every
  lower family was orders of magnitude below the whole-army rate despite often
  sharing the larva-limited `917B` batch. This is a screening result, not a
  purchase: use a material-fraction threshold plus an unlock check, and do not
  select a low-tier unit merely because its Meat cost is lower.
- **Executed Devourer package and Crystal threshold bridge (2026-07-23;
  same live branch):** A displayed maximum package of about `316B` Devourers
  was executed from `16.3387T` owned. It spent essentially the Meat bank and
  part of the active larva bank, but live whole-army Territory production moved
  only about `865Sp/s -> 882Sp/s` (roughly two percent). That makes this a
  valid measured rejection for ordinary filler spending: even the best current
  Army batch needs a named Expansion or Twin payoff before it may exhaust Meat.
  Separately, converting all `500` available Crystals bridged live Energy from
  about `2.3k` to `2.8k` and permanently raised maximum Energy; it crosses the
  `2.5k` Mirror boundary but remains far below Clone Larvae's `12k` boundary.
  Do not present Clone allocation as measured from this state. It requires a
  separate `>=12k`-Energy snapshot (or an explicitly labelled injected-Energy
  mechanics branch).
- **Energy-injected mechanics branch (2026-07-23):** With explicit user
  authorization, a copy of the live save was decoded and re-imported through
  the normal Options field with only `unittypes.energy` changed from about
  `2,801` to `30,000`; the live badge then showed about `30,217` Energy from
  normal tick gain. The export codec was verified as
  `base64(version)|base64("Cheater :(\\n\\n") + LZString-compressed JSON`.
  This is a disposable ability-threshold branch: it preserves the copied
  Meat/Larva/Territory/Army values, but it is not evidence for natural Energy
  timing, Crystal income, or an Ascension route. Keep any resulting ability
  fact explicitly scoped to this injected branch unless reproduced naturally.

## Related books

- `BOOK-01-base-mechanics-and-claims.md`: historical base-mechanics claims.
- `BOOK-04-strategy-intelligence-findings.md`: Strategy Audit conclusions.
- `BOOK-03-verification-history-and-artifacts.md`: verification/evidence map.
