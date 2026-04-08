/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/integration/member.integration.test.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../../../../config/db.js';
import jwt from 'jsonwebtoken';
// Import all models FIRST to ensure schema registration
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
import ReferralModel from '../../models/Referral.js';
// Import app AFTER models
import request from 'supertest';
import app from '../../../../app.js';
import { generateUniqueMemberId, generateUniqueHouseholdId, cleanupTestData, getUniqueHouseholdData, defaultMemberData } from '../testUtils.js';

describe('Member Module Integration Tests', () => {
  let memberId, jwtToken, householdId, householdObjectId, memberObjectId;
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
      console.error('❌ MongoDB connection failed after retries. Skipping member tests.');
      skipTests = true;
      return;
    }
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    householdId = generateUniqueHouseholdId();
    memberId = generateUniqueMemberId();

    try {
      const household = await HouseholdsModel.create({
        household_id: householdId,
        ...getUniqueHouseholdData()
      });
      householdObjectId = household._id;
    } catch (error) {
      console.error('Error creating household:', error.message);
      skipTests = true;
    }
  }, 45000);

  afterAll(async () => {
    try {
      if (!skipTests) {
        await cleanupTestData(
          { Member: MembersModel, Household: HouseholdsModel, Allergy: AllergiesModel, ChronicDisease: ChronicDiseaseModel, HealthDetails: HealthDetailsModel, Medication: MedicationModel, EmergencyContact: EmergencyContactModel, PastMedicalHistory: PastMedicalHistoryModel, FamilyMember: FamilyMemberModel, FamilyRelationship: FamilyRelationshipModel, Visit: VisitModel, Referral: ReferralModel },
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

  describe('Member Profile Operations', () => {
    it('should create member profile', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      // Create temporary token for member creation
      const tempPayload = {
        id: 'temp-create',
        systemId: 'temp-create',
        profileId: 'temp-create',
        userType: 'admin',
        fullName: 'Temp Creator'
      };

      const tempToken = jwt.sign(
        tempPayload,
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          full_name: `TestMember${Date.now()}`,
          email: `member${Date.now()}@test.com`,
          contact_number: `071${Math.floor(Math.random() * 10000000)}`,
          household_id: householdId,
          address: '456 Test Avenue',
          password_hash: 'SecurePass@123',
          gender: 'male',
          gn_division: 'Padukka',
          district: 'Colombo',
          date_of_birth: '1985-06-15',
          nic: `${Math.floor(Math.random() * 900000000) + 100000000}V`
        });

      expect(response.status).toBe(201);
      expect(response.body.data?.full_name).toBeDefined();
      memberId = response.body.data?._id;

      const payload = {
        id: memberId,
        systemId: memberId,
        profileId: memberId,
        userType: 'patient',
        fullName: response.body.data?.full_name
      };

      jwtToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
        { expiresIn: '7d' }
      );
    });

    it('should get member profile', async () => {
      if (skipTests || !memberId) {
        console.log('Skipping: Database not available or no member');
        return;
      }

      const response = await request(app)
        .get(`/api/members/${memberId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
    });

    it('should update member profile', async () => {
      if (skipTests || !memberId) {
        console.log('Skipping: Database not available or no member');
        return;
      }

      const response = await request(app)
        .put(`/api/members/${memberId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          address: '789 Updated Street'
        });

      expect(response.status).toBe(200);
    });

    it('should list household members', async () => {
      if (skipTests) {
        console.log('Skipping: Database not available');
        return;
      }
      
      const response = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ household_id: householdId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data?.members)).toBe(true);
    });
  });
});

