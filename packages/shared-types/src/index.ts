export enum UserRole {
  Parent = "PARENT",
  Child = "CHILD",
}

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).some((role) => role === value);
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  profile: {
    displayName: string;
    role: UserRole;
  } | null;
}

export interface LoginResponseDto {
  user: AuthenticatedUserDto;
  expiresAt: string;
}

export type SessionResponseDto =
  | { user: null }
  | { user: AuthenticatedUserDto; expiresAt: string };

export const PASSWORD_MIN_CODE_POINTS = 12;
export const PASSWORD_MAX_CODE_POINTS = 128;

export type PasswordValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason: "too-short" | "too-long" | "whitespace";
    };

export function validatePassword(password: string): PasswordValidationResult {
  const codePointLength = Array.from(password).length;

  if (codePointLength < PASSWORD_MIN_CODE_POINTS) {
    return { valid: false, reason: "too-short" };
  }
  if (codePointLength > PASSWORD_MAX_CODE_POINTS) {
    return { valid: false, reason: "too-long" };
  }
  if (/\p{White_Space}/u.test(password)) {
    return { valid: false, reason: "whitespace" };
  }

  return { valid: true };
}
