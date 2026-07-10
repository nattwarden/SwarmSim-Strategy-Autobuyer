# SwarmSim Strategy Autobuyer 0.11.0 - Energy Support Broker + Quest Council

Date: 2026-07-10

## Summary

0.11.0 builds on the approved local 0.10.1 baseline.

This release introduces an advisor-first Energy Support Broker and a clearer
Quest Council momentum layer. The goal is to improve readability and decision
quality without widening risky automation.

## What changed

### Energy Support Broker (advisor-first)

New broker layer evaluates support use of energy across:

- Lepidoptera
- Clone Larvae
- House of Mirrors
- Wait/save energy

Behavior in 0.11.0:

- Broker is advisor/observability first.
- Clone Larvae and House of Mirrors are evaluated but not auto-cast by default.
- Lepidoptera can be classified as primary/background/hold/wait.
- Best-use summary is exported with player and autobuyer instructions.

### Quest Council readability refresh

Council cards now present top-level advisor language as:

- I want
- Because
- Status

Top strip now includes a Do this now block:

- Do this now
- Why
- Bot is doing
- Player should avoid

Technical detail remains available in expandable Technical details sections.

### Momentum layer

New momentum framing separates:

- primary focus
- best step and reason
- companion/background/side-task actions
- blocked opportunity and waiting rationale

This gives clearer lane intent without changing core execution guardrails.

## New config fields

- energySupportBroker: true
- energySupportBrokerAdvisorOnly: true
- energySupportBrokerAllowAutoCast: false
- energySupportCloneLarvaeAdvisor: true
- energySupportHouseOfMirrorsAdvisor: true
- energySupportLepidopteraAdvisor: true
- energySupportMinMeaningfulBenefit: 0.05
- energySupportPreferSafeBackgroundLepidoptera: true

## Hard safety defaults preserved

Still preserved:

- autoCastAbilities: false
- autoAscend: false
- saveEnergyForNexus: true
- energyPlanner: true
- cloneBufferPlanner: true
- cloneBufferProtectLarvae: true
- no default House of Mirrors casts
- no default Clone Larvae casts
- no default Nightbug/Bat buys
- no blind buyMax in Smart mode

## What did not change

- Parent Step -> Parent Refill behavior
- anti-pingpong refill allowance
- active action unit payback bypass
- Twin Prep meaningful gate and thresholds
- post-Nexus Lepidoptera stop-threshold behavior
- auto-ascend behavior
- Nightbug/Bat default behavior
