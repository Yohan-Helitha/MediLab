/**
 * Referral Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/Referral.js', () => ({
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

const { default: ReferralService } = await import('../../../services/referralService.js');
const { default: Referral } = await import('../../../models/Referral.js');

describe('ReferralService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Referral.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    Referral.countDocuments.mockResolvedValue(0);
    Referral.findById.mockResolvedValue(null);
    Referral.findByIdAndUpdate.mockResolvedValue(null);
    Referral.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllReferrals', () => {
    it('should retrieve all referrals', async () => {
      const memberId = 'mem-001';
      const mockReferrals = [{ _id: '1', member_id: memberId }];

      Referral.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReferrals)
      });
      Referral.countDocuments.mockResolvedValue(1);

      const result = await ReferralService.getAllReferrals({ member_id: memberId });

      expect(result).toBeDefined();
      expect(result.referrals).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getReferralById', () => {
    it('should retrieve single referral', async () => {
      Referral.findById.mockResolvedValue({ _id: 'ref-001' });

      const result = await ReferralService.getReferralById('ref-001');

      expect(result).toBeDefined();
    });
  });

  describe('createReferral', () => {
    it('should create new referral', async () => {
      const refData = { visit_id: 'vis-001', referred_to: 'General Physician', referral_reason: 'Follow-up', urgency_level: 'low' };

      const mockInstance = { ...refData, save: jest.fn().mockResolvedValue({ _id: 'new-id', ...refData }) };
      Referral.mockImplementation(() => mockInstance);

      const result = await ReferralService.createReferral(refData);

      expect(result).toBeDefined();
    });
  });

  describe('updateReferral', () => {
    it('should update referral', async () => {
      Referral.findByIdAndUpdate.mockResolvedValue({ _id: 'ref-001' });

      const result = await ReferralService.updateReferral('ref-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteReferral', () => {
    it('should delete referral', async () => {
      Referral.findByIdAndDelete.mockResolvedValue({ _id: 'ref-001' });

      const result = await ReferralService.deleteReferral('ref-001');

      expect(result).toBeDefined();
    });
  });
});
