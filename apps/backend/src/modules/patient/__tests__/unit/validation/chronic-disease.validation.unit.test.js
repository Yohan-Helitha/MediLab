/**
 * Chronic Disease Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateChronicDiseaseCreate } from '../../../validations/chronicDiseaseValidation.js';

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

describe('Chronic Disease Validation - Unit Tests', () => {
  describe('validateChronicDiseaseCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          disease_name: 'Diabetes Type 2',
          diagnosis_year: 2015,
          status: 'Active',
          treatment_plan: 'Insulin and diet control'
        }
      };

      const result = await runValidators(validateChronicDiseaseCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          disease_name: 'Diabetes' 
        } 
      };

      const result = await runValidators(validateChronicDiseaseCreate, invalidData);
      expect(result.isValid).toBe(false);
    });

    it('should validate member_id format', async () => {
      const invalidData = {
        body: {
          member_id: 'invalid-format',
          disease_name: 'Diabetes Type 2',
          diagnosis_year: 2015,
          status: 'Active'
        }
      };

      const result = await runValidators(validateChronicDiseaseCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
