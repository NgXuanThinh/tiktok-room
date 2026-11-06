# Evidence Rule for Tech Lead Critiques (Anti-Sycophancy)

## 1. Objective
Prevent false-positive blocker spam and infinite review loops caused by model hallucination, speculative devil's advocacy, or subjective opinions.

## 2. Mandatory Evidence Standard for `BLOCKER`
Every issue tagged as `BLOCKER` by the Tech Lead MUST cite concrete, verifiable evidence:
1. **Critical Defect (Code or Plan Logic):** Specific deterministic scenario demonstrating an unhandled fatal state, broken control flow, algorithm failure to produce valid output, data corruption, or deadlock.
2. **Security / Vulnerability:** Concrete CVE identifier with official advisory URL, or demonstration of unsafe code execution (`eval`, SQL injection).
3. **Contract Violation:** Exact signature diff proving incompatibility with `paths.contract_globs`.
4. **Vacuous Test:** Demonstration that a test asserts nothing, mocks away core logic, or passes unconditionally.
5. **Direct UAC Violation:** Concrete requirement in `uac.md` that is explicitly contradicted by the plan.
6. **Reference Defect:** Concrete CLI output from `git ls-files --error-unmatch` or `git grep -n` demonstrating that a file or symbol planned for `Modify` does not exist, or a planned `Create` collides with an existing file.

## 3. Scope-Creep vs. Architectural Excellence
- **Feature Scope-Creep (Forbidden):** Inventing new business capabilities, extraneous API endpoints, or unrequested features outside `uac.md` MUST NOT block the plan and is classified as `ADVISORY`.
- **Architectural Rigor & Production Quality (Mandatory):** For broad/greenfield systems (especially when `Researcher` participates), designing for core system resilience—such as decoupling long-running computation from request handling, isolating failure domains, process/thread safety, and clean data contracts—is **NOT scope creep**. It is the Tech Lead's primary responsibility to ensure the architecture is production-grade and optimal.
- When an initial proposal by Researcher/Dev is a fragile monolithic shortcut, the Tech Lead has the authority and duty to establish architectural requirements (e.g. modular decoupling, dedicated workers, clean state interfaces) to ensure high-quality outcomes.

## 4. Automatic Downgrade & Zero Artificial Friction Protocol
When the Manager triages findings from `review_planning_r<N>.md` or `review_investigation_r<N>.md`:
- If an issue is labeled `BLOCKER` but lacks concrete logic/file/CVE/reproduction/CLI evidence, the Manager MUST automatically downgrade it to `LOW_RISK`.
- If zero valid `BLOCKER`s remain after triage, the review is declared passed and the loop exits cleanly.
- If verified `BLOCKER`s remain, the loop counter increments by 1 and the plan routes back for revision.
- **Zero Artificial Friction:** If the plan is logically sound, satisfies requirements, and exhibits no critical flaws, the Tech Lead MUST approve it immediately in Round 1. Raising pedantic blockers on minor stylistic or hypothetical non-issues to force additional rounds is strictly forbidden.
