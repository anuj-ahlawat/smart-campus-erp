import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type { UserRole } from "../types/roles";
import type { AuthRequest } from "./auth";

export const roleGuard =
  (allowed: UserRole | UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const roles = Array.isArray(allowed) ? allowed : [allowed];
    if (!req.authUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        code: "AUTH_REQUIRED",
        message: "Authentication required"
      });
    }
    if (!roles.includes(req.authUser.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        code: "ROLE_FORBIDDEN",
        message: "You are not allowed to perform this action"
      });
    }
    next();
  };

