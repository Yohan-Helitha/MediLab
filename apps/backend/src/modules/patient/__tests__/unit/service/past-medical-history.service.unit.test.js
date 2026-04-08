/**
 * Past Medical History Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/PastMedicalHistory.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  })
}));

const { default: PastMedicalHistoryService } = await import('../../../services/pastMedicalHistoryService.js');
const { default: PastMedicalHistory } = await import('../../../models/PastMedicalHistory.js');

describe('PastMedicalHistoryService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PastMedicalHistory.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    PastMedicalHistory.countDocuments.mockResolvedValue(0);
    PastMedicalHistory.findById.mockResolvedValue(null);
    PastMedicalHistory.findByIdAndUpdate.mockResolvedValue(null);
    PastMedicalHistory.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllPastMedicalHistories', () => {
    it('should retrieve all medical history records', async () => {
      const memberId = 'mem-001';
      const mockHistory = [{ _id: '1', member_id: memberId }];

      PastMedicalHistory.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockHistory)
      });
      PastMedicalHistory.countDocuments.mockResolvedValue(1);

      const result = await PastMedicalHistoryService.getAllPastMedicalHistories({ member_id: memberId });

      expect(result).toBeDefined();
      expect(result.pastMedicalHistories).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getPastMedicalHistoryById', () => {
    it('should retrieve single medical history record', async () => {
      PastMedicalHistory.findById.mockResolvedValue({ _id: 'pmh-001' });

      const result = await PastMedicalHistoryService.getPastMedicalHistoryById('pmh-001');

      expect(result).toBeDefined();
    });
  });

  describe('createPastMedicalHistory', () => {
    it('should create new medical history record', async () => {
      const pmhData = { member_id: 'mem-001', condition: 'Diabetes' };

      const mockInstance = { ...pmhData, save: jest.fn().mockResolvedValue({ _id: 'new-id', ...pmhData }) };
      PastMedicalHistory.mockImplementation(() => mockInstance);

      const result = await PastMedicalHistoryService.createPastMedicalHistory(pmhData);

      expect(result).toBeDefined();
    });
  });

  describe('updatePastMedicalHistory', () => {
    it('should update medical history record', async () => {
      PastMedicalHistory.findByIdAndUpdate.mockResolvedValue({ _id: 'pmh-001' });

      const result = await PastMedicalHistoryService.updatePastMedicalHistory('pmh-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deletePastMedicalHistory', () => {
    it('should delete medical history record', async () => {
      PastMedicalHistory.findByIdAndDelete.mockResolvedValue({ _id: 'pmh-001' });

      const result = await PastMedicalHistoryService.deletePastMedicalHistory('pmh-001');

      expect(result).toBeDefined();
    });
  });
});
