import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ForgotPasswordRequest = z.infer<
  typeof forgotPasswordRequestSchema
>;
