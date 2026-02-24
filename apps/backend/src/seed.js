import mongoose from "mongoose";
import connectDB from "./config/db.js";

import HealthOfficer from "./modules/auth/healthOfficer.model.js";
import PatientProfile from "./modules/patient/patient.model.js";
import Lab from "./modules/lab/lab.model.js";
import TestType from "./modules/test/testType.model.js";
import Booking from "./modules/booking/booking.model.js";
import { createBooking } from "./modules/booking/booking.service.js";
import { seedInventory } from "./modules/inventory/inventory.seed.js";

async function seed() {
  try {
    await connectDB();

    console.log("[seed] Clearing existing test data...");

    await Promise.all([
      Booking.deleteMany({}),
      PatientProfile.deleteMany({}),
      Lab.deleteMany({}),
      TestType.deleteMany({}),
      HealthOfficer.deleteMany({}),
    ]);

    console.log("[seed] Creating health officer (createdBy user)...");
    const healthOfficer = await HealthOfficer.create({
      fullName: "Test Health Officer",
      gender: "OTHER",
      employeeId: "EMP-TEST-001",
      contactNumber: "0770000000",
      email: "health.officer@example.com",
      assignedArea: "Test Area",
      role: "Lab_Technician",
      username: "test_officer",
      // For seeding purposes only; use a real hash in production
      passwordHash: "hashed-password-placeholder",
    });

    console.log("[seed] Creating patient profiles...");
    const patient1 = await PatientProfile.create({
      fullName: "John Doe",
      nic: "901234567V",
      dateOfBirth: new Date("1990-01-01"),
      gender: "MALE",
      contactNumber: "0711111111",
      address: "123 Test Street",
      district: "Colombo",
      username: "john_doe",
      passwordHash: "hashed-password-placeholder",
    });

    const patient2 = await PatientProfile.create({
      fullName: "Jane Smith",
      nic: "911234568V",
      dateOfBirth: new Date("1991-02-02"),
      gender: "FEMALE",
      contactNumber: "0722222222",
      address: "456 Sample Road",
      district: "Gampaha",
      username: "jane_smith",
      passwordHash: "hashed-password-placeholder",
    });

    console.log("[seed] Creating labs (health centers)...");
    const lab1 = await Lab.create({
      name: "Central Diagnostic Center",
      addressLine1: "10 Main Street",
      district: "Colombo",
      province: "Western",
      phoneNumber: "0112000000",
      email: "central.lab@example.com",
      operatingHours: [
        { day: "Monday", openTime: "08:00", closeTime: "17:00" },
        { day: "Tuesday", openTime: "08:00", closeTime: "17:00" },
      ],
      createdBy: healthOfficer._id,
    });

    const lab2 = await Lab.create({
      name: "City Lab Clinic",
      addressLine1: "50 High Street",
      district: "Gampaha",
      province: "Western",
      phoneNumber: "0333000000",
      email: "city.lab@example.com",
      operatingHours: [
        { day: "Wednesday", openTime: "09:00", closeTime: "16:00" },
        { day: "Thursday", openTime: "09:00", closeTime: "16:00" },
      ],
      createdBy: healthOfficer._id,
    });

    console.log("[seed] Creating diagnostic test types...");
    const testType1 = await TestType.create({
      name: "Fasting Blood Glucose",
      code: "FBG",
      category: "Blood Chemistry",
      description: "Standard fasting blood glucose test.",
      entryMethod: "form",
      discriminatorType: "BloodGlucose",
      isRoutineMonitoringRecommended: true,
      recommendedFrequency: "quarterly",
      recommendedFrequencyInDays: 90,
      specificParameters: {
        fastingRequired: true,
        fastingHours: 8,
        sampleType: "Venous",
      },
      reportTemplate: "templates/blood-glucose-report",
    });

    const testType2 = await TestType.create({
      name: "Complete Blood Count",
      code: "CBC",
      category: "Hematology",
      description: "Routine complete blood count.",
      entryMethod: "form",
      discriminatorType: "Hemoglobin",
      isRoutineMonitoringRecommended: false,
      specificParameters: {
        sampleType: "Venous",
      },
      reportTemplate: "templates/cbc-report",
    });

    // Seed inventory (equipment, requirements, stock) before creating bookings
    await seedInventory({
      labs: [lab1, lab2],
      testTypes: [testType1, testType2],
      createdBy: healthOfficer._id,
    });

    console.log("[seed] Creating bookings using booking service...");

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const booking1 = await createBooking(
      {
        patientProfileId: patient1._id,
        healthCenterId: lab1._id,
        diagnosticTestId: testType1._id,
        bookingDate: today.toISOString(),
        timeSlot: "09:00-09:30",
        bookingType: "PRE_BOOKED",
        priorityLevel: "NORMAL",
        paymentMethod: "CASH",
      },
      healthOfficer._id,
    );

    const booking2 = await createBooking(
      {
        patientProfileId: patient2._id,
        healthCenterId: lab1._id,
        diagnosticTestId: testType2._id,
        bookingDate: today.toISOString(),
        timeSlot: "09:30-10:00",
        bookingType: "WALK_IN",
        priorityLevel: "ELDERLY",
        paymentMethod: "GOVERNMENT",
      },
      healthOfficer._id,
    );

    const booking3 = await createBooking(
      {
        patientProfileId: patient1._id,
        healthCenterId: lab2._id,
        diagnosticTestId: testType2._id,
        bookingDate: tomorrow.toISOString(),
        timeSlot: "10:00-10:30",
        bookingType: "WALK_IN",
        priorityLevel: "NORMAL",
        paymentMethod: "ONLINE",
      },
      healthOfficer._id,
    );

    console.log("[seed] Seed data created successfully.");
    console.log("[seed] HealthOfficer:", healthOfficer._id.toString());
    console.log("[seed] Patients:", patient1._id.toString(), patient2._id.toString());
    console.log("[seed] Labs:", lab1._id.toString(), lab2._id.toString());
    console.log("[seed] TestTypes:", testType1._id.toString(), testType2._id.toString());
    console.log("[seed] Bookings:", booking1._id.toString(), booking2._id.toString(), booking3._id.toString());
  } catch (err) {
    console.error("[seed] Error while seeding data:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("[seed] MongoDB connection closed.");
  }
}

seed();
