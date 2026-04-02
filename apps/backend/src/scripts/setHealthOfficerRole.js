import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Auth from "../modules/auth/auth.model.js";
import HealthOfficer from "../modules/auth/healthOfficer.model.js";

const allowedRoles = new Set([
  "Staff",
  "Lab_Technician",
  "HealthOfficer",
  "MOH",
  "PHI",
  "Nurse",
  "Admin",
  "Doctor",
]);

function printUsageAndExit() {
  // eslint-disable-next-line no-console
  console.log(
    "Usage: node src/scripts/setHealthOfficerRole.js <email> <role>\n" +
      "Example: node src/scripts/setHealthOfficerRole.js yohan@gmail.com Admin",
  );
  process.exit(1);
}

async function main() {
  const [, , emailRaw, roleRaw] = process.argv;
  const email = (emailRaw || "").trim().toLowerCase();
  const role = (roleRaw || "").trim();

  if (!email || !role) printUsageAndExit();
  if (!allowedRoles.has(role)) {
    // eslint-disable-next-line no-console
    console.error(
      `Invalid role '${role}'. Allowed: ${Array.from(allowedRoles).join(", ")}`,
    );
    process.exit(1);
  }

  await connectDB();

  try {
    const authRecord = await Auth.findOne({ email });
    if (!authRecord) {
      throw new Error(`Auth record not found for email: ${email}`);
    }

    if (authRecord.onModel !== "HealthOfficer") {
      throw new Error(
        `User ${email} is not a health officer (onModel=${authRecord.onModel}).`,
      );
    }

    const profile = await HealthOfficer.findById(authRecord.profileId);
    if (!profile) {
      throw new Error(`HealthOfficer profile not found for email: ${email}`);
    }

    authRecord.role = role;
    profile.role = role;

    await Promise.all([authRecord.save(), profile.save()]);

    // eslint-disable-next-line no-console
    console.log("Role updated successfully:");
    // eslint-disable-next-line no-console
    console.log("  email:", email);
    // eslint-disable-next-line no-console
    console.log("  Auth.role:", authRecord.role);
    // eslint-disable-next-line no-console
    console.log("  HealthOfficer.role:", profile.role);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to set role:", err.message || err);
  process.exit(1);
});
