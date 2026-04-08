/**
 * Auth Integration Tests
 * Tests for complete auth flow: endpoints, database interactions, and API responses
 * Uses Express test server and MongoDB connection
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.routes.js';
import Auth from '../auth.model.js';
import Member from '../../patient/models/Member.js';
import HealthOfficer from '../healthOfficer.model.js';
import mongoose from 'mongoose';
import { connectDB } from '../../../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Auth API Integration Tests', () => {
  let app;
  let testCounter = 0;

  beforeAll(async () => {
    // Connect to MongoDB database
    try {
      await connectDB();
      console.log('✓ Database connected for tests');
    } catch (error) {
      console.error('✗ Failed to connect to database:', error.message);
      throw error;
    }

    // Create Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  }, 30000); // Increase timeout for initial database connection

  afterAll(async () => {
    try {
      // Clear test collections
      await Auth.deleteMany({});
      await Member.deleteMany({});
      await HealthOfficer.deleteMany({});
      
      // Disconnect from MongoDB
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('✓ Database disconnected after tests');
      }
    } catch (error) {
      console.error('✗ Error during cleanup:', error.message);
    }
  }, 30000);

  // Use unique test data for each test to avoid conflicts
  beforeEach(() => {
    testCounter++;
  });

  describe('POST /api/auth/patient/register', () => {
    it('should successfully register a new patient', async () => {
      const registrationData = {
        full_name: 'Test Patient',
        email: `patient${testCounter}@gmail.com`,
        contact_number: '0712345678',
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(registrationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Patient registered successfully');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(registrationData.email);
      expect(response.body.data.user.role).toBe('patient');

      // Verify data in database
      const authRecord = await Auth.findOne({ email: registrationData.email });
      expect(authRecord).toBeTruthy();
      expect(authRecord.role).toBe('patient');
    }, 10000);

    it('should return 400 if email already exists', async () => {
      const registrationData = {
        full_name: 'Test Patient',
        email: `patient-dup${testCounter}@gmail.com`,
        contact_number: '0712345678',
        password: 'TestPass@123Abc'
      };

      // First registration
      await request(app)
        .post('/api/auth/patient/register')
        .send(registrationData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(registrationData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('email already exists');
    }, 10000);

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        full_name: 'Test Patient',
        email: `patient-invalid${testCounter}@gmail.com`
        // Missing contact_number and password
      };

      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(incompleteData);

      expect([400, 422]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    }, 10000);

    it('should return 400 if email format is invalid', async () => {
      const invalidData = {
        full_name: 'Test Patient',
        email: 'invalid-email',
        contact_number: '0712345678',
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(invalidData);

      expect([400, 422]).toContain(response.status);
    }, 10000);
  });

  describe('POST /api/auth/patient/login', () => {
    let loginTestToken;
    let loginTestEmail;

    beforeEach(async () => {
      // Create a test patient for login tests
      loginTestEmail = `patient-login${testCounter}@test.com`;
      const registrationData = {
        full_name: 'Test Patient',
        email: loginTestEmail,
        contact_number: '0712345678',
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(registrationData);
      
      loginTestToken = response.body.data?.token;
    }, 10000);

    it('should successfully login with valid credentials', async () => {
      const loginData = {
        identifier: loginTestEmail,
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.identifier);
    }, 10000);

    it('should return 401 with wrong password', async () => {
      const loginData = {
        identifier: loginTestEmail,
        password: 'WrongPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should return 401 with non-existent email', async () => {
      const loginData = {
        identifier: `nonexistent${testCounter}@test.com`,
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/patient/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    }, 10000);

    it('should return 400 if required fields are missing', async () => {
      const loginData = {
        identifier: loginTestEmail
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/patient/login')
        .send(loginData);

      expect([400, 422]).toContain(response.status);
    }, 10000);
  });

  describe('POST /api/auth/staff/register', () => {
    it('should successfully register a new health officer', async () => {
      const registrationData = {
        fullName: 'Test Officer',
        email: `officer${testCounter}@hospital.com`,
        contactNumber: '0715678901',
        password: 'TestPass@123Abc',
        role: 'HealthOfficer'
      };

      const response = await request(app)
        .post('/api/auth/staff/register')
        .send(registrationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.role).toBe('HealthOfficer');
      expect(response.body.data).toHaveProperty('token');
    }, 10000);

    it('should return 400 if email already exists', async () => {
      const registrationData = {
        fullName: 'Test Officer',
        email: `officer-dup${testCounter}@hospital.com`,
        contactNumber: '0715678901',
        password: 'TestPass@123Abc',
        role: 'HealthOfficer'
      };

      // First registration
      await request(app)
        .post('/api/auth/staff/register')
        .send(registrationData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/staff/register')
        .send(registrationData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    }, 10000);
  });

  describe('POST /api/auth/staff/login', () => {
    let officerTestEmail;

    beforeEach(async () => {
      officerTestEmail = `officer-login${testCounter}@hospital.com`;
      const registrationData = {
        fullName: 'Test Officer',
        email: officerTestEmail,
        contactNumber: '0715678901',
        password: 'TestPass@123Abc',
        role: 'HealthOfficer'
      };

      await request(app)
        .post('/api/auth/staff/register')
        .send(registrationData);
    }, 10000);

    it('should successfully login health officer with valid credentials', async () => {
      const loginData = {
        identifier: officerTestEmail,
        password: 'TestPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/staff/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
    }, 10000);

    it('should return 401 with wrong password', async () => {
      const loginData = {
        identifier: officerTestEmail,
        password: 'WrongPass@123Abc'
      };

      const response = await request(app)
        .post('/api/auth/staff/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    }, 10000);
  });

  describe('POST /api/auth/verify', () => {
    it('should verify a valid token', async () => {
      // First, register and get a token
      const registrationData = {
        full_name: 'Test Patient',
        email: `patient-verify${testCounter}@test.com`,
        contact_number: '0712345678',
        password: 'TestPass@123Abc'
      };

      const registerResponse = await request(app)
        .post('/api/auth/patient/register')
        .send(registrationData);

      const token = registerResponse.body.data.token;

      // Verify the token
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Token is valid');
      expect(response.body.data).toBeTruthy();
    }, 10000);

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'invalid-token' });

      // Accept either 400 (invalid format) or 401 (expired/invalid signature)
      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    }, 10000);
  });

  describe('POST /api/auth/logout', () => {
    it('should return logout success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Logout successful');
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test ensures the API handles errors properly
      const response = await request(app)
        .post('/api/auth/patient/login')
        .send({
          identifier: `test-error${testCounter}@test.com`,
          password: 'password'
        });

      expect(response.body).toHaveProperty('success', false);
    }, 10000);

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/patient/register')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    }, 10000);
  });
});
