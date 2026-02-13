import mongoose from 'mongoose';

const healthDetailsSchema = new mongoose.Schema(
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

    heightCm: {
      type: Number,
      min: 0
    },
    weightKg: {
      type: Number,
      min: 0
    },
    bmi: {
      type: Number
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },

    recordedDate: {
      type: Date,
      default: Date.now
    },
    recordedByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Calculate BMI before saving
healthDetailsSchema.pre('save', function (next) {
  if (this.heightCm && this.weightKg) {
    const heightM = this.heightCm / 100;
    this.bmi = parseFloat((this.weightKg / (heightM * heightM)).toFixed(2));
  }
  next();
});

// Indexes
healthDetailsSchema.index({ patientProfileId: 1, recordedDate: -1 });
healthDetailsSchema.index({ visitId: 1 });

const HealthDetails = mongoose.model('HealthDetails', healthDetailsSchema);

export default HealthDetails;
