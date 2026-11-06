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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function requestJson(
  path: string,
  init: RequestInit,
): Promise<unknown> {
  const response = await fetch(path, init);
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

export async function getJson(path: string): Promise<unknown> {
  return requestJson(path, { method: "GET" });
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
