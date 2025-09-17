import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types";

export function generateToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret);
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
