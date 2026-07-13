# Test-data policy

Books are the source of truth for strategy, mechanics, Laboratory, and
Strategy Audit findings. Raw historical runs are deliberately not retained in
the repository.

The only committed fixture in this directory is the scenario definition used
by the active Laboratory verifier:

```text
0.11.7-scenarios/scenario-definitions.json
```

Verification commands may create temporary result files while they run. Those
outputs are evidence-generation artifacts and are not part of the knowledge
base. Distilled conclusions belong in BOOK-01 through BOOK-05.
