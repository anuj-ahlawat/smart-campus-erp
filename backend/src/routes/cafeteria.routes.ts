import { Router } from "express";
import { getMenu, publishMenu, scanMeal, listCafeteriaLogs } from "../controllers/cafeteria.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { publishMenuSchema, scanMealSchema } from "../validations/cafeteria.validation";

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

export default router;

