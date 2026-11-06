# Multi-Agent Software Engineering Orchestrator (Architecture v6.3)

A production-grade, host-native **Google Antigravity** plugin that orchestrates specialized subagents (`Senior Dev`, `Tech Lead / Principal Architect`, `QA Engineer`, and `Technical Researcher`) to implement, refactor, and debug software through test-driven development, containerized sandboxing, adversarial peer reviews, and human approval gates.

---

## 🚀 Key Highlights & Architectural Invariants

1. **4 Mandatory Human-in-the-Loop Gates (Zero-Bypass Policy):**
   - **Gate 1 (Phase 0 - Requirements Alignment):** Manager parses raw user input into an objective, 4-field scope contract rendered directly into visible chat. No tools or files are touched until approved.
   - **Gate 2 (Phase 3 - Investigation & Macro-Architecture):** Whether bugfix or greenfield, Tech Lead's verified diagnosis and architectural blueprint are presented to the User for approval before detailed file-by-file planning begins.
   - **Gate 3 (Phase 7 - Dual Plan Sign-Off):** Senior Dev's implementation plan and QA Engineer's test matrix are rendered side-by-side in chat for user sign-off.
   - **Gate 4 (Phase 10 - Final Code Review & Merge):** Complete git diff and test pass reports are audited by Tech Lead and approved by User before task completion.

2. **Tech Lead as Principal Architect & Adversarial Critic:**
   - Powered by high-reasoning model tier (`Model: pro`).
   - For broad/greenfield systems (with `Researcher`), Tech Lead actively scrutinizes design to enforce optimal, decoupled, production-grade patterns (e.g. separating API ingress from compute-heavy workers, failure isolation, and concurrency resilience) rather than naive monolithic shortcuts.
   - For scoped bugfixes, enforces an evidence-backed standard for `BLOCKER`s (concrete logic defects, contract breaches, or syntax errors) to prevent pedantic nitpicking or artificial round-trips.

3. **Container-First Execution (Docker Sandbox Invariant):**
   - Host machine (Windows/Linux) is treated as a clean control plane running only `git` and `docker`.
   - Never runs language runtimes (`python`, `pytest`, `node`, `npm`, `ffmpeg`, compilers) directly on the host OS. All scratch probes, test runs, and application builds execute cleanly inside Docker containers (`docker run` / `docker compose`).

4. **Private Orchestrator Memory Boundary:**
   - `.agent/tasks/<task_id>/memory.json` is strictly private to the Host Manager and atomic CLI scripts (`transition_state.ps1`). Subagents are strictly forbidden from reading or parsing `memory.json`, eliminating scope leaks and saving significant context tokens.

5. **Cognitive Continuity & Single Spawn Gate:**
   - Core subagents are spawned once in Phase 2 and reused across all subsequent phases via `send_message`, eliminating context amnesia and token waste.

---

## 📦 Installation Guide

The plugin can be installed either for a **single project** or **machine-wide (globally)**.

### Option 1: Install into a Target Project (Recommended)

Installs the plugin bundle directly into `.agents\plugins\multi-agent-orchestrator` inside your target project, and automatically ensures `.agent/tasks/` is excluded in `.gitignore`.

#### Using PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -TargetProject "D:\Path\To\YourProject"
```

#### Using Windows Command Prompt:
```cmd
.\install.cmd -TargetProject "D:\Path\To\YourProject"
```

---

### Option 2: Install Globally (Machine-Wide)

Installs the plugin to `~/.gemini/config/plugins/multi-agent-orchestrator`, making `/multi-agent-orchestrator` available across **all** Antigravity workspaces on your machine.

#### Using PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Global
```

#### Using Windows Command Prompt:
```cmd
.\install.cmd -Global
```

---

### Verifying Installation

In your target project's Antigravity IDE:
1. Open the Chat / Prompt input.
2. Type `/` and confirm that `/multi-agent-orchestrator` appears in the autocomplete suggestion list.

### Uninstalling the Plugin

To completely remove the plugin:
```powershell
# For project-scoped:
powershell -ExecutionPolicy Bypass -File .\install.ps1 -TargetProject "D:\Path\To\YourProject" -Uninstall

# For global:
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Global -Uninstall
```

---

## 🛠️ How to Use

Invoke the orchestrator directly in the Antigravity Chat UI:

```text
/multi-agent-orchestrator <Describe your task, feature, refactor, or bugfix>
```

### Typical Workflow Execution:
```text
Phase 0: REQUIREMENTS_VERIFICATION  --> Restates understanding; User approves in chat
Phase 1: PRE-FLIGHT & BASELINE      --> Clean branch agent/<task_id>; checks existing baseline tests
Phase 2: SELECT_AGENTS_AND_UAC      --> User selects team (Standard Team / Full Team); spawns core agents
Phase 3: RESEARCH & INVESTIGATION   --> Researcher/Dev investigates; Tech Lead audits; USER APPROVES
Phase 4: DEP_SETUP & CONTAINER_ENV  --> (Optional) Sets up Dockerfile / docker-compose & dependencies
Phase 5: CONTRACT_PHASE             --> (Optional) Stubs breaking public interfaces if any
Phase 6: PLANNING_LOOP              --> Dev drafts code plan + QA drafts test plan -> Tech Lead reviews
Phase 7: USER_PLAN_APPROVAL         --> Side-by-side Dual Plan comparison rendered; USER APPROVES
Phase 8: TEST_AUTHORING & RED_CHECK --> QA writes regression tests; verifies failure; tags tests-frozen
Phase 9: IMPLEMENTATION             --> Senior Dev writes production code strictly in src/; tests pass
Phase 10: CODE_REVIEW & APPROVAL    --> Tech Lead audits diff; User approves final deliverables
```

