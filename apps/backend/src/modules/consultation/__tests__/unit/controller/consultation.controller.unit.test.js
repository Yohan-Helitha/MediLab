/**
 * Consultation Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/consultationService.js', () => ({
  default: {
    askAIDoctor: jest.fn(),
    getMedicalInfo: jest.fn(),
    analyzeSymptoms: jest.fn()
  }
}));

const { default: controller } = await import('../../../controllers/consultationController.js');
const consultationService = (await import('../../../services/consultationService.js')).default;

describe('ConsultationController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('askAIDoctor', () => {
    it('should call AI Doctor and return response', async () => {
      req.body = { message: 'I have a headache', specialization: 'neurosurgery' };
      const mockResponse = {
        success: true,
        data: { answer: 'You should rest and stay hydrated.' }
      };

      consultationService.askAIDoctor.mockResolvedValue(mockResponse);

      await controller.askAIDoctor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      req.body = { message: 'Test' };
      consultationService.askAIDoctor.mockRejectedValue(new Error('API Error'));

      await controller.askAIDoctor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getMedicalInfo', () => {
    it('should get medical information', async () => {
      req.body = { condition: 'Diabetes', specialization: 'general' };
      const mockResponse = {
        success: true,
        data: { information: 'Diabetes is a chronic disease...' }
      };

      consultationService.getMedicalInfo.mockResolvedValue(mockResponse);

      await controller.getMedicalInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
