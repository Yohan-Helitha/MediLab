/**
 * Health Details Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/healthDetailsService.js', () => ({
  default: {
    getAllHealthDetails: jest.fn(),
    getHealthDetailsById: jest.fn(),
    createHealthDetails: jest.fn(),
    updateHealthDetails: jest.fn(),
    deleteHealthDetails: jest.fn()
  }
}));

const { default: HealthDetailsController } = await import('../../../controllers/healthDetailsController.js');
const { default: healthDetailsService } = await import('../../../services/healthDetailsService.js');

describe('HealthDetailsController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllHealthDetails', () => {
    it('should return all health details', async () => {
      const mockDetails = [{ _id: '1', blood_type: 'O+' }];

      healthDetailsService.getAllHealthDetails.mockResolvedValue({ details: mockDetails });

      await HealthDetailsController.getAllHealthDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getHealthDetailsById', () => {
    it('should return single health details', async () => {
      req.params.id = 'health-001';

      healthDetailsService.getHealthDetailsById.mockResolvedValue({ _id: 'health-001' });

      await HealthDetailsController.getHealthDetailsById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createHealthDetails', () => {
    it('should create new health details', async () => {
      req.body = { member_id: 'mem-001', blood_type: 'O+', height: 175 };

      healthDetailsService.createHealthDetails.mockResolvedValue({ _id: 'new-id', ...req.body });

      await HealthDetailsController.createHealthDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateHealthDetails', () => {
    it('should update health details', async () => {
      req.params.id = 'health-001';
      req.body = { weight: 80 };

      healthDetailsService.updateHealthDetails.mockResolvedValue({ _id: 'health-001', ...req.body });

      await HealthDetailsController.updateHealthDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteHealthDetails', () => {
    it('should delete health details', async () => {
      req.params.id = 'health-001';

      healthDetailsService.deleteHealthDetails.mockResolvedValue(true);

      await HealthDetailsController.deleteHealthDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
