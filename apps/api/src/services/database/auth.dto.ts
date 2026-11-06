import type { UserRole } from "@familytodo/shared-types";

export interface LoginUserDto {
  id: string;
  email: string;
  passwordHash: string | null;
  profile: {
    displayName: string;
    role: UserRole;
  } | null;
}

export interface PasswordResetUserDto {
  id: string;
  email: string;
}

export interface SessionDto {
  id: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    profile: {
      displayName: string;
      role: UserRole;
    } | null;
  };
}
