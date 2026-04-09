import express from 'express';

import {
  recordCashPaymentController,
  getFinanceSummaryController,
  getRevenueByCenterController,
  getRecentPaymentsController,
  listPaymentsController,
  listUnpaidBookingsController,
  onlinePaymentCallbackController,
} from './finance.controller.js';

import {
  recordCashPaymentValidation,
  dateRangeQueryValidation,
  recentPaymentsQueryValidation,
  listPaymentsQueryValidation,
  listUnpaidBookingsQueryValidation,
} from './finance.validation.js';

import { authenticate, checkRole } from '../auth/auth.middleware.js';

const router = express.Router();

const protect = authenticate;
const adminOnly = checkRole(['Admin', 'ADMIN']);

// Gateway callback: secured via shared secret header/env, not admin role.
router.post('/payments/online/callback', onlinePaymentCallbackController);

// Admin-only finance endpoints
router.post(
  '/payments/cash',
  protect,
  adminOnly,
  recordCashPaymentValidation,
  recordCashPaymentController,
);

router.get(
  '/summary',
  protect,
  adminOnly,
  dateRangeQueryValidation,
  getFinanceSummaryController,
);

router.get(
  '/revenue-by-center',
  protect,
  adminOnly,
  dateRangeQueryValidation,
  getRevenueByCenterController,
);

router.get(
  '/recent-payments',
  protect,
  adminOnly,
  recentPaymentsQueryValidation,
  getRecentPaymentsController,
);

router.get(
  '/payments',
  protect,
  adminOnly,
  listPaymentsQueryValidation,
  listPaymentsController,
);

router.get(
  '/unpaid-bookings',
  protect,
  adminOnly,
  listUnpaidBookingsQueryValidation,
  listUnpaidBookingsController,
);

export default router;
