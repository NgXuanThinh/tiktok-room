---
description: Analyzes project architecture to generate a Mermaid.js diagram.
---
# Goals
Identify the primary language, scan for function definitions/parameters, and produce a visual map with rich, plain-English duty descriptions for every function.

# Instructions

## Step 0 — Ask User Permission
**Before doing anything else**, ask the user:
> "I will scan the project source files and generate `DIAGRAM.md`. This will read your source code. Do you want to proceed?"
Stop here if the user declines.

## Step 1 — Environmental Audit
Detect the project's primary technical stack (Node.js, Python, Go, etc.).

## Step 2 — STRICTLY Enforce Native Runtimes
Do NOT introduce external dependencies (e.g., do not use Python in a Node.js project).

## Step 3 — Generate & Run Scanner
Create a native scanner script (e.g., `scanner.js` for Node, `scanner.py` for Python) and save it to `.antigravity/scanner.<ext>`.
The scanner MUST detect `name`, `parameters`, `startLine`, and `endLine` for each function, plus the imports/dependencies between files.
Execute the scanner using only the native runtime (e.g., `node .antigravity/scanner.js`).
Store the raw JSON output in `.antigravity/scan_result.json`.

## Step 4 — Generate Rich Duty Descriptions (LLM Step — Most Important)
For each function found by the scanner:
1. Use the `startLine` and `endLine` from the scan result to read **only** that function's source lines using `view_file` with `StartLine`/`EndLine`. Do NOT read the entire file.
2. After reading the function body, write a concise, plain-English description of what it does. The description must:
   - Be specific to this function — never use a generic category label like "Core/Helper Logic" or "Data Access" alone.
   - Explain the function's purpose, inputs, outputs, and any important side-effects or edge cases (e.g., throws on division by zero, returns cached results if available).
   - Be one sentence minimum, two sentences maximum.
3. Store the description as the function's `duty` in `.antigravity/cache.json`.

## Step 5 — Render Diagram
Process the scan JSON, duty cache, and `cache.json` (`scannerEnv` field) to generate `DIAGRAM.md` following the **mandatory 4-section template** below.

### Mandatory DIAGRAM.md Template

```
# Project Function Diagram

This diagram represents the functional structure of the project, including function definitions, parameters, and dependency relationships.

## Project Environment
- **Primary Language**: [e.g., Node.js, Python, Go]
- **Execution Environment**: [e.g., Docker container `<container_name>`, Local device, Host]
- **Additional Info**: [Any other necessary context for running the project]

\`\`\`mermaid
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
- [anotherFunction(param)](file:///absolute/path/to/filename.js#L<start>-L<end>): Plain-English description.

### other_file.js
- [someFunction()](file:///absolute/path/to/other_file.js#L<start>-L<end>): Plain-English description.
```

### Rules for the Template
- **Section 1**: A `# Project Function Diagram` heading followed by exactly one summary sentence.
- **Section 2**: A `## Project Environment` section listing the primary language and execution environment (derive execution info from `scannerEnv` in `.antigravity/cache.json`).
- **Section 3**: A `classDiagram` Mermaid block. Each source file is a `class` node (use underscores for dots, e.g. `index_js`). List each exported/top-level function with `+functionName(params)` syntax. Add dependency arrows `module_a --> module_b : imports` to show which files import which.
- **Section 4**: A `## Function Details` section with one `### filename.js` subsection per file. Each function is a bullet with a markdown link using the exact absolute path and line range (`#L<start>-L<end>`), followed by its rich plain-English duty description.
- **MANDATORY**: All file links MUST include line range fragments: `[func_name](file:///absolute/path#L<start>-L<end>)`.
- **FORBIDDEN**: Do NOT use generic category labels ("Core/Helper Logic", "Data Access", "Initialization") as the sole description. These may appear as supplementary tags only.

## Step 6 — Save Cache
Write `.antigravity/cache.json` with an entry per function containing: `file`, `name`, `params`, `startLine`, `endLine`, `duty` (the plain-English description), and `lastScanned` timestamp.
