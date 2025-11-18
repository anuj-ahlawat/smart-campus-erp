import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { OutpassModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { buildQr } from "../services/qr.service";
import type { AuthRequest } from "../middleware/auth";

export const getOutpassQr = asyncHandler(async (req: AuthRequest, res: Response) => {
  const outpass = await OutpassModel.findById(req.params.outpassId);
  if (!outpass) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "OUTPASS_NOT_FOUND",
      message: "Outpass not found"
    });
  }
  if (
    req.authUser?.role === "student" &&
    outpass.studentId.toString() !== req.authUser.id
  ) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      code: "ROLE_FORBIDDEN",
      message: "You cannot view this QR"
    });
  }

  const qr = await buildQr({
    outpassId: outpass._id.toString(),
    token: outpass.id,
    studentId: outpass.studentId.toString(),
    issuedAt: Date.now()
  });

  res.json({ status: StatusCodes.OK, data: { qrCodeUrl: qr.dataUrl, payload: qr.payload } });
});

