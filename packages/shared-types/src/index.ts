export enum UserRole {
  Parent = "PARENT",
  Child = "CHILD",
}

export enum TaskStatus {
  Open = "OPEN",
  InProgress = "IN_PROGRESS",
  PendingApproval = "PENDING_APPROVAL",
  Done = "DONE",
  Rejected = "REJECTED",
}

export enum TaskPriority {
  Low = "LOW",
  Normal = "NORMAL",
  High = "HIGH",
}

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).some((role) => role === value);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).some((status) => status === value);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return Object.values(TaskPriority).some((priority) => priority === value);
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

export interface TaskAssigneeDto {
  id: string;
  displayName: string;
  role: UserRole;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  rewardPoints: number;
  estimateMinutes: number | null;
  requiresApproval: boolean;
  assignee: TaskAssigneeDto;
  createdById: string;
  dueAt: string | null;
  reminderAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequestDto {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  rewardPoints?: number;
  estimateMinutes?: number | null;
  requiresApproval?: boolean;
  assigneeId: string;
  dueAt?: string | null;
  reminderAt?: string | null;
}

export interface TaskAssigneesResponseDto {
  data: {
    assignees: TaskAssigneeDto[];
  };
}

export interface TaskResponseDto {
  data: {
    task: Task;
  };
}

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
