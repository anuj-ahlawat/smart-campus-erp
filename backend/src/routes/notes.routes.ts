import { Router } from "express";
import multer from "multer";
import { uploadNote, getNotesBySubject } from "../controllers/notes.controller";
import { requireAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validateRequest";
import { uploadNoteSchema } from "../validations/note.validation";

const upload = multer({ dest: "/tmp", limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post(
  "/upload",
  requireAuth,
  roleGuard("teacher"),
  upload.single("file"),
  validate(uploadNoteSchema),
  uploadNote
);

router.get("/subject/:subjectId", requireAuth, getNotesBySubject);

export default router;

