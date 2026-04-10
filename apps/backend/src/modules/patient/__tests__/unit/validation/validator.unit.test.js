/**
 * Validator Unit Tests for Patient Module
 * Tests validation rules for all patient sub-modules
 */

import { body, validationResult } from 'express-validator';
import {
  validateAllergyCreate,
  validateAllergyUpdate,
  validateAllergyId
} from '../../../validations/allergyValidation.js';
import {
  validateChronicDiseaseCreate,
  validateChronicDiseaseUpdate,
  validateChronicDiseaseId
} from '../../../validations/chronicDiseaseValidation.js';
import {
  validateEmergencyContactCreate,
  validateEmergencyContactUpdate,
  validateEmergencyContactId
} from '../../../validations/emergencyContactValidation.js';
import {
  validateFamilyMemberCreate,
  validateFamilyMemberUpdate,
  validateFamilyMemberId
} from '../../../validations/familyMemberValidation.js';
import {
  validateFamilyRelationshipCreate,
  validateFamilyRelationshipUpdate,
  validateFamilyRelationshipId
} from '../../../validations/familyRelationshipValidation.js';
import {
  validateHealthDetailsCreate,
  validateHealthDetailsUpdate,
  validateHealthDetailsId
} from '../../../validations/healthDetailsValidation.js';
import {
  validateHouseholdCreate,
  validateHouseholdUpdate,
  validateHouseholdId
} from '../../../validations/householdValidation.js';
import {
  validateMedicationCreate,
  validateMedicationUpdate,
  validateMedicationId
} from '../../../validations/medicationValidation.js';
import {
  validatePastMedicalHistoryCreate,
  validatePastMedicalHistoryUpdate,
  validatePastMedicalHistoryId
} from '../../../validations/pastMedicalHistoryValidation.js';
import {
  validateReferralCreate,
  validateReferralUpdate,
  validateReferralId
} from '../../../validations/referralValidation.js';
import {
  validateVisitCreate,
  validateVisitUpdate,
  validateVisitId
} from '../../../validations/visitValidation.js';
import {
  validateMemberCreate,
  validateMemberUpdate,
  validateMemberId
} from '../../../validations/memberValidation.js';

/**
 * Helper function to run validators and extract errors
 */
async function runValidators(validators, data) {
  // Create mock request and response objects
  const req = {
    body: data.body || {},
    params: data.params || {}
  };
  
  // Run all validators
  for (const validator of validators) {
    await validator.run(req);
  }
  
  // Get validation errors
  const errors = validationResult(req);
  return {
    isValid: errors.isEmpty(),
    errors: errors.array()
  };
}

