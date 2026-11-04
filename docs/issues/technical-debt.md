# Technical Debt

Track engineering work that is not an immediate user-facing defect but should
be addressed to keep the application maintainable and verifiable.

| ID | Status | Priority | Item | Next action |
|---|---|---|---|---|
| TD-001 | Open | Medium | The API has no automated test script or existing test suite. | Add focused tests for reset-token validation/consumption, transactional password updates, session revocation, and generic forgot-password behavior. |

## Resolved

| ID | Resolution |
|---|---|
| TD-002 | Closed for the reported delivery incident: its root cause was local configuration/template setup before the Resend service was called, so provider diagnostics were not needed to resolve it. The service still intentionally returns a generic error; revisit safe provider diagnostics if a provider-side failure is observed. |
