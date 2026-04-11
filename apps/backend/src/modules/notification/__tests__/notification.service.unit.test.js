import { jest } from "@jest/globals";
import mongoose from "mongoose";

// ── Define mock objects before registering modules ─────────────────────────────
// (ESM requires jest.unstable_mockModule + dynamic import; jest.mock() factories
//  are not reliably hoisted in --experimental-vm-modules mode)

const mockSendWhatsAppWithRetry = jest.fn();
const mockSendResultReadyEmail = jest.fn();
const mockSendUnviewedResultReminderEmail = jest.fn();
const mockSendHardCopyReadyEmail = jest.fn();
const mockSendHardCopyCollectionReminderEmail = jest.fn();
const mockSendRoutineCheckupReminderEmail = jest.fn();
const mockSendEmailWithRetry = jest.fn();

const mockNotificationLog = jest.fn();
mockNotificationLog.find = jest.fn();
mockNotificationLog.findById = jest.fn();
mockNotificationLog.findByIdAndUpdate = jest.fn();

const mockReminderSubscription = jest.fn();
mockReminderSubscription.find = jest.fn();
mockReminderSubscription.findById = jest.fn();
mockReminderSubscription.findOne = jest.fn();
mockReminderSubscription.findByIdAndUpdate = jest.fn();

const mockTestResult = jest.fn();
mockTestResult.find = jest.fn();
mockTestResult.findById = jest.fn();
mockTestResult.findOne = jest.fn();

const mockTestType = jest.fn();
mockTestType.findById = jest.fn();

// ── Register module mocks (must come before dynamic import of the service) ──────
jest.unstable_mockModule("../../../config/twilio.js", () => ({
  sendWhatsAppWithRetry: mockSendWhatsAppWithRetry,
}));

jest.unstable_mockModule("../../../config/sendgrid.js", () => ({
  sendEmailWithRetry: mockSendEmailWithRetry,
  sendResultReadyEmail: mockSendResultReadyEmail,
  sendUnviewedResultReminderEmail: mockSendUnviewedResultReminderEmail,
  sendHardCopyReadyEmail: mockSendHardCopyReadyEmail,
  sendHardCopyCollectionReminderEmail: mockSendHardCopyCollectionReminderEmail,
  sendRoutineCheckupReminderEmail: mockSendRoutineCheckupReminderEmail,
}));

jest.unstable_mockModule("../../../config/environment.js", () => ({
  default: { notificationChannels: { whatsapp: true, email: true } },
}));

jest.unstable_mockModule("../notificationLog.model.js", () => ({
  default: mockNotificationLog,
}));

jest.unstable_mockModule("../reminderSubscription.model.js", () => ({
  default: mockReminderSubscription,
}));

jest.unstable_mockModule("../../result/testResult.model.js", () => ({
  default: mockTestResult,
}));

jest.unstable_mockModule("../../test/testType.model.js", () => ({
  default: mockTestType,
}));

// ── Dynamic imports (must come AFTER all jest.unstable_mockModule calls) ────────
const { sendWhatsAppWithRetry } = await import("../../../config/twilio.js");

const {
  sendResultReadyEmail,
  sendUnviewedResultReminderEmail,
  sendHardCopyReadyEmail,
  sendHardCopyCollectionReminderEmail,
  sendRoutineCheckupReminderEmail,
} = await import("../../../config/sendgrid.js");

const NotificationLog = (await import("../notificationLog.model.js")).default;
const ReminderSubscription = (await import("../reminderSubscription.model.js"))
  .default;
const TestResult = (await import("../../result/testResult.model.js")).default;
const TestType = (await import("../../test/testType.model.js")).default;

const {
  createNotificationLog,
  findNotificationsByPatient,
  findNotificationById,
  findAllNotifications,
  findFailedNotifications,
  updateNotificationStatus,
  sendResultReadyNotification,
  sendUnviewedResultReminder,
  findUnviewedResults,
  resendNotification,
  sendRoutineCheckupReminder,
  createSubscription,
  findSubscriptionsByPatient,
  findSubscriptionById,
  deactivateSubscription,
  findSubscriptionsDueToday,
} = await import("../notification.service.js");

// ── Helper ────────────────────────────────────────────────────────────────────
const mockId = () => new mongoose.Types.ObjectId().toString();

/** Chainable mongoose query mock resolving to `value`.
 *  The chain itself is thenable so awaiting any point in the chain resolves correctly. */
