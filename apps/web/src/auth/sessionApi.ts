import {
  isUserRole,
  type AuthenticatedUserDto,
  type SessionResponseDto,
} from "@familytodo/shared-types";
import { ApiRequestError, getJson } from "../lib/apiClient";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUser(value: unknown): AuthenticatedUserDto {
  if (!isRecord(value)) {
    throw new ApiRequestError("The server returned an invalid session.", 200);
  }

  const { id, email, profile } = value;
  if (typeof id !== "string" || typeof email !== "string") {
    throw new ApiRequestError("The server returned an invalid session.", 200);
  }

  if (profile === null) {
    return { id, email, profile: null };
  }

  if (
    !isRecord(profile) ||
    typeof profile.displayName !== "string" ||
    typeof profile.role !== "string" ||
    !isUserRole(profile.role)
  ) {
    throw new ApiRequestError("The server returned an invalid session.", 200);
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

export async function getSession(
  signal?: AbortSignal,
): Promise<SessionResponseDto> {
  const response = await getJson("/api/session", { signal });

  if (!isRecord(response) || !("user" in response)) {
    throw new ApiRequestError("The server returned an invalid session.", 200);
  }

  if (response.user === null) {
    return { user: null };
  }

  if (
    typeof response.expiresAt !== "string" ||
    Number.isNaN(Date.parse(response.expiresAt))
  ) {
    throw new ApiRequestError("The server returned an invalid session.", 200);
  }

  return {
    user: parseUser(response.user),
    expiresAt: response.expiresAt,
  };
}
