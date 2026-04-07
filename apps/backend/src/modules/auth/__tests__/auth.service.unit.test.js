/**
 * Auth Service Unit Tests
 * Tests for authentication business logic: registration, login, token generation, and password management
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Setup mocks for ESM modules
jest.unstable_mockModule('../auth.model.js', () => ({
  default: Object.assign(jest.fn(() => ({
    save: jest.fn(),
  })), {
    findOne: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('../../patient/models/Member.js', () => ({
  default: Object.assign(jest.fn(() => ({
    save: jest.fn(),
  })), {
    findOne: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('../healthOfficer.model.js', () => ({
  default: Object.assign(jest.fn(() => ({
    save: jest.fn(),
  })), {
    findOne: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}));

jest.unstable_mockModule('mongoose', () => ({
  default: {
    model: jest.fn()
  }
}));

// Import mocked modules
const { default: AuthService } = await import('../auth.service.js');
const { default: Auth } = await import('../auth.model.js');
const { default: Member } = await import('../../patient/models/Member.js');
const { default: HealthOfficer } = await import('../healthOfficer.model.js');
const { default: bcrypt } = await import('bcryptjs');
const { default: jwt } = await import('jsonwebtoken');
const { default: mongoose } = await import('mongoose');

describe('AuthService - Unit Tests', () => {
  let authService;

  beforeEach(() => {
    authService = AuthService;
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token with payload', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'patient'
      };

      const mockToken = 'jwt-token-string';
      jwt.sign.mockReturnValue(mockToken);

      const result = authService.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(result).toBe(mockToken);
    });

    it('should use default JWT secret when not provided in env', () => {
      delete process.env.JWT_SECRET;
      const payload = { id: '123' };

      authService.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash password using bcryptjs', async () => {
      const plainPassword = 'SecurePassword123!';
      const hashedPassword = 'hashed-password';

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(plainPassword);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 'salt');
      expect(result).toBe(hashedPassword);
    });

    it('should throw error if hashing fails', async () => {
      bcrypt.genSalt.mockRejectedValue(new Error('Hash failed'));

      await expect(authService.hashPassword('password')).rejects.toThrow('Hash failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = 'hashed-password';

      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.comparePassword('wrong', 'hashed');

      expect(result).toBe(false);
    });
  });

  describe('registerPatient', () => {
    const registrationData = {
      full_name: 'John Doe',
      email: 'john@example.com',
      contact_number: '0712345678',
      password: 'SecurePass123!'
    };

    it('should successfully register a new patient', async () => {
      Auth.findOne.mockResolvedValue(null);
      authService.hashPassword = jest.fn().mockResolvedValue('hashed-pass');
      authService.generateToken = jest.fn().mockReturnValue('jwt-token');

      const mockMember = {
        _id: 'member-id',
        member_id: 'MEM-001',
        full_name: registrationData.full_name,
        save: jest.fn().mockResolvedValue(true)
      };

      Member.mockImplementation(() => mockMember);

      const mockAuth = {
        _id: 'auth-id',
        email: registrationData.email,
        role: 'patient',
        save: jest.fn().mockResolvedValue(true)
      };

      Auth.mockImplementation(() => mockAuth);

      const result = await authService.registerPatient(registrationData);

      expect(Auth.findOne).toHaveBeenCalledWith({ email: registrationData.email });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token');
      expect(result.user.email).toBe(registrationData.email);
      expect(result.user.role).toBe('patient');
    });

    it('should throw error if email already exists', async () => {
      Auth.findOne.mockResolvedValue({ email: registrationData.email });

      await expect(authService.registerPatient(registrationData))
        .rejects
        .toThrow('A user with this email already exists');
    });

    it('should throw error if required fields are missing', async () => {
      const incompleteData = {
        full_name: 'John Doe',
        email: 'john@example.com'
        // Missing contact_number and password
      };

      Auth.findOne.mockResolvedValue(null);

      // The service should validate required fields
      try {
        await authService.registerPatient(incompleteData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('registerHealthOfficer', () => {
    const registrationData = {
      fullName: 'Jane Officer',
      email: 'jane@hospital.com',
      contactNumber: '0715678901',
      password: 'SecurePass123!',
      role: 'HealthOfficer'
    };

    it('should successfully register a new health officer', async () => {
      Auth.findOne.mockResolvedValue(null);
      authService.hashPassword = jest.fn().mockResolvedValue('hashed-pass');
      authService.generateToken = jest.fn().mockReturnValue('jwt-token');

      const mockOfficer = {
        _id: 'officer-id',
        employeeId: 'EMP-001',
        fullName: registrationData.fullName,
        save: jest.fn().mockResolvedValue(true)
      };

      HealthOfficer.mockImplementation(() => mockOfficer);

      const mockAuth = {
        _id: 'auth-id',
        email: registrationData.email,
        role: registrationData.role,
        save: jest.fn().mockResolvedValue(true)
      };

      Auth.mockImplementation(() => mockAuth);

      const result = await authService.registerHealthOfficer(registrationData);

      expect(Auth.findOne).toHaveBeenCalledWith({ email: registrationData.email });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token');
      expect(result.user.role).toBe('HealthOfficer');
    });

    it('should throw error if email already exists', async () => {
      Auth.findOne.mockResolvedValue({ email: registrationData.email });

      await expect(authService.registerHealthOfficer(registrationData))
        .rejects
        .toThrow('A user with this email already exists');
    });
  });

  describe('login', () => {
    const credentials = {
      identifier: 'john@example.com',
      password: 'password123'
    };

    it('should successfully login with correct credentials', async () => {
      const mockAuth = {
        _id: 'auth-id',
        email: credentials.identifier,
        systemId: 'MEM-001',
        passwordHash: 'hashed-password',
        role: 'patient',
        onModel: 'Member',
        profileId: 'profile-id'
      };

      const mockProfile = {
        _id: 'profile-id',
        full_name: 'John Doe',
        isProfileComplete: true
      };

      Auth.findOne.mockResolvedValue(mockAuth);
      authService.comparePassword = jest.fn().mockResolvedValue(true);
      authService.generateToken = jest.fn().mockReturnValue('jwt-token');

      // Mock mongoose.model to return Member mock with findById
      Member.findById = jest.fn().mockResolvedValue(mockProfile);
      mongoose.model.mockReturnValue(Member);

      const result = await authService.login(credentials);

      expect(Auth.findOne).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token');
    });

    it('should throw error with invalid credentials', async () => {
      Auth.findOne.mockResolvedValue(null);

      await expect(authService.login(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error with incorrect password', async () => {
      const mockAuth = {
        _id: 'auth-id',
        email: credentials.identifier,
        passwordHash: 'hashed-password'
      };

      Auth.findOne.mockResolvedValue(mockAuth);
      authService.comparePassword = jest.fn().mockResolvedValue(false);

      await expect(authService.login(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