---

## 📊 Token Auditing & Measurement Guide

### How Antigravity Records Token Consumption
Antigravity logs every LLM interaction for each agent into JSON Lines files located at:
```text
C:\Users\<Username>\.gemini\antigravity\brain\<conversation-id>\.system_generated\logs\transcript.jsonl
```

Every response turn records 3 key metrics:
- **`input_tokens`**: Uncached prompt tokens sent to the model.
- **`output_tokens`**: Tokens generated by the model (reasoning / thinking + output text / tool calls).
- **`cache_read_tokens`**: Tokens read from Gemini Context Caching (massively reduces latency and cost).

### The Multi-Agent Token Aggregation Principle
In a multi-agent session, the Host Manager spawns **independent Subagents** (`Senior Dev`, `Tech Lead`, `QA`, `Researcher`), each running in its own separate conversation ID.

$$\text{Total Session Tokens} = \text{Host Manager Tokens} + \sum \text{Subagent Tokens}$$

---

### Automated Token Measurement Tool: `get_session_tokens.ps1`

We provide a built-in PowerShell script that automatically inspects the Host Manager transcript, discovers all spawned Subagents, maps their roles, and computes the exact token metrics.

#### Running the Script:
```powershell
powershell -ExecutionPolicy Bypass -File .agents/plugins/multi-agent-orchestrator/skills/multi-agent-orchestrator/scripts/get_session_tokens.ps1 -SessionId "<conversation-id>"
```
*(If running from the repository source folder, the script is located at `.\skills\multi-agent-orchestrator\scripts\get_session_tokens.ps1`).*

#### Where to Find the `<conversation-id>`:
- In the Antigravity Chat UI header or browser URL (`/conversation/<uuid>`).
- Or at the bottom metadata line of any turn response: `Conversation ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

---

### Sample Token Audit Output

Running `get_session_tokens.ps1` produces a clear, formatted breakdown:

```text
========================= MULTI-AGENT SESSION TOKEN REPORT =========================
Target Session ID: 11aa84ca-1abb-42bb-b5a3-8eac31cc2baf
Active Subagents:  4

Role                 ConversationId                       Steps   InputTokens  OutputTokens  CacheReadTokens   TotalTokens
----                 --------------                       -----   -----------  ------------  ---------------   -----------
Host Manager         11aa84ca-1abb-42bb-b5a3-8eac31cc2baf   160     1,814,348       100,879       13,146,979     1,915,227
Tech Lead            016213a8-fa0d-428a-b2c2-e6046187a9fb    57       515,093        48,801        3,562,829       563,894
Senior Dev           5157e207-705f-4b48-b044-0eccf0a284e7    76       637,668        83,991        7,711,097       721,659
QA Engineer          d05cdc25-c905-44f3-ba42-498c2e9b4ab5    38       238,877        39,758        1,990,875       278,635
Technical Researcher 4e3457ca-e199-4042-9b54-444575149213    27       192,196        27,014          640,233       219,210
----------------------------------------------------------------------------------------------------------------------------
GRAND TOTAL INPUT TOKENS:          3,398,182
GRAND TOTAL OUTPUT TOKENS:           300,443
GRAND TOTAL CACHE READ TOKENS:    27,052,013
GRAND TOTAL BILLABLE (IN + OUT):    3,698,625
====================================================================================
```

> [!TIP]
> **Understanding Cache Read Tokens:** In the example above, over **27 million tokens** were read directly from Gemini Context Caching (`CacheReadTokens`). Because cached tokens are served at a tiny fraction of normal input costs and near-instant latency, the multi-turn memory reuse design saves substantial resources.

---

## 📁 Repository Structure

```text
multi-agent-orchestrator/
├── plugin.json                          # Plugin Manifest (v6.3.0)
├── install.ps1                          # PowerShell installer
├── install.cmd                          # CMD installer wrapper
├── README.md                            # Complete Documentation & Token Guide
├── ARCHITECTURE.md                      # Architecture specifications & sequence diagrams
└── skills/
    └── multi-agent-orchestrator/
        ├── SKILL.md                     # Skill Entrypoint & Execution Principles
        ├── scripts/
        │   ├── transition_state.ps1     # Atomic state & artifact hash manager
        │   └── get_session_tokens.ps1   # Multi-agent token auditing utility
        ├── rules/                       # Core orchestration protocols
        │   ├── manager_protocol.md      # 10-Phase State machine & 4 human gates
        │   ├── agent_selection_rule.md  # Team presets & role boundary definitions
        │   ├── git_guard_rule.md        # Branch isolation, git guards, diff checks
        │   ├── memory_schema.md         # Task storage & memory invariants
        │   ├── dynamic_harness_rule.md  # Test discovery & red-check rules
        │   └── evidence_rule.md         # Adversarial evidence standard & anti-friction
        └── profiles/                    # Subagent system prompts
            ├── tech_lead.md             # Tech Lead (Principal Architect & Adversarial Critic)
            ├── senior_dev.md            # Senior Dev (Code Author & Implementer)
            ├── qa.md                    # QA Engineer (Test Author & Acceptance Tester)
            └── researcher.md            # Technical Researcher (Investigator & Evaluator)
```

---

## 📜 License & Acknowledgments
Built for **Google Antigravity** multi-agent development environments. Engineered for rock-solid test-driven development, deterministic state machines, and human-in-the-loop control.
