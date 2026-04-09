/**
 * Run this test file with:
 * npm test -- src/modules/booking/__tests__/booking.integration.test.js
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { connectDB } from '../../../config/db.js';

// Import models FIRST (ensures schema registration)
import Booking from '../booking.model.js';
import Member from '../../patient/models/Member.js';
import Lab from '../../lab/lab.model.js';
import TestType from '../../test/testType.model.js';

// Import app AFTER models
import app from '../../../app.js';

jest.setTimeout(30000);

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
}

function uniqueCode(prefix = 'TT') {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`.toUpperCase();
}

describe('Booking Module Integration Tests', () => {
  let member;
  let lab;
  let testType;
  let jwtToken;
  const createdBookingIds = [];

  beforeAll(async () => {
    await connectDB();

    // Create minimal fixture data
    lab = await Lab.create({
      name: `Test Lab ${Date.now()}`,
      district: 'Colombo',
      province: 'Western',
      operationalStatus: 'OPEN',
      isActive: true,
    });

    testType = await TestType.create({
      name: `TestType ${Date.now()}`,
      code: uniqueCode('BT'),
      category: 'Other',
      description: 'Integration test test type',
      entryMethod: 'upload',
      discriminatorType: 'AutomatedReport',
      isActive: true,
    });

    member = await Member.create({
      full_name: `Booking Test Patient ${Date.now()}`,
      email: uniqueEmail('booking'),
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      password_hash: 'test-password-hash',
      gender: 'OTHER',
      address: 'Test Address',
      gn_division: 'Test GN',
      district: 'Colombo',
      date_of_birth: new Date('2000-01-01'),
    });

    jwtToken = jwt.sign(
      {
        id: member._id.toString(),
        profileId: member._id,
        userType: 'patient',
        fullName: member.full_name,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' },
    );
  }, 30000);

  afterAll(async () => {
    try {
      await Booking.deleteMany({ _id: { $in: createdBookingIds } });
      if (member?._id) await Member.deleteOne({ _id: member._id });
      if (lab?._id) await Lab.deleteOne({ _id: lab._id });
      if (testType?._id) await TestType.deleteOne({ _id: testType._id });

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 30000);

  describe('POST /api/bookings', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return validation error for missing bookingDate', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingType: 'PRE_BOOKED',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should create a WALK_IN booking and assign queueNumber=1', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingDate: '2026-04-08',
          timeSlot: '09:00 - 10:00',
          bookingType: 'WALK_IN',
          priorityLevel: 'NORMAL',
          paymentMethod: 'CASH',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('booking');
      expect(res.body.booking.queueNumber).toBe(1);

      createdBookingIds.push(res.body.booking._id);
    });

    it('should create another WALK_IN booking on same day and assign queueNumber=2', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingDate: '2026-04-08',
          timeSlot: '10:00 - 11:00',
          bookingType: 'WALK_IN',
          priorityLevel: 'NORMAL',
          paymentMethod: 'CASH',
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.queueNumber).toBe(2);

      createdBookingIds.push(res.body.booking._id);
    });

    it('should create a PRE_BOOKED booking with queueNumber=null', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingDate: '2026-04-08',
          timeSlot: '11:00 - 12:00',
          bookingType: 'PRE_BOOKED',
          priorityLevel: 'NORMAL',
          paymentMethod: 'ONLINE',
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.queueNumber ?? null).toBeNull();

      createdBookingIds.push(res.body.booking._id);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should assign queueNumber when marking PRE_BOOKED booking as COMPLETED', async () => {
      // Create a fresh PRE_BOOKED booking
      const created = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingDate: '2026-04-08',
          timeSlot: '12:00 - 13:00',
          bookingType: 'PRE_BOOKED',
          priorityLevel: 'NORMAL',
          paymentMethod: 'ONLINE',
        });

      expect(created.status).toBe(201);
      const bookingId = created.body.booking._id;
      createdBookingIds.push(bookingId);

      const updated = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ status: 'COMPLETED' });

      expect(updated.status).toBe(200);
      expect(updated.body).toHaveProperty('booking');
      expect(updated.body.booking.status).toBe('COMPLETED');
      expect(updated.body.booking.queueNumber).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/bookings/:id (soft delete)', () => {
    it('should soft delete a booking and hide it from patient list', async () => {
      const created = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          patientProfileId: member._id.toString(),
          healthCenterId: lab._id.toString(),
          diagnosticTestId: testType._id.toString(),
          bookingDate: '2026-04-08',
          bookingType: 'PRE_BOOKED',
          priorityLevel: 'NORMAL',
          paymentMethod: 'CASH',
        });

      expect(created.status).toBe(201);
      const bookingId = created.body.booking._id;
      createdBookingIds.push(bookingId);

      const del = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(del.status).toBe(200);

      const inDb = await Booking.findById(bookingId).lean();
      expect(inDb).toBeTruthy();
      expect(inDb.isActive).toBe(false);

      const list = await request(app)
        .get(`/api/bookings/patient/${member._id.toString()}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(list.status).toBe(200);
      const bookingsPayload = list.body?.bookings;
      const bookings = Array.isArray(bookingsPayload)
        ? bookingsPayload
        : Array.isArray(bookingsPayload?.bookings)
          ? bookingsPayload.bookings
          : [];

      expect(bookings.some((b) => b?._id === bookingId)).toBe(false);
    });
  });
});
