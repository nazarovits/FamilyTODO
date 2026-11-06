import express from "express";
import { resolve } from "node:path";
import { apiRouter } from "./routes/api.js";

export const app = express();
export default app;

app.set("trust proxy", "loopback");
app.use(express.json({ limit: "16kb" }));
app.use(express.static(resolve(process.cwd(), "public")));
app.use(apiRouter);
app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      error.type === "entity.parse.failed"
    ) {
      response.status(400).json({
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      });
      return;
    }

    next(error);
  },
);

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled API error:", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  },
);
