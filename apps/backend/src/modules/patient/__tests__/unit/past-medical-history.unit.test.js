/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/past-medical-history.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the PastMedicalHistory model before importing dependent modules
const mockPastMedicalHistory = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockPastMedicalHistory.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  })
});

mockPastMedicalHistory.findById = jest.fn().mockResolvedValue({
  _id: '1',
  condition_name: 'Broken Arm'
});
mockPastMedicalHistory.findByIdAndUpdate = jest.fn();
mockPastMedicalHistory.findByIdAndDelete = jest.fn();
mockPastMedicalHistory.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/PastMedicalHistory.js', () => ({
  default: mockPastMedicalHistory
}));

// Import after mocking
const { default: pastMedicalHistoryService } = await import('../../services/pastMedicalHistoryService.js');
const { default: pastMedicalHistoryController } = await import('../../controllers/pastMedicalHistoryController.js');

describe('Past Medical History Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockPastMedicalHistory.findById.mockResolvedValue({
      _id: '1',
      condition_name: 'Broken Arm'
    });
  });

  describe('getAllMedicalHistory', () => {
    it('should return medical history with pagination', async () => {
      const mockHistory = [{ _id: '1', condition_name: 'Broken Arm' }];
      mockPastMedicalHistory.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockHistory)
          })
        })
      });
      mockPastMedicalHistory.countDocuments.mockResolvedValue(1);

      const result = await pastMedicalHistoryService.getAllPastMedicalHistories({});
      expect(result.pastMedicalHistories).toEqual(mockHistory);
    });
  });

  describe('getMedicalHistoryById', () => {
    it('should return medical history by ID', async () => {
      const mockHistory_data = { _id: '1', condition_name: 'Broken Arm' };
      mockPastMedicalHistory.findById.mockResolvedValue(mockHistory_data);

      const result = await pastMedicalHistoryService.getPastMedicalHistoryById('1');
      expect(result).toEqual(mockHistory_data);
    });

    it('should throw error if not found', async () => {
      mockPastMedicalHistory.findById.mockResolvedValue(null);
      await expect(pastMedicalHistoryService.getPastMedicalHistoryById('invalid')).rejects.toThrow();
    });
  });

  describe('createMedicalHistory', () => {
    it('should create medical history', async () => {
      const historyData = { condition_name: 'Surgery', treatment_year: 2019 };
      const mockHistory_data = { _id: '1', ...historyData };

      mockPastMedicalHistory.mockImplementation(() => ({
        ...mockHistory_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await pastMedicalHistoryService.createPastMedicalHistory(historyData);
      expect(result._id).toBe(mockHistory_data._id);
      expect(result.condition_name).toBe(historyData.condition_name);
      expect(result.treatment_year).toBe(historyData.treatment_year);
    });
  });

  describe('updateMedicalHistory', () => {
    it('should update medical history', async () => {
      const mockHistory_data = { _id: '1', treatment_details: 'Updated' };
      mockPastMedicalHistory.findByIdAndUpdate.mockResolvedValue(mockHistory_data);

      const result = await pastMedicalHistoryService.updatePastMedicalHistory('1', { treatment_details: 'Updated' });
      expect(result).toEqual(mockHistory_data);
    });
  });

  describe('deleteMedicalHistory', () => {
    it('should delete medical history', async () => {
      const mockHistory_data = { _id: '1' };
      mockPastMedicalHistory.findByIdAndDelete.mockResolvedValue(mockHistory_data);

      const result = await pastMedicalHistoryService.deletePastMedicalHistory('1');
      expect(result).toEqual(mockHistory_data);
    });
  });
});

describe('Past Medical History Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllMedicalHistory', () => {
    it('should return history with 200 status', async () => {
      jest.spyOn(pastMedicalHistoryService, 'getAllPastMedicalHistories').mockResolvedValue({});
      await pastMedicalHistoryController.getAllPastMedicalHistories(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMedicalHistoryById', () => {
    it('should return history by ID', async () => {
      req.params.id = '1';
      jest.spyOn(pastMedicalHistoryService, 'getPastMedicalHistoryById').mockResolvedValue({});
      await pastMedicalHistoryController.getPastMedicalHistoryById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createMedicalHistory', () => {
    it('should create history with 201 status', async () => {
      jest.spyOn(pastMedicalHistoryService, 'createPastMedicalHistory').mockResolvedValue({});
      await pastMedicalHistoryController.createPastMedicalHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateMedicalHistory', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(pastMedicalHistoryService, 'updatePastMedicalHistory').mockResolvedValue({});
      await pastMedicalHistoryController.updatePastMedicalHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMedicalHistory', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(pastMedicalHistoryService, 'deletePastMedicalHistory').mockResolvedValue({});
      await pastMedicalHistoryController.deletePastMedicalHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
