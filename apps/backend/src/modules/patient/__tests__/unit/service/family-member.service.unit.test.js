/**
 * Family Member Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/FamilyMember.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this.populate = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('../../../models/Household.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null)
  })
}));

const { default: FamilyMemberService } = await import('../../../services/familyMemberService.js');
const { default: FamilyMember } = await import('../../../models/FamilyMember.js');

describe('FamilyMemberService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    FamilyMember.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    FamilyMember.countDocuments.mockResolvedValue(0);
    FamilyMember.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });
    FamilyMember.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });
    FamilyMember.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllFamilyMembers', () => {
    it('should retrieve all family members', async () => {
      const memberId = 'mem-001';
      const mockMembers = [{ _id: '1', member_id: memberId }];

      FamilyMember.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMembers)
      });
      FamilyMember.countDocuments.mockResolvedValue(1);

      const result = await FamilyMemberService.getAllFamilyMembers({ member_id: memberId });

      expect(result).toBeDefined();
      expect(result.familyMembers).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getFamilyMemberById', () => {
    it('should retrieve single family member', async () => {
      FamilyMember.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'member-001' })
      });

      const result = await FamilyMemberService.getFamilyMemberById('member-001');

      expect(result).toBeDefined();
    });
  });

  describe('createFamilyMember', () => {
    it('should create new family member', async () => {
      const memberData = { household_id: 'HH-001', full_name: 'Jane Doe', gender: 'Female', date_of_birth: '1990-01-01' };

      const mockInstance = {
        ...memberData,
        save: jest.fn().mockResolvedValue({ _id: 'new-id', ...memberData }),
        populate: jest.fn().mockResolvedValue({ _id: 'new-id', ...memberData })
      };
      FamilyMember.mockImplementation(() => mockInstance);

      const result = await FamilyMemberService.createFamilyMember(memberData);

      expect(result).toBeDefined();
    });
  });

  describe('updateFamilyMember', () => {
    it('should update family member', async () => {
      FamilyMember.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'member-001' })
      });

      const result = await FamilyMemberService.updateFamilyMember('member-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteFamilyMember', () => {
    it('should delete family member', async () => {
      FamilyMember.findByIdAndDelete.mockResolvedValue({ _id: 'member-001' });

      const result = await FamilyMemberService.deleteFamilyMember('member-001');

      expect(result).toBeDefined();
    });
  });
});
