import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { CafeteriaMenuModel, CafeteriaLogModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { io } from "../sockets";
import { logAdminAction } from "../utils/adminLogger";
import type { AuthRequest } from "../middleware/auth";

export const getMenu = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  const target = date ? new Date(String(date)) : new Date();
  target.setHours(0, 0, 0, 0);
  const menu = await CafeteriaMenuModel.findOne({
    collegeId: req.authUser?.collegeId,
    date: target
  });
  res.json({ status: StatusCodes.OK, data: menu });
});

export const publishMenu = asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetDate = new Date(req.body.date);
  targetDate.setHours(0, 0, 0, 0);
  const menu = await CafeteriaMenuModel.findOneAndUpdate(
    { date: targetDate, collegeId: req.authUser?.collegeId },
    {
      ...req.body,
      date: targetDate,
      collegeId: req.authUser?.collegeId,
      createdBy: req.authUser?.id
    },
    { new: true, upsert: true }
  );
  io.emit("menuPublished", menu);
  await logAdminAction("cafeteria.menu", {
    date: req.body.date,
    collegeId: req.authUser?.collegeId,
    actorId: req.authUser?.id
  });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: menu });
});

export const scanMeal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { payload } = req.body as { payload: string };
  try {
    const parsed = JSON.parse(payload);
    const log = await CafeteriaLogModel.create({
      collegeId: req.authUser?.collegeId,
      studentId: parsed.studentId,
      menuId: parsed.menuId,
      itemId: parsed.itemId,
      status: "eaten"
    });
    res.json({ status: StatusCodes.OK, data: log });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "PAYLOAD_INVALID",
      message: "QR payload invalid",
      details: (error as Error).message
    });
  }
});

export const listCafeteriaLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date, studentId } = req.query;
  const criteria: Record<string, unknown> = {
    collegeId: req.authUser?.collegeId
  };
  if (studentId) criteria.studentId = studentId;
  if (date) {
    const start = new Date(String(date));
    const end = new Date(String(date));
    end.setHours(23, 59, 59, 999);
    criteria.createdAt = {
      $gte: start,
      $lte: end
    };
  }
  const logs = await CafeteriaLogModel.find(criteria).sort({ createdAt: -1 });
  res.json({ status: StatusCodes.OK, data: logs });
});

