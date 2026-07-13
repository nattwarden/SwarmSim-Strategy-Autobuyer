# Book 05 — Community Strategy Claims

> Primary sources (raw texts remain in `reference/`):
>
> - `REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt` — Community strategy guide
> - `REFERENCE_SwarmSim_ichbinsisyphos_2015.txt` — Mathematical analysis paper
> - `REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt` — Reddit discussion, already pre-annotated 2026-07-09
>
> Current authoritative game model: `SWARMSIM_GAME_MODEL.md`
>
> Confirmed findings from our own live observations: see BOOK-01 and BOOK-02.

---

## Purpose

This book classifies testable claims from 2015 community strategy guides against our
own live observations. It answers the question: *what from the old guides is confirmed,
what is wrong, and what has never been checked?*

Claims relevant to our current SA0 scope (pre-Nexus through first Expansion) are
marked **SA0-RELEVANT**.

---

## Classification key

| Label | Meaning |
|-------|---------|
| **CONFIRMED** | Verified by our live logs, bot behavior, or book findings |
| **PARTIALLY CONFIRMED** | Directionally validated; exact thresholds not verified |
| **UNCONFIRMED** | Plausible, not yet tested in our context |
| **BOT BOUNDARY** | Correct human strategy we deliberately do not automate (safety default) |
| **OUTDATED / WRONG** | Directly contradicted by our findings or game model |
| **OUT OF SCOPE** | Correct claim, but pertains to late-game content we have not built |

---

## Section 1 — Food chain and twinning (featherwinglove + reddit)

### C-01 Twin prep: build up prime-1 before twinning **SA0-RELEVANT**

> "Before you produce the prime units you need for twinning, build up enough larva or
> prime-1 units so that immediately after twinning you're able to build half of the
> prime units you just spent."

**Status: CONFIRMED**

Evidence:
- `BOOK-01` — Twin upgrades are hatch-conversion tools, not passive multipliers
- `docs/live-logs/2026-07-09-clicked-mechanics-progression.md` — second Twin Drones test: −40 passive drones/sec vs +4.4 larvae-based gain; Twin is costly without recovery buffer
- Release notes 0.8.7 — Twin Threshold Reachability and Opportunity Cost

Bot implication: Twin prep requires recovery-buffer check, not just buyability. Current bot enforces this.

---

### C-02 Faster upgrade doubles passive production of food stack unit **SA0-RELEVANT**

> "The Faster upgrade doubles the passive production rate of the food stack unit."

**Status: CONFIRMED**

Evidence:
- `BOOK-01` — Faster X upgrades increase total output despite spending part of producer banks
- `docs/live-logs/2026-07-09-clicked-mechanics-progression.md` — Faster behavior verified

Bot implication: Faster upgrades score well in planner when payback is favorable.

---

### C-03 Upper meat-chain units can be traps **SA0-RELEVANT**

> "It may not be worth producing OM6 because the passive production of OM4 would
> be compromised." (ichbinsisyphos / reddit)

**Status: CONFIRMED**

Evidence:
- `BOOK-01` — SwarmSim progression is sacrifice/rebuild, not monotonic highest-cost buying
- Reddit comments file (pre-annotated 2026-07-09, claim 1)

Bot implication: Keep target-aware meat planning, reserve checks, and anti-filler rules.

---

### C-04 Twinning stop/start: old prime is abandoned when passive ratio exceeds 2:1 **SA0-RELEVANT**

> "Your prime unit advances when your passive ratio hits 2:1 on the old prime unit.
> Quit manually producing it at that point."

**Status: PARTIALLY CONFIRMED**

Evidence:
- Reddit comments file (pre-annotated 2026-07-09, claim 2) — directionally confirmed
- We have confirmed that Twin is a hatch-conversion tool and that post-twin recovery matters
- Exact 2:1 threshold not measured in our live logs

Bot implication: Current twin-prep and opportunity-cost guards are directionally correct. Exact 2:1 threshold detection is a future Cascade Planner problem.

---

### C-05 Twin upgrade alarms: notify at 2x cost as soon as upgrade appears

