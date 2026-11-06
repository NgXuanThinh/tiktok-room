# Dynamic Polyglot Harness & Red-Check Rules (v6.2)

## 1. Test Classification by Tag
QA exclusively authors all tests and must tag each test:
- **`characterization`:** Tests verifying baseline or legacy behavior. **MUST PASS** on unmodified code / skeleton stubs.
- **`new`:** Tests asserting new requirements or defect fixes. **MUST FAIL** on unmodified code / skeleton stubs.

## 2. Regression Test for Bugfixes
For bugfixes, the first test authored MUST be a regression test:
1. It executes against unmodified baseline code.
2. It MUST FAIL with an assertion error whose symptom directly matches the root cause documented in `root_cause_r1.md`.
3. If it passes, the bug is not properly isolated or reproduced, and the test is rejected.

## 3. Machine-Readable Test Output (Isolated Reports)
Red-checks and test gates MUST evaluate structured test runner output written strictly inside `.agent/tasks/<task_id>/reports/` (never polluting the repo root):
| Stack | Structured Output Command | Failure Parsing |
| :--- | :--- | :--- |
| **Node.js / TS** | `npm test -- --json --outputFile=.agent/tasks/<task_id>/reports/test_report.json` | Inspect JSON `numFailedTests`, `assertionResults` |
| **Python** | `pytest --junitxml=.agent/tasks/<task_id>/reports/test_report.xml` | Parse `<failure type="AssertionError">` |
| **Go** | `go test -json ./... > .agent/tasks/<task_id>/reports/test_report.json` | Parse JSON `Action: "fail"`, `Output` |
| **Rust** | `cargo test -- --format json` (or `cargo nextest --junit-path=.agent/tasks/<task_id>/reports/report.xml`) | Parse failure assertions or panic messages |

## 4. Valid vs Invalid Red State
- **Valid Red State (ACCEPTED):**
  - Test runner exits non-zero.
  - The failure is explicitly an **Assertion Failure** (e.g., `AssertionError`, `expect().toBe()`, `assert_eq!`) OR catches the explicit skeleton stub marker `NOT_IMPLEMENTED_STUB`.
  - Characterization tests pass (exit code 0).
- **Invalid Red State (REJECTED):**
  - Fails due to syntax error, compilation error, or unhandled import crash.
  - New test passes with code 0 (vacuous test).
  - Test fails with generic unhandled crash rather than an assertion or `NOT_IMPLEMENTED_STUB`.

## 5. Mutation Sanity Check
After Senior Dev implements functional code and tests turn green:
1. Dev flips one conditional branch in the code under test (e.g. `>` to `<=`, or `true` to `false`).
2. Dev runs the test suite.
3. **Requirement:** At least ONE test MUST fail.
4. Dev reverts the mutation before staging and committing.
5. If zero tests fail, the test suite is vacuous, and QA receives a `BLOCKER`.
