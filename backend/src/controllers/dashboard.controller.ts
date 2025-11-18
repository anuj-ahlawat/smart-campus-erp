import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel, OutpassModel, HostelRoomModel, SecurityLogModel } from "../models";
import type { AuthRequest } from "../middleware/auth";

export const getAdminStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const collegeId = req.authUser.collegeId;

  // Count students
  const studentCount = await UserModel.countDocuments({
    collegeId,
    role: "student",
    status: { $ne: "inactive" }
  });

  // Count pending outpasses
  const pendingOutpassCount = await OutpassModel.countDocuments({
    collegeId,
    status: "pending"
  });

  // Calculate hostel occupancy
  const totalRooms = await HostelRoomModel.countDocuments({ collegeId });
  const occupiedRooms = await HostelRoomModel.countDocuments({
    collegeId,
    isOccupied: true
  });
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Count incidents (security logs with invalid action)
  const incidentsCount = await SecurityLogModel.countDocuments({
    collegeId,
    action: "invalid"
  });

  res.json({
    status: StatusCodes.OK,
    data: {
      students: studentCount,
      pendingOutpass: pendingOutpassCount,
      hostelOccupancy: occupancyPercentage,
      incidents: incidentsCount,
      totalRooms,
      occupiedRooms
    }
  });
});

