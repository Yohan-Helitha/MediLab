import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authService from "./modules/auth/auth.service.js";

async function seedAuthUsers() {
  try {
    await connectDB();

    console.log("[auth-seed] Seeding test users (patient, admin, PHI)...");

    const patientPassword = "Patient@123";
    const adminPassword = "Admin@123";
    const phiPassword = "Phi@123";

    // ---------------- Patient ----------------
    const patientRegistration = {
      household_id: "SEED-HH-0001",
      full_name: "Seed Patient",
      address: "123 Seed Street, Test City",
      contact_number: "0700000001",
      nic: "SEEDPATIENT001V",
      password: patientPassword,
      date_of_birth: new Date("1990-01-01"),
      gender: "MALE",
      gn_division: "Seed GN Division",
      district: "Colombo",
      photo: "",
      disability_status: false,
      pregnancy_status: false,
    };

    const { patient } = await authService.registerPatient(patientRegistration);

    console.log("[auth-seed] Patient created:");
    console.log("  member_id:", patient.member_id);
    console.log("  nic:", patient.nic);
    console.log("  contact_number:", patient.contact_number);

    // ---------------- Admin Health Officer ----------------
    const adminRegistration = {
      fullName: "Seed Admin Officer",
      gender: "OTHER",
      employeeId: "EMP-SEED-ADMIN-001",
      contactNumber: "0700000002",
      email: "admin.seed@example.com",
      assignedArea: "Seed Area",
      role: "Admin",
      username: "seed_admin",
      password: adminPassword,
    };

    const { healthOfficer: adminOfficer } =
      await authService.registerHealthOfficer(adminRegistration);

    console.log("[auth-seed] Admin Health Officer created:");
    console.log("  employeeId:", adminOfficer.employeeId);
    console.log("  username:", adminOfficer.username);
    console.log("  email:", adminOfficer.email);

    // ---------------- PHI Health Officer ----------------
    const phiRegistration = {
      fullName: "Seed PHI Officer",
      gender: "OTHER",
      employeeId: "EMP-SEED-PHI-001",
      contactNumber: "0700000003",
      email: "phi.seed@example.com",
      assignedArea: "Seed Area",
      role: "PHI",
      username: "seed_phi",
      password: phiPassword,
    };

    const { healthOfficer: phiOfficer } =
      await authService.registerHealthOfficer(phiRegistration);

    console.log("[auth-seed] PHI Health Officer created:");
    console.log("  employeeId:", phiOfficer.employeeId);
    console.log("  username:", phiOfficer.username);
    console.log("  email:", phiOfficer.email);

    console.log("[auth-seed] Seeding completed successfully.");

    // For convenience, log login credentials summary
    console.log("\n[auth-seed] Test login credentials:");
    console.log(
      "Patient -> identifier (example):",
      "SEEDPATIENT001V",
      "or",
      "0700000001",
      "password:",
      patientPassword,
    );
    console.log(
      "Admin HO -> identifier (example username):",
      "seed_admin",
      "password:",
      adminPassword,
    );
    console.log(
      "PHI HO -> identifier (example username):",
      "seed_phi",
      "password:",
      phiPassword,
    );
  } catch (err) {
    console.error("[auth-seed] Error while seeding auth users:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("[auth-seed] MongoDB connection closed.");
  }
}

seedAuthUsers();
