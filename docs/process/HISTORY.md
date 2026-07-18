# History Summary

This file replaces old root-level `AI-...-indexed.md` snapshots and the
duplicated `releases/` folder.

Active instructions remain:

```text
AGENTS.md
docs/SWARMSIM_GAME_MODEL.md
```

Detailed release notes remain in:

```text
docs/release-notes/
```

## Version notes

- 9.1.0: Closed the M6 comparability gap for Engine, Meat, and Energy purchase domains. Previously only Territory (and the pre-Nexus Lepidoptera-ROI branch of Energy) populated a comparable ETA-improvement metric, so Engine (Hatchery/Expansion), Meat (goal-planner action unit), and the Nexus-buyable/post-Nexus-Lepidoptera Energy branches were always `UNRANKED` in the six-domain coordinator and could never win or gain execution authority. Fixed by wiring the existing `projectedMilestoneProgressDelta` schema field through `evaluatePurchaseCandidate`'s shared outcome and setting it to a real, non-fabricated value for discrete one-time unlocks (100 on buyable) and by reusing the already-computed Energy production boost gain. No hard safety defaults or authority boundaries changed; `m6DecisionOwnsMainCycle` remains `false`.
- 9.0.0: Fixed a critical regression where `m6DecisionOwnsMainCycle` was hardcoded `true`, disabling every legacy purchase path and leaving the Autobuyer unable to buy anything in live play; restored legacy per-lane execution as the acting purchaser. Closed Milestone 9 (resource-scoped save locks) by adding a focused acceptance check proving an active Expansion/Territory save window blocks only Territory spend while Meat/Engine/Energy/Upgrade lanes remain executable, with no runtime behavior change needed since the guard was already resource-scoped.
- 2026-07-14 audit/tooling: Added terminal progress telemetry for SA1 matrix runs (`n/total`, percent, active scenario/repeat, ETA), introduced calibrated sweep entrypoints with a 12-state default first pass (`strategy:audit:matrix:sa1:sweep`), added simple range narrowing knobs (`--sweep-min-index`, `--sweep-max-index`) for second-pass calibration, and updated SA1 v2 bootstrap to use a configurable stratified 12-state sample by default (`--bootstrap-scenarios`, `--bootstrap-universe`, `--bootstrap-cycles`) instead of a fixed 150-state bootstrap requirement.
- 8.1.0: Tuned Smart defaults for more continuous progression with larger Smart chunking, earlier fallback activation, wider fallback candidate reach and chunking, reduced reserve strictness, longer payback tolerance, and shorter Hatchery/Expansion save windows while preserving hard irreversible safety defaults.
- 8.0.0: Added Milestone 8 ETA-grounded false-wait reduction with repeated reserve+ability-disabled hold-pattern tracking, accelerated stall-breaker activation visibility by cycle 3 in focused replay, focused M8 checker integration in the verify chain, and preserved hard safety defaults and advisor-only authority boundaries.
- 7.0.0: Added M7 strategic outcome calibration (`strategic-outcome-calibration.v1`) with WAIT-relative identity/metric/horizon validation for Energy abilities, strict Ascension placeholder calibration that refuses break-even-surplus ETA conversion, calibrated advisor observability in Council/Inspector/export/API, and focused M7 acceptance/version checks while preserving existing bounded reversible execution authority and all hard safety defaults.
- 6.0.0: Added the six-domain strategic coordinator runtime slice, exposing one
  immutable decision identity, coordinated Council/Inspector state, advisor-only
  alternatives, bounded reversible execution gating, effect audits, shared-cost
  conflict reporting, and a public strategicCoordinator API.
- 5.0.1: Fixed live Ascension Energy ETA compatibility, surfaced structured M4
  and M5 advisor results in Council/Matrix, and clarified fallback status and
  Avoid guidance. All irreversible authority remains disabled by default.
