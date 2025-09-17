import { Context, Next } from "hono";
import { verifyToken, extractTokenFromHeader } from "../utils";
import { unauthorizedResponse } from "../utils/response";
import type { Env, RequestContext } from "../types";

export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: RequestContext }>,
  next: Next
) {
  if (c.req.path.startsWith("/score/leaderboard")) {
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return unauthorizedResponse(c, "Missing Authorization header");
  }

  try {
    const jwtSecret = c.env.JWT_SECRET || "tinca-salt";
    const payload = verifyToken(token, jwtSecret);

    c.set("user", {
      id: payload.id,
      username: payload.username,
    });

    await next();
  } catch (error) {
    return unauthorizedResponse(c, "Invalid or expired token");
  }
}

export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Env; Variables: RequestContext }>,
  next: Next
) {
  const authHeader = c.req.header("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    try {
      const jwtSecret = c.env.JWT_SECRET || "tinca-salt";
      const payload = verifyToken(token, jwtSecret);

      c.set("user", {
        id: payload.id,
        username: payload.username,
      });
    } catch (error) {}
  }

  await next();
}
