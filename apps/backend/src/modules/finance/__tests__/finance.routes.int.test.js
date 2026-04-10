import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../../app.js";
import { connectDB } from "../../../config/db.js";

import authService from "../../auth/auth.service.js";
import HealthOfficer from "../../auth/healthOfficer.model.js";

import Lab from "../../lab/lab.model.js";
import TestType from "../../test/testType.model.js";
import Booking from "../../booking/booking.model.js";
import FinanceTransaction from "../financeTransaction.model.js";

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

jest.setTimeout(30000);

describeIfDb("Finance routes integration", () => {
  let adminToken;
  let adminId;
  let labId;
  let testTypeId;
  let bookingId;

  beforeAll(async () => {
    await connectDB();

    const uniqueSuffix = Date.now();

    // Create admin health officer
    const username = `int_admin_fin_${uniqueSuffix}`;
    const employeeId = `EMP-INT-ADMIN-FIN-${uniqueSuffix}`;
    const email = `int.admin.fin.${uniqueSuffix}@example.com`;

    await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

    const passwordHash = await authService.hashPassword("IntAdminFinance@123");

    const officer = await HealthOfficer.create({
      fullName: "Integration Admin Finance",
      gender: "OTHER",
      employeeId,
      contactNumber: "0777000200",
      email,
      assignedArea: "Integration Area",
      role: "Admin",
      username,
      passwordHash,
      isActive: true,
    });

    adminId = officer._id.toString();

    adminToken = authService.generateToken({
      id: officer._id,
      employeeId: officer.employeeId,
      userType: "healthOfficer",
      role: officer.role,
      fullName: officer.fullName,
    });

    const lab = await Lab.create({
      name: `Integration Finance Lab ${uniqueSuffix}`,
      district: "Colombo",
      province: "Western",
      phoneNumber: "0114000001",
      email: `integration.finance.lab.${uniqueSuffix}@example.com`,
      createdBy: officer._id,
    });
    labId = lab._id.toString();

    const testType = await TestType.create({
      name: `Integration Finance Test ${uniqueSuffix}`,
      code: `FININT-${uniqueSuffix}`,
      category: "Hematology",
      description: "Integration test type for finance routes",
      entryMethod: "form",
      discriminatorType: "Hemoglobin",
      isRoutineMonitoringRecommended: false,
      specificParameters: {},
      reportTemplate: "templates/integration-finance.html",
      isActive: true,
    });
    testTypeId = testType._id.toString();

    const booking = await Booking.create({
      patientProfileId: new mongoose.Types.ObjectId(),
      patientNameSnapshot: "Integration Patient",
      patientPhoneSnapshot: "0777000999",
      healthCenterId: lab._id,
      diagnosticTestId: testType._id,
      testNameSnapshot: testType.name,
      centerNameSnapshot: lab.name,
      bookingDate: new Date(),
      timeSlot: "09:00",
      bookingType: "WALK_IN",
      priorityLevel: "NORMAL",
      status: "PENDING",
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      createdBy: officer._id,
      isActive: true,
    });

    bookingId = booking._id.toString();

    // Clean any previous transactions for this booking
    await FinanceTransaction.deleteMany({ bookingId: booking._id });
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch (e) {
      // no-op
    }
  });

  it("rejects finance summary without auth", async () => {
    const res = await request(app).get("/api/finance/summary");
    expect(res.status).toBe(401);
  });

  it("lists unpaid CASH bookings", async () => {
    const res = await request(app)
      .get("/api/finance/unpaid-bookings?paymentMethod=CASH")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.some((row) => String(row.bookingId) === bookingId)).toBe(
      true,
    );
  });

  it("allows admin to record cash payment and updates booking", async () => {
    const res = await request(app)
      .post("/api/finance/payments/cash")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        bookingId,
        amount: 1500,
        notes: "Paid at counter",
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction.paymentMethod).toBe("CASH");
    expect(res.body.transaction.paymentStatus).toBe("PAID");
    expect(res.body.booking.paymentStatus).toBe("PAID");

    const unpaidAfterRes = await request(app)
      .get("/api/finance/unpaid-bookings?paymentMethod=CASH")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(unpaidAfterRes.status).toBe(200);
    expect(
      unpaidAfterRes.body.items.some((row) => String(row.bookingId) === bookingId),
    ).toBe(false);
  });

  it("returns finance summary including cash revenue", async () => {
    const res = await request(app)
      .get("/api/finance/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.totalRevenue).toBe("number");
    expect(res.body.revenueByMethod).toBeDefined();
  });

  it("returns recent payments list", async () => {
    const res = await request(app)
      .get("/api/finance/recent-payments?limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);

    const first = res.body.items[0];
    expect(first).toEqual(
      expect.objectContaining({
        amount: expect.any(Number),
        paymentMethod: expect.any(String),
        paymentStatus: expect.any(String),
      }),
    );
  });

  it("returns all-time payments list with optional CASH filter", async () => {
    const res = await request(app)
      .get("/api/finance/payments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);

    const cashRes = await request(app)
      .get("/api/finance/payments?paymentMethod=CASH")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(cashRes.status).toBe(200);
    expect(Array.isArray(cashRes.body.items)).toBe(true);
    // We recorded a CASH payment in this suite.
    expect(cashRes.body.items.some((row) => row.paymentMethod === "CASH")).toBe(
      true,
    );
  });
});
