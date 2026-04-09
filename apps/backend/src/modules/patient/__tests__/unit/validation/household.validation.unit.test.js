/**
 * Household Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateHouseholdCreate } from '../../../validations/householdValidation.js';

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

describe('Household Validation - Unit Tests', () => {
  describe('validateHouseholdCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          head_member_name: 'John Household',
          primary_contact_number: '0712345678',
          address: '123 Test Street',
          village_name: 'Test Village',
          gn_division: 'Test GN Division',
          district: 'Test District',
          province: 'Test Province',
          submitted_by: 'STAFF-001',
          water_source: 'Well',
          well_water_tested: 'yes',
          ckdu_exposure_area: 'no',
          dengue_risk: 'no',
          sanitation_type: 'Pit toilet',
          waste_disposal: 'Burn',
          pesticide_exposure: 'no',
          chronic_diseases: {
            diabetes: 'No',
            hypertension: 'No',
            kidney_disease: 'No',
            asthma: 'No',
            heart_disease: 'No',
            none: 'Yes'
          }
        }
      };

      const result = await runValidators(validateHouseholdCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          gn_division: 'Padukka' 
        } 
      };

      const result = await runValidators(validateHouseholdCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
