/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/member.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock mongoose before importing services
jest.unstable_mockModule('mongoose', () => {
  const mockFindOne = jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(null)
  });
  
  return {
    default: {
      model: jest.fn().mockImplementation((modelName) => ({
        findOne: mockFindOne,
        deleteMany: jest.fn().mockResolvedValue({}),
        updateOne: jest.fn().mockResolvedValue({}),
        models: {}
      })),
      models: {}
    }
  };
});

// Mock the Member model before importing dependent modules
const mockMember = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockMember.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  })
});

mockMember.findById = jest.fn().mockImplementation(() => {
  const promise = Promise.resolve({
    _id: '1',
    full_name: 'John Doe'
  });
  promise.lean = jest.fn().mockResolvedValue({
    _id: '1',
    full_name: 'John Doe'
  });
  return promise;
});
mockMember.findByIdAndUpdate = jest.fn();
mockMember.findByIdAndDelete = jest.fn();
mockMember.countDocuments = jest.fn();
mockMember.findOne = jest.fn();

jest.unstable_mockModule('../../models/Member.js', () => ({
  default: mockMember
}));

// Import after mocking
const { default: memberService } = await import('../../services/memberService.js');
const { default: memberController } = await import('../../controllers/memberController.js');

describe('Member Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockMember.findById.mockImplementation(() => {
      const promise = Promise.resolve({
        _id: '1',
        full_name: 'John Doe'
      });
      promise.lean = jest.fn().mockResolvedValue({
        _id: '1',
        full_name: 'John Doe'
      });
      return promise;
    });
  });

  describe('getAllMembers', () => {
    it('should return members with pagination', async () => {
      const mockMembers = [{ _id: '1', full_name: 'John Doe' }];
      mockMember.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockMembers)
          })
        })
      });
      mockMember.countDocuments.mockResolvedValue(1);

      const result = await memberService.getAllMembers({});
      expect(result.members).toEqual(mockMembers);
    });
  });

  describe('getMemberById', () => {
    it('should return member by ID', async () => {
      const mockMember_data = { _id: '1', full_name: 'John Doe' };
      mockMember.findById.mockImplementation(() => {
        const promise = Promise.resolve(mockMember_data);
        promise.lean = jest.fn().mockResolvedValue(mockMember_data);
        return promise;
      });

      const result = await memberService.getMemberById('1');
      expect(result._id).toBe(mockMember_data._id);
      expect(result.full_name).toBe(mockMember_data.full_name);
      // Service adds health_info and medical_history from other models
      expect(result.health_info).toBeDefined();
      expect(result.medical_history).toBeDefined();
    });

    it('should throw error if not found', async () => {
      mockMember.findById.mockImplementation(() => {
        const promise = Promise.resolve(null);
        promise.lean = jest.fn().mockResolvedValue(null);
        return promise;
      });
      await expect(memberService.getMemberById('invalid')).rejects.toThrow();
    });
  });

  describe('createMember', () => {
    it('should create member', async () => {
      const memberData = { full_name: 'Jane Doe', email: 'jane@example.com' };
      const mockMember_data = { _id: '1', ...memberData };

      mockMember.mockImplementation(() => ({
        ...mockMember_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await memberService.createMember(memberData);
      expect(result._id).toBe(mockMember_data._id);
      expect(result.full_name).toBe(memberData.full_name);
      expect(result.email).toBe(memberData.email);
    });
  });

  describe('updateMember', () => {
    it('should update member', async () => {
      const mockMember_data = { _id: '1', full_name: 'John Updated' };
      mockMember.findByIdAndUpdate.mockResolvedValue(mockMember_data);

      const result = await memberService.updateMember('1', { full_name: 'John Updated' });
      expect(result).toEqual(mockMember_data);
    });
  });

  describe('deleteMember', () => {
    it('should delete member', async () => {
      const mockMember_data = { _id: '1', full_name: 'John Doe' };
      
      // Mock findById to return proper chain with lean()
      mockMember.findById.mockImplementation(() => {
        const promise = Promise.resolve(mockMember_data);
        promise.lean = jest.fn().mockResolvedValue(mockMember_data);
        return promise;
      });

      mockMember.findByIdAndDelete.mockResolvedValue(mockMember_data);

      const result = await memberService.deleteMember('1');
      expect(result._id).toBe(mockMember_data._id);
      expect(result.full_name).toBe(mockMember_data.full_name);
    });
  });
});

describe('Member Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllMembers', () => {
    it('should return members with 200 status', async () => {
      jest.spyOn(memberService, 'getAllMembers').mockResolvedValue({});
      await memberController.getAllMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMemberById', () => {
    it('should return member by ID', async () => {
      req.params.id = '1';
      jest.spyOn(memberService, 'getMemberById').mockResolvedValue({});
      await memberController.getMemberById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createMember', () => {
    it('should create member with 201 status', async () => {
      jest.spyOn(memberService, 'createMember').mockResolvedValue({});
      await memberController.createMember(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateMember', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(memberService, 'updateMember').mockResolvedValue({});
      await memberController.updateMember(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMember', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(memberService, 'deleteMember').mockResolvedValue({});
      await memberController.deleteMember(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
