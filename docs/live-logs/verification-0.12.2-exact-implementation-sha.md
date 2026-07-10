# Exact SHA Verification Provenance

- Verified implementation SHA: `21622c11e0fd1ae781f718143ce701ce0a13cc4f`
- Implementation tree SHA: `c7ca38f21fdc271b7da93842895e4c6d7e3420ec`
- Evidence worktree base SHA: `3b36749fb72216d791429fdfdf7b943eaf524d2a`
- Origin/main observed during verification: `3b36749fb72216d791429fdfdf7b943eaf524d2a`
- Verification ran in detached worktree: `C:\Users\info\OneDrive\Dokument\SwarmSim-verify-21622c1`
- Primary dirty workspace used for verification: `false`
- Tests ran before evidence commit: `true`

## Environment

- Node: `v24.14.0`
- npm: `11.9.0`
- GIT_COMMIT used for evidence generators: `21622c11e0fd1ae781f718143ce701ce0a13cc4f`

## Evidence allowlist

### 0.12.0 Phase 1

- `docs/live-logs/browser-test-0.12.0-laboratory-phase1.json`
- `docs/live-logs/browser-test-0.12.0-laboratory-phase1.md`
- `docs/test-data/0.12.0-laboratory/example-result.json`
- `docs/test-data/0.12.0-laboratory/example-result.csv`
- `docs/test-data/0.12.0-laboratory/example-result.md`

### 0.12.2 live runner

- `docs/live-logs/browser-test-0.12.2-laboratory-live-runner-final.json`
- `docs/live-logs/browser-test-0.12.2-laboratory-live-runner-final.md`
- `docs/test-data/0.12.2-laboratory/example-copy-summary.txt`
- `docs/test-data/0.12.2-laboratory/example-live-result.csv`
- `docs/test-data/0.12.2-laboratory/example-live-result.json`
- `docs/test-data/0.12.2-laboratory/example-live-result.md`

## Command log

1. `git fetch origin; git show origin/main:docs/GIT_VERIFICATION_PROTOCOL.md`
   - Exit code: `0`
   - Raw summary: protocol read from `origin/main`

2. `git cat-file -e 21622c11e0fd1ae781f718143ce701ce0a13cc4f^{commit}; git worktree add --detach ..\\SwarmSim-verify-21622c1 21622c11e0fd1ae781f718143ce701ce0a13cc4f`
   - Exit code: `0` for worktree add after an argument-parsing mistake in the first shell attempt
   - Raw summary: detached verification worktree created at exact implementation SHA

3. `git rev-parse --verify HEAD; git rev-parse --verify "HEAD^{tree}"; git rev-parse origin/main; git status --short --untracked-files=no`
   - Exit code: `0`
   - Raw summary: `21622c11e0fd1ae781f718143ce701ce0a13cc4f`, `c7ca38f21fdc271b7da93842895e4c6d7e3420ec`, `3b36749fb72216d791429fdfdf7b943eaf524d2a`, clean

4. `npm install`
   - Exit code: `0`
   - Raw summary: `added 2 packages, and audited 3 packages in 1s; found 0 vulnerabilities`

5. `git rev-parse HEAD; git rev-parse HEAD^{tree}; node --version; npm --version`
   - Exit code: `0`
   - Raw summary: `21622c11e0fd1ae781f718143ce701ce0a13cc4f`, `c7ca38f21fdc271b7da93842895e4c6d7e3420ec`, `v24.14.0`, `11.9.0`

6. `npm run build`
   - Exit code: `0`
   - Raw summary: `Canonical userscript already up to date.`

7. `npm run verify`
   - Exit code: `0`
   - Raw summary: `Build check passed`; `0.12.2 LABORATORY LIVE RUNNER VERIFIED`; `Repo guardrail validation passed`

8. `npm run verify:0.12.0:laboratory:phase1`
   - Exit code: `0`
   - Raw summary: `0.12.0 LABORATORY PHASE 1 VERIFIED`; `runCount: 6`; `hashes snapshotA/B/C and experiment recorded`

9. `npm run verify:0.12.1:laboratory:live`
   - Exit code: `0`
   - Raw summary: `0.12.2 LABORATORY LIVE RUNNER VERIFIED`

10. `npm run verify:0.12.2:laboratory:hom-resolver`
    - Exit code: `0`
    - Raw summary: `0.12.2 LABORATORY LIVE RUNNER VERIFIED`

11. `git diff --check`
    - Exit code: `0`
    - Raw summary: warnings only about CRLF normalization; no whitespace or patch-format errors

12. `git fetch origin; git worktree add -b evidence/exact-sha-21622c1 ..\\SwarmSim-evidence-21622c1 origin/main; git rev-parse HEAD; git rev-parse origin/main; git status --short`
    - Exit code: `0`
    - Raw summary: evidence worktree created; HEAD and origin/main both `3b36749fb72216d791429fdfdf7b943eaf524d2a`

## Final evidence notes

- Detached verification worktree used the exact implementation SHA `21622c11e0fd1ae781f718143ce701ce0a13cc4f`.
- The primary dirty workspace was not used for verification.
- Evidence files were generated after tests passed and before the evidence commit.
- Only allowlisted evidence files and this provenance record are intended for the evidence commit.