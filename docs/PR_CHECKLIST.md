# PR Checklist

Use this checklist for every PR, especially AI-assisted changes.

## Summary

- What changed:
- Why this is narrow:
- Files changed:

## Safety preserved

- `autoCastAbilities` remains false by default.
- `autoAscend` remains false by default.
- Clone Larvae is not auto-cast by default.
- House of Mirrors is not auto-cast by default.
- Nightbug/Bat auto-buy defaults were not introduced.
- Nexus/energy protection remains enabled.
- Smart Mode does not use aggressive buyMax behavior by default.

## Validation

Run:

```bash
node scripts/validate-repo-guardrails.js
```

Result:

```text
Repo guardrail validation passed.
```

## Intentionally not changed

- Gameplay strategy outside the named issue:
- Version markers:
- Release notes:
- Historical/reference documents:
