import type { NextFunction, Request, Response } from "express";

// Simple centralized error handler
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: {
      message,
      status
    }
  });
}

