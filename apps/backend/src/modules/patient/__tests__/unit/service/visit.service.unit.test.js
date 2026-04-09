/**
 * Visit Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/Visit.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  })
}));

const { default: VisitService } = await import('../../../services/visitService.js');
const { default: Visit } = await import('../../../models/Visit.js');

describe('VisitService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Visit.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    Visit.countDocuments.mockResolvedValue(0);
    Visit.findById.mockResolvedValue(null);
    Visit.findByIdAndUpdate.mockResolvedValue(null);
    Visit.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllVisits', () => {
    it('should retrieve all visits', async () => {
      const memberId = 'mem-001';
      const mockVisits = [{ _id: '1', member_id: memberId }];

      Visit.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockVisits)
      });
      Visit.countDocuments.mockResolvedValue(1);

      const result = await VisitService.getAllVisits({ member_id: memberId });

      expect(result).toBeDefined();
      expect(result.visits).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getVisitById', () => {
    it('should retrieve single visit', async () => {
      Visit.findById.mockResolvedValue({ _id: 'vis-001' });

      const result = await VisitService.getVisitById('vis-001');

      expect(result).toBeDefined();
    });
  });

  describe('createVisit', () => {
    it('should create new visit', async () => {
      const visitData = { member_id: 'mem-001', visit_type: 'consultation' };

      const mockInstance = { ...visitData, save: jest.fn().mockResolvedValue({ _id: 'new-id', ...visitData }) };
      Visit.mockImplementation(() => mockInstance);

      const result = await VisitService.createVisit(visitData);

      expect(result).toBeDefined();
    });
  });

  describe('updateVisit', () => {
    it('should update visit', async () => {
      Visit.findByIdAndUpdate.mockResolvedValue({ _id: 'vis-001' });

      const result = await VisitService.updateVisit('vis-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteVisit', () => {
    it('should delete visit', async () => {
      Visit.findByIdAndDelete.mockResolvedValue({ _id: 'vis-001' });

      const result = await VisitService.deleteVisit('vis-001');

      expect(result).toBeDefined();
    });
  });
});
