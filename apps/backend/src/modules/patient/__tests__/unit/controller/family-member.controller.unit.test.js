/**
 * Family Member Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/familyMemberService.js', () => ({
  default: {
    getAllFamilyMembers: jest.fn(),
    getFamilyMemberById: jest.fn(),
    createFamilyMember: jest.fn(),
    updateFamilyMember: jest.fn(),
    deleteFamilyMember: jest.fn()
  }
}));

const { default: FamilyMemberController } = await import('../../../controllers/familyMemberController.js');
const { default: familyMemberService } = await import('../../../services/familyMemberService.js');

describe('FamilyMemberController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllFamilyMembers', () => {
    it('should return all family members', async () => {
      req.query = { member_id: 'mem-001' };
      const mockMembers = [
        { _id: '1', name: 'Jane Doe', relationship: 'Spouse' }
      ];

      familyMemberService.getAllFamilyMembers.mockResolvedValue({ members: mockMembers });

      await FamilyMemberController.getAllFamilyMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getFamilyMemberById', () => {
    it('should return single family member', async () => {
      req.params.id = 'member-001';

      familyMemberService.getFamilyMemberById.mockResolvedValue({ _id: 'member-001' });

      await FamilyMemberController.getFamilyMemberById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createFamilyMember', () => {
    it('should create new family member', async () => {
      req.body = { member_id: 'mem-001', name: 'Jane Doe' };

      familyMemberService.createFamilyMember.mockResolvedValue({ _id: 'new-id', ...req.body });

      await FamilyMemberController.createFamilyMember(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateFamilyMember', () => {
    it('should update family member', async () => {
      req.params.id = 'member-001';
      req.body = { occupation: 'Engineer' };

      familyMemberService.updateFamilyMember.mockResolvedValue({ _id: 'member-001', ...req.body });

      await FamilyMemberController.updateFamilyMember(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteFamilyMember', () => {
    it('should delete family member', async () => {
      req.params.id = 'member-001';

      familyMemberService.deleteFamilyMember.mockResolvedValue(true);

      await FamilyMemberController.deleteFamilyMember(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
