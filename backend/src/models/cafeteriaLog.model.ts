import { Schema, model, type InferSchemaType } from "mongoose";

const cafeteriaLogSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    menuId: { type: Schema.Types.ObjectId, ref: "CafeteriaMenu", required: true },
    itemId: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["eaten", "not-eaten"], default: "eaten" }
  },
  { timestamps: true }
);

cafeteriaLogSchema.index({ studentId: 1, createdAt: -1 });
cafeteriaLogSchema.index({ collegeId: 1, timestamp: -1 });

export type CafeteriaLogDocument = InferSchemaType<typeof cafeteriaLogSchema>;
export const CafeteriaLogModel = model("CafeteriaLog", cafeteriaLogSchema);

