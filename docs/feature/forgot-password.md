# Forgot and Reset Password

## Goal

Allow a family member to request a password-reset link by email and set a new
password using a short-lived, single-use token. The same flow sets the initial
password for accounts that do not yet have one.

This document tracks the vertical slice. The Resend email service is
implemented; the UI, API handlers, and token behavior are not implemented yet.

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
- Keep authentication-related Prisma access in the shared auth database
  service; handlers orchestrate the application flow and HTTP behavior.

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
    database/
      auth.service.ts            # auth, session, and reset-token persistence
    email/
      resend-email.service.ts    # implemented Resend client and provider interaction
  lib/
    prisma.ts                    # existing Prisma client
apps/web/src/
  routes/
    AppRoute.ts                  # route constants
    routes.tsx                   # route definitions
  features/
    ForgotPassword/              # request-reset page and API integration
    ResetPassword/               # set-password page and API integration
    Error/                       # generic error page
```

`auth.service.ts` owns authentication-related Prisma queries and transactions
for users, sessions, and password-reset tokens. Handlers retain HTTP request
validation and response behavior, password/token generation and hashing, and
cookie handling. The email service owns Resend interaction; it never accesses
the database.

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
   the raw token in a link to the configured web app's reset route as a URL
   fragment (for example, `/reset-password#token=...`).
5. The API returns the same generic confirmation for known and unknown emails,
   so callers cannot determine which addresses have accounts.
6. If delivery fails, invalidate the newly created token, log a safe
   operational message, and keep the response generic to the caller.

Endpoint:

```text
POST /api/forgot-password
```

Request:

```json
{
  "email": "person@example.com"
}
```

### Set a New Password

1. The emailed link opens the reset-password screen with the raw token in the
   URL fragment. The page reads it and removes it from the visible URL
   immediately.
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
POST /api/reset-password
```

Request:

```json
{
  "token": "raw-token-from-email",
  "password": "new password"
}
```

The password-confirmation field is a UI-only check. Send only the new
`password` and reset `token` to the API; do not send the confirmation as a
second credential.

## Web UI Requirements

### Routes and Pages

- Add `AppRoute.ForgotPassword` for `/forgot-password` and register the page in
  the browser router.
- Replace the login page's plain forgot-password anchor with a router link to
  `AppRoute.ForgotPassword`.
- Add a responsive ForgotPassword page with an email input, submit button,
  back-to-login link, accessible validation/error feedback, and pending state.
- Validate the email in the browser for usability, while always repeating
  validation in the API. On a successful generic API response, show a neutral
  confirmation to check the inbox and spam folder; do not claim that an email
  was definitely sent or that the account exists.
- Add `AppRoute.ResetPassword` for `/reset-password`. Read the token from the
  URL fragment (for example, `#token=...`) so it is not sent in the initial
  HTTP request. Remove it from the visible browser URL/history as soon as the
  page reads it, and keep it only in page memory for the reset submission.
- Add a responsive ResetPassword page with new-password and confirmation
  inputs, client-side policy validation, pending state, and accessible
  feedback. On success, confirm the password was changed and link to login;
  never sign in automatically. On a 4xx response, show a generic message that
  the link is invalid or expired and offer a way to request another one. On a
  5xx response, navigate to the generic error page.
- Add `AppRoute.Error` and a responsive generic Error page with a safe,
  non-technical message and a link back to login. Do not display server
  exception details, tokens, or request data.
- For both forms, prevent duplicate submissions while pending, preserve
  keyboard operation and visible focus, associate errors with inputs, and
  announce status/errors to assistive technology. Provide a usable mobile
  layout as well as a desktop layout.

### UI/API Response Behavior

- Forgot-password success: display the same confirmation for any syntactically
  valid email, regardless of whether an account exists.
- Forgot-password 4xx: show a safe input/request error without echoing
  potentially sensitive content. Forgot-password 5xx: navigate to
  `AppRoute.Error`. A network failure without an HTTP response should show a
  retryable connection message rather than pretending the request succeeded.
- Reset-password 4xx: use one generic invalid/expired-link message; do not
  expose whether a token was unknown, expired, or already used.
- Reset-password 5xx: navigate to `AppRoute.Error`. Network failures should
  show a retryable connection message, keeping the token only in memory.