function chainMock(value) {
  const resolved = Promise.resolve(value);
  const chain = {
    populate: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
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

beforeEach(() => {
  jest.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// createNotificationLog
// ═════════════════════════════════════════════════════════════════════════════
describe("createNotificationLog", () => {
  test("saves a notification log and returns it", async () => {
    const logData = {
      patientProfileId: mockId(),
      type: "result_ready",
      channel: "email",
      recipient: "test@example.com",
      status: "sent",
    };

    const saved = { _id: mockId(), ...logData };
    const mockInstance = {
      ...saved,
      save: jest.fn().mockResolvedValue(saved),
    };
    NotificationLog.mockImplementation(() => mockInstance);

    const result = await createNotificationLog(logData);

    expect(mockInstance.save).toHaveBeenCalled();
    expect(result).toMatchObject(logData);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findNotificationsByPatient
// ═════════════════════════════════════════════════════════════════════════════
describe("findNotificationsByPatient", () => {
  test("queries by patientProfileId and returns sorted list", async () => {
    const patientId = mockId();
    const docs = [{ _id: mockId(), type: "result_ready" }];
    const chain = chainMock(docs);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    const result = await findNotificationsByPatient(patientId);

    expect(NotificationLog.find).toHaveBeenCalledWith({
      patientProfileId: patientId,
    });
    expect(chain.sort).toHaveBeenCalledWith({ sentAt: -1 });
    expect(result).toEqual(docs);
  });

  test("applies type, channel, and status filters", async () => {
    const chain = chainMock([]);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    await findNotificationsByPatient(mockId(), {
      type: "result_ready",
      channel: "email",
      status: "sent",
    });

    const query = NotificationLog.find.mock.calls[0][0];
    expect(query.type).toBe("result_ready");
    expect(query.channel).toBe("email");
    expect(query.status).toBe("sent");
  });

  test("applies sentAt date range when startDate and endDate supplied", async () => {
    const chain = chainMock([]);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    await findNotificationsByPatient(mockId(), {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    const query = NotificationLog.find.mock.calls[0][0];
    expect(query.sentAt.$gte).toBeInstanceOf(Date);
    expect(query.sentAt.$lte).toBeInstanceOf(Date);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findNotificationById
// ═════════════════════════════════════════════════════════════════════════════
describe("findNotificationById", () => {
  test("calls findById and returns result", async () => {
    const id = mockId();
    const doc = { _id: id };
    NotificationLog.findById = jest.fn().mockResolvedValue(doc);

    const result = await findNotificationById(id);
    expect(NotificationLog.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(doc);
  });

  test("returns null when not found", async () => {
    NotificationLog.findById = jest.fn().mockResolvedValue(null);
    const result = await findNotificationById(mockId());
    expect(result).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findAllNotifications
// ═════════════════════════════════════════════════════════════════════════════
describe("findAllNotifications", () => {
  test("returns sorted notifications with status filter", async () => {
    const chain = chainMock([]);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    await findAllNotifications({ status: "failed" });

    const query = NotificationLog.find.mock.calls[0][0];
    expect(query.status).toBe("failed");
    expect(chain.sort).toHaveBeenCalledWith({ sentAt: -1 });
  });

  test("returns all notifications with no filters", async () => {
    const chain = chainMock([]);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    await findAllNotifications();

    expect(NotificationLog.find).toHaveBeenCalledWith({});
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findFailedNotifications
// ═════════════════════════════════════════════════════════════════════════════
describe("findFailedNotifications", () => {
  test("queries for failed status only", async () => {
    const chain = chainMock([]);
    NotificationLog.find = jest.fn().mockReturnValue(chain);

    await findFailedNotifications(20);

    expect(NotificationLog.find).toHaveBeenCalledWith({ status: "failed" });
    expect(chain.limit).toHaveBeenCalledWith(20);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// updateNotificationStatus
// ═════════════════════════════════════════════════════════════════════════════
describe("updateNotificationStatus", () => {
  test("updates status without errorMessage", async () => {
    const id = mockId();
    const updated = { _id: id, status: "sent" };
    NotificationLog.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

    const result = await updateNotificationStatus(id, "sent");
    expect(NotificationLog.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { status: "sent" },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  test("includes errorMessage in update when provided", async () => {
    const id = mockId();
    NotificationLog.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    await updateNotificationStatus(id, "failed", "Network timeout");
    const updateArg = NotificationLog.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.errorMessage).toBe("Network timeout");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendResultReadyNotification
// ═════════════════════════════════════════════════════════════════════════════
describe("sendResultReadyNotification", () => {
  const baseData = {
    testResult: { _id: mockId(), releasedAt: new Date() },
    patient: {
      _id: mockId(),
      fullName: "John Doe",
      contactNumber: "+94771234567",
      email: "john@example.com",
    },
    testType: { _id: mockId(), name: "Hemoglobin" },
    healthCenter: { name: "City Lab" },
  };

  beforeEach(() => {
    const logInstance = { save: jest.fn().mockResolvedValue({}) };
    NotificationLog.mockImplementation(() => logInstance);
    sendWhatsAppWithRetry.mockResolvedValue({ success: true });
    sendResultReadyEmail.mockResolvedValue({ success: true });
  });

  test("sends WhatsApp and email when both contact and email are present", async () => {
    const res = await sendResultReadyNotification(baseData);
    expect(sendWhatsAppWithRetry).toHaveBeenCalledWith(
      baseData.patient.contactNumber,
      expect.any(String),
    );
    expect(sendResultReadyEmail).toHaveBeenCalled();
    expect(res.whatsapp).toBeDefined();
    expect(res.email).toBeDefined();
  });

  test("skips WhatsApp when patient has no contactNumber", async () => {
    const data = {
      ...baseData,
      patient: { ...baseData.patient, contactNumber: null },
    };
    const res = await sendResultReadyNotification(data);
    expect(sendWhatsAppWithRetry).not.toHaveBeenCalled();
    expect(res.whatsapp).toBeNull();
    expect(res.email).toBeDefined();
  });

  test("skips email when patient has no email", async () => {
    const data = {
      ...baseData,
      patient: { ...baseData.patient, email: null },
    };
    const res = await sendResultReadyNotification(data);
    expect(sendResultReadyEmail).not.toHaveBeenCalled();
    expect(res.email).toBeNull();
    expect(res.whatsapp).toBeDefined();
  });

  test("logs notification with status=failed when WhatsApp fails", async () => {
    sendWhatsAppWithRetry.mockResolvedValue({
      success: false,
      error: "Timeout",
    });
    const logInstance = { save: jest.fn().mockResolvedValue({}) };
    let capturedLogData;
    NotificationLog.mockImplementation((data) => {
      capturedLogData = data;
      return logInstance;
    });

    await sendResultReadyNotification({
      ...baseData,
      patient: { ...baseData.patient, email: null },
    });

    expect(capturedLogData.status).toBe("failed");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendUnviewedResultReminder
// ═════════════════════════════════════════════════════════════════════════════
describe("sendUnviewedResultReminder", () => {
  const baseData = {
    testResult: { _id: mockId(), releasedAt: new Date() },
    patient: {
      _id: mockId(),
      fullName: "Jane Patient",
      contactNumber: "+94771234567",
      email: "jane@example.com",
    },
    testType: { _id: mockId(), name: "Blood Glucose" },
    healthCenter: { name: "Central Lab" },
    daysUnviewed: 5,
  };

  beforeEach(() => {
    const logInstance = { save: jest.fn().mockResolvedValue({}) };
    NotificationLog.mockImplementation(() => logInstance);
    sendWhatsAppWithRetry.mockResolvedValue({ success: true });
    sendUnviewedResultReminderEmail.mockResolvedValue({ success: true });
  });

  test("sends to both channels when contact and email present", async () => {
    const res = await sendUnviewedResultReminder(baseData);
    expect(sendWhatsAppWithRetry).toHaveBeenCalled();
    expect(sendUnviewedResultReminderEmail).toHaveBeenCalled();
    expect(res.whatsapp.success).toBe(true);
    expect(res.email.success).toBe(true);
  });

  test("sends only email when no contactNumber", async () => {
    const data = {
      ...baseData,
      patient: { ...baseData.patient, contactNumber: undefined },
    };
    const res = await sendUnviewedResultReminder(data);
    expect(sendWhatsAppWithRetry).not.toHaveBeenCalled();
    expect(sendUnviewedResultReminderEmail).toHaveBeenCalled();
    expect(res.whatsapp).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findUnviewedResults
// ═════════════════════════════════════════════════════════════════════════════
describe("findUnviewedResults", () => {
  test("queries for released results older than threshold with empty viewedBy", async () => {
    const chain = chainMock([]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    await findUnviewedResults(3, 2);

    const query = TestResult.find.mock.calls[0][0];
    expect(query.currentStatus).toBe("released");
    expect(query.releasedAt.$lte).toBeInstanceOf(Date);
    expect(query.viewedBy).toEqual({ $size: 0 });
  });

  test("skips results where patient was deleted (null populate)", async () => {
    const resultWithNullPatient = {
      _id: mockId(),
      patientProfileId: null, // deleted patient
      releasedAt: new Date(),
    };
    const chain = chainMock([resultWithNullPatient]);
    TestResult.find = jest.fn().mockReturnValue(chain);

    const filtered = await findUnviewedResults();
    expect(filtered).toHaveLength(0);
  });

  test("skips results that already reached maxReminders", async () => {
    const pid = mockId();
    const resultDoc = {
      _id: mockId(),
      patientProfileId: {
        _id: pid,
        full_name: "Patient",
        contact_number: "+1234",
        email: "p@test.com",
      },
      releasedAt: new Date(),
      testTypeId: { _id: mockId(), name: "Test" },
      healthCenterId: { name: "Lab" },
    };
    const chain = chainMock([resultDoc]);
    TestResult.find = jest.fn().mockReturnValue(chain);
    // Simulate 2 reminders already sent (maxReminders=2)
    NotificationLog.countDocuments = jest.fn().mockResolvedValue(2);

    const filtered = await findUnviewedResults(3, 2);
    expect(filtered).toHaveLength(0);
  });

  test("includes result when reminders sent is below maxReminders", async () => {
    const pid = mockId();
    const resultDoc = {
      _id: mockId(),
      patientProfileId: {
        _id: pid,
        full_name: "Patient",
        contact_number: "+1234",
        email: "p@test.com",
      },
      releasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      testTypeId: { _id: mockId(), name: "Hemoglobin" },
      healthCenterId: { name: "City Lab" },
    };
    const chain = chainMock([resultDoc]);
    TestResult.find = jest.fn().mockReturnValue(chain);
    NotificationLog.countDocuments = jest.fn().mockResolvedValue(0);

    const filtered = await findUnviewedResults(3, 2);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].remindersSent).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// resendNotification
// ═════════════════════════════════════════════════════════════════════════════
describe("resendNotification", () => {
  test("throws 404 when notification not found", async () => {
    NotificationLog.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(resendNotification(mockId())).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("throws 400 when notification is not in failed status", async () => {
    const notification = {
      _id: mockId(),
      status: "sent",
      channel: "whatsapp",
    };
    NotificationLog.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(notification),
      }),
    });

    await expect(resendNotification(mockId())).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("resends via WhatsApp and creates new log on success", async () => {
    const patientObjId = new mongoose.Types.ObjectId();
    const notification = {
      _id: mockId(),
      status: "failed",
      channel: "whatsapp",
      recipient: "+94771234567",
      messageContent: "Test message",
      type: "result_ready",
      patientProfileId: { _id: patientObjId },
      testResultId: { _id: new mongoose.Types.ObjectId() },
    };
    NotificationLog.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(notification),
      }),
    });
    sendWhatsAppWithRetry.mockResolvedValue({ success: true });
    const logInstance = { save: jest.fn().mockResolvedValue({}) };
    NotificationLog.mockImplementation(() => logInstance);

    const result = await resendNotification(mockId());

    expect(sendWhatsAppWithRetry).toHaveBeenCalledWith(
      notification.recipient,
      notification.messageContent,
    );
    expect(logInstance.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// sendRoutineCheckupReminder
// ═════════════════════════════════════════════════════════════════════════════
describe("sendRoutineCheckupReminder", () => {
  test("sends reminder and updates subscription dates", async () => {
    const nextReminderDate = new Date();
    const subscription = {
      _id: mockId(),
      lastTestDate: new Date("2025-01-01"),
      lastReminderSentAt: null,
      nextReminderDate,
      save: jest.fn().mockResolvedValue(true),
    };
    const data = {
      subscription,
      patient: {
        _id: mockId(),
        fullName: "Routine Patient",
        contactNumber: "+94771234567",
        email: "routine@example.com",
      },
      testType: {
        _id: mockId(),
        name: "Blood Glucose",
        recommendedFrequencyInDays: 90,
      },
    };

    const logInstance = { save: jest.fn().mockResolvedValue({}) };
    NotificationLog.mockImplementation(() => logInstance);
    sendWhatsAppWithRetry.mockResolvedValue({ success: true });
    sendRoutineCheckupReminderEmail.mockResolvedValue({ success: true });

    await sendRoutineCheckupReminder(data);

    expect(subscription.lastReminderSentAt).toBeInstanceOf(Date);
    expect(subscription.nextReminderDate).toBeInstanceOf(Date);
    expect(subscription.save).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createSubscription
// ═════════════════════════════════════════════════════════════════════════════
describe("createSubscription", () => {
  const subscriptionData = {
    patientProfileId: mockId(),
    testTypeId: mockId(),
    lastTestDate: "2025-01-01",
  };

  test("throws 404 when test type not found", async () => {
    TestType.findById = jest.fn().mockResolvedValue(null);

    await expect(createSubscription(subscriptionData)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("throws 400 when test type does not support routine monitoring", async () => {
    TestType.findById = jest.fn().mockResolvedValue({
      _id: subscriptionData.testTypeId,
      isRoutineMonitoringRecommended: false,
    });

    await expect(createSubscription(subscriptionData)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws 409 when active subscription already exists", async () => {
    TestType.findById = jest.fn().mockResolvedValue({
      isRoutineMonitoringRecommended: true,
      recommendedFrequencyInDays: 90,
    });
    ReminderSubscription.findOne = jest
      .fn()
      .mockResolvedValue({ _id: mockId() });

    await expect(createSubscription(subscriptionData)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("creates subscription and calculates nextReminderDate", async () => {
    TestType.findById = jest.fn().mockResolvedValue({
      isRoutineMonitoringRecommended: true,
      recommendedFrequencyInDays: 90,
    });
    ReminderSubscription.findOne = jest.fn().mockResolvedValue(null);

    const subInstance = {
      _id: mockId(),
      ...subscriptionData,
      nextReminderDate: new Date(),
      status: "active",
      save: jest.fn().mockResolvedValue(true),
    };
    ReminderSubscription.mockImplementation(() => subInstance);

    const result = await createSubscription(subscriptionData);

    expect(subInstance.save).toHaveBeenCalled();
    expect(result).toEqual(subInstance);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findSubscriptionsByPatient
// ═════════════════════════════════════════════════════════════════════════════
describe("findSubscriptionsByPatient", () => {
  test("queries for active subscriptions sorted by nextReminderDate", async () => {
    const patientId = mockId();
    const chain = chainMock([]);
    ReminderSubscription.find = jest.fn().mockReturnValue(chain);

    await findSubscriptionsByPatient(patientId);

    expect(ReminderSubscription.find).toHaveBeenCalledWith({
      patientProfileId: patientId,
      status: "active",
    });
    expect(chain.sort).toHaveBeenCalledWith({ nextReminderDate: 1 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findSubscriptionById
// ═════════════════════════════════════════════════════════════════════════════
describe("findSubscriptionById", () => {
  test("returns populated subscription", async () => {
    const id = mockId();
    const doc = { _id: id, testTypeId: { name: "Hemoglobin" } };
    const chain = chainMock(doc);
    ReminderSubscription.findById = jest.fn().mockReturnValue(chain);

    const result = await findSubscriptionById(id);
    expect(ReminderSubscription.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(doc);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// deactivateSubscription
// ═════════════════════════════════════════════════════════════════════════════
describe("deactivateSubscription", () => {
  test("sets status to inactive and saves", async () => {
    const sub = {
      _id: mockId(),
      status: "active",
      save: jest.fn().mockResolvedValue(true),
    };
    ReminderSubscription.findById = jest.fn().mockResolvedValue(sub);

    const result = await deactivateSubscription(sub._id);

    expect(result.status).toBe("inactive");
    expect(result.unsubscribedAt).toBeInstanceOf(Date);
    expect(sub.save).toHaveBeenCalled();
  });

  test("throws 404 when subscription not found", async () => {
    ReminderSubscription.findById = jest.fn().mockResolvedValue(null);

    await expect(deactivateSubscription(mockId())).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// findSubscriptionsDueToday
// ═════════════════════════════════════════════════════════════════════════════
describe("findSubscriptionsDueToday", () => {
  test("queries for active subscriptions with nextReminderDate within today", async () => {
    const chain = chainMock([]);
    ReminderSubscription.find = jest.fn().mockReturnValue(chain);

    await findSubscriptionsDueToday();

    const query = ReminderSubscription.find.mock.calls[0][0];
    expect(query.status).toBe("active");
    expect(query.nextReminderDate.$gte).toBeInstanceOf(Date);
    expect(query.nextReminderDate.$lt).toBeInstanceOf(Date);
  });
});
