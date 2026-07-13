# BOOK-00 Milestone 9 - Resource-Scoped Save Locks Foundation

Status: implementation-ready handoff contract; this document adds no runtime
behavior by itself.

Target release: `9.0.0`

Baseline:

- active runtime baseline: `8.1.x` (final accepted SHA must be recorded before
  implementation starts);
- hard safety defaults unchanged from `AGENTS.md`;
- Council UI3 and fixed-window behavior remain required baseline functionality.

## 1. Product outcome

M9 prevents global HOLD lock when only one resource is under a save-window
priority.

When Expansion save-window is active, Territory spend remains protected, but
non-conflicting safe actions that do not spend Territory may still execute.

Player-facing release sentence:

> The bot now protects only the required save-window resource and continues safe
> non-conflicting progression instead of globally stalling.

## 2. Problem M9 closes

Current behavior can still produce repeated HOLD loops where:

- Territory is correctly protected for Expansion;
- advisor-only ability suggestions exist but cannot execute;
- coordinator does not continue with legal non-Territory actions.

This creates avoidable passivity and weakens methodical optimizer behavior.

## 3. Scope

### Included

- resource-scoped lock semantics in coordinator/main-action flow;
- explicit protected-resource identity in Inspector/Council diagnostics;
- focused replay and acceptance checks for Expansion save-window + non-Territory
  continuation;
- preservation of existing payback/reserve/protected-resource guards.

### Excluded

- ability auto-cast execution;
- auto-ascend execution;
- new execution keys;
- Council artwork redesign;
- broader cross-domain scoring redesign.

## 4. Contract rules

### 4.1 Resource-scoped lock

If active save-window protects resource `R`:

- block only actions that spend `R`;
- keep evaluating and executing safe actions that do not spend `R`;
- do not convert `R` protection into global main-lane HOLD unless no safe
  non-conflicting action exists.

### 4.2 Territory/Expansion case

For Expansion save-window:

- Territory spending remains blocked;
- Meat/Larva/Energy actions may proceed when they do not consume protected
  Territory and pass normal guards.

### 4.3 Authority and safety

- `autoCastAbilities` remains default `false`;
- `autoAscend` remains default `false`;
- advisor-only domains remain non-executable;
- reserve/protected-resource/payback gates remain active;
- no new irreversible automation is introduced.

## 5. Observability requirements

Inspector/Council must expose at least:

- active protected resource(s);
- top blocked candidate and blocker reason;
- whether non-conflicting execution path was attempted;
- coordinator remaining-budget reason with resource scope clarity.

## 6. Focused acceptance

Minimum focused groups:

1. `expansion-save-lock-territory-only`
2. `territory-protected-non-territory-buy-allowed`
3. `all-non-territory-unsafe-hold-remains-valid`
4. `advisor-only-authority-preserved`
5. `diagnostics-resource-scope-visible`

## 7. Verification gates

Required command set:

```bash
npm run build
npm run check:book00:m8:false-wait
npm run verify
git diff --check
```

M9-specific focused checker should be added and included in verify when
implementation begins.

## 8. Stop condition

M9 is complete when:

- Expansion save-window blocks Territory spend only;
- at least one replay demonstrates non-Territory safe progression during active
  Territory protection;
- no authority leaks occur;
- focused and full verification pass at exact implementation SHA;
- implementation and evidence are committed separately per protocol.
