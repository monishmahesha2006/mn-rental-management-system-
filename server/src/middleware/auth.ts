import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
export interface AuthUserPayload {
  id: string;
  email: string;
  role: "OWNER" | "TENANT";
}
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthUserPayload;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: { message: "Invalid token" } });
  }
}