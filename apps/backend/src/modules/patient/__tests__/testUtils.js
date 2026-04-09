/**
 * Integration test utilities for member and household creation with proper cleanup
 */
import mongoose from 'mongoose';

/**
 * Generate a unique member ID using timestamp
 * Ensures no collisions even with parallel test runs
 * @returns {string} Unique member ID in format MEM-ANU-PADGNDIV-YYYY-XXXXX
 */
export function generateUniqueMemberId() {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  // Combine timestamp with a random number to avoid collisions
  const randomPart = Math.floor(Math.random() * 10000);
  const sequence = String((timestamp + randomPart) % 100000).padStart(5, '0');
  return `MEM-ANU-PADGNDIV-${year}-${sequence}`;
}

/**
 * Generate a unique household ID using timestamp
 * @returns {string} Unique household ID in format ANU-PADGNDIV-XXXXX
 */
export function generateUniqueHouseholdId() {
  const timestamp = Date.now();
  // Combine timestamp with a random number
  const randomPart = Math.floor(Math.random() * 10000);
  const sequence = String((timestamp + randomPart) % 100000).padStart(5, '0');
  return `ANU-PADGNDIV-${sequence}`;
}

/**
 * Clean up all test data for a member and related records
 * @param {Object} models - Object containing Mongoose models
 * @param {string} memberId - The member_id to clean up
 * @param {string} memberObjectId - The ObjectId of the member
 * @param {string} householdId - The household_id to clean up
 * @param {string} householdObjectId - The ObjectId of the household
 */
export async function cleanupTestData(models, { memberId, memberObjectId, householdId, householdObjectId }) {
  const { Member, Household, Visit, Allergy, ChronicDisease, HealthDetails, Medication, PastMedicalHistory, EmergencyContact, FamilyMember, FamilyRelationship, Referral } = models;

  try {
    // Delete all related records for this member
    if (memberId) {
      await Promise.all([
        Visit?.deleteMany({ member_id: memberId }),
        Allergy?.deleteMany({ member_id: memberId }),
        ChronicDisease?.deleteMany({ member_id: memberId }),
        HealthDetails?.deleteMany({ member_id: memberId }),
        Medication?.deleteMany({ member_id: memberId }),
        PastMedicalHistory?.deleteMany({ member_id: memberId }),
        EmergencyContact?.deleteMany({ member_id: memberId }),
        Referral?.deleteMany({ member_id: memberId })
      ]);
    }

    // Delete family relationships where this member is involved
    if (memberId) {
      const familyMembers = await FamilyMember?.find({ member_id: memberId });
      const familyMemberIds = familyMembers?.map(fm => fm._id) || [];
      
      if (familyMemberIds.length > 0) {
        await FamilyRelationship?.deleteMany({
          $or: [
            { family_member1_id: { $in: familyMemberIds } },
            { family_member2_id: { $in: familyMemberIds } }
          ]
        });
      }
    }

    // Delete family members in this household
    if (householdId) {
      await FamilyMember?.deleteMany({ household_id: householdId });
    }

    // Delete the member itself
    if (memberObjectId) {
      await Member?.deleteOne({ _id: memberObjectId });
    } else if (memberId) {
      await Member?.deleteOne({ member_id: memberId });
    }

    // Delete the household itself
    if (householdObjectId) {
      await Household?.deleteOne({ _id: householdObjectId });
    } else if (householdId) {
      await Household?.deleteOne({ household_id: householdId });
    }
  } catch (error) {
    console.warn('Test data cleanup error:', error.message);
  }
}

/**
 * Close database connection gracefully and handle edge cases
 */
export async function closeDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      // Wait a small amount after closing for Mongoose internal cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.warn('Error closing database connection:', error.message);
  }
}

/**
 * Simple delay for stabilizing async operations
 * @param {number} ms - Milliseconds to wait
 */
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get unique household data for test creation
 * @returns {Object} Household data with unique address
 */
export function getUniqueHouseholdData() {
  const timestamp = Date.now();
  return {
    head_member_name: 'Test Head',
    submitted_by: 'Test Submitter',
    primary_contact_number: '0712345678',
    address: `Test Street ${timestamp}`,
    village_name: 'Test Village',
    gn_division: 'Padukka',
    district: 'Colombo',
    province: 'Western',
    water_source: 'PIPE_BORNE',
    well_water_tested: 'YES',
    ckdu_exposure_area: 'NO',
    sanitation_type: 'INDOOR',
    waste_disposal: 'MUNICIPAL',
    dengue_risk: false,
    pesticide_exposure: false,
    chronic_diseases: {
      diabetes: false,
      hypertension: false,
      kidney_disease: false,
      asthma: false,
      heart_disease: false,
      none: true
    }
  };
}

/**
 * Default member data for test creation
 */
export const defaultMemberData = {
  address: '123 Test Street',
  password_hash: 'TestPassword@123',
  gender: 'male',
  gn_division: 'Padukka',
  district: 'Colombo',
  date_of_birth: '1990-01-15',
  disability_status: false,
  pregnancy_status: false
};

export default {
  generateUniqueMemberId,
  generateUniqueHouseholdId,
  cleanupTestData,
  getUniqueHouseholdData,
  defaultMemberData,
  closeDatabase,
  wait
};
