import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import {
  findUserForPasswordReset,
  invalidatePasswordResetToken,
  issuePasswordResetToken,
} from "../../services/database/auth.service.js";
import { sendPasswordResetEmail } from "../../services/email/resend-email.service.js";
import { forgotPasswordRequestSchema } from "../../schemas/auth.js";

const resetTokenLifetimeMs = 60 * 60 * 1000;

function createResetUrl(token: string): string {
  const configuredUrl = process.env.WEB_APP_URL;

  if (!configuredUrl) {
    throw new Error("WEB_APP_URL must be configured for password reset.");
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredUrl);
  } catch {
    throw new Error("WEB_APP_URL must be a valid absolute URL.");
  }

  if (
    (baseUrl.protocol !== "https:" &&
      !(process.env.NODE_ENV !== "production" && baseUrl.protocol === "http:")) ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new Error("WEB_APP_URL must use a secure application origin.");
  }

  const resetUrl = new URL("/reset-password", baseUrl);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  return resetUrl.toString();
}

export async function postForgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const result = forgotPasswordRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: {
        code: "INVALID_FORGOT_PASSWORD_REQUEST",
        message: "Enter a valid email address.",
      },
    });
    return;
  }

  try {
    const user = await findUserForPasswordReset(result.data.email);

    if (user) {
      const rawToken = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + resetTokenLifetimeMs);

      await issuePasswordResetToken(user.id, tokenHash, expiresAt);

      try {
        const resetUrl = createResetUrl(rawToken);
        await sendPasswordResetEmail({
          recipientEmail: user.email,
          resetUrl,
        });
      } catch {
        await invalidatePasswordResetToken(tokenHash);
        console.error("Password reset email delivery failed.");
      }
    }

    res.status(200).json({
      message:
        "If an account matches that email address, password reset instructions will be sent.",
    });
  } catch {
    console.error("Failed to process a password reset request.");
    res.status(500).json({
      error: {
        code: "PASSWORD_RESET_REQUEST_FAILED",
        message: "Unable to process the request right now. Please try again.",
      },
    });
  }
}
