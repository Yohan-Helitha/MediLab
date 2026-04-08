/**
 * Medication Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/medicationService.js', () => ({
  default: {
    getAllMedications: jest.fn(),
    getMedicationById: jest.fn(),
    createMedication: jest.fn(),
    updateMedication: jest.fn(),
    deleteMedication: jest.fn()
  }
}));

const { default: MedicationController } = await import('../../../controllers/medicationController.js');
const { default: medicationService } = await import('../../../services/medicationService.js');

describe('MedicationController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllMedications', () => {
    it('should return all medications', async () => {
      req.query = { member_id: 'mem-001' };
      const mockMeds = [{ _id: '1', medication_name: 'Aspirin' }];

      medicationService.getAllMedications.mockResolvedValue({ medications: mockMeds });

      await MedicationController.getAllMedications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMedicationById', () => {
    it('should return single medication', async () => {
      req.params.id = 'med-001';

      medicationService.getMedicationById.mockResolvedValue({ _id: 'med-001' });

      await MedicationController.getMedicationById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createMedication', () => {
    it('should create new medication', async () => {
      req.body = { member_id: 'mem-001', medication_name: 'Aspirin', dosage: '500mg' };

      medicationService.createMedication.mockResolvedValue({ _id: 'new-id', ...req.body });

      await MedicationController.createMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateMedication', () => {
    it('should update medication', async () => {
      req.params.id = 'med-001';
      req.body = { dosage: '250mg' };

      medicationService.updateMedication.mockResolvedValue({ _id: 'med-001', ...req.body });

      await MedicationController.updateMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMedication', () => {
    it('should delete medication', async () => {
      req.params.id = 'med-001';

      medicationService.deleteMedication.mockResolvedValue(true);

      await MedicationController.deleteMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
