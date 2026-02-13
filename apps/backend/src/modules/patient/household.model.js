import mongoose from 'mongoose';

const chronicDiseasesSchema = new mongoose.Schema(
  {
    diabetes: {
      type: Boolean,
      default: false
    },
    hypertension: {
      type: Boolean,
      default: false
    },
    kidneyDisease: {
      type: Boolean,
      default: false
    },
    asthma: {
      type: Boolean,
      default: false
    },
    heartDisease: {
      type: Boolean,
      default: false
    },
    other: {
      type: String
    }
  },
  { _id: false }
);

const householdSchema = new mongoose.Schema(
  {
    householdCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    headMemberName: {
      type: String,
      required: true
    },

    primaryContactNumber: {
      type: String,
      required: true
    },
    secondaryContactNumber: {
      type: String
    },

    address: {
      type: String,
      required: true
    },
    villageName: {
      type: String
    },
    gnDivision: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },

    // ENVIRONMENTAL HEALTH FACTORS
    waterSource: {
      type: String,
      enum: ['PIPE', 'PROTECTED_WELL', 'RIVER', 'TUBE_WELL', 'OTHER']
    },
    wellWaterTested: {
      type: String,
      enum: ['YES', 'NO', 'NOT_SURE']
    },
    ckduExposureArea: {
      type: String,
      enum: ['YES', 'NO', 'NOT_SURE']
    },
    dengueRisk: {
      type: Boolean,
      default: false
    },
    sanitationType: {
      type: String
    },
    wasteDisposalMethod: {
      type: String
    },
    pesticideExposure: {
      type: Boolean,
      default: false
    },

    // FAMILY CHRONIC DISEASE HISTORY
    chronicDiseases: chronicDiseasesSchema,

    registeredByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
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
householdSchema.index({ householdCode: 1 });
householdSchema.index({ gnDivision: 1 });
householdSchema.index({ district: 1 });
householdSchema.index({ province: 1 });

const Household = mongoose.model('Household', householdSchema);

export default Household;
