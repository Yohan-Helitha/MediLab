import express from 'express';

import { authenticate, isPatient } from '../auth/auth.middleware.js';
import {
  createPayHereCheckoutController,
  payHereNotifyController,
} from './payhere.controller.js';

const router = express.Router();

// Patient-only: create a checkout payload (includes server-generated hash)
router.post('/checkout', authenticate, isPatient, createPayHereCheckoutController);

// PayHere webhook/notify (no auth)
router.post('/notify', payHereNotifyController);

export default router;
