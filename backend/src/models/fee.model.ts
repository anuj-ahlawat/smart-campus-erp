import { Schema, model, type InferSchemaType } from "mongoose";

const feeSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    term: { type: String, required: true },
    component: {
      type: String,
      enum: ["tuition", "hostel", "transport", "exam", "library", "other"],
      required: true
    },
    label: { type: String },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["not_paid", "partial", "paid"],
      default: "not_paid",
      index: true
    },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

feeSchema.index({ collegeId: 1, studentId: 1, term: 1 });

export type FeeDocument = InferSchemaType<typeof feeSchema>;
export const FeeModel = model("Fee", feeSchema);
