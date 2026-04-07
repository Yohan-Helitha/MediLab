/**
 * Emergency Contact Module - Controller Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('../../../services/emergencyContactService.js', () => ({
  default: {
    getAllEmergencyContacts: jest.fn(),
    getEmergencyContactById: jest.fn(),
    createEmergencyContact: jest.fn(),
    updateEmergencyContact: jest.fn(),
    deleteEmergencyContact: jest.fn()
  }
}));

const { default: EmergencyContactController } = await import('../../../controllers/emergencyContactController.js');
const { default: emergencyContactService } = await import('../../../services/emergencyContactService.js');

describe('EmergencyContactController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'user-123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  describe('getAllEmergencyContacts', () => {
    it('should return all emergency contacts', async () => {
      req.query = { member_id: 'mem-001' };
      const mockContacts = [
        { _id: '1', contact_name: 'John Doe', relationship: 'Spouse' }
      ];

      emergencyContactService.getAllEmergencyContacts.mockResolvedValue({ contacts: mockContacts });

      await EmergencyContactController.getAllEmergencyContacts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getEmergencyContactById', () => {
    it('should return single contact', async () => {
      req.params.id = 'contact-001';

      emergencyContactService.getEmergencyContactById.mockResolvedValue({ _id: 'contact-001' });

      await EmergencyContactController.getEmergencyContactById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createEmergencyContact', () => {
    it('should create new contact', async () => {
      req.body = { member_id: 'mem-001', contact_name: 'John Doe' };

      emergencyContactService.createEmergencyContact.mockResolvedValue({ _id: 'new-id', ...req.body });

      await EmergencyContactController.createEmergencyContact(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update contact', async () => {
      req.params.id = 'contact-001';
      req.body = { contact_number: '0719876543' };

      emergencyContactService.updateEmergencyContact.mockResolvedValue({ _id: 'contact-001', ...req.body });

      await EmergencyContactController.updateEmergencyContact(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete contact', async () => {
      req.params.id = 'contact-001';

      emergencyContactService.deleteEmergencyContact.mockResolvedValue(true);

      await EmergencyContactController.deleteEmergencyContact(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
