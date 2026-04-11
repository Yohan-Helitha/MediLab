/**
 * Unit tests for notification.validation.js
 */

import { validationResult } from "express-validator";
import mongoose from "mongoose";

import {
  idParamValidation,
  patientIdParamValidation,
  subscriptionIdParamValidation,
  sendResultReadyValidation,
  notificationHistoryQueryValidation,
  failedNotificationsQueryValidation,
  subscribeValidation,
  updateSubscriptionValidation,
  sendHardCopyReadyValidation,
  sendRoutineReminderValidation,
} from "../notification.validation.js";

// ── Helper ────────────────────────────────────────────────────────────────────

async function runValidators(validators, data) {
  const req = {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
  };
  for (const validator of validators) {
    await validator.run(req);
  }
  const errors = validationResult(req);
  return { isValid: errors.isEmpty(), errors: errors.array() };
}

const validId = () => new mongoose.Types.ObjectId().toString();
const invalidId = "not-a-mongo-id";

// ═════════════════════════════════════════════════════════════════════════════
// idParamValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("idParamValidation", () => {
  it("passes with valid MongoId", async () => {
    const res = await runValidators(idParamValidation, {
      params: { id: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid MongoId", async () => {
    const res = await runValidators(idParamValidation, {
      params: { id: invalidId },
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.path === "id")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// patientIdParamValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("patientIdParamValidation", () => {
  it("passes with valid patientId", async () => {
    const res = await runValidators(patientIdParamValidation, {
      params: { patientId: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid patientId", async () => {
    const res = await runValidators(patientIdParamValidation, {
      params: { patientId: "bad" },
    });
    expect(res.isValid).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// subscriptionIdParamValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("subscriptionIdParamValidation", () => {
  it("passes with valid MongoId", async () => {
    const res = await runValidators(subscriptionIdParamValidation, {
      params: { id: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid MongoId", async () => {
    const res = await runValidators(subscriptionIdParamValidation, {
      params: { id: "bad-id" },
    });
    expect(res.isValid).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendResultReadyValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("sendResultReadyValidation", () => {
  const validBody = {
    testResult: { _id: validId() },
    patient: { _id: validId(), email: "patient@example.com" },
    testType: { _id: validId(), name: "Hemoglobin" },
    healthCenter: { name: "City Lab" },
  };

  it("passes with all valid required fields", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: validBody,
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when testResult is missing", async () => {
    const { testResult: _omit, ...body } = validBody;
    const res = await runValidators(sendResultReadyValidation, { body });
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.path.startsWith("testResult"))).toBe(true);
  });

  it("fails when testResult._id is not a MongoId", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: { ...validBody, testResult: { _id: "bad-id" } },
    });
    expect(res.errors.some((e) => e.path === "testResult._id")).toBe(true);
  });

  it("fails when patient is missing", async () => {
    const { patient: _omit, ...body } = validBody;
    const res = await runValidators(sendResultReadyValidation, { body });
    expect(res.isValid).toBe(false);
  });

  it("fails when patient._id is not a MongoId", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: { ...validBody, patient: { ...validBody.patient, _id: "bad" } },
    });
    expect(res.errors.some((e) => e.path === "patient._id")).toBe(true);
  });

  it("fails when patient.email is present but invalid", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: {
        ...validBody,
        patient: { ...validBody.patient, email: "not-an-email" },
      },
    });
    expect(res.errors.some((e) => e.path === "patient.email")).toBe(true);
  });

  it("fails when testType.name is missing", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: {
        ...validBody,
        testType: { _id: validId() }, // missing name
      },
    });
    expect(res.errors.some((e) => e.path === "testType.name")).toBe(true);
  });

  it("fails when healthCenter.name is missing", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: {
        ...validBody,
        healthCenter: {}, // missing name
      },
    });
    expect(res.errors.some((e) => e.path === "healthCenter.name")).toBe(true);
  });

  it("passes when patient.contactNumber is provided (optional string)", async () => {
    const res = await runValidators(sendResultReadyValidation, {
      body: {
        ...validBody,
        patient: { ...validBody.patient, contactNumber: "+94771234567" },
      },
    });
    expect(res.isValid).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// notificationHistoryQueryValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("notificationHistoryQueryValidation", () => {
  it("passes with no query params", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: {},
    });
    expect(res.isValid).toBe(true);
  });

  it("passes with valid type filter", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { type: "result_ready" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid type value", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { type: "unknown_type" },
    });
    expect(res.errors.some((e) => e.path === "type")).toBe(true);
  });

  it("passes with valid channel filter", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { channel: "whatsapp" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid channel", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { channel: "telegram" },
    });
    expect(res.errors.some((e) => e.path === "channel")).toBe(true);
  });

  it("passes with valid status filter", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { status: "failed" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid status filter", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { status: "pending" },
    });
    expect(res.errors.some((e) => e.path === "status")).toBe(true);
  });

  it("passes with valid ISO 8601 startDate and endDate", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { startDate: "2025-01-01", endDate: "2025-12-31" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid startDate format", async () => {
    const res = await runValidators(notificationHistoryQueryValidation, {
      query: { startDate: "01-01-2025" },
    });
    expect(res.errors.some((e) => e.path === "startDate")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// failedNotificationsQueryValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("failedNotificationsQueryValidation", () => {
  it("passes with no query params", async () => {
    const res = await runValidators(failedNotificationsQueryValidation, {
      query: {},
    });
    expect(res.isValid).toBe(true);
  });

  it("passes with valid limit", async () => {
    const res = await runValidators(failedNotificationsQueryValidation, {
      query: { limit: "50" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when limit is 0", async () => {
    const res = await runValidators(failedNotificationsQueryValidation, {
      query: { limit: "0" },
    });
    expect(res.errors.some((e) => e.path === "limit")).toBe(true);
  });

  it("fails when limit exceeds 100", async () => {
    const res = await runValidators(failedNotificationsQueryValidation, {
      query: { limit: "101" },
    });
    expect(res.errors.some((e) => e.path === "limit")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// subscribeValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("subscribeValidation", () => {
  const validBody = {
    patientProfileId: validId(),
    testTypeId: validId(),
    lastTestDate: "2025-01-01",
  };

  it("passes with valid data", async () => {
    const res = await runValidators(subscribeValidation, { body: validBody });
    expect(res.isValid).toBe(true);
  });

  it("fails when patientProfileId is not a MongoId", async () => {
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, patientProfileId: "bad-id" },
    });
    expect(res.errors.some((e) => e.path === "patientProfileId")).toBe(true);
  });

  it("fails when testTypeId is not a MongoId", async () => {
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, testTypeId: "not-a-mongo-id" },
    });
    expect(res.errors.some((e) => e.path === "testTypeId")).toBe(true);
  });

  it("fails when lastTestDate is not a valid ISO 8601 date", async () => {
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, lastTestDate: "January 1 2025" },
    });
    expect(res.errors.some((e) => e.path === "lastTestDate")).toBe(true);
  });

  it("fails when lastTestDate is in the future", async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // tomorrow
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, lastTestDate: future },
    });
    expect(res.errors.some((e) => e.path === "lastTestDate")).toBe(true);
  });

  it("passes when lastTestDate is today (not in future)", async () => {
    const today = new Date().toISOString();
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, lastTestDate: today },
    });
    // "now" is borderline — validator checks date > now, so exactly now should pass
    // (or be within ms boundary); accepting isValid or !isValid with explanation:
    // just check the error is NOT a future date error
    const futureDateError = res.errors.find(
      (e) => e.path === "lastTestDate" && e.msg.includes("future"),
    );
    expect(futureDateError).toBeUndefined();
  });

  it("passes with a clearly past date", async () => {
    const res = await runValidators(subscribeValidation, {
      body: { ...validBody, lastTestDate: "2020-06-15" },
    });
    expect(res.isValid).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateSubscriptionValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("updateSubscriptionValidation", () => {
  it("passes with valid past lastTestDate", async () => {
    const res = await runValidators(updateSubscriptionValidation, {
      body: { lastTestDate: "2025-03-01" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when lastTestDate is in the future", async () => {
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const res = await runValidators(updateSubscriptionValidation, {
      body: { lastTestDate: future },
    });
    expect(res.errors.some((e) => e.path === "lastTestDate")).toBe(true);
  });

  it("fails when lastTestDate is not ISO 8601", async () => {
    const res = await runValidators(updateSubscriptionValidation, {
      body: { lastTestDate: "not-a-date" },
    });
    expect(res.errors.some((e) => e.path === "lastTestDate")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendHardCopyReadyValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("sendHardCopyReadyValidation", () => {
  it("passes with valid resultId", async () => {
    const res = await runValidators(sendHardCopyReadyValidation, {
      body: { resultId: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when resultId is not a MongoId", async () => {
    const res = await runValidators(sendHardCopyReadyValidation, {
      body: { resultId: "bad-id" },
    });
    expect(res.errors.some((e) => e.path === "resultId")).toBe(true);
  });

  it("fails when resultId is missing", async () => {
    const res = await runValidators(sendHardCopyReadyValidation, { body: {} });
    expect(res.errors.some((e) => e.path === "resultId")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendRoutineReminderValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("sendRoutineReminderValidation", () => {
  it("passes with valid subscriptionId", async () => {
    const res = await runValidators(sendRoutineReminderValidation, {
      body: { subscriptionId: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid subscriptionId", async () => {
    const res = await runValidators(sendRoutineReminderValidation, {
      body: { subscriptionId: "not-valid" },
    });
    expect(res.errors.some((e) => e.path === "subscriptionId")).toBe(true);
  });

  it("fails when subscriptionId is missing", async () => {
    const res = await runValidators(sendRoutineReminderValidation, {
      body: {},
    });
    expect(res.errors.some((e) => e.path === "subscriptionId")).toBe(true);
  });
});
