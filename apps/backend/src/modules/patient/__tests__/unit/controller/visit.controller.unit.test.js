/**
 * Visit Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/visitService.js', () => ({
  default: {
    getAllVisits: jest.fn(),
    getVisitById: jest.fn(),
    createVisit: jest.fn(),
    updateVisit: jest.fn(),
    deleteVisit: jest.fn()
  }
}));

const { default: VisitController } = await import('../../../controllers/visitController.js');
const { default: visitService } = await import('../../../services/visitService.js');

describe('VisitController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllVisits', () => {
    it('should return all visits', async () => {
      req.query = { member_id: 'mem-001' };
      const mockVisits = [{ _id: '1', visit_type: 'consultation' }];

      visitService.getAllVisits.mockResolvedValue({ visits: mockVisits });

      await VisitController.getAllVisits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getVisitById', () => {
    it('should return single visit', async () => {
      req.params.id = 'vis-001';

      visitService.getVisitById.mockResolvedValue({ _id: 'vis-001' });

      await VisitController.getVisitById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createVisit', () => {
    it('should create new visit', async () => {
      req.body = { member_id: 'mem-001', visit_type: 'consultation', doctor_name: 'Dr. Smith' };

      visitService.createVisit.mockResolvedValue({ _id: 'new-id', ...req.body });

      await VisitController.createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateVisit', () => {
    it('should update visit', async () => {
      req.params.id = 'vis-001';
      req.body = { notes: 'Patient improving' };

      visitService.updateVisit.mockResolvedValue({ _id: 'vis-001', ...req.body });

      await VisitController.updateVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteVisit', () => {
    it('should delete visit', async () => {
      req.params.id = 'vis-001';

      visitService.deleteVisit.mockResolvedValue(true);

      await VisitController.deleteVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
