export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredBaseUrl) {
    return "";
  }

  let url: URL;
  try {
    url = new URL(configuredBaseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be an absolute HTTP(S) origin.");
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("VITE_API_BASE_URL must be an absolute HTTP(S) origin.");
  }

  return url.origin;
}

const apiBaseUrl = getApiBaseUrl();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function requestJson(
  path: string,
  init: RequestInit,
): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
  });
  const responseText = await response.text();
  let responseBody: unknown;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown;
    } catch {
      throw new ApiRequestError(
        "The server returned an invalid response.",
        response.status,
      );
    }
  }

  if (!response.ok) {
    const errorBody =
      isRecord(responseBody) && isRecord(responseBody.error)
        ? responseBody.error
        : undefined;
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `The request failed with status ${response.status}.`;
    const code = typeof errorBody?.code === "string" ? errorBody.code : undefined;

    throw new ApiRequestError(message, response.status, code);
  }

  return responseBody;
}

export async function getJson(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  return requestJson(path, { ...init, method: "GET" });
}

export async function post(path: string): Promise<unknown> {
  return requestJson(path, { method: "POST" });
}

export async function postJson(
  path: string,
  body: unknown,
): Promise<unknown> {
  return requestJson(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
