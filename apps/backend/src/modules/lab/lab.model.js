import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    openTime: {
      type: String,
      required: true
    },
    closeTime: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const labSchema = new mongoose.Schema(
  {
    // BASIC INFORMATION
    name: {
      type: String,
      required: true,
      trim: true
    },
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: {
      type: String
    },
    district: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },

    // CONTACT
    phoneNumber: {
      type: String,
      required: true
    },
    email: {
      type: String
    },

    // OPERATING HOURS
    operatingHours: [operatingHoursSchema],

    // STATUS CONTROL
    operationalStatus: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'HOLIDAY', 'MAINTENANCE'],
      default: 'OPEN'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
labSchema.index({ district: 1 });
labSchema.index({ province: 1 });
labSchema.index({ isActive: 1, operationalStatus: 1 });

const Lab = mongoose.model('Lab', labSchema);

export default Lab;
