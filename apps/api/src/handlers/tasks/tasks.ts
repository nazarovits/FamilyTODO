import type { Request, Response } from "express";
import type {
  TaskAssigneesResponseDto,
  TaskResponseDto,
} from "@familytodo/shared-types";
import { createTaskRequestSchema } from "../../schemas/tasks.js";
import {
  createTask,
  findTaskAssignees,
} from "../../services/database/tasks.service.js";

export async function getTaskAssignees(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = req.auth;
  if (!auth) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    });
    return;
  }

  if (!auth.role) {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource.",
      },
    });
    return;
  }

  const assignees = await findTaskAssignees(auth.id, auth.role);
  const response: TaskAssigneesResponseDto = { data: { assignees } };
  res.status(200).json(response);
}

export async function postTask(req: Request, res: Response): Promise<void> {
  const auth = req.auth;
  if (!auth) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    });
    return;
  }

  if (!auth.role) {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource.",
      },
    });
    return;
  }

  const result = createTaskRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: {
        code: "INVALID_TASK_REQUEST",
        message: "Task details are invalid.",
      },
    });
    return;
  }

  const created = await createTask(auth.id, auth.role, result.data);
  if (created.kind === "invalid-assignee") {
    res.status(400).json({
      error: {
        code: "INVALID_TASK_ASSIGNEE",
        message: "The selected assignee is invalid or unavailable.",
      },
    });
    return;
  }

  const response: TaskResponseDto = { data: { task: created.task } };
  res.status(201).json(response);
}
