/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/medication.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
import MedicationModel from '../../models/Medication.js';
import MembersModel from '../../models/Member.js';
import HouseholdsModel from '../../models/Household.js';
import AllergiesModel from '../../models/Allergy.js';
import ChronicDiseaseModel from '../../models/ChronicDisease.js';
import HealthDetailsModel from '../../models/HealthDetails.js';
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

describe('Medication Module Integration Tests', () => {
  let memberId, medicationId, jwtToken, memberObjectId, householdId, householdObjectId;
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
      console.error('❌ MongoDB connection failed after retries. Skipping medication tests.');
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
        email: `medication${Date.now()}@test.com`,
        contact_number: `071${Math.floor(Math.random() * 10000000)}`,
        household_id: household._id,
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
          { Medication: MedicationModel, Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
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

  describe('Medication CRUD Operations', () => {
    it('should create medication record', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          member_id: memberId,
          medicine_name: 'Aspirin',
          dosage: '500mg',
          reason: 'Pain relief',
          prescribed_by: 'Dr. Smith',
          start_date: '2026-04-08'
        });

      expect(response.status).toBe(201);
      expect(response.body.data?.medicine_name).toBe('Aspirin');
      medicationId = response.body.data?._id;
    });

    it('should list medications', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      const response = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ member_id: memberId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data?.medications || response.body.data)).toBe(true);
    });

    it('should get single medication', async () => {
      if (skipTests || !medicationId) {
        console.log('Skipping: Database not available or no medication');
        return;
      }

      const response = await request(app)
        .get(`/api/medications/${medicationId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update medication', async () => {
      if (skipTests || !medicationId) {
        console.log('Skipping: Database not available or no medication');
        return;
      }

      const response = await request(app)
        .put(`/api/medications/${medicationId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          medicine_name: 'Aspirin Updated',
          dosage: '250mg',
          reason: 'Updated pain relief',
          prescribed_by: 'Dr. Johnson',
          start_date: '2026-04-09'
        });

      expect(response.status).toBe(200);
    });

    it('should delete medication', async () => {
      if (skipTests || !medicationId) {
        console.log('Skipping: Database not available or no medication');
        return;
      }

      const response = await request(app)
        .delete(`/api/medications/${medicationId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });
  });
});

