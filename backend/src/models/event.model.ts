import { Schema, model, type InferSchemaType } from "mongoose";

const eventSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    audience: [{ type: String }],
    attachments: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1 });

export type EventDocument = InferSchemaType<typeof eventSchema>;
export const EventModel = model("Event", eventSchema);

