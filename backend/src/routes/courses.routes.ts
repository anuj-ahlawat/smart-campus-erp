import { Router } from "express";
import { listCourses, createCourse } from "../controllers/course.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { createCourseSchema } from "../validations/course.validation";

const router = Router();

router.get("/", requireAuth, roleGuard("admin"), listCourses);
router.post("/", requireAuth, roleGuard("admin"), validate(createCourseSchema), createCourse);

export default router;
