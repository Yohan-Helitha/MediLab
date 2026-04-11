/**
 * Run this test file with:
 * npm test -- src/modules/admin/__tests__/admin.service.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- Mocks (ESM) ---
const mockBookingModel = {
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const mockFinanceTransactionModel = {
  aggregate: jest.fn(),
  find: jest.fn(),
};

const mockInventoryStockModel = {
  aggregate: jest.fn(),
};

const mockEquipmentModel = {
  collection: { name: 'equipments' },
};

const mockAuthModel = {
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const mockMemberModel = {
  collection: { name: 'members' },
};

const mockHealthOfficerModel = {
  collection: { name: 'healthofficers' },
  find: jest.fn(),
};

jest.unstable_mockModule('../../booking/booking.model.js', () => ({
  default: mockBookingModel,
}));

jest.unstable_mockModule('../../finance/financeTransaction.model.js', () => ({
  default: mockFinanceTransactionModel,
}));

jest.unstable_mockModule('../../inventory/inventoryStock.model.js', () => ({
  default: mockInventoryStockModel,
}));

jest.unstable_mockModule('../../inventory/equipment.model.js', () => ({
  default: mockEquipmentModel,
}));

jest.unstable_mockModule('../../auth/auth.model.js', () => ({
  default: mockAuthModel,
}));

jest.unstable_mockModule('../../patient/models/Member.js', () => ({
  default: mockMemberModel,
}));

jest.unstable_mockModule('../../auth/healthOfficer.model.js', () => ({
  default: mockHealthOfficerModel,
}));

const { listHealthOfficers } = await import('../admin.service.js');

function makeExecQuery(result) {
  return {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

describe('Admin Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listHealthOfficers()', () => {
    it('returns all active officers when role is All', async () => {
      const docs = [{ _id: '1', fullName: 'A', role: 'Admin' }];
      mockHealthOfficerModel.find.mockReturnValue(makeExecQuery(docs));

      const result = await listHealthOfficers({ role: 'All' });

      expect(mockHealthOfficerModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(docs);
    });

    it('filters by role when role is provided', async () => {
      const docs = [{ _id: '2', fullName: 'B', role: 'MOH' }];
      mockHealthOfficerModel.find.mockReturnValue(makeExecQuery(docs));

      const result = await listHealthOfficers({ role: 'MOH' });

      expect(mockHealthOfficerModel.find).toHaveBeenCalledWith({ isActive: true, role: 'MOH' });
      expect(result).toEqual(docs);
    });
  });
});
