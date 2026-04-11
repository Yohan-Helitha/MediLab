import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../app.js";
import { connectDB } from "../../../config/db.js";
import authService from "../../auth/auth.service.js";
import HealthOfficer from "../../auth/healthOfficer.model.js";
import Member from "../../patient/models/Member.js";
import Lab from "../../lab/lab.model.js";
import TestType from "../../test/testType.model.js";
import Booking from "../../booking/booking.model.js";
import TestResult from "../testResult.model.js";
import HemoglobinResult from "../discriminators/hemoglobin.result.js";

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

jest.setTimeout(30000);

// ── Shared state ──────────────────────────────────────────────────────────────
let officerToken; // Health officer (Lab_Technician role)
let adminToken; // Admin officer
let patientToken; // Patient
let officerId;
let adminId;
let patientId; // Member._id (used as patientProfileId)
let labId;
let testTypeId;
let bookingId;
let resultId; // Created in first test, reused

const SUFFIX = Date.now();

describeIfDb("Result routes integration", () => {
  // ─── Seed ────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    await connectDB();

    // 1. Health officer (lab technician)
    const officerUsername = `int_lab_result_${SUFFIX}`;
    await HealthOfficer.deleteMany({ username: officerUsername });
    const officerHash = await authService.hashPassword("LabOfficer@123");
    const officer = await HealthOfficer.create({
      fullName: "Lab Tech Integration",
      gender: "OTHER",
      employeeId: `EMP-RES-LAB-${SUFFIX}`,
      contactNumber: "0771001001",
      email: `lab.result.${SUFFIX}@example.com`,
      assignedArea: "Colombo",
      role: "Lab_Technician",
      username: officerUsername,
      passwordHash: officerHash,
      isActive: true,
    });
    officerId = officer._id.toString();
    officerToken = authService.generateToken({
      id: officer._id,
      employeeId: officer.employeeId,
      userType: "healthOfficer",
      role: officer.role,
      fullName: officer.fullName,
    });

    // 2. Admin officer
    const adminUsername = `int_admin_result_${SUFFIX}`;
    await HealthOfficer.deleteMany({ username: adminUsername });
    const adminHash = await authService.hashPassword("AdminResult@123");
    const admin = await HealthOfficer.create({
      fullName: "Admin Integration Result",
      gender: "OTHER",
      employeeId: `EMP-RES-ADMIN-${SUFFIX}`,
      contactNumber: "0771001002",
      email: `admin.result.${SUFFIX}@example.com`,
      assignedArea: "Colombo",
      role: "Admin",
      username: adminUsername,
      passwordHash: adminHash,
      isActive: true,
    });
    adminId = admin._id.toString();
    adminToken = authService.generateToken({
      id: admin._id,
      employeeId: admin.employeeId,
      userType: "healthOfficer",
      role: admin.role,
      fullName: admin.fullName,
    });

    // 3. Patient member
    const memberUsername = `int_patient_result_${SUFFIX}`;
    await Member.deleteMany({ username: memberUsername });
    const patientHash = await authService.hashPassword("Patient@123");
    const patient = await Member.create({
      full_name: "Patient Integration",
      gender: "male",
      date_of_birth: new Date("1990-01-01"),
      nic: `INT${SUFFIX}NIC`,
      contact_number: "0771001003",
      email: `patient.result.${SUFFIX}@example.com`,
      gn_division: "Maradana",
      district: "Colombo",
      province: "Western",
      username: memberUsername,
      password_hash: patientHash,
    });
    patientId = patient._id.toString();
    patientToken = authService.generateToken({
      id: patient._id,
      userType: "patient",
      fullName: patient.full_name,
    });

    // 4. Lab (health center)
    const lab = await Lab.create({
      name: `Result Integration Lab ${SUFFIX}`,
      district: "Colombo",
      province: "Western",
      phoneNumber: "0114000001",
      email: `result.lab.${SUFFIX}@example.com`,
      createdBy: officer._id,
    });
    labId = lab._id.toString();

    // 5. Test type
    const testType = await TestType.create({
      name: `Hemoglobin Result Integration ${SUFFIX}`,
      code: `HGB${String(SUFFIX).slice(-6)}`,
      category: "Hematology",
      description: "Integration test type for results",
      entryMethod: "form",
      discriminatorType: "Hemoglobin",
      isRoutineMonitoringRecommended: false,
      specificParameters: {},
      reportTemplate: "templates/hemoglobin.html",
      isActive: true,
    });
    testTypeId = testType._id.toString();

    // 6. Booking
    const booking = await Booking.create({
      patientProfileId: patient._id,
      patientNameSnapshot: patient.full_name,
      patientPhoneSnapshot: patient.contact_number,
      healthCenterId: lab._id,
      diagnosticTestId: testType._id,
      testNameSnapshot: testType.name,
      centerNameSnapshot: lab.name,
      bookingDate: new Date(),
      timeSlot: "09:00-09:30",
      bookingType: "PRE_BOOKED",
      priorityLevel: "NORMAL",
      status: "PENDING",
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      allergyFlag: false,
      chronicConditionFlag: false,
      createdBy: officer._id,
    });
    bookingId = booking._id.toString();
  });

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  afterAll(async () => {
    try {
      // Clean up test data
      if (resultId) {
        await TestResult.findByIdAndDelete(resultId).catch(() => {});
      }
      await Booking.findByIdAndDelete(bookingId).catch(() => {});
      await TestType.findByIdAndDelete(testTypeId).catch(() => {});
      await Lab.findByIdAndDelete(labId).catch(() => {});
      await Member.findByIdAndDelete(patientId).catch(() => {});
      await HealthOfficer.deleteMany({
        employeeId: {
          $in: [`EMP-RES-LAB-${SUFFIX}`, `EMP-RES-ADMIN-${SUFFIX}`],
        },
      }).catch(() => {});
    } finally {
      await mongoose.connection.close();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/results  — submit result
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/results", () => {
    it("401 — no token", async () => {
      const res = await request(app).post("/api/results").send({});
      expect(res.statusCode).toBe(401);
    });

    it("403 — patient cannot submit result", async () => {
      const res = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          bookingId,
          patientProfileId: patientId,
          testTypeId,
          healthCenterId: labId,
          enteredBy: officerId,
          hemoglobinLevel: 13,
          unit: "g/dL",
          sampleType: "Venous Blood",
          sampleCollectionTime: new Date().toISOString(),
        });
      expect(res.statusCode).toBe(403);
    });

    it("422/400 — health officer submitting with missing required fields", async () => {
      const res = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ bookingId }); // missing other required fields
      expect([400, 422]).toContain(res.statusCode);
    });

    it("201 — health officer submits a valid Hemoglobin result", async () => {
      const res = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          bookingId,
          patientProfileId: patientId,
          testTypeId,
          healthCenterId: labId,
          enteredBy: officerId,
          hemoglobinLevel: 13.5,
          unit: "g/dL",
          sampleType: "Venous Blood",
          sampleQuality: "Good",
          sampleCollectionTime: new Date().toISOString(),
          method: "Hemoglobinometer",
          patientCondition: "Non-pregnant Adult",
          referenceRange: { normalMin: 12.0, normalMax: 17.5 },
          interpretation: "Normal",
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.success).toBe(true);
      resultId = res.body.result?._id || res.body.data?._id;
    });

    it("409 — duplicate result for same booking", async () => {
      // same bookingId already has a result from previous test
      const res = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          bookingId,
          patientProfileId: patientId,
          testTypeId,
          healthCenterId: labId,
          enteredBy: officerId,
          hemoglobinLevel: 14,
          unit: "g/dL",
          sampleType: "Venous Blood",
          sampleQuality: "Good",
          sampleCollectionTime: new Date().toISOString(),
          method: "Hemoglobinometer",
          patientCondition: "Non-pregnant Adult",
          referenceRange: { normalMin: 12.0, normalMax: 17.5 },
          interpretation: "Normal",
        });
      expect(res.statusCode).toBe(409);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/admin — admin only
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/admin", () => {
    it("403 — lab technician cannot access admin endpoint", async () => {
      const res = await request(app)
        .get("/api/results/admin")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("401 — unauthenticated request rejected", async () => {
      const res = await request(app).get("/api/results/admin");
      expect(res.statusCode).toBe(401);
    });

    it("200 — admin gets paginated result list", async () => {
      const res = await request(app)
        .get("/api/results/admin")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
    });

    it("200 — admin can filter by includeDeleted=true", async () => {
      const res = await request(app)
        .get("/api/results/admin?includeDeleted=true")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/:id — get single result
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/:id", () => {
    it("401 — no token", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/results/${fakeId}`);
      expect(res.statusCode).toBe(401);
    });

    it("400/422 — invalid MongoId format", async () => {
      const res = await request(app)
        .get("/api/results/not-a-mongo-id")
        .set("Authorization", `Bearer ${officerToken}`);
      expect([400, 422]).toContain(res.statusCode);
    });

    it("404 — valid ObjectId that doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/results/${fakeId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it("200 — health officer retrieves the created result", async () => {
      if (!resultId) return; // skip if creation test failed
      const res = await request(app)
        .get(`/api/results/${resultId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/:id/status-history
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/:id/status-history", () => {
    it("200 — health officer retrieves status history", async () => {
      if (!resultId) return;
      const res = await request(app)
        .get(`/api/results/${resultId}/status-history`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("statusHistory");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/health-center/:healthCenterId
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/health-center/:healthCenterId", () => {
    it("403 — patient cannot access health center results", async () => {
      const res = await request(app)
        .get(`/api/results/health-center/${labId}`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — health officer retrieves health center results", async () => {
      const res = await request(app)
        .get(`/api/results/health-center/${labId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/patient/:patientId
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/patient/:patientId", () => {
    it("401 — no token", async () => {
      const res = await request(app).get(`/api/results/patient/${patientId}`);
      expect(res.statusCode).toBe(401);
    });

    it("200 — health officer retrieves patient results", async () => {
      const res = await request(app)
        .get(`/api/results/patient/${patientId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PATCH /api/results/:id/status — update status
  // ═══════════════════════════════════════════════════════════════════════════
  describe("PATCH /api/results/:id/status", () => {
    it("403 — patient cannot update status", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/status`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ status: "released", changedBy: patientId });
      expect(res.statusCode).toBe(403);
    });

    it("422/400 — invalid status value", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/status`)
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ status: "invalid_status", changedBy: officerId });
      expect([400, 422]).toContain(res.statusCode);
    });

    it("200 — health officer releases the result", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/status`)
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ status: "released", changedBy: officerId });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.currentStatus).toBe("released");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PATCH /api/results/:id/mark-printed
  // ═══════════════════════════════════════════════════════════════════════════
  describe("PATCH /api/results/:id/mark-printed", () => {
    it("403 — patient cannot mark as printed", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/mark-printed`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — health officer marks as printed", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/mark-printed`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PATCH /api/results/:id/mark-collected
  // ═══════════════════════════════════════════════════════════════════════════
  describe("PATCH /api/results/:id/mark-collected", () => {
    it("200 — health officer marks as collected", async () => {
      if (!resultId) return;
      const res = await request(app)
        .patch(`/api/results/${resultId}/mark-collected`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/results/uncollected
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/results/uncollected", () => {
    it("403 — patient cannot access uncollected list", async () => {
      const res = await request(app)
        .get("/api/results/uncollected")
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — health officer can get uncollected list", async () => {
      const res = await request(app)
        .get("/api/results/uncollected")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE /api/results/:id — soft delete
  // ═══════════════════════════════════════════════════════════════════════════
  describe("DELETE /api/results/:id (soft delete)", () => {
    it("403 — patient cannot delete a result", async () => {
      if (!resultId) return;
      const res = await request(app)
        .delete(`/api/results/${resultId}`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ deleteReason: "Unauthorized attempt to delete." });
      expect(res.statusCode).toBe(403);
    });

    it("422/400 — deleteReason too short", async () => {
      if (!resultId) return;
      const res = await request(app)
        .delete(`/api/results/${resultId}`)
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ deleteReason: "short" });
      expect([400, 422]).toContain(res.statusCode);
    });

    it("200 — health officer soft deletes the result", async () => {
      if (!resultId) return;
      const res = await request(app)
        .delete(`/api/results/${resultId}`)
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ deleteReason: "Test data cleanup after integration run." });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE /api/results/:id/permanent — hard delete
  // ═══════════════════════════════════════════════════════════════════════════
  describe("DELETE /api/results/:id/permanent (hard delete)", () => {
    let hardDeleteTargetId;

    beforeAll(async () => {
      // Create a fresh result for hard delete test
      if (!hasDatabaseUrl) return;
      const booking2 = await Booking.create({
        patientProfileId: new mongoose.Types.ObjectId(patientId),
        patientNameSnapshot: "Hard Delete Test Patient",
        patientPhoneSnapshot: "0771000003",
        healthCenterId: new mongoose.Types.ObjectId(labId),
        diagnosticTestId: new mongoose.Types.ObjectId(testTypeId),
        testNameSnapshot: "Hard Delete Test",
        centerNameSnapshot: "Hard Delete Lab",
        bookingDate: new Date(),
        timeSlot: "10:00-10:30",
        bookingType: "PRE_BOOKED",
        priorityLevel: "NORMAL",
        status: "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        allergyFlag: false,
        chronicConditionFlag: false,
        createdBy: new mongoose.Types.ObjectId(officerId),
      });
      const result2 = await HemoglobinResult.create({
        bookingId: booking2._id,
        patientProfileId: new mongoose.Types.ObjectId(patientId),
        testTypeId: new mongoose.Types.ObjectId(testTypeId),
        healthCenterId: new mongoose.Types.ObjectId(labId),
        enteredBy: new mongoose.Types.ObjectId(officerId),
        hemoglobinLevel: 12,
        unit: "g/dL",
        sampleType: "Venous Blood",
        sampleQuality: "Good",
        sampleCollectionTime: new Date(),
        method: "Hemoglobinometer",
        patientCondition: "Non-pregnant Adult",
        referenceRange: { normalMin: 12.0, normalMax: 17.5 },
        interpretation: "Normal",
        statusHistory: [
          {
            status: "pending",
            changedBy: new mongoose.Types.ObjectId(officerId),
          },
        ],
      });
      hardDeleteTargetId = result2._id.toString();
    });

    it("403 — lab technician cannot hard delete", async () => {
      if (!hardDeleteTargetId) return;
      const res = await request(app)
        .delete(`/api/results/${hardDeleteTargetId}/permanent`)
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ deleteReason: "Permanent removal test reason here." });
      expect(res.statusCode).toBe(403);
    });

    it("200 — admin permanently deletes result", async () => {
      if (!hardDeleteTargetId) return;
      const res = await request(app)
        .delete(`/api/results/${hardDeleteTargetId}/permanent`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          deleteReason: "Permanent removal after integration test run.",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
