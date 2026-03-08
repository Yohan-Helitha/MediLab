import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import Member from "../modules/patient/models/Member.js";
import HealthOfficer from "../modules/auth/healthOfficer.model.js";
import Lab from "../modules/lab/lab.model.js";
import TestType from "../modules/test/testType.model.js";
import Booking from "../modules/booking/booking.model.js";

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log(
      "\n🌱 Starting demo data seeding for Test Management Evaluation...\n",
    );

    // Clear existing demo data
    console.log("[0/7] Clearing existing demo data...");
    await Promise.all([
      HealthOfficer.deleteMany({
        employeeId: { $in: ["DEMO_TECH_001", "DEMO_ADMIN_001"] },
      }),
      Member.deleteMany({ member_id: "DEMO001" }),
      Lab.deleteMany({ name: "Central Medical Laboratory" }),
      TestType.deleteMany({ code: { $in: ["BGL001", "HGB001"] } }),
      Booking.deleteMany({ patientNameSnapshot: "Demo Patient" }),
    ]);

    // 1. Create Health Officer (Lab Technician) - Login: demo_officer / Demo@123
    console.log("[1/7] Creating health officer (Lab Technician)...");
    const hashedPasswordOfficer = await bcrypt.hash("Demo@123", 10);
    const healthOfficer = await HealthOfficer.create({
      fullName: "Dr. Demo Technician",
      gender: "MALE",
      employeeId: "DEMO_TECH_001",
      contactNumber: "+94777000001",
      email: "demo.officer@medilab.com",
      assignedArea: "Colombo Region",
      role: "Lab_Technician",
      username: "demo_officer",
      passwordHash: hashedPasswordOfficer,
      isActive: true,
    });

    // 2. Create Admin User - Login: admin_demo / Admin@123
    console.log("[2/7] Creating admin user...");
    const hashedPasswordAdmin = await bcrypt.hash("Admin@123", 10);
    const adminUser = await HealthOfficer.create({
      fullName: "Admin Demo User",
      gender: "MALE",
      employeeId: "DEMO_ADMIN_001",
      contactNumber: "+94777000002",
      email: "admin.demo@medilab.com",
      assignedArea: "National",
      role: "Admin",
      username: "admin_demo",
      passwordHash: hashedPasswordAdmin,
      isActive: true,
    });

    // 3. Create Health Center (Lab)
    console.log("[3/7] Creating health center...");
    const healthCenter = await Lab.create({
      name: "Central Medical Laboratory",
      addressLine1: "456 Health Avenue",
      addressLine2: "Near City Hospital",
      district: "Colombo",
      province: "Western",
      phoneNumber: "+94112345678",
      email: "central@medilab.com",
      operatingHours: [
        { day: "Monday", openTime: "08:00", closeTime: "17:00" },
        { day: "Tuesday", openTime: "08:00", closeTime: "17:00" },
        { day: "Wednesday", openTime: "08:00", closeTime: "17:00" },
        { day: "Thursday", openTime: "08:00", closeTime: "17:00" },
        { day: "Friday", openTime: "08:00", closeTime: "17:00" },
        { day: "Saturday", openTime: "08:00", closeTime: "13:00" },
      ],
      operationalStatus: "OPEN",
      isActive: true,
      createdBy: healthOfficer._id,
    });

    // 4. Create Patient - Login: DEMO001 / Patient@123
    // IMPORTANT: Uses YOUR real phone and email for live SMS/Email demo
    console.log("[4/7] Creating patient...");
    const hashedPasswordPatient = await bcrypt.hash("Patient@123", 10);
    const patient = await Member.create({
      member_id: "DEMO001",
      household_id: "DEMO_HOUSEHOLD_001",
      full_name: "Demo Patient",
      address: "789 Patient Road, Colombo 03",
      contact_number: "+94764118021", // YOUR PHONE NUMBER
      nic: "950000001V",
      password_hash: hashedPasswordPatient,
      date_of_birth: new Date("1995-08-20"),
      gender: "MALE",
      gn_division: "Colombo Central",
      district: "Colombo",
    });

    // 5. Create Test Types (Blood Glucose + Hemoglobin)
    console.log("[5/7] Creating test types...");
    const bloodGlucoseType = await TestType.create({
      name: "Blood Glucose Test",
      code: "BGL001",
      category: "Blood Chemistry",
      description: "Measures blood sugar levels for diabetes monitoring",
      entryMethod: "form",
      discriminatorType: "BloodGlucose",
      isRoutineMonitoringRecommended: true,
      recommendedFrequency: "quarterly",
      recommendedFrequencyInDays: 90,
      specificParameters: {
        fastingRequired: true,
        fastingHours: 10,
        sampleType: "Venous Blood",
      },
      reportTemplate: "templates/blood-glucose-report",
    });

    const hemoglobinType = await TestType.create({
      name: "Hemoglobin Test",
      code: "HGB001",
      category: "Hematology",
      description: "Measures hemoglobin levels for anemia detection",
      entryMethod: "form",
      discriminatorType: "Hemoglobin",
      isRoutineMonitoringRecommended: true,
      recommendedFrequency: "biannually",
      recommendedFrequencyInDays: 180,
      specificParameters: {
        sampleType: "Venous Blood",
      },
      reportTemplate: "templates/hemoglobin-report",
    });

    // 6. Create Confirmed Booking (ready for result submission)
    console.log("[6/7] Creating booking...");
    const booking = await Booking.create({
      patientProfileId: patient._id,
      patientNameSnapshot: patient.full_name,
      patientPhoneSnapshot: patient.contact_number,
      healthCenterId: healthCenter._id,
      diagnosticTestId: bloodGlucoseType._id,
      testNameSnapshot: bloodGlucoseType.name,
      centerNameSnapshot: healthCenter.name,
      bookingDate: new Date("2026-02-27T09:00:00.000Z"),
      timeSlot: "09:00-09:30",
      bookingType: "PRE_BOOKED",
      priorityLevel: "NORMAL",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      allergyFlag: false,
      chronicConditionFlag: false,
      createdBy: healthOfficer._id,
    });

    // 7. Display IDs for Postman Collection Variables
    console.log("[7/7] Demo data seeded successfully!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 COPY THESE IDs TO POSTMAN COLLECTION VARIABLES");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("🔐 Login Credentials:");
    console.log(`   Health Officer (Lab Technician):`);
    console.log(`      Username: demo_officer`);
    console.log(`      Password: Demo@123`);
    console.log(`\n   Admin:`);
    console.log(`      Username: admin_demo`);
    console.log(`      Password: Admin@123`);
    console.log(`\n   Patient:`);
    console.log(`      Member ID: DEMO001`);
    console.log(`      Password: Patient@123\n`);

    console.log("🆔 ObjectIDs for Postman Collection Variables:\n");
    console.log(`patient_id=${patient._id}`);
    console.log(`health_officer_id=${healthOfficer._id}`);
    console.log(`admin_id=${adminUser._id}`);
    console.log(`health_center_id=${healthCenter._id}`);
    console.log(`blood_glucose_type_id=${bloodGlucoseType._id}`);
    console.log(`hemoglobin_type_id=${hemoglobinType._id}`);
    console.log(`booking_id=${booking._id}\n`);

    console.log("📱 Contact Info (for live notification testing):");
    console.log(`   Phone: ${patient.contact_number}`);
    console.log(`   Email: mafham2001@yahoo.com\n`);

    console.log("═══════════════════════════════════════════════════════\n");
    console.log("✅ Next Steps:");
    console.log("   1. Copy all 7 ObjectIDs above");
    console.log("   2. Postman → Collection → Variables tab → Paste ObjectIDs");
    console.log("   3. Start backend server: npm start (if not running)");
    console.log("   4. Test endpoints starting with Login requests\n");
    console.log("💡 Tips:");
    console.log("   • Login as admin_demo to test permanent deletion");
    console.log("   • Login as demo_officer for regular operations");
    console.log("   • Tokens captured automatically in Variables tab\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDemoData();
