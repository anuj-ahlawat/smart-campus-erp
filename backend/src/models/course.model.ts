import { Schema, model, type InferSchemaType } from "mongoose";

const courseSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

courseSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export type CourseDocument = InferSchemaType<typeof courseSchema>;
export const CourseModel = model("Course", courseSchema);
