import { isUserRole, type UserRole } from "@familytodo/shared-types";

export function mapUserRole(code: string): UserRole {
  if (!isUserRole(code)) {
    throw new Error("The database contains an unsupported user role.");
  }

  return code;
}
