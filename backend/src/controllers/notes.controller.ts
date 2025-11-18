import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { NoteModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";

export const uploadNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await NoteModel.create({
    collegeId: req.authUser?.collegeId,
    teacherId: req.authUser?.id,
    subjectId: req.body.subjectId,
    title: req.body.title,
    fileUrl: req.body.fileUrl ?? req.file?.path,
    description: req.body.description
  });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: note });
});

export const getNotesBySubject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notes = await NoteModel.find({
    subjectId: req.params.subjectId,
    collegeId: req.authUser?.collegeId
  }).sort({ createdAt: -1 });
  res.json({ status: StatusCodes.OK, data: notes });
});

