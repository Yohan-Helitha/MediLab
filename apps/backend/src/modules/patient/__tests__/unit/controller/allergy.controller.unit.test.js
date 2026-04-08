/**
 * Allergy Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/allergyService.js', () => ({
  default: {
    getAllAllergies: jest.fn(),
    getAllergyById: jest.fn(),
    createAllergy: jest.fn(),
    updateAllergy: jest.fn(),
    deleteAllergy: jest.fn()
  }
}));

const { default: AllergyController } = await import('../../../controllers/allergyController.js');
const { default: allergyService } = await import('../../../services/allergyService.js');

describe('AllergyController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user-123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getAllAllergies', () => {
    it('should return all allergies for a member', async () => {
      req.query = { member_id: 'mem-001' };
      const mockAllergies = [
        { _id: '1', allergen: 'Penicillin', severity: 'High' },
        { _id: '2', allergen: 'Peanuts', severity: 'Medium' }
      ];

      allergyService.getAllAllergies.mockResolvedValue({ allergies: mockAllergies });

      await AllergyController.getAllAllergies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { allergies: mockAllergies } });
    });

    it('should handle errors', async () => {
      allergyService.getAllAllergies.mockRejectedValue(new Error('Database error'));

      await AllergyController.getAllAllergies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllergyById', () => {
    it('should return single allergy', async () => {
      req.params.id = 'allergy-001';
      const mockAllergy = { _id: 'allergy-001', allergen: 'Penicillin' };

      allergyService.getAllergyById.mockResolvedValue(mockAllergy);

      await AllergyController.getAllergyById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if allergy not found', async () => {
      req.params.id = 'invalid';
      allergyService.getAllergyById.mockRejectedValue(new Error('Allergy not found'));

      await AllergyController.getAllergyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createAllergy', () => {
    it('should create new allergy', async () => {
      req.body = { member_id: 'mem-001', allergen: 'Shellfish', severity: 'High' };
      const mockAllergy = { _id: 'new-id', ...req.body };

      allergyService.createAllergy.mockResolvedValue(mockAllergy);

      await AllergyController.createAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateAllergy', () => {
    it('should update allergy', async () => {
      req.params.id = 'allergy-001';
      req.body = { severity: 'Moderate' };
      const mockAllergy = { _id: 'allergy-001', ...req.body };

      allergyService.updateAllergy.mockResolvedValue(mockAllergy);

      await AllergyController.updateAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteAllergy', () => {
    it('should delete allergy', async () => {
      req.params.id = 'allergy-001';

      allergyService.deleteAllergy.mockResolvedValue(true);

      await AllergyController.deleteAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Allergy deleted successfully'
      });
    });
  });
});
