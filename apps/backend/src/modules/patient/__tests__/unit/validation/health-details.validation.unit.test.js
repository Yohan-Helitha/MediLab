/**
 * Health Details Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateHealthDetailsCreate } from '../../../validations/healthDetailsValidation.js';

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

describe('Health Details Validation - Unit Tests', () => {
  describe('validateHealthDetailsCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          blood_type: 'O+',
          height: 175,
          weight: 75
        }
      };

      const result = await runValidators(validateHealthDetailsCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should validate member_id format', async () => {
      const invalidData = {
        body: {
          member_id: 'invalid-format',
          height_cm: 175,
          weight_kg: 75
        }
      };

      const result = await runValidators(validateHealthDetailsCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
