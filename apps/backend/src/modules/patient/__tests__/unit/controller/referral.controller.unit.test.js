/**
 * Referral Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/referralService.js', () => ({
  default: {
    getAllReferrals: jest.fn(),
    getReferralById: jest.fn(),
    createReferral: jest.fn(),
    updateReferral: jest.fn(),
    deleteReferral: jest.fn()
  }
}));

const { default: ReferralController } = await import('../../../controllers/referralController.js');
const { default: referralService } = await import('../../../services/referralService.js');

describe('ReferralController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllReferrals', () => {
    it('should return all referrals', async () => {
      req.query = { member_id: 'mem-001' };
      const mockReferrals = [{ _id: '1', referred_to: 'Cardiologist' }];

      referralService.getAllReferrals.mockResolvedValue({ referrals: mockReferrals });

      await ReferralController.getAllReferrals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getReferralById', () => {
    it('should return single referral', async () => {
      req.params.id = 'ref-001';

      referralService.getReferralById.mockResolvedValue({ _id: 'ref-001' });

      await ReferralController.getReferralById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createReferral', () => {
    it('should create new referral', async () => {
      req.body = { member_id: 'mem-001', referred_to: 'Cardiologist', reason: 'Heart check' };

      referralService.createReferral.mockResolvedValue({ _id: 'new-id', ...req.body });

      await ReferralController.createReferral(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateReferral', () => {
    it('should update referral', async () => {
      req.params.id = 'ref-001';
      req.body = { status: 'completed' };

      referralService.updateReferral.mockResolvedValue({ _id: 'ref-001', ...req.body });

      await ReferralController.updateReferral(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteReferral', () => {
    it('should delete referral', async () => {
      req.params.id = 'ref-001';

      referralService.deleteReferral.mockResolvedValue(true);

      await ReferralController.deleteReferral(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
