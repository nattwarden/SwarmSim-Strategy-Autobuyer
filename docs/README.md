# docs — SwarmSim Strategy Autobuyer

## Start here

Four primary references define the current milestone, vision, active strategy
contract, and formal verification process. Read the relevant ones before
changing the project.

| File | What it is |
|------|-----------|
| `strategy/BOOK00_CURRENT_STATUS.md` | Start here — active milestone, checklist, blockers, and exact next action |
| `BOOK-00-vision-goals-and-dreams.md` | Strategic north star — the six questions and whole-economy product vision |
| `SWARMSIM_GAME_MODEL.md` | Active strategy contract — game rules, planner intent, hard safety defaults |
| `GIT_VERIFICATION_PROTOCOL.md` | Mandatory protocol for formal version verification |

---

## Books

Books are the vision and knowledge layer. Read BOOK-00 first for product
direction, then the relevant evidence book before opening lower-level source
material.

| Book | Topic | Read when |
|------|-------|-----------|
| `BOOK-00-vision-goals-and-dreams.md` | Product vision and strategic north star | Before strategy, architecture, or roadmap decisions |
| `BOOK-01-base-mechanics-and-claims.md` | Base mechanics and claims | Before changing planner logic or claim verdicts |
| `BOOK-02-energy-house-of-mirrors-and-lab.md` | Energy, abilities, Laboratory | Before touching energy/ability logic or Lab captures |
| `BOOK-03-verification-history-and-artifacts.md` | Verification history | Before claiming a version is verified; for forensics |
| `BOOK-04-strategy-intelligence-findings.md` | Strategy Intelligence findings | Before running or interpreting SA0–SA9 results |
| `BOOK-05-community-strategy-claims.md` | Community strategy claims | Before using 2015 community guides as bot logic |
| `BOOK-06-council-chamber-ui-and-experience.md` | Council UI and experience vision | Before UI, timeline, visual asset, or presentation-contract work |

### Book rules

BOOK-00 is the durable strategic product vision. Books 01 through 05 contain
**distilled, classified, stable findings** — not raw data, work orders, or
architecture decisions. BOOK-06 is the durable UI and experience vision; its
active delivery material lives under `ui/`.

**Classification labels used in books:**

| Label | Meaning |
|-------|---------|
| CONFIRMED | Verified by our live logs or bot behavior |
| PARTIALLY CONFIRMED | Directionally validated; thresholds not fully measured |
| UNCONFIRMED | Plausible, not yet tested in our context |
| BOT BOUNDARY | Correct human strategy we deliberately do not automate |
| OUTDATED / WRONG | Contradicted by our findings or game model |
| OUT OF SCOPE | Correct claim, pertains to content we have not built yet |
| `expected behavior` | SA finding: planner did the right thing |
| `strategy defect` | SA finding: planner chose a clearly worse action |
| `observability defect` | SA finding: decision unclear or missing from output |
| `testbed defect` | SA finding: harness produced misleading conditions |
| `harness limitation` | SA finding: testbed cannot distinguish the behaviors |
| `inconclusive` | SA finding: insufficient data to classify |

**How to update books:**
- Verify fact → add compact entry to relevant book section with source citation
- SA scenario result → distill the finding directly into BOOK-04; raw run output is temporary and not retained
- Changed conclusion → update existing entry in-place, no duplicate file

**When to create a new book:**
Only when a whole new knowledge domain emerges with at least 3 distinct findings
that fit no existing book. Name it BOOK-06, BOOK-07, etc. and list it here.

---

## Subfolders (working material)

| Folder | What it contains |
|--------|-----------------|
| `strategy/` | Architecture decision records (ADRs), planning docs, specs |
| `live-logs/` | Current claim-level evidence only |
| `test-data/` | Minimal verifier fixture only; raw runs are not retained |
| `prompts/` | Active work orders for implementation agents |
| `release-notes/` | Per-version changelog |
| `process/` | Governance: verification protocol, PR checklist, history, modularization plan |
| `ui/` | Council UI delivery, current status, data contracts, and visual references |

---

## AI agent reading order

Before any code change:

1. `../AGENTS.md` — repo guardrails and hard safety defaults
2. `strategy/BOOK00_CURRENT_STATUS.md` — active milestone and next action
3. `BOOK-00-vision-goals-and-dreams.md` for strategy, architecture, or roadmap work
4. `strategy/BOOK00_PRODUCT_DELIVERY_RUNBOOK.md` for product milestone work
5. `SWARMSIM_GAME_MODEL.md` — active strategy contract
6. Relevant evidence book (BOOK-01 through BOOK-05), or BOOK-06 for UI work
8. Other `strategy/` document if the work requires it
9. `prompts/` work order if one exists for the task
10. `live-logs/` only when current claim-level evidence needs payload verification
11. `test-data/` only when the active verifier needs its fixture

Do not read `live-logs/` or `test-data/` before the books. The books tell you
what the source material already concluded.

## Source-of-truth note

Use `docs/SWARMSIM_GAME_MODEL.md` as the only active game model.

Older dated game model files and indexed AI snapshots are historical context
only. They should not be used as current strategy truth.

Books 01 and 02 contain the distilled empirical context for clean-start
behavior, sacrifice/rebuild mechanics, Faster/Twin distinctions,
Hatchery/Expansion coupling, and military empower/suffix behavior. Open the
retained current evidence only when a verifier needs payload-level support.

## Verification annotation status

The following files include 2026-07-09 verification notes that mark claims as
`CONFIRMED`, `PARTIALLY CONFIRMED`, `HEURISTIC`, or `OPEN`:

```text
SWARMSIM_GAME_MODEL.md
BOOK-01-base-mechanics-and-claims.md
BOOK-02-energy-house-of-mirrors-and-lab.md
../reference/REFERENCE_SwarmSim_reddit_comments_3t0drr_2015.cleaned.txt
```

These notes should guide the next script review. Confirmed notes can be used as
strong evidence. Heuristic/Open notes should not drive automation without more
booked findings or math validation.
