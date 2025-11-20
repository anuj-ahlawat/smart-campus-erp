import { Router } from "express";
import { createSlot, listSlots, updateSlot, deleteSlot } from "../controllers/timetable.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { timetableSchema } from "../validations/schedule.validation";

const router = Router();

// All timetable routes require auth. Read access is wider than write access.
router.use(requireAuth);

// Allow admin, teacher, and student to view timetable slots.
router.get("/", roleGuard(["admin", "teacher", "student"]), listSlots);

// Creation and mutations restricted to admin/teacher as before.
router.post("/", roleGuard(["admin", "teacher"]), validate(timetableSchema), createSlot);
router.put("/:id", roleGuard(["admin", "teacher"]), updateSlot);
router.delete("/:id", roleGuard(["admin", "teacher"]), deleteSlot);

export default router;

