# BOOK-00 Milestone 11 - Opt-In Execution for Abilities and Ascension Foundation

Status: implementation-ready handoff contract; this document adds no runtime
behavior by itself.

Target release: `11.0.0`

Baseline:

- accepted M10 implementation/evidence SHAs must be recorded before M11 starts;
- hard safety defaults in `AGENTS.md` remain unchanged;
- advisor-only behavior remains baseline unless explicit player opt-in is active.

## 1. Product outcome

M11 introduces explicit opt-in execution modes for supported abilities and
eligible ascension actions with strict safety, confidence, and observability
contracts.

Player-facing release sentence:

> With explicit opt-in enabled, the bot can execute supported casts and
> ascensions under strict gates while defaults remain safe and advisor-first.

## 2. Problem M11 closes

Current advisor surfaces can identify candidate casts/ascension opportunities,
but players must execute manually even in stable, high-confidence conditions.

M11 adds optional automation without changing default-safe behavior.

## 3. Scope

### Included

- player opt-in toggles for execution modes;
- gated execution path for supported abilities;
- gated execution path for supported ascension conditions;
- explicit execution-denied reasons in Council/Inspector;
- focused acceptance for allow/deny boundaries.

### Excluded

- changing default `autoCastAbilities` from `false`;
- changing default `autoAscend` from `false`;
- unsupported abilities/actions;
- irreversible execution without explicit contract evidence.

## 4. Contract rules

### 4.1 Opt-in requirements

Execution may run only when:

- relevant opt-in mode is explicitly enabled by player config;
- candidate is supported and comparable under current milestone rules;
- confidence and blocker gates pass;
- cooldown/reconsideration gates pass.

### 4.2 Default safety

If opt-in is disabled:

- behavior remains advisor-only for ability and ascension domains.

### 4.3 Denial transparency

When execution is not allowed, diagnostics must state exact denial reason:

- `opt-in disabled`;
- `comparability insufficient`;
- `confidence below threshold`;
- `blocker active`;
- `cooldown/reconsider pending`.

## 5. Observability requirements

Expose at minimum:

- execution-mode state per domain;
- execution allowed/denied reason;
- confidence source;
- reconsider trigger.

## 6. Focused acceptance

Minimum focused groups:

1. `opt-in-disabled-stays-advisor-only`
2. `ability-opt-in-allowed-when-gates-pass`
3. `ability-opt-in-denied-when-gates-fail`
4. `ascension-opt-in-allowed-when-gates-pass`
5. `ascension-opt-in-denied-when-gates-fail`
6. `default-safety-unchanged`

## 7. Verification gates

Required command set:

```bash
npm run build
npm run verify
git diff --check
```

M11-focused checker(s) must be added and included in verify when
implementation begins.

## 8. Stop condition

M11 is complete when:

- opt-in execution works for supported allow paths;
- deny paths remain explicit and safe;
- defaults stay OFF;
- focused and full verification pass at exact implementation SHA;
- implementation and evidence are committed separately per protocol.
