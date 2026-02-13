import mongoose from 'mongoose';

const testRecommendationSchema = new mongoose.Schema(
  {
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit'
    },

    recommendedTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiagnosticTest'
      }
    ],
    reason: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING'
    },

    recommendedAt: {
      type: Date,
      default: Date.now
    },
    recommendedBy: {
      type: String,
      enum: ['SYSTEM', 'DOCTOR'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
testRecommendationSchema.index({ patientProfileId: 1 });
testRecommendationSchema.index({ visitId: 1 });
testRecommendationSchema.index({ status: 1 });

const TestRecommendation = mongoose.model('TestRecommendation', testRecommendationSchema);

export default TestRecommendation;
