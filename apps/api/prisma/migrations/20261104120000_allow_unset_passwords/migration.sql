-- Accounts provisioned before password reset is available have no password yet.
ALTER TABLE "User"
ALTER COLUMN "passwordHash" DROP NOT NULL;

UPDATE "User"
SET "email" = lower(trim("email"));

UPDATE "User"
SET "passwordHash" = NULL
WHERE "passwordHash" = '';
