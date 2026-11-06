---
description: Re-scan changed source files and update DIAGRAM.md with fresh function data and rich duty descriptions.
---
# Goals
Refresh the architectural diagram by re-scanning only changed source files, generating LLM-written duty descriptions, and updating `DIAGRAM.md` efficiently — without touching the diagram if nothing changed.

# Instructions

## Step 0 — Ask User Permission
**Before doing anything**, ask the user:
> "I will re-scan your source files and update `DIAGRAM.md`. Do you want to proceed?"
Stop here if the user declines.

## Step 1 — Locate Scanner & Cache
- Find the existing scanner script in `.antigravity/` (e.g., `scanner.js`, `scanner.py`).
- Load `.antigravity/cache.json` to get the list of previously scanned files and their `lastScanned` timestamps.
- **Fallback**: If the scanner or cache is missing, run `/create_function_diagram` instead.

## Step 2 — Detect Changed Source Files
Compare each source code file's last-modified time (or content hash) against the `lastScanned` timestamp in `cache.json`.
- **Only re-scan files that have changed** (new, modified, or deleted source files).
- Ignore non-code files: `.md`, `.json`, `.txt`, `.env`, config files, workflow files, the scanner script itself, and `DIAGRAM.md`.
- If **no source files have changed**, print: "No source code changes detected. DIAGRAM.md is already up to date." and stop — do NOT regenerate DIAGRAM.md.

## Step 3 — STRICTLY Native Execution
Execute the scanner using only the project's native runtime (e.g., `node .antigravity/scanner.js`). Do not call external runtimes (e.g., no `python` in a Node.js project).
The scanner output is saved to `.antigravity/scan_result.json`.

## Step 4 — Generate Rich Duty Descriptions for Changed Functions
For each function in changed files (new functions or functions whose line ranges have shifted):
1. Use `startLine` and `endLine` from the scan result to read **only** that function's source lines via `view_file` with `StartLine`/`EndLine`. Do NOT read the entire file.
2. Write a concise plain-English description of what the function does. The description MUST:
   - Be specific — never use a generic category label ("Core/Helper Logic", "Data Access") as the sole description.
   - Describe purpose, inputs/outputs, and any notable behavior or edge cases.
   - Be one sentence minimum, two sentences maximum.
3. Update the function's `duty` field in the cache.
4. Preserve unchanged functions' existing `duty` descriptions from cache — do not re-read or re-describe them.

## Step 5 — Update Diagram
Rebuild `DIAGRAM.md` using the merged data (updated functions from scan + preserved data for unchanged functions) and `cache.json` (`scannerEnv` field), following the **mandatory 4-section template**:

```
# Project Function Diagram

This diagram represents the functional structure of the project, including function definitions, parameters, and dependency relationships.

## Project Environment
- **Primary Language**: [e.g., Node.js, Python, Go]
- **Execution Environment**: [e.g., Docker container `<container_name>`, Local device, Host]
- **Additional Info**: [Any other necessary context for running the project]

```mermaid
classDiagram
    class file_name_js {
        +functionName(param1, param2)
        +anotherFunction(param)
    }
    class other_file_js {
        +someFunction()
    }

    file_name_js --> other_file_js : imports
\`\`\`

## Function Details

### filename.js
- [functionName(param1, param2)](file:///absolute/path/to/filename.js#L<start>-L<end>): Plain-English description of what this function does, its inputs/outputs, and any notable behavior.

### other_file.js
- [someFunction()](file:///absolute/path/to/other_file.js#L<start>-L<end>): Plain-English description.
```

### Template Rules
- **Section 1**: `# Project Function Diagram` heading + one summary sentence.
- **Section 2**: A `## Project Environment` section detailing the primary language and execution environment (derive execution info from `scannerEnv` in `.antigravity/cache.json`).
- **Section 3**: `classDiagram` Mermaid block — one `class` per file, `+functionName(params)` per function, dependency arrows `module_a --> module_b : imports`.
- **Section 4**: `## Function Details` — one `### filename.js` per file, each function as a bullet with absolute path + line range link and its rich duty description.
- **MANDATORY**: All links MUST have line range fragments `#L<start>-L<end>`.
- **FORBIDDEN**: Generic labels like "Core/Helper Logic" or "Data Access" MUST NOT be the sole duty description.

## Step 6 — Sync Cache
Write `.antigravity/cache.json` updating entries for changed/new functions and removing entries for deleted functions. Preserve all unchanged entries. Update `lastScanned` timestamps for re-scanned files.
