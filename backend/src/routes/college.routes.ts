import { Router } from "express";
import { getCollegeSettings, updateCollegeSettings } from "../controllers/college.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { updateCollegeSettingsSchema } from "../validations/college.validation";

const router = Router();

router.use(requireAuth, roleGuard("admin"));

router.get("/settings", getCollegeSettings);
router.put("/settings", validate(updateCollegeSettingsSchema), updateCollegeSettings);

export default router;


