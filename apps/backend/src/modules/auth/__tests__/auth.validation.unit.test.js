/**
 * Validator Unit Tests for Auth Module
 */

import { body, validationResult } from 'express-validator';
import {
  validatePatientRegister,
  validatePatientLogin,
  validateHealthOfficerRegister,
  validateHealthOfficerLogin,
  validateToken
} from '../auth.validation.js';

/**
 * Helper function to run validators and extract errors
 */
async function runValidators(validators, data) {
  const req = {
    body: data.body || {},
    params: data.params || {}
  };
  
  for (const validator of validators) {
    await validator.run(req);
  }
  
  const errors = validationResult(req);
  return {
    isValid: errors.isEmpty(),
    errors: errors.array()
  };
}

describe('Auth Validation Tests', () => {
  describe('validatePatientRegister', () => {
    it('should pass valid patient registration data', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing full_name', async () => {
      const data = {
        body: {
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'full_name')).toBe(true);
    });

    it('should fail with full_name too short', async () => {
      const data = {
        body: {
          full_name: 'A',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'full_name')).toBe(true);
    });

    it('should fail with full_name too long', async () => {
      const data = {
        body: {
          full_name: 'A'.repeat(151),
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'invalid-email',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'email')).toBe(true);
    });

    it('should fail with missing email', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'email')).toBe(true);
    });

    it('should fail with invalid contact number format', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: 'abc123',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'contact_number')).toBe(true);
    });

    it('should fail with contact number too short', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '123',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should accept various valid contact number formats', async () => {
      const validNumbers = [
        '0712345678',
        '+94712345678',
        '+94 71 234 5678',
        '(071) 234-5678'
      ];

      for (const number of validNumbers) {
        const data = {
          body: {
            full_name: 'John Doe',
            email: 'john@example.com',
            contact_number: number,
            password: 'TestPassword@123'
          }
        };

        const result = await runValidators(validatePatientRegister, data);
        expect(result.isValid).toBe(true);
      }
    });

    it('should fail with missing password', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'password')).toBe(true);
    });

    it('should fail with password too short', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'Pass@12'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with password missing uppercase', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'testpassword@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with password missing lowercase', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TESTPASSWORD@123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with password missing number', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with password missing special character', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword123'
        }
      };
      
      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid special characters in password', async () => {
      const validPasswords = [
        'TestPassword@123',
        'TestPassword$123',
        'TestPassword!123',
        'TestPassword%123',
        'TestPassword*123',
        'TestPassword?123',
        'TestPassword&123',
        'TestPassword#123'
      ];

      for (const password of validPasswords) {
        const data = {
          body: {
            full_name: 'John Doe',
            email: 'john@example.com',
            contact_number: '0712345678',
            password
          }
        };

        const result = await runValidators(validatePatientRegister, data);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('validatePatientLogin', () => {
    it('should pass valid patient login data', async () => {
      const data = {
        body: {
          identifier: '0712345678',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientLogin, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing identifier', async () => {
      const data = {
        body: {
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientLogin, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'identifier')).toBe(true);
    });

    it('should fail with missing password', async () => {
      const data = {
        body: {
          identifier: '0712345678'
        }
      };
      
      const result = await runValidators(validatePatientLogin, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'password')).toBe(true);
    });

    it('should accept member ID as identifier', async () => {
      const data = {
        body: {
          identifier: 'MEM-ANU-PADGNDIV-2026-00001',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientLogin, data);
      expect(result.isValid).toBe(true);
    });

    it('should accept NIC as identifier', async () => {
      const data = {
        body: {
          identifier: '951234567V',
          password: 'TestPassword@123'
        }
      };
      
      const result = await runValidators(validatePatientLogin, data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateHealthOfficerRegister', () => {
    it('should pass valid health officer registration', async () => {
      const data = {
        body: {
          fullName: 'Dr. Smith',
          email: 'smith@example.com',
          contactNumber: '0712345678',
          role: 'Doctor',
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerRegister, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid role', async () => {
      const data = {
        body: {
          fullName: 'Dr. Smith',
          email: 'smith@example.com',
          contactNumber: '0712345678',
          role: 'InvalidRole',
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'role')).toBe(true);
    });

    it('should accept all valid roles', async () => {
      const validRoles = ['MOH', 'PHI', 'Nurse', 'Admin', 'Lab_Technician', 'Doctor', 'HealthOfficer', 'Staff'];

      for (const role of validRoles) {
        const data = {
          body: {
            fullName: 'Dr. Smith',
            email: 'smith@example.com',
            contactNumber: '0712345678',
            role,
            password: 'DocPassword@123'
          }
        };

        const result = await runValidators(validateHealthOfficerRegister, data);
        expect(result.isValid).toBe(true);
      }
    });

    it('should fail with missing role', async () => {
      const data = {
        body: {
          fullName: 'Dr. Smith',
          email: 'smith@example.com',
          contactNumber: '0712345678',
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerRegister, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'role')).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const data = {
        body: {
          fullName: 'Dr. Smith',
          email: 'invalid-email',
          contactNumber: '0712345678',
          role: 'Doctor',
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerRegister, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateHealthOfficerLogin', () => {
    it('should pass valid health officer login', async () => {
      const data = {
        body: {
          identifier: 'smith@example.com',
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerLogin, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing identifier', async () => {
      const data = {
        body: {
          password: 'DocPassword@123'
        }
      };
      
      const result = await runValidators(validateHealthOfficerLogin, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with missing password', async () => {
      const data = {
        body: {
          identifier: 'smith@example.com'
        }
      };
      
      const result = await runValidators(validateHealthOfficerLogin, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should pass with valid JWT token format', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const data = {
        body: {
          token: validToken
        }
      };
      
      const result = await runValidators(validateToken, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing token', async () => {
      const data = {
        body: {}
      };
      
      const result = await runValidators(validateToken, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'token')).toBe(true);
    });

    it('should fail with invalid JWT format', async () => {
      const data = {
        body: {
          token: 'invalid-token'
        }
      };
      
      const result = await runValidators(validateToken, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'token')).toBe(true);
    });

    it('should fail with malformed JWT', async () => {
      const data = {
        body: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6'
        }
      };
      
      const result = await runValidators(validateToken, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Password Strength Requirements', () => {
    it('should validate all password requirements together', async () => {
      // Valid strong password
      const data = {
        body: {
          full_name: 'Test User',
          email: 'test@example.com',
          contact_number: '0712345678',
          password: 'ComplexPass@2024'
        }
      };

      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(true);
    });

    it('should handle edge case passwords', async () => {
      const edgeCasePasswords = [
        'Aa1@Bb2cCdDeEfFgGhHiIjJkKlLmMnNoOpPq', // Very long but valid
        'A1@bCdEfGhIjKlMnOpQrStUvWxYz' // All characters mixed
      ];

      for (const password of edgeCasePasswords) {
        const data = {
          body: {
            full_name: 'Test User',
            email: 'test@example.com',
            contact_number: '0712345678',
            password
          }
        };

        const result = await runValidators(validatePatientRegister, data);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Email Normalization', () => {
    it('should normalize email addresses', async () => {
      const data = {
        body: {
          full_name: 'Test User',
          email: 'Test@EXAMPLE.COM',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };

      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Trimming and Normalization', () => {
    it('should trim whitespace from string fields', async () => {
      const data = {
        body: {
          full_name: '  John Doe  ',
          email: 'john@example.com',
          contact_number: '0712345678',
          password: 'TestPassword@123'
        }
      };

      const result = await runValidators(validatePatientRegister, data);
      expect(result.isValid).toBe(true);
    });
  });
});
