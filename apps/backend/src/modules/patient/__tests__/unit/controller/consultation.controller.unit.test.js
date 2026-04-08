/**
 * Consultation Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../../consultation/services/consultationService.js', () => ({
  default: {
    askAIDoctor: jest.fn(),
    getMedicalInfo: jest.fn(),
    analyzeSymptoms: jest.fn(),
    getMedicationInfo: jest.fn(),
    getLifestyleAdvice: jest.fn(),
    checkAPIHealth: jest.fn()
  }
}));

const { default: ConsultationController } = await import('../../../../consultation/controllers/consultationController.js');
const { default: consultationService } = await import('../../../../consultation/services/consultationService.js');

describe('ConsultationController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('askAIDoctor', () => {
    it('should ask AI Doctor and return response', async () => {
      req.body = { message: 'What are symptoms of fever?', specialization: 'general', language: 'en' };
      const mockResponse = { data: 'Fever symptoms include...' };

      consultationService.askAIDoctor.mockResolvedValue(mockResponse);

      await ConsultationController.askAIDoctor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMedicalInfo', () => {
    it('should return medical information about a condition', async () => {
      req.body = { condition: 'Diabetes', specialization: 'general' };
      const mockInfo = { data: 'Diabetes information...' };

      consultationService.getMedicalInfo.mockResolvedValue(mockInfo);

      await ConsultationController.getMedicalInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('analyzeSymptoms', () => {
    it('should analyze symptoms and return analysis', async () => {
      req.body = { symptoms: ['fever', 'cough'], patientInfo: { age: 30 } };
      const mockAnalysis = { data: 'Possible conditions...' };

      consultationService.analyzeSymptoms.mockResolvedValue(mockAnalysis);

      await ConsultationController.analyzeSymptoms(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if symptoms array is empty', async () => {
      req.body = { symptoms: [] };

      await ConsultationController.analyzeSymptoms(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getMedicationInfo', () => {
    it('should return medication information', async () => {
      req.body = { medicationName: 'Aspirin' };
      const mockMedInfo = { data: 'Aspirin information...' };

      consultationService.getMedicationInfo.mockResolvedValue(mockMedInfo);

      await ConsultationController.getMedicationInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLifestyleAdvice', () => {
    it('should return lifestyle and prevention advice', async () => {
      req.body = { condition: 'Hypertension' };
      const mockAdvice = { data: 'Lifestyle advice for hypertension...' };

      consultationService.getLifestyleAdvice.mockResolvedValue(mockAdvice);

      await ConsultationController.getLifestyleAdvice(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('checkHealth', () => {
    it('should return API health status as online', async () => {
      consultationService.checkAPIHealth.mockResolvedValue(true);

      await ConsultationController.checkHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return offline status when API is not responding', async () => {
      consultationService.checkAPIHealth.mockResolvedValue(false);

      await ConsultationController.checkHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
