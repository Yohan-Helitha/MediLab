import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // PATIENT INFORMATION
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      // References Member (patient) documents by their MongoDB _id
      ref: 'Member',
      required: true
    },
    patientNameSnapshot: {
      type: String,
      required: true
    },
    patientPhoneSnapshot: {
      type: String,
      required: true
    },

    // TEST & CENTER INFORMATION
    healthCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true
    },
    diagnosticTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestType',
      required: true
    },
    testNameSnapshot: {
      type: String,
      required: true
    },
    centerNameSnapshot: {
      type: String,
      required: true
    },

    // DATE & TIME
    bookingDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String
    },

    // BOOKING TYPE
    bookingType: {
      type: String,
      enum: ['PRE_BOOKED', 'WALK_IN'],
      required: true
    },

    // QUEUE MANAGEMENT
    queueNumber: {
      type: Number
    },
    estimatedWaitTimeMinutes: {
      type: Number
    },

    // PRIORITY MANAGEMENT
    priorityLevel: {
      type: String,
      enum: ['NORMAL', 'ELDERLY', 'PREGNANT', 'URGENT'],
      default: 'NORMAL'
    },

    // STATUS TRACKING
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'PENDING'
    },

    // PAYMENT
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'WAIVED'],
      default: 'UNPAID'
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE', 'GOVERNMENT']
    },

    // SAFETY FLAGS
    allergyFlag: {
      type: Boolean,
      default: false
    },
    chronicConditionFlag: {
      type: Boolean,
      default: false
    },

    // AUDIT FIELDS
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    // SOFT DELETE
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
bookingSchema.index({ patientProfileId: 1, bookingDate: 1 });
bookingSchema.index({ healthCenterId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ queueNumber: 1, healthCenterId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
