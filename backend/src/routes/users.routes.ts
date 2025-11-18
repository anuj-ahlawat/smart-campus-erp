import { Router } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema
} from "../validations/user.validation";

const router = Router();

router.use(requireAuth, roleGuard("admin"));

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.put("/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/:id", deleteUser);

export default router;

