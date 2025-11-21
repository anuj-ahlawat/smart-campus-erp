import { Router } from "express";
import { getMenu, publishMenu, scanMeal, listCafeteriaLogs, getCafeteriaCrowd } from "../controllers/cafeteria.controller";
import { submitFeedback, listFeedbackForMenu } from "../controllers/cafeteriaFeedback.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { publishMenuSchema, scanMealSchema } from "../validations/cafeteria.validation";
import { submitFeedbackSchema, listFeedbackSchema } from "../validations/cafeteriaFeedback.validation";

const router = Router();

router.get("/menu", requireAuth, getMenu);
router.post("/menu", requireAuth, roleGuard(["cafeteria", "staff"]), validate(publishMenuSchema), publishMenu);
router.post(
  "/scan",
  requireAuth,
  roleGuard(["cafeteria", "security", "student"]),
  validate(scanMealSchema),
  scanMeal
);
router.get("/logs", requireAuth, roleGuard(["cafeteria", "admin"]), listCafeteriaLogs);
router.get("/crowd", requireAuth, getCafeteriaCrowd);
router.post("/feedback", requireAuth, roleGuard(["student"]), validate(submitFeedbackSchema), submitFeedback);
router.get("/feedback", requireAuth, roleGuard(["cafeteria", "admin"]), validate(listFeedbackSchema), listFeedbackForMenu);

export default router;

