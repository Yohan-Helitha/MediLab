/**
 * Chronic Disease Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/chronicDiseaseService.js', () => ({
  default: {
    getAllChronicDiseases: jest.fn(),
    getChronicDiseaseById: jest.fn(),
    createChronicDisease: jest.fn(),
    updateChronicDisease: jest.fn(),
    deleteChronicDisease: jest.fn()
  }
}));

const { default: ChronicDiseaseController } = await import('../../../controllers/chronicDiseaseController.js');
const { default: chronicDiseaseService } = await import('../../../services/chronicDiseaseService.js');

describe('ChronicDiseaseController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllChronicDiseases', () => {
    it('should return all chronic diseases', async () => {
      req.query = { member_id: 'mem-001' };
      const mockDiseases = [
        { _id: '1', disease_name: 'Diabetes', status: 'Active' },
        { _id: '2', disease_name: 'Hypertension', status: 'Controlled' }
      ];

      chronicDiseaseService.getAllChronicDiseases.mockResolvedValue({ diseases: mockDiseases });

      await ChronicDiseaseController.getAllChronicDiseases(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getChronicDiseaseById', () => {
    it('should return single chronic disease', async () => {
      req.params.id = 'disease-001';
      const mockDisease = { _id: 'disease-001', disease_name: 'Diabetes' };

      chronicDiseaseService.getChronicDiseaseById.mockResolvedValue(mockDisease);

      await ChronicDiseaseController.getChronicDiseaseById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createChronicDisease', () => {
    it('should create new chronic disease', async () => {
      req.body = { member_id: 'mem-001', disease_name: 'Asthma', status: 'Active' };
      const mockDisease = { _id: 'new-id', ...req.body };

      chronicDiseaseService.createChronicDisease.mockResolvedValue(mockDisease);

      await ChronicDiseaseController.createChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateChronicDisease', () => {
    it('should update chronic disease', async () => {
      req.params.id = 'disease-001';
      req.body = { status: 'Controlled' };

      chronicDiseaseService.updateChronicDisease.mockResolvedValue({ _id: 'disease-001', ...req.body });

      await ChronicDiseaseController.updateChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteChronicDisease', () => {
    it('should delete chronic disease', async () => {
      req.params.id = 'disease-001';

      chronicDiseaseService.deleteChronicDisease.mockResolvedValue(true);

      await ChronicDiseaseController.deleteChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
