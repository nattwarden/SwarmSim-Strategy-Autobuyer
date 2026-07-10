# History Summary

This file replaces old root-level `AI-...-indexed.md` snapshots and the
duplicated `releases/` folder.

Active instructions remain:

```text
AGENTS.md
AI.md
docs/SWARMSIM_GAME_MODEL.md
```

Detailed release notes remain in:

```text
docs/release-notes/
```

## Version notes

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

- `AI.md` and `AGENTS.md` are the active agent entrypoints.
- `docs/release-notes/` already holds detailed release history.
- executable source must exist only at
  `src/SwarmSim-Strategy-Autobuyer.user.js`.
