import { jest } from "@jest/globals";
import mongoose from "mongoose";

// ── Mock all model imports before importing the service ──────────────────────
jest.mock("../testResult.model.js");
jest.mock("../discriminators/bloodGlucose.result.js");
jest.mock("../discriminators/hemoglobin.result.js");
jest.mock("../discriminators/bloodPressure.result.js");
jest.mock("../discriminators/pregnancy.result.js");
jest.mock("../discriminators/xray.result.js");
jest.mock("../discriminators/ecg.result.js");
jest.mock("../discriminators/ultrasound.result.js");
jest.mock("../discriminators/automatedReport.result.js");
jest.mock("../../booking/booking.model.js");

import TestResult from "../testResult.model.js";
import BloodGlucoseResult from "../discriminators/bloodGlucose.result.js";
import HemoglobinResult from "../discriminators/hemoglobin.result.js";
import BloodPressureResult from "../discriminators/bloodPressure.result.js";
import PregnancyTestResult from "../discriminators/pregnancy.result.js";
import XRayResult from "../discriminators/xray.result.js";
import ECGResult from "../discriminators/ecg.result.js";
import UltrasoundResult from "../discriminators/ultrasound.result.js";
import AutomatedReportResult from "../discriminators/automatedReport.result.js";
import Booking from "../../booking/booking.model.js";

import {
  createTestResult,
  findTestResultById,
  findResultsByPatient,
  findResultByBooking,
  updateResultStatus,
  updateTestResult,
  addViewedByEntry,
  findUnviewedResultsByPatient,
  findResultsByHealthCenter,
  findAllResultsAdmin,
  findResultsByTestType,
  softDeleteTestResult,
  hardDeleteTestResult,
} from "../result.service.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockId = () => new mongoose.Types.ObjectId().toString();

/** Returns a chainable populate/sort/limit/skip mock that resolves to `value`.
 *  The chain itself is thenable so `await chain.populate(...).populate(...)` works
 *  even when sort/limit/skip are not called at the end. */
function chainMock(value) {
  const resolved = Promise.resolve(value);
  const chain = {
    populate: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    // Make the chain itself awaitable
    then: resolved.then.bind(resolved),
    catch: resolved.catch.bind(resolved),
    finally: resolved.finally?.bind(resolved),
  };
  chain.populate.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  return chain;
}

// ── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// createTestResult
// ═════════════════════════════════════════════════════════════════════════════
describe("createTestResult", () => {
  const bookingId = mockId();
  const enteredBy = mockId();

  const baseData = {
    bookingId,
    patientProfileId: mockId(),
    testTypeId: mockId(),
    healthCenterId: mockId(),
    enteredBy,
    currentStatus: "pending",
  };

  test("creates result with correct discriminator (BloodGlucose)", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue(null);
    const created = { _id: mockId(), ...baseData };
    BloodGlucoseResult.create = jest.fn().mockResolvedValue(created);

    const result = await createTestResult("BloodGlucose", baseData);

    expect(TestResult.findOne).toHaveBeenCalledWith({
      bookingId,
      isDeleted: false,
    });
    expect(BloodGlucoseResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...baseData,
        statusHistory: expect.arrayContaining([
          expect.objectContaining({ status: "pending" }),
        ]),
      }),
    );
    expect(result).toEqual(created);
  });

  test("selects correct discriminator model for all 8 types", async () => {
    const modelMap = {
      BloodGlucose: BloodGlucoseResult,
      Hemoglobin: HemoglobinResult,
      BloodPressure: BloodPressureResult,
      Pregnancy: PregnancyTestResult,
      XRay: XRayResult,
      ECG: ECGResult,
      Ultrasound: UltrasoundResult,
      AutomatedReport: AutomatedReportResult,
    };

    for (const [type, Model] of Object.entries(modelMap)) {
      TestResult.findOne = jest.fn().mockResolvedValue(null);
      Model.create = jest.fn().mockResolvedValue({ _id: mockId() });

      await createTestResult(type, baseData);

      expect(Model.create).toHaveBeenCalledTimes(1);
      Model.create.mockClear();
    }
  });

  test("throws 409 when active result already exists for booking", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue({ _id: mockId() });

    await expect(
      createTestResult("BloodGlucose", baseData),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 11000,
    });
    expect(BloodGlucoseResult.create).not.toHaveBeenCalled();
  });

  test("throws on unknown discriminatorType", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue(null);

    await expect(createTestResult("UnknownType", baseData)).rejects.toThrow();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findTestResultById
// ═════════════════════════════════════════════════════════════════════════════
describe("findTestResultById", () => {
  test("returns populated result when found", async () => {
    const doc = { _id: mockId(), currentStatus: "pending" };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    const result = await findTestResultById(doc._id);

    expect(TestResult.findOne).toHaveBeenCalledWith({
      _id: doc._id,
      isDeleted: false,
    });
    expect(result).toEqual(doc);
  });

  test("throws 404 when result not found", async () => {
    const chain = chainMock(null);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await expect(findTestResultById(mockId())).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findResultsByPatient
// ═════════════════════════════════════════════════════════════════════════════
describe("findResultsByPatient", () => {
  const patientId = mockId();

  test("returns results with no filters", async () => {
    const docs = [{ _id: mockId() }, { _id: mockId() }];
    const chain = chainMock(docs);
    TestResult.find = jest.fn().mockReturnValue(chain);

    const result = await findResultsByPatient(patientId);

    expect(TestResult.find).toHaveBeenCalledWith(
      expect.objectContaining({
        patientProfileId: patientId,
        isDeleted: false,
      }),
    );
    expect(result).toEqual(docs);
  });

  test("applies status filter", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByPatient(patientId, { status: "released" });

    expect(TestResult.find).toHaveBeenCalledWith(
      expect.objectContaining({ currentStatus: "released" }),
    );
  });

  test("applies startDate and endDate as releasedAt range", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByPatient(patientId, {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    const query = TestResult.find.mock.calls[0][0];
    expect(query.releasedAt.$gte).toBeInstanceOf(Date);
    expect(query.releasedAt.$lte).toBeInstanceOf(Date);
  });

  test("paginates with limit and page", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByPatient(patientId, { limit: 5, page: 2 });

    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(chain.skip).toHaveBeenCalledWith(5); // (page-1)*limit = 1*5
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findResultByBooking
// ═════════════════════════════════════════════════════════════════════════════
describe("findResultByBooking", () => {
  test("returns result for booking", async () => {
    const bookingId = mockId();
    const doc = { _id: mockId(), bookingId };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    const result = await findResultByBooking(bookingId);

    expect(TestResult.findOne).toHaveBeenCalledWith({
      bookingId,
      isDeleted: false,
    });
    expect(result).toEqual(doc);
  });

  test("throws 404 when not found", async () => {
    const chain = chainMock(null);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await expect(findResultByBooking(mockId())).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateResultStatus
// ═════════════════════════════════════════════════════════════════════════════
describe("updateResultStatus", () => {
  test("sets releasedAt when status changes to released", async () => {
    const id = mockId();
    const changedBy = mockId();
    const doc = {
      _id: id,
      currentStatus: "pending",
      statusHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    const result = await updateResultStatus(id, "released", changedBy);

    expect(result.currentStatus).toBe("released");
    expect(result.releasedAt).toBeInstanceOf(Date);
    expect(result.statusHistory).toHaveLength(1);
    expect(result.statusHistory[0].status).toBe("released");
    expect(doc.save).toHaveBeenCalled();
  });

  test("does NOT set releasedAt when status is pending", async () => {
    const doc = {
      currentStatus: "released",
      statusHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await updateResultStatus(mockId(), "pending", mockId());

    expect(doc.releasedAt).toBeUndefined();
  });

  test("throws 404 when result not found", async () => {
    const chain = chainMock(null);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await expect(
      updateResultStatus(mockId(), "released", mockId()),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateTestResult
// ═════════════════════════════════════════════════════════════════════════════
describe("updateTestResult", () => {
  test("updates allowed fields and saves", async () => {
    const doc = {
      _id: mockId(),
      observations: "old",
      save: jest.fn().mockResolvedValue(true),
    };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    const result = await updateTestResult(doc._id, { observations: "new" });

    expect(result.observations).toBe("new");
    expect(doc.save).toHaveBeenCalled();
  });

  test("does not mutate protected fields", async () => {
    const originalPatientId = mockId();
    const doc = {
      patientProfileId: originalPatientId,
      bookingId: mockId(),
      save: jest.fn().mockResolvedValue(true),
    };
    const chain = chainMock(doc);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await updateTestResult(mockId(), {
      patientProfileId: mockId(), // should be stripped
      bookingId: mockId(), // should be stripped
      observations: "safe update",
    });

    expect(doc.patientProfileId).toBe(originalPatientId);
  });

  test("throws 404 when result not found", async () => {
    const chain = chainMock(null);
    TestResult.findOne = jest.fn().mockReturnValue(chain);

    await expect(
      updateTestResult(mockId(), { observations: "x" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// addViewedByEntry
// ═════════════════════════════════════════════════════════════════════════════
describe("addViewedByEntry", () => {
  test("adds viewedBy entry when not already viewed", async () => {
    const userId = mockId();
    const doc = {
      viewedBy: [],
      save: jest.fn().mockResolvedValue(true),
    };
    TestResult.findOne = jest.fn().mockResolvedValue(doc);

    await addViewedByEntry(mockId(), userId);

    expect(doc.viewedBy).toHaveLength(1);
    expect(doc.viewedBy[0].userId).toBe(userId);
    expect(doc.save).toHaveBeenCalled();
  });

  test("does NOT add duplicate entry when same user views again", async () => {
    const userId = mockId();
    const doc = {
      viewedBy: [{ userId: { toString: () => userId }, viewedAt: new Date() }],
      save: jest.fn().mockResolvedValue(true),
    };
    TestResult.findOne = jest.fn().mockResolvedValue(doc);

    await addViewedByEntry(mockId(), userId);

    expect(doc.viewedBy).toHaveLength(1); // unchanged
    expect(doc.save).not.toHaveBeenCalled();
  });

  test("throws 404 when result not found", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue(null);

    await expect(addViewedByEntry(mockId(), mockId())).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findUnviewedResultsByPatient
// ═════════════════════════════════════════════════════════════════════════════
describe("findUnviewedResultsByPatient", () => {
  test("queries with released status and empty viewedBy conditions", async () => {
    const patientId = mockId();
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findUnviewedResultsByPatient(patientId);

    const query = TestResult.find.mock.calls[0][0];
    expect(query.patientProfileId).toBe(patientId);
    expect(query.currentStatus).toBe("released");
    expect(query.isDeleted).toBe(false);
    expect(query.$or).toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findResultsByHealthCenter
// ═════════════════════════════════════════════════════════════════════════════
describe("findResultsByHealthCenter", () => {
  const centerId = mockId();

  test("returns results for health center", async () => {
    const docs = [{ _id: mockId() }];
    const chain = chainMock(docs);
    TestResult.find = jest.fn().mockReturnValue(chain);

    const result = await findResultsByHealthCenter(centerId);

    expect(TestResult.find).toHaveBeenCalledWith(
      expect.objectContaining({ healthCenterId: centerId, isDeleted: false }),
    );
    expect(result).toEqual(docs);
  });

  test("sorts by createdAt when status filter is pending", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByHealthCenter(centerId, { status: "pending" });

    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test("sorts by releasedAt when status filter is released", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByHealthCenter(centerId, { status: "released" });

    expect(chain.sort).toHaveBeenCalledWith({ releasedAt: -1 });
  });

  test("does NOT apply releasedAt date range when status is pending", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByHealthCenter(centerId, {
      status: "pending",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    const query = TestResult.find.mock.calls[0][0];
    expect(query.releasedAt).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findAllResultsAdmin
// ═════════════════════════════════════════════════════════════════════════════
describe("findAllResultsAdmin", () => {
  test("excludes deleted results by default (includeDeleted omitted)", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);
    TestResult.countDocuments = jest.fn().mockResolvedValue(0);

    await findAllResultsAdmin({});

    const query = TestResult.find.mock.calls[0][0];
    expect(query.isDeleted).toBe(false);
  });

  test("includes deleted results when includeDeleted is true", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);
    TestResult.countDocuments = jest.fn().mockResolvedValue(0);

    await findAllResultsAdmin({ includeDeleted: true });

    const query = TestResult.find.mock.calls[0][0];
    expect(query.isDeleted).toBeUndefined();
  });

  test("filters by healthCenterId and status", async () => {
    const centerId = mockId();
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);
    TestResult.countDocuments = jest.fn().mockResolvedValue(0);

    await findAllResultsAdmin({ healthCenterId: centerId, status: "released" });

    const query = TestResult.find.mock.calls[0][0];
    expect(query.healthCenterId).toBe(centerId);
    expect(query.currentStatus).toBe("released");
  });

  test("returns { results, total, page, limit }", async () => {
    const docs = [{ _id: mockId() }];
    const chain = chainMock(docs);
    TestResult.find = jest.fn().mockReturnValue(chain);
    TestResult.countDocuments = jest.fn().mockResolvedValue(5);

    const res = await findAllResultsAdmin({ page: 2, limit: 10 });

    expect(res).toMatchObject({ total: 5, page: 2, limit: 10 });
    expect(Array.isArray(res.results)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findResultsByTestType
// ═════════════════════════════════════════════════════════════════════════════
describe("findResultsByTestType", () => {
  test("queries by testTypeId and excludes deleted", async () => {
    const testTypeId = mockId();
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findResultsByTestType(testTypeId);

    expect(TestResult.find).toHaveBeenCalledWith({
      testTypeId,
      isDeleted: false,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// softDeleteTestResult
// ═════════════════════════════════════════════════════════════════════════════
describe("softDeleteTestResult", () => {
  test("marks result as deleted with audit fields and reverts booking", async () => {
    const id = mockId();
    const bookingId = mockId();
    const deletedBy = mockId();
    const doc = {
      _id: id,
      bookingId,
      isDeleted: false,
      save: jest.fn().mockResolvedValue(true),
    };
    TestResult.findOne = jest.fn().mockResolvedValue(doc);
    Booking.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const res = await softDeleteTestResult(id, "Valid reason here", deletedBy);

    expect(doc.isDeleted).toBe(true);
    expect(doc.deletedBy).toBe(deletedBy);
    expect(doc.deleteReason).toBe("Valid reason here");
    expect(doc.deletedAt).toBeInstanceOf(Date);
    expect(doc.save).toHaveBeenCalled();
    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(bookingId, {
      $set: { status: "PENDING" },
    });
    expect(res.success).toBe(true);
    expect(res.deletedId).toBe(id);
  });

  test("does not call Booking.findByIdAndUpdate when bookingId is null", async () => {
    const doc = {
      _id: mockId(),
      bookingId: null,
      isDeleted: false,
      save: jest.fn().mockResolvedValue(true),
    };
    TestResult.findOne = jest.fn().mockResolvedValue(doc);
    Booking.findByIdAndUpdate = jest.fn();

    await softDeleteTestResult(doc._id, "Valid reason here", mockId());

    expect(Booking.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("throws 404 when result is already deleted (isDeleted:true)", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue(null); // findOne({isDeleted:false}) returns null

    await expect(
      softDeleteTestResult(mockId(), "Valid reason here", mockId()),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("throws 404 when result does not exist", async () => {
    TestResult.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      softDeleteTestResult(mockId(), "Valid reason here", mockId()),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// hardDeleteTestResult
// ═════════════════════════════════════════════════════════════════════════════
describe("hardDeleteTestResult", () => {
  test("permanently deletes result and reverts booking to PENDING", async () => {
    const id = mockId();
    const bookingObjId = new mongoose.Types.ObjectId();
    const doc = {
      _id: id,
      bookingId: { _id: bookingObjId },
      patientProfileId: mockId(),
      testTypeId: mockId(),
    };
    TestResult.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(doc),
    });
    TestResult.findByIdAndDelete = jest.fn().mockResolvedValue({});
    Booking.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const res = await hardDeleteTestResult(
      id,
      "Permanent removal reason",
      mockId(),
    );

    expect(TestResult.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(bookingObjId, {
      $set: { status: "PENDING" },
    });
    expect(res.success).toBe(true);
    expect(res.deletedId).toBe(id);
  });

  test("deletes result even when bookingId is null", async () => {
    const id = mockId();
    const doc = {
      _id: id,
      bookingId: null,
      patientProfileId: mockId(),
      testTypeId: mockId(),
    };
    TestResult.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(doc),
    });
    TestResult.findByIdAndDelete = jest.fn().mockResolvedValue({});
    Booking.findByIdAndUpdate = jest.fn();

    await hardDeleteTestResult(id, "Permanent removal reason", mockId());

    expect(TestResult.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(Booking.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("throws 404 when result not found", async () => {
    TestResult.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(
      hardDeleteTestResult(mockId(), "Permanent removal reason", mockId()),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
