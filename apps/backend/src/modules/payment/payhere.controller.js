import Booking from '../booking/booking.model.js';
import Member from '../patient/models/Member.js';
import LabTest from '../lab/labTest.model.js';
import { recordPayment } from '../finance/finance.service.js';
import {
  formatAmount,
  generateCheckoutHash,
  validateNotifySignature,
} from './payhere.service.js';

const getEnv = () => {
  const merchantId = process.env.MERCHANT_ID || '';
  const merchantSecret = process.env.MERCHANT_SECRET || '';

  // Allow overriding the checkout URL for sandbox/live.
  // Defaults to PayHere sandbox checkout.
  const checkoutUrl =
    process.env.PAYHERE_CHECKOUT_URL || 'https://sandbox.payhere.lk/pay/checkout';

  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return { merchantId, merchantSecret, checkoutUrl, appUrl, frontendUrl };
};

const splitName = (fullName) => {
  const normalized = String(fullName || '').trim();
  if (!normalized) return { first_name: 'Patient', last_name: 'User' };

  const parts = normalized.split(/\s+/g);
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
};

export const createPayHereCheckoutController = async (req, res) => {
  try {
    const { merchantId, merchantSecret, checkoutUrl, appUrl, frontendUrl } =
      getEnv();

    const { bookingId } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId).exec();
    if (!booking || booking.isActive !== true) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the authenticated patient owns this booking
    if (String(booking.patientProfileId) !== String(req.user.profileId)) {
      return res.status(403).json({ message: 'Not allowed for this booking' });
    }

    // Price is lab-specific: LabTest(labId + diagnosticTestId)
    const labTest = await LabTest.findOne({
      labId: booking.healthCenterId,
      diagnosticTestId: booking.diagnosticTestId,
      isActive: true,
    })
      .populate('diagnosticTestId', 'name')
      .exec();

    if (!labTest) {
      return res.status(404).json({
        message:
          'Price not configured for this lab/test. Create a LabTest entry first.',
      });
    }

    const amount = Number(labTest.price);
    const currency = process.env.PAYHERE_CURRENCY || 'LKR';

    const patient = await Member.findById(booking.patientProfileId).exec();
    const { first_name, last_name } = splitName(
      patient?.full_name || booking.patientNameSnapshot,
    );

    const orderId = String(booking._id);

    const hash = generateCheckoutHash({
      merchantId,
      merchantSecret,
      orderId,
      amount,
      currency,
    });

    const returnUrl = `${frontendUrl}/payments/payhere/return?status=success&order_id=${encodeURIComponent(
      orderId,
    )}`;
    const cancelUrl = `${frontendUrl}/payments/payhere/return?status=cancel&order_id=${encodeURIComponent(
      orderId,
    )}`;
    const notifyUrl = `${appUrl}/api/payments/payhere/notify`;

    const fields = {
      merchant_id: merchantId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,

      order_id: orderId,
      items: booking.testNameSnapshot || labTest?.diagnosticTestId?.name || 'Lab Test',
      currency,
      amount: formatAmount(amount),

      first_name,
      last_name,
      email: patient?.email || req.user.email || 'patient@example.com',
      phone: patient?.contact_number || booking.patientPhoneSnapshot || '0000000000',
      address: patient?.address || 'Not Provided',
      city: patient?.district || 'Not Provided',
      country: process.env.PAYHERE_COUNTRY || 'Sri Lanka',

      hash,
    };

    return res.status(200).json({ checkoutUrl, fields });
  } catch (error) {
    console.error('Error creating PayHere checkout payload:', error);
    return res.status(400).json({ message: error.message });
  }
};

// PayHere notify URL handler (PayHere -> backend)
export const payHereNotifyController = async (req, res) => {
  try {
    const { merchantId, merchantSecret } = getEnv();

    // PayHere sends form-encoded by default; express.urlencoded is enabled.
    const body = req.body || {};

    const orderId = body.order_id;
    const paymentId = body.payment_id || body.payhere_payment_id || null;
    const statusCode = body.status_code;
    const payhereAmount = body.payhere_amount || body.amount;
    const payhereCurrency = body.payhere_currency || body.currency;
    const md5sig = body.md5sig;

    if (!orderId || !statusCode || !payhereAmount || !payhereCurrency) {
      return res.status(400).send('Missing required fields');
    }

    const isValid = validateNotifySignature({
      merchantId,
      merchantSecret,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig,
    });

    if (!isValid) {
      // Respond 200 so PayHere doesn't retry aggressively, but do not record payment.
      console.warn('[PayHere] Invalid md5sig for order:', orderId);
      return res.status(200).send('Invalid signature');
    }

    // PayHere success status_code is commonly 2.
    const status = String(statusCode) === '2' ? 'PAID' : 'FAILED';

    await recordPayment({
      bookingId: orderId,
      amount: Number(payhereAmount),
      paymentMethod: 'ONLINE',
      status,
      paymentReference: paymentId,
      notes: status === 'PAID' ? 'PayHere payment success' : `PayHere status ${statusCode}`,
    });

    return res.status(200).send('OK');
  } catch (error) {
    console.error('[PayHere] Notify error:', error);
    // Respond 200 to avoid repeated retries during development.
    return res.status(200).send('Error');
  }
};
