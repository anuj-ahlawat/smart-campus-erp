import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { ResultModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { io } from "../sockets";
import type { AuthRequest } from "../middleware/auth";

export const uploadResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const docs = await ResultModel.insertMany(
    payload.map((item) => ({
      ...item,
      collegeId: req.authUser?.collegeId,
      uploadedBy: req.authUser?.id
    }))
  );
  if (payload.some((item) => item.published)) {
    io.emit("newAnnouncement", { title: "Results published", body: "Check your portal" });
  }
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: docs });
});

export const getResultsByStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const docs = await ResultModel.find({
    studentId: req.params.studentId,
    collegeId: req.authUser?.collegeId
  });
  res.json({ status: StatusCodes.OK, data: docs });
});

