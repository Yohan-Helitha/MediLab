/**
 * Member Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateMemberCreate } from '../../../validations/memberValidation.js';

// Helper function to run validators
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

describe('Member Validation - Unit Tests', () => {
  describe('validateMemberCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: '0712345678',
          nic: '951234567V',
          address: '123 Test Street',
          password_hash: 'TestPassword@123',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };

      const result = await runValidators(validateMemberCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          full_name: 'John',
          gender: 'Male'
        } 
      };

      const result = await runValidators(validateMemberCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate NIC format', async () => {
      const invalidData = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: '0712345678',
          nic: 'invalid-nic',
          address: '123 Test Street',
          password_hash: 'TestPassword@123',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };

      const result = await runValidators(validateMemberCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate contact number format', async () => {
      const invalidData = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: 'invalid-phone',
          nic: '951234567V',
          address: '123 Test Street',
          password_hash: 'TestPassword@123',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };

      const result = await runValidators(validateMemberCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
