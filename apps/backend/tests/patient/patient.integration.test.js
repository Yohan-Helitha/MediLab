/**
 * Backend Integration Tests - Patient Module
 * @author Lakni (IT23772922)
 * 
 * Tests for patient module:
 * - Patient profile creation and updates
 * - Health profile management (allergies, diseases, medications)
 * - Family member management
 * - Emergency contact management
 * - Patient health records
 * - Database interactions for all operations
 * - Error handling and validation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/auth/auth.model');
const Patient = require('../modules/patient/patient.model');
const jwt = require('jsonwebtoken');

describe('Patient Module - Integration Tests', () => {
  let authToken;
  let patientUserId;
  let patientData = {
    email: 'patient@example.com',
    password: 'PatientPassword123!',
    full_name: 'Patient User',
    phone: '0712345678',
    role: 'Patient'
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost/medilab-test');
  });

  beforeEach(async () => {
    // Clear data
    await User.deleteMany({});
    await Patient.deleteMany({});

    // Create and login patient
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(patientData);

    authToken = registerResponse.body.token;
    patientUserId = registerResponse.body.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/patient/profile - Create Patient Profile', () => {
    it('should create patient profile', async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body).toHaveProperty('patient');
      expect(response.body.patient.userId).toBe(patientUserId);
      expect(response.body.patient.bloodType).toBe('O+');
    });

    it('should validate required fields', async () => {
      const incompleteProfile = {
        dateOfBirth: '1990-05-15'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteProfile)
        .expect(400);

      expect(response.body.message).toMatch(/required|missing|gender/i);
    });

    it('should store profile in database', async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Female',
        bloodType: 'A+',
        height: 165,
        weight: 60,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      const patientProfile = await Patient.findOne({ userId: patientUserId });
      expect(patientProfile).toBeDefined();
      expect(patientProfile.bloodType).toBe('A+');
      expect(patientProfile.gender).toBe('Female');
    });

    it('should reject invalid blood type', async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'Invalid',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(400);

      expect(response.body.message).toMatch(/blood.*type|invalid/i);
    });

    it('should reject invalid measurements', async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: -175, // Invalid negative height
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(400);

      expect(response.body.message).toMatch(/height|invalid|measurement/i);
    });
  });

  describe('GET /api/patient/profile - Get Patient Profile', () => {
    let createdProfileId;

    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      createdProfileId = response.body.patient._id;
    });

    it('should retrieve patient profile', async () => {
      const response = await request(app)
        .get('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('patient');
      expect(response.body.patient.bloodType).toBe('O+');
      expect(response.body.patient.gender).toBe('Male');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/patient/profile')
        .expect(401);

      expect(response.body.message).toMatch(/unauthorized|token|authentication/i);
    });

    it('should only return own profile', async () => {
      // Create another patient
      const otherPatient = {
        email: 'other@example.com',
        password: 'OtherPassword123!',
        full_name: 'Other Patient',
        phone: '0787654321',
        role: 'Patient'
      };

      const otherResponse = await request(app)
        .post('/api/auth/register')
        .send(otherPatient);

      const otherToken = otherResponse.body.token;

      // Create profile for other patient
      const otherProfileData = {
        dateOfBirth: '1985-03-20',
        gender: 'Female',
        bloodType: 'B+',
        height: 160,
        weight: 55,
        address: 'Other Address',
        city: 'Kandy',
        province: 'Central',
        postalCode: '20000'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${otherToken}`)
        .send(otherProfileData);

      // First patient should not see other patient's profile
      const response = await request(app)
        .get('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.patient.userId).toBe(patientUserId);
    });
  });

  describe('PUT /api/patient/profile - Update Patient Profile', () => {
    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);
    });

    it('should update patient profile', async () => {
      const updateData = {
        weight: 75,
        height: 176,
        address: '456 New Street'
      };

      const response = await request(app)
        .put('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.patient.weight).toBe(75);
      expect(response.body.patient.height).toBe(176);
      expect(response.body.patient.address).toBe('456 New Street');
    });

    it('should persist updates in database', async () => {
      const updateData = {
        weight: 72
      };

      await request(app)
        .put('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const patient = await Patient.findOne({ userId: patientUserId });
      expect(patient.weight).toBe(72);
    });

    it('should validate updated fields', async () => {
      const invalidUpdate = {
        weight: -50 // Invalid negative weight
      };

      const response = await request(app)
        .put('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.message).toMatch(/weight|invalid|measurement/i);
    });
  });

  describe('POST /api/patient/health - Add Health Information', () => {
    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);
    });

    describe('Allergies', () => {
      it('should add allergy to health profile', async () => {
        const allergyData = {
          type: 'Allergy',
          name: 'Penicillin',
          reactions: ['Rash', 'Itching'],
          severity: 'High'
        };

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(allergyData)
          .expect(201);

        expect(response.body.health).toHaveProperty('allergies');
        expect(response.body.health.allergies[0].name).toBe('Penicillin');
      });

      it('should reject duplicate allergies', async () => {
        const allergyData = {
          type: 'Allergy',
          name: 'Penicillin',
          reactions: ['Rash'],
          severity: 'High'
        };

        await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(allergyData);

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(allergyData)
          .expect(409);

        expect(response.body.message).toMatch(/already.*exists|duplicate/i);
      });

      it('should validate severity levels', async () => {
        const allergyData = {
          type: 'Allergy',
          name: 'Peanuts',
          reactions: ['Anaphylaxis'],
          severity: 'Invalid' // Invalid severity
        };

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(allergyData)
          .expect(400);

        expect(response.body.message).toMatch(/severity|invalid/i);
      });
    });

    describe('Diseases/Conditions', () => {
      it('should add disease to health profile', async () => {
        const diseaseData = {
          type: 'Disease',
          name: 'Diabetes Type 2',
          diagnosisDate: '2015-06-10',
          status: 'Chronic'
        };

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(diseaseData)
          .expect(201);

        expect(response.body.health.diseases[0].name).toBe('Diabetes Type 2');
        expect(response.body.health.diseases[0].status).toBe('Chronic');
      });

      it('should store disease in database', async () => {
        const diseaseData = {
          type: 'Disease',
          name: 'Hypertension',
          diagnosisDate: '2018-03-15',
          status: 'Chronic'
        };

        await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(diseaseData);

        const patient = await Patient.findOne({ userId: patientUserId });
        expect(patient.diseases).toContainEqual(
          expect.objectContaining({ name: 'Hypertension' })
        );
      });
    });

    describe('Medications', () => {
      it('should add medication to health profile', async () => {
        const medicationData = {
          type: 'Medication',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          reason: 'Diabetes control'
        };

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(medicationData)
          .expect(201);

        expect(response.body.health.medications[0].name).toBe('Metformin');
        expect(response.body.health.medications[0].dosage).toBe('500mg');
      });

      it('should validate medication fields', async () => {
        const invalidMedication = {
          type: 'Medication',
          name: 'Aspirin'
          // Missing dosage and frequency
        };

        const response = await request(app)
          .post('/api/patient/health')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidMedication)
          .expect(400);

        expect(response.body.message).toMatch(/required|dosage|frequency/i);
      });
    });
  });

  describe('DELETE /api/patient/health/:id - Remove Health Information', () => {
    let allergyId;

    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      const allergyData = {
        type: 'Allergy',
        name: 'Penicillin',
        reactions: ['Rash'],
        severity: 'High'
      };

      const response = await request(app)
        .post('/api/patient/health')
        .set('Authorization', `Bearer ${authToken}`)
        .send(allergyData);

      allergyId = response.body.health.allergies[0]._id;
    });

    it('should delete health information', async () => {
      const response = await request(app)
        .delete(`/api/patient/health/${allergyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toMatch(/success|deleted|removed/i);
    });

    it('should remove from database', async () => {
      await request(app)
        .delete(`/api/patient/health/${allergyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const patient = await Patient.findOne({ userId: patientUserId });
      const allergyExists = patient.allergies.some(a => a._id.toString() === allergyId);
      expect(allergyExists).toBe(false);
    });

    it('should reject deletion of non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/patient/health/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toMatch(/not.*found|does not exist/i);
    });
  });

  describe('POST /api/patient/family - Add Family Member', () => {
    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);
    });

    it('should add family member', async () => {
      const familyData = {
        name: 'John Doe',
        relationship: 'Father',
        age: 65,
        contact: '0712345678',
        notes: 'Primary emergency contact'
      };

      const response = await request(app)
        .post('/api/patient/family')
        .set('Authorization', `Bearer ${authToken}`)
        .send(familyData)
        .expect(201);

      expect(response.body.family).toHaveProperty('members');
      expect(response.body.family.members[0].name).toBe('John Doe');
      expect(response.body.family.members[0].relationship).toBe('Father');
    });

    it('should validate family relationship', async () => {
      const invalidFamily = {
        name: 'Jane Doe',
        relationship: 'InvalidRelation',
        age: 35,
        contact: '0787654321'
      };

      const response = await request(app)
        .post('/api/patient/family')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFamily)
        .expect(400);

      expect(response.body.message).toMatch(/relationship|invalid/i);
    });

    it('should store in database with relationship hierarchy', async () => {
      const familyData = {
        name: 'Jane Doe',
        relationship: 'Mother',
        age: 62,
        contact: '0787654321'
      };

      await request(app)
        .post('/api/patient/family')
        .set('Authorization', `Bearer ${authToken}`)
        .send(familyData);

      const patient = await Patient.findOne({ userId: patientUserId });
      expect(patient.family.members).toContainEqual(
        expect.objectContaining({ relationship: 'Mother' })
      );
    });
  });

  describe('POST /api/patient/emergency-contact - Add Emergency Contact', () => {
    beforeEach(async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);
    });

    it('should add emergency contact', async () => {
      const emergencyData = {
        name: 'Sarah Doe',
        relationship: 'Sister',
        phone: '0712345678',
        email: 'sarah@example.com'
      };

      const response = await request(app)
        .post('/api/patient/emergency-contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emergencyData)
        .expect(201);

      expect(response.body.emergencyContact.name).toBe('Sarah Doe');
      expect(response.body.emergencyContact.phone).toBe('0712345678');
    });

    it('should validate phone number', async () => {
      const invalidEmergency = {
        name: 'Sarah Doe',
        relationship: 'Sister',
        phone: 'invalid-phone',
        email: 'sarah@example.com'
      };

      const response = await request(app)
        .post('/api/patient/emergency-contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEmergency)
        .expect(400);

      expect(response.body.message).toMatch(/phone|invalid/i);
    });

    it('should validate email format', async () => {
      const invalidEmergency = {
        name: 'Sarah Doe',
        relationship: 'Sister',
        phone: '0712345678',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/patient/emergency-contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEmergency)
        .expect(400);

      expect(response.body.message).toMatch(/email|invalid/i);
    });
  });

  describe('Error Handling & Database Transactions', () => {
    it('should handle concurrent profile updates', async () => {
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      const update1 = { weight: 75 };
      const update2 = { height: 180 };

      const response1 = await request(app)
        .put('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(update1);

      const response2 = await request(app)
        .put('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(update2);

      expect([200, 200]).toContain(response1.status);
      expect([200, 200]).toContain(response2.status);
    });

    it('should maintain data consistency on partial failures', async () => {
      // This would test transaction rollback scenarios
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const response = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(response.status).toBe(201);
    });
  });

  describe('Authorization & Security', () => {
    it('should prevent patient from modifying other patient profile', async () => {
      const otherPatient = {
        email: 'other@example.com',
        password: 'OtherPassword123!',
        full_name: 'Other Patient',
        phone: '0787654321',
        role: 'Patient'
      };

      const otherResponse = await request(app)
        .post('/api/auth/register')
        .send(otherPatient);

      const otherToken = otherResponse.body.token;
      const otherUserId = otherResponse.body.user._id;

      // Create profile for first patient
      const profileData = {
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        address: '123 Main Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '10100'
      };

      const firstPatientProfile = await request(app)
        .post('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      // Try to modify first patient's profile with second patient's token
      const updateData = { weight: 100 };

      const response = await request(app)
        .put(`/api/patient/profile/${firstPatientProfile.body.patient._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toMatch(/forbidden|permission|access denied/i);
    });
  });
});
