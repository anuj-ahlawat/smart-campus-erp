import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../services/token.service";
import { UserModel } from "../models";
import type { UserRole } from "../types/roles";

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    role: UserRole;
    email: string;
    collegeId: string;
    name: string;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;
  if (!bearer?.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Missing access token"
    });
  }

  try {
    const token = bearer.replace("Bearer ", "");
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        code: "AUTH_INACTIVE",
        message: "User not found"
      });
    }
    if (user.status !== "active") {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        code: "AUTH_INACTIVE",
        message: "Account is inactive"
      });
    }
    req.authUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      collegeId: user.collegeId.toString(),
      name: user.name
    };
    return next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_INVALID",
      message: "Access token invalid or expired",
      details: (error as Error).message
    });
  }
};

