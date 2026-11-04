import argon2 from "argon2";
import type { Request, Response } from "express";
import {
  clearSessionCookie,
  createSessionToken,
  getSessionToken,
  hashSessionToken,
  sessionLifetimeMs,
  setSessionCookie,
} from "../../auth/session.js";
import { prisma } from "../../lib/prisma.js";
import { loginRequestSchema } from "../../schemas/auth.js";
import { z } from "zod";

export async function postLogin(req: Request, res: Response): Promise<void> {
  const result = loginRequestSchema.safeParse(req.body);

  if (!result.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Invalid login request:", z.treeifyError(result.error));
    }

    res.status(400).json({
      error: {
        code: "INVALID_LOGIN_REQUEST",
        message: "A valid email and password are required.",
      },
    });
    return;
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: {
        include: { role: true },
      },
    },
  });

  if (!user?.passwordHash) {
    res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect.",
      },
    });
    return;
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);

  if (!passwordMatches) {
    res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect.",
      },
    });
    return;
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  setSessionCookie(res, token);
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            role: user.profile.role.code,
          }
        : null,
    },
    expiresAt: expiresAt.toISOString(),
  });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const token = getSessionToken(req);

  if (!token) {
    res.status(200).json({ user: null });
    return;
  }

  const tokenHash = hashSessionToken(token);
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

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }

    clearSessionCookie(res);
    res.status(200).json({ user: null });
    return;
  }

  res.status(200).json({
    user: {
      id: session.user.id,
      email: session.user.email,
      profile: session.user.profile
        ? {
            displayName: session.user.profile.displayName,
            role: session.user.profile.role.code,
          }
        : null,
    },
    expiresAt: session.expiresAt.toISOString(),
  });
}

export async function postLogout(req: Request, res: Response): Promise<void> {
  const token = getSessionToken(req);

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  clearSessionCookie(res);
  res.status(204).end();
}
