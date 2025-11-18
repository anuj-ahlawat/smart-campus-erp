import { Schema, model, type InferSchemaType } from "mongoose";

const itemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    name: String,
    price: Number,
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

const cafeteriaMenuSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    date: { type: Date, required: true, index: true },
    items: [itemSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

cafeteriaMenuSchema.index({ collegeId: 1, date: 1 }, { unique: true });

export type CafeteriaMenuDocument = InferSchemaType<typeof cafeteriaMenuSchema>;
export const CafeteriaMenuModel = model("CafeteriaMenu", cafeteriaMenuSchema);

