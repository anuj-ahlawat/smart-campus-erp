import { Schema, model, type InferSchemaType } from "mongoose";

const holidaySchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    title: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    description: String,
    category: { type: String, enum: ["college", "hostel", "canteen"], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export type HolidayDocument = InferSchemaType<typeof holidaySchema>;
export const HolidayModel = model("Holiday", holidaySchema);