> "Set your Faster upgrades to notify at 2x cost as soon as the upgrade appears."

**Status: UNCONFIRMED**

This is a human UI workflow recommendation, not a bot rule. Our bot uses payback-aware scoring, not a fixed 2x-cost rule.

Bot implication: None currently. If we implement upgrade timing hints in Council, this could inform threshold defaults.

---

## Section 2 — Hatchery and Expansion (featherwinglove + ichbinsisyphos)

### C-06 First Hatchery gives 50% larvae/sec increase **SA0-RELEVANT**

> "There is a zeroth hatchery, so the first hatchery you buy results in a 50% increase
> in larvae production."

**Status: CONFIRMED**

Evidence:
- `BOOK-01` — Hatchery-first protection in clean start is mathematically coherent
- `docs/test-data/strategy-audit-0/sa0-01/live/live-2026-07-12T063510-689Z/live-2026-07-12T063510-689Z-result.json` — clean-start HOLD with Hatchery as closest rejected alternative
- `docs/test-data/strategy-audit-0/sa0-04/live/live-2026-07-12T063900-773Z/live-2026-07-12T063900-773Z-result.json` — outside-window buy contrasted with inside-window Hatchery protection
- `docs/SWARMSIM_GAME_MODEL.md` — Hatchery larvae formula

Bot implication: Hatchery-first hold logic in clean start is justified.

---

### C-07 Each Expansion gives 10% larvae increase; 10th Hatchery also gives 10% **SA0-RELEVANT**

> "The tenth hatchery gives you a 10% increase in larvae production. An expansion
> always gives you a 10% increase."

**Status: CONFIRMED** (by game model math)

Evidence: `docs/SWARMSIM_GAME_MODEL.md` — Expansion and Hatchery formulas

Bot implication: Territory lane scores correctly through downstream Expansion/engine impact.

---

### C-08 Get expansions ASAP **SA0-RELEVANT**

> "Always get your expansions and Accomplished Ancestry the moment you can afford them."

**Status: PARTIALLY CONFIRMED / NUANCED**

The raw claim is too absolute. Our findings qualify it:
- Territory timing is context-dependent, not unconditionally immediate
- Expansion must be evaluated against the meat-chain rebuild cost
- Early meat-chain actions often take priority

Evidence:
- `BOOK-01` — Territory lane is engine-relevant through Expansion timing, not just territory/sec vanity
- `docs/test-data/strategy-audit-0/sa0-04/live/live-2026-07-12T063900-773Z/live-2026-07-12T063900-773Z-result.json` — Hatchery save-window state flips the recommendation from buy to hold once ETA enters the protected band
- [SA0-05 result JSON](test-data/strategy-audit-0/sa0-05/live/live-2026-07-12T065826-917Z/live-2026-07-12T065826-917Z-result.json) — Territory candidate exists but is rejected by minimum-improvement/ROI threshold
- [SA1-01 result JSON](test-data/strategy-audit-1/sa1-01/live/live-2026-07-12T071140-410Z/live-2026-07-12T071140-410Z-result.json) — mid-game multi-lane conflict still selects Meat while Territory remains an explicit rejected candidate
- [SA1-02 result JSON](test-data/strategy-audit-1/sa1-02/live/live-2026-07-12T071042-592Z/live-2026-07-12T071042-592Z-result.json) — with stronger territory pressure, winner still favors Meat rebuild under current threshold policy
- [SA1-02 threshold experiment result JSON](test-data/strategy-audit-1/sa1-02/live/live-2026-07-12T071553-778Z/live-2026-07-12T071553-778Z-result.json) — even when Territory is promoted to legal BUY via relaxed thresholds, Meat can still win, confirming the claim is about context-sensitive ranking rather than simple gating
- [SA1-02 high-yield sensitivity result JSON](test-data/strategy-audit-1/sa1-02-exp-yield/live/live-2026-07-12T071815-444Z/live-2026-07-12T071815-444Z-result.json) — even with stronger synthetic territory impact and legal Territory BUY, Meat still wins in the tested mid-game state, strengthening the ranking-priority interpretation
- [SA1-02 ordering-isolation post-fix result JSON](test-data/strategy-audit-1/sa1-02-exp-no-meat-planner/live/live-2026-07-12T072342-889Z/live-2026-07-12T072342-889Z-result.json) — after fixing synthetic Army buy execution in the audit harness, Territory is selected and executed when Meat goal planner is disabled; earlier no-selection runs are treated as harness artifacts
- [SA1-03 result JSON](test-data/strategy-audit-1/sa1-03/live/live-2026-07-12T071643-350Z/live-2026-07-12T071643-350Z-result.json) — under stronger Nexus reserve pressure, Energy remains protected while Meat still wins execution, reinforcing context-dependent timing over absolute ASAP behavior
- [SA1 v2 narrow sweep summary](test-data/strategy-audit-1/sa1-v2-breakpoint/2026-07-13T04-47-57-757Z/sa1-v2-summary.md) — targeted coarse->fine audit-only search across representative Meat/Energy/Clone/near-Territory seeds found no natural Territory-over-Meat breakpoint yet; nearest observed gap remained large (winner 8110 vs Territory 365.1214)
- `docs/live-logs/2026-07-09-clean-start-game-observation.md` — Brood Architect HOLD in clean start

