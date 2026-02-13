import mongoose from 'mongoose';

const healthPatternSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },

    detectedCondition: {
      type: String,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true
    },
    basedOnFactors: {
      type: [String],
      default: []
    },

    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: String,
      enum: ['SYSTEM', 'STAFF'],
      default: 'SYSTEM'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
healthPatternSchema.index({ householdId: 1 });
healthPatternSchema.index({ riskLevel: 1 });
healthPatternSchema.index({ generatedAt: -1 });

const HealthPattern = mongoose.model('HealthPattern', healthPatternSchema);

export default HealthPattern;
