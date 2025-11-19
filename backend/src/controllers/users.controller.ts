import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models";
import type { AuthRequest } from "../middleware/auth";
import { hashPassword } from "../utils/password";

const ensureAuth = (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
    return false;
  }
  return true;
};

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  const { role, department, hostelStatus, parentEmail } = req.query;
  const filter: Record<string, unknown> = {
    collegeId: req.authUser!.collegeId,
    status: { $ne: "inactive" }
  };
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (hostelStatus !== undefined) filter.hostelStatus = hostelStatus === "true";
  if (parentEmail) filter.parentEmail = parentEmail;
  const users = await UserModel.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 });
  res.json({ status: StatusCodes.OK, data: users });
});

export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  const user = await UserModel.findOne({
    _id: req.params.id,
    collegeId: req.authUser!.collegeId
  });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "USER_NOT_FOUND",
      message: "User not found"
    });
  }
  res.json({ status: StatusCodes.OK, data: user });
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  const { password, ...rest } = req.body;
  const payload = {
    ...rest,
    collegeId: req.authUser!.collegeId,
    passwordHash: await hashPassword(password)
  };
  const user = await UserModel.create(payload);
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: user });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  const { password, ...rest } = req.body;
  const updatePayload: Record<string, unknown> = {
    ...rest
  };
  if (password) {
    updatePayload.passwordHash = await hashPassword(password);
  }
  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser!.collegeId },
    updatePayload,
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: user });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  await UserModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser!.collegeId },
    {
      status: "inactive",
      deactivatedAt: new Date()
    }
  );
  res.status(StatusCodes.NO_CONTENT).send();
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!ensureAuth(req, res)) return;
  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser!.collegeId },
    { role: req.body.role },
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: user });
});

