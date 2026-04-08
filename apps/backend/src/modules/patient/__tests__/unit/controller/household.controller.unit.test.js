/**
 * Household Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/householdService.js', () => ({
  default: {
    getAllHouseholds: jest.fn(),
    getHouseholdById: jest.fn(),
    createHousehold: jest.fn(),
    updateHousehold: jest.fn(),
    deleteHousehold: jest.fn(),
    populateHouseholdMembers: jest.fn()
  }
}));

const { default: HouseholdController } = await import('../../../controllers/householdController.js');
const { default: householdService } = await import('../../../services/householdService.js');

describe('HouseholdController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllHouseholds', () => {
    it('should return all households', async () => {
      const mockHouseholds = [{ _id: '1', gn_division: 'Padukka' }];

      householdService.getAllHouseholds.mockResolvedValue({ households: mockHouseholds });

      await HouseholdController.getAllHouseholds(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getHouseholdById', () => {
    it('should return single household', async () => {
      req.params.id = 'house-001';
      const mockHousehold = { _id: 'house-001' };

      householdService.getHouseholdById.mockResolvedValue(mockHousehold);
      householdService.populateHouseholdMembers.mockResolvedValue(mockHousehold);

      await HouseholdController.getHouseholdById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createHousehold', () => {
    it('should create new household', async () => {
      req.body = { household_id: 'HH-001', gn_division: 'Padukka', district: 'Colombo' };

      householdService.createHousehold.mockResolvedValue({ _id: 'new-id', ...req.body });

      await HouseholdController.createHousehold(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateHousehold', () => {
    it('should update household', async () => {
      req.params.id = 'house-001';
      req.body = { number_of_members: 5 };

      householdService.updateHousehold.mockResolvedValue({ _id: 'house-001', ...req.body });

      await HouseholdController.updateHousehold(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteHousehold', () => {
    it('should delete household', async () => {
      req.params.id = 'house-001';

      householdService.deleteHousehold.mockResolvedValue(true);

      await HouseholdController.deleteHousehold(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
