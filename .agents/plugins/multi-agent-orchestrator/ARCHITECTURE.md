# Multi-Agent Software Engineering Orchestrator (v6.2)
## Complete Architecture & Operational Workflow

---

## 1. High-Level System Architecture

The orchestrator operates as a **Host-Native Antigravity Plugin** using git-branch isolation, mechanical boundary guards, and strict separation of concerns across specialized subagents.

```mermaid
graph TB
    subgraph HostSession["Host Session (Orchestrator Core)"]
        User(["👤 User"])
        Manager["👑 Manager (Coordinator / Dispatcher)"]
        Memory[("💾 memory.json & events.log")]
        GitGuard["🛡️ Git Diff Guard & Tag Freezing"]
    end

    subgraph CoreTeam["Mandatory Core Team (Always Active for Code Changes)"]
        Lead["🧠 Tech Lead (Adversarial Critic / Pro Model)"]
        Dev["💻 Senior Dev (Code Author / Implementation)"]
        QA["🧪 QA Engineer (Test Author / Red-Check)"]
    end

    subgraph OptionalSubagent["Optional Extension"]
        Researcher["🔍 Researcher (Investigator / Tech Evaluator)"]
    end

    User <-->|"1. /multi-agent-orchestrator\n2. Requirements Approval\n3. Agent Selection\n4. Plan Approval\n5. Final Approval"| Manager
    Manager <--> Memory
    Manager --> GitGuard
    Manager -->|"1. invoke_subagent (Spawn once in Phase 2)\n2. send_message (Reused across Phases 3-10)"| Lead
    Manager -->|"1. invoke_subagent (Spawn once in Phase 2)\n2. send_message (Reused across Phases 3-10)"| Dev
    Manager -->|"1. invoke_subagent (Spawn once in Phase 2)\n2. send_message (Reused across Phases 3-10)"| QA
    Manager -->|"invoke_subagent / send_message (Optional)"| Researcher
```


---

## 2. Strict Role Boundary Matrix

| Role | Classification | Core Responsibility | Permitted File Boundary | Forbidden Actions |
| :--- | :--- | :--- | :--- | :--- |
| **`Manager`** | Host Session | Pipeline coordination, state tracking, git guards, baseline test runner. | Manifests in `DEP_SETUP` only; `.agent/tasks/**`. | **STRICTLY FORBIDDEN** from viewing application source code directly, debugging, or writing code. |
| **`Senior Dev`** | **Mandatory** | Implementation planning (`dev_plan_r<N>.md`), interface contracts, production code. Assumes codebase investigation (with Web Search access) if Researcher is absent. | `paths.src_globs`, interface stubs. | **STRICTLY FORBIDDEN from writing tests or test plans.** Senior Dev is NOT a tester. |
| **`QA Engineer`** | **Mandatory** | Test planning (`test_plan_r<N>.md`), test fixtures, regression tests, red-check execution. | `paths.test_globs`, test harnesses, `paths.fixtures_globs`. | **STRICTLY FORBIDDEN from writing or modifying production code** in `paths.src_globs`. |
| **`Tech Lead`** | **Mandatory** | Adversarial critic, dual-plan audit, investigation audit, dispute arbitrator. | `.agent/tasks/**` (Review artifacts only). | **STRICTLY FORBIDDEN** from modifying repository code files. All blockers require file:line evidence. |
| **`Researcher`** | **Optional** | Internal codebase root-cause analysis (Investigator) or external package survey (Evaluator). | `.agent/tasks/**` (Research artifacts only). | Web access enabled for error signatures/docs/packages (treated as untrusted data). Never modifies code or writes tests. |

---

