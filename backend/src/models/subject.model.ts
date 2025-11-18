import { Schema, model, type InferSchemaType } from "mongoose";

const subjectSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    department: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

subjectSchema.index({ collegeId: 1, code: 1 }, { unique: true });
subjectSchema.index({ department: 1 });

export type SubjectDocument = InferSchemaType<typeof subjectSchema>;
export const SubjectModel = model("Subject", subjectSchema);

