import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { connectDB } from '../../config/db.js';
import authService from '../auth/auth.service.js';
import HealthOfficer from '../auth/healthOfficer.model.js';

let staffToken;

// Allow more time for DB connection and seeding in integration tests
jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();

  const username = 'int_staff_user_tests';
  const employeeId = 'EMP-INT-STAFF-002';
  const email = 'int.staff.tests@example.com';
  const plainPassword = 'IntStaffTests@123';

  await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

  const passwordHash = await authService.hashPassword(plainPassword);

  const officer = await HealthOfficer.create({
    fullName: 'Integration Staff Tests',
    gender: 'OTHER',
    employeeId,
    contactNumber: '0777654321',
    email,
    assignedArea: 'Integration Area',
    role: 'Staff',
    username,
    passwordHash,
    isActive: true,
  });

  staffToken = authService.generateToken({
    id: officer._id,
    employeeId: officer.employeeId,
    userType: 'healthOfficer',
    role: officer.role,
    fullName: officer.fullName,
  });
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (e) {
    // no-op
  }
});

describe('Test type routes integration', () => {
  it('should return 400 with validation errors when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/test-types')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Invalid Test',
        // missing code, category, etc.
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('should allow Staff to create a valid test type', async () => {
    const uniqueCode = `INT-${Date.now()}`;

    const res = await request(app)
      .post('/api/test-types')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Integration ECG Test',
        code: uniqueCode,
        category: 'Imaging',
        description: 'ECG integration test type',
        entryMethod: 'form',
        discriminatorType: 'ECG',
        price: 1500,
        resultTime: '2 hours',
        isRoutineMonitoringRecommended: false,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Integration ECG Test');
    expect(res.body.code).toBe(uniqueCode.toUpperCase());
  });
});
