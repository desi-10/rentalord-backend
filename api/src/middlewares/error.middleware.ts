import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
import { logError } from "../utils/log-error.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal server error";

  logError(err, {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    isOperational: isApiError && err.isOperational,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.details && { details: err.details }),
  });
}
