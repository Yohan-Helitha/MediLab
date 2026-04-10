import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../app.js';
import { connectDB } from '../../../config/db.js';

import authService from '../../auth/auth.service.js';
import HealthOfficer from '../../auth/healthOfficer.model.js';
import Lab from '../../lab/lab.model.js';
import TestType from '../../test/testType.model.js';
import LabTest from '../../lab/labTest.model.js';
import Booking from '../../booking/booking.model.js';
import FinanceTransaction from '../../finance/financeTransaction.model.js';

import { md5HexUpper, formatAmount } from '../payhere.service.js';

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

jest.setTimeout(30000);

describeIfDb('PayHere routes integration', () => {
  let originalEnv;

  let adminOfficer;
  let patient;
  let patientToken;
  let booking;
  let labTest;

  beforeAll(async () => {
    originalEnv = { ...process.env };

    process.env.MERCHANT_ID = 'MERCHANT_TEST_123';
    process.env.MERCHANT_SECRET = 'SECRET_TEST_123';
    process.env.PAYHERE_CURRENCY = 'LKR';
    process.env.APP_URL = 'http://localhost:5000';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.PAYHERE_CHECKOUT_URL = 'https://sandbox.payhere.lk/pay/checkout';

    await connectDB();

    const uniqueSuffix = Date.now();

    adminOfficer = await HealthOfficer.create({
      fullName: 'Payment Integration Admin',
      gender: 'OTHER',
      employeeId: `EMP-PAY-INT-${uniqueSuffix}`,
      contactNumber: '0777000300',
      email: `payment.int.admin.${uniqueSuffix}@example.com`,
      assignedArea: 'Integration Area',
      role: 'Admin',
      username: `payhere_int_admin_${uniqueSuffix}`,
      passwordHash: await authService.hashPassword('IntAdminPayHere@123'),
      isActive: true,
    });

    const registered = await authService.registerPatient({
      full_name: 'PayHere Integration Patient',
      email: `payhere.int.patient.${uniqueSuffix}@example.com`,
      contact_number: '0777000998',
      password: 'PayHerePatient@123',
    });

    patient = registered.user.profile;
    patientToken = registered.token;

    const lab = await Lab.create({
      name: `PayHere Integration Lab ${uniqueSuffix}`,
      district: 'Colombo',
      province: 'Western',
      phoneNumber: '0114000002',
      email: `integration.payhere.lab.${uniqueSuffix}@example.com`,
      createdBy: adminOfficer._id,
    });

    const testType = await TestType.create({
      name: `PayHere Integration Test ${uniqueSuffix}`,
      code: `PAYINT-${uniqueSuffix}`,
      category: 'Hematology',
      description: 'Integration test type for PayHere routes',
      entryMethod: 'form',
      discriminatorType: 'Hemoglobin',
      isRoutineMonitoringRecommended: false,
      specificParameters: {},
      reportTemplate: 'templates/integration-payhere.html',
      isActive: true,
    });

    labTest = await LabTest.create({
      labId: lab._id,
      diagnosticTestId: testType._id,
      price: 1500,
      estimatedResultTimeHours: 24,
      isActive: true,
    });

    booking = await Booking.create({
      patientProfileId: patient._id,
      patientNameSnapshot: patient.full_name,
      patientPhoneSnapshot: patient.contact_number,
      healthCenterId: lab._id,
      diagnosticTestId: testType._id,
      testNameSnapshot: testType.name,
      centerNameSnapshot: lab.name,
      bookingDate: new Date(),
      timeSlot: '09:00',
      bookingType: 'WALK_IN',
      priorityLevel: 'NORMAL',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'ONLINE',
      createdBy: adminOfficer._id,
      isActive: true,
    });

    await FinanceTransaction.deleteMany({ bookingId: booking._id });
  });

  afterAll(async () => {
    process.env = originalEnv;
    try {
      await mongoose.connection.close();
    } catch (e) {
      // no-op
    }
  });

  it('rejects checkout without auth', async () => {
    const res = await request(app)
      .post('/api/payments/payhere/checkout')
      .send({ bookingId: String(booking._id) });

    expect(res.status).toBe(401);
  });

  it('rejects checkout when bookingId is missing', async () => {
    const res = await request(app)
      .post('/api/payments/payhere/checkout')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns checkout payload for patient-owned booking', async () => {
    const res = await request(app)
      .post('/api/payments/payhere/checkout')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ bookingId: String(booking._id) });

    expect(res.status).toBe(200);
    expect(res.body.checkoutUrl).toBe('https://sandbox.payhere.lk/pay/checkout');

    expect(res.body.fields).toEqual(
      expect.objectContaining({
        merchant_id: process.env.MERCHANT_ID,
        order_id: String(booking._id),
        currency: 'LKR',
        amount: formatAmount(labTest.price),
      }),
    );

    // Verify hash uses the expected formula
    const secretHash = md5HexUpper(process.env.MERCHANT_SECRET);
    const raw = `${process.env.MERCHANT_ID}${String(booking._id)}${formatAmount(labTest.price)}LKR${secretHash}`;
    const expectedHash = md5HexUpper(raw);
    expect(res.body.fields.hash).toBe(expectedHash);

    expect(res.body.fields.notify_url).toContain('/api/payments/payhere/notify');
  });

  it('rejects checkout for a booking owned by another patient', async () => {
    const uniqueSuffix = Date.now();
    const registered2 = await authService.registerPatient({
      full_name: 'Other Patient',
      email: `payhere.int.other.${uniqueSuffix}@example.com`,
      contact_number: '0777000111',
      password: 'OtherPatient@123',
    });

    const res = await request(app)
      .post('/api/payments/payhere/checkout')
      .set('Authorization', `Bearer ${registered2.token}`)
      .send({ bookingId: String(booking._id) });

    expect(res.status).toBe(403);
  });

  it('notify rejects when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/payments/payhere/notify')
      .type('form')
      .send({ order_id: String(booking._id) });

    expect(res.status).toBe(400);
  });

  it('notify returns 200 on invalid signature and does not record payment', async () => {
    const res = await request(app)
      .post('/api/payments/payhere/notify')
      .type('form')
      .send({
        merchant_id: process.env.MERCHANT_ID,
        order_id: String(booking._id),
        payment_id: 'PTEST-1',
        status_code: '2',
        payhere_amount: formatAmount(labTest.price),
        payhere_currency: 'LKR',
        md5sig: 'BAD',
      });

    expect(res.status).toBe(200);
    expect(String(res.text)).toContain('Invalid');

    const count = await FinanceTransaction.countDocuments({
      bookingId: booking._id,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
    }).exec();

    expect(count).toBe(0);
  });

  it('notify records payment when signature is valid (status_code=2)', async () => {
    const orderId = String(booking._id);
    const statusCode = '2';
    const payhereAmount = formatAmount(labTest.price);
    const payhereCurrency = 'LKR';

    const secretHash = md5HexUpper(process.env.MERCHANT_SECRET);
    const raw = `${process.env.MERCHANT_ID}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`;
    const md5sig = md5HexUpper(raw);

    const res = await request(app)
      .post('/api/payments/payhere/notify')
      .type('form')
      .send({
        merchant_id: process.env.MERCHANT_ID,
        order_id: orderId,
        payment_id: 'PTEST-OK',
        status_code: statusCode,
        payhere_amount: payhereAmount,
        payhere_currency: payhereCurrency,
        md5sig,
      });

    expect(res.status).toBe(200);
    expect(String(res.text)).toContain('OK');

    const updated = await Booking.findById(orderId).lean().exec();
    expect(updated.paymentStatus).toBe('PAID');
    expect(updated.paymentMethod).toBe('ONLINE');
    expect(updated.status).toBe('COMPLETED');
    expect(updated.queueNumber).toBeTruthy();

    const tx = await FinanceTransaction.findOne({
      bookingId: orderId,
      paymentReference: 'PTEST-OK',
    })
      .lean()
      .exec();

    expect(tx).toBeTruthy();
    expect(tx.paymentMethod).toBe('ONLINE');
    expect(tx.paymentStatus).toBe('PAID');
  });
});
