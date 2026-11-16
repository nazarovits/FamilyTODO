import { TaskPriority } from "@familytodo/shared-types";
import { z } from "zod";

const dateTime = z.iso.datetime({ offset: true }).optional().nullable();

export const createTaskRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().nullable().optional(),
    priority: z.enum(TaskPriority).optional(),
    rewardPoints: z.number().int().min(0).optional(),
    estimateMinutes: z.number().int().positive().nullable().optional(),
    requiresApproval: z.boolean().optional(),
    assigneeId: z.string().uuid(),
    dueAt: dateTime,
    reminderAt: dateTime,
  })
  .strict();
