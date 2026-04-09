// Booking service
import Booking from './booking.model.js';
import Member from '../patient/models/Member.js';
import Lab from '../lab/lab.model.js';
import TestType from '../test/testType.model.js';

const getDayRange = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid bookingDate');
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end, date };
};

const getNextQueueNumber = async ({ healthCenterId, bookingDate }) => {
    const { start, end } = getDayRange(bookingDate);
    const last = await Booking.findOne({
        healthCenterId,
        isActive: true,
        status: { $ne: 'CANCELLED' },
        bookingDate: { $gte: start, $lte: end },
        queueNumber: { $ne: null }
    })
        .sort({ queueNumber: -1 })
        .select('queueNumber')
        .lean();

    return (last?.queueNumber || 0) + 1;
};

export const createBooking = async (data, userId) => {

    const{

        patientProfileId,
        healthCenterId,
        diagnosticTestId,
        bookingDate,
        timeSlot,
        bookingType,
        priorityLevel,
        paymentMethod
    } = data;

    // Fetch patient (Member) by MongoDB _id
    const patient = await Member.findById(patientProfileId);
    if (!patient) {
        throw new Error('Patient not found');
    }

    // Fetch health center
    const healthCenter = await Lab.findById(healthCenterId);
    if (!healthCenter) {
        throw new Error('Health center not found');
    }

    // Fetch diagnostic test
    const diagnosticTest = await TestType.findById(diagnosticTestId);
    if (!diagnosticTest) {
        throw new Error('Diagnostic test not found');
    }

    let queueNumber = null;
    let estimatedWaitTimeMinutes = null;

    const { date: bookingDateObj } = getDayRange(bookingDate);

    if (bookingType === "WALK_IN") {
        queueNumber = await getNextQueueNumber({ healthCenterId, bookingDate: bookingDateObj });
    }

    const booking = await Booking.create({
        patientProfileId,
        // Member schema uses snake_case field names
        patientNameSnapshot: patient.full_name,
        patientPhoneSnapshot: patient.contact_number,
        
        healthCenterId,
        diagnosticTestId,
        testNameSnapshot: diagnosticTest.name,
        centerNameSnapshot: healthCenter.name,
        bookingDate: bookingDateObj,
        timeSlot,
        bookingType,
        priorityLevel,
        queueNumber,
        estimatedWaitTimeMinutes,

        allergyFlag: patient.hasAllergies || false,
        chronicConditionFlag: patient.hasChronicConditions || false,

        paymentMethod,
        createdBy: userId


    });

    return booking;

}

export const getBookings = async (filter = {}, pagination = {}) => {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = {};
    // Only active bookings by default
    if (typeof filter.isActive === 'boolean') {
        query.isActive = filter.isActive;
    } else {
        query.isActive = true;
    }

    if (filter.healthCenterId) {
        query.healthCenterId = filter.healthCenterId;
    }

    if (filter.bookingDate) {
        const date = new Date(filter.bookingDate);
        query.bookingDate = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lte: new Date(date.setHours(23, 59, 59, 999))
        };
    }

    if (filter.patientProfileId) {
        query.patientProfileId = filter.patientProfileId;
    }

    if (filter.bookingType) {
        query.bookingType = filter.bookingType;
    }

    if (filter.createdBy) {
        query.createdBy = filter.createdBy;
    }

    if (filter.status) {
        query.status = filter.status;
    }


    const bookings = await Booking.find(query).skip(skip).limit(limit)
        .sort({ bookingDate: -1 })
        // Populate Member document; Member also uses full_name/contact_number
        .populate('patientProfileId', 'full_name contact_number')
        .populate('healthCenterId', 'name')
        .populate('diagnosticTestId', 'name');

    const total = await Booking.countDocuments(query);

    return {
        bookings,
        total,
        page,
        limit
    };
}

export const updateBooking = async (bookingId, data) => {
    // Allow updating selected fields only
    const updatableFields = [
        'bookingDate',
        'timeSlot',
        'bookingType',
        'priorityLevel',
        'status',
        'paymentStatus',
        'paymentMethod'
    ];

    const updateData = {};
    updatableFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updateData[field] = data[field];
        }
    });

    if (updateData.bookingDate) {
        updateData.bookingDate = new Date(updateData.bookingDate);
    }

    // Load current booking so we can assign queue numbers reliably.
    const existing = await Booking.findOne({ _id: bookingId, isActive: true })
        .select('queueNumber bookingDate healthCenterId status bookingType')
        .lean();

    if (!existing) {
        return null;
    }

    const effectiveBookingDate = updateData.bookingDate || existing.bookingDate;
    const effectiveBookingType = Object.prototype.hasOwnProperty.call(updateData, 'bookingType')
        ? updateData.bookingType
        : existing.bookingType;

    const statusToSet = Object.prototype.hasOwnProperty.call(updateData, 'status')
        ? updateData.status
        : null;

    const shouldAssignQueue =
        existing.queueNumber == null &&
        (effectiveBookingType === 'WALK_IN' || statusToSet === 'COMPLETED');

    if (shouldAssignQueue) {
        updateData.queueNumber = await getNextQueueNumber({
            healthCenterId: existing.healthCenterId,
            bookingDate: effectiveBookingDate,
        });
    }

    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, isActive: true },
        { $set: updateData },
        { new: true }
    );

    return booking;
};

export const softDeleteBooking = async (bookingId) => {
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, isActive: true },
        { $set: { isActive: false } },
        { new: true }
    );

    return booking;
};

export const hardDeleteBooking = async (bookingId) => {
    const booking = await Booking.findByIdAndDelete(bookingId);
    return booking;
};