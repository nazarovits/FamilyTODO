import type { Request, Response } from "express";

export function getDashboard(_req: Request, res: Response): void {
  res.status(200).json({
    data: {
      tasks: [],
    },
  });
}
