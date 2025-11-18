import { sendMail } from "../config/mailer";
import { io } from "../sockets";

export type NotificationPayload = {
  title: string;
  body: string;
  audience: string[];
};

export const notify = async ({ title, body, audience }: NotificationPayload) => {
  // emit in-app
  io.emit("newAnnouncement", { title, body });
  // send email placeholders
  await Promise.all(
    audience.map((email) =>
      sendMail(email, title, `<p>${body}</p>`)
    )
  );
};

