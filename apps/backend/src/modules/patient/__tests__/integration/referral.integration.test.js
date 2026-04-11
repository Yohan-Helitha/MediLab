/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/referral.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import ReferralModel from '../../models/Referral.js';
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
import VisitModel from '../../models/Visit.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData, closeDatabase } from '../testUtils.js';

describe('Referral Module Integration Tests', () => {
  let memberId, referralId, jwtToken, memberObjectId, householdId, householdObjectId, visitId;

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
      email: `referral${Date.now()}@test.com`,
        contact_number: `071${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      ...defaultMemberData,
      gn_division: 'Padukka',
      district: 'Colombo',
      date_of_birth: '1988-07-20'
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
        { Referral: ReferralModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel },
        { memberId, memberObjectId, householdId, householdObjectId }
      );
      
      // Close database connection gracefully using utility
      await closeDatabase();
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 45000);

  describe('Referral CRUD Operations', () => {
    it('should create referral', async () => {
      const currentYear = new Date().getFullYear();
      const visitId = `VIS-ANU-${currentYear}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;

      const response = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          visit_id: visitId,
          member_id: memberId,
          referred_to: 'Base Hospital',
          referral_reason: 'Annual heart checkup',
          urgency_level: 'Routine'
        });

      expect(response.status).toBe(201);
      expect(response.body.data?.referred_to).toBe('Base Hospital');
      referralId = response.body.data?._id;
    });

    it('should list referrals', async () => {
      const response = await request(app)
        .get('/api/referrals')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data?.referrals)).toBe(true);
    });

    it('should get single referral', async () => {
      if (!referralId) return;

      const response = await request(app)
        .get(`/api/referrals/${referralId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update referral status', async () => {
      if (!referralId) return;

      const response = await request(app)
        .put(`/api/referrals/${referralId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          referral_status: 'Completed'
        });

      expect(response.status).toBe(200);
    });

    it('should delete referral', async () => {
      if (!referralId) return;

      const response = await request(app)
        .delete(`/api/referrals/${referralId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

