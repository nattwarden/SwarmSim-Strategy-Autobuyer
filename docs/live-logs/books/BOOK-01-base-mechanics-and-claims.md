# Book 01 - Base Mechanics and Claims

> Historical reference notice
>
> This book summarizes base-game mechanics, claims, source checks, and
> observations gathered during development through SwarmSim Strategy
> Autobuyer 0.12.2.
>
> It is historical reference material, not the active strategy contract.
>
> Current authoritative game model:
>
> - `../../SWARMSIM_GAME_MODEL.md`
>
> Current verified implementation:
>
> - SwarmSim Strategy Autobuyer `0.12.3`
> - `0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED`
>
> Where this book conflicts with the active game model or newer verified
> evidence, the active game model and newer evidence take precedence.

Date range: 2026-07-09 to 2026-07-10
Purpose: one compact truth layer for base-game mechanics and claim status.

## Sources

- ../2026-07-09-clean-start-game-observation.md
- ../2026-07-09-clicked-mechanics-progression.md
- ../2026-07-10-base-game-claims-crosscheck.md

## Executive summary

- Clean start surface is small: meat, larvae, drones, early upgrades.
- Hatchery and Expansion are coupled larva-engine mechanics.
- SwarmSim progression is sacrifice/rebuild, not monotonic highest-cost buying.
- Faster upgrades are producer multipliers and are usually strong with payback/rebuild checks.
- Twin upgrades are hatch-conversion tools and must be context-scored.
- Territory lane is engine-relevant through Expansion timing, not just territory/sec vanity.

## Confirmed facts (stable)

1. Hatchery-first protection in clean start is mathematically coherent.
2. Faster X upgrades increase total output despite spending part of producer banks.
3. Twin X upgrades do not act as parent passive production multipliers.
4. Queen and higher-unit purchases are expected sacrifice/rebuild transitions.
5. Territory progression is directly relevant to Expansion and larva growth.

## Policy-level implications

- Keep hard safety defaults unchanged unless explicitly requested.
- Keep diagnostics clear: distinguish locked lanes from active blockers.
- Evaluate Territory and Army actions by downstream Expansion/engine impact.
- Score Faster/Twin differently in planner logic and advisor language.

## Claim table snapshot

- CONFIRMED: sacrifice/rebuild loop, Faster behavior, Twin behavior, territory-to-expansion coupling.
- PARTIALLY CONFIRMED: Lepidoptera/Nexus timing heuristics, Clone Larvae timing windows.
- DEMOTED as universal defaults: absolute legacy rules (always-expand-now, one tactic everywhere, fixed Nightbug/Bat quantity defaults).

## What to read next

- For energy and ability behavior: `BOOK-02-energy-house-of-mirrors-and-lab.md`.
- For historical verification context: `BOOK-03-verification-history-and-artifacts.md`.

## Related books

- Energy, House of Mirrors, and Laboratory diagnostics:
	`BOOK-02-energy-house-of-mirrors-and-lab.md`
- Verification history and artifacts:
	`BOOK-03-verification-history-and-artifacts.md`