describe('Allergy Validation Tests', () => {
  describe('validateAllergyCreate', () => {
    it('should pass valid allergy creation data', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe',
          since_year: 2020
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing required fields', async () => {
      const data = {
        body: {
          allergy_type: 'Food'
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid member_id format', async () => {
      const data = {
        body: {
          member_id: 'INVALID-ID',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe'
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'member_id')).toBe(true);
    });

    it('should fail with invalid severity', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'InvalidSeverity'
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'severity')).toBe(true);
    });

    it('should accept valid severity values', async () => {
      const severities = ['Mild', 'Moderate', 'Severe', 'Critical'];
      
      for (const severity of severities) {
        const data = {
          body: {
            member_id: 'MEM-ANU-PADGNDIV-2026-00001',
            allergy_type: 'Food',
            allergen_name: 'Peanuts',
            reaction_type: 'Anaphylaxis',
            severity
          }
        };
        
        const result = await runValidators(validateAllergyCreate, data);
        expect(result.isValid).toBe(true);
      }
    });

    it('should allow special characters in allergy_type', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Drug-Related / Chemical',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe'
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should reject allergy_type with special invalid characters', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food@123',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe'
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with future since_year', async () => {
      const futureYear = new Date().getFullYear() + 1;
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          allergy_type: 'Food',
          allergen_name: 'Peanuts',
          reaction_type: 'Anaphylaxis',
          severity: 'Severe',
          since_year: futureYear
        }
      };
      
      const result = await runValidators(validateAllergyCreate, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateAllergyUpdate', () => {
    it('should pass valid allergy update data', async () => {
      const data = {
        params: { id: '507f1f77bcf86cd799439011' },
        body: {
          severity: 'Moderate'
        }
      };
      
      const result = await runValidators(validateAllergyUpdate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid MongoDB ID', async () => {
      const data = {
        params: { id: 'invalid-id' },
        body: { severity: 'Moderate' }
      };
      
      const result = await runValidators(validateAllergyUpdate, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path === 'id')).toBe(true);
    });

    it('should allow partial updates', async () => {
      const data = {
        params: { id: '507f1f77bcf86cd799439011' },
        body: {
          allergen_name: 'Updated Allergen'
        }
      };
      
      const result = await runValidators(validateAllergyUpdate, data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAllergyId', () => {
    it('should pass valid MongoDB ID', async () => {
      const data = {
        params: { id: '507f1f77bcf86cd799439011' }
      };
      
      const result = await runValidators(validateAllergyId, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid MongoDB ID', async () => {
      const data = {
        params: { id: 'not-a-valid-id' }
      };
      
      const result = await runValidators(validateAllergyId, data);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Chronic Disease Validation Tests', () => {
  describe('validateChronicDiseaseCreate', () => {
    it('should pass valid chronic disease data', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          disease_name: 'Diabetes Type 2',
          diagnosis_year: 2015,
          status: 'Active',
          treatment_plan: 'Insulin and diet control'
        }
      };
      
      const result = await runValidators(validateChronicDiseaseCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing required fields', async () => {
      const data = {
        body: {
          disease_name: 'Diabetes Type 2'
        }
      };
      
      const result = await runValidators(validateChronicDiseaseCreate, data);
      expect(result.isValid).toBe(false);
    });

    it('should validate status values', async () => {
      const validStatuses = ['Active', 'Inactive', 'In Remission'];
      
      for (const status of validStatuses) {
        const data = {
          body: {
            member_id: 'MEM-ANU-PADGNDIV-2026-00001',
            disease_name: 'Diabetes Type 2',
            diagnosis_year: 2015,
            status,
            treatment_plan: 'Insulin and diet control'
          }
        };
        
        const result = await runValidators(validateChronicDiseaseCreate, data);
        expect(result.isValid).toBe(true);
      }
    });
  });
});

describe('Emergency Contact Validation Tests', () => {
  describe('validateEmergencyContactCreate', () => {
    it('should pass valid emergency contact data', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          full_name: 'John Doe',
          relationship: 'Spouse',
          primary_phone: '0712345678',
          contact_priority: 'PRIMARY'
        }
      };
      
      const result = await runValidators(validateEmergencyContactCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid primary_phone', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          full_name: 'John Doe',
          relationship: 'Spouse',
          primary_phone: 'invalid'
        }
      };
      
      const result = await runValidators(validateEmergencyContactCreate, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const data = {
        body: {
          full_name: 'John Doe'
        }
      };
      
      const result = await runValidators(validateEmergencyContactCreate, data);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Family Member Validation Tests', () => {
  describe('validateFamilyMemberCreate', () => {
    it('should pass valid family member data', async () => {
      const data = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'Jane Doe',
          date_of_birth: '1995-05-15',
          gender: 'Female',
          nic: '951234567V'
        }
      };
      
      const result = await runValidators(validateFamilyMemberCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should validate gender values', async () => {
      const validGenders = ['Male', 'Female', 'male', 'female'];
      
      for (const gender of validGenders) {
        const data = {
          body: {
            household_id: 'ANU-PADGNDIV-00001',
            full_name: 'Jane Doe',
            date_of_birth: '1995-05-15',
            gender,
            nic: '951234567V'
          }
        };
        
        const result = await runValidators(validateFamilyMemberCreate, data);
        expect(result.isValid).toBe(true);
      }
    });
  });
});

describe('Household Validation Tests', () => {
  describe('validateHouseholdCreate', () => {
    it('should pass valid household data', async () => {
      const data = {
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
      
      const result = await runValidators(validateHouseholdCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid household data', async () => {
      const data = {
        body: {
          head_member_name: 'John Household',
          primary_contact_number: 'invalid',
          address: '123 Test Street'
        }
      };
      
      const result = await runValidators(validateHouseholdCreate, data);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Medication Validation Tests', () => {
  describe('validateMedicationCreate', () => {
    it('should pass valid medication data', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          medicine_name: 'Aspirin',
          dosage: '500mg',
          reason: 'Headache',
          prescribed_by: 'Dr. Smith',
          start_date: '2026-04-07'
        }
      };
      
      const result = await runValidators(validateMedicationCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with missing required fields', async () => {
      const data = {
        body: {
          medicine_name: 'Aspirin'
        }
      };
      
      const result = await runValidators(validateMedicationCreate, data);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Visit Validation Tests', () => {
  describe('validateVisitCreate', () => {
    it('should pass valid visit data', async () => {
      const data = {
        body: {
          member_id: 'MEM-ANU-PADGNDIV-2026-00001',
          household_id: 'ANU-PADGNDIV-00001',
          visit_date: '2024-01-15',
          visit_type: 'Check-up',
          reason_for_visit: 'Fever',
          created_by_staff_id: 'HO-2024-001'
        }
      };
      
      const result = await runValidators(validateVisitCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should validate visit_type values', async () => {
      const validTypes = ['Check-up', 'Follow-up', 'Emergency'];
      
      for (const visitType of validTypes) {
        const data = {
          body: {
            member_id: 'MEM-ANU-PADGNDIV-2026-00001',
            household_id: 'ANU-PADGNDIV-00001',
            visit_date: '2024-01-15',
            visit_type: visitType,
            reason_for_visit: 'Fever',
            created_by_staff_id: 'HO-2024-001'
          }
        };
        
        const result = await runValidators(validateVisitCreate, data);
        expect(result.isValid).toBe(true);
      }
    });
  });
});

describe('Member Validation Tests', () => {
  describe('validateMemberCreate', () => {
    it('should pass valid member data', async () => {
      const data = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: '0712345678',
          nic: '951234567V',
          address: '123 Test Street',
          password_hash: 'TestPassword@123',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };
      
      const result = await runValidators(validateMemberCreate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid contact number', async () => {
      const data = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: 'invalid',
          nic: '951234567V',
          address: '123 Test Street',
          password_hash: 'TestPassword@123',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };
      
      const result = await runValidators(validateMemberCreate, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with weak password', async () => {
      const data = {
        body: {
          household_id: 'ANU-PADGNDIV-00001',
          full_name: 'John Doe',
          contact_number: '0712345678',
          nic: '951234567V',
          address: '123 Test Street',
          password_hash: 'weak',
          gn_division: 'Test GN Division',
          district: 'Test District',
          date_of_birth: '1995-01-01',
          gender: 'Male'
        }
      };
      
      const result = await runValidators(validateMemberCreate, data);
      expect(result.isValid).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const data = {
        body: {
          full_name: 'John Doe',
          gender: 'Male'
        }
      };
      
      const result = await runValidators(validateMemberCreate, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMemberUpdate', () => {
    it('should pass valid partial member update', async () => {
      const data = {
        params: { id: '507f1f77bcf86cd799439011' },
        body: {
          full_name: 'Updated Name'
        }
      };
      
      const result = await runValidators(validateMemberUpdate, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid member ID', async () => {
      const data = {
        params: { id: 'invalid-id' },
        body: { full_name: 'Updated Name' }
      };
      
      const result = await runValidators(validateMemberUpdate, data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMemberId', () => {
    it('should pass valid member ID', async () => {
      const data = {
        params: { id: '507f1f77bcf86cd799439011' }
      };
      
      const result = await runValidators(validateMemberId, data);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid member ID format', async () => {
      const data = {
        params: { id: 'invalid-id' }
      };
      
      const result = await runValidators(validateMemberId, data);
      expect(result.isValid).toBe(false);
    });
  });
});
