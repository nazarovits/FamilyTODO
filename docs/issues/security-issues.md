# Security Issues and Hardening

Track security vulnerabilities and security-relevant hardening work here.
Confirmed vulnerabilities should be distinguished from risks that apply only
under particular deployment conditions.

| ID | Status | Priority | Issue | Impact and next action |
|---|---|---|---|---|
| SEC-001 | Open | Medium | Forgot/reset rate limits use the default in-memory store. | Limits are per API process and can be bypassed across multiple instances or after restarts. Configure a shared store before deploying multiple API instances. |
| SEC-002 | Open | Medium | Forgot-password response timing may differ for known and unknown accounts. | The known-account path performs token persistence and synchronous email delivery. Consider queued delivery or another mitigation before production to reduce account-enumeration signals. |
| SEC-003 | Open | High | Reset-token consumption does not require `usedAt` to be null. | The current conditional update can consume an already-used token again before expiry, allowing repeated password resets with the same token. Restore the unused-token condition and add replay/concurrency tests. |
| SEC-004 | Investigating | Medium | Reported mismatch between `PasswordResetToken.usedAt` database default and the application's null-state assumption. | A non-null default may prevent token-rotation updates filtered by `usedAt: null` from matching as intended. The checked-in Prisma schema and initial migration show nullable `usedAt` with no default, while token creation explicitly supplies null; inspect the live database column default and migration state before changing schema or application behavior. |

SEC-001 and SEC-002 are deployment-dependent hardening risks. SEC-003 is a
confirmed code-level single-use-token protection issue and should be addressed
before relying on reset tokens. SEC-004 is an unverified report that needs
comparison against the live database schema.
