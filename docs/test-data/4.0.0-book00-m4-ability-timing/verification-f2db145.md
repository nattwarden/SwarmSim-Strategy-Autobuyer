# SwarmSim Strategy Autobuyer 4.0.0 — BOOK-00 M4 verification

Verification date: 2026-07-13

## Immutable implementation identity

- Implementation commit: `f2db145e368f77e1b348a6cb70e1f8ef2f6a0a90`
- Implementation tree: `7fb02b16cc6ac79fe45ef6ec3c8eac65ff542b1e`
- Verified remote ref: `origin/codex/m4-energy-ability-advisor`
- Remote ref at verification: `f2db145e368f77e1b348a6cb70e1f8ef2f6a0a90`
- Working tree before and after the suite: clean

## Command classification and results

The exact implementation commit was checked out in its isolated M4 worktree.

| Command | Classification | Declared write scope | Exit |
| --- | --- | --- | ---: |
| `node scripts/validate-repo-guardrails.js` | pure check | none | 0 |
| `npm run build` | generator/check | canonical `src/SwarmSim-Strategy-Autobuyer.user.js` only | 0 |
| `npm run verify` | pure check suite | none; Laboratory invoked with `--check` | 0 |
| `git diff --check` | pure check | none | 0 |

`npm run build` reported that the canonical userscript was already up to date
and produced no diff. No evidence or implementation path changed during the
suite.

The `npm run verify` suite passed:

- canonical assembly check;
- Laboratory 0.12.3 effective-count check with no evidence written;
- `4.0.0` version-surface check;
- UI shell check;
- source-verified Laboratory Phase 2A math;
- unified purchase evaluator;
- BOOK-00 M3 Energy comparison and exact bounded Energy execution acceptance;
- BOOK-00 M4 Energy ability timing advisor acceptance;
- repository guardrails.

The retained M3 exact execution scenario bought the canonical Lepidoptera x5,
matched the selected execution identity, verified reset, and detected no state
leakage.

## M4 acceptance evidence

The focused M4 acceptance proves that:

- WAIT and all five supported ability branches use the same snapshot identity
  and active milestone;
- Clone Larvae, House of Mirrors, and a source-verified Meat Rush can each win
  an honest aligned deterministic state;
- WAIT/save wins when casting would violate the Energy reserve;
- the best non-cast alternative, projected gain, opportunity cost, confidence,
  passive-only post-action policy, and reconsider condition are explicit;
- the input snapshot is not mutated;
- Swarmwarp is excluded;
- `mode` remains `advisor-only` and `executionAuthority` remains `false`.

## Narrow change and preserved safety

The implementation adds the first M4 cast-versus-save advisor slice and changes
the release version to `4.0.0` under the milestone-aligned version policy. It
does not grant ability execution, add formulas beyond the already
source-verified Rush/Clone/House-of-Mirrors inputs, or alter purchase authority.

Preserved hard defaults and boundaries:

- ability auto-cast remains disabled;
- Energy Support Broker auto-cast remains disabled;
- Clone Larvae and House of Mirrors remain manual recommendations only;
- Nightbug/Bat auto-buy and auto-Ascension remain disabled;
- Nexus and Energy protection remain enabled;
- Laboratory remains gated, read-only, and simulation-only;
- no downstream purchase or follow-up cast is invented by the M4 projection.

Intentionally not changed:

- historical M3 `0.14.1` commits, tags, release notes, and evidence;
- Swarmwarp timing, pending source verification;
- UI artwork being developed independently in the primary worktree;
- Ascension, Mutagen, Nightbug, Bat, or broader strategy-score tuning.
