/**
 * Emergency Contact Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateEmergencyContactCreate } from '../../../validations/emergencyContactValidation.js';

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

describe('Emergency Contact Validation - Unit Tests', () => {
  describe('validateEmergencyContactCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          full_name: 'John Doe',
          relationship: 'Spouse',
          primary_phone: '0712345678',
          contact_priority: 'PRIMARY'
        }
      };

      const result = await runValidators(validateEmergencyContactCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          full_name: 'John' 
        } 
      };

      const result = await runValidators(validateEmergencyContactCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate phone number format', async () => {
      const invalidData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          full_name: 'John Doe',
          relationship: 'Spouse',
          primary_phone: 'invalid-phone',
          contact_priority: 'PRIMARY'
        }
      };

      const result = await runValidators(validateEmergencyContactCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
