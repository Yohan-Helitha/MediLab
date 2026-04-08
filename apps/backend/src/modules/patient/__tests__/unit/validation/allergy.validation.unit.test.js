/**
 * Allergy Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateAllergyCreate } from '../../../validations/allergyValidation.js';

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

describe('Allergy Validation - Unit Tests', () => {
  describe('validateAllergyCreate', () => {
    it('should validate correct allergy data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe'
        }
      };

      const result = await runValidators(validateAllergyCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        body: {
          allergen_name: 'Peanuts'
        }
      };

      const result = await runValidators(validateAllergyCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate severity levels', async () => {
      const invalidData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Invalid',
          severity: 'Invalid'
        }
      };

      const result = await runValidators(validateAllergyCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
