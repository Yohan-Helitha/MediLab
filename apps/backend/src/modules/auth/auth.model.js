import mongoose from 'mongoose';

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'Lab_Technician', 'Staff', 'MOH', 'PHI', 'Nurse', 'Admin', 'Doctor'],
      required: true
    },
    systemId: {
      type: String,
      required: true,
      unique: true
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel'
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Member', 'HealthOfficer']
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

const Auth = mongoose.model('Auth', authSchema);

export default Auth;
