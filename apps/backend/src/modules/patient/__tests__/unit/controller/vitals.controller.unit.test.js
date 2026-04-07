/**
 * Vitals Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/vitalsService.js', () => ({
  default: {
    getAllVitals: jest.fn(),
    getVitalById: jest.fn(),
    createVital: jest.fn(),
    updateVital: jest.fn(),
    deleteVital: jest.fn()
  }
}));

const { default: VitalsController } = await import('../../../controllers/vitalsController.js');
const { default: vitalsService } = await import('../../../services/vitalsService.js');

describe('VitalsController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllVitals', () => {
    it('should return all vital signs', async () => {
      req.query = { member_id: 'mem-001' };
      const mockVitals = [{ _id: '1', blood_pressure: '120/80' }];

      vitalsService.getAllVitals.mockResolvedValue({ vitals: mockVitals });

      await VitalsController.getAllVitals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getVitalById', () => {
    it('should return single vital record', async () => {
      req.params.id = 'vital-001';

      vitalsService.getVitalById.mockResolvedValue({ _id: 'vital-001' });

      await VitalsController.getVitalById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createVital', () => {
    it('should create new vital record', async () => {
      req.body = { member_id: 'mem-001', blood_pressure: '120/80', heart_rate: 72 };

      vitalsService.createVital.mockResolvedValue({ _id: 'new-id', ...req.body });

      await VitalsController.createVital(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateVital', () => {
    it('should update vital record', async () => {
      req.params.id = 'vital-001';
      req.body = { blood_pressure: '125/85' };

      vitalsService.updateVital.mockResolvedValue({ _id: 'vital-001', ...req.body });

      await VitalsController.updateVital(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteVital', () => {
    it('should delete vital record', async () => {
      req.params.id = 'vital-001';

      vitalsService.deleteVital.mockResolvedValue(true);

      await VitalsController.deleteVital(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
