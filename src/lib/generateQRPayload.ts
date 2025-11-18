import { API_BASE_URL } from "./routes";

const encode = (value: string) =>
  typeof window === "undefined" ? Buffer.from(value).toString("base64") : btoa(value);

export const generateSignedQR = (outpassId: string, token: string) => {
  const payload = {
    outpassId,
    token,
    issuedAt: Date.now()
  };
  const url = new URL(`/qr/outpass/${outpassId}`, API_BASE_URL);
  url.searchParams.set("payload", encode(JSON.stringify(payload)));
  return url.toString();
};

export const generateQRPayload = generateSignedQR;

