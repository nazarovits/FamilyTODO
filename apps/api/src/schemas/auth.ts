import { z } from "zod";
import { validatePassword } from "@familytodo/shared-types";

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1).max(128),
  password: z.string().superRefine((password, context) => {
    const validation = validatePassword(password);
    if (!validation.valid) {
      context.addIssue({
        code: "custom",
        message: validation.reason,
      });
    }
  }),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ForgotPasswordRequest = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ResetPasswordRequest = z.infer<
  typeof resetPasswordRequestSchema
>;
