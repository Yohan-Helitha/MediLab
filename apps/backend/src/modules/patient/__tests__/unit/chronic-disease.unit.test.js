/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/chronic-disease.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the ChronicDisease model before importing dependent modules
const mockChronicDisease = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockChronicDisease.find = jest.fn();
mockChronicDisease.findById = jest.fn();
mockChronicDisease.findByIdAndUpdate = jest.fn();
mockChronicDisease.findByIdAndDelete = jest.fn();
mockChronicDisease.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/ChronicDisease.js', () => ({
  default: mockChronicDisease
}));

// Import after mocking
const { default: chronicDiseaseService } = await import('../../services/chronicDiseaseService.js');
const { default: chronicDiseaseController } = await import('../../controllers/chronicDiseaseController.js');

describe('Chronic Disease Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllChronicDiseases', () => {
    it('should return chronic diseases with pagination', async () => {
      const mockDiseases = [
        { _id: '1', disease_name: 'Diabetes Type 2', status: 'Active' }
      ];

      mockChronicDisease.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockDiseases)
          })
        })
      });

      mockChronicDisease.countDocuments.mockResolvedValue(1);

      const result = await chronicDiseaseService.getAllChronicDiseases({ page: 1, limit: 10 });

      expect(result.chronicDiseases).toEqual(mockDiseases);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getChronicDiseaseById', () => {
    it('should return disease by ID', async () => {
      const mockDisease_data = { _id: '1', disease_name: 'Diabetes' };
      mockChronicDisease.findById.mockResolvedValue(mockDisease_data);

      const result = await chronicDiseaseService.getChronicDiseaseById('1');

      expect(result).toEqual(mockDisease_data);
    });

    it('should throw error if disease not found', async () => {
      mockChronicDisease.findById.mockResolvedValue(null);

      await expect(chronicDiseaseService.getChronicDiseaseById('invalid')).rejects.toThrow();
    });
  });

  describe('createChronicDisease', () => {
    it('should create a new disease', async () => {
      const diseaseData = { disease_name: 'Hypertension', status: 'Active' };
      const mockDisease_data = { _id: '1', ...diseaseData, save: jest.fn().mockResolvedValue(null) };

      mockChronicDisease.mockImplementation(() => mockDisease_data);

      const result = await chronicDiseaseService.createChronicDisease(diseaseData);

      expect(result._id).toBe('1');
    });
  });

  describe('updateChronicDisease', () => {
    it('should update a disease', async () => {
      const updateData = { status: 'Inactive' };
      const mockDisease_data = { _id: '1', disease_name: 'Diabetes', status: 'Inactive' };

      mockChronicDisease.findByIdAndUpdate.mockResolvedValue(mockDisease_data);

      const result = await chronicDiseaseService.updateChronicDisease('1', updateData);

      expect(result).toEqual(mockDisease_data);
    });
  });

  describe('deleteChronicDisease', () => {
    it('should delete a disease', async () => {
      const mockDisease_data = { _id: '1', disease_name: 'Diabetes' };
      mockChronicDisease.findByIdAndDelete.mockResolvedValue(mockDisease_data);

      const result = await chronicDiseaseService.deleteChronicDisease('1');

      expect(result).toEqual(mockDisease_data);
    });
  });
});

describe('Chronic Disease Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllChronicDiseases', () => {
    it('should return all diseases with 200 status', async () => {
      const mockData = { diseases: [{ _id: '1', disease_name: 'Diabetes' }] };

      jest.spyOn(chronicDiseaseService, 'getAllChronicDiseases').mockResolvedValue(mockData);

      await chronicDiseaseController.getAllChronicDiseases(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
    });
  });

  describe('getChronicDiseaseById', () => {
    it('should return disease by ID', async () => {
      const mockDisease = { _id: '1', disease_name: 'Diabetes' };
      req.params.id = '1';

      jest.spyOn(chronicDiseaseService, 'getChronicDiseaseById').mockResolvedValue(mockDisease);

      await chronicDiseaseController.getChronicDiseaseById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createChronicDisease', () => {
    it('should create disease with 201 status', async () => {
      const diseaseData = { disease_name: 'Hypertension' };
      req.body = diseaseData;

      jest.spyOn(chronicDiseaseService, 'createChronicDisease').mockResolvedValue(diseaseData);

      await chronicDiseaseController.createChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateChronicDisease', () => {
    it('should update disease with 200 status', async () => {
      req.params.id = '1';
      req.body = { status: 'Inactive' };

      jest.spyOn(chronicDiseaseService, 'updateChronicDisease').mockResolvedValue({});

      await chronicDiseaseController.updateChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteChronicDisease', () => {
    it('should delete disease with 200 status', async () => {
      req.params.id = '1';

      jest.spyOn(chronicDiseaseService, 'deleteChronicDisease').mockResolvedValue({});

      await chronicDiseaseController.deleteChronicDisease(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
