# Agent Selection, Presets & Absorption Rules (v6.2)

## 1. Agent Groups
| Group | Agent | Role & Duty |
| :--- | :--- | :--- |
| **Required** | `Senior Dev` | **Code Author:** Implementation planning (`dev_plan_r<N>.md`) & production code. NEVER writes tests. |
| **Required** | `QA` | **Test Engineer:** Test planning (`test_plan_r<N>.md`), test authoring, red-check. NEVER writes production code. |
| **Required** | `Tech Lead` | **Devil's Advocate:** Architecture review, blocker evidence verification, dispute arbitrator. |
| **Optional** | `Researcher` | **Reconnaissance:** External technology research or deep codebase root-cause investigation. |
| **Always On** | `Manager` | **Dispatcher & Guard:** Host session coordinator, state tracking, git diff guard. NEVER inspects code. |

## 2. Team Configurations
| Configuration | Active Agents | Description |
| :--- | :--- | :--- |
| **`Standard Team`** | Senior Dev, Tech Lead, QA | Default for all bugfixes, features, and refactors. If an investigation is needed, Senior Dev investigates with Web Search enabled. Strict TDD red-to-green. |
| **`Full Team`** | Senior Dev, Tech Lead, QA + Researcher | For tasks requiring deep technology evaluation, external package audits, or multi-round research. |
| **`Investigation Only`** | Researcher + Tech Lead (or Dev + Tech Lead) | Pure root-cause analysis (`root_cause_r1.md`) and Tech Lead audit (`review_investigation_r1.md`), zero repository code modifications. |

## 3. Absorption Rules (When Researcher is Absent)
Because `Senior Dev`, `Tech Lead`, and `QA` form the non-negotiable core, **neither Senior Dev nor QA can ever be skipped or absorb each other's duties**. Senior Dev NEVER writes tests, and QA NEVER writes production code.

| Skipped Agent | Covered By | Mandatory Invariant Rules | What the User Loses |
| :--- | :--- | :--- | :--- |
| **`Researcher`** | `Senior Dev` | Senior Dev investigates root cause and writes `root_cause_r1.md`. **Senior Dev receives Web Search access** during this phase to look up documentation, known library bugs, and error traces. Senior Dev is strictly read-only on the repository and records symptom, reproduction input, and observed vs expected behavior (Dev NEVER writes test plans; QA designs tests). Tech Lead independently audits the findings. | Multi-round third-party package evaluations (new package adoption requires `DEP_REQUEST` to add Researcher). |

## 4. Researcher Operational Modes (When Enabled)
When enabled, the Researcher operates in one of two modes:
1. **`Investigator` Mode (Bugfix, Internal Feature, Refactor):**
   - Codebase analysis, runtime error traces, framework documentation, and public issue trackers.
   - Web Search: **ENABLED** for researching error signatures, runtime exceptions, official API docs, and public bug/issue trackers.
   - Tools: search_web, read_url, grep, LSP, `git log -S`, `git blame`, error log inspection.
   - Deliverable: `root_cause_r1.md` (root cause, blast radius, reproduction input, symptom, observed vs expected behavior).
2. **`Tech Evaluator` Mode (New or Upgraded Dependency):**
   - Web search enabled, scoped to the approved library/topic.
   - Deliverable: `research_r<N>.md` with ROI table, necessity check (< 50 LOC native), license, and CVE audit.


## 5. Agent Selection via Explicit User Confirmation (No Keyword Guessing)
- **Zero Automatic Guessing:** The Manager MUST NOT attempt to deduce the team based on keyword regexes. Automatic keyword matching causes misclassifications.
- **Direct Consultation:** In Phase 2, the Manager confirms agent configuration with the user via `ask_question`. `Senior Dev`, `Tech Lead`, and `QA` are always active for code modifications; the only toggle is whether to include `Researcher`.

## 6. Interactive Selection Modal
Manager invokes `ask_question` with options:
1. "Standard Team (Senior Dev + Tech Lead + QA) [Recommended: Dev investigates with Web Search if needed; strict TDD]"
2. "Full Team (Senior Dev + Tech Lead + QA + Researcher) [Recommended for third-party package surveys or deep research]"
3. "Investigation Only (Root cause diagnosis and Tech Lead verification; no code modifications)"

## 7. Lifecycle Rules
- **Single Spawn Gate & Conversation Reuse:** Once the team configuration is confirmed in Phase 2, the subagents are spawned via `invoke_subagent` **exactly once**. Their `conversationId`s are stored in `memory.json.subagents`. All subsequent phases, reviews, and loops reuse these exact conversations via `send_message`. Spawning redundant subagents for already-active roles is strictly forbidden.
- Selection is **locked** at `USER_PLAN_APPROVAL`. Later changes require explicit user re-approval.
- Adding Researcher mid-task is allowed (e.g., when Dev triggers `DEP_REQUEST` for an external package). Log to `events.log`.
- Removing an agent after its first phase has started is strictly forbidden.
- Any attempt to disable Senior Dev, Tech Lead, or QA on a code modification task is rejected.
- For `Investigation Only` tasks, upon completion of the Tech Lead audit, the task reaches `DONE_INVESTIGATION` or the user may explicitly upgrade to `Standard Team` to proceed with implementation.

## 8. Model Tiering Specification (Cost & Token Efficiency)
To prevent token waste and reduce operational costs without sacrificing quality:
- **`Tech Lead` (Devil's Advocate):** MUST use `Model: "pro"`. Deep reasoning, architectural rigor, and regression detection require the most capable model.
- **`Senior Dev` (Code Author):** Defaults to `Model: "flash"`. Fast, accurate for well-defined implementations and file edits. If entering `FIX_LOOP` or if the task involves complex cross-module refactoring, Manager may escalate Senior Dev to `Model: "pro"`.
- **`QA Engineer` (Test Engineer):** Uses `Model: "flash"`. Unit test generation, assertion writing, and test runner execution are high-precision, low-cost tasks optimal for Flash.
- **`Researcher` (Reconnaissance):** Uses `Model: "flash"`. Information retrieval, search queries, and documentation extraction.

## 9. Direct Profile Injection (Zero File-Search Overhead)
- **Direct Role & Efficiency Injection:** When calling `invoke_subagent` in Phase 2, inject a concise, self-contained summary of the agent's role, boundaries, and execution efficiency principles directly into their `Prompt`:
  * **Private Orchestrator State:** `memory.json` is strictly private to the Manager. Subagents MUST NOT read or modify `memory.json`. Subagents work strictly from explicit input artifacts (e.g. `uac.md`) and repository files.
  * **Container-First Execution (Docker Sandbox):** The host OS is an isolated controller (runs only `git`, `docker`, `docker compose`). NEVER execute language runtimes or binaries (`python`, `pytest`, `node`, `npm`, `ffmpeg`, compilers) directly on the host OS. All scratch probes, test executions, and builds MUST run inside Docker containers (e.g. via `docker run --rm -v ${PWD}:/app -w /app ...` or `docker compose run --rm ...`).
  * **Rule of $\ge 3$:** Batch 3+ exploratory checks into a single scratch script at `.agent/tasks/<task_id>/scratch_probe.<ext>` with isolated `try/catch` per case, executed inside a container.
  * **Non-Interactive & No Polling:** Always use non-interactive / CI flags and `WaitMsBeforeAsync: 10000` for test/container runs. Never poll `manage_task(status)` in a loop; stop calling tools and rely on reactive wakeup for background tasks.
- **Immediate Task Execution:** Subagents proceed immediately to their technical tasks using the instructions and context in their prompt, without searching for external profile markdown files or rules.



