/**
 * Medication Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateMedicationCreate } from '../../../validations/medicationValidation.js';

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

describe('Medication Validation - Unit Tests', () => {
  describe('validateMedicationCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          medicine_name: 'Aspirin',
          dosage: '500mg',
          reason: 'Headache',
          prescribed_by: 'Dr. Smith',
          start_date: '2026-04-07'
        }
      };

      const result = await runValidators(validateMedicationCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          medicine_name: 'Aspirin' 
        } 
      };

      const result = await runValidators(validateMedicationCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate member_id format', async () => {
      const invalidData = {
        body: {
          member_id: 'invalid',
          medicine_name: 'Aspirin',
          dosage: '500mg',
          reason: 'Headache',
          prescribed_by: 'Dr. Smith',
          start_date: '2026-04-07'
        }
      };

      const result = await runValidators(validateMedicationCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
