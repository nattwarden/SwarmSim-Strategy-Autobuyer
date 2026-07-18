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
- SHA-256: `d40d8f3d1af165d0d345aef394233bc1ee3050bfb626ee5ea393f6491b7f08a5`
- source: manual, script-free play on production Swarm Simulator `v1.1.17`
- scope: early active-play branch immediately after Faster Greater Queens I,
  with 40 Greater Queens rebuilt at 8 Nests/s, Twin Nests III (`x8`), Faster
  Queens III, Faster Drones IV, Hatchery 15, and Expansion 24
- intended use: import before each bounded A/B test of the Faster Greater
  Queens reconstruction path, the next Greater-Queen investment, or the
  Locust-versus-Roach Territory choice

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

The current research question is the active-chain ordering: compare a direct
producer multiplier (Faster Drones), parent multiplier (Faster Queens/Nests),
Territory bridge, Expansion, and Accomplished Ancestry from one time-controlled
branch. Preserve the 1.5x/2x reserve test and record a recommendation only
after at least two identical-start branches agree on metric and horizon.

## Related books

- `BOOK-01-base-mechanics-and-claims.md`: historical base-mechanics claims.
- `BOOK-04-strategy-intelligence-findings.md`: Strategy Audit conclusions.
- `BOOK-03-verification-history-and-artifacts.md`: verification/evidence map.
