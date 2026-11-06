# Git Branch & Per-Role Mechanical Boundary Guard Rule (v6.3)

## 1. Objective
Deterministically enforce file boundaries and prevent hallucinations across subagent roles using native Git CLI.

## 2. Per-Turn Guard & Commit Protocol
Prior to the first subagent turn, if uncommitted files were included, the Manager commits them as `base: pre-task workspace state` on `agent/<task_id>` and records `base_commit = $(git rev-parse HEAD)`.

### A. Read-Only Turns (Researcher, Tech Lead, Senior Dev during `INVESTIGATION`)
- Subagents in these states write strictly to `.agent/tasks/<task_id>/` artifacts.
- The Manager **does not execute git commit** (avoiding empty commits).
- **Single Chained Verification Command (Prints ONLY 'OK' or 'VIOLATION'):**
  - **Windows PowerShell:**
    ```powershell
    $dirty = (git status --porcelain ":(exclude).agent/tasks/"); if ($dirty) { "VIOLATION: repo modified: $dirty" } else { "OK" }
    ```
  - **POSIX sh / macOS / Linux:**
    ```sh
    DIRTY=$(git status --porcelain ":(exclude).agent/tasks/"); [ -z "$DIRTY" ] && echo OK || echo "VIOLATION: repo modified: $DIRTY"
    ```

### B. Modifying Turns (Senior Dev `IMPLEMENTATION`/`CONTRACT`, QA `TEST_AUTHORING`, or `FIX` turns)
Run a single chained command that performs the commit, verifies no extra commits occurred, and checks that forbidden pathspecs were not touched. The command prints ONLY `OK` or `VIOLATION <paths>`.

> [!TIP]
> Execute as a single-line command (semicolon-separated). Do **NOT** wrap in PowerShell here-strings (`@" ... "@`), which are error-prone due to indentation sensitivity.

**Windows PowerShell Examples:**
- **For Senior Dev (forbidden: tests):**
  ```powershell
  $H0 = (git rev-parse HEAD); git add -A; git commit -q --allow-empty -m "dev:impl:r1"; if ((git rev-parse HEAD~1) -ne $H0) { "VIOLATION: extra commits" } else { $bad = (git diff --name-only HEAD~1 HEAD -- ":(glob)tests/**"); if ($bad) { "VIOLATION: $bad" } else { "OK" } }
  ```
- **For QA Engineer (forbidden: source code):**
  ```powershell
  $H0 = (git rev-parse HEAD); git add -A; git commit -q --allow-empty -m "qa:tests:r1"; if ((git rev-parse HEAD~1) -ne $H0) { "VIOLATION: extra commits" } else { $bad = (git diff --name-only HEAD~1 HEAD -- ":(glob)src/**"); if ($bad) { "VIOLATION: $bad" } else { "OK" } }
  ```

**POSIX sh / macOS / Linux Examples:**
- **For Senior Dev:**
  ```sh
  H0=$(git rev-parse HEAD); git add -A; git commit -q --allow-empty -m "dev:impl:r1"; [ "$(git rev-parse HEAD~1)" = "$H0" ] || echo "VIOLATION: extra commits"; BAD=$(git diff --name-only HEAD~1 HEAD -- ':(glob)tests/**'); [ -z "$BAD" ] && echo OK || echo "VIOLATION: $BAD"
  ```
- **For QA Engineer:**
  ```sh
  H0=$(git rev-parse HEAD); git add -A; git commit -q --allow-empty -m "qa:tests:r1"; [ "$(git rev-parse HEAD~1)" = "$H0" ] || echo "VIOLATION: extra commits"; BAD=$(git diff --name-only HEAD~1 HEAD -- ':(glob)src/**'); [ -z "$BAD" ] && echo OK || echo "VIOLATION: $BAD"
  ```

- If the output is `OK`, Manager immediately advances to the next step with **zero context bloat**.
- If output starts with `VIOLATION:`, Manager triggers automatic rollback per Section 7.

## 3. Role Path Matrix
| Role | Permitted Repository Modifications | Strictly Forbidden Paths |
| :--- | :--- | :--- |
| **Senior Dev** (`IMPLEMENTATION`, `FIX`) | Files matching `paths.src_globs` | `paths.test_globs`, `paths.fixtures_globs`, configs, manifests, CI |
| **Senior Dev** (`CONTRACT`) | `paths.contract_globs` and skeleton stubs | `paths.test_globs`, manifests, production logic |
| **Senior Dev** (`INVESTIGATION` when Researcher OFF) | Read-only on repo (writes `root_cause_r1.md` only) | Any tracked repository file |
| **QA** (`TEST_AUTHORING`, `FIX`) | Files matching `paths.test_globs` and `paths.fixtures_globs` | `paths.src_globs`, `paths.contract_globs`, manifests, configs |
| **Researcher / Tech Lead** | Read-only on repo | Any tracked repository file |
| **Manager** | Manifests and lockfiles in `DEP_SETUP` only | Application code in `src/` or `tests/` |

## 4. Subagent Artifact Allow-List (`.agent/tasks/<task_id>/`)
To prevent state tampering, subagents may only create/modify authorized artifacts:
- **Senior Dev:** `dev_plan_r<N>.md`, `root_cause_r1.md` (when Researcher OFF), `contract_r1.md`, `disputes.md`.
- **QA:** `test_plan_r<N>.md`, `generated_harness/**`, `reports/**`.
- **Tech Lead:** `review_planning_r<N>.md`, `review_investigation_r<N>.md`, `review_code_r<N>.md`, `review_research_r<N>.md`, `disputes.md`.
- **Researcher:** `root_cause_r1.md`, `research_r<N>.md`.
- **Manager-Only (Subagents Forbidden):** `memory.json`, `events.log`, `env_profile.md`, `uac.md`.

## 5. Mechanical Freeze Checks
After each turn, Manager executes diff checks against frozen git tags:
- `git diff --name-only deps-frozen-<task_id> HEAD`: Limited to manifest and lockfile paths, MUST be empty.
- `git diff --name-only contract-frozen-<task_id> HEAD`: Limited to `paths.contract_globs`, MUST be empty.
- `git diff --name-only tests-frozen-<task_id> HEAD`: Limited to `paths.test_globs`.
  * MUST be empty during Senior Dev `IMPLEMENTATION`.
  * **Exemption:** QA turns during `FIX_LOOP` (for test defects) or `TEST_DISPUTE` Verdict A may modify tests, followed by red-check verification and re-tagging `tests-frozen-<task_id>`.

## 6. Anti-Hallucination Reference Check
At `PLAN_TRIAGE` and `CODE_REVIEW`, the Manager categorizes plan file targets into two distinct groups:
1. **`Modify` (Existing Files):**
   ```bash
   git ls-files --error-unmatch <file_path>
   ```
   Must succeed (file must exist in git). Every cited symbol to be modified must exist via `git grep -n "<symbol_name>"`.
2. **`Create` (New Files):**
   ```bash
   git ls-files --error-unmatch <file_path>
   ```
   Must fail with non-zero exit code (ensures no collision or accidental overwrite of existing modules).
3. Any plan violating these existence/collision checks receives an **automatic BLOCKER** with the exact CLI error output.

## 7. Violation Rollback
1. Manager rejects the turn and logs the violation in `events.log`.
2. Manager resets the commit on the task branch:
   ```bash
   git reset --hard HEAD~1
   ```
3. Manager re-dispatches the subagent with the exact violating paths and rule violated. A second violation in the same loop consumes one round.
