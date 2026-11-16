import { Prisma } from "@prisma/client";
import {
  isTaskPriority,
  isTaskStatus,
  TaskPriority,
  TaskStatus,
  type CreateTaskRequestDto,
  type Task,
  type TaskAssigneeDto,
  type UserRole,
} from "@familytodo/shared-types";
import { prisma } from "../../lib/prisma.js";
import { canAssignTask } from "../tasks/assignment-policy.js";
import { mapUserRole } from "./role-mapping.js";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  rewardPoints: true,
  estimateMinutes: true,
  requiresApproval: true,
  createdById: true,
  dueAt: true,
  reminderAt: true,
  createdAt: true,
  updatedAt: true,
  status: { select: { code: true } },
  priority: { select: { code: true } },
  assignee: {
    select: {
      id: true,
      profile: {
        select: {
          displayName: true,
          role: { select: { code: true } },
        },
      },
    },
  },
} satisfies Prisma.TaskSelect;

type TaskRecord = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

function mapTaskStatus(code: string): TaskStatus {
  if (!isTaskStatus(code)) {
    throw new Error("The database contains an unsupported task status.");
  }

  return code;
}

function mapTaskPriority(code: string): TaskPriority {
  if (!isTaskPriority(code)) {
    throw new Error("The database contains an unsupported task priority.");
  }

  return code;
}

function mapTaskAssignee(
  id: string,
  profile: {
    displayName: string;
    role: { code: string };
  } | null,
): TaskAssigneeDto {
  if (!profile) {
    throw new Error("The task assignee does not have a profile.");
  }

  return {
    id,
    displayName: profile.displayName,
    role: mapUserRole(profile.role.code),
  };
}

function mapTask(task: TaskRecord): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: mapTaskStatus(task.status.code),
    priority: mapTaskPriority(task.priority.code),
    rewardPoints: task.rewardPoints,
    estimateMinutes: task.estimateMinutes,
    requiresApproval: task.requiresApproval,
    assignee: mapTaskAssignee(task.assignee.id, task.assignee.profile),
    createdById: task.createdById,
    dueAt: task.dueAt?.toISOString() ?? null,
    reminderAt: task.reminderAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function findTaskAssignees(
  creatorId: string,
  creatorRole: UserRole,
): Promise<TaskAssigneeDto[]> {
  const users = await prisma.user.findMany({
    where: { profile: { isNot: null } },
    select: {
      id: true,
      profile: {
        select: {
          displayName: true,
          role: { select: { code: true } },
        },
      },
    },
    orderBy: { email: "asc" },
  });

  const assignees: TaskAssigneeDto[] = [];
  for (const user of users) {
    if (!user.profile) {
      throw new Error("A task assignee query returned a user without a profile.");
    }

    const role = mapUserRole(user.profile.role.code);
    if (canAssignTask(creatorId, creatorRole, user.id, role)) {
      assignees.push({
        id: user.id,
        displayName: user.profile.displayName,
        role,
      });
    }
  }

  return assignees;
}

export type CreateTaskResult =
  | { kind: "created"; task: Task }
  | { kind: "invalid-assignee" };

export async function createTask(
  creatorId: string,
  creatorRole: UserRole,
  input: CreateTaskRequestDto,
): Promise<CreateTaskResult> {
  return prisma.$transaction(async (transaction) => {
    const assignee = await transaction.user.findUnique({
      where: { id: input.assigneeId },
      select: {
        id: true,
        profile: {
          select: {
            displayName: true,
            role: { select: { code: true } },
          },
        },
      },
    });

    if (!assignee?.profile) {
      return { kind: "invalid-assignee" };
    }

    const assigneeRole = mapUserRole(assignee.profile.role.code);
    if (!canAssignTask(creatorId, creatorRole, assignee.id, assigneeRole)) {
      return { kind: "invalid-assignee" };
    }

    const [status, priority] = await Promise.all([
      transaction.taskStatus.findUnique({
        where: { code: TaskStatus.Open },
        select: { id: true },
      }),
      transaction.taskPriority.findUnique({
        where: { code: input.priority ?? TaskPriority.Normal },
        select: { id: true },
      }),
    ]);

    if (!status || !priority) {
      throw new Error("Task lookup data is missing from the database.");
    }

    const task = await transaction.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        statusId: status.id,
        priorityId: priority.id,
        rewardPoints: input.rewardPoints ?? 0,
        estimateMinutes: input.estimateMinutes ?? null,
        requiresApproval: input.requiresApproval ?? false,
        assigneeId: assignee.id,
        createdById: creatorId,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
      },
      select: taskSelect,
    });

    return { kind: "created", task: mapTask(task) };
  });
}
