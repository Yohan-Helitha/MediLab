/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/allergy.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';

// Mock the Allergy model before importing dependent modules
const mockAllergy = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockAllergy.find = jest.fn();
mockAllergy.findById = jest.fn();
mockAllergy.findByIdAndUpdate = jest.fn();
mockAllergy.findByIdAndDelete = jest.fn();
mockAllergy.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/Allergy.js', () => ({
  default: mockAllergy
}));

// Import after mocking
const { default: allergyService } = await import('../../services/allergyService.js');
const { default: allergyController } = await import('../../controllers/allergyController.js');

describe('Allergy Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAllergies', () => {
    it('should return allergies with pagination', async () => {
      const mockAllergies = [
        { _id: '1', allergen_name: 'Peanuts', severity: 'Severe' }
      ];

      mockAllergy.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockAllergies)
          })
        })
      });

      mockAllergy.countDocuments.mockResolvedValue(1);

      const result = await allergyService.getAllAllergies({ page: 1, limit: 10 });

      expect(result.allergies).toEqual(mockAllergies);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle default pagination values', async () => {
      mockAllergy.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      mockAllergy.countDocuments.mockResolvedValue(0);

      await allergyService.getAllAllergies({});

      expect(mockAllergy.find).toHaveBeenCalled();
    });

    it('should apply filters to query', async () => {
      const filter = { severity: 'Severe' };
      
      mockAllergy.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      mockAllergy.countDocuments.mockResolvedValue(0);

      await allergyService.getAllAllergies(filter);

      expect(mockAllergy.find).toHaveBeenCalledWith(filter);
    });
  });

  describe('getAllergyById', () => {
    it('should return an allergy by ID', async () => {
      const mockAllergy_data = { _id: '1', allergen_name: 'Peanuts' };
      mockAllergy.findById.mockResolvedValue(mockAllergy_data);

      const result = await allergyService.getAllergyById('1');

      expect(result).toEqual(mockAllergy_data);
      expect(mockAllergy.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if allergy not found', async () => {
      mockAllergy.findById.mockResolvedValue(null);

      await expect(allergyService.getAllergyById('invalid-id')).rejects.toThrow('Allergy not found');
    });
  });

  describe('createAllergy', () => {
    it('should create a new allergy', async () => {
      const allergyData = {
        member_id: '123',
        allergen_name: 'Shellfish',
        severity: 'Moderate'
      };

      const mockAllergy_data = { _id: '1', ...allergyData, save: jest.fn().mockResolvedValue(null) };
      
      mockAllergy.mockImplementation(() => mockAllergy_data);

      const result = await allergyService.createAllergy(allergyData);

      expect(result._id).toBe('1');
    });

    it('should handle creation errors', async () => {
      mockAllergy.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(allergyService.createAllergy({})).rejects.toThrow('Database error');
    });
  });

  describe('updateAllergy', () => {
    it('should update an allergy', async () => {
      const updateData = { severity: 'Critical' };
      const mockAllergy_data = { _id: '1', allergen_name: 'Peanuts', severity: 'Critical' };

      mockAllergy.findByIdAndUpdate.mockResolvedValue(mockAllergy_data);

      const result = await allergyService.updateAllergy('1', updateData);

      expect(result).toEqual(mockAllergy_data);
      expect(mockAllergy.findByIdAndUpdate).toHaveBeenCalledWith('1', updateData, {
        new: true,
        runValidators: true
      });
    });

    it('should throw error if allergy not found for update', async () => {
      mockAllergy.findByIdAndUpdate.mockResolvedValue(null);

      await expect(allergyService.updateAllergy('invalid-id', {})).rejects.toThrow(
        'Allergy not found'
      );
    });
  });

  describe('deleteAllergy', () => {
    it('should delete an allergy', async () => {
      const mockAllergy_data = { _id: '1', allergen_name: 'Peanuts' };
      mockAllergy.findByIdAndDelete.mockResolvedValue(mockAllergy_data);

      const result = await allergyService.deleteAllergy('1');

      expect(result).toEqual(mockAllergy_data);
      expect(mockAllergy.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw error if allergy not found for deletion', async () => {
      mockAllergy.findByIdAndDelete.mockResolvedValue(null);

      await expect(allergyService.deleteAllergy('invalid-id')).rejects.toThrow(
        'Allergy not found'
      );
    });
  });
});

describe('Allergy Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllAllergies', () => {
    it('should return all allergies with 200 status', async () => {
      const mockData = {
        allergies: [{ _id: '1', allergen_name: 'Peanuts' }],
        pagination: { page: 1, total: 1 }
      };

      jest.spyOn(allergyService, 'getAllAllergies').mockResolvedValue(mockData);

      await allergyController.getAllAllergies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      jest.spyOn(allergyService, 'getAllAllergies').mockRejectedValue(error);

      await allergyController.getAllAllergies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('getAllergyById', () => {
    it('should return allergy by ID with 200 status', async () => {
      const mockAllergy = { _id: '1', allergen_name: 'Peanuts' };
      req.params.id = '1';

      jest.spyOn(allergyService, 'getAllergyById').mockResolvedValue(mockAllergy);

      await allergyController.getAllergyById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAllergy
      });
    });

    it('should return 404 if allergy not found', async () => {
      req.params.id = 'invalid-id';

      jest.spyOn(allergyService, 'getAllergyById').mockRejectedValue(
        new Error('Allergy not found')
      );

      await allergyController.getAllergyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Allergy not found'
      });
    });
  });

  describe('createAllergy', () => {
    it('should create allergy with 201 status', async () => {
      const allergyData = { allergen_name: 'Shellfish', severity: 'Moderate' };
      req.body = allergyData;
      const createdAllergy = { _id: '1', ...allergyData };

      jest.spyOn(allergyService, 'createAllergy').mockResolvedValue(createdAllergy);

      await allergyController.createAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdAllergy
      });
    });

    it('should return 400 for invalid data', async () => {
      req.body = { invalid: 'data' };

      jest.spyOn(allergyService, 'createAllergy').mockRejectedValue(
        new Error('Validation error')
      );

      await allergyController.createAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error'
      });
    });
  });

  describe('updateAllergy', () => {
    it('should update allergy with 200 status', async () => {
      const updateData = { severity: 'Critical' };
      req.params.id = '1';
      req.body = updateData;
      const updatedAllergy = { _id: '1', allergen_name: 'Peanuts', ...updateData };

      jest.spyOn(allergyService, 'updateAllergy').mockResolvedValue(updatedAllergy);

      await allergyController.updateAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAllergy
      });
    });

    it('should return 404 if allergy not found', async () => {
      req.params.id = 'invalid-id';

      jest.spyOn(allergyService, 'updateAllergy').mockRejectedValue(
        new Error('Allergy not found')
      );

      await allergyController.updateAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteAllergy', () => {
    it('should delete allergy with 200 status', async () => {
      req.params.id = '1';

      jest.spyOn(allergyService, 'deleteAllergy').mockResolvedValue({});

      await allergyController.deleteAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Allergy deleted successfully'
      });
    });

    it('should return 404 if allergy not found', async () => {
      req.params.id = 'invalid-id';

      jest.spyOn(allergyService, 'deleteAllergy').mockRejectedValue(
        new Error('Allergy not found')
      );

      await allergyController.deleteAllergy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
