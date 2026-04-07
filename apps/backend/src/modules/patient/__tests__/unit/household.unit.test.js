/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/household.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the Household model before importing dependent modules
const mockHousehold = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockHousehold.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
});

mockHousehold.findById = jest.fn().mockResolvedValue({
  _id: '1',
  household_id: 'hh_1'
});
mockHousehold.findOne = jest.fn().mockResolvedValue({
  _id: '1',
  household_id: 'hh_1'
});
mockHousehold.findByIdAndUpdate = jest.fn().mockResolvedValue({
  _id: '1',
  household_id: 'hh_1',
  gn_division: 'Updated'
});
mockHousehold.findByIdAndDelete = jest.fn().mockResolvedValue({
  _id: '1',
  household_id: 'hh_1'
});
mockHousehold.countDocuments = jest.fn();
mockHousehold.updateMany = jest.fn().mockResolvedValue({});
mockHousehold.updateOne = jest.fn().mockResolvedValue({});

// Mock FamilyMember and FamilyRelationship models
const mockFamilyMember = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));
mockFamilyMember.find = jest.fn().mockImplementation(() => {
  const promise = Promise.resolve([]);
  promise.lean = jest.fn().mockResolvedValue([]);
  return promise;
});
mockFamilyMember.updateMany = jest.fn().mockResolvedValue({});
mockFamilyMember.updateOne = jest.fn().mockResolvedValue({});
mockFamilyMember.deleteMany = jest.fn().mockResolvedValue({});

const mockFamilyRelationship = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));
mockFamilyRelationship.find = jest.fn().mockImplementation(() => {
  const promise = Promise.resolve([]);
  promise.lean = jest.fn().mockResolvedValue([]);
  return promise;
});
mockFamilyRelationship.deleteMany = jest.fn().mockResolvedValue({});

// Mock Member model
const mockMember = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));
mockMember.findOneAndUpdate = jest.fn().mockResolvedValue({});

jest.unstable_mockModule('../../models/Household.js', () => ({
  default: mockHousehold
}));

jest.unstable_mockModule('../../models/FamilyMember.js', () => ({
  default: mockFamilyMember
}));

jest.unstable_mockModule('../../models/FamilyRelationship.js', () => ({
  default: mockFamilyRelationship
}));

jest.unstable_mockModule('../../models/Member.js', () => ({
  default: mockMember
}));

// Import after mocking
const { default: householdService } = await import('../../services/householdService.js');
const { default: householdController } = await import('../../controllers/householdController.js');

describe('Household Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockHousehold.findById.mockResolvedValue({
      _id: '1',
      household_id: 'hh_1'
    });
  });

  describe('getAllHouseholds', () => {
    it('should return households with pagination', async () => {
      const mockHouseholds_data = [{ _id: '1', gn_division: 'Test GN' }];
      mockHousehold.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockHouseholds_data)
          })
        })
      });
      mockHousehold.countDocuments.mockResolvedValue(1);

      const result = await householdService.getAllHouseholds({});
      expect(result.households).toEqual(mockHouseholds_data);
    });
  });

  describe('getHouseholdById', () => {
    it('should return household by ID', async () => {
      const mockHousehold_data = { _id: '1', gn_division: 'Test' };
      mockHousehold.findById.mockResolvedValue(mockHousehold_data);

      const result = await householdService.getHouseholdById('1');
      expect(result).toEqual(mockHousehold_data);
    });

    it('should throw error if not found', async () => {
      mockHousehold.findById.mockResolvedValue(null);
      mockHousehold.findOne.mockResolvedValue(null);
      await expect(householdService.getHouseholdById('invalid')).rejects.toThrow();
    });
  });

  describe('createHousehold', () => {
    it('should create household', async () => {
      const householdData = { gn_division: 'Test GN', district: 'Test' };
      const mockHousehold_data = { _id: '1', ...householdData };

      mockHousehold.mockImplementation(() => ({
        ...mockHousehold_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await householdService.createHousehold(householdData);
      expect(result._id).toBe('1');
    });
  });

  describe('updateHousehold', () => {
    it('should update household', async () => {
      const mockHousehold_data = { _id: '1', gn_division: 'Updated' };
      mockHousehold.findByIdAndUpdate.mockResolvedValue(mockHousehold_data);

      const result = await householdService.updateHousehold('1', { gn_division: 'Updated' });
      expect(result).toEqual(mockHousehold_data);
    });
  });

  describe('deleteHousehold', () => {
    it('should delete household', async () => {
      const mockHousehold_data = { _id: '1', household_id: 'hh_1' };
      mockHousehold.findByIdAndDelete.mockResolvedValue(mockHousehold_data);

      const result = await householdService.deleteHousehold('1');
      expect(result).toEqual(mockHousehold_data);
    });
  });
});

describe('Household Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllHouseholds', () => {
    it('should return households with 200 status', async () => {
      jest.spyOn(householdService, 'getAllHouseholds').mockResolvedValue({});
      await householdController.getAllHouseholds(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getHouseholdById', () => {
    it('should return household by ID', async () => {
      req.params.id = '1';
      jest.spyOn(householdService, 'getHouseholdById').mockResolvedValue({});
      await householdController.getHouseholdById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createHousehold', () => {
    it('should create household with 201 status', async () => {
      jest.spyOn(householdService, 'createHousehold').mockResolvedValue({});
      await householdController.createHousehold(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateHousehold', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(householdService, 'updateHousehold').mockResolvedValue({});
      await householdController.updateHousehold(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteHousehold', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(householdService, 'deleteHousehold').mockResolvedValue({});
      await householdController.deleteHousehold(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
