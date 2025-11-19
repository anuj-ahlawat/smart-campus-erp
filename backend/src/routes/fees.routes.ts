import { Router } from "express";
import { createFees, listFees, updateFee } from "../controllers/fees.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { createFeeSchema, updateFeeSchema } from "../validations/fee.validation";

const router = Router();

// Admin can see all fees; parents can see fees for their mapped child (frontend always passes studentId)
router.get("/", requireAuth, roleGuard(["admin", "parent"]), listFees);
router.post("/", requireAuth, roleGuard("admin"), validate(createFeeSchema), createFees);
router.put("/:id", requireAuth, roleGuard("admin"), validate(updateFeeSchema), updateFee);

export default router;
