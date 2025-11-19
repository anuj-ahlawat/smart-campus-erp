import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { FeeModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";

export const createFees = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const docs = await FeeModel.insertMany(
    payload.map((item) => ({
      ...item,
      collegeId: req.authUser?.collegeId
    }))
  );

  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: docs });
});

export const listFees = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, status, term } = req.query;

  const filter: Record<string, unknown> = {
    collegeId: req.authUser?.collegeId
  };

  if (studentId) filter.studentId = studentId;
  if (status) filter.status = status;
  if (term) filter.term = term;

  const docs = await FeeModel.find(filter).sort({ dueDate: 1, createdAt: -1 });
  res.json({ status: StatusCodes.OK, data: docs });
});

export const updateFee = asyncHandler(async (req: AuthRequest, res: Response) => {
  const update: Record<string, unknown> = { ...req.body };

  const doc = await FeeModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser?.collegeId },
    update,
    { new: true }
  );

  if (!doc) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "FEE_NOT_FOUND",
      message: "Fee record not found"
    });
  }

  res.json({ status: StatusCodes.OK, data: doc });
});
