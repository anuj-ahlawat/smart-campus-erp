import { Schema, model, type InferSchemaType } from "mongoose";

const hostelRoomSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, default: 2 },
    occupants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    wardenId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

hostelRoomSchema.index({ collegeId: 1, roomNumber: 1 }, { unique: true });
hostelRoomSchema.index({ wardenId: 1 });

export type HostelRoomDocument = InferSchemaType<typeof hostelRoomSchema>;
export const HostelRoomModel = model("HostelRoom", hostelRoomSchema);

