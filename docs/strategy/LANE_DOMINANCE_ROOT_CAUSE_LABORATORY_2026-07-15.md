# Lane Dominance Root-Cause Laboratory — 2026-07-15

**Runtime under test:** 9.3.5 · `2be3b68fa1a6518bf207504279ba2f9b079bc14c`
**Git verified:** `HEAD == origin/main == 2be3b68…` (clean tree, only untracked test-data).
**Method:** real swarmsim.com page + injected 9.3.5 userscript + `game.importSave()` of the
operator-supplied live save, auto-timer stopped, all branches started from one bit-identical
shared snapshot (Playwright). Disposable harness lived in the session scratchpad and touched no
runtime or version surface.

> **Implementation gate:** this is the diagnosis phase only. No version bump, no strategy/gate
> change, no runtime commit. A 9.3.6 fix may follow only against the priorities in the last section.

---

## 0. Shared snapshot (the state that reproduces the phenomenon)

The repository's canonical `default-user-save/save.txt` does **not** reproduce the phenomenon — it
is a much later post-Nexus state where **Engine: Expansion** wins and all three coordinators agree
(a healthy control, see §8). The operator supplied the actual live save. It imports to:

- goal = **"Meat-chain target: lesser hive mind; current action: neural cluster."**
- M6 recommendation = **UNCERTAIN**, `recommendedActionId = WAIT`
- status carries **"fallback unit purchases paused near ascension"**
- Clone Ramp bank ≈ **1005 % of cap**; Territory flagged **`territoryLaneSaturated: yes`**
- Hatchery **not buyable, 37 %, ETA ≈ 25 m**

All of the operator's described markers are present, so the snapshot is the right one.

---

## 1. Exact architectural root cause

**Meat wins by advisor-fallthrough to an ROI-bypassed legacy planner, in a state where the
order-invariant global coordinator abstains and every non-meat lane is honestly gated.**

Three independent facts combine:

