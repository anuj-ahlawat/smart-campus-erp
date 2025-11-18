import QRCode from "qrcode";
import crypto from "crypto";
import { env } from "../config/env";

export interface SignedQrPayload {
  outpassId: string;
  token: string;
  studentId: string;
  issuedAt: number;
  signature: string;
}

const signPayload = (payload: Omit<SignedQrPayload, "signature">) => {
  const json = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", env.qrSigningSecret).update(json).digest("hex");
  return { ...payload, signature };
};

export const buildQr = async (payload: Omit<SignedQrPayload, "signature">) => {
  const signed = signPayload(payload);
  const data = JSON.stringify(signed);
  const dataUrl = await QRCode.toDataURL(data, { errorCorrectionLevel: "H" });
  return { dataUrl, payload: signed };
};

export const verifyQrPayload = (payload: SignedQrPayload) => {
  const { signature, ...rest } = payload;
  const expected = signPayload(rest as Omit<SignedQrPayload, "signature">).signature;
  const isFresh = Date.now() - payload.issuedAt < 1000 * 60 * 30; // 30 mins
  return signature === expected && isFresh;
};

