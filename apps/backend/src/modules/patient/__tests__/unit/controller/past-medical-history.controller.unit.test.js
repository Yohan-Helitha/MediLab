/**
 * Past Medical History Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/pastMedicalHistoryService.js', () => ({
  default: {
    getAllPastMedicalHistories: jest.fn(),
    getPastMedicalHistoryById: jest.fn(),
    createPastMedicalHistory: jest.fn(),
    updatePastMedicalHistory: jest.fn(),
    deletePastMedicalHistory: jest.fn()
  }
}));

const { default: PastMedicalHistoryController } = await import('../../../controllers/pastMedicalHistoryController.js');
const { default: pastMedicalHistoryService } = await import('../../../services/pastMedicalHistoryService.js');

describe('PastMedicalHistoryController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllPastMedicalHistories', () => {
    it('should return all past medical history', async () => {
      req.query = { member_id: 'mem-001' };
      const mockHistory = [{ _id: '1', condition: 'Diabetes' }];

      pastMedicalHistoryService.getAllPastMedicalHistories.mockResolvedValue({ history: mockHistory });

      await PastMedicalHistoryController.getAllPastMedicalHistories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getPastMedicalHistoryById', () => {
    it('should return single medical history record', async () => {
      req.params.id = 'pmh-001';

      pastMedicalHistoryService.getPastMedicalHistoryById.mockResolvedValue({ _id: 'pmh-001' });

      await PastMedicalHistoryController.getPastMedicalHistoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createPastMedicalHistory', () => {
    it('should create new medical history record', async () => {
      req.body = { member_id: 'mem-001', condition: 'Diabetes', status: 'resolved' };

      pastMedicalHistoryService.createPastMedicalHistory.mockResolvedValue({ _id: 'new-id', ...req.body });

      await PastMedicalHistoryController.createPastMedicalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updatePastMedicalHistory', () => {
    it('should update medical history record', async () => {
      req.params.id = 'pmh-001';
      req.body = { status: 'active' };

      pastMedicalHistoryService.updatePastMedicalHistory.mockResolvedValue({ _id: 'pmh-001', ...req.body });

      await PastMedicalHistoryController.updatePastMedicalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deletePastMedicalHistory', () => {
    it('should delete medical history record', async () => {
      req.params.id = 'pmh-001';

      pastMedicalHistoryService.deletePastMedicalHistory.mockResolvedValue(true);

      await PastMedicalHistoryController.deletePastMedicalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
