import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { StatusCodes } from "http-status-codes";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      body: req.body,
      params: req.params,
      query: req.query
    };
    const result = schema.safeParse(payload);
    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: result.error.flatten()
      });
    }
    Object.assign(req, result.data);
    next();
  };

