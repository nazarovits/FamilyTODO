# Database Schema

This document describes the database foundation for the FamilyTODO login flow
and a single-family installation. The canonical Prisma model is in
[`../../apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma).
The initial migration has been applied to Neon. The follow-up migration
[`../../apps/api/prisma/migrations/20261104120000_allow_unset_passwords/migration.sql`](../../apps/api/prisma/migrations/20261104120000_allow_unset_passwords/migration.sql)
has been generated locally but has not been applied. It normalizes existing
emails and changes empty password hashes to `NULL`. Accounts without a set
password have a `NULL` `passwordHash`.

The API Prisma configuration loads `apps/api/.env.local` for local CLI commands.
Prisma schema and migration commands use `DATABASE_URL_UNPOOLED`, while the
pooled `DATABASE_URL` is reserved for application runtime connections.

```sh
pnpm --filter @familytodo/api db:generate
pnpm --filter @familytodo/api db:migrate:dev
```

`db:migrate:dev` applies schema changes to the configured development database.
Verify that `.env.local` points to the intended Neon development database
before running it. The follow-up migration has not been applied. If the initial
SQL was run manually in Neon rather than with Prisma Migrate, verify Prisma
migration history before using `migrate dev` or `migrate deploy`; do not reset
the database to resolve a drift warning. The email normalization step requires
all existing emails to remain unique after trimming and lowercasing.

## Tables

```text
+----------------------------+       +----------------------------+
| Role                       |       | User                       |
+----------------------------+       +----------------------------+
| PK  id          UUID       |       | PK  id          UUID       |
| UQ  code        TEXT       |       | UQ  email       TEXT       |
|     PARENT/CHILD           |       |     passwordHash TEXT NULL |
+----------------------------+       |     createdAt   TIMESTAMP  |
             |                       |     updatedAt   TIMESTAMP  |
             |                       +----------------------------+
             |                                   | 1
             |                                   | 1
             v                                   v
+----------------------------+       +----------------------------+
| Profile                    |       | Session                    |
+----------------------------+       +----------------------------+
| PK, FK userId UUID         |       | PK  id          UUID       |
| FK  roleId     UUID        |       | FK  userId      UUID       |
|     displayName TEXT       |       | UQ  tokenHash   CHAR(64)   |
+----------------------------+       |     createdAt   TIMESTAMP  |
                                      |     expiresAt   TIMESTAMP  |
                                      +----------------------------+

+----------------------------+
| PasswordResetToken         |
+----------------------------+
| PK  id          UUID       |
| FK  userId      UUID       |
| UQ  tokenHash   CHAR(64)   |
|     createdAt   TIMESTAMP  |
|     expiresAt   TIMESTAMP  |
|     usedAt      TIMESTAMP  |
+----------------------------+
```

## Keys and Constraints

- `User.id`, `Role.id`, `Session.id`, and `PasswordResetToken.id` are primary
  keys.
- `User.email` is unique and stored normalized (trimmed and lowercase).
- `Role.code` is unique. Initial values are `PARENT` and `CHILD`.
- The database stores `Role.code` as text. The API maps and validates it to
  the shared TypeScript `UserRole` enum at the database-service boundary;
  unknown persisted role values are treated as errors.
- `Profile.userId` is both its primary key and a foreign key to `User.id`, so a
  user has at most one profile.
- `Profile.roleId` references `Role.id`.
- `Session.userId` references `User.id`; deleting a user cascades to sessions.
- `Session.tokenHash` is unique. Only a hash of the opaque session token is
  stored in the database.
- `Session.expiresAt` must be later than `Session.createdAt`.
- `PasswordResetToken.expiresAt` must be later than `createdAt`.
- `PasswordResetToken.userId` references `User.id`; deleting a user cascades to
  reset tokens.
- `PasswordResetToken.tokenHash` is unique. Only a hash of the emailed reset
  token is stored.
- A reset token is valid only before `expiresAt` and while `usedAt` is null.
  Redeeming it updates the password and marks the token used.
- Passwords are stored as password hashes, never as plaintext.
- `passwordHash` is null until a user sets their first password.
- The expiry ordering rules are enforced by SQL `CHECK` constraints in the
  migration; Prisma's schema does not currently represent these constraints.

## Design Notes

- This model assumes one family installation, so it does not include `Family`
  or `FamilyMember` tables.
- `displayName` holds the name shown in the UI, such as “Dad,” “Mom,” or a
  child’s name. These are not authorization roles.
- `ADMIN` is intentionally omitted until its permissions are defined. Parent
  access is sufficient for managing this single-family app initially.
- The initial migration inserts the `PARENT` and `CHILD` role rows with stable
  IDs.
- If the app later needs multiple households, add family and membership tables;
  assign parent/child roles to memberships rather than treating them as global
  roles.
- Password reset tokens should be random, single-use, time-limited, and stored
  only as hashes. Multiple outstanding requests can be invalidated when a new
  token is issued, according to the eventual reset-flow policy.