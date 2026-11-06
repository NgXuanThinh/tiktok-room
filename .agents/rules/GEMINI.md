# Project Mapping Rules
- [Trigger: New Workspace] If `DIAGRAM.md` is missing, suggest: "I see this project isn't mapped. Should I run /create_function_diagram?"
- [Trigger: Post-Task] After any file modification, check whether any **source code files** were changed (e.g., `.js`, `.ts`, `.py`, `.go`, `.java`, `.cs`, `.cpp`, `.c`, `.rb`, `.rs`, `.swift`, `.kt` — NOT `.md`, `.json`, `.txt`, `.env`, config files, or workflow files). **Only if source code files changed**, ask the user: "Source files were modified. Should I update DIAGRAM.md?" and execute `/update_diagram` **only if the user approves**. Do NOT regenerate DIAGRAM.md if only non-code files (docs, configs, markdown) were changed.

# Orientation & Research Protocol
- **Diagram-First**: You MUST check and read `DIAGRAM.md` before performing ANY other research on the codebase.
- **Precision Viewing — STRICT**: When you need to understand a function, you MUST use the exact line range links from `DIAGRAM.md` (e.g., `#L10-L25`) to read ONLY that function's lines. Do NOT read an entire file. Do NOT open a file without first identifying the exact line range from DIAGRAM.md.
- **No Whole-File Reads**: Reading an entire source file is FORBIDDEN if DIAGRAM.md exists and contains line-range links for that file. Use `view_file` with `StartLine` and `EndLine` set to the specific range.
- **Architectural Reference**: Use `DIAGRAM.md` as the primary source for understanding project structure, function relationships, and codebase entry points.
- **Trust "Duties"**: Rely on the plain-English "Duty" descriptions in the diagram's `## Function Details` section to understand what each function does. Only view a function's source lines when you need implementation-level detail beyond the description.

# Constraints
- Always use Mermaid.js for architecture diagrams to ensure compatibility with the Artifact View.
- Never run the scanner or regenerate DIAGRAM.md without explicit user approval.

# Scanner Execution Environment
- **First-run prompt**: The very first time `scanner.<ext>` is about to be executed in a project, ask the user:
  > "Where should I run the scanner? Options: (1) Local device [default] — (2) Docker container. Press Enter to use local."
- **Default**: If the user does not respond or presses Enter, execute on the **local device** using the native runtime (e.g., `node .antigravity/scanner.js`).
- **Docker option**: If the user chooses Docker, ask for the container name or ID:
  > "Enter the Docker container name or ID to run the scanner in:"
  Then execute via: `docker exec <container> <runtime> .antigravity/scanner.<ext>`
- **Persist the choice**: Save the chosen execution target (`local` or `docker:<container>`) in `.antigravity/cache.json` under the key `"scannerEnv"`. On all subsequent runs, reuse this saved preference without prompting again.
- **Re-configure**: The user can change the execution environment at any time by deleting the `"scannerEnv"` key from `cache.json` or by explicitly asking: "Change scanner environment."
