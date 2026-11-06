import { postJson } from "../../lib/apiClient";
import { ApiRequestError } from "../../lib/apiClient";
import type { AuthenticatedUser } from "../../auth/AuthContext";

export interface LoginRequest {
  email: string;
  password: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function login(
  credentials: LoginRequest,
): Promise<AuthenticatedUser> {
  const response = await postJson("/api/login", credentials);

  if (!isRecord(response) || !isRecord(response.user)) {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  const { id, email, profile } = response.user;
  if (typeof id !== "string" || typeof email !== "string") {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  if (profile === null) {
    return { id, email, profile: null };
  }

  if (
    !isRecord(profile) ||
    typeof profile.displayName !== "string" ||
    typeof profile.role !== "string"
  ) {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  return {
    id,
    email,
    profile: {
      displayName: profile.displayName,
      role: profile.role,
    },
  };
}
