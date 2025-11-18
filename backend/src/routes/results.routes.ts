import { Router } from "express";
import { uploadResults, getResultsByStudent } from "../controllers/results.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { uploadResultSchema } from "../validations/result.validation";

const router = Router();

router.post(
  "/upload",
  requireAuth,
  roleGuard(["teacher", "admin"]),
  validate(uploadResultSchema),
  uploadResults
);

router.get("/student/:studentId", requireAuth, getResultsByStudent);

export default router;

