import { Router } from "express";
import authRouter from "./auth.js";

export const apiRouter = Router();

apiRouter.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/api", authRouter);
