import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/api.js";

export const app = express();
export default app;

const webAppUrl = process.env.WEB_APP_URL;
let webAppOrigin: string | undefined;
if (webAppUrl) {
  try {
    webAppOrigin = new URL(webAppUrl).origin;
  } catch {
    throw new Error("WEB_APP_URL must be a valid absolute URL for CORS.");
  }
}

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const publicDirectory = resolve(moduleDirectory, "../public");

app.set("trust proxy", "loopback");
app.use((request, response, next) => {
  const origin = request.get("Origin");
  const isAllowedOrigin = Boolean(origin && origin === webAppOrigin);

  if (origin && isAllowedOrigin) {
    response.vary("Origin");
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (
    request.method === "OPTIONS" &&
    request.get("Access-Control-Request-Method")
  ) {
    if (!isAllowedOrigin) {
      response.sendStatus(403);
      return;
    }

    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: "16kb" }));
app.use(express.static(resolve(moduleDirectory, "../public")));

app.get("/", (_req, res) => {
  console.log("serve index file using res.sendFile");
  res.sendFile(resolve(publicDirectory, "index.html"));
});

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
