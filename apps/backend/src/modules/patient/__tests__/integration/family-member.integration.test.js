/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/family-member.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import FamilyMemberModel from '../../models/FamilyMember.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import EmergencyContactModel from '../../models/EmergencyContact.js';
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import VisitModel from '../../models/Visit.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData, closeDatabase } from '../testUtils.js';

describe('Family Member Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, familyMemberId, jwtToken;

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
      email: `family${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1986-12-25',
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
  }, 60000);

  afterAll(async () => {
    try {
      if (!skipTests) {
        // Use comprehensive cleanup utility
        await cleanupTestData(
          { FamilyMember: FamilyMemberModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
          { memberId, memberObjectId, householdId, householdObjectId }
        );
      }
      
      // Close database connection gracefully using utility
      await closeDatabase();
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 60000);

  describe('Family Member CRUD Operations', () => {
    it('should create family member', async () => {
      const response = await request(app)
        .post('/api/family-members')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          household_id: householdId,
          full_name: 'Jane Doe',
          gender: 'female',
          date_of_birth: '1960-05-10',
          isHead: false,
          spouse_name: 'John Doe'
        });

      expect(response.status).toBe(201);
      expect(response.body._id || response.body.data?._id).toBeDefined();
      familyMemberId = response.body._id || response.body.data?._id;
    }, 30000);

    it('should list family members', async () => {
      const response = await request(app)
        .get('/api/family-members')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ household_id: householdId });

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    }, 30000);

    it('should get single family member', async () => {
      if (!familyMemberId) return;

      const response = await request(app)
        .get(`/api/family-members/${familyMemberId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update family member', async () => {
      if (!familyMemberId) return;

      const response = await request(app)
        .put(`/api/family-members/${familyMemberId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          spouse_name: 'John Smith'
        });

      expect(response.status).toBe(200);
    });

    it('should delete family member', async () => {
      if (!familyMemberId) return;

      const response = await request(app)
        .delete(`/api/family-members/${familyMemberId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

