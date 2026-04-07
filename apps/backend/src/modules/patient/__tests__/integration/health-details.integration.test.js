/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/health-details.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import HealthDetailsModel from '../../models/HealthDetails.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
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
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData } from '../testUtils.js';

describe('Health Details Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, healthDetailsId, jwtToken;

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
      email: `health${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1982-07-19',
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
      // Use comprehensive cleanup utility
      await cleanupTestData(
        { HealthDetails: HealthDetailsModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, EmergencyContact: EmergencyContactModel, Medication: MedicationModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
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

  describe('Health Details CRUD Operations', () => {
    it('should create health details', async () => {
      const response = await request(app)
        .post('/api/health-details')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          blood_group: 'O+',
          height_cm: 175,
          weight_kg: 75,
          bmi: 24.5,
          pregnancy_status: false,
          disability_status: false,
          smoking_status: 'non-smoker',
          alcohol_usage: 'yes',
          occupation: 'Engineer',
          chemical_exposure: 'no'
        });

      expect(response.status).toBe(201);
      expect(response.body.data?._id).toBeDefined();
      healthDetailsId = response.body.data?._id;
    });

    it('should list health details', async () => {
      const response = await request(app)
        .get('/api/health-details')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    });

    it('should get single health details', async () => {
      if (!healthDetailsId) return;

      const response = await request(app)
        .get(`/api/health-details/${healthDetailsId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update health details', async () => {
      if (!healthDetailsId) return;

      const response = await request(app)
        .put(`/api/health-details/${healthDetailsId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          weight_kg: 80,
          bmi: 26.1
        });

      expect(response.status).toBe(200);
    });

    it('should delete health details', async () => {
      if (!healthDetailsId) return;

      const response = await request(app)
        .delete(`/api/health-details/${healthDetailsId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

