# Git Verification Protocol

Status: mandatory repository process for implementation and formal verification work.

This protocol makes GitHub the reconstructable source of truth. It separates implementation, exact-SHA verification, generated evidence, and final reporting.

## Scope

Use this protocol for runtime or strategy changes, versioned fixes, verifier/scenario changes, formal release verification, and any task ending in a VERIFIED or equivalent acceptance claim.

A documentation-only edit does not require a separate evidence commit unless formal verification is explicitly requested.

## Definitions

### Implementation commit

The immutable commit containing completed product code plus all authored test, verifier, fixture, version, release-note, and build-input changes required to reproduce verification.

Final generated evidence from the acceptance run must not be mixed into this commit.

### Pure check

A command intended to evaluate the checkout without modifying tracked files.

### Evidence generator

A command that intentionally rewrites tracked JSON, CSV, Markdown, screenshots, summaries, hashes, timestamps, or other generated evidence.

A command is classified by what it does, not by its name. A command named `verify` may be an evidence generator.

### Evidence allowlist

The exact paths a declared evidence generator is expected to create or rewrite. The list must be known before execution from verifier source, package scripts, or the active work order.

### Evidence commit

A separate commit created only after the complete suite passes against the exact implementation SHA. It contains only allowlisted generated evidence and a provenance record.

### Verification worktree

A separate Git worktree checked out at the exact implementation SHA. It isolates verification from a dirty primary workspace and from later commits already present on `origin/main`.

## Core rule

The exact implementation tree being tested matters. The current tip of `origin/main` does not have to equal the implementation SHA when later documentation, process, or other commits already exist.

Never reset, rewind, or force-push `main` merely to make `origin/main` equal an older implementation SHA.

## Mandatory sequence

### 1. Start implementation from synchronized Git state

Before implementation begins:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Requirements:

- `HEAD` equals `origin/main`
- working tree is clean
- branch, push, HEAD, and status are read from Git, never invented

### 2. Complete and push the implementation

Finish all authored product, test, verifier, fixture, version, release-note, and build-input changes.

Before committing:

- build the canonical userscript when required
- include generated runtime/product files that are part of the product
- include verifier source and static fixtures needed to reproduce tests
- exclude final generated evidence from the acceptance run

Create and push the implementation commit. Record:

```text
IMPLEMENTATION_SHA=<full 40-character SHA>
IMPLEMENTATION_TREE_SHA=<full tree SHA>
```

Do not amend, rebase, force-push, or otherwise rewrite this commit after formal verification starts. A correction creates a new implementation commit and restarts verification.

### 3. Choose the correct verification mode

#### Mode A: immediate verification

Use this only when current `origin/main` still equals `IMPLEMENTATION_SHA` and a clean checkout can be used safely.

#### Mode B: historical/exact-SHA verification

Use this whenever:

- `origin/main` has advanced after the implementation commit
- the primary workspace is dirty
- the process documentation was added after the implementation commit
- another task is using the primary checkout

Mode B is not a failure. It is the normal safe method for auditing an older immutable commit.

### 4. Create an isolated verification worktree

From any checkout of the repository, without cleaning or modifying an unknown dirty workspace:

```bash
git fetch origin
git cat-file -e <IMPLEMENTATION_SHA>^{commit}
git worktree add --detach ../SwarmSim-verify-<shortsha> <IMPLEMENTATION_SHA>
cd ../SwarmSim-verify-<shortsha>
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short --untracked-files=no
```

Hard gates inside the verification worktree:

- `HEAD` equals `IMPLEMENTATION_SHA`
- tree SHA equals `IMPLEMENTATION_TREE_SHA`
- no tracked changes exist

`origin/main` may be newer. Record its current SHA, but do not require equality with the historical implementation SHA.

The current process document may not exist inside an older implementation checkout. That is expected. Read the protocol from current `origin/main`, then execute tests inside the exact-SHA worktree.

### 5. Keep dependencies and temporary output out of proof status

Dependency installation may create `node_modules/` in the verification worktree. It is transient, not evidence.

Prefer a repository ignore rule. For an older checkout that predates the ignore rule, use the worktree/repository-local exclude mechanism or explicitly evaluate tracked cleanliness with:

```bash
git status --short --untracked-files=no
```

Do not use destructive cleanup commands against the primary workspace. Do not treat known transient dependency directories as authored repository changes.

### 6. Record provenance before testing

Inside the verification worktree, record:

```bash
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse origin/main
node --version
npm --version
```

When supported, pass the full implementation SHA to the verifier, for example through `GIT_COMMIT=<IMPLEMENTATION_SHA>` using syntax appropriate to the shell.

Evidence containing `Commit: unknown` is incomplete provenance and cannot independently support final acceptance.

### 7. Classify every command before execution

Declare each required command as exactly one of:

