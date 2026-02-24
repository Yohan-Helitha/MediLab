import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true
    },
    diagnosticTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestType',
      required: true
    },

    // LAB-SPECIFIC SETTINGS
    price: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedResultTimeHours: {
      type: Number,
      required: true,
      min: 0
    },

    // AVAILABILITY CONTROL
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_SUSPENDED'],
      default: 'AVAILABLE'
    },

    dailyCapacity: {
      type: Number,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
labTestSchema.index({ labId: 1, diagnosticTestId: 1 }, { unique: true });
labTestSchema.index({ labId: 1, availabilityStatus: 1 });
labTestSchema.index({ diagnosticTestId: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
