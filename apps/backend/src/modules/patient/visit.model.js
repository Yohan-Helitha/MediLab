import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household'
    },

    visitDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    visitType: {
      type: String,
      enum: ['OPD', 'MOBILE_CLINIC', 'HOME_VISIT'],
      required: true
    },

    reasonForVisit: {
      type: String,
      required: true
    },
    doctorNotes: {
      type: String
    },
    diagnosis: {
      type: String
    },

    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date
    },

    createdByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
visitSchema.index({ patientProfileId: 1, visitDate: -1 });
visitSchema.index({ householdId: 1 });
visitSchema.index({ visitDate: -1 });
visitSchema.index({ createdByStaffId: 1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
