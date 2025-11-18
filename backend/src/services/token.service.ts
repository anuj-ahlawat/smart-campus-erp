import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserDocument } from "../models";

export interface TokenPayload {
  sub: string;
  collegeId: string;
  role: string;
  email: string;
  tokenVersion: number;
}

export const signAccessToken = (user: UserDocument) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    collegeId: user.collegeId.toString(),
    role: user.role,
    email: user.email,
    tokenVersion: user.refreshTokenVersion ?? 0
  };

  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const signRefreshToken = (user: UserDocument) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    collegeId: user.collegeId.toString(),
    role: user.role,
    email: user.email,
    tokenVersion: user.refreshTokenVersion ?? 0
  };

  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshExpiresIn });
};

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtSecret) as TokenPayload;
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.refreshSecret) as TokenPayload;


