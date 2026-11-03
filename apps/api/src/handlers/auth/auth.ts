import type { Request, Response } from "express";
import { loginRequestSchema } from "../../schemas/auth.js";
import { z } from "zod";

export const postLogin = (req: Request, res: Response) => {
  const result = loginRequestSchema.safeParse(req.body);

  if (!result.success) {
    if (!req.app.get("isProduction")) {
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

  const { email } = result.data;
  if (email === "test@user.com") {
    res.status(200).json({
      message: "Login successful.",
    });
    return;
  }

  res.status(501).json({
    error: {
      code: "LOGIN_NOT_IMPLEMENTED",
      message:
        "Login is unavailable until credential verification is implemented.",
    },
  });
};
