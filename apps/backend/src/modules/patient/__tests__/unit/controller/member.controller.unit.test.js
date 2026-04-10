/**
 * Patient Module - Member Controller Unit Tests
 * Tests for patient member management endpoints
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/memberService.js', () => ({
  default: {
    getAllMembers: jest.fn(),
    getMemberById: jest.fn(),
    createMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn()
  }
}));

const { default: MemberController } = await import('../../../controllers/memberController.js');
const { default: memberService } = await import('../../../services/memberService.js');

describe('MemberController - Unit Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getAllMembers', () => {
    it('should return all members with pagination info', async () => {
      req.query = { page: 1, limit: 10 };

      const mockMembers = [
        {
          _id: '1',
          member_id: 'MEM-001',
          full_name: 'John Doe',
          email: 'john@example.com'
        },
        {
          _id: '2',
          member_id: 'MEM-002',
          full_name: 'Jane Doe',
          email: 'jane@example.com'
        }
      ];

      const mockResult = {
        members: mockMembers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      };

      memberService.getAllMembers.mockResolvedValue(mockResult);

      await MemberController.getAllMembers(req, res);

      expect(memberService.getAllMembers).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Database error';
      memberService.getAllMembers.mockRejectedValue(new Error(errorMessage));

      await MemberController.getAllMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    it('should apply pagination correctly', async () => {
      req.query = { page: 2, limit: 5 };

      const mockResult = {
        members: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          pages: 3
        }
      };

      memberService.getAllMembers.mockResolvedValue(mockResult);

      await MemberController.getAllMembers(req, res);

      expect(memberService.getAllMembers).toHaveBeenCalledWith(req.query);
    });
  });

  describe('getMemberById', () => {
    it('should return a specific member with health and medical info', async () => {
      req.params.id = 'MEM-001';

      const mockMember = {
        _id: 'MEM-001',
        member_id: 'MEM-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        health_info: {
          blood_type: 'O+',
          height: 180
        },
        medical_history: {
          conditions: ['Diabetes']
        }
      };

      memberService.getMemberById.mockResolvedValue(mockMember);

      await MemberController.getMemberById(req, res);

      expect(memberService.getMemberById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMember
      });
    });

    it('should return 404 if member not found', async () => {
      req.params.id = 'invalid-id';

      memberService.getMemberById.mockRejectedValue(new Error('Member not found'));

      await MemberController.getMemberById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Member not found'
      });
    });

    it('should return 500 on unexpected error', async () => {
      req.params.id = 'MEM-001';
      const errorMessage = 'Unexpected database error';

      memberService.getMemberById.mockRejectedValue(new Error(errorMessage));

      await MemberController.getMemberById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createMember', () => {
    it('should create a new member successfully', async () => {
      req.body = {
        full_name: 'New Member',
        email: 'newmember@example.com',
        contact_number: '0712345678',
        nic: '123456789V'
      };
      req.file = null;

      const mockCreatedMember = {
        _id: 'new-id',
        member_id: 'MEM-003',
        ...req.body
      };

      memberService.createMember.mockResolvedValue(mockCreatedMember);

      await MemberController.createMember(req, res);

      expect(memberService.createMember).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedMember
      });
    });

    it('should handle file upload for member photo', async () => {
      req.body = {
        full_name: 'New Member',
        email: 'newmember@example.com'
      };
      req.file = { filename: 'photo.jpg' };

      const mockCreatedMember = {
        _id: 'new-id',
        ...req.body,
        photo: '/uploads/profiles/photo.jpg'
      };

      memberService.createMember.mockResolvedValue(mockCreatedMember);

      await MemberController.createMember(req, res);

      const capturedData = memberService.createMember.mock.calls[0][0];
      expect(capturedData.photo).toBe('/uploads/profiles/photo.jpg');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 on validation error', async () => {
      req.body = { email: 'invalid-email' };
      const errorMessage = 'Invalid member data';

      memberService.createMember.mockRejectedValue(new Error(errorMessage));

      await MemberController.createMember(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('updateMember', () => {
    it('should update member successfully', async () => {
      req.params.id = 'MEM-001';
      req.body = {
        full_name: 'Updated Name',
        email: 'updated@example.com'
      };
      req.file = null;

      const mockUpdatedMember = {
        _id: 'MEM-001',
        member_id: 'MEM-001',
        ...req.body
      };

      memberService.updateMember.mockResolvedValue(mockUpdatedMember);

      await MemberController.updateMember(req, res);

      expect(memberService.updateMember).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedMember
      });
    });

    it('should handle file upload during update', async () => {
      req.params.id = 'MEM-001';
      req.body = { full_name: 'Updated Name' };
      req.file = { filename: 'newphoto.jpg' };

      const mockUpdatedMember = {
        _id: 'MEM-001',
        ...req.body,
        photo: '/uploads/profiles/newphoto.jpg'
      };

      memberService.updateMember.mockResolvedValue(mockUpdatedMember);

      await MemberController.updateMember(req, res);

      const capturedData = memberService.updateMember.mock.calls[0][1];
      expect(capturedData.photo).toBe('/uploads/profiles/newphoto.jpg');
    });

    it('should return 404 if member not found', async () => {
      req.params.id = 'invalid-id';
      req.body = { full_name: 'Updated Name' };

      memberService.updateMember.mockRejectedValue(new Error('Member not found'));

      await MemberController.updateMember(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 on validation error', async () => {
      req.params.id = 'MEM-001';
      req.body = { nic: '999999999V' };

      memberService.updateMember.mockRejectedValue(
        new Error('NIC is already registered to another member')
      );

      await MemberController.updateMember(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteMember', () => {
    it('should delete member successfully', async () => {
      req.params.id = 'MEM-001';

      memberService.deleteMember.mockResolvedValue(true);

      await MemberController.deleteMember(req, res);

      expect(memberService.deleteMember).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Member deleted successfully'
      });
    });

    it('should return 404 if member not found', async () => {
      req.params.id = 'invalid-id';

      memberService.deleteMember.mockRejectedValue(new Error('Member not found'));

      await MemberController.deleteMember(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Member not found'
      });
    });

    it('should return 500 on unexpected error', async () => {
      req.params.id = 'MEM-001';
      const errorMessage = 'Internal server error';

      memberService.deleteMember.mockRejectedValue(new Error(errorMessage));

      await MemberController.deleteMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
