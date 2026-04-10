import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateMedicalInfo } from '../../../validations/consultationValidation.js';

/**
 * Helper function to run validators
 */
async function runValidators(validators, data) {
  const req = {
    body: data.body || {}
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

describe('Consultation Validation - Unit Tests', () => {
  describe('validateMedicalInfo', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          condition: 'I have a severe headache',
          specialization: 'neurosurgery'
        }
      };

      const result = await runValidators(validateMedicalInfo, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject empty condition', async () => {
      const invalidData = {
        body: {
          condition: '',
          specialization: 'neurosurgery'
        }
      };

      const result = await runValidators(validateMedicalInfo, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should reject condition that is too short', async () => {
      const invalidData = {
        body: {
          condition: 'H',
          specialization: 'neurosurgery'
        }
      };

      const result = await runValidators(validateMedicalInfo, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should accept optional specialization', async () => {
      const validData = {
        body: {
          condition: 'Persistent cough and fever'
        }
      };

      const result = await runValidators(validateMedicalInfo, validData);
      expect(result.isValid).toBe(true);
    });
  });
});
