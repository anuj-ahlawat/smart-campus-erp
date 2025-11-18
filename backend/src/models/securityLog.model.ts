import { Schema, model, type InferSchemaType } from "mongoose";

const securityLogSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scannedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    outpassId: { type: Schema.Types.ObjectId, ref: "Outpass", required: true },
    action: { type: String, enum: ["exit", "entry", "invalid"], required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

securityLogSchema.index({ outpassId: 1, timestamp: -1 });

export type SecurityLogDocument = InferSchemaType<typeof securityLogSchema>;
export const SecurityLogModel = model("SecurityLog", securityLogSchema);

