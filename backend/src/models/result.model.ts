import { Schema, model, type InferSchemaType } from "mongoose";

const resultSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: String, required: true },
    marks: Number,
    grade: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    fileUrl: String,
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type ResultDocument = InferSchemaType<typeof resultSchema>;
export const ResultModel = model("Result", resultSchema);

