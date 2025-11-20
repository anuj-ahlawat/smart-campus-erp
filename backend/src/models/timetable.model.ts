import { Schema, model, type InferSchemaType } from "mongoose";

const timetableSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    classSection: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    // Store course/subject identifier as a string (e.g. course code) so admin timetable
    // can reference the same codes used in the Courses API without needing a Subject doc.
    subjectId: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    room: String
  },
  { timestamps: true }
);

timetableSchema.index({ collegeId: 1, classSection: 1, dayOfWeek: 1 });

export type TimetableDocument = InferSchemaType<typeof timetableSchema>;
export const TimetableModel = model("Timetable", timetableSchema);

