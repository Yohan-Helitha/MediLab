/**
 * Unit tests for result.validation.js
 * Verifies all express-validator middleware rules using a lightweight runner.
 */

import { validationResult } from "express-validator";
import mongoose from "mongoose";

import {
  submitResultValidation,
  bloodGlucoseValidation,
  hemoglobinValidation,
  bloodPressureValidation,
  pregnancyValidation,
  xrayValidation,
  ecgValidation,
  ultrasoundValidation,
  automatedReportValidation,
  updateStatusValidation,
  markViewedValidation,
  softDeleteValidation,
  hardDeleteValidation,
  updateResultValidation,
  resultQueryFiltersValidation,
  idParamValidation,
  patientIdParamValidation,
  healthCenterIdParamValidation,
} from "../result.validation.js";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Runs an array of express-validator middleware against a fake request object
 * and returns the validation result (mirrors auth.validation.unit.test.js pattern).
 */
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
  return {
    isValid: errors.isEmpty(),
    errors: errors.array(),
  };
}

const validId = () => new mongoose.Types.ObjectId().toString();
const invalidId = "not-a-mongo-id";

// ═════════════════════════════════════════════════════════════════════════════
// idParamValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("idParamValidation", () => {
  it("passes with valid MongoId param", async () => {
    const res = await runValidators(idParamValidation, {
      params: { id: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid MongoId param", async () => {
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
// healthCenterIdParamValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("healthCenterIdParamValidation", () => {
  it("passes with valid healthCenterId", async () => {
    const res = await runValidators(healthCenterIdParamValidation, {
      params: { healthCenterId: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid healthCenterId", async () => {
    const res = await runValidators(healthCenterIdParamValidation, {
      params: { healthCenterId: "bad" },
    });
    expect(res.isValid).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// submitResultValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("submitResultValidation", () => {
  const baseBody = {
    bookingId: validId(),
    patientProfileId: validId(),
    testTypeId: validId(),
    healthCenterId: validId(),
    enteredBy: validId(),
  };

  it("passes with all required MongoId fields", async () => {
    const res = await runValidators(submitResultValidation, { body: baseBody });
    expect(res.isValid).toBe(true);
  });

  it("fails when bookingId is missing", async () => {
    const { bookingId: _omit, ...body } = baseBody;
    const res = await runValidators(submitResultValidation, { body });
    expect(res.errors.some((e) => e.path === "bookingId")).toBe(true);
  });

  it("fails when bookingId is not a MongoId", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, bookingId: invalidId },
    });
    expect(res.errors.some((e) => e.path === "bookingId")).toBe(true);
  });

  it("fails when patientProfileId is missing", async () => {
    const { patientProfileId: _omit, ...body } = baseBody;
    const res = await runValidators(submitResultValidation, { body });
    expect(res.errors.some((e) => e.path === "patientProfileId")).toBe(true);
  });

  it("fails when enteredBy is not a MongoId", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, enteredBy: "bad-id" },
    });
    expect(res.errors.some((e) => e.path === "enteredBy")).toBe(true);
  });

  it("passes with optional observations within limit", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, observations: "Normal result." },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when observations exceeds 1000 chars", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, observations: "x".repeat(1001) },
    });
    expect(res.errors.some((e) => e.path === "observations")).toBe(true);
  });

  it("fails with invalid currentStatus value", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, currentStatus: "archived" },
    });
    expect(res.errors.some((e) => e.path === "currentStatus")).toBe(true);
  });

  it("passes with valid currentStatus = released", async () => {
    const res = await runValidators(submitResultValidation, {
      body: { ...baseBody, currentStatus: "released" },
    });
    expect(res.isValid).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// bloodGlucoseValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("bloodGlucoseValidation", () => {
  const validBody = {
    testType: "Fasting",
    glucoseLevel: 95,
    unit: "mg/dL",
    sampleType: "Venous Blood",
    sampleQuality: "Good",
    sampleCollectionTime: new Date().toISOString(),
  };

  it("passes with valid blood glucose data", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: validBody,
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when glucoseLevel exceeds 600", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, glucoseLevel: 601 },
    });
    expect(res.errors.some((e) => e.path === "glucoseLevel")).toBe(true);
  });

  it("fails when glucoseLevel is negative", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, glucoseLevel: -1 },
    });
    expect(res.errors.some((e) => e.path === "glucoseLevel")).toBe(true);
  });

  it("fails with invalid unit", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, unit: "mg/L" },
    });
    expect(res.errors.some((e) => e.path === "unit")).toBe(true);
  });

  it("fails with invalid testType", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, testType: "UnknownType" },
    });
    expect(res.errors.some((e) => e.path === "testType")).toBe(true);
  });

  it("passes with optional fastingDuration within range", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, fastingDuration: 8 },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when fastingDuration exceeds 24 hours", async () => {
    const res = await runValidators(bloodGlucoseValidation, {
      body: { ...validBody, fastingDuration: 25 },
    });
    expect(res.errors.some((e) => e.path === "fastingDuration")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// hemoglobinValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("hemoglobinValidation", () => {
  const validBody = {
    hemoglobinLevel: 14,
    unit: "g/dL",
    sampleType: "Venous Blood",
    sampleCollectionTime: new Date().toISOString(),
  };

  it("passes with valid hemoglobin data", async () => {
    const res = await runValidators(hemoglobinValidation, { body: validBody });
    expect(res.isValid).toBe(true);
  });

  it("fails when hemoglobinLevel exceeds 25", async () => {
    const res = await runValidators(hemoglobinValidation, {
      body: { ...validBody, hemoglobinLevel: 26 },
    });
    expect(res.errors.some((e) => e.path === "hemoglobinLevel")).toBe(true);
  });

  it("fails with invalid unit", async () => {
    const res = await runValidators(hemoglobinValidation, {
      body: { ...validBody, unit: "mg/dL" },
    });
    expect(res.errors.some((e) => e.path === "unit")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// bloodPressureValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("bloodPressureValidation", () => {
  const validBody = {
    systolicBP: 120,
    diastolicBP: 80,
    pulseRate: 72,
    patientPosition: "Sitting",
    armUsed: "Left",
    cuffSize: "Adult",
    patientState: "Rested (5+ minutes)",
    measurementTime: new Date().toISOString(),
    method: "Digital BP Monitor",
  };

  it("passes with valid blood pressure data", async () => {
    const res = await runValidators(bloodPressureValidation, {
      body: validBody,
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when systolicBP below 60", async () => {
    const res = await runValidators(bloodPressureValidation, {
      body: { ...validBody, systolicBP: 50 },
    });
    expect(res.errors.some((e) => e.path === "systolicBP")).toBe(true);
  });

  it("fails when systolicBP exceeds 300", async () => {
    const res = await runValidators(bloodPressureValidation, {
      body: { ...validBody, systolicBP: 310 },
    });
    expect(res.errors.some((e) => e.path === "systolicBP")).toBe(true);
  });

  it("fails with invalid armUsed", async () => {
    const res = await runValidators(bloodPressureValidation, {
      body: { ...validBody, armUsed: "Both" },
    });
    expect(res.errors.some((e) => e.path === "armUsed")).toBe(true);
  });

  it("fails with invalid patientPosition", async () => {
    const res = await runValidators(bloodPressureValidation, {
      body: { ...validBody, patientPosition: "Crouching" },
    });
    expect(res.errors.some((e) => e.path === "patientPosition")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateStatusValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("updateStatusValidation", () => {
  it("passes with status=pending and valid changedBy", async () => {
    const res = await runValidators(updateStatusValidation, {
      body: { status: "pending", changedBy: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("passes with status=released", async () => {
    const res = await runValidators(updateStatusValidation, {
      body: { status: "released", changedBy: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when status is missing", async () => {
    const res = await runValidators(updateStatusValidation, {
      body: { changedBy: validId() },
    });
    expect(res.errors.some((e) => e.path === "status")).toBe(true);
  });

  it("fails with invalid status value", async () => {
    const res = await runValidators(updateStatusValidation, {
      body: { status: "archived", changedBy: validId() },
    });
    expect(res.errors.some((e) => e.path === "status")).toBe(true);
  });

  it("fails when changedBy is not a MongoId", async () => {
    const res = await runValidators(updateStatusValidation, {
      body: { status: "released", changedBy: "not-an-id" },
    });
    expect(res.errors.some((e) => e.path === "changedBy")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// markViewedValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("markViewedValidation", () => {
  it("passes with valid userId", async () => {
    const res = await runValidators(markViewedValidation, {
      body: { userId: validId() },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when userId is missing", async () => {
    const res = await runValidators(markViewedValidation, { body: {} });
    expect(res.errors.some((e) => e.path === "userId")).toBe(true);
  });

  it("fails when userId is not a MongoId", async () => {
    const res = await runValidators(markViewedValidation, {
      body: { userId: "invalid" },
    });
    expect(res.errors.some((e) => e.path === "userId")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// softDeleteValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("softDeleteValidation", () => {
  it("passes with valid id param and sufficient deleteReason", async () => {
    const res = await runValidators(softDeleteValidation, {
      params: { id: validId() },
      body: { deleteReason: "Patient requested removal." },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when deleteReason is missing", async () => {
    const res = await runValidators(softDeleteValidation, {
      params: { id: validId() },
      body: {},
    });
    expect(res.errors.some((e) => e.path === "deleteReason")).toBe(true);
  });

  it("fails when deleteReason is shorter than 10 chars", async () => {
    const res = await runValidators(softDeleteValidation, {
      params: { id: validId() },
      body: { deleteReason: "short" },
    });
    expect(res.errors.some((e) => e.path === "deleteReason")).toBe(true);
  });

  it("fails when deleteReason contains invalid characters", async () => {
    const res = await runValidators(softDeleteValidation, {
      params: { id: validId() },
      body: { deleteReason: "Reason with <script>alert(1)</script>" },
    });
    expect(res.errors.some((e) => e.path === "deleteReason")).toBe(true);
  });

  it("fails when id param is invalid MongoId", async () => {
    const res = await runValidators(softDeleteValidation, {
      params: { id: invalidId },
      body: { deleteReason: "Valid reason here." },
    });
    expect(res.errors.some((e) => e.path === "id")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// hardDeleteValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("hardDeleteValidation", () => {
  it("passes with valid id and deleteReason", async () => {
    const res = await runValidators(hardDeleteValidation, {
      params: { id: validId() },
      body: { deleteReason: "Permanent removal due to data error." },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when deleteReason is too short", async () => {
    const res = await runValidators(hardDeleteValidation, {
      params: { id: validId() },
      body: { deleteReason: "too short" },
    });
    expect(res.errors.some((e) => e.path === "deleteReason")).toBe(true);
  });

  it("fails when id param is not a MongoId", async () => {
    const res = await runValidators(hardDeleteValidation, {
      params: { id: "not-valid" },
      body: { deleteReason: "Permanent removal due to data error." },
    });
    expect(res.errors.some((e) => e.path === "id")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateResultValidation — immutability guards
// ═════════════════════════════════════════════════════════════════════════════
describe("updateResultValidation", () => {
  it("passes with only observations update", async () => {
    const res = await runValidators(updateResultValidation, {
      params: { id: validId() },
      body: { observations: "Updated observations text." },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when patientProfileId is present (immutable field)", async () => {
    const res = await runValidators(updateResultValidation, {
      params: { id: validId() },
      body: { patientProfileId: validId() },
    });
    expect(res.errors.some((e) => e.path === "patientProfileId")).toBe(true);
  });

  it("fails when bookingId is present (immutable field)", async () => {
    const res = await runValidators(updateResultValidation, {
      params: { id: validId() },
      body: { bookingId: validId() },
    });
    expect(res.errors.some((e) => e.path === "bookingId")).toBe(true);
  });

  it("fails when testTypeId is present (immutable field)", async () => {
    const res = await runValidators(updateResultValidation, {
      params: { id: validId() },
      body: { testTypeId: validId() },
    });
    expect(res.errors.some((e) => e.path === "testTypeId")).toBe(true);
  });

  it("fails when releasedAt is present (immutable field)", async () => {
    const res = await runValidators(updateResultValidation, {
      params: { id: validId() },
      body: { releasedAt: new Date().toISOString() },
    });
    expect(res.errors.some((e) => e.path === "releasedAt")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// resultQueryFiltersValidation
// ═════════════════════════════════════════════════════════════════════════════
describe("resultQueryFiltersValidation", () => {
  it("passes with no query params", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: {},
    });
    expect(res.isValid).toBe(true);
  });

  it("passes with valid status filter", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: { status: "released" },
    });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid status filter", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: { status: "unknown" },
    });
    expect(res.errors.some((e) => e.path === "status")).toBe(true);
  });

  it("fails when limit is less than 1", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: { limit: "0" },
    });
    expect(res.errors.some((e) => e.path === "limit")).toBe(true);
  });

  it("fails when page is 0", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: { page: "0" },
    });
    expect(res.errors.some((e) => e.path === "page")).toBe(true);
  });

  it("fails with an invalid testTypeId in query", async () => {
    const res = await runValidators(resultQueryFiltersValidation, {
      query: { testTypeId: "bad-id" },
    });
    expect(res.errors.some((e) => e.path === "testTypeId")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// xrayValidation — spot-check
// ═════════════════════════════════════════════════════════════════════════════
describe("xrayValidation", () => {
  const validFile = {
    fileName: "chest.jpg",
    filePath: "/uploads/chest.jpg",
    fileSize: 204800,
    mimeType: "image/jpeg",
  };

  const validBody = {
    uploadedFiles: [validFile],
    bodyPart: "Chest",
    clinicalIndication: "Routine screening",
    views: ["PA"],
    findings: "No abnormal findings detected in this chest x-ray study.",
    impression: "Normal chest radiograph appearance overall.",
    interpretation: "Normal",
  };

  it("passes with valid X-ray data", async () => {
    const res = await runValidators(xrayValidation, { body: validBody });
    expect(res.isValid).toBe(true);
  });

  it("fails when uploadedFiles is empty", async () => {
    const res = await runValidators(xrayValidation, {
      body: { ...validBody, uploadedFiles: [] },
    });
    expect(res.errors.some((e) => e.path === "uploadedFiles")).toBe(true);
  });

  it("fails with invalid bodyPart", async () => {
    const res = await runValidators(xrayValidation, {
      body: { ...validBody, bodyPart: "Finger" },
    });
    expect(res.errors.some((e) => e.path === "bodyPart")).toBe(true);
  });

  it("fails with invalid interpretation", async () => {
    const res = await runValidators(xrayValidation, {
      body: { ...validBody, interpretation: "Inconclusive" },
    });
    expect(res.errors.some((e) => e.path === "interpretation")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// pregnancyValidation — spot-check
// ═════════════════════════════════════════════════════════════════════════════
describe("pregnancyValidation", () => {
  const validBody = {
    result: "Positive",
    testType: "Urine hCG",
    method: "Urine Test Strip",
    sampleType: "Urine (First Morning)",
    sampleQuality: "Good",
    sampleCollectionTime: new Date().toISOString(),
  };

  it("passes with valid pregnancy test data", async () => {
    const res = await runValidators(pregnancyValidation, { body: validBody });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid result value", async () => {
    const res = await runValidators(pregnancyValidation, {
      body: { ...validBody, result: "Unknown" },
    });
    expect(res.errors.some((e) => e.path === "result")).toBe(true);
  });

  it("passes with optional hcgLevel and valid hcgUnit", async () => {
    const res = await runValidators(pregnancyValidation, {
      body: { ...validBody, hcgLevel: 250, hcgUnit: "mIU/mL" },
    });
    expect(res.isValid).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ecgValidation — spot-check
// ═════════════════════════════════════════════════════════════════════════════
describe("ecgValidation", () => {
  const validFile = {
    fileName: "ecg.pdf",
    filePath: "/uploads/ecg.pdf",
    fileSize: 102400,
    mimeType: "application/pdf",
  };

  const validBody = {
    uploadedFiles: [validFile],
    ecgType: "Resting 12-Lead",
    clinicalIndication: "Chest pain evaluation",
    findings: "Normal sinus rhythm with no significant ST changes noted.",
    interpretation: "Normal",
  };

  it("passes with valid ECG data", async () => {
    const res = await runValidators(ecgValidation, { body: validBody });
    expect(res.isValid).toBe(true);
  });

  it("fails with invalid ecgType", async () => {
    const res = await runValidators(ecgValidation, {
      body: { ...validBody, ecgType: "24-Lead" },
    });
    expect(res.errors.some((e) => e.path === "ecgType")).toBe(true);
  });

  it("fails with invalid rhythm value", async () => {
    const res = await runValidators(ecgValidation, {
      body: { ...validBody, rhythm: "Unknown Rhythm" },
    });
    expect(res.errors.some((e) => e.path === "rhythm")).toBe(true);
  });

  it("fails when heartRate is out of range", async () => {
    const res = await runValidators(ecgValidation, {
      body: { ...validBody, heartRate: 310 },
    });
    expect(res.errors.some((e) => e.path === "heartRate")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// automatedReportValidation — spot-check
// ═════════════════════════════════════════════════════════════════════════════
describe("automatedReportValidation", () => {
  const validFile = {
    fileName: "report.pdf",
    filePath: "/uploads/report.pdf",
    fileSize: 512000,
    mimeType: "application/pdf",
  };

  const validBody = {
    uploadedFiles: [validFile],
    testPanelName: "Complete Blood Count",
    testCategory: "Complete Blood Count (CBC)",
    sampleType: "Whole Blood (EDTA)",
    sampleCollectionTime: new Date().toISOString(),
    analysisCompletedTime: new Date().toISOString(),
  };

  it("passes with valid automated report data", async () => {
    const res = await runValidators(automatedReportValidation, {
      body: validBody,
    });
    expect(res.isValid).toBe(true);
  });

  it("fails when mimeType is not application/pdf", async () => {
    const badFile = { ...validFile, mimeType: "image/png" };
    const res = await runValidators(automatedReportValidation, {
      body: { ...validBody, uploadedFiles: [badFile] },
    });
    expect(res.errors.some((e) => e.path.includes("mimeType"))).toBe(true);
  });

  it("fails when more than 1 file is uploaded", async () => {
    const res = await runValidators(automatedReportValidation, {
      body: { ...validBody, uploadedFiles: [validFile, validFile] },
    });
    expect(res.errors.some((e) => e.path === "uploadedFiles")).toBe(true);
  });

  it("fails with invalid testCategory", async () => {
    const res = await runValidators(automatedReportValidation, {
      body: { ...validBody, testCategory: "Custom Panel" },
    });
    expect(res.errors.some((e) => e.path === "testCategory")).toBe(true);
  });
});
