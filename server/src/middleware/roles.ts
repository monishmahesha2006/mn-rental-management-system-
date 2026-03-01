import type { Request, Response, NextFunction } from "express";
import type { AuthUserPayload } from "./auth";

export function requireRole(roles: AuthUserPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: "Forbidden" } });
    }
    return next();
  };
}

