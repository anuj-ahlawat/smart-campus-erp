import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { TimetableModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";

export const createSlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slot = await TimetableModel.create({
    ...req.body,
    collegeId: req.authUser?.collegeId
  });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: slot });
});

export const listSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classSection } = req.query;
  const filter: Record<string, unknown> = { collegeId: req.authUser?.collegeId };
  if (classSection) {
    filter.classSection = classSection;
  }
  const slots = await TimetableModel.find(filter).sort({ dayOfWeek: 1, startTime: 1 });
  res.json({ status: StatusCodes.OK, data: slots });
});

export const updateSlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slot = await TimetableModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser?.collegeId },
    req.body,
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: slot });
});

export const deleteSlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  await TimetableModel.findOneAndDelete({ _id: req.params.id, collegeId: req.authUser?.collegeId });
  res.status(StatusCodes.NO_CONTENT).send();
});

