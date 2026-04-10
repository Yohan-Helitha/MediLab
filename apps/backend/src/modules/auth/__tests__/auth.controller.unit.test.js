/**
 * Auth Controller Unit Tests
 * Tests for HTTP request handling: registration, login, profile, and token verification
 * 
 * Uses manual mocking via __mocks__ folder for ESM compatibility
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../auth.service.js', () => ({
  default: {
    registerPatient: jest.fn(),
    loginPatient: jest.fn(),
    registerHealthOfficer: jest.fn(),
    loginHealthOfficer: jest.fn(),
    getUserProfile: jest.fn(),
    verifyToken: jest.fn(),
    updateProfile: jest.fn(),
    logout: jest.fn(),
    login: jest.fn()
  }
}));

const { default: AuthController } = await import('../auth.controller.js');
const { default: authService } = await import('../auth.service.js');

describe('AuthController - Unit Tests', () => {
  let authController;
  let req;
  let res;

  beforeEach(() => {
    // authController is already an instance (singleton), don't instantiate
    authController = AuthController;
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {},
      params: {},
      user: {},
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('registerPatient', () => {
    it('should return 201 and success message on successful registration', async () => {
      req.body = {
        full_name: 'John Doe',
        email: 'john@example.com',
        contact_number: '0712345678',
        password: 'SecurePass123!'
      };

      const mockResult = {
        user: { email: req.body.email, role: 'patient' },
        token: 'jwt-token'
      };

      authService.registerPatient.mockResolvedValue(mockResult);

      await authController.registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Patient registered successfully',
        data: mockResult
      });
    });

    it('should return 400 on registration error', async () => {
      req.body = { email: 'invalid' };
      const errorMessage = 'Invalid registration data';

      authService.registerPatient.mockRejectedValue(new Error(errorMessage));

      await authController.registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('loginPatient', () => {
    it('should return 200 and user data on successful login', async () => {
      req.body = {
        identifier: 'john@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: { email: req.body.identifier, role: 'patient' },
        token: 'jwt-token'
      };

      authService.loginPatient.mockResolvedValue(mockResult);

      await authController.loginPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult
      });
    });

    it('should return 401 on login failure', async () => {
      req.body = { identifier: 'john@example.com', password: 'wrong' };
      const errorMessage = 'Invalid credentials';

      authService.loginPatient.mockRejectedValue(new Error(errorMessage));

      await authController.loginPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('registerHealthOfficer', () => {
    it('should return 201 on successful health officer registration', async () => {
      req.body = {
        fullName: 'Jane Officer',
        email: 'jane@hospital.com',
        contactNumber: '0715678901',
        password: 'SecurePass123!',
        role: 'HealthOfficer'
      };

      const mockResult = {
        user: { email: req.body.email, role: 'HealthOfficer' },
        token: 'jwt-token'
      };

      authService.registerHealthOfficer.mockResolvedValue(mockResult);

      await authController.registerHealthOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health officer registered successfully',
        data: mockResult
      });
    });

    it('should return 400 on registration error', async () => {
      req.body = { email: 'jane@hospital.com' };
      const errorMessage = 'Missing required fields';

      authService.registerHealthOfficer.mockRejectedValue(new Error(errorMessage));

      await authController.registerHealthOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('loginHealthOfficer', () => {
    it('should return 200 on successful health officer login', async () => {
      req.body = {
        identifier: 'jane@hospital.com',
        password: 'password123'
      };

      const mockResult = {
        user: { email: req.body.identifier, role: 'HealthOfficer' },
        token: 'jwt-token'
      };

      authService.loginHealthOfficer.mockResolvedValue(mockResult);

      await authController.loginHealthOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult
      });
    });

    it('should return 401 on invalid credentials', async () => {
      req.body = { identifier: 'jane@hospital.com', password: 'wrong' };
      const errorMessage = 'Invalid credentials';

      authService.loginHealthOfficer.mockRejectedValue(new Error(errorMessage));

      await authController.loginHealthOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('getProfile', () => {
    it('should return 200 and user profile on success', async () => {
      req.user = {
        id: 'auth-id',
        systemId: 'MEM-001',
        profileId: 'profile-id'
      };

      const mockProfile = {
        _id: 'profile-id',
        full_name: 'John Doe',
        email: 'john@example.com'
      };

      authService.getUserProfile.mockResolvedValue(mockProfile);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should return 404 if profile not found', async () => {
      req.user = { id: 'invalid-id' };
      const errorMessage = 'Profile not found';

      authService.getUserProfile.mockRejectedValue(new Error(errorMessage));

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('verifyToken', () => {
    it('should return 200 and decoded token on valid token', async () => {
      req.body = { token: 'valid-jwt-token' };
      const mockDecoded = {
        id: 'auth-id',
        email: 'john@example.com',
        role: 'patient'
      };

      authService.verifyToken.mockResolvedValue(mockDecoded);

      await authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token is valid',
        data: mockDecoded
      });
    });

    it('should return 401 on invalid token', async () => {
      req.body = { token: 'invalid-token' };
      const errorMessage = 'Invalid token';

      authService.verifyToken.mockRejectedValue(new Error(errorMessage));

      await authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('logout', () => {
    it('should return 200 with logout message', async () => {
      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
      });
    });
  });

  describe('updateProfile', () => {
    it('should return 200 on successful profile update', async () => {
      req.user = { id: 'auth-id' };
      req.body = {
        full_name: 'John Updated',
        phone: '0715555555'
      };

      const mockUpdatedProfile = {
        _id: 'profile-id',
        full_name: req.body.full_name,
        phone: req.body.phone
      };

      authService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: mockUpdatedProfile
      });
    });

    it('should return 400 on update error', async () => {
      req.user = { id: 'auth-id' };
      req.body = { email: 'invalid-email' };
      const errorMessage = 'Invalid email format';

      authService.updateProfile.mockRejectedValue(new Error(errorMessage));

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
});
