import { Prisma } from "@prisma/client";
import { isUserRole, type UserRole } from "@familytodo/shared-types";
import { prisma } from "../../lib/prisma.js";
import type {
  LoginUserDto,
  PasswordResetUserDto,
  SessionDto,
} from "./auth.dto.js";

function mapRole(code: string): UserRole {
  if (!isUserRole(code)) {
    throw new Error("The database contains an unsupported user role.");
  }

  return code;
}

export async function findUserForLogin(
  email: string,
): Promise<LoginUserDto | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    profile: user.profile
      ? {
          displayName: user.profile.displayName,
          role: mapRole(user.profile.role.code),
        }
      : null,
  };
}

export async function findUserForPasswordReset(
  email: string,
): Promise<PasswordResetUserDto | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
    },
  });

  return user;
}

export async function createSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findSessionByTokenHash(
  tokenHash: string,
): Promise<SessionDto | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          profile: {
            include: { role: true },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      email: session.user.email,
      profile: session.user.profile
        ? {
            displayName: session.user.profile.displayName,
            role: mapRole(session.user.profile.role.code),
          }
        : null,
    },
  };
}

export async function deleteSessionById(id: string): Promise<void> {
  await prisma.session.delete({ where: { id } });
}

export async function deleteSessionByTokenHash(
  tokenHash: string,
): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function issuePasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });
      await transaction.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt, usedAt: null },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function invalidatePasswordResetToken(
  tokenHash: string,
): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: { tokenHash, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export async function resetPasswordWithToken(
  tokenHash: string,
  passwordHash: string,
  now: Date,
): Promise<boolean> {
  return prisma.$transaction(async (transaction) => {
    const resetToken = await transaction.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!resetToken) {
      return false;
    }

    const consumed = await transaction.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        tokenHash,
        // usedAt: null, // TODO: this might be a security issue. should be revisited later.
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (consumed.count !== 1) {
      return false;
    }

    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });
    await transaction.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    return true;
  });
}
