/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/family-member.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the FamilyMember model before importing dependent modules
const mockFamilyMember = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null),
  populate: jest.fn().mockReturnThis()
}));

mockFamilyMember.find = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
});

mockFamilyMember.findById = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(null)
});

mockFamilyMember.findByIdAndUpdate = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(null)
});

mockFamilyMember.findOneAndUpdate = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(null)
});

mockFamilyMember.findByIdAndDelete = jest.fn();
mockFamilyMember.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/FamilyMember.js', () => ({
  default: mockFamilyMember
}));

// Import after mocking
const { default: familyMemberService } = await import('../../services/familyMemberService.js');
const { default: familyMemberController } = await import('../../controllers/familyMemberController.js');

describe('Family Member Service Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllFamilyMembers', () => {
    it('should return family members with pagination', async () => {
      const mockMembers = [{ _id: '1', full_name: 'Jane' }];
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMembers)
      };
      mockFamilyMember.find.mockReturnValue(mockChain);
      mockFamilyMember.countDocuments.mockResolvedValue(1);

      const result = await familyMemberService.getAllFamilyMembers({});
      expect(result.familyMembers).toEqual(mockMembers);
    });
  });

  describe('getFamilyMemberById', () => {
    it('should return member by ID', async () => {
      const mockMember_data = { _id: '1', full_name: 'Jane' };
      mockFamilyMember.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMember_data)
      });

      const result = await familyMemberService.getFamilyMemberById('1');
      expect(result).toEqual(mockMember_data);
    });

    it('should throw error if not found', async () => {
      mockFamilyMember.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await expect(familyMemberService.getFamilyMemberById('invalid')).rejects.toThrow();
    });
  });

  describe('createFamilyMember', () => {
    it('should create member', async () => {
      const memberData = { full_name: 'Jane', gender: 'Female' };
      const mockMember_data = { _id: '1', ...memberData };

      mockFamilyMember.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockResolvedValue(mockMember_data)
      }));

      const result = await familyMemberService.createFamilyMember(memberData);
      expect(result).toEqual(mockMember_data);
    });
  });

  describe('updateFamilyMember', () => {
    it('should update member', async () => {
      const mockMember_data = { _id: '1', full_name: 'Jane Updated' };
      mockFamilyMember.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMember_data)
      });

      const result = await familyMemberService.updateFamilyMember('1', { full_name: 'Jane Updated' });
      expect(result).toEqual(mockMember_data);
    });
  });

  describe('deleteFamilyMember', () => {
    it('should delete member', async () => {
      const mockMember_data = { _id: '1' };
      mockFamilyMember.findByIdAndDelete.mockResolvedValue(mockMember_data);

      const result = await familyMemberService.deleteFamilyMember('1');
      expect(result).toEqual(mockMember_data);
    });
  });
});

describe('Family Member Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllFamilyMembers', () => {
    it('should return members with 200 status', async () => {
      jest.spyOn(familyMemberService, 'getAllFamilyMembers').mockResolvedValue({});
      await familyMemberController.getAllFamilyMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getFamilyMemberById', () => {
    it('should return member by ID', async () => {
      req.params.id = '1';
      jest.spyOn(familyMemberService, 'getFamilyMemberById').mockResolvedValue({});
      await familyMemberController.getFamilyMemberById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createFamilyMember', () => {
    it('should create member with 201 status', async () => {
      jest.spyOn(familyMemberService, 'createFamilyMember').mockResolvedValue({});
      await familyMemberController.createFamilyMember(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateFamilyMember', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(familyMemberService, 'updateFamilyMember').mockResolvedValue({});
      await familyMemberController.updateFamilyMember(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteFamilyMember', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(familyMemberService, 'deleteFamilyMember').mockResolvedValue({});
      await familyMemberController.deleteFamilyMember(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
