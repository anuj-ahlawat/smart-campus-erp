import { Schema, model, type InferSchemaType } from "mongoose";

const verificationTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ["email-verify", "password-reset"], required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date }
  },
  { timestamps: true }
);

verificationTokenSchema.index({ token: 1, type: 1 });

export type VerificationTokenDocument = InferSchemaType<typeof verificationTokenSchema>;
export const VerificationTokenModel = model("VerificationToken", verificationTokenSchema);