- M6 foundation (unreleased): Defined the implementation-ready six-domain
  strategic coordinator contract for `6.0.0`, including one immutable decision
  identity, honest shared-outcome comparability, hard-safety separation,
  advisor authority isolation, causal effect double-count prevention, bounded
  reversible revalidation, mechanic-based coverage, focused acceptance, and a
  complete Copilot work order. No runtime behavior or authority changed.
- 5.0.0: Added an advisor-only Ascension and Mutagen advisor that compares
  CONTINUE_RUN and ASCEND_NOW from one immutable snapshot, includes
  recovery-aware uncertainty gates, keeps Mutagen allocation execution disabled,
  ranks KEEP_UNALLOCATED and Hatchery Mutation when direct larva inputs resolve,
  and exposes structured/flat observability fields plus diagnostic API access.
- 4.0.0: Began milestone-aligned versioning with M4 and added the advisor-only
  Energy ability timing contract. Clone Larvae, House of Mirrors, and the three
  source-verified Rush abilities are compared against explicit WAIT/save from
  one snapshot; Swarmwarp and all ability execution remain excluded.
- 0.14.1: Simplified the default control surface to Advisor or Autobuyer,
  collapsed expert settings and Laboratory tools, fixed button contrast, and
  made Swarm Council movable and resizable with a persisted layout.
- 0.14.0: Whole-Economy Coordinator compares Meat, Larva/Engine, and
  Army/Territory from one snapshot, then may execute exactly one bounded,
  reversible winner after identity-preserving revalidation. Council, Inspector,
  and exports distinguish advice, authority, execution, and fallback. Ability
  and Ascension safety defaults remain unchanged.
- 0.13.0: Unified Purchase Evaluator coordinates the first reversible purchase
  from one pre-execution snapshot, while Laboratory Phase 2A adds source-derived
  Rush simulation and an advisor-only Energy Opportunity Report. Existing
  irreversible-action safety defaults remain unchanged.
- 2026-07-13 audit/v2: Added targeted SA1 v2 breakpoint runner
  (`strategy:audit:matrix:sa1:v2`) with representative-seed selection from
  corrected sweep150 and coarse->fine search over two independent dimensions
  (synthetic territory effect + Meat profitability guard parameters). Latest
  run produced 18 coarse states, 0 fine states (no coarse Territory flip),
  0 Territory wins, and full reset/leakage guardrail pass. No production
  planner/runtime/default/safety/Laboratory changes.
- 2026-07-13 audit/runner: Added a persistent-browser SA1 matrix path that
  reuses one Chrome window, context, and page for sequential runs and fails
  hard on reset or leakage violations. Preserved the original process-per-run
  behavior as `strategy:audit:matrix:sa1:isolated`. No production strategy or
  safety defaults changed.
- 2026-07-13 docs/architecture: Documented the SA1 breakpoint matrix as an
  official one-command test capability, including full/smoke commands, child
  failure propagation, and artifact location. Clarified that Strategy Audit
  scenario stress testing and Laboratory contract verification are separate
  flows, with a future Laboratory batch runner identified as an integration
  direction rather than a current capability. No runtime strategy or safety
  defaults changed.
- 0.12.4: Version bump after Strategy Audit harness execution fix for synthetic
  Army unit buys and consolidated SA1 documentation updates. Runtime strategy
  behavior and safety defaults remain unchanged.
- 2026-07-12 audit/runner+docs: Fixed synthetic Army unit execution in Strategy
  Audit harness by patching synthetic-unit `commands.buyUnit` handling. SA1
  ordering-isolation (`sa1-02-exp-no-meat-planner`) now executes Territory BUY
  (`selectedLane=Territory`) in post-fix run, so prior no-selection runs are
  reclassified as harness artifact rather than runtime strategy behavior.
