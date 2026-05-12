import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");

export interface TokenPayload {
  id: string;
  role: "student" | "teacher" | "admin";
  name: string;
  sub: string;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (payload.id && !payload.sub) {
      payload.sub = payload.id as string;
    }
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(header: string | null): string | null {
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
