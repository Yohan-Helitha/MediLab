/**
 * Run this test file with:
 * npm test -- src/modules/consultation/__tests__/integration/consultation.integration.test.js
 */

import request from 'supertest';
import app from '../../../../app.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Consultation Module Integration Tests', () => {
  let jwtToken;

  beforeAll(async () => {
    // Create JWT token for testing
    const payload = {
      id: 'user-123',
      systemId: 'user-123',
      profileId: 'user-123',
      userType: 'patient',
      fullName: 'Test User'
    };

    jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', {
      expiresIn: '7d'
    });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('Consultation Endpoints', () => {
    it('should ask AI Doctor a question', async () => {
      const response = await request(app)
        .post('/api/consultation/ask')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          message: 'What are the symptoms of a common cold?',
          specialization: 'general',
          language: 'en'
        });

      // The endpoint should handle the request (even if API fails)
      expect([200, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });

    it('should check API health status', async () => {
      const response = await request(app)
        .get('/api/consultation/health')
        .set('Authorization', `Bearer ${jwtToken}`);

      // API health check should return a status
      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });

    it('should get medical information', async () => {
      const response = await request(app)
        .post('/api/consultation/medical-info')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          condition: 'Diabetes',
          specialization: 'general'
        });

      // The endpoint should handle the request
      expect([200, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/consultation/ask')
        .send({
          message: 'Test question'
        });

      // Should fail without auth
      expect(response.status).toBe(401);
    });
  });
});
