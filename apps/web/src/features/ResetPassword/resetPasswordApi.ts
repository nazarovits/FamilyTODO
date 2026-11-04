import { postJson } from "../../lib/apiClient";

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function resetPassword(
  request: ResetPasswordRequest,
): Promise<void> {
  await postJson("/api/reset-password", request);
}
