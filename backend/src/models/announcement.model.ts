import { Schema, model, type InferSchemaType } from "mongoose";

const announcementSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    scheduleAt: Date
  },
  { timestamps: true }
);

announcementSchema.index({ scheduleAt: 1 });

export type AnnouncementDocument = InferSchemaType<typeof announcementSchema>;
export const AnnouncementModel = model("Announcement", announcementSchema);

