import { postJson } from "../../lib/apiClient";

export async function requestPasswordReset(email: string): Promise<void> {
  await postJson("/api/forgot-password", { email });
}
