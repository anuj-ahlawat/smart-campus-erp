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

// All user routes require auth; only some are admin-only
router.use(requireAuth);

// Admin + Warden + Parent + Teacher can list users
// - Warden uses this for hostel roster
// - Parent uses this with parentEmail filter to fetch their mapped child record
// - Teacher uses this to load students for attendance and class interactions
router.get("/", roleGuard(["admin", "warden", "parent", "teacher"]), listUsers);

// The rest of user management is admin-only
router.get("/:id", roleGuard("admin"), getUser);
router.post("/", roleGuard("admin"), validate(createUserSchema), createUser);
router.put("/:id", roleGuard("admin"), validate(updateUserSchema), updateUser);
router.put("/:id/role", roleGuard("admin"), validate(updateUserRoleSchema), updateUserRole);
router.delete("/:id", roleGuard("admin"), deleteUser);

export default router;

