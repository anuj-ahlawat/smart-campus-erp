import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { AttendanceModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { io } from "../sockets";
import type { AuthRequest } from "../middleware/auth";

export const markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, date, present } = req.body as {
    classId: string;
    subjectId: string;
    date: string;
    present: string[];
  };

  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const classDate = new Date(date);
  const sessionId = `${classId}-${subjectId}-${classDate.toISOString()}`;
  if (!present || present.length === 0) {
    return res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: [] });
  }

  try {
    // Upsert one record per student for this class/subject/date
    const operations = present.map((studentId) =>
      AttendanceModel.findOneAndUpdate(
        {
          collegeId: req.authUser!.collegeId,
          studentId,
          subjectId,
          classSection: classId,
          classDate
        },
        {
          $set: {
            status: "present",
            teacherId: req.authUser!.id,
            sessionId
          }
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(operations);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "ATTENDANCE_SAVE_FAILED",
      message: "Failed to save attendance records",
      error: error instanceof Error ? error.message : String(error)
    });
  }

  if (io) {
    io.emit("attendanceMarked", { classId, subjectId, date });
  }

  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED });
});

export const getStudentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  const { start, end } = req.query;
  const criteria: Record<string, unknown> = {
    studentId,
    collegeId: req.authUser?.collegeId
  };
  if (start && end) {
    criteria.classDate = {
      $gte: new Date(String(start)),
      $lte: new Date(String(end))
    };
  }
  const records = await AttendanceModel.find(criteria).sort({ classDate: -1 });
  res.json({ status: StatusCodes.OK, data: records });
});

export const getClassAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  const { date } = req.query;
  const records = await AttendanceModel.find({
    collegeId: req.authUser?.collegeId,
    classSection: classId,
    ...(date ? { classDate: new Date(String(date)) } : {})
  });
  res.json({ status: StatusCodes.OK, data: records });
});

export const updateAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await AttendanceModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser?.collegeId },
    req.body,
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: record });
});

