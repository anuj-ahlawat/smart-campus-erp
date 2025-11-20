import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { CafeteriaFeedbackModel, CafeteriaMenuModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";

export const submitFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const { rating, comment, date } = req.body as {
    rating: number;
    comment?: string;
    date?: string;
  };

  const target = date ? new Date(String(date)) : new Date();
  target.setHours(0, 0, 0, 0);

  const menu = await CafeteriaMenuModel.findOne({
    collegeId: req.authUser.collegeId,
    date: target
  });

  if (!menu) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "MENU_NOT_FOUND",
      message: "No cafeteria menu found for the selected date"
    });
  }

  const feedback = await CafeteriaFeedbackModel.findOneAndUpdate(
    {
      collegeId: req.authUser.collegeId,
      studentId: req.authUser.id,
      menuId: menu._id
    },
    {
      collegeId: req.authUser.collegeId,
      studentId: req.authUser.id,
      menuId: menu._id,
      rating,
      comment
    },
    { new: true, upsert: true }
  );

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: feedback
  });
});

export const listFeedbackForMenu = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const { date } = req.query;
  const target = date ? new Date(String(date)) : new Date();
  target.setHours(0, 0, 0, 0);

  const menu = await CafeteriaMenuModel.findOne({
    collegeId: req.authUser.collegeId,
    date: target
  });

  if (!menu) {
    return res.json({ status: StatusCodes.OK, data: [] });
  }

  const feedbacks = await CafeteriaFeedbackModel.find({
    collegeId: req.authUser.collegeId,
    menuId: menu._id
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("studentId", "name classSection");

  res.json({ status: StatusCodes.OK, data: feedbacks });
});
