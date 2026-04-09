/**
 * Family Relationship Module - Service Unit Tests
 * Service methods: getAllFamilyRelationships, getFamilyRelationshipById,
 * createFamilyRelationship, updateFamilyRelationship, deleteFamilyRelationship
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/FamilyRelationship.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    // populate called with array on instance (in createFamilyRelationship)
    this.populate = jest.fn().mockResolvedValue({ ...data, _id: 'new-id' });
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn()
  })
}));

jest.unstable_mockModule('../../../models/FamilyMember.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null)
  })
}));

const { default: FamilyRelationshipService } = await import('../../../services/familyRelationshipService.js');
const { default: FamilyRelationship } = await import('../../../models/FamilyRelationship.js');
const { default: FamilyMember } = await import('../../../models/FamilyMember.js');

// Helper to create a mock with two chained .populate() calls
// Service does: findById(id).populate({...}).populate({...})
const makeDoublePop = (resolveValue) => ({
  populate: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(resolveValue)
  })
});

describe('FamilyRelationshipService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    FamilyRelationship.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    FamilyRelationship.countDocuments.mockResolvedValue(0);
    FamilyRelationship.findById.mockReturnValue(makeDoublePop(null));
    FamilyRelationship.findOne.mockResolvedValue(null);
    FamilyRelationship.findByIdAndUpdate.mockReturnValue(makeDoublePop(null));
    FamilyRelationship.findByIdAndDelete.mockResolvedValue(null);
    FamilyRelationship.findOneAndDelete.mockResolvedValue(null);
    FamilyMember.findOne.mockResolvedValue(null);
  });

  describe('getAllFamilyRelationships', () => {
    it('should retrieve all relationships', async () => {
      const mockRelationships = [{ _id: '1' }];

      FamilyRelationship.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockRelationships)
      });
      FamilyRelationship.countDocuments.mockResolvedValue(1);

      const result = await FamilyRelationshipService.getAllFamilyRelationships({});

      expect(result).toBeDefined();
      expect(result.familyRelationships).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getFamilyRelationshipById', () => {
    it('should retrieve single relationship', async () => {
      // Service: FamilyRelationship.findById(id).populate({...}).populate({...})
      FamilyRelationship.findById.mockReturnValue(makeDoublePop({ _id: 'rel-001' }));

      const result = await FamilyRelationshipService.getFamilyRelationshipById('rel-001');

      expect(result).toBeDefined();
    });
  });

  describe('createFamilyRelationship', () => {
    it('should create new relationship', async () => {
      const relData = {
        family_member1_id: 'mem-001',
        family_member2_id: 'mem-002',
        relationship_type: 'spouse'
      };

      // validateRelationship mocks
      FamilyMember.findOne
        .mockResolvedValueOnce({ family_member_id: 'mem-001', gender: 'Male' })
        .mockResolvedValueOnce({ family_member_id: 'mem-002', gender: 'Female' });
      // No existing relationship
      FamilyRelationship.findOne.mockResolvedValue(null);

      const mockInstance = {
        ...relData,
        save: jest.fn().mockResolvedValue({ _id: 'new-id', ...relData }),
        populate: jest.fn().mockResolvedValue({ _id: 'new-id', ...relData })
      };
      FamilyRelationship.mockImplementation(() => mockInstance);

      const result = await FamilyRelationshipService.createFamilyRelationship(relData);

      expect(result).toBeDefined();
    });
  });

  describe('updateFamilyRelationship', () => {
    it('should update relationship', async () => {
      // Service: FamilyRelationship.findByIdAndUpdate(...).populate({...}).populate({...})
      FamilyRelationship.findByIdAndUpdate.mockReturnValue(makeDoublePop({ _id: 'rel-001' }));

      const result = await FamilyRelationshipService.updateFamilyRelationship('rel-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteFamilyRelationship', () => {
    it('should delete relationship', async () => {
      // deleteFamilyRelationship calls findById first (plain, not chained populate)
      FamilyRelationship.findById.mockResolvedValue({
        _id: 'rel-001',
        family_member1_id: 'mem-001',
        family_member2_id: 'mem-002'
      });
      FamilyRelationship.findOneAndDelete.mockResolvedValue({ _id: 'reciprocal' });
      FamilyRelationship.findByIdAndDelete.mockResolvedValue({ _id: 'rel-001' });

      const result = await FamilyRelationshipService.deleteFamilyRelationship('rel-001');

      expect(result).toBeDefined();
    });
  });
});
