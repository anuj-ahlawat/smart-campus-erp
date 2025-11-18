import { Router } from "express";
import { createSlot, listSlots, updateSlot, deleteSlot } from "../controllers/timetable.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { timetableSchema } from "../validations/schedule.validation";

const router = Router();

router.use(requireAuth, roleGuard(["admin", "teacher"]));

router.get("/", listSlots);
router.post("/", validate(timetableSchema), createSlot);
router.put("/:id", updateSlot);
router.delete("/:id", deleteSlot);

export default router;

