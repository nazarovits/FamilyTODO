import { UserRole } from "@familytodo/shared-types";
import { Router } from "express";
import {
  getTaskAssignees,
  postTask,
} from "../handlers/tasks/tasks.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const requireTaskAuth = requireAuth({
  roles: [UserRole.Parent, UserRole.Child],
});

router.get("/assignees", requireTaskAuth, getTaskAssignees);
router.post("/", requireTaskAuth, postTask);

export default router;
