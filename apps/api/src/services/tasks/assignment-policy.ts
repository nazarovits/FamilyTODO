import { UserRole } from "@familytodo/shared-types";

export function canAssignTask(
  creatorId: string,
  creatorRole: UserRole,
  assigneeId: string,
  assigneeRole: UserRole,
): boolean {
  return (
    creatorRole === UserRole.Parent ||
    (creatorRole === UserRole.Child &&
      (assigneeId === creatorId || assigneeRole === UserRole.Parent))
  );
}
