/**
 * Household Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/Household.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue({ ...data });
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('../../../models/Member.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null)
  })
}));

jest.unstable_mockModule('../../../models/FamilyMember.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
    countDocuments: jest.fn().mockResolvedValue(0),
    deleteMany: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({})
  })
}));

jest.unstable_mockModule('../../../models/FamilyRelationship.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({})
  })
}));

const { default: HouseholdService } = await import('../../../services/householdService.js');
const { default: Household } = await import('../../../models/Household.js');
const { default: FamilyMember } = await import('../../../models/FamilyMember.js');
const { default: FamilyRelationship } = await import('../../../models/FamilyRelationship.js');

// Helper: mock FamilyMember.find to support both .lean() and chained query methods
const mockFamilyMemberFind = (results = []) => {
  FamilyMember.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue(results)
  });
};

// Helper: mock FamilyRelationship.find to support .lean()
const mockFamilyRelationshipFind = (results = []) => {
  FamilyRelationship.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue(results)
  });
};

describe('HouseholdService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: find returns empty lists
    Household.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    Household.countDocuments.mockResolvedValue(0);
    Household.findById.mockResolvedValue(null);
    Household.findOne.mockResolvedValue(null);
    Household.findByIdAndUpdate.mockResolvedValue(null);
    Household.findByIdAndDelete.mockResolvedValue(null);
    mockFamilyMemberFind([]);
    mockFamilyRelationshipFind([]);
  });

  describe('getAllHouseholds', () => {
    it('should retrieve all households with pagination', async () => {
      const mockHouseholds = [{ _id: '1', gn_division: 'Padukka' }];

      Household.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockHouseholds)
      });
      Household.countDocuments.mockResolvedValue(1);

      const result = await HouseholdService.getAllHouseholds({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.households).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getHouseholdById', () => {
    it('should retrieve single household', async () => {
      Household.findById.mockResolvedValue({ _id: 'house-001', household_id: 'HH-001' });

      const result = await HouseholdService.getHouseholdById('house-001');

      expect(result).toBeDefined();
    });
  });

  describe('createHousehold', () => {
    it('should create new household', async () => {
      const householdData = { household_id: 'HH-001', gn_division: 'Padukka' };

      const mockInstance = {
        ...householdData,
        save: jest.fn().mockResolvedValue({ _id: 'new-id', ...householdData }),
        toObject: jest.fn().mockReturnValue({ ...householdData })
      };
      Household.mockImplementation(() => mockInstance);
      // populateHouseholdMembers uses FamilyMember.find().lean() and FamilyRelationship.find().lean()
      mockFamilyMemberFind([]);
      mockFamilyRelationshipFind([]);

      const result = await HouseholdService.createHousehold(householdData);

      expect(result).toBeDefined();
    });
  });

  describe('updateHousehold', () => {
    it('should update household', async () => {
      const mockHousehold = {
        _id: 'house-001',
        household_id: 'HH-001',
        toObject: jest.fn().mockReturnValue({ _id: 'house-001', household_id: 'HH-001' })
      };
      Household.findByIdAndUpdate.mockResolvedValue(mockHousehold);
      mockFamilyMemberFind([]);
      mockFamilyRelationshipFind([]);

      const result = await HouseholdService.updateHousehold('house-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteHousehold', () => {
    it('should delete household', async () => {
      const mockHousehold = { _id: 'house-001', household_id: 'HH-001' };
      Household.findById.mockResolvedValue(mockHousehold);
      Household.findByIdAndDelete.mockResolvedValue(mockHousehold);
      // deleteHousehold calls FamilyMember.find (no .lean()) then deleteMany
      FamilyMember.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
        // deleteHousehold uses: const familyMembers = await FamilyMember.find(...)
        // which should resolve directly in that context
      });
      FamilyMember.find.mockResolvedValue([]);

      const result = await HouseholdService.deleteHousehold('house-001');

      expect(result).toBeDefined();
    });
  });
});
