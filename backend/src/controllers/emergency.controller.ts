import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { EmergencyAlertModel, UserModel } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { sendMail } from "../config/mailer";
import { emergencyAlertTemplate } from "../services/emailTemplates";
import { env } from "../config/env";

export const createEmergencyAlert = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const { latitude, longitude, accuracy } = req.body as {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "INVALID_LOCATION",
      message: "Latitude and longitude are required."
    });
  }

  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const alert = await EmergencyAlertModel.create({
    collegeId: req.authUser.collegeId,
    studentId: req.authUser.id,
    studentName: req.authUser.name,
    studentEmail: req.authUser.email,
    latitude,
    longitude,
    accuracy,
    status: "open"
  });

  const securityUsers = await UserModel.find({
    collegeId: req.authUser.collegeId,
    role: "security",
    status: "active"
  }).select("email name");

  const audience = securityUsers.map((u) => u.email).filter(Boolean) as string[];

  if (env.securityAlertEmail) {
    audience.push(env.securityAlertEmail);
  }

  if (audience.length > 0) {
    const subject = "Emergency Security Alert – A student needs help";
    const html = emergencyAlertTemplate({
      studentName: req.authUser.name,
      studentId: req.authUser.id,
      studentEmail: req.authUser.email,
      latitude,
      longitude,
      mapsLink
    });

    try {
      await Promise.all(audience.map((email) => sendMail(email, subject, html)));
    } catch (error) {
      // Log and continue; do not fail the alert creation if email sending has issues
      // eslint-disable-next-line no-console
      console.error("Failed to send emergency alert emails", error);
    }
  }

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    message: "Emergency alert created",
    data: {
      id: alert._id,
      mapsLink
    }
  });
});
