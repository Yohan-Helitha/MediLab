import { jest } from "@jest/globals";
import mongoose from "mongoose";

import Booking from "../booking/booking.model.js";
import FinanceTransaction from "./financeTransaction.model.js";

import {
  recordPayment,
  getRevenueByDateRange,
  getRecentPayments,
  listPayments,
  listUnpaidBookings,
} from "./finance.service.js";

function mockSession() {
  return {
    withTransaction: async (fn) => {
      await fn();
    },
    endSession: jest.fn(),
  };
}

describe("finance.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mongoose.startSession = jest.fn().mockResolvedValue(mockSession());

    Booking.findById = jest.fn();
    Booking.find = jest.fn();
    Booking.aggregate = jest.fn();
    Booking.findOne = jest.fn();
    Booking.findByIdAndUpdate = jest.fn();
    Booking.countDocuments = jest.fn();

    FinanceTransaction.create = jest.fn();
    FinanceTransaction.aggregate = jest.fn();
    FinanceTransaction.find = jest.fn();
  });

  test("recordPayment creates FinanceTransaction and updates booking to PAID", async () => {
    const bookingId = "b1";

    const bookingDoc = {
      _id: bookingId,
      isActive: true,
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      healthCenterId: "center1",
    };

    const bookingExec = jest.fn().mockResolvedValue(bookingDoc);
    const bookingSession = jest.fn().mockReturnValue({ exec: bookingExec });
    Booking.findById.mockReturnValue({ session: bookingSession });

    const createdTx = {
      _id: "t1",
      bookingId,
      centerId: "center1",
      amount: 2500,
      paymentMethod: "CASH",
      paymentStatus: "PAID",
    };

    FinanceTransaction.create.mockResolvedValue([createdTx]);

    const updatedBooking = {
      ...bookingDoc,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
    };

    Booking.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedBooking),
    });

    const result = await recordPayment({
      bookingId,
      amount: 2500,
      paymentMethod: "CASH",
      status: "PAID",
      receivedBy: "admin1",
    });

    expect(FinanceTransaction.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          bookingId,
          centerId: "center1",
          amount: 2500,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          receivedBy: "admin1",
        }),
      ],
      { session: expect.any(Object) },
    );

    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
      bookingId,
      { paymentMethod: "CASH", paymentStatus: "PAID" },
      expect.objectContaining({ new: true, runValidators: true, session: expect.any(Object) }),
    );

    expect(result.transaction).toEqual(createdTx);
    expect(result.booking).toEqual(updatedBooking);
  });

  test("recordPayment with ONLINE PAID marks booking COMPLETED and assigns queueNumber", async () => {
    const bookingId = "b-online";

    const bookingDoc = {
      _id: bookingId,
      isActive: true,
      paymentStatus: "UNPAID",
      paymentMethod: "ONLINE",
      healthCenterId: "center1",
      bookingDate: new Date("2026-04-08T10:00:00.000Z"),
      status: "PENDING",
      queueNumber: null,
    };

    const bookingExec = jest.fn().mockResolvedValue(bookingDoc);
    const bookingSession = jest.fn().mockReturnValue({ exec: bookingExec });
    Booking.findById.mockReturnValue({ session: bookingSession });

    // Mock queue-number lookup (last queue number = 4 -> next should be 5)
    const qExec = jest.fn().mockResolvedValue({ queueNumber: 4 });
    const qLean = jest.fn().mockReturnValue({ exec: qExec });
    const qSelect = jest.fn().mockReturnValue({ lean: qLean });
    const qSort = jest.fn().mockReturnValue({ select: qSelect });
    const qSession = jest.fn().mockReturnValue({ sort: qSort });
    Booking.findOne.mockReturnValue({ session: qSession });

    const createdTx = {
      _id: "t-online",
      bookingId,
      centerId: "center1",
      amount: 3000,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
    };
    FinanceTransaction.create.mockResolvedValue([createdTx]);

    const updatedBooking = {
      ...bookingDoc,
      paymentStatus: "PAID",
      paymentMethod: "ONLINE",
      status: "COMPLETED",
      queueNumber: 5,
    };

    Booking.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedBooking),
    });

    const result = await recordPayment({
      bookingId,
      amount: 3000,
      paymentMethod: "ONLINE",
      status: "PAID",
      paymentReference: "payhere-123",
    });

    expect(Booking.findOne).toHaveBeenCalled();

    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
      bookingId,
      expect.objectContaining({
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        status: "COMPLETED",
        queueNumber: 5,
      }),
      expect.objectContaining({ new: true, runValidators: true, session: expect.any(Object) }),
    );

    expect(result.transaction).toEqual(createdTx);
    expect(result.booking).toEqual(updatedBooking);
  });

  test("getRevenueByDateRange returns aggregate totals + pending count", async () => {
    FinanceTransaction.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          totalRevenue: 5000,
          totalTransactions: 2,
          revenueByMethod: {
            CASH: { amount: 5000, count: 2 },
            ONLINE: { amount: 0, count: 0 },
          },
        },
      ]),
    });

    Booking.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(3),
    });

    const startDate = new Date("2026-01-01T00:00:00.000Z");
    const endDate = new Date("2026-01-31T23:59:59.999Z");

    const summary = await getRevenueByDateRange({ startDate, endDate });

    expect(summary.totalRevenue).toBe(5000);
    expect(summary.totalPaid).toBe(5000);
    expect(summary.totalTransactions).toBe(2);
    expect(summary.pendingPayments).toBe(3);
    expect(summary.revenueByMethod.CASH.count).toBe(2);
  });

  test("getRecentPayments maps populated booking snapshots", async () => {
    const now = new Date();

    const exec = jest.fn().mockResolvedValue([
      {
        _id: "t1",
        amount: 1000,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        paymentReference: null,
        createdAt: now,
        bookingId: {
          _id: "b1",
          patientNameSnapshot: "Jane Doe",
          testNameSnapshot: "Hemoglobin",
          centerNameSnapshot: "Lab A",
        },
      },
    ]);

    const populate = jest.fn().mockReturnValue({ exec });
    const limit = jest.fn().mockReturnValue({ populate });
    const sort = jest.fn().mockReturnValue({ limit });

    FinanceTransaction.find.mockReturnValue({ sort });

    const items = await getRecentPayments({ limit: 10 });

    expect(Array.isArray(items)).toBe(true);
    expect(items[0]).toEqual(
      expect.objectContaining({
        bookingId: "b1",
        patientName: "Jane Doe",
        testName: "Hemoglobin",
        centerName: "Lab A",
        amount: 1000,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
      }),
    );
  });

  test("listPayments applies paymentMethod filter and maps rows", async () => {
    const now = new Date();

    const exec = jest.fn().mockResolvedValue([
      {
        _id: "t1",
        amount: 2000,
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        paymentReference: "ref-1",
        createdAt: now,
        bookingId: {
          _id: "b1",
          patientNameSnapshot: "Alex",
          testNameSnapshot: "ECG",
          centerNameSnapshot: "Lab X",
        },
      },
    ]);

    const populate = jest.fn().mockReturnValue({ exec });
    const limit = jest.fn().mockReturnValue({ populate });
    const sort = jest.fn().mockReturnValue({ limit });

    FinanceTransaction.find.mockReturnValue({ sort });

    const items = await listPayments({ paymentMethod: "ONLINE", limit: 100 });

    expect(FinanceTransaction.find).toHaveBeenCalledWith({ paymentMethod: "ONLINE" });
    expect(items[0]).toEqual(
      expect.objectContaining({
        bookingId: "b1",
        amount: 2000,
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        paymentReference: "ref-1",
      }),
    );
  });

  test("listUnpaidBookings lists unpaid cash bookings", async () => {
    const now = new Date();

    const exec = jest.fn().mockResolvedValue([
      {
        bookingId: "b1",
        patientName: "Sam",
        testName: "CBC",
        centerName: "Lab 1",
        bookingDate: now,
        paymentMethod: "CASH",
        paymentStatus: "UNPAID",
        createdAt: now,
        price: 1500,
      },
    ]);

    Booking.aggregate.mockReturnValue({ exec });

    const items = await listUnpaidBookings({ paymentMethod: "CASH", limit: 50 });

    expect(Booking.aggregate).toHaveBeenCalled();
    expect(items[0]).toEqual(
      expect.objectContaining({
        bookingId: "b1",
        patientName: "Sam",
        paymentMethod: "CASH",
        paymentStatus: "UNPAID",
        price: 1500,
      }),
    );
  });
});
