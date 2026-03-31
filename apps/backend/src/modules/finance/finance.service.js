import mongoose from 'mongoose';

import Booking from '../booking/booking.model.js';
import FinanceTransaction from './financeTransaction.model.js';

const mapBookingPaymentStatus = (booking, transactionStatus) => {
  if (transactionStatus === 'PAID' && booking.paymentStatus !== 'PAID') {
    return 'PAID';
  }

  // Booking schema currently supports only UNPAID/PAID.
  // If a refund is recorded, best-effort is to mark booking back as UNPAID.
  if (transactionStatus === 'REFUNDED' && booking.paymentStatus === 'PAID') {
    return 'UNPAID';
  }

  return booking.paymentStatus;
};

export const recordPayment = async ({
  bookingId,
  amount,
  paymentMethod,
  status,
  receivedBy = null,
  paymentReference = null,
  notes = null,
}) => {
  const session = await mongoose.startSession();

  try {
    let createdTransaction;
    let updatedBooking;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session).exec();

      if (!booking || booking.isActive !== true) {
        throw new Error('Booking not found or inactive');
      }

      const centerId = booking.healthCenterId;

      const created = await FinanceTransaction.create(
        [
          {
            bookingId,
            centerId,
            amount,
            paymentMethod,
            paymentStatus: status,
            receivedBy,
            paymentReference,
            notes,
          },
        ],
        { session },
      );

      createdTransaction = created[0];

      const nextBookingStatus = mapBookingPaymentStatus(booking, status);

      const bookingUpdate = {};
      if (paymentMethod) {
        bookingUpdate.paymentMethod = paymentMethod;
      }
      if (nextBookingStatus !== booking.paymentStatus) {
        bookingUpdate.paymentStatus = nextBookingStatus;
      }

      if (Object.keys(bookingUpdate).length) {
        updatedBooking = await Booking.findByIdAndUpdate(bookingId, bookingUpdate, {
          new: true,
          runValidators: true,
          session,
        }).exec();
      } else {
        updatedBooking = booking;
      }
    });

    return {
      transaction: createdTransaction,
      booking: updatedBooking,
    };
  } finally {
    await session.endSession();
  }
};

export const getRevenueByCenter = async ({ startDate, endDate }) => {
  const match = {
    paymentStatus: 'PAID',
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  const rows = await FinanceTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$centerId',
        totalRevenue: { $sum: '$amount' },
        paidCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'labs',
        localField: '_id',
        foreignField: '_id',
        as: 'center',
      },
    },
    { $unwind: { path: '$center', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        centerId: '$_id',
        centerName: '$center.name',
        totalRevenue: 1,
        paidCount: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]).exec();

  return rows;
};

export const getRevenueByDateRange = async ({ startDate, endDate }) => {
  const match = {
    paymentStatus: 'PAID',
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  const [agg] = await FinanceTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        cashAmount: {
          $sum: {
            $cond: [{ $eq: ['$paymentMethod', 'CASH'] }, '$amount', 0],
          },
        },
        cashCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentMethod', 'CASH'] }, 1, 0],
          },
        },
        onlineAmount: {
          $sum: {
            $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, '$amount', 0],
          },
        },
        onlineCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalTransactions: 1,
        revenueByMethod: {
          CASH: { amount: '$cashAmount', count: '$cashCount' },
          ONLINE: { amount: '$onlineAmount', count: '$onlineCount' },
        },
      },
    },
  ]).exec();

  const pendingCount = await Booking.countDocuments({
    isActive: true,
    paymentStatus: 'UNPAID',
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).exec();

  return {
    totalRevenue: agg?.totalRevenue || 0,
    totalPaid: agg?.totalRevenue || 0,
    totalTransactions: agg?.totalTransactions || 0,
    pendingPayments: pendingCount,
    pendingCount,
    revenueByMethod: agg?.revenueByMethod || {
      CASH: { amount: 0, count: 0 },
      ONLINE: { amount: 0, count: 0 },
    },
  };
};

export const getRecentPayments = async ({ limit = 10 }) => {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);

  const txs = await FinanceTransaction.find({})
    .sort({ createdAt: -1 })
    .limit(cappedLimit)
    .populate('bookingId', 'patientNameSnapshot testNameSnapshot centerNameSnapshot')
    .exec();

  return txs.map((tx) => {
    const booking = tx.bookingId;

    return {
      transactionId: tx._id,
      bookingId: booking?._id || tx.bookingId,
      patientName: booking?.patientNameSnapshot || null,
      testName: booking?.testNameSnapshot || null,
      centerName: booking?.centerNameSnapshot || null,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      paymentStatus: tx.paymentStatus,
      paymentReference: tx.paymentReference || null,
      createdAt: tx.createdAt,
    };
  });
};

export const listPayments = async ({ paymentMethod = null, limit = 5000 } = {}) => {
  const cappedLimit = Math.min(Math.max(Number(limit) || 5000, 1), 5000);

  const filter = {};
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  const txs = await FinanceTransaction.find(filter)
    .sort({ createdAt: -1 })
    .limit(cappedLimit)
    .populate(
      'bookingId',
      'patientNameSnapshot testNameSnapshot centerNameSnapshot paymentStatus paymentMethod',
    )
    .exec();

  return txs.map((tx) => {
    const booking = tx.bookingId;

    return {
      transactionId: tx._id,
      bookingId: booking?._id || tx.bookingId,
      patientName: booking?.patientNameSnapshot || null,
      testName: booking?.testNameSnapshot || null,
      centerName: booking?.centerNameSnapshot || null,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      paymentStatus: tx.paymentStatus,
      paymentReference: tx.paymentReference || null,
      createdAt: tx.createdAt,
    };
  });
};

export const listUnpaidBookings = async ({ paymentMethod = null, limit = 5000 } = {}) => {
  const cappedLimit = Math.min(Math.max(Number(limit) || 5000, 1), 5000);

  const filter = {
    isActive: true,
    paymentStatus: 'UNPAID',
  };

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .limit(cappedLimit)
    .select(
      'patientNameSnapshot testNameSnapshot centerNameSnapshot bookingDate paymentMethod paymentStatus createdAt',
    )
    .exec();

  return bookings.map((b) => {
    const plain = b.toObject ? b.toObject() : b;
    return {
      bookingId: plain._id,
      patientName: plain.patientNameSnapshot || null,
      testName: plain.testNameSnapshot || null,
      centerName: plain.centerNameSnapshot || null,
      bookingDate: plain.bookingDate,
      paymentMethod: plain.paymentMethod || null,
      paymentStatus: plain.paymentStatus,
      createdAt: plain.createdAt,
    };
  });
};
