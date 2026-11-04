import { createHash, randomBytes } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import type { Request, Response } from "express";

export const sessionCookieName = "familytodo_session";
export const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(request: Request): string | undefined {
  const cookies = parseCookie(request.headers.cookie ?? "");
  const token = cookies[sessionCookieName];

  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export function setSessionCookie(response: Response, token: string): void {
  response.append(
    "Set-Cookie",
    stringifySetCookie({
      name: sessionCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionLifetimeMs / 1000,
    }),
  );
}

export function clearSessionCookie(response: Response): void {
  response.append(
    "Set-Cookie",
    stringifySetCookie({
      name: sessionCookieName,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    }),
  );
}
