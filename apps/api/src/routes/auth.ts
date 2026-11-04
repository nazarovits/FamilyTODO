import { Router } from "express";

import {
  getSession,
  postLogin,
  postLogout,
} from "../handlers/auth/auth.js";
import {
  postForgotPassword,
  postResetPassword,
} from "../handlers/auth/password-reset.js";
import { rateLimit } from "express-rate-limit";

const router = Router();
const forgotPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    },
  },
});
const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    },
  },
});

router.post("/login", postLogin);
router.post("/forgot-password", forgotPasswordRateLimit, postForgotPassword);
router.post("/reset-password", resetPasswordRateLimit, postResetPassword);
router.get("/session", getSession);
router.post("/logout", postLogout);

export default router;
