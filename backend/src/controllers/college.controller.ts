import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { CollegeModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";

export const getCollegeSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const college = await CollegeModel.findById(req.authUser?.collegeId).select("name code settings");
  res.json({ status: StatusCodes.OK, data: college?.settings ?? null });
});

export const updateCollegeSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timetableConfig =
    req.body.timetableConfig ??
    {
      slotsPerDay: req.body.slotsPerDay ?? 7,
      weekDays: req.body.weekDays ?? [1, 2, 3, 4, 5]
    };
  const hostelConfig =
    req.body.hostelConfig ??
    {
      totalRooms: req.body.totalRooms ?? 0,
      curfewTime: req.body.curfewTime ?? "21:00"
    };

  const college = await CollegeModel.findByIdAndUpdate(
    req.authUser?.collegeId,
    {
      $set: {
        "settings.academicYear": req.body.academicYear,
        "settings.timetableConfig": timetableConfig,
        "settings.hostelConfig": hostelConfig
      }
    },
    { new: true }
  ).select("settings");
  res.json({ status: StatusCodes.OK, data: college?.settings });
});


