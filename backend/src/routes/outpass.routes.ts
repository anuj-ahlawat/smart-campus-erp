import { Router } from "express";
import {
  applyOutpass,
  getOutpass,
  listStudentOutpass,
  listPendingForWarden,
  parentDecision,
  wardenDecision,
  adminOverride,
  scanOutpass,
  cancelOutpass
} from "../controllers/outpass.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import {
  applyOutpassSchema,
  approveOutpassSchema,
  adminOverrideSchema
} from "../validations/outpass.validation";
import { outpassLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/apply",
  requireAuth,
  roleGuard("student"),
  outpassLimiter,
  validate(applyOutpassSchema),
  applyOutpass
);

// Warden queue must be defined before the generic :id route
router.get("/queue", requireAuth, roleGuard("warden"), listPendingForWarden);

router.get(
  "/student/:studentId",
  requireAuth,
  roleGuard(["student", "parent", "warden", "admin"]),
  listStudentOutpass
);

router.get("/:id", requireAuth, getOutpass);

router.put(
  "/:id/parent-approve",
  requireAuth,
  roleGuard("parent"),
  validate(approveOutpassSchema),
  parentDecision
);

router.put(
  "/:id/warden-approve",
  requireAuth,
  roleGuard("warden"),
  validate(approveOutpassSchema),
  wardenDecision
);

router.put(
  "/:id/admin-override",
  requireAuth,
  roleGuard("admin"),
  validate(adminOverrideSchema),
  adminOverride
);

router.put("/:id/cancel", requireAuth, roleGuard("student"), cancelOutpass);

router.post(
  "/:id/scan",
  requireAuth,
  roleGuard("security"),
  outpassLimiter,
  scanOutpass
);

export default router;

