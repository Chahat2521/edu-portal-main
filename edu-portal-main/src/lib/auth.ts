import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET as string;

if (!SECRET) {
  throw new Error("JWT_SECRET missing from .env.local");
}

// Sign a new token
export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// Verify a token — returns decoded payload or null
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Extract token from Authorization header "Bearer <token>"
export function getTokenFromHeader(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}

// Get decoded user from request — combines above two
export function getUserFromRequest(req: NextRequest): any {
  const token = getTokenFromHeader(req);
  if (!token) return null;
  return verifyToken(token);
}

// Check if user has required role
export function requireRole(
  req: NextRequest,
  role: string | string[]
): { user: any; error: NextResponse | null } {
  const user = getUserFromRequest(req);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
