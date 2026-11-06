import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@familytodo/shared-types";
import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "../auth/session.js";
import {
  deleteSessionById,
  findSessionByTokenHash,
} from "../services/database/auth.service.js";
import type { AuthenticatedUserContextDto } from "../auth/auth.dto.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUserContextDto;
    }
  }
}

interface RequireAuthOptions {
  roles?: readonly UserRole[];
}

export function requireAuth(options: RequireAuthOptions = {}) {
  const allowedRoles = options.roles;

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const token = getSessionToken(req);

    if (!token) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
        },
      });
      return;
    }

    const session = await findSessionByTokenHash(hashSessionToken(token));
    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
        },
      });
      return;
    }

    if (session.expiresAt <= new Date()) {
      await deleteSessionById(session.id);
      clearSessionCookie(res);
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
        },
      });
      return;
    }

    req.auth = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.profile?.role ?? null,
    };

    if (
      allowedRoles &&
      (!req.auth.role || !allowedRoles.includes(req.auth.role))
    ) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You are not authorized to access this resource.",
        },
      });
      return;
    }

    next();
  };
}
