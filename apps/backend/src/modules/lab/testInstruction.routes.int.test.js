import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { connectDB } from '../../config/db.js';
import authService from '../auth/auth.service.js';
import HealthOfficer from '../auth/healthOfficer.model.js';
import TestType from '../test/testType.model.js';

let staffToken;
let staffId;
let testTypeId;
let instructionId;

// Allow more time for DB connection and seeding in integration tests
jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();

  const username = 'int_staff_user_instructions';
  const employeeId = 'EMP-INT-STAFF-004';
  const email = 'int.staff.instructions@example.com';
  const plainPassword = 'IntStaffInstructions@123';

  await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

  const passwordHash = await authService.hashPassword(plainPassword);

  const officer = await HealthOfficer.create({
    fullName: 'Integration Staff Instructions',
    gender: 'OTHER',
    employeeId,
    contactNumber: '0777000002',
    email,
    assignedArea: 'Integration Area',
    role: 'Staff',
    username,
    passwordHash,
    isActive: true,
  });

  staffId = officer._id.toString();

  staffToken = authService.generateToken({
    id: officer._id,
    employeeId: officer.employeeId,
    userType: 'healthOfficer',
    role: officer.role,
    fullName: officer.fullName,
  });

  const uniqueSuffix = Date.now();
  const code = `TIINT-${uniqueSuffix}`;
  const testType = await TestType.create({
    name: `Integration Instruction Test Type ${uniqueSuffix}`,
    code,
    category: 'Imaging',
    description: 'Integration test type for test-instruction routes',
    entryMethod: 'form',
    discriminatorType: 'ECG',
    isRoutineMonitoringRecommended: false,
    specificParameters: {},
    reportTemplate: 'templates/integration-instruction.html',
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

describe('Test-instruction routes integration', () => {
  it('should reject test-instruction creation without authentication', async () => {
    const res = await request(app).post('/api/test-instructions').send({
      diagnosticTestId: testTypeId,
      preTestInstructions: ['Do not eat for 8 hours'],
      postTestInstructions: ['Drink water'],
      languageCode: 'en',
      createdBy: staffId,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return validation errors when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/test-instructions')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        // missing diagnosticTestId and createdBy
        preTestInstructions: ['Some instruction'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('should allow Staff to create a test-instruction and fetch it by id and test type', async () => {
    const createRes = await request(app)
      .post('/api/test-instructions')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        diagnosticTestId: testTypeId,
        preTestInstructions: ['Fast for 8 hours before test'],
        postTestInstructions: ['You may eat normally after the test'],
        languageCode: 'en',
        createdBy: staffId,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.diagnosticTestId).toBe(testTypeId);
    expect(createRes.body.languageCode).toBe('en');

    instructionId = createRes.body._id;

    const byIdRes = await request(app).get(`/api/test-instructions/${instructionId}`);

    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body._id).toBe(instructionId);

    const byTestTypeRes = await request(app).get(`/api/test-instructions/test-type/${testTypeId}`);

    expect(byTestTypeRes.status).toBe(200);
    expect(byTestTypeRes.body.diagnosticTestId).toBe(testTypeId);
  });

  it('should fetch test-instructions by language for a given test type', async () => {
    const byLanguageRes = await request(app)
      .get(`/api/test-instructions/language/${testTypeId}`)
      .query({ language: 'en' });

    expect(byLanguageRes.status).toBe(200);
    expect(byLanguageRes.body.diagnosticTestId).toBe(testTypeId);
    expect(byLanguageRes.body.languageCode).toBe('en');
  });
});
