# live-logs

Live observations, acceptance evidence, and claim logs for the SwarmSim
Strategy Autobuyer project.

---

## Start here: Books

The Books in `books/` are the primary reading layer. Read a book, not the
raw files, unless you need payload-level verification of a specific claim.

| Book | Topic | When to open it |
|------|-------|-----------------|
| `books/BOOK-01-base-mechanics-and-claims.md` | Base mechanics and claims | Before changing planner logic or claim verdicts |
| `books/BOOK-02-energy-house-of-mirrors-and-lab.md` | Energy, abilities, Laboratory | Before touching energy/ability logic or Lab captures |
| `books/BOOK-03-verification-history-and-artifacts.md` | Verification history and artifact map | Before claiming a version is verified |
| `books/BOOK-04-strategy-intelligence-findings.md` | Strategy Intelligence findings | Before running or interpreting SA0–SA9 results |

---

## Active files in this folder

### Source observation logs (referenced by Books 01–03)

```text
2026-07-09-clean-start-game-observation.md
2026-07-09-clicked-mechanics-progression.md
2026-07-10-0.10.1-energy-support-counterfactual.md
2026-07-10-energy-support-counterfactual-0.10.1.json
2026-07-10-0.12.1-first-real-save-laboratory-result.md
2026-07-10-0.12.1-live-hom-runtime-forensics.md
2026-07-10-0.12.1-live-house-of-mirrors-cast.md
2026-07-10-0.12.2-live-hom-effective-count-capture-analysis.md
2026-07-10-base-game-claims-crosscheck.md
```

### Current 0.12.3 acceptance evidence

```text
live-real-save-0.12.3-effective-count.json
live-real-save-0.12.3-effective-count.md
live-real-save-0.12.3-effective-count-mature-save-2026-07-10.json
live-real-save-0.12.3-effective-count-mature-save-2026-07-10.md
live-real-save-post-hom-capture-run-2026-07-10.json
live-real-save-post-hom-capture-run-2026-07-10.md
```

### Verification SHA records

```text
verification-0.12.2-exact-implementation-sha.json
verification-0.12.2-exact-implementation-sha.md
verification-0.12.3-exact-implementation-sha.json
verification-0.12.3-exact-implementation-sha.md
```

### Screenshots

```text
assets/
```

---

## Archive

`archive/` contains raw browser-export artifacts from versions 0.10.0
through 0.12.3. These have been distilled into Books 01–03 and are kept
only as forensic evidence for historical verification records.

Do not use archive files as a source for new work. Read `archive/README.md`
for the file index.

---

## Routing rules for new findings

Use these rules every time a new observation, run result, or export arrives.

### Observed mechanical fact (new game behavior or claim)

1. Add a compact fact block to the relevant dated source log, or create a new
   one if the topic is clearly different.
2. If the fact changes a book conclusion, update the relevant book.
3. Do not create a new file just to record a single data point that already
   fits an existing log.

Fact block template:

```md
## Fact: <short claim>
- Status: CONFIRMED | PARTIAL | REJECTED
- Scope: <script/scenario/version/window>
- Evidence: <payload fields, scenario id/cycle, or direct observation>
- Why this is factual: <1 sentence>
- Implication: <1 sentence, optional>
```

### Strategy Audit scenario result (SA0-xx etc.)

1. Raw runner JSON and Markdown go into `docs/test-data/strategy-audit/`.
2. Distilled finding with classification goes into
   `books/BOOK-04-strategy-intelligence-findings.md`.
3. Do not paste full runner output into this root folder.

### New version acceptance evidence

1. File named `live-real-save-<version>-<topic>-<date>.<ext>` in this root.
2. Update BOOK-03 with the verdict and SHA.
3. Move the previous version's files to `archive/` only when a newer
   version's evidence has been formally accepted.

### New verification SHA record

1. File named `verification-<version>-exact-implementation-sha.<ext>` here.
2. These files are never moved to archive — they are the forensic chain.

### Raw large payload export (not yet analyzed)

1. Place in `docs/test-data/<version>-<topic>/`.
2. Add an index entry in that folder's README if one exists.
3. Only add to `docs/live-logs/` after analysis produces a compact fact.

---

## Naming conventions

```text
YYYY-MM-DD-<version>-<short-description>.md   ← observation log
live-real-save-<version>-<topic>-<date>.md    ← acceptance evidence
verification-<version>-exact-implementation-sha.md  ← SHA record
```
