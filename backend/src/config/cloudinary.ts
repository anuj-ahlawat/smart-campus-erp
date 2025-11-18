import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.cloudName,
  api_key: env.cloudKey,
  api_secret: env.cloudSecret
});

export { cloudinary };

