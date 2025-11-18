import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { HolidayModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";

const collegeFilter = (req: AuthRequest) => ({ collegeId: req.authUser?.collegeId });

export const createHoliday = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holiday = await HolidayModel.create({
    ...req.body,
    collegeId: req.authUser?.collegeId,
    createdBy: req.authUser?.id
  });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: holiday });
});

export const listHolidays = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holidays = await HolidayModel.find(collegeFilter(req)).sort({ date: 1 });
  res.json({ status: StatusCodes.OK, data: holidays });
});

export const updateHoliday = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holiday = await HolidayModel.findOneAndUpdate(
    { _id: req.params.id, ...collegeFilter(req) },
    req.body,
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: holiday });
});

export const deleteHoliday = asyncHandler(async (req: AuthRequest, res: Response) => {
  await HolidayModel.findOneAndDelete({ _id: req.params.id, ...collegeFilter(req) });
  res.status(StatusCodes.NO_CONTENT).send();
});