- 2026-07-12 audit/docs: Added SA1 ordering-isolation variant
  (`sa1-02-exp-no-meat-planner`). Result showed legal Territory BUY but no
  selected lane execution (`selectedLane=none`, `actionBudget=0/4`) when Meat
  goal planner was disabled. This introduces a second optimization target:
  execution-path coherence, not only ranking/gating.
- 2026-07-12 audit/docs: Repeated `sa1-02-exp-no-meat-planner` and reproduced
  the same no-selection pattern with legal Territory BUY, increasing confidence
  that the behavior is stable under this staged mid-game state.
- 2026-07-12 audit/docs: Added SA1-02 high-yield sensitivity variant
  (`sa1-02-exp-yield`) to probe ranking breakpoints. Result: Territory promoted
  to legal BUY with stronger synthetic ROI (`+750/sec`) but Meat still won.
  This further supports ranking/priority calibration as the next improvement
  focus.
- 2026-07-12 docs/audit: SA1-03 (Energy reserve arbitration) captured and
  documented. Combined SA1 evidence now shows stable Meat winner selection with
  explicit Energy/Territory alternatives and coherent reserve blockers. Interim
  conclusion: next useful optimization target is mid-game ranking calibration,
  not only threshold gate relaxation.
- 2026-07-12 docs/audit+runner: Added audit-only scenario config overrides with
  reset-safe restore and fingerprint coverage. SA1-02 threshold experiment shows
  Territory can be promoted from HOLD to legal BUY candidate by relaxing min-ETA
  gates, but Meat still wins winner selection. This narrows the next improvement
  hypothesis to mid-game lane ranking/priority calibration, not gating alone.
- 2026-07-12 docs/audit+runner: SA1-01 and SA1-02 repeated visible live runs
  confirm stable Meat-lane winners with explicit Territory and Energy alternatives
  present. Added SA1-02 scenario and fixed non-canary assessment verdict wording
  in the testbed runner so missing `runOnceReturned` no longer auto-downgrades
  results to QUESTIONABLE.
- 2026-07-12 docs/audit: Strategy Audit 1 started with SA1-01 visible live run.
  Initial evidence shows stable Meat-lane winner over 5 cycles while Territory
  and Energy alternatives remain explicit and justified. A testbed-only
  assessment-label justification mismatch (canary-oriented wording in SA1
  output) is now tracked as observability debt.
- 2026-07-12 docs/audit: Strategy Audit 0 SA0-05 and SA0-06 evidence captured
  in visible live runs and documented in BOOK-04/BOOK-05 plus 0.12.3 release
  notes. SA0-05 confirms Territory candidate visibility with ROI-threshold
  rejection (no starvation). SA0-06 confirms legal-but-meaningless small-buy
  rejection (0s ETA gain below configured minimum). No userscript strategy or
  safety-default changes are included.
- 2026-07-10 docs/planning: Strategy Audit now requires a documented testbed
  feasibility decision before execution. Disposable audit instances may be
  freely staged, while planner output may never be forced. A visible headed
  watch mode is a product requirement. No runtime or strategy change is
  included.
- 2026-07-10 docs/planning: 0.12.3 is the verified technical baseline; next
  phase is Strategy Intelligence, starting with Strategy Audit 0
  (early-game behavioral baseline). No strategy changes are included in this
  planning update.
- 0.12.3: Laboratory live effective HoM count capture fix, reason propagation
  normalization for blocked/legal abilities, and honest verifier gates using
  unmodified production capture.
- 0.7.9: Target-aware Upgrade / Twin Planner.
- 0.8.0: Unlock Planner, Clone Buffer Planner, Ability Prep Planner
  advisor-only.
- 0.8.1: follow-up planner hardening documented in release notes.
- 0.8.2: follow-up planner hardening documented in release notes.
- 0.8.3: follow-up planner hardening documented in release notes.
- 0.8.4: follow-up planner hardening documented in release notes.
- 0.8.5: follow-up planner hardening documented in release notes.
- 0.8.7: Twin Threshold Reachability Fix plus Twin Upgrade Opportunity Cost
  Bypass on top of the 0.8.5 main baseline.
