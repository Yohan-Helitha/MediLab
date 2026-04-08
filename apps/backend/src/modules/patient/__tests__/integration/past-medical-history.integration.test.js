/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/past-medical-history.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import PastMedicalHistoryModel from '../../models/PastMedicalHistory.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
import MedicationModel from '../../models/Medication.js';
import EmergencyContactModel from '../../models/EmergencyContact.js';
import FamilyMemberModel from '../../models/FamilyMember.js';
import FamilyRelationshipModel from '../../models/FamilyRelationship.js';
import VisitModel from '../../models/Visit.js';
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData } from '../testUtils.js';

describe('Past Medical History Integration Tests', () => {
  let memberId, historyId, jwtToken, memberObjectId, householdId, householdObjectId;
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
      console.error('❌ MongoDB connection failed after retries. Skipping past medical history tests.');
      skipTests = true;
      return;
    }
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use utility functions for unique ID generation
    householdId = generateUniqueHouseholdId();
    memberId = generateUniqueMemberId();

    try {
      const household = await HouseholdsModel.create({
        household_id: householdId,
        ...getUniqueHouseholdData()
      });

      householdObjectId = household._id;

      const member = await MembersModel.create({
        member_id: memberId,
        full_name: `TestUser${Date.now()}`,
        email: `pmh${Date.now()}@test.com`,
        contact_number: `071${Math.floor(Math.random() * 10000000)}`,
        household_id: household._id,
        nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
        date_of_birth: '1980-03-10',
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
    } catch (error) {
      console.error('Error creating test data:', error.message);
      skipTests = true;
    }
  }, 45000);

  afterAll(async () => {
    try {
      if (!skipTests) {
        // Use comprehensive cleanup utility
        await cleanupTestData(
          { PastMedicalHistory: PastMedicalHistoryModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
          { memberId, memberObjectId, householdId, householdObjectId }
        );
      }
      
      // Close database connection gracefully
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  }, 30000);

  describe('Past Medical History CRUD Operations', () => {
    it('should create past medical history record', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      const response = await request(app)
        .post('/api/past-medical-history')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          surgeries: true,
          surgery_location: ['Appendix removal'],
          hospital_admissions: 'Admitted for appendicitis surgery in 2018',
          serious_injuries: 'None',
          genetic_disorders: ['Hypertension'],
          blood_transfusion_history: false,
          tuberculosis_history: false
        });

      expect(response.status).toBe(201);
      expect(response.body.data?.surgeries).toBe(true);
      historyId = response.body.data?._id;
    });

    it('should list past medical history', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      const response = await request(app)
        .get('/api/past-medical-history')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data?.pastMedicalHistories)).toBe(true);
    });

    it('should get single history record', async () => {
      if (skipTests || !historyId) {
        console.log('Skipping: Database not available or no history');
        return;
      }

      const response = await request(app)
        .get(`/api/past-medical-history/${historyId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update history record', async () => {
      if (skipTests || !historyId) {
        console.log('Skipping: Database not available or no history');
        return;
      }

      const response = await request(app)
        .put(`/api/past-medical-history/${historyId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          tuberculosis_history: true,
          serious_injuries: 'Fractured left arm in 2020'
        });

      expect(response.status).toBe(200);
    });

    it('should delete history record', async () => {
      if (skipTests || !historyId) {
        console.log('Skipping: Database not available or no history');
        return;
      }

      const response = await request(app)
        .delete(`/api/past-medical-history/${historyId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

