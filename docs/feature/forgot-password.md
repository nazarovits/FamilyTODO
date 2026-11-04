# Forgot and Reset Password

## Goal

Allow a family member to request a password-reset link by email and set a new
password using a short-lived, single-use token. The same flow sets the initial
password for accounts that do not yet have one.

This document describes the planned vertical slice. The Resend email service
is implemented, but no reset UI, API handlers, or token behavior is implemented
yet.

## Decisions

- Use Resend's Node SDK over HTTPS for transactional email; do not configure a
  custom SMTP server or use Nodemailer for this integration.
- Use a one-hour reset-token lifetime.
- Generate tokens with a cryptographically secure random generator.
- Store only the SHA-256 token hash in `PasswordResetToken`.
- Return a generic response for reset requests whether or not an account exists.
- Invalidate prior unused reset tokens when issuing a new one.
- On successful reset, update the password hash, mark the token used, and
  revoke the user's existing sessions in one database transaction.
- Do not automatically sign the user in after reset.
- Use Argon2id for password hashes.
- Keep current database operations in the auth handler for this slice. Do not
  refactor them into a database service as part of this feature.

## API File Structure

```text
apps/api/src/
  handlers/
    auth/
      auth.ts                    # existing login/session handlers
      password-reset.ts          # forgot/reset HTTP handlers
  routes/
    auth.ts                      # mount password-reset routes
  schemas/
    auth.ts                      # Zod request schemas
  services/
    email/
      resend-email.service.ts    # Resend client and provider interaction
      password-reset-email.ts    # reset email subject, text, and HTML
  lib/
    prisma.ts                    # existing Prisma client
```

The auth handler remains responsible for the flow's database operations for
now. It calls the email service to send a message; Resend-specific behavior
stays isolated in the email service.

## Email Provider Setup

### Dependencies and Configuration

- Add the `resend` SDK to `apps/api`.
- Configure these API-only environment variables:
  - `RESEND_API_KEY`: secret API key.
  - `RESEND_RESET_PASSWORD_TEMPLATE_ID`: ID of the password-reset template
    configured in Resend.
  - `RESEND_RESET_PASSWORD_SENDER_EMAIL`: verified sender address.
  - `WEB_APP_URL`: trusted base URL used by the future API handler to construct
    reset links.
- Keep local values in `apps/api/.env.local`; never commit API keys.
- Configure the same variables as secrets/environment variables in the Vercel
  API project for development, preview, and production as appropriate.
- Do not expose the Resend key through a `VITE_` variable or put it in the web
  project.
- Use Resend's test sender while developing. For delivery to family members,
  verify a domain and configure its required DNS records before production
  sending.

The email service is implemented in
`apps/api/src/services/email/resend-email.service.ts`. It fails clearly if
required Resend configuration is missing and reports send failures without
including provider details, API keys, reset tokens, or complete reset URLs.
The service passes the complete reset link to the template as the `resetUrl`
variable; the Resend template must use that exact variable name.

### Email Content

Configure the Resend dashboard template to send a message that:

- explains that a password reset was requested;
- includes the reset link and states that it expires in one hour;
- advises recipients to ignore the message if they did not request it.

Construct the link using `WEB_APP_URL`, not the incoming request's `Host`
header. Never log the raw token or reset URL.

## User Flows

### Request a Reset

1. The login page links to a forgot-password screen.
2. The screen accepts an email address and submits it to the API.
3. The API validates the request with a Zod schema.
4. For a known account, the API invalidates prior unused reset tokens, creates
   a new random token, stores only its hash with a one-hour expiry, and sends
   the raw token in a link to the configured web app.
5. The API returns the same generic confirmation for known and unknown emails,
   so callers cannot determine which addresses have accounts.
6. If delivery fails, log a safe provider error for operations, but keep the
   response generic to the caller.

Endpoint:

```text
POST /api/password/forgot
```

Request:

```json
{
  "email": "person@example.com"
}
```

### Set a New Password

1. The emailed link opens the reset-password screen with the raw token.
2. The screen collects a new password and confirmation; confirmation is
   checked in the UI and is not sent as a separate credential.
3. The API validates the token and password using a Zod schema.
4. It hashes the token and checks that a matching record exists, is unused, and
   has not expired.
5. In one transaction, it stores the new Argon2id password hash, marks the
   reset token used, and revokes existing sessions for that user.
6. The API returns success; the UI confirms the change and links back to login.
7. An invalid, expired, or used token produces a friendly failure response and
   does not change the password.

Endpoint:

```text
POST /api/password/reset
```

Request:

```json
{
  "token": "raw-token-from-email",
  "password": "new password"
}
```

## Security and Reliability

- Apply rate limits to reset requests and token-redemption attempts.
- Keep the forgot-password response and timing sufficiently consistent to
  reduce account enumeration.
- Never store reset tokens in plaintext.
- Never include tokens, passwords, API keys, or full reset URLs in logs.
- Use the same generic invalid-credentials response for accounts without a
  password as for incorrect credentials.
- Reset tokens must be single-use and expire after one hour.
- Revoke existing sessions after a successful reset.
- Do not automatically create a session after reset.
- Treat Resend delivery errors as operational failures; do not return
  account-existence or provider details to the requester.

## Implementation Sequence

1. **Email provider setup**
   - Add the Resend SDK and API email service.
   - Configure the Resend template with the `resetUrl` variable and a verified
     sender; keep its ID, sender, and API key in API-only environment settings.
   - Verify sending to an allowed test recipient without exposing secrets.
2. **Forgot-password API**
   - Add the Zod request schema, handler, and route.
   - Store hashed reset tokens and send the email.
   - Preserve a generic response for known and unknown accounts.
3. **Reset-password API**
   - Add token/password validation and the atomic password/session update.
   - Cover expired, used, malformed, and valid token cases.
4. **Web UI**
   - Add forgot-password and reset-password routes and screens.
   - Connect them through the existing web API client and TanStack Query.
   - Add pending, success, and error states.
5. **End-to-end verification**
   - Test without sending real mail by injecting or mocking the email service.
   - Perform one manual delivery check using Resend's test sender.
   - Verify successful reset, token expiry/reuse, initial password setup, and
     session revocation.
6. **Production readiness**
   - Verify a sending domain and DNS records.
   - Set production environment variables in the Vercel API project.
   - Confirm delivery to intended family recipients before enabling the flow.

## Acceptance Criteria

- A user can request a password-reset link from the UI.
- Known and unknown emails receive the same API confirmation.
- Reset mail is sent through Resend using configured server-side secrets.
- A valid token can set a password exactly once before its one-hour expiry.
- A successful reset invalidates existing sessions.
- An account with no password can set its initial password through this flow.
- Invalid, expired, and previously used tokens cannot change credentials.
- Passwords, tokens, API keys, and personal email addresses are not written to
  logs or committed to source control.
