# Master Loop

Execute the project using this loop discipline.

For each module:

1. Understand
   - Read the related specs.
   - Identify the exact files to create or modify.
   - List assumptions.

2. Plan
   - Create a short implementation plan.
   - Include tests to add or update.

3. Implement
   - Write production-quality code.
   - Keep components small and typed.
   - Avoid hardcoding product data inside UI components.

4. Verify
   - Run typecheck.
   - Run lint.
   - Run relevant unit tests.
   - Run relevant E2E tests if UI flow is affected.

5. Fix
   - Fix all failures.
   - Repeat verification until clean.

6. Audit
   - Compare implementation against acceptance criteria.
   - Note gaps.
   - Fix critical and high-priority gaps.

7. Report
   - Summarize files changed.
   - Summarize tests run.
   - Summarize known limitations.

Never skip verification.
Never mark a module complete if tests fail.