Bot implication: Planner evaluates Expansion against competing lanes. "ASAP" is not the correct default; "when engine is ready" is.

---

### C-09 First 10 Hatcheries are highest-value; after that, use food on fighting units

> "Use as much food as you can on getting the first ten [hatcheries], producing just a few
> swarmlings for the easiest of the expansions ... After that, use all of your food on
> fighting units."

**Status: PARTIALLY CONFIRMED**

Hatchery diminishing returns are confirmed (C-06/C-07). The specific "first 10 then stop" rule is a human heuristic, not the exact bot logic. The bot uses rebuild/payback scoring.

Bot implication: Current payback-aware planner captures the spirit of this without hardcoding a count cutoff.

---

## Section 3 — Energy, abilities, Nexus (featherwinglove + ichbinsisyphos)

### C-10 2000 Lepidoptera before 5th Nexus, 2000 more after (total 4000)

> "To get the maximum energy rate the quickest, hatch 2000 before you build your fifth
> Nexus, and 2000 more (a total of 4000) after."

**Status: UNCONFIRMED** in our scope

We have not tested Lepidoptera count optimization against energy rate in the bot. This is a human guide target. Our energy support broker handles Lepidoptera as an advisor lane.

Bot implication: Future Energy Planner may validate or refine this threshold. Currently advisory only.

---

### C-11 Nightbugs: ideal ~100; never > few hundred **SA0-RELEVANT**

> "It is never worth making more than a few hundred nightbugs."

**Status: UNCONFIRMED** as exact threshold; **BOT BOUNDARY** as automation policy

Evidence: Safety defaults — `autoCastAbilities: false`; no auto-buy Nightbug/Bat by default.

Bot implication: No auto-buy. If advisor mode recommends Nightbugs, this claim suggests a soft upper bound of ~100–300. Not validated by our live logs.

---

### C-12 Bats: skip early game; ~100 is ideal early; ~400–500 with mutations

> "The ideal number of bats is 100, but you can skip them on the initial swarm."
> (Later: "it becomes profitable and the swarmwarp should be about around 21 hours... 400–500 bats.")

**Status: UNCONFIRMED** as exact threshold; **BOT BOUNDARY** as automation policy

Safety defaults prevent auto-buy Bats. Human guide values not tested.

Bot implication: Advisor may quote these as soft targets if bat planning is added.

---

### C-13 Clone Larvae: use at cascade point when prime is larvae-limited

> "Hit Clone Larvae several times (until you have about 4 times the amount you can clone)
> to multiply the effects of the cascade."

**Status: PARTIALLY CONFIRMED** (timing principle); **BOT BOUNDARY** (no auto-cast)

Evidence:
- `BOOK-02` — Clone Larvae cost confirmed at 12,000 energy
- Reddit comments file (pre-annotated 2026-07-09, claim 4) — Clone is cascade amplifier, not standalone dump
- Safety defaults: `autoCastAbilities: false`