- Send requests through the existing API client and TanStack Query mutation
  pattern. The UI can be implemented against these endpoint contracts before
  the API step, using mocked responses for interaction tests.

### Password Policy

Use the same password policy in the UI and API:

- Minimum 12 and maximum 128 Unicode code points.
- Unicode characters are allowed.
- Whitespace is not allowed, including spaces, tabs, or line breaks.
- Do not require arbitrary combinations of symbols, digits, or letter case.
- Do not silently truncate passwords.

Implement the policy once as a runtime validator in
`packages/shared-types` and import it from both the web UI and API. The API
must always validate independently using that shared validator; browser input
attributes alone are not validation. Count Unicode code points consistently
in the shared validator rather than relying on JavaScript string `.length` or
HTML `maxlength`, which count UTF-16 code units. Do not normalize the password
before comparing or hashing it. Use `autocomplete="new-password"` for both
password fields. Confirmation must match locally and must never be logged or
sent to the API.

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
- Rate-limit forgot-password requests. The current API limiter is
  process-local; configure a shared rate-limit store before deploying multiple
  API instances/serverless functions so limits cannot be bypassed by instance
  rotation.
- The generic response reduces account enumeration, but synchronous email
  delivery can still create a response-time difference between known and
  unknown accounts. Before production, consider queuing delivery or another
  approach that avoids making provider latency a user-enumeration signal.
- Keep reset tokens out of query strings, analytics, client/server logs,
  telemetry, and third-party resources. The reset page should avoid external
  scripts/images, set a restrictive referrer policy (at least
  `no-referrer`), and clear the fragment immediately after reading it.
- Do not store the token or password in local/session storage, cookies, or
  persistent client state. Do not put either value in error messages or
  telemetry. The password should be sent only over HTTPS in the reset request.
- Use a generic reset-token failure response for invalid, expired, and used
  tokens. A 4xx UI message must not distinguish these cases.
- Ensure successful password reset revokes existing sessions server-side; the
  UI must not create a replacement session or automatically log in.
- Validate all client input again on the server. Client-side checks are only
  usability aids and are not security controls.

## Implementation Sequence

- [x] **1. Email provider setup**
  - Add the Resend SDK and API email service.
  - Configure the Resend template with the `resetUrl` variable and a verified
    sender; keep its ID, sender, and API key in API-only environment settings.
- [x] **2. Web UI**
  - Add `ForgotPassword`, `ResetPassword`, and `Error` route constants and
    register their responsive pages.
  - Link the login page's forgot-password action to the ForgotPassword route.
  - Implement email/password client validation, accessible pending/success/
    error states, the back-to-login links, and the agreed password policy.
  - Integrate with `POST /api/forgot-password` and `POST /api/reset-password`
    through the existing web API client and TanStack Query pattern. The API
    handlers are tracked in the following steps and are not implemented yet.
  - Read the reset token from the URL fragment and clear it immediately.
- [x] **3. Authentication database service and login refactor**
  - Add the shared database auth service for user/profile/role lookups,
    session persistence, and reset-token persistence.
  - Refactor login, session lookup/expiry cleanup, and logout to use the
    service without changing their HTTP behavior.
- [x] **4. Forgot-password API**
  - Add the Zod request schema, handler, and route for
    `POST /api/forgot-password`.
  - Generate cryptographically random tokens, persist only their hashes, and
    invalidate prior unused tokens transactionally.
  - Build reset links from `WEB_APP_URL` using a URL fragment and send them
    through the Resend email service.
  - Preserve a generic response for known and unknown emails, including
    delivery-failure handling, and rate-limit requests.
- [ ] **5. Reset-password API**
  - Add token/password validation and the atomic password/session update for
    `POST /api/reset-password`.
  - Enforce the agreed password policy; do not accept or require the
    confirmation field.
  - Cover expired, used, malformed, valid, and initial-password cases.
- [ ] **6. End-to-end verification**
  - Test without sending real mail by injecting or mocking the email service.
  - Verify UI validation, status handling, responsive layouts, and token
    removal from the URL.
  - Verify successful reset, token expiry/reuse, initial password setup, and
    session revocation.
- [ ] **7. Production readiness**
  - Verify a sending domain and DNS records.
  - Set production environment variables in the Vercel API project.
  - Configure a shared rate-limit store and address timing differences in
    reset-request handling.
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
