# Test-vs-Code Dispute Protocol (v6.2)

## 1. Context & Purpose
Because Senior Dev cannot modify tests and QA cannot modify source code, an erroneous expectation or invalid mock written by QA could cause a deadlock where Dev can never achieve green.

## 2. Triggering a Dispute
If Senior Dev demonstrates that a test cannot pass due to an error in the test itself:
1. Dev logs a dispute in `.agent/tasks/<task_id>/disputes.md`:
   ```markdown
   ## Dispute DISP-01
   - **Test File:** `tests/auth.test.ts:42`
   - **Contract Reference:** `paths.contract_globs:15` or `uac.md:UAC-2`
   - **Dev Argument:** Test expects `status: 400` when input is valid, contradicting the contract specification that returns `status: 200`.
   - **Evidence:** Concrete diff between contract definition and test assertion.
   ```
2. Dev halts implementation and signals the Manager. (Dev is strictly forbidden from modifying test files directly).

## 3. Tech Lead Arbitration
1. Manager invokes `Tech Lead` (Model: `'pro'`) to arbitrate the dispute using `uac.md` and contracts as the single source of truth.
2. Tech Lead evaluates the claim and issues one of three verdicts in `disputes.md`:
   - **Verdict A (Test Flawed):**
     * QA is dispatched to fix the test defect. (QA is exempted from the frozen-test diff check).
     * The corrected test is red-checked against `base_commit` (temporarily stashing Dev's edits if necessary to ensure valid red status on unmodified code).
     * The Manager deletes the old tag and re-tags:
       ```bash
       git tag -d tests-frozen-<task_id>
       git tag tests-frozen-<task_id>
       ```
     * Senior Dev resumes implementation.
   - **Verdict B (Implementation Flawed):**
     * Tech Lead rejects the dispute with concrete file/line evidence.
     * Dev is commanded to revise the production code to conform to the test.
   - **Verdict C (UAC or Contract Ambiguous):**
     * If the requirement itself is ambiguous or in conflict, Tech Lead triggers `AMEND_CONTRACT` or escalates to `ESCALATE_TO_USER` for human resolution.
3. **Cap:** 2 rounds (`loops.test_dispute.cap: 2`). Unresolved disputes escalate immediately to `ESCALATE_TO_USER`.