- 0.8.8: Multi-Lane Coordinator / Territory Starvation Fix baseline.
- 0.8.9: Methodical Lane Follow-through / Visible Progress Fix.
- 0.8.10: Territory Scanner + Guard Bar / Overseer UI.
- 0.8.11: Twin Prep Priority / Parent-Step Throughput Fix.
- 0.8.12: Parent-Step Refill / Action Budget Fix.
- 0.8.13: Twin Prep Meaningful Gate Regression Fix.
- 0.8.14: Swarm Council Advisor UI presentation refresh.
- 0.9.0: Post-Nexus Strategy Pack with conservative Lepidoptera planning,
  clearer action-budget diagnostics, and Council planner-state integration.
- 0.10.0: Expansion-aware Army Seed Planner with bounded ETA-gain gating,
  active Council speaker bubble, clearer companion wording, and stronger
  territory/army observability.
- 0.10.1: Version badge and export scriptVersion alignment fix, plus
  Companion/side-task wording cleanup; no strategy logic changes.
- 0.11.0: Energy Support Broker advisor/observability layer plus Quest Council
  momentum framing (Do this now, I want/Because/Status), while preserving
  no-auto-cast safety defaults.
- 0.11.1: Narrow consistency patch for Expansion save-window priority over
  Energy/Lepidoptera primary, Lepidoptera background/best-step consistency,
  centralized Beetle Magus primary speaker mapping, and refreshed House of
  Mirrors readiness/reason observability.
- 0.11.2: House of Mirrors live-state preferred-unit matching fix (suffix-aware),
  deterministic scenario harness (explicitly gated debug API), and minimal mirror
  source/revision observability for reproducible scenario checks.
- 0.11.3: HoM gate-order/payoff/arbitration patch plus deterministic harness
  cycle-semantics hardening (cycle-specific expectations, clone/report mapping,
  transition observability, and scenario report versioning).
- 0.11.4: Narrow Parent Step -> Parent Refill transition fix for deterministic
  scenario R8 with harness transition replay markers and per-cycle transition
  trace fields; no strategy expansion.
- 0.11.5: Parent Step/Parent Refill finalization in cycle-2 refill state
  (no repeated Parent Step BUY signal), plus canonical runtime version export
  alignment for scriptVersion/autobuyerVersion surfaces.
- 0.11.6: Narrow deterministic-harness progression patch for scenario aliasing
  and planner target fallback in scenario mode, with refreshed 0.11.6
  verification evidence and unchanged safety defaults.
- 0.11.7: Narrow deterministic-harness input stabilization patch with canonical
  army alias resolution (early setup-fail on ambiguous/missing alias), richer
  R8/HoM/Clone observability fields, and 0.11.7 scenario/version-surface
  templates for Laboratory Phase 1 baseline work.
- 0.12.2: Laboratory live House of Mirrors canonical resolver fix, blocked-
  action observability cleanup, and reserve provenance correction.
- 0.12.1: Laboratory live read-only capture path with non-mutation proof,
  live-only exports, and browser verification evidence.

## Documentation posture note

2026-07-09: active agent/docs language was reframed from “conservative bot” to
“methodical optimizer/advisor with hard safety defaults”. The change is a
mental-model and documentation shift, not a gameplay logic change. Hard safety
boundaries remain separate from ordinary progression optimization.

## Cleanup decision

Removed from the working tree:

- old root-level `AI-...-indexed.md` snapshots
- duplicated `releases/` release-note copies
- old release `.user.js` and `.txt` script mirrors
- stale bootstrap validation checksum files
- stale bootstrap `git-push-commands.md`

Reason:

- `AGENTS.md` is the active agent entrypoint (`AI.md` was later merged into it).
- `docs/release-notes/` already holds detailed release history.
- executable source must exist only at
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
