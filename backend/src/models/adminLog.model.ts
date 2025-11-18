import { Schema, model, type InferSchemaType } from "mongoose";

const adminLogSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: String,
    entity: String,
    payload: Schema.Types.Mixed
  },
  { timestamps: true }
);

adminLogSchema.index({ createdAt: -1 });

export type AdminLogDocument = InferSchemaType<typeof adminLogSchema>;
export const AdminLogModel = model("AdminLog", adminLogSchema);

