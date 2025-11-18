import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "crypto";
import { connectDb } from "../src/config/db";
import { InviteCodeModel } from "../src/models";

type CsvRow = {
  email: string;
  role: string;
  department?: string;
  classSection?: string;
  hostelStatus?: string;
  roomNumber?: string;
};

const parseCsv = (content: string): CsvRow[] =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [email, role, department, classSection, hostelStatus, roomNumber] = line.split(",");
      return {
        email: email?.trim() ?? "",
        role: role?.trim() ?? "",
        department: department?.trim(),
        classSection: classSection?.trim(),
        hostelStatus: hostelStatus?.trim(),
        roomNumber: roomNumber?.trim()
      };
    });

const run = async () => {
  const [fileArg, collegeArg, adminArg] = process.argv.slice(2);
  if (!fileArg || !collegeArg) {
    console.error("Usage: ts-node scripts/import-invites.ts <csv-file> <collegeId> [adminId]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  await connectDb();

  const content = fs.readFileSync(resolvedPath, "utf-8");
  const rows = parseCsv(content);
  if (!rows.length) {
    console.warn("No rows detected in CSV");
    process.exit(0);
  }

  const invites = rows.map((row) => ({
    collegeId: collegeArg,
    code: `INV-${randomUUID().slice(0, 8).toUpperCase()}`,
    role: row.role || "student",
    department: row.department,
    classSection: row.classSection,
    hostelStatus: row.hostelStatus === "true",
    roomNumber: row.roomNumber,
    createdByAdminId: adminArg ?? collegeArg,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  }));

  await InviteCodeModel.insertMany(invites);
  console.log(`Imported ${invites.length} invite codes for college ${collegeArg}`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to import invites", error);
  process.exit(1);
});

