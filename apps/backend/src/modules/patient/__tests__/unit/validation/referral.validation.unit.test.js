/**
 * Referral Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateReferralCreate } from '../../../validations/referralValidation.js';

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

describe('Referral Validation - Unit Tests', () => {
  describe('validateReferralCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          visit_id: 'VIS-ANU-2024-00001',
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          referred_to: 'District Hospital',
          referral_reason: 'Specialist consultation required',
          urgency_level: 'Routine'
        }
      };

      const result = await runValidators(validateReferralCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          referred_to: 'Cardiologist' 
        } 
      };

      const result = await runValidators(validateReferralCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate specialist field', async () => {
      const invalidData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          referred_to: '',
          reason: 'Heart check'
        }
      };

      const result = await runValidators(validateReferralCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