```text
PURE CHECK
EVIDENCE GENERATOR
```

For every evidence generator, list the exact evidence allowlist before running it.

### 8. Run commands separately and capture results

For every command, record:

- exact command
- exit code
- raw final summary
- `git rev-parse HEAD`
- `git status --short --untracked-files=no`

After a pure check:

- tracked working tree must remain clean
- any tracked modification is a hard stop

After an evidence generator:

- tracked changes are allowed only in the predeclared evidence allowlist
- timestamps, normalized drift, snapshot hashes, experiment hashes, Markdown, CSV, JSON, and Copy Summary changes are allowed when expected
- runtime code, verifier code, fixtures, package files, configuration, release notes, or other non-allowlisted changes are a hard stop
- a real product/build change means the implementation commit was incomplete and a new implementation commit is required

Do not stop merely because an evidence generator changed its declared evidence files. Do stop for any change outside the allowlist.

Never silently restore unexpected changes and continue. First report and classify them.

### 9. Complete the full suite

Run every command required by:

- `AGENTS.md`
- `package.json`
- the active work order
- every relevant versioned verifier for the changed subsystem

Do not create an evidence commit after only a partial passing suite.

If evidence files are rewritten multiple times, only outputs from the final complete passing run may be committed.

### 10. Inspect the final verification diff

Inside the verification worktree:

```bash
git status --short --untracked-files=no
git diff --stat
git diff --name-only
git diff --check
```

Hard gate:

- every tracked change is allowlisted generated evidence
- no product, test, verifier, fixture, configuration, package, or release-note source changed
- generated evidence identifies the exact implementation SHA and relevant hashes

### 11. Preserve outputs outside the verification worktree

Copy only the approved allowlisted evidence outputs and the captured command/provenance log to a temporary directory outside all Git worktrees.

Do not commit from the detached verification worktree.

### 12. Create a clean evidence worktree from current main

Create a second clean worktree based on current `origin/main`:

```bash
git fetch origin
git worktree add -b evidence/exact-sha-<shortsha> ../SwarmSim-evidence-<shortsha> origin/main
cd ../SwarmSim-evidence-<shortsha>
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Copy the approved evidence files from the temporary directory into this evidence worktree. Add a provenance record containing at minimum:

- exact implementation SHA
- implementation tree SHA
- current base SHA used for the evidence commit
- every command and exit code
- raw summaries
- Node and npm versions
- evidence allowlist
- confirmation that tests ran in the detached exact-SHA verification worktree before the evidence commit

### 13. Create and push the evidence commit

Before committing:

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
```

Requirements:

- only approved evidence/provenance files changed
- no implementation, verifier, fixture, package, configuration, or unrelated documentation changed

Commit and push normally:

```bash
git add <approved evidence and provenance paths>
git commit -m "Add exact-SHA verification evidence"
git push origin HEAD:main
```

Never force-push.

The reconstructable history may contain later docs/process commits between implementation and evidence:

```text
<implementation SHA>  immutable implementation
<later commits>       optional docs/process/other commits
<evidence SHA>        evidence generated against implementation SHA
```

The evidence must explicitly name the implementation SHA it verifies.

### 14. Final synchronization gate

In the evidence worktree after push:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status --short
git show --stat --oneline HEAD
```

Final reporting is permitted only when:

- evidence-worktree `HEAD` equals `origin/main`
- evidence worktree is clean
- evidence commit changes only approved evidence/provenance files
- evidence names the exact implementation SHA
- full suite results and exit codes are recorded

The state of an unrelated older primary workspace must be reported separately if mentioned, but it does not invalidate proof produced in clean isolated worktrees.

### 15. Remove temporary worktrees only after proof is secure

After evidence is pushed and final SHAs are recorded:

```bash
git worktree remove ../SwarmSim-verify-<shortsha>
git worktree remove ../SwarmSim-evidence-<shortsha>
```

Do not remove a worktree containing unpreserved evidence or unexpected changes.

## Reporting rule

Do not issue a formal final verdict from:

- an unknown implementation SHA
- tests run before the implementation commit existed
- a partial suite
- unexpected non-allowlisted changes
- evidence mixed into the implementation commit
- an unpushed evidence commit
- a dirty evidence worktree

Intermediate status is allowed, but must be labeled intermediate and must not use formal acceptance language.

The final report must distinguish:

```text
Implementation SHA:
Implementation tree SHA:
Verification worktree HEAD:
origin/main observed during verification:
Evidence base SHA:
Evidence SHA:
Final origin/main:
Evidence-worktree status:
Commands run:
Exit codes:
Evidence files:
```

## Core principle

Commit and push the product first. Verify that exact immutable commit in an isolated worktree. Then place only the generated evidence and provenance on top of current `origin/main` in a separate evidence commit. Never rewind `main` just to verify history.