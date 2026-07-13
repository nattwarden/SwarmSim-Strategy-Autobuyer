# SwarmSim Strategy Autobuyer 8.0.0

## Milestone 8

This release closes Milestone 8: ETA-grounded false-wait reduction.

### Player-visible behavior

- Smart mode now surfaces stall-breaker activation earlier under repeated HOLD patterns where blockers are reserve plus ability disabled.
- Focused replay confirms ETA-grounded blocker streak by cycle 3 with visible stall-breaker activation signaling.
- Fallback handling remains bounded and revalidated, and no new irreversible authority is introduced.

### Safety and authority

- Hard defaults remain unchanged.
- Ability, Ascension, and Mutagen remain advisor-only and non-executable.
- Reserve/protected-resource gates remain authoritative for execution.

### Verification

- Added focused checker: check:book00:m8:false-wait
- Added version-surface checker: check:8.0.0:versions
- Full verify chain includes both M8 focused check and 8.0.0 version surfaces.
