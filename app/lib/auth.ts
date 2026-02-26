import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: number;
  role: string;
};
type JwtPayload = {
  userId: number;
  role: string;
};


export function getAuthUserFromRequest(req: Request): AuthUser | null {
  const header = req.headers.get("authorization");
  if (!header) return null;

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    return { userId: Number(payload.userId), role: String(payload.role) };
  } catch {
    return null;
  }
}
