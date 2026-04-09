/**
 * Family Relationship Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/familyRelationshipService.js', () => ({
  default: {
    getAllFamilyRelationships: jest.fn(),
    getFamilyRelationshipById: jest.fn(),
    createFamilyRelationship: jest.fn(),
    updateFamilyRelationship: jest.fn(),
    deleteFamilyRelationship: jest.fn()
  }
}));

const { default: FamilyRelationshipController } = await import('../../../controllers/familyRelationshipController.js');
const { default: familyRelationshipService } = await import('../../../services/familyRelationshipService.js');

describe('FamilyRelationshipController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllFamilyRelationships', () => {
    it('should return all relationships', async () => {
      const mockRelationships = [{ _id: '1', relationship_type: 'Spouse' }];

      familyRelationshipService.getAllFamilyRelationships.mockResolvedValue({ relationships: mockRelationships });

      await FamilyRelationshipController.getAllFamilyRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getFamilyRelationshipById', () => {
    it('should return single relationship', async () => {
      req.params.id = 'rel-001';

      familyRelationshipService.getFamilyRelationshipById.mockResolvedValue({ _id: 'rel-001' });

      await FamilyRelationshipController.getFamilyRelationshipById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createFamilyRelationship', () => {
    it('should create new relationship', async () => {
      req.body = { member_id: 'mem-001', related_member_id: 'mem-002', relationship_type: 'Spouse' };

      familyRelationshipService.createFamilyRelationship.mockResolvedValue({ _id: 'new-id', ...req.body });

      await FamilyRelationshipController.createFamilyRelationship(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateFamilyRelationship', () => {
    it('should update relationship', async () => {
      req.params.id = 'rel-001';
      req.body = { status: 'Inactive' };

      familyRelationshipService.updateFamilyRelationship.mockResolvedValue({ _id: 'rel-001', ...req.body });

      await FamilyRelationshipController.updateFamilyRelationship(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteFamilyRelationship', () => {
    it('should delete relationship', async () => {
      req.params.id = 'rel-001';

      familyRelationshipService.deleteFamilyRelationship.mockResolvedValue({ success: true });

      await FamilyRelationshipController.deleteFamilyRelationship(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
