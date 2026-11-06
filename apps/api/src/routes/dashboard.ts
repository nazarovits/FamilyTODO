import { Router } from "express";
import { getDashboard } from "../handlers/dashboard/dashboard.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth(), getDashboard);

export default router;
