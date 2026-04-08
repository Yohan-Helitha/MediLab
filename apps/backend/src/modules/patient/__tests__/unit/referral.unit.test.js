/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/referral.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the Referral model before importing dependent modules
const mockReferral = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockReferral.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  })
});

mockReferral.findById = jest.fn().mockResolvedValue({
  _id: '1',
  referred_to: 'Cardiologist'
});
mockReferral.findByIdAndUpdate = jest.fn();
mockReferral.findByIdAndDelete = jest.fn();
mockReferral.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/Referral.js', () => ({
  default: mockReferral
}));

// Import after mocking
const { default: referralService } = await import('../../services/referralService.js');
const { default: referralController } = await import('../../controllers/referralController.js');

describe('Referral Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockReferral.findById.mockResolvedValue({
      _id: '1',
      referred_to: 'Cardiologist'
    });
  });

  describe('getAllReferrals', () => {
    it('should return referrals with pagination', async () => {
      const mockReferrals = [{ _id: '1', referred_to: 'Cardiologist' }];
      mockReferral.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockReferrals)
          })
        })
      });
      mockReferral.countDocuments.mockResolvedValue(1);

      const result = await referralService.getAllReferrals({});
      expect(result.referrals).toEqual(mockReferrals);
    });
  });

  describe('getReferralById', () => {
    it('should return referral by ID', async () => {
      const mockReferral_data = { _id: '1', referred_to: 'Cardiologist' };
      mockReferral.findById.mockResolvedValue(mockReferral_data);

      const result = await referralService.getReferralById('1');
      expect(result).toEqual(mockReferral_data);
    });

    it('should throw error if not found', async () => {
      mockReferral.findById.mockResolvedValue(null);
      await expect(referralService.getReferralById('invalid')).rejects.toThrow();
    });
  });

  describe('createReferral', () => {
    it('should create referral', async () => {
      const referralData = { referred_to: 'Neurologist', reason: 'Headache' };
      const mockReferral_data = { _id: '1', ...referralData };

      mockReferral.mockImplementation(() => ({
        ...mockReferral_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await referralService.createReferral(referralData);
      expect(result._id).toBe(mockReferral_data._id);
      expect(result.referred_to).toBe(referralData.referred_to);
      expect(result.reason).toBe(referralData.reason);
    });
  });

  describe('updateReferral', () => {
    it('should update referral', async () => {
      const mockReferral_data = { _id: '1', status: 'Completed' };
      mockReferral.findByIdAndUpdate.mockResolvedValue(mockReferral_data);

      const result = await referralService.updateReferral('1', { status: 'Completed' });
      expect(result).toEqual(mockReferral_data);
    });
  });

  describe('deleteReferral', () => {
    it('should delete referral', async () => {
      const mockReferral_data = { _id: '1' };
      mockReferral.findByIdAndDelete.mockResolvedValue(mockReferral_data);

      const result = await referralService.deleteReferral('1');
      expect(result).toEqual(mockReferral_data);
    });
  });
});

describe('Referral Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllReferrals', () => {
    it('should return referrals with 200 status', async () => {
      jest.spyOn(referralService, 'getAllReferrals').mockResolvedValue({});
      await referralController.getAllReferrals(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getReferralById', () => {
    it('should return referral by ID', async () => {
      req.params.id = '1';
      jest.spyOn(referralService, 'getReferralById').mockResolvedValue({});
      await referralController.getReferralById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createReferral', () => {
    it('should create referral with 201 status', async () => {
      jest.spyOn(referralService, 'createReferral').mockResolvedValue({});
      await referralController.createReferral(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateReferral', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(referralService, 'updateReferral').mockResolvedValue({});
      await referralController.updateReferral(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteReferral', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(referralService, 'deleteReferral').mockResolvedValue({});
      await referralController.deleteReferral(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