1. **The global coordinator is hard-wired out of execution authority.**
   `smartRunOnce()` sets `const m6DecisionOwnsMainCycle = false;`
   ([user.js:19778](../../src/SwarmSim-Strategy-Autobuyer.user.js#L19778)). The developer comment
   above it states M6's authority gate needs a comparable milestone-eta metric that "only the
   Territory proposal populates today (Engine/Meat/Energy stay UNRANKED and can never win)." So M6
   runs for display and legacy lanes remain the acting purchaser.

2. **The Meat-chain action is not in the global rankable universe, and the coordinator's target
   identity is split.** In the live snapshot the whole-economy evaluator reports
   `purchaseEvaluatorWhyNotExecuting = "no safe BUY candidate"` /
   `wholeEconomyAdvisorOnlyReason = "no safe domain winner"`; M6 reports
   `recommendation = UNCERTAIN`, `winner = none`, but `activeTarget = "territory"` while
   `activeMilestone = "…lesser hive mind…"`. The six ranked domains (Energy / Larva-Engine /
   Army-Territory / Energy-production / Energy-abilities / Ascension) do **not** contain the Meat
   parent-step chain at all, and every domain that *is* present is HOLD.

3. **The Meat family alone may buy while ignoring ROI.** The only payback / opportunity-cost
   bypasses in the entire runtime are
   `meatActionUnitPaybackBypass`, `meatUnlockPaybackBypass`, `meatParentStepPaybackBypass`,
   `twinUnlockPaybackBypass`, `twinUpgradeOpportunityCostBypass`
   ([user.js:218–235](../../src/SwarmSim-Strategy-Autobuyer.user.js#L218)). There is **no**
   territory/engine/energy/upgrade bypass. Territory is gated by "economically saturated", Energy by
   "lepidoptera stop threshold", Engine by "eta-stall / meat threshold", Ability by "auto-cast
   disabled". So when the economy is saturated, the Meat (and meat-directed Twin) planners are the
   only lanes structurally permitted to act.

Net: the honest lanes correctly HOLD, the global comparison abstains (none/UNCERTAIN) with no
execution authority, and execution falls through the fixed legacy lane walk to the one lane that is
allowed to buy without passing a payback gate — Meat / Parent Step.

---

## 2. Which coordinator actually governed live

| System | Verdict on the live snapshot | Governs execution? |
|---|---|---|
| M6 six-domain coordinator | `UNCERTAIN` / `WAIT` / winner **none** | No — `executionAuthority=false` |
| M2 whole-economy evaluator | winner **none** ("no safe domain winner") | No — advisor-only, `execAuthority=false` |
| Legacy lane coordinator | **BUY → Meat: hive network** | **Yes — this is the acting purchaser** |
| Actual executed action | **Meat: hive network** (parent-step) | — |

The actual winner equals the **legacy** decision, and equals **neither** global system's output.

---

## 3. Do all lanes share one target / horizon / metric basis?

**No.** The identity splits in two places:

- **Target identity:** M6 `activeTarget = "territory"` vs `activeMilestone = "lesser hive mind"`
  (set in `smartRunOnce()` where `activeTarget` is derived from
  `preExecutionMainAction?.target || smartFocus` — [user.js:19797](../../src/SwarmSim-Strategy-Autobuyer.user.js#L19797) — which is not the meat-chain target).
- **Metric basis:** lane `score`s are non-comparable across lanes — live census:
  Clone Ramp 96000, Engine/Expansion 82064 (HOLD), Energy 50000, Ability 25000,
  **Meat 10974**. These are different bases, not one ranking. The Meat-chain action carries no
  `milestone-eta-seconds` metric in the domain set, so it is effectively **UNRANKED**, not ranked
  and beaten. This matches the developer comment in fact 1.

---

## 4. Order-permutation result (TRACK 2)

Feeding the live candidate set to the exposed `purchaseEvaluator.buildExecutionDecision` /
`evaluate` in six orders (current, reversed, meat-first, meat-last, deterministic-random A/B):

- Global evaluator winner is **invariant**: `Clone Ramp: Clone Larvae` (score 9.6) in **all six**
  orders, with `executionAuthority = false` every time.
- **But** that order-invariant winner is (a) advisor-only and (b) **not what executes** — the
  runtime executes **Meat**, not Clone Ramp.

So the global arbitration layer *is* order-invariant, yet it is decorative: it holds no execution
authority and its winner does not match the acted purchase. On this specific state the executed
winner (Meat) is itself order-insensitive **because Meat is the only persistently-executable
candidate** — therefore this state is **not** primarily `LEGACY_ORDER_BIAS`; order does not change
the outcome here, single-candidate dominance does.

---

## 5. Gate-asymmetry result (TRACK 4)

Same snapshot, disposable gate configs, 6 cycles each:

| Branch | Meat wins | Budget used | What else surfaces |
|---|---|---|---|
| baseline | 6/6 (hive network) | 1–2 / 4 | Clone Ramp ×1 |
| `meatParentStepPlanner=off` | 6/6 (→ neural cluster) | 1–2 / 4 | Upgrade, Twin |
| `meatParentStepPaybackBypass=off` | 6/6 (→ neural cluster) | 1–2 / 4 | Upgrade, Twin |
| **all meat payback bypasses off** | **0 / 6 — WAIT** | **0 / 4 every cycle** | **nothing** |
| all meat planners off | 0 / 6 — WAIT | 0 / 4 | nothing |
| `twinUnlockPlanner=off` | 6/6 | 1 / 4 | — |

Disabling one meat sub-planner is insufficient — another meat bypass (action-unit / unlock) takes
over. Only when **all** meat payback bypasses are removed does Meat stop, and then **no other lane
steps in**: the whole economy is genuinely saturated/blocked, so the honest answer in this state is
close to WAIT. This is the decisive proof that the Meat win is produced by the bypass gate
asymmetry, not by economic superiority.

---

## 6. Multi-action / budget result (TRACK 5)

50 execution cycles from the shared snapshot:

- **Meat won 50/50** cycles (49 Meat-only, 1 Meat + Clone Ramp).
- Budget histogram: **49 cycles at 1/4, 1 cycle at 2/4 — never 4/4, always ≥3/4 unused.**
- `purchaseEvaluatorWinner = none` and `M6 = UNCERTAIN / undefined` on **every** cycle.

Why the 3/4 budget stays unused after the single Meat buy: the remaining legacy lanes are all HOLD
(Territory saturated, Energy stop-threshold, Engine eta-stall, Ability disabled) and the normal unit
fallback is suppressed by the ascension pause (§ next). It is **not** a stale-post-action or
budget-ownership bug — there is simply no second bypass-free candidate, and the meat planner emits
exactly one parent-step per cycle. Classification for the unused budget:
**`FALSE_ASCENSION_PAUSE` + `NO_OTHER_REAL_OPPORTUNITY`**, not `BUDGET_PREEMPTION` /
`STALE_POST_ACTION_STATE`.

*False ascension pause:* the census contains `Meat | HOLD | Units | ["ascension safety pause"]` and
status "fallback unit purchases paused near ascension", while the ascension recommendation itself is
`UNCERTAIN`. A lane that could consume idle budget is paused on an unconfirmed ascension.

---

## 7. Clone C-throughput result (TRACK 6)

12 cycles, clone casting ON vs OFF:

| Branch | Meat buys | Clone casts | larva start → end |
|---|---|---|---|
| clone ON (baseline) | 12 | 1 | 4.1308e25 → **4.7564e25** (jumps, then idles) |
| clone OFF | 12 | 0 | 4.1308e25 → 4.1308e25 (flat) |

**Meat progression is identical with or without clone casting.** The extra larvae from the cast
simply pile up unused. **Clone Ramp is not the root cause** — casting more only grows a larger idle
larva heap, exactly the failure mode the work order predicted. The bottleneck is the
spending/arbitration chain, not clone generation. (Do **not** implement repeat clone-cast as a fix.)

---

## 8. Lane-sensitivity / control (TRACK 7, from two real states)

- **Live save (this report):** economy saturated → global coordinators abstain → Meat wins by
  fallthrough. Meat is the only executable candidate.
- **`save.txt` control (healthy):** Engine has a comparable milestone-eta metric →
  `purchaseEvaluatorWinner = Engine: Expansion`, M6 `recommendation = ACT`,
  `authorityState.executionAuthority = true`, and the legacy path also executes Expansion; budget
  **4/4** used.

So a non-meat lane **can** win and all systems **can** agree — but only when the winning lane
happens to carry the one comparable metric. The moment that metric is absent (meat-chain / saturated
economy), the global layer abstains and meat's bypass decides. That state-dependence is itself the
finding.

---

## 9. Final root-cause classification

For the live save, "Why did Meat win (20/20 → 50/50)?" is classified as, in order of causal weight:

1. **`GATE_ASYMMETRY`** — only the meat/twin families carry payback bypasses; every other lane is
   honestly ROI/reserve/eta gated. (TRACK 4, source §1.3)
2. **`ADVISOR_FALLTHROUGH`** — global winner is advisor-only (`m6DecisionOwnsMainCycle=false`,
   `executionAuthority=false`) and does not match execution. (TRACK 2/3, source §1.1)
3. **`ONLY_EXECUTABLE_CANDIDATE`** / **`NO_OTHER_REAL_OPPORTUNITY`** — in the saturated state Meat is
   the single persistently-buyable lane. (TRACK 4/5)
4. **`METRIC_NOT_COMPARABLE`** + **`TARGET_IDENTITY_MISMATCH`** — meat-chain is UNRANKED in the
   domain set; `activeTarget=territory` ≠ milestone. (TRACK 1/3, §3)
5. **`FALSE_ASCENSION_PAUSE`** — contributes to the 3/4 unused budget. (TRACK 5)

**Explicitly NOT:** `GLOBALLY_BEST` (no global system ranked Meat best — they abstained),
`LEGACY_ORDER_BIAS` (winner invariant to order on this state), `BUDGET_PREEMPTION` /
`STALE_POST_ACTION_STATE` (no second candidate exists), and clone throughput (TRACK 6).

---

## 10. Previously-observed "Meat bugs" now explained by the same root cause

The recurring "Meat wins every cycle regardless of long-term focus / engine milestones / energy
surplus / clone bank / ascension / available budget" reduces to a single mechanism: **whenever the
economy is saturated enough that the honestly-gated lanes HOLD, the only lane permitted to act is the
payback-bypassed meat family, and the global coordinator that should arbitrate has no execution
authority.** That single mechanism accounts for: territory ignored while saturated; engine
milestones not preempting meat; energy/clone surplus left idle; 3/4 budget unused; and the
"UNCERTAIN ascension + paused fallback units" combination.

---

## Recommended narrow 9.3.6 direction (gated — not yet implemented)

In the work order's priority order, the evidence supports:

1. **Shared target/horizon identity** — make `activeTarget` follow the active milestone (meat-chain)
   instead of `preExecutionMainAction.target`, so the coordinator ranks toward the real goal.
2. **Global winner must govern execution** — give the meat-chain a comparable
   `milestone-eta-seconds` outcome so it enters the ranked domain set; then let the authorized global
   winner drive the acted purchase (retire the `m6DecisionOwnsMainCycle=false` fallthrough) so
   `actual execution == authorized global winner`.
3. **Symmetric gating** — the meat/twin payback bypass must compete on the same comparable metric as
   every other lane, not act as an unconditional licence to buy.
4. **Post-action re-evaluation** — only consume remaining budget when a genuinely useful comparable
   candidate exists (here: WAIT was correct; do not force fills).
5. **Fix the false ascension pause** — do not suppress fallback lanes on an `UNCERTAIN` ascension.
6. **Do not** implement repeat clone-cast, lane round-robin, or artificial per-lane quotas — the goal
   is a winner that reacts correctly to game state, not equal wins per lane.

**Acceptance for any future 9.3.6** remains the work order's list: global recommendation ==
authorized execution; winner invariant under evaluator order; all lanes share one target/horizon
basis or are explicitly UNRANKED; post-action re-eval consumes budget only when useful; Meat does not
win merely because other domains are advisor-only/incomparable; sensitivity scenarios pass; the live
save has an explained, evidence-backed winner distribution (this document).
