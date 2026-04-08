/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/medication.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the Medication model before importing dependent modules
const mockMedication = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null)
}));

mockMedication.find = jest.fn().mockReturnValue({
  skip: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  })
});

mockMedication.findById = jest.fn().mockResolvedValue({
  _id: '1',
  medication_name: 'Aspirin'
});
mockMedication.findByIdAndUpdate = jest.fn();
mockMedication.findByIdAndDelete = jest.fn();
mockMedication.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/Medication.js', () => ({
  default: mockMedication
}));

// Import after mocking
const { default: medicationService } = await import('../../services/medicationService.js');
const { default: medicationController } = await import('../../controllers/medicationController.js');

describe('Medication Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockMedication.findById.mockResolvedValue({
      _id: '1',
      medication_name: 'Aspirin'
    });
  });

  describe('getAllMedications', () => {
    it('should return medications with pagination', async () => {
      const mockMedications = [{ _id: '1', medication_name: 'Aspirin' }];
      mockMedication.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockMedications)
          })
        })
      });
      mockMedication.countDocuments.mockResolvedValue(1);

      const result = await medicationService.getAllMedications({});
      expect(result.medications).toEqual(mockMedications);
    });
  });

  describe('getMedicationById', () => {
    it('should return medication by ID', async () => {
      const mockMedication_data = { _id: '1', medication_name: 'Aspirin' };
      mockMedication.findById.mockResolvedValue(mockMedication_data);

      const result = await medicationService.getMedicationById('1');
      expect(result).toEqual(mockMedication_data);
    });

    it('should throw error if not found', async () => {
      mockMedication.findById.mockResolvedValue(null);
      await expect(medicationService.getMedicationById('invalid')).rejects.toThrow();
    });
  });

  describe('createMedication', () => {
    it('should create medication', async () => {
      const medicationData = { medication_name: 'Ibuprofen', dosage: '200mg' };
      const mockMedication_data = { _id: '1', ...medicationData };

      mockMedication.mockImplementation(() => ({
        ...mockMedication_data,
        save: jest.fn().mockResolvedValue(null)
      }));

      const result = await medicationService.createMedication(medicationData);
      expect(result._id).toBe(mockMedication_data._id);
      expect(result.medication_name).toBe(medicationData.medication_name);
      expect(result.dosage).toBe(medicationData.dosage);
    });
  });

  describe('updateMedication', () => {
    it('should update medication', async () => {
      const mockMedication_data = { _id: '1', frequency: 'Once daily' };
      mockMedication.findByIdAndUpdate.mockResolvedValue(mockMedication_data);

      const result = await medicationService.updateMedication('1', { frequency: 'Once daily' });
      expect(result).toEqual(mockMedication_data);
    });
  });

  describe('deleteMedication', () => {
    it('should delete medication', async () => {
      const mockMedication_data = { _id: '1' };
      mockMedication.findByIdAndDelete.mockResolvedValue(mockMedication_data);

      const result = await medicationService.deleteMedication('1');
      expect(result).toEqual(mockMedication_data);
    });
  });
});

describe('Medication Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllMedications', () => {
    it('should return medications with 200 status', async () => {
      jest.spyOn(medicationService, 'getAllMedications').mockResolvedValue({});
      await medicationController.getAllMedications(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMedicationById', () => {
    it('should return medication by ID', async () => {
      req.params.id = '1';
      jest.spyOn(medicationService, 'getMedicationById').mockResolvedValue({});
      await medicationController.getMedicationById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createMedication', () => {
    it('should create medication with 201 status', async () => {
      jest.spyOn(medicationService, 'createMedication').mockResolvedValue({});
      await medicationController.createMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateMedication', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(medicationService, 'updateMedication').mockResolvedValue({});
      await medicationController.updateMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMedication', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(medicationService, 'deleteMedication').mockResolvedValue({});
      await medicationController.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
