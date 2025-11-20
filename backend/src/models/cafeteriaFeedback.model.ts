import { Schema, model, type InferSchemaType } from "mongoose";

const cafeteriaFeedbackSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    menuId: { type: Schema.Types.ObjectId, ref: "CafeteriaMenu", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

cafeteriaFeedbackSchema.index({ collegeId: 1, menuId: 1 });
cafeteriaFeedbackSchema.index({ studentId: 1, menuId: 1 }, { unique: true });

export type CafeteriaFeedbackDocument = InferSchemaType<typeof cafeteriaFeedbackSchema>;
export const CafeteriaFeedbackModel = model("CafeteriaFeedback", cafeteriaFeedbackSchema);
