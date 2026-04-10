/**
 * Family Relationship Module - Validation Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import { validateFamilyRelationshipCreate } from '../../../validations/familyRelationshipValidation.js';

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

describe('Family Relationship Validation - Unit Tests', () => {
  describe('validateFamilyRelationshipCreate', () => {
    it('should validate correct data', async () => {
      const validData = {
        body: {
          family_member1_id: 'FAM-ANU-PADGNDIV-00001',
          family_member2_id: 'FAM-ANU-PADGNDIV-00002',
          relationship_type: 'spouse'
        }
      };

      const result = await runValidators(validateFamilyRelationshipCreate, validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = { 
        body: { 
          relationship_type: 'Spouse' 
        } 
      };

      const result = await runValidators(validateFamilyRelationshipCreate, invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
