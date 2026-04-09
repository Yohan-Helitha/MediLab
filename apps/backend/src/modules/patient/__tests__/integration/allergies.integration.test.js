/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/allergies.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import AllergiesModel from '../../models/Allergy.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
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
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData, closeDatabase } from '../testUtils.js';

describe('Allergies Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, allergyId, jwtToken;

  beforeAll(async () => {
    // Ensure database connection is established
    await connectDB();
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use utility functions for unique ID generation
    householdId = generateUniqueHouseholdId();
    memberId = generateUniqueMemberId();

    const household = await HouseholdsModel.create({
      household_id: householdId,
      ...getUniqueHouseholdData()
    });

    householdObjectId = household._id;

    const member = await MembersModel.create({
      member_id: memberId,
      full_name: `TestUser${Date.now()}`,
      email: `allergies${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1993-04-22',
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

    jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', {
      expiresIn: '7d'
    });
  }, 30000);

  afterAll(async () => {
    try {
      if (!skipTests) {
        await cleanupTestData(
          { Allergy: AllergiesModel, Member: MembersModel, Household: HouseholdsModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
          { memberId, memberObjectId, householdId, householdObjectId }
        );
      }
      
      // Close database connection gracefully using utility
      await closeDatabase();
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 45000);

  describe('Allergies CRUD Operations', () => {
    it('should create allergy record', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          allergy_type: 'Medication',
          allergen_name: 'Penicillin',
          reaction_type: 'Rash',
          severity: 'Moderate',
          since_year: 2020
        });

      expect(response.status).toBe(201);
      expect(response.body._id || response.body.data?._id).toBeDefined();
      allergyId = response.body._id || response.body.data?._id;
    });

    it('should list allergies by member', async () => {
      const response = await request(app)
        .get('/api/allergies')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    });

    it('should get single allergy', async () => {
      if (!allergyId) return;

      const response = await request(app)
        .get(`/api/allergies/${allergyId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update allergy record', async () => {
      if (!allergyId) return;

      const response = await request(app)
        .put(`/api/allergies/${allergyId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          reaction_type: 'Severe rash'
        });

      expect(response.status).toBe(200);
    });

    it('should delete allergy record', async () => {
      if (!allergyId) return;

      const response = await request(app)
        .delete(`/api/allergies/${allergyId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

