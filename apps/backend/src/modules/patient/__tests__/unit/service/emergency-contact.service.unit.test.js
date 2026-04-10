/**
 * Emergency Contact Module - Service Unit Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../models/EmergencyContact.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this.populate = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  })
}));

jest.unstable_mockModule('../../../models/Member.js', () => ({
  default: Object.assign(jest.fn(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }), {
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null)
  })
}));

const { default: EmergencyContactService } = await import('../../../services/emergencyContactService.js');
const { default: EmergencyContact } = await import('../../../models/EmergencyContact.js');

describe('EmergencyContactService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EmergencyContact.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    EmergencyContact.countDocuments.mockResolvedValue(0);
    EmergencyContact.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });
    EmergencyContact.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });
    EmergencyContact.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('getAllEmergencyContacts', () => {
    it('should retrieve all contacts', async () => {
      const memberId = 'mem-001';
      const mockContacts = [{ _id: '1', member_id: memberId }];

      EmergencyContact.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockContacts)
      });
      EmergencyContact.countDocuments.mockResolvedValue(1);

      const result = await EmergencyContactService.getAllEmergencyContacts({ member_id: memberId });

      expect(result).toBeDefined();
      expect(result.emergencyContacts).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getEmergencyContactById', () => {
    it('should retrieve single contact', async () => {
      EmergencyContact.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'contact-001' })
      });

      const result = await EmergencyContactService.getEmergencyContactById('contact-001');

      expect(result).toBeDefined();
    });
  });

  describe('createEmergencyContact', () => {
    it('should create new contact', async () => {
      const contactData = {
        member_id: 'mem-001',
        full_name: 'John Doe',
        relationship: 'Spouse',
        primary_phone: '0771234567',
        contact_priority: 1,
        address: '123 Main St',
        gn_division: 'Padukka'
      };

      const mockInstance = {
        ...contactData,
        save: jest.fn().mockResolvedValue({ _id: 'new-id', ...contactData }),
        populate: jest.fn().mockResolvedValue({ _id: 'new-id', ...contactData })
      };
      EmergencyContact.mockImplementation(() => mockInstance);

      const result = await EmergencyContactService.createEmergencyContact(contactData);

      expect(result).toBeDefined();
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update contact', async () => {
      EmergencyContact.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'contact-001' })
      });

      const result = await EmergencyContactService.updateEmergencyContact('contact-001', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete contact', async () => {
      EmergencyContact.findByIdAndDelete.mockResolvedValue({ _id: 'contact-001' });

      const result = await EmergencyContactService.deleteEmergencyContact('contact-001');

      expect(result).toBeDefined();
    });
  });
});
