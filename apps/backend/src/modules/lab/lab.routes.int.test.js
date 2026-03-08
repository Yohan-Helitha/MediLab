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

  // Create a temporary Staff health officer and JWT for integration tests
  const username = 'int_staff_user';
  const employeeId = 'EMP-INT-STAFF-001';
  const email = 'int.staff@example.com';
  const plainPassword = 'IntStaff@123';

  await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

  const passwordHash = await authService.hashPassword(plainPassword);

  const officer = await HealthOfficer.create({
    fullName: 'Integration Staff',
    gender: 'OTHER',
    employeeId,
    contactNumber: '0771234567',
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
  // Best-effort cleanup; ignore errors on close
  try {
    await mongoose.connection.close();
  } catch (e) {
    // no-op
  }
});

describe('Lab routes integration', () => {
  it('should reject lab creation without authentication', async () => {
    const res = await request(app).post('/api/labs').send({
      name: 'Unauth Lab',
      district: 'Colombo',
      province: 'Western',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow Staff to create a lab', async () => {
    const res = await request(app)
      .post('/api/labs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Integration Health Center',
        district: 'Colombo',
        province: 'Western',
        phoneNumber: '0112000000',
        email: 'integration.lab@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Integration Health Center');
  });
});
