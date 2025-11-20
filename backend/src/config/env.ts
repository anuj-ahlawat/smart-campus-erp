import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5050),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/smart-campus",
  jwtSecret: process.env.JWT_SECRET ?? "super-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? "refresh-secret",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  emailVerificationUrl: process.env.EMAIL_VERIFY_URL ?? "http://localhost:3000/auth/verify",
  frontendBaseUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  mailerFrom: process.env.MAILER_FROM ?? "no-reply@smart-campus.app",
  smtpHost: process.env.SMTP_HOST ?? "smtp.mailtrap.io",
  smtpPort: Number(process.env.SMTP_PORT ?? 2525),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  socketCors: process.env.SOCKET_CORS ?? "*",
  qrSigningSecret: process.env.QR_SIGNING_SECRET ?? "qr-secret",
  inviteCsvUploadDir: process.env.INVITE_UPLOAD_DIR ?? "./uploads/invites",
  securityAlertEmail: process.env.SECURITY_ALERT_EMAIL ?? ""
};
