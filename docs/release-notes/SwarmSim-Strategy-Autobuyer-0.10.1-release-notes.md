# SwarmSim Strategy Autobuyer 0.10.1 - Version/wording cleanup

Date: 2026-07-10

## Summary

0.10.1 is a documentation and observability alignment release on top of 0.10.0.

This release fixes version display/export alignment and clarifies Companion vs
side-task wording. It does not change gameplay strategy logic.

## What changed

- Version badge alignment:
  - UI version label and export scriptVersion now consistently report 0.10.1.
- Wording cleanup:
  - Companion and side-task language is clearer in Council/inspector surfaces.

## Strategy impact

No strategy logic change in 0.10.1.

## Safety defaults

Preserved:

- autoCastAbilities: false
- autoAscend: false
- saveEnergyForNexus: true
- cloneBufferPlanner: true
- cloneBufferProtectLarvae: true
- no default Clone Larvae casts
- no default House of Mirrors casts
- no default Nightbug/Bat buys
