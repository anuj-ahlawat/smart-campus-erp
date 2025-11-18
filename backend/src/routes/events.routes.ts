import { Router } from "express";
import { createEvent, listEvents, updateEvent, deleteEvent } from "../controllers/events.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { eventSchema, eventUpdateSchema } from "../validations/schedule.validation";

const router = Router();

router.get("/", requireAuth, listEvents);
router.post("/", requireAuth, roleGuard(["admin", "warden", "teacher"]), validate(eventSchema), createEvent);
router.put("/:id", requireAuth, roleGuard(["admin", "warden"]), validate(eventUpdateSchema), updateEvent);
router.delete("/:id", requireAuth, roleGuard("admin"), deleteEvent);

export default router;

