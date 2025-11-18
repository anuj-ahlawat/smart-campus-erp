import nodemailer from "nodemailer";
import { env } from "./env";

export const mailer = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await mailer.sendMail({
      from: env.mailerFrom,
      to,
      subject,
      html
    });
  } catch (error) {
    // Log error but don't throw - allows registration/login to proceed even if email fails
    console.error(`Failed to send email to ${to}:`, error);
    throw error; // Re-throw if you want calling code to handle it
  }
};

