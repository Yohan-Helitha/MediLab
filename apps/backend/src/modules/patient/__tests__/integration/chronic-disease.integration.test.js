/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/chronic-disease.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
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

describe('Chronic Disease Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, diseaseId, jwtToken;

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
      email: `chronic${Date.now()}@test.com`,
        contact_number: `071${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1975-05-15',
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
        // Use comprehensive cleanup utility
        await cleanupTestData(
          { ChronicDisease: ChronicDiseaseModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
          { memberId, memberObjectId, householdId, householdObjectId }
        );
      }
      
      // Close database connection gracefully using utility
      await closeDatabase();
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 45000);

  describe('Chronic Disease CRUD Operations', () => {
    it('should create chronic disease record', async () => {
      const response = await request(app)
        .post('/api/chronic-diseases')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          disease_name: 'Hypertension',
          since_year: 2010,
          currently_on_medication: true
        });

      expect(response.status).toBe(201);
      expect(response.body._id || response.body.data?._id).toBeDefined();
      diseaseId = response.body._id || response.body.data?._id;
    });

    it('should list chronic diseases', async () => {
      const response = await request(app)
        .get('/api/chronic-diseases')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    });

    it('should get single chronic disease', async () => {
      if (!diseaseId) return;

      const response = await request(app)
        .get(`/api/chronic-diseases/${diseaseId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update chronic disease', async () => {
      if (!diseaseId) return;

      const response = await request(app)
        .put(`/api/chronic-diseases/${diseaseId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currently_on_medication: false
        });

      expect(response.status).toBe(200);
    });

    it('should delete chronic disease', async () => {
      if (!diseaseId) return;

      const response = await request(app)
        .delete(`/api/chronic-diseases/${diseaseId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

