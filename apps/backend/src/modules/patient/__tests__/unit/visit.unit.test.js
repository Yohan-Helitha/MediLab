/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/visit.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the Visit model before importing dependent modules
const mockVisit = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockVisit.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  })
});

mockVisit.findById = jest.fn().mockResolvedValue({
  _id: '1',
  visit_type: 'Check-up'
});
mockVisit.findByIdAndUpdate = jest.fn();
mockVisit.findByIdAndDelete = jest.fn();
mockVisit.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/Visit.js', () => ({
  default: mockVisit
}));

// Import after mocking
const { default: visitService } = await import('../../services/visitService.js');
const { default: visitController } = await import('../../controllers/visitController.js');

describe('Visit Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockVisit.findById.mockResolvedValue({
      _id: '1',
      visit_type: 'Check-up'
    });
  });

  describe('getAllVisits', () => {
    it('should return visits with pagination', async () => {
      const mockVisits = [{ _id: '1', visit_type: 'Check-up' }];
      mockVisit.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockVisits)
          })
        })
      });
      mockVisit.countDocuments.mockResolvedValue(1);

      const result = await visitService.getAllVisits({});
      expect(result.visits).toEqual(mockVisits);
    });
  });

  describe('getVisitById', () => {
    it('should return visit by ID', async () => {
      const mockVisit_data = { _id: '1', visit_type: 'Check-up' };
      mockVisit.findById.mockResolvedValue(mockVisit_data);

      const result = await visitService.getVisitById('1');
      expect(result).toEqual(mockVisit_data);
    });

    it('should throw error if not found', async () => {
      mockVisit.findById.mockResolvedValue(null);
      await expect(visitService.getVisitById('invalid')).rejects.toThrow();
    });
  });

  describe('createVisit', () => {
    it('should create visit', async () => {
      const visitData = { visit_type: 'Follow-up', doctor_name: 'Dr. Smith' };
      const mockVisit_data = { _id: '1', ...visitData };

      mockVisit.mockImplementation(() => ({
        ...mockVisit_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await visitService.createVisit(visitData);
      expect(result._id).toBe(mockVisit_data._id);
      expect(result.visit_type).toBe(visitData.visit_type);
      expect(result.doctor_name).toBe(visitData.doctor_name);
    });
  });

  describe('updateVisit', () => {
    it('should update visit', async () => {
      const mockVisit_data = { _id: '1', diagnosis: 'Resolved' };
      mockVisit.findByIdAndUpdate.mockResolvedValue(mockVisit_data);

      const result = await visitService.updateVisit('1', { diagnosis: 'Resolved' });
      expect(result).toEqual(mockVisit_data);
    });
  });

  describe('deleteVisit', () => {
    it('should delete visit', async () => {
      const mockVisit_data = { _id: '1' };
      mockVisit.findByIdAndDelete.mockResolvedValue(mockVisit_data);

      const result = await visitService.deleteVisit('1');
      expect(result).toEqual(mockVisit_data);
    });
  });
});

describe('Visit Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllVisits', () => {
    it('should return visits with 200 status', async () => {
      jest.spyOn(visitService, 'getAllVisits').mockResolvedValue({});
      await visitController.getAllVisits(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getVisitById', () => {
    it('should return visit by ID', async () => {
      req.params.id = '1';
      jest.spyOn(visitService, 'getVisitById').mockResolvedValue({});
      await visitController.getVisitById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createVisit', () => {
    it('should create visit with 201 status', async () => {
      jest.spyOn(visitService, 'createVisit').mockResolvedValue({});
      await visitController.createVisit(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateVisit', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(visitService, 'updateVisit').mockResolvedValue({});
      await visitController.updateVisit(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteVisit', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(visitService, 'deleteVisit').mockResolvedValue({});
      await visitController.deleteVisit(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
