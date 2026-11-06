import { isUserRole, type LoginResponseDto } from "@familytodo/shared-types";
import { ApiRequestError, postJson } from "../../lib/apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponseDto> {
  const response = await postJson("/api/login", credentials);

  if (
    !isRecord(response) ||
    !isRecord(response.user) ||
    typeof response.expiresAt !== "string" ||
    Number.isNaN(Date.parse(response.expiresAt))
  ) {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  const { id, email, profile } = response.user;
  if (typeof id !== "string" || typeof email !== "string") {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  if (profile === null) {
    return {
      user: { id, email, profile: null },
      expiresAt: response.expiresAt,
    };
  }

  if (
    !isRecord(profile) ||
    typeof profile.displayName !== "string" ||
    typeof profile.role !== "string" ||
    !isUserRole(profile.role)
  ) {
    throw new ApiRequestError("The server returned an invalid response.", 200);
  }

  return {
    user: {
      id,
      email,
      profile: {
        displayName: profile.displayName,
        role: profile.role,
      },
    },
    expiresAt: response.expiresAt,
  };
}
