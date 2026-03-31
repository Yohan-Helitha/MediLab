import { validationResult } from 'express-validator';

import {
  recordPayment,
  getRevenueByCenter,
  getRevenueByDateRange,
  getRecentPayments,
  listPayments,
  listUnpaidBookings,
} from './finance.service.js';

const parseDateRange = (startDateRaw, endDateRaw) => {
  const now = new Date();

  const startDate = startDateRaw
    ? new Date(startDateRaw)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const endDate = endDateRaw ? new Date(endDateRaw) : now;

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    const error = new Error('Invalid startDate or endDate');
    error.statusCode = 400;
    throw error;
  }

  return { startDate, endDate };
};

export const recordCashPaymentController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, amount, notes } = req.body;

    const { transaction, booking } = await recordPayment({
      bookingId,
      amount,
      paymentMethod: 'CASH',
      status: 'PAID',
      receivedBy: req.user?.id || null,
      notes: notes || null,
    });

    return res.status(201).json({
      message: 'Cash payment recorded successfully',
      transaction,
      booking,
    });
  } catch (error) {
    console.error('Error recording cash payment:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const getFinanceSummaryController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = parseDateRange(
      req.query.startDate,
      req.query.endDate,
    );

    const summary = await getRevenueByDateRange({ startDate, endDate });

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const getRevenueByCenterController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = parseDateRange(
      req.query.startDate,
      req.query.endDate,
    );

    const rows = await getRevenueByCenter({ startDate, endDate });

    return res.status(200).json({ items: rows });
  } catch (error) {
    console.error('Error fetching revenue by center:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const getRecentPaymentsController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const items = await getRecentPayments({ limit });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const listPaymentsController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paymentMethod = req.query.paymentMethod || null;
    const limit = req.query.limit ? Number(req.query.limit) : 5000;

    const items = await listPayments({ paymentMethod, limit });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Error listing payments:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const listUnpaidBookingsController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paymentMethod = req.query.paymentMethod || null;
    const limit = req.query.limit ? Number(req.query.limit) : 5000;

    const items = await listUnpaidBookings({ paymentMethod, limit });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Error listing unpaid bookings:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Online payment callback/webhook (gateway-to-server)
// NOTE: This is intentionally minimal; real gateway signature validation is required.
export const onlinePaymentCallbackController = async (req, res) => {
  try {
    const secret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;

    if (secret) {
      const provided = req.headers['x-gateway-secret'];
      if (!provided || provided !== secret) {
        return res.status(401).json({ message: 'Unauthorized callback' });
      }
    }

    const { bookingId, amount, paymentReference } = req.body || {};

    if (!bookingId || amount === undefined || amount === null) {
      return res
        .status(400)
        .json({ message: 'bookingId and amount are required' });
    }

    const { transaction, booking } = await recordPayment({
      bookingId,
      amount,
      paymentMethod: 'ONLINE',
      status: 'PAID',
      paymentReference: paymentReference || null,
    });

    return res.status(200).json({
      message: 'Online payment callback processed',
      transaction,
      booking,
    });
  } catch (error) {
    console.error('Error handling online payment callback:', error);
    return res.status(400).json({ message: error.message });
  }
};
