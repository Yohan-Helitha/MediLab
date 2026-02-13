import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true
    },
    primaryPhoneNumber: {
      type: String,
      required: true
    },
    secondaryPhoneNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
emergencyContactSchema.index({ patientProfileId: 1 });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

export default EmergencyContact;
