# 2026-07-10 Base-Game Claims Crosscheck (Live Findings vs Community/Math References)

Date: 2026-07-10

Scope:
- Crosscheck of empirically observed game behavior against:
  - featherwinglove reddit strategy notes (2015)
  - ichbinsisyphos math guide/dissertation-style analysis (2015)
  - cleaned reddit discussion notes
- This log tracks game-mechanics truth claims, not only bot implementation details.

Sources used:
- docs/live-logs/2026-07-09-clean-start-game-observation.md
- docs/live-logs/2026-07-09-clicked-mechanics-progression.md
- docs/live-logs/2026-07-10-0.10.1-energy-support-counterfactual.md
- docs/test-data/0.11.2-scenarios/scenario-results.json
- reference/REFERENCE_SwarmSim_featherwinglove_reddit_strategy_2015.txt
- reference/REFERENCE_SwarmSim_ichbinsisyphos_2015.txt
- reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt

Legend:
- CONFIRMED: observed directly in live/counterfactual runs and consistent with model.
- PARTIALLY CONFIRMED: direction is correct but depends on state/timing.
- DEMOTED: old claim is too absolute or contradicted by current evidence.
- OPEN: still plausible but not proven by current logs.

## Confirmed

1. Claim: SwarmSim is a sacrifice/rebuild game, not a blind highest-cost purchase game.
- Status: CONFIRMED.
- Why: Queen purchases consume Drone bank first and then rebuild through passive production.
- Evidence: 2026-07-09 clicked progression log.

2. Claim: Faster X upgrades are production multipliers on existing producers.
- Status: CONFIRMED.
- Why: Faster Drones and Faster Queens increased total output after purchase despite spending producer units.
- Evidence: 2026-07-09 clicked progression log.

3. Claim: Twin X upgrades are hatch-conversion tools, not passive parent-production multipliers.
- Status: CONFIRMED.
- Why: Twin Drones changed hatch multiplier but did not increase Queen passive Drone production.
- Evidence: 2026-07-09 clicked progression log and cleaned reddit cross-notes.

4. Claim: Territory progression is engine-relevant through Expansion (not only a side objective).
- Status: CONFIRMED.
- Why: Military spending increased territory/sec, which unlocked Expansion and increased larvae/sec.
- Evidence: 2026-07-09 clicked progression log.

5. Claim: House of Mirrors value depends on existing army state; missing preferred units matter.
- Status: CONFIRMED.
- Why: H1/H3 and live retest show missing-list gates react to actual unit presence/absence in 0.11.2 runtime.
- Evidence: 0.11.2 scenario results and live HoM before/after buy retest.

## Partially confirmed

1. Claim: Lepidoptera/Nexus timing is highly optimization-sensitive and math-guided targets are useful.
- Status: PARTIALLY CONFIRMED.
- Why: ichbinsisyphos math references (e.g. pre-Nexus 5 optimization and larger Lepidoptera targets) align with current planner constants; however this exact save has not re-run full ascension-level timing validation in this pass.
- Evidence: ichbinsisyphos reference + current model constants + 0.10.1 energy support observations.

2. Claim: Clone Larvae can be a strong support action in the right window.
- Status: PARTIALLY CONFIRMED.
- Why: counterfactual tests showed meaningful larva jumps in some states, but not enough to justify blanket automation rules.
- Evidence: 0.10.1 energy support counterfactual log.

## Demoted / effectively debunked as universal rules

1. Claim: "Always buy expansions immediately" as a universal law.
- Status: DEMOTED (too absolute).
- Why: save-window behavior can require temporary hold to protect key thresholds/engine timing; timing is state-dependent.
- Evidence: observed save-window logic and expansion-priority scenarios in 0.11.x verification.

2. Claim: one fixed tactic should dominate all stages (for example single-ability overfocus in all contexts).
- Status: DEMOTED (too absolute).
- Why: live findings show lane/state dependence (engine, meat, territory, energy support) and strong context effects.
- Evidence: combined clean-start, clicked progression, and energy-support counterfactual logs.

## Resolved claim closures (2026-07-10 follow-up)

1. Claim: specific ascension timing heuristics from old threads are globally optimal in current practical play.
- Status: DEMOTED as default policy.
- Why: current verified runs do not provide a clean, repeatable ascension benchmark setup; old thread timing advice remains useful as hypothesis material but is not strong enough to drive default automation behavior.
- Evidence: current live verification scope plus prior logs focused on clean start, progression, and energy-support windows.

2. Claim: Nightbug/Bat quantity heuristics from old guides are robust defaults.
- Status: DEMOTED as default policy.
- Why: in live 0.11.2 energy-tab state, Nightbug and Bat were available and visible, yet advisor buy signals remained zero while progression stayed stable. This supports keeping them non-default and context-driven.
- Evidence: live energy-tab check on 2026-07-10 (Nightbug/Bat rows present, no buy advisories in recent log window).

3. Claim: exact Clone Larvae cast cadence from older cascade guidance is broadly optimal.
- Status: DEMOTED as universal rule; PARTIALLY CONFIRMED as situational tactic.
- Why: counterfactual tests show Clone Larvae can be strong in specific windows, but 0.11.2 deterministic scenario outputs still show clone-observability gaps (R4/R5) and do not justify a single global cadence rule.
- Evidence: 0.10.1 energy support counterfactual log + 0.11.2 scenario report failures for clone fields in R4/R5.

## Practical conclusion for docs/model usage

- Use community guides as hypothesis generators.
- Treat ichbinsisyphos math as strong reference for optimization shape and threshold intuition.
- Keep automation defaults anchored in live-verified behavior and safety guardrails.
- When a claim is old and absolute, require fresh live evidence before upgrading it to policy.
- For current policy, all previously open claims above are now closed as either DEMOTED default rules or situational-only guidance.
