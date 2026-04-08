/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/visit.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import VisitModel from '../../models/Visit.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import EmergencyContactModel from '../../models/EmergencyContact.js';
import FamilyMemberModel from '../../models/FamilyMember.js';
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData } from '../testUtils.js';

describe('Visit Module Integration Tests', () => {
  let memberId, memberId_internal, visitId, jwtToken, householdId, householdObjectId, memberObjectId;

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
      email: `visit${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      ...defaultMemberData
    });

    memberObjectId = member._id;
    memberId_internal = member._id.toString();
    const payload = {
      id: memberId_internal,
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
        { Visit: VisitModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, PastMedicalHistory: PastMedicalHistoryModel, EmergencyContact: EmergencyContactModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Referral: ReferralModel },
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

  describe('Visit CRUD Operations', () => {
    it('should create visit record', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          household_id: householdId,
          visit_date: '2024-01-20',
          visit_type: 'OPD',
          reason_for_visit: 'Regular checkup',
          doctor_notes: 'Patient in good health',
          diagnosis: 'All healthy',
          follow_up_required: false,
          created_by_staff_id: 'HO-2026-001'
        });

      expect(response.status).toBe(201);
      expect(response.body.data?.reason_for_visit).toBe('Regular checkup');
      visitId = response.body.data?._id;
    });

    it('should list visits', async () => {
      const response = await request(app)
        .get('/api/visits')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data?.visits) || Array.isArray(response.body.data)).toBe(true);
    });

    it('should get single visit', async () => {
      if (!visitId) return;

      const response = await request(app)
        .get(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update visit record', async () => {
      if (!visitId) return;

      const response = await request(app)
        .put(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          diagnosis: 'Updated diagnosis',
          follow_up_required: true,
          follow_up_date: '2024-02-20'
        });

      expect(response.status).toBe(200);
    });

    it('should delete visit record', async () => {
      if (!visitId) return;

      const response = await request(app)
        .delete(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

