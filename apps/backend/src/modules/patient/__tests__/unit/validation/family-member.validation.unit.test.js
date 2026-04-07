/**
 * Family Member Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateFamilyMemberCreate } from '../../../validations/familyMemberValidation.js';

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

describe('Family Member Validation - Unit Tests', () => {
  describe('validateFamilyMemberCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'Jane Doe',
          date_of_birth: '1995-05-15',
          gender: 'Female',
          nic: '951234567V'
        }
      };

      const result = await runValidators(validateFamilyMemberCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          full_name: 'Jane Doe',
          gender: 'Female'
        } 
      };

      const result = await runValidators(validateFamilyMemberCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate date of birth', async () => {
      const invalidData = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'Jane Doe',
          date_of_birth: 'invalid-date',
          gender: 'Female'
        }
      };

      const result = await runValidators(validateFamilyMemberCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
