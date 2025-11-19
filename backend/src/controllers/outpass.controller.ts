import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { OutpassModel, OutpassLogModel, SecurityLogModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { buildQr, verifyQrPayload, type SignedQrPayload } from "../services/qr.service";
import type { AuthRequest } from "../middleware/auth";
import { io } from "../sockets";
import { logAdminAction } from "../utils/adminLogger";

export const applyOutpass = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }
  const outpass = await OutpassModel.create({
    collegeId: req.authUser.collegeId,
    studentId: req.authUser.id,
    ...req.body
  });
  const qr = await buildQr({
    outpassId: outpass._id.toString(),
    token: outpass.id,
    studentId: req.authUser!.id,
    issuedAt: Date.now()
  });
  outpass.qrCodeUrl = qr.dataUrl;
  await outpass.save();
  io.emit("outpassStatusChanged", { id: outpass._id, status: outpass.status });
  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: outpass });
});

export const getOutpass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const outpass = await OutpassModel.findById(req.params.id);
  res.json({ status: StatusCodes.OK, data: outpass });
});

export const listStudentOutpass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const outpasses = await OutpassModel.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
  res.json({ status: StatusCodes.OK, data: outpasses });
});

export const listPendingForWarden = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const docs = await OutpassModel.find({
    collegeId: req.authUser.collegeId,
    wardenApproval: "pending",
    status: { $nin: ["cancelled", "rejected"] }
  })
    .sort({ createdAt: -1 })
    .populate("studentId", "name email classSection");

  res.json({ status: StatusCodes.OK, data: docs });
});

const updateStatus = async (id: string, status: string, field: string) => {
  const outpass = await OutpassModel.findById(id);
  if (!outpass) throw new Error("Outpass not found");
  (outpass as unknown as Record<string, unknown>)[field] = status;
  if (status === "approved") {
    outpass.status = "approved";
  }
  await outpass.save();
  io.emit("outpassStatusChanged", { id: outpass._id, status: outpass.status });
  return outpass;
};

export const parentDecision = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await updateStatus(req.params.id, req.body.decision, "parentApproval");
  res.json({ status: StatusCodes.OK, data: record });
});

export const wardenDecision = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await updateStatus(req.params.id, req.body.decision, "wardenApproval");
  res.json({ status: StatusCodes.OK, data: record });
});

export const adminOverride = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await OutpassModel.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, adminOverride: true },
    { new: true }
  );
  await logAdminAction("outpass.override", { outpassId: req.params.id, status: req.body.status });
  res.json({ status: StatusCodes.OK, data: record });
});

export const scanOutpass = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }
  const { payload, action: requestedAction, location } = req.body as {
    payload: SignedQrPayload;
    action?: string;
    location?: string;
  };
  if (!payload || !verifyQrPayload(payload)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "QR_INVALID",
      message: "QR payload invalid or expired"
    });
  }

  const outpassId = payload.outpassId ?? req.params.id;
  const outpass = await OutpassModel.findById(outpassId);
  if (!outpass) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      code: "OUTPASS_NOT_FOUND",
      message: "Outpass not found"
    });
  }

  const action = requestedAction ?? "exit";

  const log = await OutpassLogModel.create({
    collegeId: req.authUser?.collegeId,
    outpassId,
    scannedByUserId: req.authUser?.id,
    action,
    location: location ?? "Main Gate"
  });
  await SecurityLogModel.create({
    collegeId: req.authUser?.collegeId,
    studentId: outpass.studentId,
    scannedBy: req.authUser?.id,
    outpassId,
    action
  });
  if (action === "exit") {
    outpass.status = "used";
    await outpass.save();
  }
  io.emit("outpassStatusChanged", { id: outpass._id, status: outpass.status });
  res.json({ status: StatusCodes.OK, data: log });
});

export const cancelOutpass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await OutpassModel.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled" },
    { new: true }
  );
  res.json({ status: StatusCodes.OK, data: record });
});

