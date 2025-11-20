import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { createEmergencyAlert } from "../controllers/emergency.controller";
import { createEmergencyAlertSchema } from "../validations/emergencyAlert.validation";

const router = Router();

router.post(
  "/",
  requireAuth,
  roleGuard(["student"]),
  validate(createEmergencyAlertSchema),
  createEmergencyAlert
);

export default router;
