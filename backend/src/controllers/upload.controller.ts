import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "FILE_REQUIRED",
      message: "Please attach a file"
    });
  }
  const result = await cloudinary.uploader.upload(file.path, { folder: "smart-campus" });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: { url: result.secure_url } });
});

