/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/household.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import HouseholdsModel from '../../models/Household.js';
import MembersModel from '../../models/Member.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import EmergencyContactModel from '../../models/EmergencyContact.js';
import FamilyMemberModel from '../../models/FamilyMember.js';
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import VisitModel from '../../models/Visit.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, defaultMemberData } from '../testUtils.js';

describe('Household Module Integration Tests', () => {
  let householdId, householdObjectId;
  let memberId, memberObjectId;
  let jwtToken;

  beforeAll(async () => {
    // Ensure database connection is established
    await connectDB();
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a test member for authentication
    memberId = generateUniqueMemberId();
    const member = await MembersModel.create({
      member_id: memberId,
      full_name: `HouseholdTestUser${Date.now()}`,
      email: `household${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1987-11-22',
      ...defaultMemberData
    });

    memberObjectId = member._id;

    const payload = {
      id: memberId,
      systemId: member._id,
      profileId: member._id,
      userType: 'patient',
      fullName: member.full_name
    };

    jwtToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    );
  }, 30000);

  afterAll(async () => {
    try {
      // Use comprehensive cleanup utility
      await cleanupTestData(
        { Household: HouseholdsModel, Member: MembersModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
        { memberId, memberObjectId, householdId, householdObjectId }
      );
      
      // Close database connection gracefully
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 30000);

  describe('Household CRUD Operations', () => {
    it('should create household', async () => {
      const householdData = {
        household_id: `ANU-PADGNDIV-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`,
        head_member_name: `Head${Date.now()}`,
        submitted_by: `Submitter${Date.now()}`,
        primary_contact_number: '0712345678',
        address: `123 Household Street ${Date.now()}`,
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

      const response = await request(app)
        .post('/api/households')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(householdData);

      expect(response.status).toBe(201);
      expect(response.body.data?.gn_division).toBe('Padukka');
      householdId = response.body.data?._id;
    }, 10000);

    it('should list households', async () => {
      const response = await request(app)
        .get('/api/households')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    });

    it('should get single household', async () => {
      if (!householdId) return;

      const response = await request(app)
        .get(`/api/households/${householdId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update household', async () => {
      if (!householdId) return;

      const response = await request(app)
        .put(`/api/households/${householdId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          head_member_name: `UpdatedHead${Date.now()}`,
          submitted_by: `UpdatedSubmitter${Date.now()}`,
          primary_contact_number: '0719876543',
          address: `Updated Household Street ${Date.now()}`,
          village_name: 'Updated Village',
          gn_division: 'Padukka',
          district: 'Colombo',
          province: 'Western',
          water_source: 'PIPE_BORNE',
          well_water_tested: 'YES',
          ckdu_exposure_area: 'NO',
          sanitation_type: 'INDOOR',
          waste_disposal: 'MUNICIPAL',
          dengue_risk: true,
          pesticide_exposure: true,
          chronic_diseases: {
            diabetes: true,
            hypertension: false,
            kidney_disease: false,
            asthma: false,
            heart_disease: false,
            none: false
          }
        });

      expect(response.status).toBe(200);
    });

    it('should delete household', async () => {
      if (!householdId) return;

      const response = await request(app)
        .delete(`/api/households/${householdId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

