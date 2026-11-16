import {
  isTaskPriority,
  isTaskStatus,
  isUserRole,
  type CreateTaskRequestDto,
  type Task,
  type TaskAssigneeDto,
  type TaskAssigneesResponseDto,
  type TaskResponseDto,
} from "@familytodo/shared-types";
import { ApiRequestError, getJson, postJson } from "../../lib/apiClient";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isTaskAssignee(value: unknown): value is TaskAssigneeDto {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.displayName === "string" &&
    typeof value.role === "string" &&
    isUserRole(value.role)
  );
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (typeof value.description === "string" || value.description === null) &&
    typeof value.status === "string" &&
    isTaskStatus(value.status) &&
    typeof value.priority === "string" &&
    isTaskPriority(value.priority) &&
    typeof value.rewardPoints === "number" &&
    Number.isInteger(value.rewardPoints) &&
    value.rewardPoints >= 0 &&
    (value.estimateMinutes === null ||
      (typeof value.estimateMinutes === "number" &&
        Number.isInteger(value.estimateMinutes) &&
        value.estimateMinutes > 0)) &&
    typeof value.requiresApproval === "boolean" &&
    isTaskAssignee(value.assignee) &&
    typeof value.createdById === "string" &&
    (value.dueAt === null || isTimestamp(value.dueAt)) &&
    (value.reminderAt === null || isTimestamp(value.reminderAt)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

function isTaskAssigneesResponse(
  value: unknown,
): value is TaskAssigneesResponseDto {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    Array.isArray(value.data.assignees) &&
    value.data.assignees.every(isTaskAssignee)
  );
}

function isTaskResponse(value: unknown): value is TaskResponseDto {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    isTask(value.data.task)
  );
}

function invalidResponse(): ApiRequestError {
  return new ApiRequestError("The server returned an invalid response.", 200);
}

export async function getTaskAssignees(): Promise<TaskAssigneeDto[]> {
  const response = await getJson("/api/tasks/assignees");
  if (!isTaskAssigneesResponse(response)) {
    throw invalidResponse();
  }

  return response.data.assignees;
}

export async function createTask(
  request: CreateTaskRequestDto,
): Promise<Task> {
  const response = await postJson("/api/tasks", request);
  if (!isTaskResponse(response)) {
    throw invalidResponse();
  }

  return response.data.task;
}
