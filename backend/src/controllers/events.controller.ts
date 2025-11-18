import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { EventModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { io } from "../sockets";
import type { AuthRequest } from "../middleware/auth";

export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await EventModel.create({
    ...req.body,
    collegeId: req.authUser?.collegeId,
    createdBy: req.authUser?.id
  });
  io.emit("newAnnouncement", { title: event.title, body: event.description });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: event });
});

export const listEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const events = await EventModel.find({ collegeId: req.authUser?.collegeId }).sort({ startDate: 1 });
  res.json({ status: StatusCodes.OK, data: events });
});

export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await EventModel.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.authUser?.collegeId },
    req.body,
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: event });
});

export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  await EventModel.findOneAndDelete({ _id: req.params.id, collegeId: req.authUser?.collegeId });
  res.status(StatusCodes.NO_CONTENT).send();
});

