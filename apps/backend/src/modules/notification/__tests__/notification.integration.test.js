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
import NotificationLog from "../notificationLog.model.js";
import ReminderSubscription from "../reminderSubscription.model.js";
import Booking from "../../booking/booking.model.js";
import HemoglobinResult from "../../result/discriminators/hemoglobin.result.js";

// ── Mock external services to prevent real API calls ─────────────────────────
jest.mock("../../../config/twilio.js", () => ({
  sendWhatsAppWithRetry: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("../../../config/sendgrid.js", () => ({
  sendEmailWithRetry: jest.fn().mockResolvedValue({ success: true }),
  sendResultReadyEmail: jest.fn().mockResolvedValue({ success: true }),
  sendUnviewedResultReminderEmail: jest.fn().mockResolvedValue({ success: true }),
  sendHardCopyReadyEmail: jest.fn().mockResolvedValue({ success: true }),
  sendHardCopyCollectionReminderEmail: jest.fn().mockResolvedValue({ success: true }),
  sendRoutineCheckupReminderEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

jest.setTimeout(30000);

// ── Shared state ──────────────────────────────────────────────────────────────
let officerToken;
let patientToken;
let officerId;
let patientId;
let labId;
let testTypeId;         // supports routine monitoring
let notifId;           // created notification log id
let subscriptionId;    // created subscription id
let testResultId;      // released test result for result-ready notification
let notifBookingId;    // booking backing the test result

const SUFFIX = Date.now();

describeIfDb("Notification routes integration", () => {
  // ─── Seed ────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    await connectDB();

    // 1. Health officer
    const officerUsername = `int_notif_officer_${SUFFIX}`;
    await HealthOfficer.deleteMany({ username: officerUsername });
    const officerHash = await authService.hashPassword("NotifOfficer@123");
    const officer = await HealthOfficer.create({
      fullName: "Notification Officer Integration",
      gender: "OTHER",
      employeeId: `EMP-NOTIF-${SUFFIX}`,
      contactNumber: "0771002001",
      email: `notif.officer.${SUFFIX}@example.com`,
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

    // 2. Patient member
    const memberUsername = `int_notif_patient_${SUFFIX}`;
    await Member.deleteMany({ username: memberUsername });
    const patientHash = await authService.hashPassword("Patient@123");
    const patient = await Member.create({
      full_name: "Patient Notification Integration",
      gender: "male",
      date_of_birth: new Date("1992-05-10"),
      nic: `NOTIF${String(SUFFIX).slice(-9)}NIC`,
      contact_number: "0771002002",
      email: `notif.patient.${SUFFIX}@example.com`,
      gn_division: "Bambalapitiya",
      district: "Colombo",
      province: "Western",
      username: memberUsername,
      password_hash: patientHash,
    });
    patientId = patient._id.toString();
    patientToken = authService.generateToken({
      id: patient._id,
      profileId: patient._id,
      userType: "patient",
      fullName: patient.full_name,
    });

    // 3. Lab (health center)
    const lab = await Lab.create({
      name: `Notification Integration Lab ${SUFFIX}`,
      district: "Colombo",
      province: "Western",
      phoneNumber: "0114000002",
      email: `notif.lab.${SUFFIX}@example.com`,
      createdBy: officer._id,
    });
    labId = lab._id.toString();

    // 4. Test type that supports routine monitoring
    const testType = await TestType.create({
      name: `Routine Monitoring Test ${SUFFIX}`,
      code: `RM${String(SUFFIX).slice(-6)}`,
      category: "Hematology",
      description: "Integration test type for notifications",
      entryMethod: "form",
      discriminatorType: "Hemoglobin",
      isRoutineMonitoringRecommended: true,
      recommendedFrequency: "quarterly",
      recommendedFrequencyInDays: 90,
      specificParameters: {},
      reportTemplate: "templates/hemoglobin.html",
      isActive: true,
    });
    testTypeId = testType._id.toString();

    // 5. Booking for the seeded result
    const notifBooking = await Booking.create({
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
    notifBookingId = notifBooking._id.toString();

    // 6. Released HemoglobinResult (used by send/result-ready test)
    const seedResult = await HemoglobinResult.create({
      bookingId: notifBooking._id,
      patientProfileId: patient._id,
      testTypeId: testType._id,
      healthCenterId: lab._id,
      enteredBy: officer._id,
      hemoglobinLevel: 13.5,
      unit: "g/dL",
      sampleType: "Venous Blood",
      sampleQuality: "Good",
      sampleCollectionTime: new Date(),
      method: "Hemoglobinometer",
      patientCondition: "Non-pregnant Adult",
      referenceRange: { normalMin: 12.0, normalMax: 17.5 },
      interpretation: "Normal",
      currentStatus: "released",
      releasedAt: new Date(),
      statusHistory: [
        { status: "pending", changedBy: officer._id },
        { status: "released", changedBy: officer._id },
      ],
    });
    testResultId = seedResult._id.toString();
  });

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  afterAll(async () => {
    try {
      if (notifId) {
        await NotificationLog.findByIdAndDelete(notifId).catch(() => {});
      }
      if (subscriptionId) {
        await ReminderSubscription.findByIdAndDelete(subscriptionId).catch(() => {});
      }
      if (testResultId) {
        await HemoglobinResult.findByIdAndDelete(testResultId).catch(() => {});
      }
      if (notifBookingId) {
        await Booking.findByIdAndDelete(notifBookingId).catch(() => {});
      }
      // Clean any stray logs created during tests
      await NotificationLog.deleteMany({
        patientProfileId: new mongoose.Types.ObjectId(patientId),
      }).catch(() => {});
      await TestType.findByIdAndDelete(testTypeId).catch(() => {});
      await Lab.findByIdAndDelete(labId).catch(() => {});
      await Member.findByIdAndDelete(patientId).catch(() => {});
      await HealthOfficer.deleteMany({
        employeeId: `EMP-NOTIF-${SUFFIX}`,
      }).catch(() => {});
    } finally {
      await mongoose.connection.close();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/notifications/send/result-ready
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/notifications/send/result-ready", () => {
    it("401 — no token", async () => {
      const res = await request(app)
        .post("/api/notifications/send/result-ready")
        .send({});
      expect(res.statusCode).toBe(401);
    });

    it("403 — patient cannot send notification", async () => {
      const res = await request(app)
        .post("/api/notifications/send/result-ready")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          testResult: { _id: new mongoose.Types.ObjectId().toString() },
          patient: { _id: patientId, email: "p@test.com" },
          testType: { _id: testTypeId, name: "Hemoglobin" },
          healthCenter: { name: "City Lab" },
        });
      expect(res.statusCode).toBe(403);
    });

    it("422/400 — missing required fields returns validation error", async () => {
      const res = await request(app)
        .post("/api/notifications/send/result-ready")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({}); // missing everything
      expect([400, 422]).toContain(res.statusCode);
    });

    it("200 — health officer sends result ready notification", async () => {
      const res = await request(app)
        .post("/api/notifications/send/result-ready")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          testResult: { _id: testResultId, releasedAt: new Date().toISOString() },
          patient: {
            _id: patientId,
            contactNumber: "+94771234567",
            email: `notif.patient.${SUFFIX}@example.com`,
          },
          testType: { _id: testTypeId, name: "Hemoglobin" },
          healthCenter: { name: `Notification Integration Lab ${SUFFIX}` },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/  — all notifications (staff only)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/", () => {
    it("401 — no token", async () => {
      const res = await request(app).get("/api/notifications/");
      expect(res.statusCode).toBe(401);
    });

    it("403 — patient cannot access all notifications", async () => {
      const res = await request(app)
        .get("/api/notifications/")
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — health officer reads notification list", async () => {
      const res = await request(app)
        .get("/api/notifications/")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/patient/:patientId
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/patient/:patientId", () => {
    it("401 — no token", async () => {
      const res = await request(app).get(
        `/api/notifications/patient/${patientId}`,
      );
      expect(res.statusCode).toBe(401);
    });

    it("200 — authenticated user reads patient notification history", async () => {
      const res = await request(app)
        .get(`/api/notifications/patient/${patientId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("422/400 — invalid patientId returns error", async () => {
      const res = await request(app)
        .get("/api/notifications/patient/not-a-mongo-id")
        .set("Authorization", `Bearer ${officerToken}`);
      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/failed
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/failed", () => {
    it("403 — patient cannot access failed notifications", async () => {
      const res = await request(app)
        .get("/api/notifications/failed")
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — health officer reads failed notifications list", async () => {
      const res = await request(app)
        .get("/api/notifications/failed")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/:id — single notification
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/:id", () => {
    it("404 — valid ObjectId that doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/notifications/${fakeId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it("422/400 — invalid MongoId rejected", async () => {
      const res = await request(app)
        .get("/api/notifications/invalid-id")
        .set("Authorization", `Bearer ${officerToken}`);
      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/notifications/:id/resend — resend failed notification
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/notifications/:id/resend", () => {
    it("404 — resending non-existent notification", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/notifications/${fakeId}/resend`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it("403 — patient cannot resend notification", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/notifications/${fakeId}/resend`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/notifications/subscriptions — create subscription
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/notifications/subscriptions", () => {
    it("401 — no token", async () => {
      const res = await request(app)
        .post("/api/notifications/subscriptions")
        .send({});
      expect(res.statusCode).toBe(401);
    });

    it("403 — health officer cannot subscribe (patient only)", async () => {
      const res = await request(app)
        .post("/api/notifications/subscriptions")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          patientProfileId: patientId,
          testTypeId,
          lastTestDate: "2025-01-01",
        });
      expect(res.statusCode).toBe(403);
    });

    it("422/400 — missing required subscription fields", async () => {
      const res = await request(app)
        .post("/api/notifications/subscriptions")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ patientProfileId: patientId }); // missing testTypeId + lastTestDate
      expect([400, 422]).toContain(res.statusCode);
    });

    it("201/200 — patient creates subscription", async () => {
      const res = await request(app)
        .post("/api/notifications/subscriptions")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientProfileId: patientId,
          testTypeId,
          lastTestDate: "2025-01-01",
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.success).toBe(true);
      subscriptionId =
        res.body.subscription?._id || res.body.data?._id;
    });

    it("409 — duplicate subscription for same test type is rejected", async () => {
      const res = await request(app)
        .post("/api/notifications/subscriptions")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientProfileId: patientId,
          testTypeId,
          lastTestDate: "2025-03-01",
        });
      expect(res.statusCode).toBe(409);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/subscriptions/patient/:patientId
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/subscriptions/patient/:patientId", () => {
    it("403 — health officer cannot list patient subscriptions", async () => {
      const res = await request(app)
        .get(`/api/notifications/subscriptions/patient/${patientId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — patient retrieves own subscriptions", async () => {
      const res = await request(app)
        .get(`/api/notifications/subscriptions/patient/${patientId}`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/notifications/subscriptions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  describe("GET /api/notifications/subscriptions/:id", () => {
    it("200 — patient retrieves subscription by id", async () => {
      if (!subscriptionId) return;
      const res = await request(app)
        .get(`/api/notifications/subscriptions/${subscriptionId}`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(200);
    });

    it("404 — valid ObjectId that doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/notifications/subscriptions/${fakeId}`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/notifications/subscriptions/:id  — update
  // ═══════════════════════════════════════════════════════════════════════════
  describe("PUT /api/notifications/subscriptions/:id", () => {
    it("200 — patient updates subscription lastTestDate", async () => {
      if (!subscriptionId) return;
      const res = await request(app)
        .put(`/api/notifications/subscriptions/${subscriptionId}`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ lastTestDate: "2025-04-01" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("400/422 — future lastTestDate is rejected", async () => {
      if (!subscriptionId) return;
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .put(`/api/notifications/subscriptions/${subscriptionId}`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ lastTestDate: future });
      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE /api/notifications/subscriptions/:id — deactivate
  // ═══════════════════════════════════════════════════════════════════════════
  describe("DELETE /api/notifications/subscriptions/:id", () => {
    it("403 — health officer cannot deactivate subscription", async () => {
      if (!subscriptionId) return;
      const res = await request(app)
        .delete(`/api/notifications/subscriptions/${subscriptionId}`)
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("200 — patient deactivates (unsubscribes from) their subscription", async () => {
      if (!subscriptionId) return;
      const res = await request(app)
        .delete(`/api/notifications/subscriptions/${subscriptionId}`)
        .set("Authorization", `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/notifications/send/hard-copy-ready — validation check
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/notifications/send/hard-copy-ready", () => {
    it("403 — patient cannot send hard copy notification", async () => {
      const res = await request(app)
        .post("/api/notifications/send/hard-copy-ready")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ resultId: new mongoose.Types.ObjectId().toString() });
      expect(res.statusCode).toBe(403);
    });

    it("400/422 — invalid resultId format rejected", async () => {
      const res = await request(app)
        .post("/api/notifications/send/hard-copy-ready")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ resultId: "not-an-id" });
      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/notifications/send/routine-reminder — validation check
  // ═══════════════════════════════════════════════════════════════════════════
  describe("POST /api/notifications/send/routine-reminder", () => {
    it("403 — patient cannot trigger routine reminder", async () => {
      const res = await request(app)
        .post("/api/notifications/send/routine-reminder")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ subscriptionId: new mongoose.Types.ObjectId().toString() });
      expect(res.statusCode).toBe(403);
    });

    it("404 — valid subscriptionId that doesn't exist returns error", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/notifications/send/routine-reminder")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ subscriptionId: fakeId });
      expect([404, 400]).toContain(res.statusCode);
    });
  });
});
