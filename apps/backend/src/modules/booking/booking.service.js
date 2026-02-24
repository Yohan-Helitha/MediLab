// Booking service
import Booking from './booking.model.js';
import PatientProfile from '../patient/patient.model.js';
import Lab from '../lab/lab.model.js';
import TestType from '../test/testType.model.js';
import { reserveEquipement } from '../inventory/inventory.service.js';

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

    // Fetch patient profile
    const patient = await PatientProfile.findById(patientProfileId);
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

    if (bookingType === "WALK_IN") {
        const count = await Booking.countDocuments({
            healthCenterId,
            bookingDate: new Date(bookingDate),
            status: { $ne: "CANCELLED" }
        });

        queueNumber = count + 1;
    }

    const booking = await Booking.create({
        patientProfileId,
        patientNameSnapshot: patient.fullName,
        patientPhoneSnapshot: patient.contactNumber,
        
        healthCenterId,
        diagnosticTestId,
        testNameSnapshot: diagnosticTest.name,
        centerNameSnapshot: healthCenter.name,
        bookingDate: new Date(bookingDate),
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

    // Reserve required equipment for this booking based on the test type
    await reserveEquipement(diagnosticTestId, healthCenterId, {
        bookingId: booking._id,
        createdBy: userId,
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
        .populate('patientProfileId', 'fullName contactNumber')
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