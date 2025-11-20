import nodemailer from "nodemailer";
import { env } from "./env";

// Debug logging to confirm env values are loaded correctly
// NOTE: remove or reduce in production if too noisy
console.log("[MAILER] smtpHost", env.smtpHost, "smtpPort", env.smtpPort);
console.log("[MAILER] smtpUser", JSON.stringify(env.smtpUser));
console.log("[MAILER] smtpPass length", env.smtpPass ? env.smtpPass.length : 0);

// Use Gmail service if smtpHost is smtp.gmail.com, otherwise fall back to generic SMTP
export const mailer =
  env.smtpHost === "smtp.gmail.com"
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass
        }
      })
    : nodemailer.createTransport({
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
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};

