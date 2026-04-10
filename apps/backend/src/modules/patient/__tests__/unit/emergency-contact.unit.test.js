/**
 * Run this test file with:
 * npm test -- src/modules/patient/__tests__/unit/emergency-contact.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the EmergencyContact model before importing dependent modules
const mockEmergencyContact = jest.fn(() => ({
  save: jest.fn().mockResolvedValue(null),
  populate: jest.fn().mockReturnThis()
}));

mockEmergencyContact.find = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
});

mockEmergencyContact.findById = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(null)
});

mockEmergencyContact.findByIdAndUpdate = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(null)
});

mockEmergencyContact.findByIdAndDelete = jest.fn();
mockEmergencyContact.countDocuments = jest.fn();

jest.unstable_mockModule('../../models/EmergencyContact.js', () => ({
  default: mockEmergencyContact
}));

// Import after mocking
const { default: emergencyContactService } = await import('../../services/emergencyContactService.js');
const { default: emergencyContactController } = await import('../../controllers/emergencyContactController.js');

describe('Emergency Contact Service Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllEmergencyContacts', () => {
    it('should return contacts with pagination', async () => {
      const mockContacts = [{ _id: '1', full_name: 'John' }];
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockContacts)
      };
      mockEmergencyContact.find.mockReturnValue(mockChain);
      mockEmergencyContact.countDocuments.mockResolvedValue(1);

      const result = await emergencyContactService.getAllEmergencyContacts({});
      expect(result.emergencyContacts).toEqual(mockContacts);
    });
  });

  describe('getEmergencyContactById', () => {
    it('should return contact by ID', async () => {
      const mockContact_data = { _id: '1', full_name: 'John' };
      mockEmergencyContact.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContact_data)
      });

      const result = await emergencyContactService.getEmergencyContactById('1');
      expect(result).toEqual(mockContact_data);
    });

    it('should throw error if not found', async () => {
      mockEmergencyContact.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await expect(emergencyContactService.getEmergencyContactById('invalid')).rejects.toThrow();
    });
  });

  describe('createEmergencyContact', () => {
    it('should create contact', async () => {
      const contactData = { full_name: 'John', relationship: 'Spouse' };
      const mockContact_data = { _id: '1', ...contactData };

      mockEmergencyContact.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockResolvedValue(mockContact_data)
      }));

      const result = await emergencyContactService.createEmergencyContact(contactData);
      expect(result).toEqual(mockContact_data);
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update contact', async () => {
      const mockContact_data = { _id: '1', full_name: 'Jane' };
      mockEmergencyContact.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContact_data)
      });

      const result = await emergencyContactService.updateEmergencyContact('1', { full_name: 'Jane' });
      expect(result).toEqual(mockContact_data);
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete contact', async () => {
      const mockContact_data = { _id: '1' };
      mockEmergencyContact.findByIdAndDelete.mockResolvedValue(mockContact_data);

      const result = await emergencyContactService.deleteEmergencyContact('1');
      expect(result).toEqual(mockContact_data);
    });
  });
});

describe('Emergency Contact Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getAllEmergencyContacts', () => {
    it('should return contacts with 200 status', async () => {
      jest.spyOn(emergencyContactService, 'getAllEmergencyContacts').mockResolvedValue({});
      await emergencyContactController.getAllEmergencyContacts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getEmergencyContactById', () => {
    it('should return contact by ID', async () => {
      req.params.id = '1';
      jest.spyOn(emergencyContactService, 'getEmergencyContactById').mockResolvedValue({});
      await emergencyContactController.getEmergencyContactById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createEmergencyContact', () => {
    it('should create contact with 201 status', async () => {
      jest.spyOn(emergencyContactService, 'createEmergencyContact').mockResolvedValue({});
      await emergencyContactController.createEmergencyContact(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(emergencyContactService, 'updateEmergencyContact').mockResolvedValue({});
      await emergencyContactController.updateEmergencyContact(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete with 200 status', async () => {
      req.params.id = '1';
      jest.spyOn(emergencyContactService, 'deleteEmergencyContact').mockResolvedValue({});
      await emergencyContactController.deleteEmergencyContact(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