Bot implication: Clone Larvae remains advisor-only. Full cascade state detection required before automation.

---

### C-14 Swarmwarp emphasis: primary energy ability over Clone Larvae in most states

> "Swarmwarp is the only special ability that passively produces drones and other units
> on the food stack."

**Status: UNCONFIRMED** in our scope

We have not built a comparative energy ability ranker. The bot's Energy Support Broker handles energy decisions as advisor-only.

Bot implication: Future Energy Planner may validate Warp vs Clone vs House of Mirrors trade-offs. Not actionable now.

---

### C-15 House of Mirrors: 2500 energy cost, doubles affected army rows

> (Not in community guides directly — inferred from game mechanics)

**Status: CONFIRMED** by live evidence

Evidence:
- `BOOK-02` — HoM cost confirmed at 2500 energy; live cast confirmed immediate doubling of army rows and territory/sec in tested state

Bot implication: HoM scores correctly in Laboratory. No auto-cast default.

---

## Section 4 — Cascade mechanics (reddit + featherwinglove)

### C-16 Cascade definition: passive/active ratio hits 2:1; save larvae; spend at larvae wall

> "Cascade because when this happens, everything below the prime unit widens in a downhill
> fashion. The more larvae you have, the bigger the cascade."

**Status: PARTIALLY CONFIRMED**

Evidence:
- Reddit comments (pre-annotated, claim 3) — directionally confirmed; exact 2:1 trigger not measured
- `docs/live-logs/2026-07-09-clicked-mechanics-progression.md` — parent passive production and hatch-conversion confirmed as separate systems

Bot implication: Cascade Planner is a future work item. Do not auto-cast Clone Larvae from this heuristic alone.

---

## Section 5 — Ascension and mutagen (featherwinglove + ichbinsisyphos)

These claims concern post-ascension mechanics outside our current SA0 scope.

### C-17 Ascend at ~300M mutagen first ascent; minimum 270M

**Status: OUT OF SCOPE** — Auto-ascend remains off by default.

### C-18 Allocate 1M mutagen to Lepidoptera Mutation only

**Status: OUT OF SCOPE**

### C-19 Warp + Bat as first two mutations; Hatchery and Meat next

**Status: OUT OF SCOPE**

### C-20 Mutagen larvae production eventually outstrips hatchery; expansions become optional late

**Status: OUT OF SCOPE**

---

## Section 6 — Mathematical foundations (ichbinsisyphos)

### C-21 Hatchery larvae growth is ΔL/L ≈ 1/(n+1) for nth hatchery

> The paper provides exact formulas for larvae production as a function of hatchery count.

**Status: CONFIRMED** (by implication of C-06 and C-07; exact formula in game model)

### C-22 Nightbug optimal count formulas for ascension speed and energy cap

The paper gives mathematical optimization for nightbug count given energy rate and ascension energy requirement.

**Status: OUT OF SCOPE** — Useful when building ascension advisor.

### C-23 Bat optimal count: minimize time to ascension given energy rate and warp multiplier

**Status: OUT OF SCOPE** — Useful when building bat/warp advisor.

---

## Open questions for SA0

These are claims we can potentially test or observe during SA0 scenarios:

1. **C-01**: Does the bot hold Twin prep when recovery buffer would drop below safe level? (SA0 twin-prep scenario)
2. **C-06**: Does the bot correctly prioritize Hatchery in clean start before other food spending? (SA0-01)
3. **C-08**: Does the bot wait for the right expansion moment, or does it treat territory as unconditionally urgent? (SA0 territory scenario)
4. **C-02**: Does Faster upgrade scoring correctly beat filler units when payback is favorable? (SA0 upgrade scenario)

---

## Related books

- Base mechanics (our own observations): `BOOK-01-base-mechanics-and-claims.md`
- Energy and Laboratory: `BOOK-02-energy-house-of-mirrors-and-lab.md`
- Strategy Intelligence findings (SA0+): `BOOK-04-strategy-intelligence-findings.md`
