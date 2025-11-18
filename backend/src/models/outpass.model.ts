import { Schema, model, type InferSchemaType } from "mongoose";

const outpassSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    parentApproval: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    wardenApproval: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminOverride: { type: Boolean, default: false },
    reason: { type: String, required: true },
    type: { type: String, enum: ["day", "leave"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    qrCodeUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "used"],
      default: "pending"
    }
  },
  { timestamps: true }
);

outpassSchema.index({ collegeId: 1, status: 1, createdAt: -1 });
outpassSchema.index({ studentId: 1, createdAt: -1 });

export type OutpassDocument = InferSchemaType<typeof outpassSchema>;
export const OutpassModel = model("Outpass", outpassSchema);

