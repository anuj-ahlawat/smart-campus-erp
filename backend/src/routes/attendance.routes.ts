import { Router } from "express";
import {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  updateAttendance
} from "../controllers/attendance.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { markAttendanceSchema, attendanceByStudentSchema } from "../validations/attendance.validation";

const router = Router();

router.post(
  "/mark",
  requireAuth,
  roleGuard(["teacher", "admin"]),
  validate(markAttendanceSchema),
  markAttendance
);

router.get(
  "/student/:studentId",
  requireAuth,
  validate(attendanceByStudentSchema),
  getStudentAttendance
);

router.get(
  "/class/:classId",
  requireAuth,
  roleGuard(["teacher", "admin"]),
  getClassAttendance
);

router.put("/:id", requireAuth, roleGuard(["teacher", "admin"]), updateAttendance);

export default router;

