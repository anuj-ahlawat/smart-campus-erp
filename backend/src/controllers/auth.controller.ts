import { randomUUID } from "crypto";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import {
  AdminLogModel,
  CollegeModel,
  InviteCodeModel,
  UserModel,
  VerificationTokenModel
} from "../models";
import { hashPassword, verifyPassword } from "../utils/password";
import { sendMail } from "../config/mailer";
import {
  inviteTemplate,
  passwordResetTemplate,
  verifyEmailTemplate
} from "../services/emailTemplates";
import { env } from "../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../services/token.service";
import type { AuthRequest } from "../middleware/auth";
import { logAdminAction } from "../utils/adminLogger";
import { logger } from "../config/logger";

const EMAIL_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TTL_MS = 1000 * 60 * 30;

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax", secure: true });
};

export const registerCollege = asyncHandler(async (req, res) => {
  const { collegeName, adminName, adminEmail, password, phone, instituteCode, academicYear } =
    req.body;

  const existingUser = await UserModel.findOne({ email: adminEmail });
  if (existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      code: "ADMIN_EXISTS",
      message: "An account already exists for this email"
    });
  }

  // Generate unique code if instituteCode is not provided or is empty
  // Validation already transforms empty strings to undefined, so we can use ?? here safely
  const collegeCode = instituteCode 
    ? instituteCode 
    : `COL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const college = await CollegeModel.create({
    name: collegeName,
    code: collegeCode,
    address: "",
    settings: {
      academicYear: academicYear || "2025-2026",
      timetableConfig: { slotsPerDay: 7, weekDays: [1, 2, 3, 4, 5] },
      hostelConfig: { totalRooms: 0, curfewTime: "21:00" }
    }
  });

  const passwordHash = await hashPassword(password);
  const adminUser = await UserModel.create({
    collegeId: college._id,
    name: adminName,
    email: adminEmail,
    passwordHash,
    phone,
    role: "admin",
    isEmailVerified: true,
    status: "active"
  });

  return res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    code: "COLLEGE_CREATED",
    message: "College and admin created successfully. You can now sign in.",
    data: { 
      collegeId: college._id.toString(),
      collegeName: college.name,
      adminEmail: adminUser.email
    }
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  // Email verification is disabled - just return success for backward compatibility
  // If a token is provided, mark it as consumed if it exists
  const { token } = req.query as { token: string };
  if (token) {
    const record = await VerificationTokenModel.findOne({ token, type: "email-verify" });
    if (record && !record.consumedAt) {
      await UserModel.findByIdAndUpdate(record.userId, { isEmailVerified: true });
      record.consumedAt = new Date();
      await record.save();
    }
  }

  return res.json({
    status: StatusCodes.OK,
    code: "EMAIL_VERIFIED",
    message: "Email verification is not required. You can sign in directly."
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials"
    });
  }
  // Email verification removed - users can login immediately after registration
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials"
    });
  }
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);
  return res.json({
    status: StatusCodes.OK,
    code: "LOGIN_SUCCESS",
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        collegeId: user.collegeId.toString(),
        email: user.email,
        department: user.department,
        classSection: user.classSection
      }
    }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "REFRESH_MISSING",
      message: "Refresh token missing"
    });
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(payload.sub);
    if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
      throw new Error("Invalid refresh token");
    }
    const accessToken = signAccessToken(user);
    const nextRefresh = signRefreshToken(user);
    setRefreshCookie(res, nextRefresh);
    return res.json({
      status: StatusCodes.OK,
      code: "TOKEN_REFRESHED",
      data: { accessToken }
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "REFRESH_INVALID",
      message: "Unable to refresh token",
      details: (error as Error).message
    });
  }
});

export const logout = asyncHandler(async (req: AuthRequest, res) => {
  if (req.authUser) {
    await UserModel.findByIdAndUpdate(req.authUser.id, { $inc: { refreshTokenVersion: 1 } });
  }
  clearRefreshCookie(res);
  return res.json({
    status: StatusCodes.OK,
    code: "LOGOUT_SUCCESS",
    message: "Logged out"
  });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.json({
      status: StatusCodes.OK,
      code: "RESET_SENT",
      message: "If the email exists, a reset link will be sent"
    });
  }
  const token = randomUUID();
  await VerificationTokenModel.create({
    userId: user._id,
    token,
    type: "password-reset",
    expiresAt: new Date(Date.now() + RESET_TTL_MS)
  });
  const link = `${env.frontendBaseUrl}/auth/reset-password?token=${token}`;
  await sendMail(email, "Reset your Smart Campus password", passwordResetTemplate(link));
  return res.json({
    status: StatusCodes.OK,
    code: "RESET_SENT",
    message: "Password reset email sent"
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const record = await VerificationTokenModel.findOne({ token, type: "password-reset" });
  if (!record || record.expiresAt < new Date() || record.consumedAt) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "TOKEN_INVALID",
      message: "Reset token invalid or expired"
    });
  }
  const passwordHash = await hashPassword(password);
  await UserModel.findByIdAndUpdate(record.userId, {
    passwordHash,
    $inc: { refreshTokenVersion: 1 }
  });
  record.consumedAt = new Date();
  await record.save();
  return res.json({
    status: StatusCodes.OK,
    code: "PASSWORD_UPDATED",
    message: "Password updated"
  });
});

export const createInvite = asyncHandler(async (req: AuthRequest, res) => {
  const { role, department, classSection, hostelStatus, roomNumber, validUntil, bulkCsv } = req.body;
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }
  const collegeId = req.authUser.collegeId;
  const invitesPayload: Array<{
    role?: string;
    department?: string;
    classSection?: string;
    hostelStatus?: boolean;
    roomNumber?: string;
    email?: string;
  }> = [];
  if (bulkCsv) {
    const rows = bulkCsv.split("\n").map((row) => row.trim()).filter(Boolean);
    for (const row of rows) {
      const [email, rowRole, rowDept, rowClass] = row.split(",");
      invitesPayload.push({
        email: email.trim(),
        role: (rowRole?.trim() as string) || role,
        department: rowDept?.trim() ?? department,
        classSection: rowClass?.trim() ?? classSection,
        hostelStatus,
        roomNumber
      });
    }
  } else {
    invitesPayload.push({ role, department, classSection, hostelStatus, roomNumber });
  }

  const codes = [];
  const college = await CollegeModel.findById(collegeId);
  for (const payload of invitesPayload) {
    const code = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const invite = await InviteCodeModel.create({
      collegeId,
      code,
      role: payload.role ?? role,
      department: payload.department,
      classSection: payload.classSection,
      hostelStatus: payload.hostelStatus ?? hostelStatus,
      roomNumber: payload.roomNumber ?? roomNumber,
      createdByAdminId: req.authUser.id,
      validUntil: validUntil ? new Date(validUntil) : undefined
    });
    codes.push(invite);
    if ("email" in payload && payload.email) {
      await sendMail(
        payload.email,
        `Invite to join Smart Campus as ${payload.role}`,
        inviteTemplate({
          inviteLink: `${env.frontendBaseUrl}/auth/register?code=${code}`,
          role: payload.role ?? role,
          collegeName: college?.name ?? "your college"
        })
      );
    }
  }

  await logAdminAction("invite.create", {
    actorId: req.authUser.id,
    collegeId,
    total: codes.length
  });

  return res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    code: "INVITES_CREATED",
    message: "Invite codes created",
    data: codes.map((invite) => ({ code: invite.code }))
  });
});

export const validateInvite = asyncHandler(async (req, res) => {
  const { code } = req.query as { code: string };
  const invite = await InviteCodeModel.findOne({ code });
  if (!invite || invite.isUsed || (invite.validUntil && invite.validUntil < new Date())) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "INVITE_INVALID",
      message: "Invite invalid or expired"
    });
  }
  return res.json({
    status: StatusCodes.OK,
    code: "INVITE_VALID",
    data: {
      role: invite.role,
      department: invite.department,
      classSection: invite.classSection,
      collegeId: invite.collegeId
    }
  });
});

export const registerWithInvite = asyncHandler(async (req, res) => {
  const { code, name, email, phone, password } = req.body;
  const invite = await InviteCodeModel.findOne({ code });
  if (!invite || invite.isUsed) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "INVITE_INVALID",
      message: "Invite invalid"
    });
  }
  if (invite.validUntil && invite.validUntil < new Date()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "INVITE_EXPIRED",
      message: "Invite expired"
    });
  }
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      code: "USER_EXISTS",
      message: "User already exists"
    });
  }
  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    collegeId: invite.collegeId,
    name,
    email,
    phone,
    passwordHash,
    role: invite.role,
    department: invite.department,
    classSection: invite.classSection,
    hostelStatus: invite.hostelStatus,
    roomNumber: invite.roomNumber,
    inviteCodeUsed: invite._id,
    isEmailVerified: true
  });
  invite.isUsed = true;
  invite.usedBy = user._id;
  await invite.save();
  return res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    code: "USER_REGISTERED",
    message: "Account created. Please log in.",
    data: { userId: user._id }
  });
});

export const currentUser = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const user = await UserModel.findById(req.authUser.id).select(
    "name email role phone collegeId department classSection hostelStatus roomNumber status isEmailVerified"
  );

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "USER_NOT_FOUND",
      message: "Unable to load profile"
    });
  }

  return res.json({
    status: StatusCodes.OK,
    code: "AUTH_ME",
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      collegeId: user.collegeId.toString(),
      department: user.department,
      classSection: user.classSection,
      hostelStatus: user.hostelStatus,
      roomNumber: user.roomNumber,
      status: user.status,
      isEmailVerified: user.isEmailVerified
    }
  });
});

