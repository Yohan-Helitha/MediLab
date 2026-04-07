/**
 * Past Medical History Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validatePastMedicalHistoryCreate } from '../../../validations/pastMedicalHistoryValidation.js';

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

describe('Past Medical History Validation - Unit Tests', () => {
  describe('validatePastMedicalHistoryCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          condition: 'Diabetes',
          status: 'resolved'
        }
      };

      const result = await runValidators(validatePastMedicalHistoryCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          condition: 'Diabetes' 
        } 
      };

      const result = await runValidators(validatePastMedicalHistoryCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate member_id format', async () => {
      const invalidData = {
        body: {
          member_id: 'invalid-format',
          condition: 'Diabetes',
          status: 'resolved'
        }
      };

      const result = await runValidators(validatePastMedicalHistoryCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
