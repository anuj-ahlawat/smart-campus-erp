import { Schema, model, type InferSchemaType } from "mongoose";

const inviteCodeSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    code: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "student", "teacher", "parent", "warden", "staff", "cafeteria", "security"],
      required: true
    },
    department: String,
    classSection: String,
    hostelStatus: { type: Boolean, default: false },
    roomNumber: String,
    createdByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    validUntil: { type: Date },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inviteCodeSchema.index({ collegeId: 1, code: 1 });

export type InviteCodeDocument = InferSchemaType<typeof inviteCodeSchema>;
export const InviteCodeModel = model("InviteCode", inviteCodeSchema);


