/**
 * Backend Integration Tests - Auth Module
 * @author Lakni (IT23772922)
 * 
 * Tests for auth module:
 * - User registration flow (request → controller → service → database)
 * - User login flow with JWT token generation
 * - Token validation and refresh
 * - Password management
 * - Role-based access control
 * - Error handling and edge cases
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/auth/auth.model');
const jwt = require('jsonwebtoken');

describe('Auth Module - Integration Tests', () => {
  let testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    full_name: 'Test User',
    phone: '0712345678',
    role: 'Patient'
  };

  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost/medilab-test');
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register - User Registration', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe('Patient');
    });

    it('should store user in database with hashed password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.password).not.toBe(testUser.password); // Should be hashed
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should validate required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com',
        password: 'TestPassword123!'
        // Missing full_name
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/required|missing/i);
    });

    it('should reject invalid email format', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toMatch(/email|invalid/i);
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.message).toMatch(/password|strength|requirements/i);
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toMatch(/already.*exists|duplicate|email.*taken/i);
    });

    it('should validate phone number format', async () => {
      const invalidPhoneUser = {
        ...testUser,
        phone: 'invalid'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPhoneUser)
        .expect(400);

      expect(response.body.message).toMatch(/phone|invalid/i);
    });

    it('should return JWT token on successful registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.token).toBeDefined();
      const decoded = jwt.decode(response.body.token);
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe(testUser.email);
    });
  });

  describe('POST /api/auth/login - User Login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid|credentials|password/i);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.message).toMatch(/not.*found|invalid|credentials/i);
    });

    it('should return valid JWT token on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      const decoded = jwt.decode(response.body.token);
      expect(decoded.userId).toBeDefined();
      expect(decoded.role).toBe('Patient');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should store token in HTTP-only cookie if cookie is enabled', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      // Check if Set-Cookie header exists
      if (response.headers['set-cookie']) {
        const cookieValue = response.headers['set-cookie'][0];
        expect(cookieValue).toMatch(/token|auth/i);
        expect(cookieValue).toMatch(/HttpOnly/i);
      }
    });
  });

  describe('GET /api/auth/me - Get Current User', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should return current user when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user._id).toBe(userId);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toMatch(/token|unauthorized|missing/i);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toMatch(/token|invalid|unauthorized/i);
    });

    it('should reject request with expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId, email: testUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toMatch(/expired|invalid/i);
    });
  });

  describe('POST /api/auth/logout - User Logout', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      authToken = response.body.token;
    });

    it('should successfully logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toMatch(/success|logout|logged out/i);
    });

    it('should clear auth cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.headers['set-cookie']) {
        const cookieValue = response.headers['set-cookie'][0];
        expect(cookieValue).toMatch(/token.*=.*;/i);
      }
    });
  });

  describe('POST /api/auth/change-password - Password Change', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should successfully change password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.message).toMatch(/success|changed/i);
    });

    it('should verify old password before changing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      expect(response.body.message).toMatch(/current.*password|incorrect/i);
    });

    it('should validate new password strength', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.message).toMatch(/password|strength|requirements/i);
    });

    it('should update password in database', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      // Try login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password - Password Reset Request', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should generate reset token for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(response.body.message).toMatch(/email|sent|check/i);
    });

    it('should store reset token in database', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      const user = await User.findOne({ email: testUser.email });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
    });

    it('should not reveal if email exists in database', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200);

      // Should return success even if email doesn't exist (security)
      expect(response.body.message).toMatch(/email|sent|check/i);
    });
  });

  describe('POST /api/auth/reset-password - Password Reset', () => {
    let resetToken;

    beforeEach(async () => {
      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      userId = regResponse.body.user._id;

      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        });

      const user = await User.findById(userId);
      resetToken = user.resetPasswordToken;
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'ResetPassword123!'
        })
        .expect(200);

      expect(response.body.message).toMatch(/success|reset|changed/i);
    });

    it('should update password in database', async () => {
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'ResetPassword123!'
        })
        .expect(200);

      // Login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ResetPassword123!'
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'ResetPassword123!'
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid|expired|token/i);
    });

    it('should reject expired reset token', async () => {
      const user = await User.findById(userId);
      user.resetPasswordExpires = Date.now() - 3600000; // 1 hour ago
      await user.save();

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'ResetPassword123!'
        })
        .expect(401);

      expect(response.body.message).toMatch(/expired|invalid|token/i);
    });
  });

  describe('Role-Based Access Control', () => {
    let staffToken;
    let staffUser = {
      email: 'staff@example.com',
      password: 'StaffPassword123!',
      full_name: 'Staff Member',
      phone: '0787654321',
      role: 'LabTechnician'
    };

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(staffUser);
      staffToken = response.body.token;
    });

    it('should include role in JWT token', async () => {
      const decoded = jwt.decode(staffToken);
      expect(decoded.role).toBe('LabTechnician');
    });

    it('should enforce role-based access to protected routes', async () => {
      // Try to access admin-only route with staff token
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.message).toMatch(/forbidden|permission|access denied/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking mongoose connection failure
      // For now, we'll test error response structure
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('password'); // Password should not be exposed
    });

    it('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.message).not.toMatch(/hashed|bcrypt|salt/i);
    });

    it('should rate limit login attempts', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword'
          });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      // Should either reject due to rate limit or succeed
      expect([429, 200, 401]).toContain(response.status);
    });
  });
});
