/**
 * Health Details Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/HealthDetails.js', () => ({
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

const { default: HealthDetailsService } = await import('../../../services/healthDetailsService.js');
const { default: HealthDetails } = await import('../../../models/HealthDetails.js');

describe('HealthDetailsService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HealthDetails.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    HealthDetails.countDocuments.mockResolvedValue(0);
    HealthDetails.findById.mockResolvedValue(null);
    HealthDetails.findByIdAndUpdate.mockResolvedValue(null);
    HealthDetails.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllHealthDetails', () => {
    it('should retrieve all health details', async () => {
      const mockDetails = [{ _id: '1' }];

      HealthDetails.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockDetails)
      });
      HealthDetails.countDocuments.mockResolvedValue(1);

      const result = await HealthDetailsService.getAllHealthDetails({});

      expect(result).toBeDefined();
      expect(result.healthDetails).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getHealthDetailsById', () => {
    it('should retrieve single health details', async () => {
      HealthDetails.findById.mockResolvedValue({ _id: 'health-001' });

      const result = await HealthDetailsService.getHealthDetailsById('health-001');

      expect(result).toBeDefined();
    });
  });

  describe('createHealthDetails', () => {
    it('should create new health details', async () => {
      const detailsData = { member_id: 'mem-001', blood_type: 'O+' };

      const mockInstance = { ...detailsData, save: jest.fn().mockResolvedValue({ _id: 'new-id', ...detailsData }) };
      HealthDetails.mockImplementation(() => mockInstance);

      const result = await HealthDetailsService.createHealthDetails(detailsData);

      expect(result).toBeDefined();
    });
  });

  describe('updateHealthDetails', () => {
    it('should update health details', async () => {
      HealthDetails.findByIdAndUpdate.mockResolvedValue({ _id: 'health-001' });

      const result = await HealthDetailsService.updateHealthDetails('health-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteHealthDetails', () => {
    it('should delete health details', async () => {
      HealthDetails.findByIdAndDelete.mockResolvedValue({ _id: 'health-001' });

      const result = await HealthDetailsService.deleteHealthDetails('health-001');

      expect(result).toBeDefined();
    });
  });
});
