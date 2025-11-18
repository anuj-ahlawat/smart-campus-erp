import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, index: true },
    role: {
      type: String,
      enum: ["admin", "student", "teacher", "parent", "warden", "staff", "cafeteria", "security"],
      required: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    department: String,
    classSection: String,
    hostelStatus: { type: Boolean, default: false },
    roomNumber: String,
    parentId: { type: Schema.Types.ObjectId, ref: "User" },
    inviteCodeUsed: { type: Schema.Types.ObjectId, ref: "InviteCode" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deactivatedAt: { type: Date },
    refreshTokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.index({ collegeId: 1, role: 1 });
userSchema.index({ parentId: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);

