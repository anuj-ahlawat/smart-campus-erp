import { Schema, model, type InferSchemaType } from "mongoose";

const noteSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    description: String
  },
  { timestamps: true }
);

export type NoteDocument = InferSchemaType<typeof noteSchema>;
export const NoteModel = model("Note", noteSchema);

