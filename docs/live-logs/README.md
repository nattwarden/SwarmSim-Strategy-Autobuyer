# Live-log policy

Books are the source of truth for mechanics, Laboratory conclusions,
verification history, and strategy findings. This folder keeps only the
current claim-level evidence needed to verify the active Laboratory result.

## Retained evidence

```text
browser-test-0.12.3-laboratory-effective-count.json
browser-test-0.12.3-laboratory-effective-count.md
```

Historical observation logs, screenshots, browser exports, and verification
captures are distilled into `docs/BOOK-01` through `docs/BOOK-05` and are not
retained as raw files. New runs should produce temporary output; only a
compact, book-level conclusion belongs in Git.

The active Laboratory verifier may write temporary files while it runs. Those
outputs are evidence-generation artifacts, not repository knowledge.
