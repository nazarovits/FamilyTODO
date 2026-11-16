# Technical Debt

Track engineering work that is not an immediate user-facing defect but should
be addressed to keep the application maintainable and verifiable.

| ID | Status | Priority | Item | Next action |
|---|---|---|---|---|
| TD-003 | Open | Medium | Task assignment authorization is split between route middleware, defensive checks in handlers, and the database service. | Move assignee authorization into middleware, reuse the same eligibility policy for the assignee list and task creation, and return 403 for a valid but forbidden assignee while keeping malformed or missing assignees as 400. |
| TD-004 | Open | Medium | API tests currently cover task policy, request validation, and unauthenticated task routes; shared-package contracts, handler guards, and successful persistence are not yet tested. | Add high-level handler tests and API application tests against an isolated test database, including guard middleware, allowed/forbidden assignments, validation, successful task persistence, password-reset token lifecycle and session revocation, and shared request/response contracts. Keep mocking minimal and test through the real Express application where practical. |

## Resolved

| ID | Resolution |
|---|---|
| TD-001 | Added the API test script and initial focused task tests. Broader API/shared-package coverage and password-reset behavior tests are tracked in TD-004. |
| TD-002 | Closed for the reported delivery incident: its root cause was local configuration/template setup before the Resend service was called, so provider diagnostics were not needed to resolve it. The service still intentionally returns a generic error; revisit safe provider diagnostics if a provider-side failure is observed. |
