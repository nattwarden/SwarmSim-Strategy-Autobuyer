# SwarmSim Strategy Autobuyer 0.11.3 - HoM Payoff Arbitration + Deterministic Harness Semantics

Date: 2026-07-10

## Summary

0.11.3 is a narrow patch release.

Scope:
- fix three confirmed House of Mirrors production issues (gate order, low-payoff false ADVISE, best-use arbitration),
- make deterministic scenario harness semantics reliable for cycle-specific assertions and branch observability.

No broad strategy rewrite is included.

## What changed

### 1) HoM explicit gate order and active gate reporting

House of Mirrors now evaluates in an explicit order:
1. ability available
2. energy affordability
3. relevant territory army context
4. preferred mirror units
5. projection calculable
6. payoff meaningful
7. final ADVISE/READY/HOLD decision

When no relevant territory army exists, that gate now owns primary reason text.
Preferred missing units remain exported as diagnostics but no longer override the active gate reason.

New compact field:
- energySupportMirrorActiveGate

### 2) HoM low-payoff fix and safe numeric handling

HoM meaningful gating no longer uses raw eta-gain seconds as an auto-pass.
Meaningfulness is now based on normalized ratios:
- territory rate gain ratio,
- expansion eta gain ratio.

This prevents low velocity / huge eta states from producing false ADVISE.

Handled safely:
- zero/very low territory velocity,
- Infinity eta,
- missing eta,
- NaN,
- negative/non-meaningful gains.

New compact fields:
- energySupportMirrorTerritoryRateGainRatio
- energySupportMirrorEtaGainRatio

### 3) Deterministic candidate arbitration for energy support

Energy support best-use selection no longer depends on fixed clone > HoM > lepidoptera ordering.
Broker now ranks candidates by:
- decision class (advise/background/hold/blocked),
- normalized benefit score,
- deterministic tie-break.

This allows HoM to beat weak clone states while still letting strong clone states win.

New compact fields:
- energySupportCandidateRanking
- energySupportBestUseSelectionReason

### 4) Deterministic harness semantics hardening

Harness updates:
- cycle-specific expectations supported via expectedByCycle,
- per-cycle expectation resolution in invariant evaluator,
- deep merge of between-cycle overrides,
- cycle report now includes clone and parent-step/refill observability fields,
- scenario report version added.

Scenario state coverage updates:
- deterministic unit count overrides now patch runtime unit count getters for the active scenario context,
- scenario config overrides supported for branch targeting without testhooks.

## Version consistency

Updated to 0.11.3 across:
- package version,
- userscript metadata,
- runtime script version,
- export scriptVersion,
- scenario report version.

## Safety defaults

Preserved:
- autoCastAbilities: false
- autoAscend: false
- energySupportBrokerAllowAutoCast: false
- no default Clone Larvae auto-cast
- no default House of Mirrors auto-cast
- no default Nightbug/Bat buys
- no blind buyMax behavior
- Nexus/energy protection
- Expansion save-window hard priority
- HoM suffix/alias preferred-unit matching
