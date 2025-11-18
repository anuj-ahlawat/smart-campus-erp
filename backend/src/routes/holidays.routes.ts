import { Router } from "express";
import {
  createHoliday,
  listHolidays,
  updateHoliday,
  deleteHoliday
} from "../controllers/holidays.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { holidayCreateSchema, holidayUpdateSchema } from "../validations/schedule.validation";

const router = Router();

router.get("/", requireAuth, listHolidays);
router.post(
  "/",
  requireAuth,
  roleGuard(["admin", "warden"]),
  validate(holidayCreateSchema),
  createHoliday
);
router.put(
  "/:id",
  requireAuth,
  roleGuard(["admin", "warden"]),
  validate(holidayUpdateSchema),
  updateHoliday
);
router.delete("/:id", requireAuth, roleGuard("admin"), deleteHoliday);

export default router;

