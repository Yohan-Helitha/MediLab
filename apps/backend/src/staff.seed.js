import mongoose from "mongoose";
import connectDB from "./config/db.js";
import HealthOfficer from "./modules/auth/healthOfficer.model.js";
import authService from "./modules/auth/auth.service.js";

async function seedStaffHealthOfficer() {
  try {
    await connectDB();

    const username = "staff_user";
    const employeeId = "EMP-STAFF-001";
    const email = "staff@example.com";
    const plainPassword = "Staff@123"; // password you will use to log in

    console.log("[staff-seed] Clearing any existing staff user with same identifiers...");
    await HealthOfficer.deleteMany({
      $or: [{ username }, { employeeId }, { email }],
    });

    console.log("[staff-seed] Hashing password...");
    const passwordHash = await authService.hashPassword(plainPassword);

    console.log("[staff-seed] Creating Staff health officer user...");
    const staff = await HealthOfficer.create({
      fullName: "Staff User",
      gender: "OTHER",
      employeeId,
      contactNumber: "0771234567",
      email,
      assignedArea: "Test Area",
      role: "Staff",
      username,
      passwordHash,
      isActive: true,
    });

    console.log("[staff-seed] Staff user created successfully:");
    console.log("  _id:", staff._id.toString());
    console.log("  username:", username);
    console.log("  employeeId:", employeeId);
    console.log("  email:", email);
    console.log("  login password:", plainPassword);
    console.log("Use POST /api/auth/health-officer/login with this username or employeeId.");
  } catch (err) {
    console.error("[staff-seed] Error while seeding staff user:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("[staff-seed] MongoDB connection closed.");
  }
}

seedStaffHealthOfficer();
