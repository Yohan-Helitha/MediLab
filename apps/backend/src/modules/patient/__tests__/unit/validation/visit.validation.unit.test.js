/**
 * Visit Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateVisitCreate } from '../../../validations/visitValidation.js';

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

describe('Visit Validation - Unit Tests', () => {
  describe('validateVisitCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          household_id: 'ANU-PADGNDIV-00001',
          visit_date: '2024-01-15',
          visit_type: 'Check-up',
          reason_for_visit: 'Fever',
          created_by_staff_id: 'HO-2024-001'
        }
      };

      const result = await runValidators(validateVisitCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          visit_type: 'consultation' 
        } 
      };

      const result = await runValidators(validateVisitCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate date format', async () => {
      const invalidData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          household_id: 'ANU-PADGNDIV-00001',
          visit_date: 'invalid-date',
          visit_type: 'Check-up',
          reason_for_visit: 'Fever',
          created_by_staff_id: 'HO-2024-001'
        }
      };

      const result = await runValidators(validateVisitCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
