import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export async function findUserForLogin(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      profile: {
        include: { role: true },
      },
    },
  });
}

export async function findUserForPasswordReset(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
    },
  });
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

export async function findSessionByTokenHash(tokenHash: string) {
  return prisma.session.findUnique({
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
        data: { userId, tokenHash, expiresAt },
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
