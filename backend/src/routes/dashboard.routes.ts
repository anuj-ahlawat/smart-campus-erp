import { Router } from "express";
import { getAdminStats } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.get("/admin/stats", requireAuth, roleGuard("admin"), getAdminStats);

export default router;

