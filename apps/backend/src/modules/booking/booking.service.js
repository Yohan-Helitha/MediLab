// Booking service
import Booking from './booking.model';
import PatientProfile from '../patient/patient.model';
import Lab from '../lab/lab.model';
import TestType from '../testType/testType.model';

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
        patientPhoneSnapshot: patient.phoneNumber,
        
        healthCenterId,
        diagnosticTestId,
        testNameSnapshot: diagnosticTest.name,
        centerNameSnapshot: healthCenter.name,
        bookingDate,
        timeSlot,
        bookingType,
        priorityLevel,

        allergyFlag: patient.hasAllergies || false,
        chronicConditionFlag: patient.hasChronicConditions || false,

        paymentMethod,
        createdBy: userId


    });

    return booking;

}