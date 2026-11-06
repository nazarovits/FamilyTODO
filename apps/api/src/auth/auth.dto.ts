import type { UserRole } from "@familytodo/shared-types";

export interface AuthenticatedUserContextDto {
  id: string;
  email: string;
  role: UserRole | null;
}
