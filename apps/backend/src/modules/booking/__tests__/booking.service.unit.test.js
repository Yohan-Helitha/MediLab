/**
 * Run this test file with:
 * npm test -- src/modules/booking/__tests__/booking.service.unit.test.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- Mocks (ESM) ---
const mockBookingModel = {
  create: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockMemberModel = {
  findById: jest.fn(),
};

const mockLabModel = {
  findById: jest.fn(),
};

const mockTestTypeModel = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../booking.model.js', () => ({
  default: mockBookingModel,
}));

jest.unstable_mockModule('../../patient/models/Member.js', () => ({
  default: mockMemberModel,
}));

jest.unstable_mockModule('../../lab/lab.model.js', () => ({
  default: mockLabModel,
}));

jest.unstable_mockModule('../../test/testType.model.js', () => ({
  default: mockTestTypeModel,
}));

const { createBooking, updateBooking } = await import('../booking.service.js');

function makeLeanQuery(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('Booking Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockMemberModel.findById.mockResolvedValue({
      _id: 'member-1',
      full_name: 'Test Patient',
      contact_number: '0712345678',
      hasAllergies: false,
      hasChronicConditions: false,
    });

    mockLabModel.findById.mockResolvedValue({
      _id: 'lab-1',
      name: 'Test Lab',
    });

    mockTestTypeModel.findById.mockResolvedValue({
      _id: 'test-1',
      name: 'Blood Test',
    });

    mockBookingModel.create.mockImplementation(async (doc) => ({
      _id: 'booking-1',
      ...doc,
    }));
  });

  describe('createBooking()', () => {
    it('assigns queueNumber for WALK_IN bookings (day-range safe)', async () => {
      // No previous queue numbers for that day
      mockBookingModel.findOne.mockReturnValue(makeLeanQuery(null));

      const payload = {
        patientProfileId: 'member-1',
        healthCenterId: 'lab-1',
        diagnosticTestId: 'test-1',
        bookingDate: '2026-04-08',
        timeSlot: '09:00 - 10:00',
        bookingType: 'WALK_IN',
        priorityLevel: 'NORMAL',
        paymentMethod: 'CASH',
      };

      const result = await createBooking(payload, 'user-1');

      expect(mockBookingModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          healthCenterId: payload.healthCenterId,
          isActive: true,
          status: expect.any(Object),
          bookingDate: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          }),
          queueNumber: { $ne: null },
        }),
      );

      expect(result.queueNumber).toBe(1);
      expect(mockBookingModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingType: 'WALK_IN',
          queueNumber: 1,
        }),
      );
    });

    it('does not assign queueNumber for PRE_BOOKED bookings at creation', async () => {
      const payload = {
        patientProfileId: 'member-1',
        healthCenterId: 'lab-1',
        diagnosticTestId: 'test-1',
        bookingDate: '2026-04-08',
        timeSlot: '09:00 - 10:00',
        bookingType: 'PRE_BOOKED',
        priorityLevel: 'NORMAL',
        paymentMethod: 'ONLINE',
      };

      const result = await createBooking(payload, 'user-1');

      expect(mockBookingModel.findOne).not.toHaveBeenCalled();
      expect(result.queueNumber).toBeNull();
    });
  });

  describe('updateBooking()', () => {
    it('assigns queueNumber when status becomes COMPLETED and queueNumber is missing', async () => {
      const bookingId = 'booking-123';
      const existing = {
        _id: bookingId,
        queueNumber: null,
        bookingDate: new Date('2026-04-08T10:30:00.000Z'),
        healthCenterId: 'lab-1',
        status: 'PENDING',
        bookingType: 'PRE_BOOKED',
      };

      // 1) existing booking lookup (select + lean)
      mockBookingModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(existing),
        })
        // 2) getNextQueueNumber() lookup (sort + select + lean)
        .mockReturnValueOnce(makeLeanQuery({ queueNumber: 2 }));

      mockBookingModel.findOneAndUpdate.mockResolvedValue({
        _id: bookingId,
        queueNumber: 3,
        status: 'COMPLETED',
      });

      const result = await updateBooking(bookingId, { status: 'COMPLETED' });

      expect(mockBookingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: bookingId, isActive: true },
        {
          $set: expect.objectContaining({
            status: 'COMPLETED',
            queueNumber: 3,
          }),
        },
        { new: true },
      );

      expect(result.queueNumber).toBe(3);
    });

    it('does not re-assign queueNumber if it already exists', async () => {
      const bookingId = 'booking-456';
      const existing = {
        _id: bookingId,
        queueNumber: 5,
        bookingDate: new Date('2026-04-08T10:30:00.000Z'),
        healthCenterId: 'lab-1',
        status: 'PENDING',
        bookingType: 'WALK_IN',
      };

      mockBookingModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(existing),
      });

      mockBookingModel.findOneAndUpdate.mockResolvedValue({
        _id: bookingId,
        queueNumber: 5,
        status: 'COMPLETED',
      });

      await updateBooking(bookingId, { status: 'COMPLETED' });

      // Only the existing fetch + the update should happen; no queue-number lookup query.
      expect(mockBookingModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockBookingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: bookingId, isActive: true },
        { $set: expect.not.objectContaining({ queueNumber: expect.any(Number) }) },
        { new: true },
      );
    });
  });
});