## 3. End-to-End Execution Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant Mgr as 👑 Manager
    participant Res as 🔍 Researcher (Opt)
    participant Lead as 🧠 Tech Lead
    participant QA as 🧪 QA Engineer
    participant Dev as 💻 Senior Dev

    %% Phase 0: Requirements Verification
    rect rgb(240, 248, 255)
    Note over User, Mgr: PHASE 0: REQUIREMENTS VERIFICATION (Zero Tools Run)
    User->>Mgr: /multi-agent-orchestrator <request>
    Mgr->>User: Restates Problem, Expected Deliverables, Scope, Clarifying Questions
    User->>Mgr: Explicit Confirmation ("Yes, proceed")
    end

    %% Phase 1 & 2: Preflight & Agent Selection
    rect rgb(255, 250, 240)
    Note over Mgr, Lead: PHASE 1 & 2: PRE-FLIGHT & AGENT SELECTION
    Mgr->>Mgr: Non-blocking git check & stack detection (.git/info/exclude)
    Mgr->>User: Interactive Agent Selection Modal (ask_question)
    User->>Mgr: Confirms Agent Configuration (Standard Team, Full Team, or Investigation Only)
    Mgr->>Mgr: Create branch agent/<task_id> & freeze uac.md
    end

    %% Phase 3: Research / Investigation
    rect rgb(245, 255, 250)
    Note over Mgr, Lead: PHASE 3: RESEARCH & INVESTIGATION
    alt Researcher Enabled (Full Team)
        Mgr->>Res: Dispatch Researcher (Codebase trace / blame, Web Access enabled)
        Res-->>Mgr: root_cause_r1.md
    else Researcher Disabled (Standard Team)
        Mgr->>Dev: Dispatch Senior Dev with Web Access (Error search, bug tracker, codebase)
        Dev-->>Mgr: root_cause_r1.md
    end

    Mgr->>Lead: Dispatch Tech Lead to audit investigation
    Lead-->>Mgr: review_investigation_r1.md (Evidence verified)
    Mgr->>User: Investigation & Architecture Briefing (ask_question)
    User->>Mgr: Confirms technical direction & architecture
    end


    %% Phase 6 & 7: Planning Loop
    rect rgb(255, 245, 245)
    Note over Mgr, QA: PHASE 6 & 7: PLANNING LOOP (Cap: 3 Rounds)
    Mgr->>Dev: Draft implementation plan (dev_plan_r1.md)
    Dev-->>Mgr: Code architecture & functions
    Mgr->>QA: Draft test plan (test_plan_r1.md)
    QA-->>Mgr: UAC test matrix & edge cases
    Mgr->>Lead: Adversarial dual-plan review
    Lead-->>Mgr: review_planning_r1.md (Pass or Blockers with evidence)
    Mgr->>User: USER_PLAN_APPROVAL (Presents plans, hashes, critiques)
    User->>Mgr: Plan Approved
    end

    %% Phase 8: Test Authoring & Red Check
    rect rgb(248, 248, 255)
    Note over Mgr, QA: PHASE 8: TEST AUTHORING & RED-CHECK (QA Only)
    Mgr->>QA: Author tests matching test_globs
    QA->>QA: Execute red-check against baseline (Regression test MUST fail)
    QA-->>Mgr: Valid red state confirmed
    Mgr->>Mgr: Git tag tests-frozen-<task_id> (Tests Locked)
    end

    %% Phase 9: Implementation
    rect rgb(240, 255, 240)
    Note over Mgr, Dev: PHASE 9: IMPLEMENTATION (Senior Dev Only)
    Mgr->>Dev: Implement code strictly in src_globs to make tests pass
    Dev->>Dev: Run build/compiler check (Zero syntax errors)
    Dev->>Dev: Run frozen test suite until green
    Dev->>Dev: Mutation sanity check (verify tests are active)
    Dev-->>Mgr: Green implementation commit
    end

    %% Phase 10: Review & Gates
    rect rgb(255, 250, 245)
    Note over User, Lead: PHASE 10: CODE REVIEW & HUMAN APPROVAL
    Mgr->>Lead: Review complete git diff
    Lead-->>Mgr: review_code_r1.md (APPROVED)
    Mgr->>Mgr: Run local test_cmd & lint_cmd against baseline
    Mgr->>User: Present final diff summary, test results & artifact hashes
    User->>Mgr: Human Approval ("Ship / Merge")
    end
