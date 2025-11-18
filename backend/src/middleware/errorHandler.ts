import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger";

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("API Error", err);
  
  // Handle CORS errors
  if (err.message.includes("CORS")) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      code: "CORS_ERROR",
      message: "CORS policy violation"
    });
  }
  
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details
    });
  }
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    code: "INTERNAL_SERVER_ERROR",
    message: isDevelopment ? err.message : "An unexpected error occurred",
    ...(isDevelopment && { stack: err.stack })
  });
};

