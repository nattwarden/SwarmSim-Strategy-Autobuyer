# live-logs

Paste or upload exported SwarmBot live logs here.

## Current observation logs

Read these before changing strategy logic:

```text
2026-07-09-clean-start-game-observation.md
2026-07-09-clicked-mechanics-progression.md
2026-07-10-0.10.1-energy-support-counterfactual.md
2026-07-10-0.12.1-live-house-of-mirrors-cast.md
2026-07-10-energy-support-counterfactual-0.10.1.json
2026-07-10-base-game-claims-crosscheck.md
```

They document:

- clean-start game surface and first bot behavior
- clicked mechanics progression from Drone through first Expansion
- Faster versus Twin upgrade behavior
- Hatchery/Expansion larva-engine coupling
- military unit chain, Twin carry-forward limits, and empower/suffix behavior
- House of Mirrors source-code constraints
- live House of Mirrors cast effects and energy cost
- Energy support counterfactuals (Lepidoptera, Clone Larvae, House of Mirrors, wait)
- version-scoped measurements for SwarmBot v0.10.1
- crosscheck verdicts for community claims versus live mechanics findings
- periodic refresh checkpoints are appended to the crosscheck log to avoid duplicate docs

## New facts must be captured

If a browser test reveals new mechanics data not already documented, add a
short factual entry in `docs/live-logs/` in the same update.

Use this compact template:

```md
## Fact: <short claim>
- Status: CONFIRMED | PARTIAL | REJECTED
- Scope: <script/scenario/version/window>
- Evidence: <payload fields, scenario id/cycle, or direct observation>
- Why this is factual: <1 sentence>
- Implication: <1 sentence, optional>
```

Keep it concise:

- 4-8 lines per fact block
- no broad essay text in fact blocks
- append updates to existing claim logs instead of creating duplicates

Recommended naming:

```text
YYYY-MM-DD-version-short-description.md
```

Example:

```text
2026-07-09-0.7.9-live-log.md
```
