import { Schema, model, type InferSchemaType } from "mongoose";

const emergencyAlertSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved"],
      default: "open"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

emergencyAlertSchema.index({ collegeId: 1, createdAt: -1 });
emergencyAlertSchema.index({ studentId: 1, createdAt: -1 });

export type EmergencyAlertDocument = InferSchemaType<typeof emergencyAlertSchema>;
export const EmergencyAlertModel = model("EmergencyAlert", emergencyAlertSchema);
