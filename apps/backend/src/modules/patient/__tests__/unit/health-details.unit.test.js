/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/health-details.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the HealthDetails model before importing dependent modules
const mockHealthDetails = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockHealthDetails.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
});

mockHealthDetails.findById = jest.fn();
mockHealthDetails.findByIdAndUpdate = jest.fn();
mockHealthDetails.findByIdAndDelete = jest.fn();
mockHealthDetails.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/HealthDetails.js', () => ({
  default: mockHealthDetails
}));

// Import after mocking
const { default: healthDetailsService } = await import('../../services/healthDetailsService.js');
const { default: healthDetailsController } = await import('../../controllers/healthDetailsController.js');

describe('Health Details Service Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllHealthDetails', () => {
    it('should return health details with pagination', async () => {
      const mockDetails = [{ _id: '1', blood_type: 'O+' }];
      mockHealthDetails.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockDetails)
          })
        })
      });
      mockHealthDetails.countDocuments.mockResolvedValue(1);

      const result = await healthDetailsService.getAllHealthDetails({});
      expect(result.healthDetails).toEqual(mockDetails);
    });
  });

  describe('getHealthDetailsById', () => {
    it('should return health details by ID', async () => {
      const mockDetails_data = { _id: '1', blood_type: 'O+' };
      mockHealthDetails.findById.mockResolvedValue(mockDetails_data);

      const result = await healthDetailsService.getHealthDetailsById('1');
      expect(result).toEqual(mockDetails_data);
    });

    it('should throw error if not found', async () => {
      mockHealthDetails.findById.mockResolvedValue(null);
      await expect(healthDetailsService.getHealthDetailsById('invalid')).rejects.toThrow();
    });
  });

  describe('createHealthDetails', () => {
    it('should create health details', async () => {
      const detailsData = { blood_type: 'A+', height: 175 };
      const mockDetails_data = { _id: '1', ...detailsData };

      mockHealthDetails.mockImplementation(() => ({
        ...mockDetails_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await healthDetailsService.createHealthDetails(detailsData);
      expect(result._id).toBe('1');
      expect(result.blood_type).toBe('A+');
    });
  });

  describe('updateHealthDetails', () => {
    it('should update health details', async () => {
      const mockDetails_data = { _id: '1', weight: 72 };
      mockHealthDetails.findByIdAndUpdate.mockResolvedValue(mockDetails_data);

      const result = await healthDetailsService.updateHealthDetails('1', { weight: 72 });
      expect(result).toEqual(mockDetails_data);
    });
  });

  describe('deleteHealthDetails', () => {
    it('should delete health details', async () => {
      const mockDetails_data = { _id: '1' };
      mockHealthDetails.findByIdAndDelete.mockResolvedValue(mockDetails_data);

      const result = await healthDetailsService.deleteHealthDetails('1');
      expect(result).toEqual(mockDetails_data);
    });
  });
});

describe('Health Details Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllHealthDetails', () => {
    it('should return details with 200 status', async () => {
      jest.spyOn(healthDetailsService, 'getAllHealthDetails').mockResolvedValue({});
      await healthDetailsController.getAllHealthDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getHealthDetailsById', () => {
    it('should return details by ID', async () => {
      req.params.id = '1';
      jest.spyOn(healthDetailsService, 'getHealthDetailsById').mockResolvedValue({});
      await healthDetailsController.getHealthDetailsById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createHealthDetails', () => {
    it('should create details with 201 status', async () => {
      jest.spyOn(healthDetailsService, 'createHealthDetails').mockResolvedValue({});
      await healthDetailsController.createHealthDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateHealthDetails', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(healthDetailsService, 'updateHealthDetails').mockResolvedValue({});
      await healthDetailsController.updateHealthDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteHealthDetails', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(healthDetailsService, 'deleteHealthDetails').mockResolvedValue({});
      await healthDetailsController.deleteHealthDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
