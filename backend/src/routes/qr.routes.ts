import { Router } from "express";
import { getOutpassQr } from "../controllers/qr.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.get(
  "/outpass/:outpassId",
  requireAuth,
  roleGuard(["student", "warden", "security", "admin"]),
  getOutpassQr
);

export default router;

