import mongoose from 'mongoose';

const healthOfficerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    contactNumber: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    assignedArea: {
      type: String
    },
    role: {
      type: String,
      enum: ['MOH', 'PHI', 'Nurse', 'Admin', 'Lab_Technician', 'Doctor','Staff'],
      required: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
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
healthOfficerSchema.index({ employeeId: 1 });
healthOfficerSchema.index({ username: 1 });
healthOfficerSchema.index({ email: 1 });
healthOfficerSchema.index({ role: 1 });
healthOfficerSchema.index({ assignedArea: 1 });

const HealthOfficer = mongoose.model('HealthOfficer', healthOfficerSchema);

export default HealthOfficer;
