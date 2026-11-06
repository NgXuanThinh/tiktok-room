# Memory Schema & Lifecycle Invariants (v6.2)

## 1. Schema Definition (`.agent/tasks/<task_id>/memory.json`)
The Manager maintains `memory.json` atomically via the helper script `transition_state.ps1` (avoiding repetitive manual LLM file editing and saving over 150,000 tokens):

```json
{
  "task_id": "TASK-202610191030",
  "base_commit": "e5f2a1b",
  "branch": "agent/TASK-202610191030",
  "team": "standard",
  "current_state": "SELECT_AGENTS_AND_UAC",
  "agents": {
    "required": ["senior_dev", "tech_lead", "qa"],
    "enabled_optional": [],
    "disabled_optional": ["researcher"],
    "selection_locked": false
  },
  "subagents": {
    "senior_dev": null,
    "tech_lead": null,
    "qa": null,
    "researcher": null
  },
  "research_mode": "investigator",

  "needs_external_dependency": false,
  "interface_change": false,
  "paths": {
    "src_globs": [":(glob)src/**", ":(exclude,glob)**/*.test.*"],
    "test_globs": [":(glob)tests/**", ":(glob)**/*.test.*"],
    "contract_globs": [":(glob)src/contracts/**", ":(glob)src/interfaces/**"],
    "fixtures_globs": [":(glob)tests/fixtures/**", ":(glob)tests/__mocks__/**"],
    "shared_config_globs": [],
    "manifest_files": ["package.json"]
  },
  "commands": {
    "test_cmd": "npm test",
    "lint_cmd": "npm run lint"
  },
  "baseline": {
    "tests_passing": true,
    "known_failures": [],
    "dirty_files": []
  },
  "loops": {
    "investigation":   { "round": 0, "cap": 1 },
    "research":        { "round": 0, "cap": 3 },
    "planning":        { "round": 0, "cap": 3 },
    "fix":             { "round": 0, "cap": 3 },
    "test_dispute":    { "round": 0, "cap": 2 },
    "amend_contract":  { "round": 0, "cap": 1 },
    "human_rejection": { "round": 0, "cap": 2 }
  },
  "artifacts": {
    "uac": { "path": "uac.md", "hash": "a1b2c3d4..." }
  },
  "tags": [],
  "files_read": [],
  "open_blockers": [],
  "budget": {
    "max_subagent_calls": 25,
    "calls_used": 0,
    "est_tokens_used": 0,
    "started_at": "2026-10-19T10:00:00Z",
    "wall_clock_limit_min": 120
  }
}
```

## 2. Update Invariants
1. **Loop Counters (Strict Monotonicity):**
   - Loop counters are strictly monotonic per loop across the task lifecycle.
   - Initialized to `0` when task memory is created. A counter is **NEVER reset** back to 0 or 1 on state changes or re-entries.
   - Increments exactly once per completed round/review of that loop.
   - When any loop counter reaches its `cap` with unresolved blockers, the pipeline immediately transitions to `ESCALATE_TO_USER`.
2. **Artifact Integrity & Hashing:**
   - Every completed artifact updates `artifacts` with its `git hash-object` value.
   - Any mismatch between an on-disk artifact hash and `memory.json` marks the artifact as tampered or stale.
3. **Artifact Ownership & Protection:**
   - `memory.json` is **strictly Private to the Host Manager**. Subagents (`Senior Dev`, `Tech Lead`, `QA`, `Researcher`) are strictly forbidden from **reading, parsing, or modifying** `memory.json`.
   - `events.log`, `env_profile.md`, and `uac.md` are Manager-governed. Subagents may only read `uac.md` when assigned.
   - Subagents write strictly to their designated allow-list artifacts within `.agent/tasks/<task_id>/`.
4. **Budget Guard:**
   - If `calls_used >= max_subagent_calls` or wall clock time expires, the Manager terminates the loop and transitions to `ESCALATE_TO_USER`.
5. **Event Logging:**
   - Every state transition appends one line to `.agent/tasks/<task_id>/events.log` (`<timestamp> | <from_state> -> <to_state> | <reason>`).
6. **Grounding Trace:**
   - `files_read` records every file path any subagent reports reading, serving as an audit check for reference validation.
9. **Subagent Session Tracking & Reuse:**
   - When core subagents are launched via `invoke_subagent` in Phase 2, their returned `conversationId` strings are recorded in `subagents` (e.g. `subagents.senior_dev = "conv-uuid"`).
   - All subsequent rounds and phases MUST reuse these active conversation IDs via `send_message` rather than invoking new subagents. This maintains cognitive memory, prevents context amnesia, and conserves token budget.
8. **Lazy State Updates (Phase-Gated JSON Updates):**
   - The Manager does NOT update `memory.json` on every internal tool turn.
   - `memory.json` is updated at major Phase gates ONLY (Phase 0, Phase 2, Phase 7, Phase 10).
   - Internal turn logs are appended via native command line appends (`echo ... >> events.log` in POSIX or `Add-Content` in PowerShell) with `git hash-object <file>`, needing zero JSON tool loading overhead.

