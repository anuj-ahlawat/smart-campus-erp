/**
 * Script to fix existing colleges with empty code values
 * Run with: tsx scripts/fix-empty-college-codes.ts
 */
import mongoose from "mongoose";
import { CollegeModel } from "../src/models/college.model";
import { env } from "../src/config/env";

const fixEmptyCodes = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    // Find all colleges with empty or missing codes
    const colleges = await CollegeModel.find({
      $or: [{ code: "" }, { code: { $exists: false } }]
    });

    console.log(`Found ${colleges.length} colleges with empty codes`);

    for (const college of colleges) {
      const newCode = `COL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      college.code = newCode;
      await college.save();
      console.log(`Updated college "${college.name}" with code: ${newCode}`);
    }

    console.log("All empty codes fixed!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error fixing codes:", error);
    process.exit(1);
  }
};

fixEmptyCodes();

