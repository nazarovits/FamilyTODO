import { postJson } from "../../lib/apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(credentials: LoginRequest): Promise<void> {
  await postJson("/api/login", credentials);
}
