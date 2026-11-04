# Functional Issues

Track reproducible user-facing defects and active investigations here. Move
resolved items to the resolved section with a resolution note.

| ID | Status | Priority | Issue | Next action |
|---|---|---|---|---|
| BUG-002 | Open | Medium | The password-reset email template's button does not open the reset link, although the separate link element in the same email works. Both elements are reported to use the same `resendUrl`. | Inspect the rendered email HTML and the button's URL binding; verify the case-sensitive template variable matches the API payload (`RESET_URL` in the current email service), then test both elements in a delivered email. |

## Resolved

| ID | Resolution |
|---|---|
| BUG-001 | Email delivery was restored by correcting local `.env.local` configuration before the request reached Resend. The Resend template variable mismatch was also corrected. The reset flow was verified using the raw token; email delivery no longer blocks the flow. |
