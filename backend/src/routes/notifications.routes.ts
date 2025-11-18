import { Router } from "express";
import { sendNotification } from "../controllers/notifications.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { sendNotificationSchema } from "../validations/notification.validation";

const router = Router();

router.post("/send", requireAuth, roleGuard(["admin", "warden"]), validate(sendNotificationSchema), sendNotification);

export default router;

