import { Schema, model, type InferSchemaType } from "mongoose";

const attendanceSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    classSection: { type: String, index: true },
    classDate: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "leave"], required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

attendanceSchema.index({ collegeId: 1, classDate: -1 });
attendanceSchema.index({ studentId: 1, classDate: -1 });
attendanceSchema.index({ classSection: 1, classDate: -1 });

export type AttendanceDocument = InferSchemaType<typeof attendanceSchema>;
export const AttendanceModel = model("Attendance", attendanceSchema);

