import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth";

const upload = multer({ dest: "/tmp", limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/", requireAuth, upload.single("file"), uploadFile);

export default router;

