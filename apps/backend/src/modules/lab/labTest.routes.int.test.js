import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { connectDB } from '../../config/db.js';
import authService from '../auth/auth.service.js';
import HealthOfficer from '../auth/healthOfficer.model.js';
import Lab from './lab.model.js';
import TestType from '../test/testType.model.js';

let staffToken;
let labId;
let testTypeId;
let labTestId;

// Allow more time for DB connection and seeding in integration tests
jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();

  const username = 'int_staff_user_labtests';
  const employeeId = 'EMP-INT-STAFF-003';
  const email = 'int.staff.labtests@example.com';
  const plainPassword = 'IntStaffLabTests@123';

  await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

  const passwordHash = await authService.hashPassword(plainPassword);

  const officer = await HealthOfficer.create({
    fullName: 'Integration Staff LabTests',
    gender: 'OTHER',
    employeeId,
    contactNumber: '0777000001',
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

  // Create a lab and a test type to be used in lab-tests
  const lab = await Lab.create({
    name: 'Integration Lab For LabTests',
    district: 'Colombo',
    province: 'Western',
    phoneNumber: '0113000000',
    email: 'integration.labtests@example.com',
    createdBy: officer._id,
  });

  labId = lab._id.toString();

  const code = `LTINT-${Date.now()}`;
  const testType = await TestType.create({
    name: 'Integration Lab Test Type',
    code,
    category: 'Imaging',
    description: 'Integration lab test type for lab-tests routes',
    entryMethod: 'form',
    discriminatorType: 'ECG',
    isRoutineMonitoringRecommended: false,
    specificParameters: {},
    reportTemplate: 'templates/integration-labtest.html',
    isActive: true,
  });

  testTypeId = testType._id.toString();
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (e) {
    // no-op
  }
});

describe('Lab-test routes integration', () => {
  it('should reject lab-test creation without authentication', async () => {
    const res = await request(app).post('/api/lab-tests').send({
      labId,
      diagnosticTestId: testTypeId,
      price: 2500,
      estimatedResultTimeHours: 4,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return validation errors when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/lab-tests')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        labId,
        // missing diagnosticTestId, price, estimatedResultTimeHours
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('should allow Staff to create a lab-test and fetch it by lab and availability', async () => {
    const createRes = await request(app)
      .post('/api/lab-tests')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        labId,
        diagnosticTestId: testTypeId,
        price: 3000,
        estimatedResultTimeHours: 6,
        availabilityStatus: 'AVAILABLE',
        dailyCapacity: 20,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.labId).toBe(labId);
    expect(createRes.body.diagnosticTestId).toBe(testTypeId);

    labTestId = createRes.body._id;

    const byLabRes = await request(app).get(`/api/lab-tests/lab/${labId}`);

    expect(byLabRes.status).toBe(200);
    expect(Array.isArray(byLabRes.body)).toBe(true);
    expect(byLabRes.body.length).toBeGreaterThan(0);

    const availabilityRes = await request(app).get(`/api/lab-tests/${labTestId}/availability`);

    expect(availabilityRes.status).toBe(200);
    expect(availabilityRes.body._id).toBe(labTestId);
  });

  it('should allow Staff to update lab-test status and filter by status', async () => {
    const patchRes = await request(app)
      .patch(`/api/lab-tests/${labTestId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'UNAVAILABLE' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.availabilityStatus).toBe('UNAVAILABLE');

    const statusRes = await request(app).get('/api/lab-tests/status').query({ status: 'UNAVAILABLE' });

    expect(statusRes.status).toBe(200);
    expect(Array.isArray(statusRes.body)).toBe(true);
    expect(statusRes.body.some((t) => t._id === labTestId)).toBe(true);
  });
});
