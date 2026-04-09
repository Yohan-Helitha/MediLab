/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/family-relationship.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import EmergencyContactModel from '../../models/EmergencyContact.js';
import FamilyMemberModel from '../../models/FamilyMember.js';
import VisitModel from '../../models/Visit.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData, closeDatabase } from '../testUtils.js';

describe('Family Relationship Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, familyMember1Id, familyMember2Id, relationshipId, jwtToken;
  let isConnected = false;
  let skipTests = false;

  beforeAll(async () => {
    const connectionAttempts = 3;
    let connectError;
    
    // Attempt to connect to database with retries
    for (let attempt = 1; attempt <= connectionAttempts; attempt++) {
      try {
        await connectDB();
        isConnected = true;
        console.log('✅ Database connected successfully');
        break;
      } catch (error) {
        connectError = error;
        console.warn(`Database connection attempt ${attempt}/${connectionAttempts} failed:`, error.message);
        if (attempt < connectionAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // If connection failed, skip these tests
    if (!isConnected) {
      console.error('❌ MongoDB connection failed after retries. Skipping family relationship tests.');
      skipTests = true;
      return;
    }
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

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
      email: `relation${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1984-02-14',
      ...defaultMemberData
    });

    memberObjectId = member._id;

    // Create two family members for the relationship test
    const familyMember1 = await FamilyMemberModel.create({
      household_id: householdId,
      full_name: 'John Doe',
      gender: 'male',
      date_of_birth: '1984-02-14'
    });

    const familyMember2 = await FamilyMemberModel.create({
      household_id: householdId,
      full_name: 'Jane Doe',
      gender: 'female',
      date_of_birth: '1986-05-20'
    });

    familyMember1Id = familyMember1.family_member_id;
    familyMember2Id = familyMember2.family_member_id;

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
  }, 45000);

  afterAll(async () => {
    try {
      if (!skipTests) {
        // Use comprehensive cleanup utility
        await cleanupTestData(
          { FamilyRelationship: FamilyRelationshipModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, Visit: VisitModel, Referral: ReferralModel },
          { memberId, memberObjectId, householdId, householdObjectId }
        );
      }
      
      // Close database connection gracefully using utility
      await closeDatabase();
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 45000);

  describe('Family Relationship CRUD Operations', () => {
    it('should create family relationship', async () => {
      const response = await request(app)
        .post('/api/family-relationships')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          family_member1_id: familyMember1Id,
          family_member2_id: familyMember2Id,
          relationship_type: 'spouse'
        });

      expect(response.status).toBe(201);
      expect(response.body._id || response.body.data?._id).toBeDefined();
      relationshipId = response.body._id || response.body.data?._id;
    }, 30000);

    it('should list family relationships', async () => {
      const response = await request(app)
        .get('/api/family-relationships')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    }, 30000);

    it('should get single family relationship', async () => {
      if (!relationshipId) return;

      const response = await request(app)
        .get(`/api/family-relationships/${relationshipId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update family relationship', async () => {
      if (!relationshipId) return;

      const response = await request(app)
        .put(`/api/family-relationships/${relationshipId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          relationship_type: 'husband'
        });

      expect(response.status).toBe(200);
    }, 30000);

    it('should delete family relationship', async () => {
      if (!relationshipId) return;

      const response = await request(app)
        .delete(`/api/family-relationships/${relationshipId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