```

---

## 4. State Machine & Exception Loops

```mermaid
stateDiagram-v2
    [*] --> PHASE_0_REQUIREMENTS_VERIFICATION: /multi-agent-orchestrator

    PHASE_0_REQUIREMENTS_VERIFICATION --> USER_REQUIREMENTS_CONFIRMATION
    USER_REQUIREMENTS_CONFIRMATION --> PHASE_1_PREFLIGHT: User Confirms
    USER_REQUIREMENTS_CONFIRMATION --> PHASE_0_REQUIREMENTS_VERIFICATION: User Modifies Scope

    PHASE_1_PREFLIGHT --> PHASE_2_SELECT_AGENTS: Non-blocking check
    PHASE_2_SELECT_AGENTS --> PHASE_3_RESEARCH: Interactive Modal Confirmed

    state PHASE_3_RESEARCH {
        [*] --> INVESTIGATOR_ROUTE
        [*] --> TECH_EVALUATOR_ROUTE
        INVESTIGATOR_ROUTE --> ROOT_CAUSE_DRAFT
        ROOT_CAUSE_DRAFT --> TECH_LEAD_INVESTIGATION_AUDIT
        TECH_LEAD_INVESTIGATION_AUDIT --> [*]
    }

    PHASE_3_RESEARCH --> PLANNING_LOOP: Proceed to Code Changes
    PHASE_3_RESEARCH --> DONE: Investigation Only Task

    state PLANNING_LOOP {
        [*] --> DEV_PLAN_DRAFT
        DEV_PLAN_DRAFT --> QA_PLAN_DRAFT
        QA_PLAN_DRAFT --> TECH_LEAD_PLAN_REVIEW
        TECH_LEAD_PLAN_REVIEW --> PLAN_TRIAGE
        PLAN_TRIAGE --> DEV_PLAN_DRAFT: Blocker with Evidence (Cap 3)
        PLAN_TRIAGE --> USER_PLAN_APPROVAL: Cleared
    }

    USER_PLAN_APPROVAL --> TEST_AUTHORING: Approved
    TEST_AUTHORING --> RED_CHECK: QA writes tests
    RED_CHECK --> TEST_FREEZE: Valid assertion failure
    TEST_FREEZE --> IMPLEMENTATION: tests-frozen tag

    state IMPLEMENTATION {
        [*] --> DEV_CODING
        DEV_CODING --> SYNTAX_AND_BUILD_SANITY
        SYNTAX_AND_BUILD_SANITY --> GREEN_TEST_EXECUTION
        GREEN_TEST_EXECUTION --> MUTATION_CHECK
    }

    IMPLEMENTATION --> TEST_DISPUTE: Dev claims test contradicts UAC (Cap 2)
    TEST_DISPUTE --> IMPLEMENTATION: Tech Lead arbitrates

    IMPLEMENTATION --> CODE_REVIEW: Dev commits green code
    CODE_REVIEW --> LOCAL_TEST_GATE: Tech Lead approves diff
    CODE_REVIEW --> FIX_LOOP: Code defect found (Cap 3)

    LOCAL_TEST_GATE --> HUMAN_APPROVAL: Tests & linter pass baseline
    LOCAL_TEST_GATE --> FIX_LOOP: Baseline regression

    FIX_LOOP --> IMPLEMENTATION
    HUMAN_APPROVAL --> DONE: User approves
    HUMAN_APPROVAL --> FIX_LOOP: User requests revision
    FIX_LOOP --> ESCALATE_TO_USER: Loop Cap Exceeded
    TEST_DISPUTE --> ESCALATE_TO_USER: Loop Cap Exceeded
    ESCALATE_TO_USER --> [*]
    DONE --> [*]
```

---

## 5. Mechanical Safety Guarantees

1. **Zero Premature Action Gate (Phase 0):** Zero tools, zero git operations, and zero subagents are invoked before the user explicitly reviews and confirms the restated requirements.
2. **Attribution & Rollback (Git Guard):** Every turn produces a discrete commit (`git commit -m "<role>:<state>:r<round>"`). Diff boundaries are checked against globs; any boundary violation triggers an immediate `git reset --hard HEAD~1` rollback.
3. **No Code / Test Overlap:** Senior Dev cannot modify test globs; QA cannot modify src globs.
4. **Evidence-Backed Criticism:** The Tech Lead cannot block a plan or diff on speculation; every `BLOCKER` must cite concrete `file:line`, CVE IDs, or reproduction commands.
5. **Two-Stage Investigation:** Every root-cause report drafted by the Researcher (or Senior Dev with Web Access when Researcher is OFF) must be independently verified and audited by the Tech Lead before being accepted.
6. **Single Spawn & Cognitive Continuity:** Subagents are spawned once in Phase 2; all subsequent phases, reviews, and test runs reuse the existing subagent conversations via `send_message` to eliminate context amnesia and excessive token consumption.
7. **Pre-Modal Briefing Invariant:** The Manager is strictly forbidden from triggering `ask_question` with empty or incomplete content; full markdown explanations and comparison tables must always accompany approval dialogs.
8. **CLI State Automation:** All state machine transitions, SHA1 artifact hashing, and event logs are performed atomically via `transition_state.ps1`, eliminating manual LLM JSON editing turns.
9. **Model Tiering Architecture:** Tech Lead operates on `Model: 'pro'` for adversarial criticism, while QA and Senior Dev run on `Model: 'flash'` to maximize speed and cost efficiency.
10. **Direct Profile Injection (Zero Discovery Bloat):** Subagent roles are injected directly during Phase 2 spawn with an explicit anti-discovery constraint, preventing subagents from wasting turns searching files for profiles.
11. **Single Chained Guard Per Turn (Zero Noise):** Executes commit, diff, and boundary checks in one single chained command per turn, returning ONLY `OK` or `VIOLATION` to eliminate 5–8 turns and avoid terminal bloat.
12. **Header-Only Artifact Inspection & 10-Line Output Cap:** Manager reads only frontmatter headers (`verdict`, `blocker_ids`, `hash`), while subagents return 10 lines or fewer via `send_message`, preventing context compounding.
13. **Narrowed Interface Change & Lite Path:** Adding internal/private functions is strictly `interface_change = false`, completely skipping `CONTRACT_PHASE`. Scoped tasks use compact dual plans.


