import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
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

  const options: SignOptions = { expiresIn: env.jwtExpiresIn as any };
  return jwt.sign(payload, env.jwtSecret as Secret, options as any);
};

export const signRefreshToken = (user: UserDocument) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    collegeId: user.collegeId.toString(),
    role: user.role,
    email: user.email,
    tokenVersion: user.refreshTokenVersion ?? 0
  };

  const options: SignOptions = { expiresIn: env.refreshExpiresIn as any };
  return jwt.sign(payload, env.refreshSecret as Secret, options as any);
};

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtSecret) as TokenPayload;
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.refreshSecret) as TokenPayload;
