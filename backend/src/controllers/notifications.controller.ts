import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { notify } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";

export const sendNotification = asyncHandler(async (req: Request, res: Response) => {
  await notify(req.body);
  res.status(StatusCodes.OK).json({ status: StatusCodes.OK, message: "Notification sent" });
});

