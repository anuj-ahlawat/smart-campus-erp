import { Schema, model, type InferSchemaType } from "mongoose";

const collegeSettingsSchema = new Schema(
  {
    academicYear: { type: String, required: true },
    timetableConfig: {
      slotsPerDay: { type: Number, default: 7 },
      weekDays: { type: [Number], default: [1, 2, 3, 4, 5] }
    },
    hostelConfig: {
      totalRooms: { type: Number, default: 0 },
      curfewTime: { type: String, default: "21:00" }
    }
  },
  { _id: false }
);

const collegeSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, unique: true },
    address: { type: String },
    settings: { type: collegeSettingsSchema, required: true }
  },
  { timestamps: true }
);

collegeSchema.index({ name: "text", code: 1 });

export type CollegeDocument = InferSchemaType<typeof collegeSchema>;
export const CollegeModel = model("College", collegeSchema);


