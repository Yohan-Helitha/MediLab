import mongoose from 'mongoose';

const diagnosticTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedResultTimeHours: {
      type: Number,
      required: true,
      min: 0
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
diagnosticTestSchema.index({ category: 1 });
diagnosticTestSchema.index({ isActive: 1 });
diagnosticTestSchema.index({ name: 1 });

const DiagnosticTest = mongoose.model('DiagnosticTest', diagnosticTestSchema);

export default DiagnosticTest;
