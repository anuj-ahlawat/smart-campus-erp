import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`Connected to MongoDB: ${env.mongoUri.replace(/\/\/.*@/, "//***@")}`);
    
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      logger.error("MongoDB disconnected");
    });
  } catch (error) {
    logger.error("Mongo connection failed", error);
    process.exit(1);
  }
};

