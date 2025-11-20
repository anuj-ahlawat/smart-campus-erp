import { Router } from "express";
import {
  createInvite,
  currentUser,
  login,
  logout,
  refresh,
  registerCollege,
  registerWithInvite,
  requestPasswordReset,
  resetPassword,
  validateInvite,
  verifyEmail,
  updateCurrentUser
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import {
  collegeRegisterSchema,
  inviteCreateSchema,
  inviteRegisterSchema,
  inviteValidateSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  verifyEmailSchema
} from "../validations/auth.validation";

const router = Router();

router.post("/college-register", validate(collegeRegisterSchema), registerCollege);
router.get("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, currentUser);
router.patch("/me", requireAuth, updateCurrentUser);
router.post("/invite/register", validate(inviteRegisterSchema), registerWithInvite);
router.post(
  "/invite/create",
  requireAuth,
  roleGuard("admin"),
  validate(inviteCreateSchema),
  createInvite
);
router.get("/invite/validate", validate(inviteValidateSchema), validateInvite);
router.post("/request-password-reset", validate(passwordResetRequestSchema), requestPasswordReset);
router.post("/reset-password", validate(passwordResetSchema), resetPassword);

export default router;

