/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/emergency-contact.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import EmergencyContactModel from '../../models/EmergencyContact.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import FamilyMemberModel from '../../models/FamilyMember.js';
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import VisitModel from '../../models/Visit.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData } from '../testUtils.js';

describe('Emergency Contact Module Integration Tests', () => {
  let memberId, memberObjectId, householdId, householdObjectId, contactId, jwtToken;

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
      email: `emergency${Date.now()}@test.com`,
      contact_number: `071${Math.floor(Math.random() * 10000000)}`,
      household_id: household._id,
      nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
      date_of_birth: '1991-08-12',
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
        { EmergencyContact: EmergencyContactModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
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

  describe('Emergency Contact CRUD Operations', () => {
    it('should create emergency contact', async () => {
      const response = await request(app)
        .post('/api/emergency-contacts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          full_name: 'John Doe',
          relationship: 'Spouse',
          primary_phone: '0712345678',
          secondary_phone: '0719876543',
          contact_priority: 'PRIMARY',
          available_24_7: true,
          address: '456 Emergency Street',
          gn_division: 'Padukka'
        });

      expect(response.status).toBe(201);
      expect(response.body._id || response.body.data?._id).toBeDefined();
      contactId = response.body._id || response.body.data?._id;
    });

    it('should list emergency contacts', async () => {
      const response = await request(app)
        .get('/api/emergency-contacts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(response.body.data || Array.isArray(response.body)).toBeTruthy();
    });

    it('should get single emergency contact', async () => {
      if (!contactId) return;

      const response = await request(app)
        .get(`/api/emergency-contacts/${contactId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update emergency contact', async () => {
      if (!contactId) return;

      const response = await request(app)
        .put(`/api/emergency-contacts/${contactId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          primary_phone: '0712222222'
        });

      expect(response.status).toBe(200);
    });

    it('should delete emergency contact', async () => {
      if (!contactId) return;

      const response = await request(app)
        .delete(`/api/emergency-contacts/${contactId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

