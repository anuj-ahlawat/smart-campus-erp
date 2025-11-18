import { Schema, model, type InferSchemaType } from "mongoose";

const outpassLogSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    outpassId: { type: Schema.Types.ObjectId, ref: "Outpass", required: true, index: true },
    scannedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["exit", "entry", "invalid"], required: true },
    timestamp: { type: Date, default: Date.now },
    location: String
  },
  { timestamps: true }
);

export type OutpassLogDocument = InferSchemaType<typeof outpassLogSchema>;
export const OutpassLogModel = model("OutpassLog", outpassLogSchema);

